import { v } from "convex/values";
import { convex } from "../../builder";
import { vEntryId } from "@convex-dev/rag";
import { queueNewPostEmailIfEligible, vPostEmailDecision } from "../../mailchimp/campaigns";
import { vPostStatus } from "../lib";

/**
 * Creates or updates the blogPosts row for a slug (re-checking the slug inside
 * this transaction, so concurrent uploads can't create duplicates). A newly
 * created post may queue the "new post" email; updates never do.
 */
export const upsertBlogPost = convex
  .mutation()
  .input({
    slug: v.string(),
    title: v.string(),
    hash: v.string(),
    ragEntryId: vEntryId,
    date: v.number(),
    status: v.optional(vPostStatus),
    uploadRunId: v.string(),
  })
  .returns(v.object({ created: v.boolean(), email: vPostEmailDecision }))
  .handler(async (ctx, { slug, title, hash, ragEntryId, date, status, uploadRunId }) => {
    const existing = await ctx.db
      .query("blogPosts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (existing) {
      if (existing.title !== title || existing.hash !== hash || existing.ragEntryId !== ragEntryId)
        await ctx.db.patch("blogPosts", existing._id, { title, hash, ragEntryId });

      return {
        created: false,
        email: { kind: "none" as const, reason: "the post already existed" },
      };
    }

    const postId = await ctx.db.insert("blogPosts", { slug, title, hash, ragEntryId });

    const email = await queueNewPostEmailIfEligible(ctx, {
      postId,
      slug,
      title,
      date,
      status,
      uploadRunId,
      now: Date.now(),
    });

    return { created: true, email };
  })
  .internal();
