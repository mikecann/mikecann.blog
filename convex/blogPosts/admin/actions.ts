import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { rag, RAG_NAMESPACE, validateBlogPostAdminToken } from "../lib";
import { convex } from "../../builder";

export const upsert = convex
  .action()
  .input({
    token: v.string(),
    content: v.string(),
    slug: v.string(),
    title: v.string(),
    hash: v.string(),
  })
  .handler(async (ctx, { token, content, slug, title, hash }) => {
    validateBlogPostAdminToken(token);

    const { entryId } = await rag.add(ctx, {
      title,
      key: slug,
      contentHash: hash,
      text: content,
      namespace: RAG_NAMESPACE,
    });

    const post = await ctx.runQuery(internal.blogPosts.internal.queries.findBlogPostBySlug, {
      slug,
    });

    if (post) {
      if (post.ragEntryId != entryId)
        await ctx.runMutation(internal.blogPosts.internal.mutations.updateBlogPost, {
          postId: post._id,
          ragEntryId: entryId,
        });

      return;
    }

    await ctx.runMutation(internal.blogPosts.internal.mutations.createBlogPost, {
      slug,
      title,
      hash,
      ragEntryId: entryId,
    });
  })
  .public();
