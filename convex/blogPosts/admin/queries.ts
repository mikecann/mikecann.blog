import { v } from "convex/values";
import { rag, validateBlogPostAdminToken } from "../lib";
import { EntryId } from "../../../node_modules/@convex-dev/rag/src/client/index";
import { isNotNullOrUndefined } from "../../../essentials/misc/filter";
import { convex } from "../../builder";

export type SlugId = string;

export const listPostsThatNeedProcessing = convex
  .query()
  .input({
    token: v.string(),
    posts: v.array(
      v.object({
        slug: v.string(),
        hash: v.string(),
      }),
    ),
  })
  .handler(async (ctx, { token, posts }): Promise<SlugId[]> => {
    validateBlogPostAdminToken(token);

    const results = await Promise.all(
      posts.map(async ({ slug, hash }) => {
        const existing = await ctx.db
          .query("blogPosts")
          .withIndex("by_slug", (q) => q.eq("slug", slug))
          .first();

        if (!existing) return slug;

        const entry = await rag.getEntry(ctx, {
          entryId: existing.ragEntryId as EntryId,
        });

        if (!entry) return slug;

        if (entry.contentHash !== hash) return slug;

        return null;
      }),
    );

    const out = results.filter(isNotNullOrUndefined);
    return out;
  })
  .public();
