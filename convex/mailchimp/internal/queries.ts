import { v } from "convex/values";
import { convex } from "../../builder";

export const getPostEmailCampaign = convex
  .query()
  .input({
    campaignId: v.id("postEmailCampaigns"),
  })
  .handler(async (ctx, { campaignId }) => {
    return await ctx.db.get("postEmailCampaigns", campaignId);
  })
  .internal();
