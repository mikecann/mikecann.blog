import { components } from "../_generated/api";
import { RAG } from "@convex-dev/rag";
import { openai } from "@ai-sdk/openai";

export const rag = new RAG(components.rag, {
  filterNames: [],
  textEmbeddingModel: openai.embedding("text-embedding-3-small"),
  embeddingDimension: 1536,
});

export const RAG_NAMESPACE = "blog_posts";

export const validateBlogPostAdminToken = (token: string) => {
  if (token != process.env.BLOG_POST_ADMIN_TOKEN)
    throw new Error("Invalid token does not match env var BLOG_POST_ADMIN_TOKEN");
};
