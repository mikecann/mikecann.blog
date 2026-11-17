import { v } from "convex/values";
import { convex } from "../../builder";
import { internal } from "../../_generated/api";
import type { Doc } from "../../_generated/dataModel";
import {
  mailchimpFetch,
  generateNewPostEmailHtml,
  checkPostIsLive,
  type PostLiveCheck,
  getMailchimpApiKeyBlockReason,
  getPostEmailDeploymentBlockReason,
  MAILCHIMP_LIST_ID,
  MAILCHIMP_FROM_NAME,
  MAILCHIMP_REPLY_TO,
  getPostUrl,
} from "../lib";
import { notifyIndexNow } from "../../seo/indexNow";

/**
 * Mailchimp campaign statuses that mean the email has gone out or will without us: sent, being
 * sent, or scheduled (by hand in Mailchimp). Anything else ("save", "paused") hasn't sent.
 */
const MAILCHIMP_DELIVERED_STATUSES: ReadonlySet<string> = new Set(["sent", "sending", "schedule"]);

export const sendNewPostCampaign = convex
  .action()
  .input({
    campaignId: v.id("postEmailCampaigns"),
  })
  .returns(v.null())
  .handler(async (ctx, { campaignId }) => {
    const campaign: Doc<"postEmailCampaigns"> | null = await ctx.runQuery(
      internal.mailchimp.internal.queries.getPostEmailCampaign,
      { campaignId },
    );

    if (!campaign) {
      console.warn(`Mailchimp post email campaign not found: ${campaignId}`);
      return null;
    }

    if (campaign.status !== "queued") {
      console.log(`Post email for '${campaign.slug}' is '${campaign.status}', nothing to do`);
      return null;
    }

    // Never email the real subscriber list from a dev deployment.
    const blockReason = getPostEmailDeploymentBlockReason() ?? getMailchimpApiKeyBlockReason();
    if (blockReason) {
      await ctx.runMutation(internal.mailchimp.internal.mutations.markFailed, {
        campaignId,
        error: `Not sent: ${blockReason}`,
      });
      console.error(`Not sending post email for '${campaign.slug}': ${blockReason}`);
      return null;
    }

    // Don't email a link that 404s: wait until the deploy is actually live
    // (unless an admin retry explicitly asked to skip this check).
    const live: PostLiveCheck = campaign.skipLiveCheck
      ? { ok: true }
      : await checkPostIsLive(campaign.slug);
    if (!live.ok) {
      const outcome = await ctx.runMutation(
        internal.mailchimp.internal.mutations.recordPostNotLiveYet,
        { campaignId, detail: live.detail },
      );
      console.warn(`Post '${campaign.slug}' is not live yet (${live.detail}): ${outcome}`);
      return null;
    }

    const claim = await ctx.runMutation(
      internal.mailchimp.internal.mutations.beginPostEmailCampaign,
      { campaignId },
    );

    if (claim.kind !== "claimed") {
      console.log(`Post email ${campaignId} was not claimed (${claim.kind}), nothing to do`);
      return null;
    }

    const { slug, title } = claim;

    // The post is live and this run announces it, so tell search engines too. A retry that resumes
    // an already created Mailchimp campaign skips this; pinging twice would be harmless anyway.
    if (!claim.mailchimpCampaignId) await notifyIndexNow(getPostUrl(slug));

    console.log(`Creating Mailchimp campaign for new post: "${title}" (${slug})`);

    try {
      let mailchimpCampaignId = claim.mailchimpCampaignId ?? undefined;

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

        mailchimpCampaignId = String(mailchimpCampaign.id);
        const recorded = await ctx.runMutation(
          internal.mailchimp.internal.mutations.markMailchimpCampaignCreated,
          { campaignId, mailchimpCampaignId },
        );
        if (!recorded) throw new Error("Campaign status changed while creating it; stopping");
        console.log(`Campaign created: ${mailchimpCampaignId}`);
      } else {
        // A retry of a campaign that already exists in Mailchimp. Its last run may have died after
        // Mailchimp accepted the send, so ask Mailchimp first: sending it again must never happen.
        const existing = await mailchimpFetch(`/campaigns/${mailchimpCampaignId}`);
        const mailchimpStatus = String(existing?.status ?? "");
        if (MAILCHIMP_DELIVERED_STATUSES.has(mailchimpStatus)) {
          await ctx.runMutation(internal.mailchimp.internal.mutations.markSent, { campaignId });
          console.log(
            `Mailchimp campaign ${mailchimpCampaignId} is already '${mailchimpStatus}'; recorded it as sent`,
          );
          return null;
        }
        console.log(`Reusing Mailchimp campaign: ${mailchimpCampaignId} (${mailchimpStatus})`);
      }

      await mailchimpFetch(`/campaigns/${mailchimpCampaignId}/content`, {
        method: "PUT",
        body: JSON.stringify({
          html: generateNewPostEmailHtml(title, slug),
        }),
      });

      if (
        !(await ctx.runMutation(internal.mailchimp.internal.mutations.markContentSet, {
          campaignId,
        }))
      )
        throw new Error("Campaign status changed while setting its content; stopping");

      console.log(`Campaign content set, sending...`);

      if (
        !(await ctx.runMutation(internal.mailchimp.internal.mutations.markSending, { campaignId }))
      )
        throw new Error("Campaign status changed before sending; not sending");

      await mailchimpFetch(`/campaigns/${mailchimpCampaignId}/actions/send`, {
        method: "POST",
      });

      await ctx.runMutation(internal.mailchimp.internal.mutations.markSent, {
        campaignId,
      });

      console.log(`Campaign sent successfully for post: "${title}"`);
      return null;
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
