import { internalAction, ActionCtx } from "../../_generated/server";
import { v } from "convex/values";
import { embed } from "ai";
import { openai } from "@ai-sdk/openai";
import { internal } from "../../_generated/api";
import { Id, Doc } from "../../_generated/dataModel";
import { BlogPostMatch } from "./queries";
import { isNotNullOrUndefined } from "../../../essentials/misc/filter";

export const textAndVectorSearchBlogPosts = internalAction({
  args: {
    query: v.string(),
  },
  handler: async (ctx: ActionCtx, args): Promise<BlogPostMatch[]> => {
    // Generate embedding for the query
    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: args.query,
    });

    // Run text and vector search in parallel
    const [textResults, vectorResults] = await Promise.all([
      ctx.runQuery(internal.blogPosts.internal.queries.textSearchBlogPosts, { query: args.query }),
      ctx.vectorSearch("blogPostChunks", "by_embedding", {
        vector: embedding,
        limit: 10,
      }),
    ]);

    // Fetch blog post chunks for vector search results
    const [vectorChunks, titleChunks] = await Promise.all([
      ctx.runQuery(internal.blogPosts.internal.queries.getBlogPostChunksByIds, {
        ids: vectorResults.map((r) => r._id),
      }),
      ctx.runQuery(internal.blogPosts.internal.queries.getBlogPostChunksByTitle, {
        query: args.query,
      }),
    ]);

    // Build lookup maps for RRF
    const textMap = new Map<string, number>();
    textResults.forEach((item: BlogPostMatch, i: number) => {
      textMap.set(item.blogPost.slug + "::" + item.chunkContent, i);
    });
    const vectorMap = new Map<string, number>();
    vectorChunks.forEach((item: BlogPostMatch, i: number) => {
      vectorMap.set(item.blogPost.slug + "::" + item.chunkContent, i);
    });
    const titleMap = new Map<string, number>();
    titleChunks.forEach((item: BlogPostMatch, i: number) => {
      titleMap.set(item.blogPost.slug + "::" + item.chunkContent, i);
    });

    // Reciprocal Rank Fusion (RRF)
    // RRF: score = 1 / (k + rank), k=60 is common
    // For title matches, add a large constant (e.g., 1000) to their score
    const k = 60;
    const TITLE_BONUS = 1000;
    const allKeys = new Set<string>([
      ...textResults.map((item) => item.blogPost.slug + "::" + item.chunkContent),
      ...vectorChunks.map((item) => item.blogPost.slug + "::" + item.chunkContent),
      ...titleChunks.map((item) => item.blogPost.slug + "::" + item.chunkContent),
    ]);
    const scores = Array.from(allKeys).map((key) => {
      const textRank = textMap.has(key) ? textMap.get(key)! + 1 : null;
      const vectorRank = vectorMap.has(key) ? vectorMap.get(key)! + 1 : null;
      const isTitle = titleMap.has(key);
      let score = 0;
      if (textRank !== null) score += 1 / (k + textRank);
      if (vectorRank !== null) score += 1 / (k + vectorRank);
      if (isTitle) score += TITLE_BONUS;
      return { key, score };
    });
    scores.sort((a, b) => b.score - a.score);

    // Build merged results in the same format as textResults
    const keyToItem = (itemList: BlogPostMatch[]) => {
      const map = new Map<string, BlogPostMatch>();
      itemList.forEach((item) => {
        map.set(item.blogPost.slug + "::" + item.chunkContent, item);
      });
      return map;
    };
    const textItemMap = keyToItem(textResults);
    const vectorItemMap = keyToItem(vectorChunks);
    const titleItemMap = keyToItem(titleChunks);
    const merged = scores.map(({ key, score }) => ({
      post: titleItemMap.get(key) || textItemMap.get(key) || vectorItemMap.get(key),
      score,
    }));

    const excludeScoreThreshold = 0.015;

    console.log(
      `For query "${args.query}"`,
      merged
        .map((o) => ({
          slug: o.post?.blogPost.slug,
          score: o.score,
          isExcluded: o.score < excludeScoreThreshold,
        }))
        .sort((a, b) => a.score - b.score),
    );

    // Lets not show results that are below a certain threshold
    return merged
      .map((o) => {
        if (o.score < excludeScoreThreshold) return null;
        return o.post;
      })
      .filter(isNotNullOrUndefined);
  },
});
