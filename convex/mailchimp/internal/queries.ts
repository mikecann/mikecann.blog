import { v } from "convex/values";
import { convex } from "../../builder";

export const findLatestPostEmailCampaignBySlug = convex
  .query()
  .input({
    slug: v.string(),
  })
  .handler(async (ctx, { slug }) => {
    return await ctx.db
      .query("postEmailCampaigns")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .order("desc")
      .first();
  })
  .internal();
