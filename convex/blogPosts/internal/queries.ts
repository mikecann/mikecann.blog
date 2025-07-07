import { v } from "convex/values";
import { internalQuery, query, QueryCtx } from "../../_generated/server";

export interface BlogPostMatch {
  blogPost: {
    title: string;
    slug: string;
    url: string;
  };
  chunkContent: string;
  relevanceScore: number;
}

export const findBlogPostBySlug = internalQuery({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("blogPosts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
  },
});
