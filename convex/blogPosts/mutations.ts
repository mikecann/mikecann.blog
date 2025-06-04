import { v } from "convex/values";
import { ensureFP } from "../../essentials/misc/ensure";
import { adminMutation, validateBlogPostAdminToken } from "./lib";

export const patchBlogPost = adminMutation({
  args: {
    token: v.string(),
    postId: v.id("blogPosts"),
    title: v.optional(v.string()),
    hash: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
  },
  handler: async (ctx, { postId, token, ...patch }) => {
    await ctx.db.patch(postId, patch);
    return { postId };
  },
});

export const deleteChunksForPost = adminMutation({
  args: {
    postId: v.id("blogPosts"),
  },
  handler: async (ctx, { postId }) => {
    const chunks = await ctx.db
      .query("blogPostChunks")
      .withIndex("by_postId", (q) => q.eq("postId", postId))
      .collect();

    for (const chunk of chunks) await ctx.db.delete(chunk._id);

    return { deleted: chunks.length };
  },
});

export const createBlogPost = adminMutation({
  args: {
    slug: v.string(),
    title: v.string(),
    hash: v.string(),
  },
  handler: async (ctx, { slug, title, hash, token }) => {
    const id = await ctx.db.insert("blogPosts", {
      slug,
      title,
      hash,
    });
    return await ctx.db.get(id).then(ensureFP("Blog post not found"));
  },
});
