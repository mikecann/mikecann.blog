import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { adminAction, rag, RAG_NAMESPACE } from "../lib";

export const upsert = adminAction({
  args: {
    content: v.string(),
    slug: v.string(),
    title: v.string(),
    hash: v.string(),
  },
  handler: async (ctx, args) => {
    const { entryId } = await rag.add(ctx, {
      title: args.title,
      key: args.slug,
      contentHash: args.hash,
      text: args.content,
      namespace: RAG_NAMESPACE,
    });

    const post = await ctx.runQuery(internal.blogPosts.internal.queries.findBlogPostBySlug, {
      slug: args.slug,
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
      slug: args.slug,
      title: args.title,
      hash: args.hash,
      ragEntryId: entryId,
    });
  },
});
