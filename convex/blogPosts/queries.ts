import { v } from "convex/values";
import { query } from "../_generated/server";
import { validateBlogPostAdminToken } from "./lib";

export const getBlogPostBySlug = query({
  args: { slug: v.string(), token: v.string() },
  handler: async (ctx, { slug, token }) => {
    validateBlogPostAdminToken(token);
    return await ctx.db
      .query("blogPosts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
  },
});
