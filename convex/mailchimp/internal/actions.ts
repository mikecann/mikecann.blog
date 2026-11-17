import { v } from "convex/values";
import { convex } from "../../builder";
import { internal } from "../../_generated/api";
import type { Doc, Id } from "../../_generated/dataModel";
import type { ActionCtx } from "../../_generated/server";
import type { Infer } from "convex/values";
import { postEmail } from "../machine";
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
  isPostGoneFromSite,
} from "../lib";
import { notifyIndexNow } from "../../seo/indexNow";

/**
 * Mailchimp campaign statuses that mean the email has gone out or will without us: sent, being
 * sent, or scheduled (by hand in Mailchimp). Anything else ("save", "paused") hasn't sent.
 */
const MAILCHIMP_DELIVERED_STATUSES: ReadonlySet<string> = new Set(["sent", "sending", "schedule"]);

type ServerEvent = Infer<typeof postEmail.events.server>;

/** Reports a step to the machine; false if it was refused (the campaign moved on: stop). */
const report = async (ctx: ActionCtx, campaignId: Id<"postEmailCampaigns">, event: ServerEvent) =>
  await ctx.runMutation(internal.mailchimp.internal.mutations.report, { campaignId, event });

const getCampaign = (ctx: ActionCtx, campaignId: Id<"postEmailCampaigns">) =>
  ctx.runQuery(internal.mailchimp.internal.queries.getPostEmailCampaign, { campaignId });

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

/**
 * The send, started by the post email machine's SEND_DUE (checkingLive). Checks the post is live
 * and isn't a renamed post already emailed, then creates (or resumes), fills and sends its one
 * Mailchimp campaign, reporting each step. Jobs scheduled before the machine still arrive here
 * with the same args; for a campaign that isn't checkingLive they do nothing, as its timer sends.
 */
