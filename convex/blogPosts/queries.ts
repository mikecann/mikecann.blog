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

export const checkBlogPostsNeedProcessing = adminQuery({
  args: {
    posts: v.array(
      v.object({
        slug: v.string(),
        hash: v.string(),
      }),
    ),
  },
  handler: async (ctx, { posts }) => {
    const results = await Promise.all(
      posts.map(async ({ slug, hash }) => {
        const existing = await ctx.db
          .query("blogPosts")
          .withIndex("by_slug", (q) => q.eq("slug", slug))
          .first();

        // Return slug if post doesn't exist or hash doesn't match
        if (!existing || existing.hash !== hash) {
          return { slug, needsProcessing: true, exists: !!existing };
        }

        return { slug, needsProcessing: false, exists: true };
      }),
    );

    return results;
  },
});
