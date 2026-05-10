import { v } from "convex/values";
import { convex } from "../../builder";
import { internal } from "../../_generated/api";
import type { Doc } from "../../_generated/dataModel";
import { validateBlogPostAdminToken } from "../../blogPosts/lib";

export const retryFailedPostEmailCampaign = convex
  .action()
  .input({
    token: v.string(),
    slug: v.string(),
  })
  .handler(
    async (ctx, { token, slug }): Promise<{ slug: string; status: string; scheduled: boolean }> => {
      validateBlogPostAdminToken(token);

      const campaign: Doc<"postEmailCampaigns"> | null = await ctx.runQuery(
        internal.mailchimp.internal.queries.findLatestPostEmailCampaignBySlug,
        {
          slug,
        },
      );

      if (!campaign) {
        throw new Error(`No Mailchimp email campaign found for post '${slug}'`);
      }

      if (campaign.status === "sent") {
        return {
          slug,
          status: campaign.status,
          scheduled: false,
        };
      }

      if (campaign.status !== "failed") {
        throw new Error(
          `Mailchimp email campaign for '${slug}' is '${campaign.status}', not failed`,
        );
      }

      const scheduledFunctionId = await ctx.scheduler.runAfter(
        0,
        internal.mailchimp.internal.actions.sendNewPostCampaign,
        {
          campaignId: campaign._id,
        },
      );

      await ctx.runMutation(internal.mailchimp.internal.mutations.attachScheduledFunction, {
        campaignId: campaign._id,
        scheduledFunctionId,
      });

      return {
        slug,
        status: "queued",
        scheduled: true,
      };
    },
  )
  .public();
