import { v } from "convex/values";
import { convex } from "../../builder";
import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import {
  POST_EMAIL_IN_PROGRESS_STUCK_AFTER_MS,
  POST_EMAIL_QUEUED_STUCK_AFTER_MS,
  POST_LIVE_CHECK_MAX_ATTEMPTS,
  POST_LIVE_CHECK_RETRY_DELAY_MS,
} from "../constants";
import {
  hasActiveSendJob,
  hasPendingSendJob,
  IN_PROGRESS_STATUSES,
  scheduleCampaignSend,
} from "../campaigns";

type CampaignStatus = Doc<"postEmailCampaigns">["status"];

/**
 * Claims a queued campaign for sending. Only succeeds from "queued", so two
 * concurrent send runs can never both proceed.
 */
export const beginPostEmailCampaign = convex
  .mutation()
  .input({
    campaignId: v.id("postEmailCampaigns"),
  })
  .returns(
    v.union(
      v.object({ kind: v.literal("missing") }),
      v.object({ kind: v.literal("not_queued"), status: v.string() }),
      v.object({
        kind: v.literal("claimed"),
        slug: v.string(),
        title: v.string(),
        mailchimpCampaignId: v.union(v.string(), v.null()),
      }),
    ),
  )
  .handler(async (ctx, { campaignId }) => {
    const campaign = await ctx.db.get("postEmailCampaigns", campaignId);
    if (!campaign) return { kind: "missing" as const };
    if (campaign.status !== "queued")
      return { kind: "not_queued" as const, status: campaign.status };

    await ctx.db.patch("postEmailCampaigns", campaignId, {
      status: "creating_campaign",
      attempts: campaign.attempts + 1,
      error: undefined,
      updatedAt: Date.now(),
    });

    return {
      kind: "claimed" as const,
      slug: campaign.slug,
      title: campaign.title,
      mailchimpCampaignId: campaign.mailchimpCampaignId ?? null,
    };
  })
  .internal();

/**
 * The post URL isn't returning 200 yet (the deploy may still be going out):
 * check again later, or give up after POST_LIVE_CHECK_MAX_ATTEMPTS.
 */
export const recordPostNotLiveYet = convex
  .mutation()
  .input({
    campaignId: v.id("postEmailCampaigns"),
    detail: v.string(),
  })
  .returns(v.union(v.literal("rescheduled"), v.literal("failed"), v.literal("ignored")))
  .handler(async (ctx, { campaignId, detail }) => {
    const campaign = await ctx.db.get("postEmailCampaigns", campaignId);
    if (!campaign || campaign.status !== "queued") return "ignored" as const;

    const now = Date.now();
    const liveCheckAttempts = (campaign.liveCheckAttempts ?? 0) + 1;

    if (liveCheckAttempts >= POST_LIVE_CHECK_MAX_ATTEMPTS) {
      await ctx.db.patch("postEmailCampaigns", campaignId, {
        status: "failed",
        liveCheckAttempts,
        error: `The post never went live: checked ${liveCheckAttempts} times, last result: ${detail}`,
        updatedAt: now,
      });
      return "failed" as const;
    }

    // Another send job is already waiting (e.g. after a retry): don't add a second one.
    const scheduledFunctionId = (await hasPendingSendJob(ctx, campaign))
      ? campaign.scheduledFunctionId
      : await scheduleCampaignSend(ctx, campaignId, POST_LIVE_CHECK_RETRY_DELAY_MS);

    await ctx.db.patch("postEmailCampaigns", campaignId, {
      liveCheckAttempts,
      scheduledFunctionId,
      updatedAt: now,
    });
    return "rescheduled" as const;
  })
  .internal();

/** Whether the campaign is currently in one of the given statuses. */
const isInStatus = async (
  ctx: MutationCtx,
  campaignId: Id<"postEmailCampaigns">,
  statuses: CampaignStatus[],
) => {
  const campaign = await ctx.db.get("postEmailCampaigns", campaignId);
  return !!campaign && statuses.includes(campaign.status);
};

export const markMailchimpCampaignCreated = convex
  .mutation()
  .input({
    campaignId: v.id("postEmailCampaigns"),
    mailchimpCampaignId: v.string(),
  })
  .returns(v.boolean())
  .handler(async (ctx, { campaignId, mailchimpCampaignId }) => {
    if (!(await isInStatus(ctx, campaignId, ["creating_campaign"]))) return false;
    await ctx.db.patch("postEmailCampaigns", campaignId, {
      mailchimpCampaignId,
      updatedAt: Date.now(),
    });
    return true;
  })
  .internal();

