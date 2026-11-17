import { v } from "convex/values";
import { convex } from "../../builder";
import { postEmailCampaignDocSchema } from "../../schema";
import { listSlugsToCheck } from "../earlierEmail";

export const getPostEmailCampaign = convex
  .query()
  .input({
    campaignId: v.id("postEmailCampaigns"),
  })
  .returns(v.union(v.null(), postEmailCampaignDocSchema))
  .handler(async (ctx, { campaignId }) => {
    return await ctx.db.get("postEmailCampaigns", campaignId);
  })
  .internal();

/** The slugs the send action asks the live site about, for rename detection (earlierEmail.ts). */
export const listEarlierEmailSlugsToCheck = convex
  .query()
  .input({ campaignId: v.id("postEmailCampaigns") })
  .returns(v.array(v.object({ campaignId: v.id("postEmailCampaigns"), slug: v.string() })))
  .handler(async (ctx, { campaignId }) => {
    const campaign = await ctx.db.get("postEmailCampaigns", campaignId);
    const state = campaign?.state;
    if (!campaign || state?.kind !== "checkingLive") return [];
    if (state.allowEarlierEmail || state.mailchimpCampaignId) return [];
    return await listSlugsToCheck(ctx.db, campaign);
  })
  .internal();
