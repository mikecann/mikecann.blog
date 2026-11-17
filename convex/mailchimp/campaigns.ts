import { v, type Infer } from "convex/values";
import { internal } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import {
  NEW_POST_EMAIL_DELAY_MS,
  POST_EMAIL_MAX_CAMPAIGNS_PER_UPLOAD_RUN,
  POST_EMAIL_MAX_POST_AGE_MS,
} from "./constants";
import { getMailchimpApiKeyBlockReason, getPostEmailDeploymentBlockReason } from "./lib";

// Helpers for the postEmailCampaigns state machine:
//
//   queued -> creating_campaign -> content_set -> sending -> sent
//      \______________________________________________________-> failed
//   skipped (never attempted)
//
// Only a "queued" campaign can be claimed for sending, and only by one run
// (see beginPostEmailCampaign). failed / skipped go back to queued only via
// the admin retryFailedPostEmailCampaign mutation.

export const IN_PROGRESS_STATUSES = ["creating_campaign", "content_set", "sending"] as const;

/** What happened about the email when a blog post was upserted. */
export const vPostEmailDecision = v.union(
  v.object({ kind: v.literal("queued") }),
  // A campaign row was created but deliberately not sent; needs attention.
  v.object({ kind: v.literal("skipped"), reason: v.string() }),
  // No email, by design (existing / old / draft post, not production, ...).
  v.object({ kind: v.literal("none"), reason: v.string() }),
);
export type PostEmailDecision = Infer<typeof vPostEmailDecision>;

export const findLatestCampaignBySlug = (ctx: QueryCtx, slug: string) =>
  ctx.db
    .query("postEmailCampaigns")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .order("desc")
    .first();

export const scheduleCampaignSend = (
  ctx: MutationCtx,
  campaignId: Id<"postEmailCampaigns">,
  delayMs: number,
): Promise<Id<"_scheduled_functions">> =>
  ctx.scheduler.runAfter(delayMs, internal.mailchimp.internal.actions.sendNewPostCampaign, {
    campaignId,
  });

const getSendJobState = async (ctx: QueryCtx, campaign: Doc<"postEmailCampaigns">) => {
  if (!campaign.scheduledFunctionId) return null;
  const job = await ctx.db.system.get("_scheduled_functions", campaign.scheduledFunctionId);
  return job?.state.kind ?? null;
};

/** True if a send job for this campaign is scheduled but hasn't started yet. */
export const hasPendingSendJob = async (ctx: QueryCtx, campaign: Doc<"postEmailCampaigns">) =>
  (await getSendJobState(ctx, campaign)) === "pending";

/** True if a send job for this campaign is scheduled or running. */
export const hasActiveSendJob = async (ctx: QueryCtx, campaign: Doc<"postEmailCampaigns">) => {
  const state = await getSendJobState(ctx, campaign);
  return state === "pending" || state === "inProgress";
};

export const cancelPendingSendJob = async (
  ctx: MutationCtx,
  campaign: Doc<"postEmailCampaigns">,
) => {
  if (campaign.scheduledFunctionId && (await hasPendingSendJob(ctx, campaign)))
    await ctx.scheduler.cancel(campaign.scheduledFunctionId);
};

type CampaignStatus = Doc<"postEmailCampaigns">["status"];

/**
 * Whether subscribers may have had this campaign's email. Once a campaign is being created in
 * Mailchimp a send can follow, and a failed one that got as far as a Mailchimp campaign may have
 * failed after Mailchimp accepted the send (a timed-out response), including once a retry has
 * queued it again. Ones that never reached Mailchimp have sent nothing.
 */
const mayHaveEmailed = (campaign: Doc<"postEmailCampaigns">) =>
  (["creating_campaign", "content_set", "sending", "sent"] as CampaignStatus[]).includes(
    campaign.status,
  ) ||
  // A failed one, or one an admin retry has queued again, that got as far as a Mailchimp campaign
  campaign.mailchimpCampaignId !== undefined;

/** How far back an earlier email can be and still be the same post: a rename comes soon after. */
export const EARLIER_EMAIL_WINDOW_MS = 30 * 86_400_000;

/**
 * Earlier campaigns that may be about this same post under another slug: the same title or the same
 * frontmatter date, created in the 30 days before it, that have emailed subscribers or may have.
 *
 * Renaming a post's folder changes its slug, so the deploy creates a new post (and a new campaign)
 * and prunes the old one, and campaign rows are keyed by slug. What tells a rename from a second
 * post that shares a title or date is whether the earlier post is gone: see findEarlierEmailForSamePost.
 */
