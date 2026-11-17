import { v } from "convex/values";
import { convex } from "../../builder";
import type { Doc } from "../../_generated/dataModel";
import {
  MAX_POSTS_TO_PRUNE_WITHOUT_FORCE,
  rag,
  RAG_NAMESPACE,
  validateBlogPostAdminToken,
} from "../lib";
import { internal } from "../../_generated/api";

/**
 * Deletes the blogPosts rows (and their RAG entries) for posts that no longer
 * exist, e.g. deleted or renamed ones. `slugs` must be the full list of current
 * posts. Refuses to remove more than MAX_POSTS_TO_PRUNE_WITHOUT_FORCE posts
 * unless `force` is set, in case the list is wrong.
 */
export const pruneRemovedPosts = convex
  .mutation()
  .input({
    token: v.string(),
    slugs: v.array(v.string()),
    force: v.boolean(),
  })
  .returns(v.object({ staleSlugs: v.array(v.string()), removed: v.boolean() }))
  .handler(async (ctx, { token, slugs, force }) => {
    validateBlogPostAdminToken(token);

    const currentSlugs = new Set(slugs);
    const stalePosts: Doc<"blogPosts">[] = [];
    for await (const post of ctx.db.query("blogPosts"))
      if (!currentSlugs.has(post.slug)) stalePosts.push(post);

    const staleSlugs = stalePosts.map((post) => post.slug);
    if (stalePosts.length === 0) return { staleSlugs, removed: false };

    if (stalePosts.length > MAX_POSTS_TO_PRUNE_WITHOUT_FORCE && !force) {
      console.error(
        `Refusing to prune ${stalePosts.length} posts (more than ` +
          `${MAX_POSTS_TO_PRUNE_WITHOUT_FORCE}) without force: ${staleSlugs.join(", ")}`,
      );
      return { staleSlugs, removed: false };
    }

    const namespace = await rag.getNamespace(ctx, { namespace: RAG_NAMESPACE });

    for (const post of stalePosts) {
      // Removes every RAG version of the post, in the background.
      if (namespace)
        await rag.deleteByKeyAsync(ctx, { namespaceId: namespace.namespaceId, key: post.slug });
      await ctx.db.delete("blogPosts", post._id);

      // Don't email subscribers about a post that has just been removed.
      await ctx.runMutation(internal.mailchimp.internal.mutations.cancelForRemovedPost, {
        slug: post.slug,
      });
    }

    console.log(`Pruned ${stalePosts.length} removed posts: ${staleSlugs.join(", ")}`);
    return { staleSlugs, removed: true };
  })
  .public();
