import { v } from "convex/values";
import { convex } from "../../builder";
import { blogPostDocSchema } from "../../schema";

export const findBlogPostBySlug = convex
  .query()
  .input({ slug: v.string() })
  .returns(v.union(v.null(), blogPostDocSchema))
  .handler(async (ctx, { slug }) => {
    return await ctx.db
      .query("blogPosts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
  })
  .internal();
