import { action, internalAction } from "../_generated/server";
import { v } from "convex/values";
import { embed } from "ai";
import { openai } from "@ai-sdk/openai";
import { internal } from "../_generated/api";
import { validateBlogPostAdminToken, adminAction } from "./lib";

export const generateEmbeddingAndCreateChunk = adminAction({
  args: {
    postId: v.id("blogPosts"),
    chunkIndex: v.number(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // Generate embedding
    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: args.content,
    });

    // Update chunk with embedding
    await ctx.runMutation(internal.blogPosts.internal.mutations.insertBlogPostChunk, {
      postId: args.postId,
      chunkIndex: args.chunkIndex,
      content: args.content,
      embedding,
    });
  },
});
