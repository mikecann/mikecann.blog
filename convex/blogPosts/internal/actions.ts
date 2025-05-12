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
    // 1. Generate embedding for the query
    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: args.query,
    });

    // 2. Run text search (internal query)
    const textResults: BlogPostMatch[] = await ctx.runQuery(
      internal.blogPosts.internal.queries.textSearchBlogPosts,
      { query: args.query },
    );

    console.log("after text search", textResults);

    // 3. Run vector search
    const vectorResults: Array<{ _id: Id<"blogPostChunks">; _score: number }> =
      await ctx.vectorSearch("blogPostChunks", "by_embedding", {
        vector: embedding,
        limit: 10,
      });

    console.log("after vector search", vectorResults);

    // 4. Fetch blog post chunks for vector search results
    const vectorChunks: BlogPostMatch[] = await ctx.runQuery(
      internal.blogPosts.internal.queries.getBlogPostChunksByIds,
      { ids: vectorResults.map((r) => r._id) },
    );

    // 2.5. Title search: use an internal query to get all title-matching chunks
    const titleChunks: BlogPostMatch[] = await ctx.runQuery(
      internal.blogPosts.internal.queries.getBlogPostChunksByTitle,
      { query: args.query },
    );

    // 5. Build a map for fast lookup
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

    // 6. Reciprocal Rank Fusion (RRF)
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

    // 7. Build merged results in the same format as textResults
    const keyToItem = (itemList: BlogPostMatch[]): Map<string, BlogPostMatch> => {
      const map = new Map<string, BlogPostMatch>();
      itemList.forEach((item) => {
        map.set(item.blogPost.slug + "::" + item.chunkContent, item);
      });
      return map;
    };
    const textItemMap = keyToItem(textResults);
    const vectorItemMap = keyToItem(vectorChunks);
    const titleItemMap = keyToItem(titleChunks);
    const merged = scores.map(
      ({ key }) => titleItemMap.get(key) || textItemMap.get(key) || vectorItemMap.get(key),
    );

    return merged.filter(isNotNullOrUndefined);
  },
});
