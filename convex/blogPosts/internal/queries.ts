import { v } from "convex/values";
import { internalQuery, query } from "../../_generated/server";
import { ensureFP } from "../../../essentials/misc/ensure";

export const textSearchBlogPosts = internalQuery({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const chunks = await ctx.db
      .query("blogPostChunks")
      .withSearchIndex("search_content", (q) => q.search("content", args.query))
      .take(10);

    const matches = await Promise.all(
      chunks.map(async (chunk) => {
        const post = await ctx.db
          .get(chunk.postId)
          .then(ensureFP(`Blog post not found with id ${chunk.postId}`));

        return {
          blogPost: {
            title: post.title,
            slug: post.slug,
            url: `https://www.mikecann.blog/posts/${post.slug}`,
          },
          chunkContent: chunk.content,
        };
      }),
    );

    return matches;
  },
});