export const markContentSet = convex
  .mutation()
  .input({
    campaignId: v.id("postEmailCampaigns"),
  })
  .returns(v.boolean())
  .handler(async (ctx, { campaignId }) => {
    if (!(await isInStatus(ctx, campaignId, ["creating_campaign"]))) return false;
    await ctx.db.patch("postEmailCampaigns", campaignId, {
      status: "content_set",
      updatedAt: Date.now(),
    });
    return true;
  })
  .internal();

/** Last check before actually sending: only proceeds from "content_set". */
export const markSending = convex
  .mutation()
  .input({
    campaignId: v.id("postEmailCampaigns"),
  })
  .returns(v.boolean())
  .handler(async (ctx, { campaignId }) => {
    if (!(await isInStatus(ctx, campaignId, ["content_set"]))) return false;
    await ctx.db.patch("postEmailCampaigns", campaignId, {
      status: "sending",
      updatedAt: Date.now(),
    });
    return true;
  })
  .internal();

export const markSent = convex
  .mutation()
  .input({
    campaignId: v.id("postEmailCampaigns"),
  })
  .returns(v.null())
  .handler(async (ctx, { campaignId }) => {
    const campaign = await ctx.db.get("postEmailCampaigns", campaignId);
    if (!campaign || campaign.status === "sent") return null;
    const now = Date.now();
    await ctx.db.patch("postEmailCampaigns", campaignId, {
      status: "sent",
      error: undefined,
      sentAt: now,
      updatedAt: now,
    });
    return null;
  })
  .internal();

export const markFailed = convex
  .mutation()
  .input({
    campaignId: v.id("postEmailCampaigns"),
    error: v.string(),
  })
  .returns(v.null())
  .handler(async (ctx, { campaignId, error }) => {
    const campaign = await ctx.db.get("postEmailCampaigns", campaignId);
    if (!campaign || campaign.status === "sent") return null;
    await ctx.db.patch("postEmailCampaigns", campaignId, {
      status: "failed",
      error,
      updatedAt: Date.now(),
    });
    return null;
  })
  .internal();

/**
 * Cron: fails campaigns that got stuck, so they show up in the deploy-time
 * report and can be retried. An in-progress campaign whose send action died
 * (crash / timeout) would otherwise sit there forever.
 */
export const failStuckPostEmailCampaigns = convex
  .mutation()
  .input({})
  .returns(v.number())
  .handler(async (ctx) => {
    const now = Date.now();
    let failed = 0;

    const fail = async (campaign: Doc<"postEmailCampaigns">, error: string) => {
      await ctx.db.patch("postEmailCampaigns", campaign._id, {
        status: "failed",
        error,
        updatedAt: now,
      });
      console.error(`[post email] Marked '${campaign.slug}' as failed: ${error}`);
      failed++;
    };

    for (const status of IN_PROGRESS_STATUSES) {
      const cutoff = now - POST_EMAIL_IN_PROGRESS_STUCK_AFTER_MS;
      const stuck = await ctx.db
        .query("postEmailCampaigns")
        .withIndex("by_status_and_updatedAt", (q) => q.eq("status", status).lt("updatedAt", cutoff))
        .take(50);
      for (const campaign of stuck)
        await fail(
          campaign,
          `Stuck in '${status}' since ${new Date(campaign.updatedAt).toISOString()}; the send ` +
            `action probably crashed or timed out.` +
            (status === "sending"
              ? " The email MAY have gone out: check Mailchimp before retrying (use " +
                "markPostEmailCampaignSent if it did)."
              : " Safe to retry."),
        );
    }

    const queuedCutoff = now - POST_EMAIL_QUEUED_STUCK_AFTER_MS;
    const oldQueued = await ctx.db
      .query("postEmailCampaigns")
      .withIndex("by_status_and_updatedAt", (q) =>
        q.eq("status", "queued").lt("updatedAt", queuedCutoff),
      )
      .take(50);
    for (const campaign of oldQueued) {
      if (await hasActiveSendJob(ctx, campaign)) continue;
      await fail(
        campaign,
        `Queued since ${new Date(campaign.updatedAt).toISOString()} with no pending send job. Safe to retry.`,
      );
    }

    return failed;
  })
  .internal();
