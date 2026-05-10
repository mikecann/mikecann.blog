import { v } from "convex/values";
import { convex } from "../../builder";

export const createQueuedPostEmailCampaign = convex
  .mutation()
  .input({
    postId: v.id("blogPosts"),
    slug: v.string(),
    title: v.string(),
  })
  .handler(async (ctx, { postId, slug, title }) => {
    const now = Date.now();
    return await ctx.db.insert("postEmailCampaigns", {
      postId,
      slug,
      title,
      status: "queued",
      attempts: 0,
      createdAt: now,
      updatedAt: now,
    });
  })
  .internal();

export const attachScheduledFunction = convex
  .mutation()
  .input({
    campaignId: v.id("postEmailCampaigns"),
    scheduledFunctionId: v.id("_scheduled_functions"),
  })
  .handler(async (ctx, { campaignId, scheduledFunctionId }) => {
    await ctx.db.patch(campaignId, {
      scheduledFunctionId,
      updatedAt: Date.now(),
    });
  })
  .internal();

export const beginPostEmailCampaign = convex
  .mutation()
  .input({
    campaignId: v.id("postEmailCampaigns"),
  })
  .handler(async (ctx, { campaignId }) => {
    const campaign = await ctx.db.get(campaignId);
    if (!campaign) return { kind: "missing" as const };
    if (campaign.status === "sent") return { kind: "already_sent" as const };

    await ctx.db.patch(campaignId, {
      status: "creating_campaign",
      attempts: campaign.attempts + 1,
      updatedAt: Date.now(),
    });

    return {
      kind: "ready" as const,
      slug: campaign.slug,
      title: campaign.title,
      mailchimpCampaignId: campaign.mailchimpCampaignId ?? null,
    };
  })
  .internal();

export const markMailchimpCampaignCreated = convex
  .mutation()
  .input({
    campaignId: v.id("postEmailCampaigns"),
    mailchimpCampaignId: v.string(),
  })
  .handler(async (ctx, { campaignId, mailchimpCampaignId }) => {
    await ctx.db.patch(campaignId, {
      mailchimpCampaignId,
      updatedAt: Date.now(),
    });
  })
  .internal();

export const markContentSet = convex
  .mutation()
  .input({
    campaignId: v.id("postEmailCampaigns"),
  })
  .handler(async (ctx, { campaignId }) => {
    await ctx.db.patch(campaignId, {
      status: "content_set",
      updatedAt: Date.now(),
    });
  })
  .internal();

export const markSending = convex
  .mutation()
  .input({
    campaignId: v.id("postEmailCampaigns"),
  })
  .handler(async (ctx, { campaignId }) => {
    await ctx.db.patch(campaignId, {
      status: "sending",
      updatedAt: Date.now(),
    });
  })
  .internal();

export const markSent = convex
  .mutation()
  .input({
    campaignId: v.id("postEmailCampaigns"),
  })
  .handler(async (ctx, { campaignId }) => {
    const now = Date.now();
    await ctx.db.patch(campaignId, {
      status: "sent",
      sentAt: now,
      updatedAt: now,
    });
  })
  .internal();

export const markFailed = convex
  .mutation()
  .input({
    campaignId: v.id("postEmailCampaigns"),
    error: v.string(),
  })
  .handler(async (ctx, { campaignId, error }) => {
    await ctx.db.patch(campaignId, {
      status: "failed",
      error,
      updatedAt: Date.now(),
    });
  })
  .internal();
