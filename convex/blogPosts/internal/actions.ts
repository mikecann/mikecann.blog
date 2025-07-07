import { internalAction, ActionCtx } from "../../_generated/server";
import { v } from "convex/values";
import { rag, RAG_NAMESPACE } from "../lib";
import { BlogPostMatch } from "./queries";

export const ragSearchBlogPosts = internalAction({
  args: {
    query: v.string(),
  },
  handler: async (ctx: ActionCtx, args): Promise<BlogPostMatch[]> => {
    const ragResults = await rag.search(ctx, {
      namespace: RAG_NAMESPACE,
      query: args.query,
      vectorScoreThreshold: 0.3,
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
  },
});
