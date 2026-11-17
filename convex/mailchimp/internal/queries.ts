import { v } from "convex/values";
import { convex } from "../../builder";
import { postEmailCampaignDocSchema } from "../../schema";
import { listEarlierEmailCandidates } from "../campaigns";

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

/**
 * The slugs of earlier emails that may be about this campaign's post (a rename), whose post is still
 * in Convex: the send action checks whether the live site still serves them.
 */
export const listEarlierEmailSlugsToCheck = convex
  .query()
  .input({ campaignId: v.id("postEmailCampaigns") })
  .returns(v.array(v.object({ campaignId: v.id("postEmailCampaigns"), slug: v.string() })))
  .handler(async (ctx, { campaignId }) => {
    const campaign = await ctx.db.get("postEmailCampaigns", campaignId);
    if (!campaign || campaign.allowEarlierEmail || campaign.mailchimpCampaignId) return [];
    const toCheck = [];
    for (const earlier of await listEarlierEmailCandidates(ctx, campaign))
      if (await ctx.db.get("blogPosts", earlier.postId))
        toCheck.push({ campaignId: earlier._id, slug: earlier.slug });
    return toCheck;
  })
  .internal();
