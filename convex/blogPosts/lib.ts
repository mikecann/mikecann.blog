import { customAction, customMutation, customQuery } from "convex-helpers/server/customFunctions";
import { action, mutation, query } from "../_generated/server";
import { v } from "convex/values";
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

export const adminQuery = customQuery(query, {
  args: { token: v.string() },
  input: async (ctx, args) => {
    validateBlogPostAdminToken(args.token);
    return { ctx, args };
  },
});

export const adminMutation = customMutation(mutation, {
  args: { token: v.string() },
  input: async (ctx, args) => {
    validateBlogPostAdminToken(args.token);
    return { ctx, args };
  },
});

export const adminAction = customAction(action, {
  args: { token: v.string() },
  input: async (ctx, args) => {
    validateBlogPostAdminToken(args.token);
    return { ctx, args };
  },
});

// Function to clean up content before sending to OpenAI
export function preprocessContent(content: string): string {
  let cleanContent = content
    // Normalize line endings
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    // Remove excessive whitespace
    .replace(/\n{3,}/g, "\n\n")
    // Trim
    .trim();

  // OpenAI embedding models have token limits (8192 for text-embedding-3-small)
  // Rough estimate: 1 token ≈ 4 characters, so limit to ~30,000 characters to be safe
  const MAX_CHARS = 30000;
  if (cleanContent.length > MAX_CHARS) {
    console.warn(
      `Content too long (${cleanContent.length} chars), truncating to ${MAX_CHARS} chars`,
    );
    cleanContent = cleanContent.substring(0, MAX_CHARS) + "...";
  }

  return cleanContent;
}
