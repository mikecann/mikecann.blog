import { v } from "convex/values";
import { internalMutation } from "../../_generated/server";

export const insertBlogPostChunk = internalMutation({
  args: {
    postId: v.id("blogPosts"),
    chunkIndex: v.number(),
    content: v.string(),
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, { postId, chunkIndex, content, embedding }) => {
    const id = await ctx.db.insert("blogPostChunks", {
      postId,
      chunkIndex,
      content,
      embedding,
    });
    return { id };
  },
});
