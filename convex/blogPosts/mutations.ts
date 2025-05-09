import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { ensureFP } from "../../essentials/misc/ensure";

export const patchBlogPost = mutation({
  args: {
    postId: v.id("blogPosts"),
    title: v.optional(v.string()),
    hash: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
  },
  handler: async (ctx, { postId, ...patch }) => {
    await ctx.db.patch(postId, patch);
    return { postId };
  },
});

export const deleteChunksForPost = mutation({
  args: { postId: v.id("blogPosts") },
  handler: async (ctx, { postId }) => {
    const chunks = await ctx.db
      .query("blogPostChunks")
      .withIndex("by_postId", (q) => q.eq("postId", postId))
      .collect();

    for (const chunk of chunks) await ctx.db.delete(chunk._id);

    return { deleted: chunks.length };
  },
});

export const insertBlogPostChunk = mutation({
  args: {
    postId: v.id("blogPosts"),
    chunkIndex: v.number(),
    content: v.string(),
  },
  handler: async (ctx, { postId, chunkIndex, content }) => {
    const createdAt = Date.now();
    const id = await ctx.db.insert("blogPostChunks", {
      postId,
      chunkIndex,
      content,
      createdAt,
    });
    return { id };
  },
});

export const createBlogPost = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    hash: v.string(),
  },
  handler: async (ctx, { slug, title, hash }) => {
    const id = await ctx.db.insert("blogPosts", {
      slug,
      title,
      hash,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return await ctx.db.get(id).then(ensureFP("Blog post not found"));
  },
});
