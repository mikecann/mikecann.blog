import { v } from "convex/values";
import { convex } from "../../builder";
import { internal } from "../../_generated/api";
import {
  mailchimpFetch,
  generateNewPostEmailHtml,
  MAILCHIMP_LIST_ID,
  MAILCHIMP_FROM_NAME,
  MAILCHIMP_REPLY_TO,
} from "../lib";

export const sendNewPostCampaign = convex
  .action()
  .input({
    campaignId: v.id("postEmailCampaigns"),
  })
  .handler(async (ctx, { campaignId }) => {
    const campaign = await ctx.runMutation(
      internal.mailchimp.internal.mutations.beginPostEmailCampaign,
      {
        campaignId,
      },
    );

    if (campaign.kind === "missing") {
      console.warn(`Mailchimp post email campaign not found: ${campaignId}`);
      return;
    }

    if (campaign.kind === "already_sent") {
      console.log(`Mailchimp post email campaign already sent: ${campaignId}`);
      return;
    }

    const { slug, title } = campaign;
    console.log(`Creating Mailchimp campaign for new post: "${title}" (${slug})`);

    try {
      let mailchimpCampaignId = campaign.mailchimpCampaignId ?? undefined;

      if (!mailchimpCampaignId) {
        const mailchimpCampaign = await mailchimpFetch("/campaigns", {
          method: "POST",
          body: JSON.stringify({
            type: "regular",
            recipients: { list_id: MAILCHIMP_LIST_ID },
            settings: {
              subject_line: `New Blog Post: ${title}`,
              from_name: MAILCHIMP_FROM_NAME,
              reply_to: MAILCHIMP_REPLY_TO,
            },
          }),
        });

        const newMailchimpCampaignId = String(mailchimpCampaign.id);
        mailchimpCampaignId = newMailchimpCampaignId;
        await ctx.runMutation(internal.mailchimp.internal.mutations.markMailchimpCampaignCreated, {
          campaignId,
          mailchimpCampaignId: newMailchimpCampaignId,
        });
        console.log(`Campaign created: ${mailchimpCampaignId}`);
      } else {
        console.log(`Reusing Mailchimp campaign: ${mailchimpCampaignId}`);
      }

      if (!mailchimpCampaignId) {
        throw new Error("Mailchimp campaign id was not available after campaign creation");
      }

      await mailchimpFetch(`/campaigns/${mailchimpCampaignId}/content`, {
        method: "PUT",
        body: JSON.stringify({
          html: generateNewPostEmailHtml(title, slug),
        }),
      });

      await ctx.runMutation(internal.mailchimp.internal.mutations.markContentSet, {
        campaignId,
      });

      console.log(`Campaign content set, sending...`);

      await ctx.runMutation(internal.mailchimp.internal.mutations.markSending, {
        campaignId,
      });

      await mailchimpFetch(`/campaigns/${mailchimpCampaignId}/actions/send`, {
        method: "POST",
      });

      await ctx.runMutation(internal.mailchimp.internal.mutations.markSent, {
        campaignId,
      });

      console.log(`Campaign sent successfully for post: "${title}"`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await ctx.runMutation(internal.mailchimp.internal.mutations.markFailed, {
        campaignId,
        error: message,
      });
      throw error;
    }
  })
  .internal();
