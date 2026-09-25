import { components } from "../_generated/api";
import { RAG } from "@convex-dev/rag";
import { openai } from "@ai-sdk/openai";
import { v } from "convex/values";

export const rag = new RAG(components.rag, {
  filterNames: [],
  textEmbeddingModel: openai.embedding("text-embedding-3-small"),
  embeddingDimension: 1536,
});

export const RAG_NAMESPACE = "blog_posts";

/** A post's frontmatter `status` (absent means published). */
export const vPostStatus = v.union(v.literal("draft"), v.literal("published"));

/** Pruning more posts than this in one upload needs an explicit --force-prune. */
export const MAX_POSTS_TO_PRUNE_WITHOUT_FORCE = 10;

export const validateBlogPostAdminToken = (token: string) => {
  if (token != process.env.BLOG_POST_ADMIN_TOKEN)
    throw new Error("Invalid token does not match env var BLOG_POST_ADMIN_TOKEN");
};

export interface BlogPostMatch {
  blogPost: {
    title: string;
    slug: string;
    url: string;
  };
  chunkContent: string;
  relevanceScore: number;
}

/** Semantic search over the blog posts (used by Mikebot's searchBlogPosts tool). */
export const searchBlogPosts = async (
  ctx: Parameters<typeof rag.search>[0],
  query: string,
): Promise<BlogPostMatch[]> => {
  const ragResults = await rag.search(ctx, {
    namespace: RAG_NAMESPACE,
    query,
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
};
