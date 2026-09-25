import { v } from "convex/values";
import { convex } from "../../builder";
import { postEmailCampaignDocSchema } from "../../schema";

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
