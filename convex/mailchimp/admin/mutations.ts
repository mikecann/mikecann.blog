import { v } from "convex/values";
import { convex } from "../../builder";
import { validateBlogPostAdminToken } from "../../blogPosts/lib";
import { cancelPendingSendJob, findLatestCampaignBySlug, scheduleCampaignSend } from "../campaigns";

// Run these by hand, e.g.
//   npx convex run --prod mailchimp/admin/mutations:retryFailedPostEmailCampaign \
//     '{"token":"<BLOG_POST_ADMIN_TOKEN>","slug":"<post-slug>"}'

/**
 * Re-queues a failed or skipped post email and sends it now, once the post URL
 * returns 200. Pass `skipLiveCheck: true` only if you've confirmed the post is
 * live but the automatic check keeps failing.
 */
export const retryFailedPostEmailCampaign = convex
  .mutation()
  .input({
    token: v.string(),
    slug: v.string(),
    skipLiveCheck: v.optional(v.boolean()),
  })
  .returns(v.object({ slug: v.string(), status: v.string(), scheduled: v.boolean() }))
  .handler(async (ctx, { token, slug, skipLiveCheck }) => {
    validateBlogPostAdminToken(token);

    const campaign = await findLatestCampaignBySlug(ctx, slug);
    if (!campaign) throw new Error(`No Mailchimp email campaign found for post '${slug}'`);

    if (campaign.status === "sent") return { slug, status: campaign.status, scheduled: false };

    if (campaign.status !== "failed" && campaign.status !== "skipped")
      throw new Error(
        `Mailchimp email campaign for '${slug}' is '${campaign.status}', not failed or skipped`,
      );

    await cancelPendingSendJob(ctx, campaign);
    const scheduledFunctionId = await scheduleCampaignSend(ctx, campaign._id, 0);
    await ctx.db.patch("postEmailCampaigns", campaign._id, {
      status: "queued",
      error: undefined,
      liveCheckAttempts: 0,
      skipLiveCheck: skipLiveCheck || undefined,
      scheduledFunctionId,
      updatedAt: Date.now(),
    });

    return { slug, status: "queued", scheduled: true };
  })
  .public();

/** Records that a campaign was sent (e.g. by hand from the Mailchimp dashboard). */
export const markPostEmailCampaignSent = convex
  .mutation()
  .input({
    token: v.string(),
    slug: v.string(),
    mailchimpCampaignId: v.string(),
  })
  .returns(
    v.object({ slug: v.string(), status: v.literal("sent"), mailchimpCampaignId: v.string() }),
  )
  .handler(async (ctx, { token, slug, mailchimpCampaignId }) => {
    validateBlogPostAdminToken(token);

    const campaign = await findLatestCampaignBySlug(ctx, slug);
    if (!campaign) throw new Error(`No Mailchimp email campaign found for post '${slug}'`);

    if (campaign.mailchimpCampaignId !== mailchimpCampaignId)
      throw new Error(
        `Mailchimp campaign id mismatch for '${slug}': expected '${mailchimpCampaignId}'`,
      );

    await cancelPendingSendJob(ctx, campaign);
    const now = Date.now();
    await ctx.db.patch("postEmailCampaigns", campaign._id, {
      status: "sent",
      error: undefined,
      sentAt: campaign.sentAt ?? now,
      updatedAt: now,
    });

    return { slug, status: "sent" as const, mailchimpCampaignId };
  })
  .public();
