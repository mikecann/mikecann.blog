import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { convex } from "../../builder";
import { validateBlogPostAdminToken } from "../../blogPosts/lib";

// Run these by hand, e.g.
//   npx convex run --prod mailchimp/admin/mutations:retryFailedPostEmailCampaign \
//     '{"token":"<BLOG_POST_ADMIN_TOKEN>","slug":"<post-slug>"}'
//
// Each checks the admin token, then has internal/mutations.ts move the campaign, as only the
// state machines catalog's internalMutation may send the post email machine its server events.

/**
 * Re-queues a post email that didn't go out (failed, skipped, cancelled, or held back as a rename)
 * and sends it now, once the post URL returns 200. A retry resumes the campaign's Mailchimp
 * campaign if it has one, after asking Mailchimp whether it already went out, so it never sends
 * twice. Pass `skipLiveCheck: true` only if you've confirmed the post is live but the automatic
 * check keeps failing, and `allowEarlierEmail: true` only for a post that was held back as a rename
 * but really is a different post.
 */
export const retryFailedPostEmailCampaign = convex
  .mutation()
  .input({
    token: v.string(),
    slug: v.string(),
    skipLiveCheck: v.optional(v.boolean()),
    allowEarlierEmail: v.optional(v.boolean()),
  })
  .returns(v.object({ slug: v.string(), status: v.string(), scheduled: v.boolean() }))
  .handler(
    async (
      ctx,
      { token, slug, skipLiveCheck, allowEarlierEmail },
    ): Promise<{ slug: string; status: string; scheduled: boolean }> => {
      validateBlogPostAdminToken(token);
      return await ctx.runMutation(internal.mailchimp.internal.mutations.retry, {
        slug,
        skipLiveCheck: skipLiveCheck ?? false,
        allowEarlierEmail: allowEarlierEmail ?? false,
      });
    },
  )
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
    await ctx.runMutation(internal.mailchimp.internal.mutations.markSentByHand, {
      slug,
      mailchimpCampaignId,
    });
    return { slug, status: "sent" as const, mailchimpCampaignId };
  })
  .public();
