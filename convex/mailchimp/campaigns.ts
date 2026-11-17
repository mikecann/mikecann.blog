import { v, type Infer } from "convex/values";
import type { Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { type InternalMachineCtx, postEmail, throwIfRefused } from "../machines";
import {
  NEW_POST_EMAIL_DELAY_MS,
  POST_EMAIL_MAX_CAMPAIGNS_PER_UPLOAD_RUN,
  POST_EMAIL_MAX_POST_AGE_MS,
} from "./constants";
import { legacyStatusOf } from "./campaignState";
import { getMailchimpApiKeyBlockReason, getPostEmailDeploymentBlockReason } from "./lib";

// Helpers for the post email machine (machine.ts), whose rules say how a campaign moves:
// queued -> checkingLive -> creatingCampaign -> contentSet -> sending -> sent, with failed,
// skipped, cancelled and alreadyEmailed off to the side.

/** What happened about the email when a blog post was upserted. */
export const vPostEmailDecision = v.union(
  v.object({ kind: v.literal("queued") }),
  // A campaign row was created but deliberately not sent; needs attention.
  v.object({ kind: v.literal("skipped"), reason: v.string() }),
  // No email, by design (existing / old / draft post, not production, ...).
  v.object({ kind: v.literal("none"), reason: v.string() }),
);
export type PostEmailDecision = Infer<typeof vPostEmailDecision>;

export const findLatestCampaignBySlug = (ctx: Pick<QueryCtx, "db">, slug: string) =>
  ctx.db
    .query("postEmailCampaigns")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .order("desc")
    .first();

/**
 * Until narrowing, `status` (and `updatedAt`) are written beside the machine's state after each
 * step, so code from before the switch still reads a row it understands.
 */
export async function recordStep(ctx: InternalMachineCtx, campaignId: Id<"postEmailCampaigns">) {
  const campaign = await ctx.db.get("postEmailCampaigns", campaignId);
  if (!campaign) return;
  await ctx.db.patch("postEmailCampaigns", campaignId, {
    status: legacyStatusOf(campaign.state.kind),
    updatedAt: Date.now(),
  });
}

/** Sends a server event, and keeps `status` in step if it was taken. */
export async function sendPostEmailEvent(
  ctx: InternalMachineCtx,
  campaignId: Id<"postEmailCampaigns">,
  event: PostEmailServerEvent,
) {
  const result = await postEmail.send(ctx, campaignId, event);
  if (result.status === "done") await recordStep(ctx, campaignId);
  return result;
}

export type PostEmailServerEvent = Infer<typeof postEmail.events.server>;

const none = (reason: string): PostEmailDecision => ({ kind: "none", reason });

/**
 * Called when a blog post is created. Queues the "new post" email only when it
 * is safe to: the post is a recent non-draft, it has never had a campaign, this
 * is the production deployment, and this upload run hasn't already queued a
 * suspicious number of emails.
 */
export async function queueNewPostEmailIfEligible(
  ctx: InternalMachineCtx,
  args: {
    postId: Id<"blogPosts">;
    slug: string;
    title: string;
    /** The post's frontmatter date, in ms since the epoch. */
    date: number;
    status?: "draft" | "published";
    uploadRunId: string;
    now: number;
  },
): Promise<PostEmailDecision> {
  const { postId, slug, title, date, status, uploadRunId, now } = args;

  if (status === "draft") return none("the post is a draft");

  if (!Number.isFinite(date) || date < now - POST_EMAIL_MAX_POST_AGE_MS)
    return none(
      `the post is dated ${Number.isFinite(date) ? new Date(date).toISOString() : "(invalid date)"}, ` +
        `more than ${POST_EMAIL_MAX_POST_AGE_MS / 86_400_000} days ago`,
    );

  const previous = await findLatestCampaignBySlug(ctx, slug);
  if (previous) return none(`an email campaign already exists for it (${previous.state.kind})`);

  const deploymentBlock = getPostEmailDeploymentBlockReason();
  if (deploymentBlock) return none(deploymentBlock);

  const campaignsThisRun = await ctx.db
    .query("postEmailCampaigns")
    .withIndex("by_uploadRunId", (q) => q.eq("uploadRunId", uploadRunId))
    .take(100);
  const queuedThisRun = campaignsThisRun.filter((c) => c.state.kind !== "skipped").length;

  const skipReason =
    queuedThisRun >= POST_EMAIL_MAX_CAMPAIGNS_PER_UPLOAD_RUN
      ? `this upload run already queued ${queuedThisRun} post emails (the cap is ` +
        `${POST_EMAIL_MAX_CAMPAIGNS_PER_UPLOAD_RUN}), which looks like a bulk import rather than new posts`
      : getMailchimpApiKeyBlockReason();

  const fields = {
    postId,
    slug,
    title,
    status: skipReason ? ("skipped" as const) : ("queued" as const),
    attempts: 0,
    createdAt: now,
    updatedAt: now,
    uploadRunId,
    postDate: date,
  };
  throwIfRefused(
    await postEmail.create(
      ctx,
      fields,
      skipReason
        ? { type: "SKIP", reason: `Not sent: ${skipReason}` }
        : { type: "QUEUE", sendAt: now + NEW_POST_EMAIL_DELAY_MS },
    ),
  );

  if (skipReason) {
    console.error(`[post email] NOT emailing subscribers about '${slug}': ${skipReason}`);
    return { kind: "skipped", reason: skipReason };
  }
  return { kind: "queued" };
}