export async function listEarlierEmailCandidates(
  ctx: QueryCtx,
  campaign: Doc<"postEmailCampaigns">,
): Promise<Doc<"postEmailCampaigns">[]> {
  // Every index ends with _creationTime, so each lookup reads only the window, newest first.
  const after = campaign._creationTime - EARLIER_EMAIL_WINDOW_MS;
  const before = campaign._creationTime;
  const byTitle = await ctx.db
    .query("postEmailCampaigns")
    .withIndex("by_title", (q) =>
      q.eq("title", campaign.title).gt("_creationTime", after).lt("_creationTime", before),
    )
    .order("desc")
    .take(50);
  const postDate = campaign.postDate;
  const byDate =
    postDate === undefined
      ? []
      : await ctx.db
          .query("postEmailCampaigns")
          .withIndex("by_postDate", (q) =>
            q.eq("postDate", postDate).gt("_creationTime", after).lt("_creationTime", before),
          )
          .order("desc")
          .take(50);
  const matches = [...byTitle, ...byDate];
  const seen = new Set<string>();
  return matches.filter((earlier) => {
    if (seen.has(earlier._id)) return false;
    seen.add(earlier._id);
    return earlier.postId !== campaign.postId && mayHaveEmailed(earlier);
  });
}

/**
 * The email that already went out (or may have) about this same post under an earlier slug, if
 * there is one. A candidate (listEarlierEmailCandidates) counts when its post is gone: pruned from
 * Convex, or, in `goneFromSite`, no longer served by the live site. The send action checks the site
 * itself, because the deploy can serve the new slug without pruning the old one (the prune safety
 * limit refused it, or the upload failed between the two).
 */
export async function findEarlierEmailForSamePost(
  ctx: QueryCtx,
  campaign: Doc<"postEmailCampaigns">,
  goneFromSite: ReadonlySet<string>,
): Promise<Doc<"postEmailCampaigns"> | null> {
  for (const earlier of await listEarlierEmailCandidates(ctx, campaign)) {
    if (goneFromSite.has(earlier._id)) return earlier;
    if (!(await ctx.db.get("blogPosts", earlier.postId))) return earlier;
  }
  return null;
}

const none = (reason: string): PostEmailDecision => ({ kind: "none", reason });

/**
 * Called when a blog post is created. Queues the "new post" email only when it
 * is safe to: the post is a recent non-draft, it has never had a campaign, this
 * is the production deployment, and this upload run hasn't already queued a
 * suspicious number of emails.
 */
export async function queueNewPostEmailIfEligible(
  ctx: MutationCtx,
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
  if (previous) return none(`an email campaign already exists for it (${previous.status})`);

  const deploymentBlock = getPostEmailDeploymentBlockReason();
  if (deploymentBlock) return none(deploymentBlock);

  const campaignsThisRun = await ctx.db
    .query("postEmailCampaigns")
    .withIndex("by_uploadRunId", (q) => q.eq("uploadRunId", uploadRunId))
    .take(100);
  const queuedThisRun = campaignsThisRun.filter((c) => c.status !== "skipped").length;

  const skipReason =
    queuedThisRun >= POST_EMAIL_MAX_CAMPAIGNS_PER_UPLOAD_RUN
      ? `this upload run already queued ${queuedThisRun} post emails (the cap is ` +
        `${POST_EMAIL_MAX_CAMPAIGNS_PER_UPLOAD_RUN}), which looks like a bulk import rather than new posts`
      : getMailchimpApiKeyBlockReason();

  const campaignId = await ctx.db.insert("postEmailCampaigns", {
    postId,
    slug,
    title,
    status: skipReason ? "skipped" : "queued",
    attempts: 0,
    createdAt: now,
    updatedAt: now,
    uploadRunId,
    postDate: date,
    ...(skipReason ? { error: `Not sent: ${skipReason}` } : {}),
  });

  if (skipReason) {
    console.error(`[post email] NOT emailing subscribers about '${slug}': ${skipReason}`);
    return { kind: "skipped", reason: skipReason };
  }

  const scheduledFunctionId = await scheduleCampaignSend(ctx, campaignId, NEW_POST_EMAIL_DELAY_MS);
  await ctx.db.patch("postEmailCampaigns", campaignId, { scheduledFunctionId });
  return { kind: "queued" };
}
