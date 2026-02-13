import { v } from "convex/values";
import { rag, RAG_NAMESPACE } from "../lib";
import { BlogPostMatch } from "./queries";
import { convex } from "../../builder";
import type { GenericActionCtx } from "convex/server";
import type { DataModel } from "../../_generated/dataModel";

export const ragSearchBlogPosts = convex
  .action()
  .input({
    query: v.string(),
  })
  .handler(async (ctx, args): Promise<BlogPostMatch[]> => {
    const ragResults = await rag.search(ctx as GenericActionCtx<DataModel>, {
      namespace: RAG_NAMESPACE,
      query: args.query,
      vectorScoreThreshold: 0.3,
      chunkContext: { before: 2, after: 1 },
      limit: 5,
    });

    const ragSlugs = ragResults.results.map((r) => ({
      slug: ragResults.entries.find((e) => e.entryId == r.entryId)?.key,
      score: r.score,
    }));

    return ragResults.entries.map((e) => ({
      blogPost: {
        slug: e.key ?? "",
        title: e.title ?? "",
        url: `https://www.mikecann.blog/posts/${e.key}`,
      },
      chunkContent: e.text,
      relevanceScore: ragSlugs.find((r) => r.slug == e.key)?.score ?? 0,
    }));
  })
  .internal();
