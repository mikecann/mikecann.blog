import { components } from "./_generated/api";
import { RAG } from "@convex-dev/rag";
import { openai } from "@ai-sdk/openai";
import { v } from "convex/values";
import { action, query } from "./_generated/server";

const rag = new RAG(components.rag, {
  filterNames: [],
  textEmbeddingModel: openai.embedding("text-embedding-3-small"),
  embeddingDimension: 1536,
});

const namespace = "blog_posts";

export const addBlogPostToRag = action({
  args: { text: v.string() },
  handler: async (ctx, { text }) => {
    await rag.add(ctx, {
      namespace,
      text,
    });
  },
});

export const clearAll = action({
  handler: async (ctx) => {
    const items = await rag.list(ctx, { paginationOpts: { cursor: null, numItems: 1000 } });
    await Promise.all(
      items.page.map((item) =>
        rag.delete(ctx, {
          entryId: item.entryId,
        }),
      ),
    );
  },
});

export const searchRag = action({
  args: { query: v.string(), vectorScoreThreshold: v.number() },
  handler: async (ctx, { query, vectorScoreThreshold }) => {
    const items = await rag.search(ctx, {
      namespace,
      vectorScoreThreshold,
      query,
    });


    console.log(items);
  },
});
