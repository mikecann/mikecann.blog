import { v } from "convex/values";
import { internal } from "../_generated/api";
import { adminAction, preprocessContent, rag, RAG_NAMESPACE } from "./lib";

export const upsert = adminAction({
  args: {
    content: v.string(),
    slug: v.string(),
    title: v.string(),
    hash: v.string(),
  },
  handler: async (ctx, args) => {
    // Preprocess content before sending to RAG
    const cleanContent = preprocessContent(args.content);

    const { entryId } = await rag.add(ctx, {
      namespace: RAG_NAMESPACE,
      text: cleanContent,
      key: args.slug,
      title: args.title,
      contentHash: args.hash,
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
