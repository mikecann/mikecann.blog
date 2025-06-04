import { v } from "convex/values";
import { adminQuery } from "./lib";

export const getBlogPostBySlug = adminQuery({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("blogPosts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
  },
});
