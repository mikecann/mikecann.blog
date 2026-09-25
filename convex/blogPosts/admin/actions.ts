import { v } from "convex/values";
import type { EntryId } from "@convex-dev/rag";
import { internal } from "../../_generated/api";
import { rag, RAG_NAMESPACE, validateBlogPostAdminToken, vPostStatus } from "../lib";
import { convex } from "../../builder";
import { vPostEmailDecision, type PostEmailDecision } from "../../mailchimp/campaigns";
import type { Doc } from "../../_generated/dataModel";

export const upsert = convex
  .action()
  .input({
    token: v.string(),
    content: v.string(),
    slug: v.string(),
    title: v.string(),
    hash: v.string(),
    /** The post's frontmatter date, in ms since the epoch. */
    date: v.number(),
    /** The post's frontmatter status (absent means published). */
    status: v.optional(vPostStatus),
    /** Identifies one run of the upload script (for the per-run email cap). */
    uploadRunId: v.string(),
  })
  .returns(v.object({ slug: v.string(), created: v.boolean(), email: vPostEmailDecision }))
  .handler(
    async (
      ctx,
      { token, content, slug, title, hash, date, status, uploadRunId },
    ): Promise<{ slug: string; created: boolean; email: PostEmailDecision }> => {
      validateBlogPostAdminToken(token);

      // If the RAG entry already has this exact content and title (e.g. only the
      // blogPosts row was out of date), don't pay to embed it again.
      const existing: Doc<"blogPosts"> | null = await ctx.runQuery(
        internal.blogPosts.internal.queries.findBlogPostBySlug,
        {
          slug,
        },
      );
      const existingEntry = existing
        ? await rag.getEntry(ctx, { entryId: existing.ragEntryId as EntryId })
        : null;
      const isEntryCurrent =
        existingEntry?.status === "ready" &&
        existingEntry.contentHash === hash &&
        existingEntry.title === title;

      const ragEntryId: EntryId = isEntryCurrent
        ? existingEntry.entryId
        : (
            await rag.add(ctx, {
              title,
              key: slug,
              contentHash: hash,
              text: content,
              namespace: RAG_NAMESPACE,
            })
          ).entryId;

      const result: { created: boolean; email: PostEmailDecision } = await ctx.runMutation(
        internal.blogPosts.internal.mutations.upsertBlogPost,
        {
          slug,
          title,
          hash,
          ragEntryId,
          date,
          status,
          uploadRunId,
        },
      );

      return { slug, ...result };
    },
  )
  .public();
