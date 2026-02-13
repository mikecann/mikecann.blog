import { v } from "convex/values";
import { convex } from "../../builder";
import { ensureFP } from "../../../essentials/misc/ensure";
import { vEntryId } from "@convex-dev/rag";

export const createBlogPost = convex
  .mutation()
  .input({
    slug: v.string(),
    title: v.string(),
    hash: v.string(),
    ragEntryId: vEntryId,
  })
  .handler(async (ctx, { slug, title, hash, ragEntryId }) => {
    const id = await ctx.db.insert("blogPosts", {
      slug,
      title,
      hash,
      ragEntryId,
    });

    return await ctx.db.get(id).then(ensureFP("Blog post not found"));
  })
  .internal();

export const updateBlogPost = convex
  .mutation()
  .input({
    postId: v.id("blogPosts"),
    ragEntryId: vEntryId,
  })
  .handler(async (ctx, { postId, ragEntryId }) => {
    await ctx.db.patch(postId, { ragEntryId });
  })
  .internal();
