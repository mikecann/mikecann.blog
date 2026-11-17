import { v } from "convex/values";
import { validateBlogPostAdminToken } from "../lib";
import { convex } from "../../builder";
import type { Doc } from "../../_generated/dataModel";
import {
  POST_EMAIL_IN_PROGRESS_STUCK_AFTER_MS,
  POST_EMAIL_PROBLEM_REPORT_WINDOW_MS,
  POST_EMAIL_QUEUED_STUCK_AFTER_MS,
} from "../../mailchimp/constants";
import { findLatestCampaignBySlug } from "../../mailchimp/campaigns";

export type SlugId = string;

/** Returns the slugs whose content hash or title differ from what's stored. */
export const listPostsThatNeedProcessing = convex
  .query()
  .input({
    token: v.string(),
    posts: v.array(
      v.object({
        slug: v.string(),
        hash: v.string(),
        title: v.string(),
      }),
    ),
  })
  .returns(v.array(v.string()))
  .handler(async (ctx, { token, posts }): Promise<SlugId[]> => {
    validateBlogPostAdminToken(token);

    const results = await Promise.all(
      posts.map(async ({ slug, hash, title }) => {
        const existing = await ctx.db
          .query("blogPosts")
          .withIndex("by_slug", (q) => q.eq("slug", slug))
          .first();

        if (!existing || existing.hash !== hash || existing.title !== title) return slug;
        return null;
      }),
    );

    return results.filter((slug) => slug !== null);
  })
  .public();

/** Where a post email stands, as the upload script reports it. */
const vPostEmailSummary = v.object({
  /** The post email machine's state. */
  kind: v.string(),
  /** Why it didn't go out, for the states that say. */
  error: v.optional(v.string()),
  /** Waiting to send with its timer armed, or already sent: nothing more to do. */
  scheduledOrSent: v.boolean(),
  updatedAt: v.number(),
});

const summarize = (campaign: Doc<"postEmailCampaigns">) => {
  const { state } = campaign;
  const error =
    state.kind === "failed"
      ? state.error
      : state.kind === "skipped" || state.kind === "cancelled"
        ? state.reason
        : state.kind === "alreadyEmailed"
          ? `Not sent: subscribers were already emailed about this post as '${state.earlierSlug}', ` +
            `so it looks like a rename. If it really is a different post, retry with "allowEarlierEmail":true.`
          : undefined;
  return {
    kind: state.kind,
    error,
    scheduledOrSent:
      state.kind === "sent" || (state.kind === "queued" && campaign.stateTimers.length > 0),
    updatedAt: campaign.updatedAt,
  };
};

export const listPostEmailCampaigns = convex
  .query()
  .input({
    token: v.string(),
    slugs: v.array(v.string()),
  })
  .returns(v.array(v.object({ slug: v.string(), campaign: v.union(v.null(), vPostEmailSummary) })))
  .handler(async (ctx, { token, slugs }) => {
    validateBlogPostAdminToken(token);

    return await Promise.all(
      slugs.map(async (slug) => {
        const campaign = await findLatestCampaignBySlug(ctx, slug);
        return { slug, campaign: campaign ? summarize(campaign) : null };
      }),
    );
  })
  .public();

/** States where a campaign is mid-send, which its timers move on from within an hour or so. */
const IN_PROGRESS_KINDS = [
  "checkingLive",
  "creatingCampaign",
  "contentSet",
  "sending",
  "checkingDelivery",
] as const;

/**
 * Post emails that need a human: recently failed, skipped or held back as a rename, and ones that
 * look stuck (their timer should have moved them on). Printed by the upload script at deploy time.
 */
export const listPostEmailCampaignProblems = convex
  .query()
  .input({
    token: v.string(),
  })
  .returns(
    v.array(
      v.object({
        slug: v.string(),
        status: v.string(),
        error: v.optional(v.string()),
        updatedAt: v.number(),
      }),
    ),
  )
  .handler(async (ctx, { token }) => {
    validateBlogPostAdminToken(token);
    const now = Date.now();

    const byState = (
      kind: Doc<"postEmailCampaigns">["state"]["kind"],
      range: { after?: number; before?: number },
    ) =>
      ctx.db
        .query("postEmailCampaigns")
        .withIndex("by_state_and_updatedAt", (q) => {
          const inState = q.eq("state.kind", kind);
          if (range.after !== undefined) return inState.gte("updatedAt", range.after);
          if (range.before !== undefined) return inState.lt("updatedAt", range.before);
          return inState;
        })
        .order("desc")
        .take(20);

    const recent = { after: now - POST_EMAIL_PROBLEM_REPORT_WINDOW_MS };
    const groups = await Promise.all([
      byState("failed", recent),
      byState("skipped", recent),
      byState("alreadyEmailed", recent),
      // A stuck campaign's timer should fail it within the hour; still there a while later means
      // the timer itself failed (npx convex run --prod machines:failedTimers)
      ...IN_PROGRESS_KINDS.map((kind) =>
        byState(kind, { before: now - 2 * POST_EMAIL_IN_PROGRESS_STUCK_AFTER_MS }),
      ),
      byState("queued", { before: now - POST_EMAIL_QUEUED_STUCK_AFTER_MS }),
    ]);

    return groups
      .flat()
      .filter((c) => c.state.kind !== "queued" || c.stateTimers.length === 0)
      .map((c) => {
        const { kind, error } = summarize(c);
        return { slug: c.slug, status: kind, error, updatedAt: c.updatedAt };
      });
  })
  .public();
