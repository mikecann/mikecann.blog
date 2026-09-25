import { v } from "convex/values";
import { convex } from "../../builder";

export const findBlogPostBySlug = convex
  .query()
  .input({ slug: v.string() })
  .handler(async (ctx, { slug }) => {
    return await ctx.db
      .query("blogPosts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
  })
  .internal();