export const sendNewPostCampaign = convex
  .action()
  .input({
    campaignId: v.id("postEmailCampaigns"),
  })
  .returns(v.null())
  .handler(async (ctx, { campaignId }) => {
    const campaign: Doc<"postEmailCampaigns"> | null = await getCampaign(ctx, campaignId);

    if (!campaign) {
      console.warn(`Mailchimp post email campaign not found: ${campaignId}`);
      return null;
    }

    const state = campaign.state;
    if (state.kind !== "checkingLive") {
      console.log(`Post email for '${campaign.slug}' is '${state.kind}', nothing to do`);
      return null;
    }

    // Never email the real subscriber list from a dev deployment.
    const blockReason = getPostEmailDeploymentBlockReason() ?? getMailchimpApiKeyBlockReason();
    if (blockReason) {
      await report(ctx, campaignId, { type: "BLOCKED", reason: blockReason });
      console.error(`Not sending post email for '${campaign.slug}': ${blockReason}`);
      return null;
    }

    // Don't email a link that 404s: wait until the deploy is actually live
    // (unless an admin retry explicitly asked to skip this check).
    const live: PostLiveCheck = state.skipLiveCheck
      ? { ok: true }
      : await checkPostIsLive(campaign.slug);
    if (!live.ok) {
      await report(ctx, campaignId, { type: "NOT_LIVE", detail: live.detail });
      console.warn(`Post '${campaign.slug}' is not live yet (${live.detail})`);
      return null;
    }

    // An earlier email about what may be this same post, under a slug Convex still has: if the
    // live site no longer serves that slug, the post was renamed even though the deploy didn't
    // prune it. If the site can't say, check again later rather than risk a second email.
    const goneFromSite: Id<"postEmailCampaigns">[] = [];
    for (const earlier of await ctx.runQuery(
      internal.mailchimp.internal.queries.listEarlierEmailSlugsToCheck,
      { campaignId },
    )) {
      const gone = await isPostGoneFromSite(earlier.slug);
      if (gone === null) {
        const detail = `couldn't tell whether '${earlier.slug}' is still on the site`;
        await report(ctx, campaignId, { type: "NOT_LIVE", detail });
        console.warn(`Post email for '${campaign.slug}' waits: ${detail}`);
        return null;
      }
      if (gone) goneFromSite.push(earlier.campaignId);
    }

    const claim = await report(ctx, campaignId, { type: "LIVE", goneFromSite });
    if (claim.to !== "creatingCampaign") {
      console.log(`Post email for '${campaign.slug}' was not claimed (${claim.to}), nothing to do`);
      return null;
    }

    const { slug, title } = campaign;
    let mailchimpCampaignId = state.mailchimpCampaignId;

    // The post is live and this run announces it, so tell search engines too. A retry that resumes
    // an already created Mailchimp campaign skips this; pinging twice would be harmless anyway.
    if (!mailchimpCampaignId) await notifyIndexNow(getPostUrl(slug));

    console.log(`Creating Mailchimp campaign for new post: "${title}" (${slug})`);

    try {
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
        if (
          !(await report(ctx, campaignId, { type: "CAMPAIGN_CREATED", mailchimpCampaignId })).done
        )
          throw new Error("Campaign state changed while creating it; stopping");
        console.log(`Campaign created: ${mailchimpCampaignId}`);
      } else {
        // A retry of a campaign that already exists in Mailchimp. Its last run may have died after
        // Mailchimp accepted the send, so ask Mailchimp first: sending it again must never happen.
        const mailchimpStatus = await getMailchimpCampaignStatus(mailchimpCampaignId);
        if (MAILCHIMP_DELIVERED_STATUSES.has(mailchimpStatus)) {
          await report(ctx, campaignId, { type: "ALREADY_SENT" });
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

      if (!(await report(ctx, campaignId, { type: "CONTENT_SET", mailchimpCampaignId })).done)
        throw new Error("Campaign state changed while setting its content; stopping");

      console.log(`Campaign content set, sending...`);

      if (!(await report(ctx, campaignId, { type: "SENDING" })).done)
        throw new Error("Campaign state changed before sending; not sending");
    } catch (error) {
      // Nothing has been sent: the campaign fails, and a retry resumes it
      await report(ctx, campaignId, { type: "FAILED", error: errorMessage(error) });
      throw error;
    }

    try {
      await mailchimpFetch(`/campaigns/${mailchimpCampaignId}/actions/send`, {
        method: "POST",
      });
    } catch (error) {
      // A failed send call doesn't mean nothing went out (the response may have timed out after
      // Mailchimp accepted it), so the machine asks Mailchimp (checkPostEmailDelivery).
      await report(ctx, campaignId, { type: "SEND_UNCONFIRMED", error: errorMessage(error) });
      throw error;
    }

    await report(ctx, campaignId, { type: "SENT" });
    console.log(`Campaign sent successfully for post: "${title}"`);
    return null;
  })
  .internal();

/**
 * Asks Mailchimp whether a campaign whose send had no clear answer went out, for the post email
 * machine's checkingDelivery. If Mailchimp can't be asked, the state's timer gives up after an hour.
 */
export const checkPostEmailDelivery = convex
  .action()
  .input({ campaignId: v.id("postEmailCampaigns") })
  .returns(v.null())
  .handler(async (ctx, { campaignId }) => {
    const campaign = await getCampaign(ctx, campaignId);
    if (campaign?.state.kind !== "checkingDelivery") return null;
    const { mailchimpCampaignId } = campaign.state;

    let mailchimpStatus: string;
    try {
      mailchimpStatus = await getMailchimpCampaignStatus(mailchimpCampaignId);
    } catch (error) {
      console.error(
        `[post email] Couldn't ask Mailchimp about ${mailchimpCampaignId}: ${errorMessage(error)}`,
      );
      return null;
    }

    await report(
      ctx,
      campaignId,
      MAILCHIMP_DELIVERED_STATUSES.has(mailchimpStatus)
        ? { type: "DELIVERED" }
        : { type: "NOT_DELIVERED", error: `its status is '${mailchimpStatus}'` },
    );
    return null;
  })
  .internal();

const getMailchimpCampaignStatus = async (mailchimpCampaignId: string): Promise<string> =>
  String((await mailchimpFetch(`/campaigns/${mailchimpCampaignId}`))?.status ?? "");
