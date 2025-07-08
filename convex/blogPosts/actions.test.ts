import { convexTest } from "convex-test";
import { expect, test, vi, describe, beforeEach, afterEach } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { EntryId } from "@convex-dev/rag";
import { v } from "convex/values";

// Mock the environment variable
const originalEnv = process.env;

// Mock the RAG add function
const mockRagAdd = vi.fn();

// Helper function to cast string to EntryId for testing
const mockEntryId = (id: string): EntryId => id as EntryId;

// Mock the dependencies
vi.mock("@convex-dev/rag", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    RAG: class {
      constructor() {}
      add = mockRagAdd;
    },
  };
});

vi.mock("@ai-sdk/openai", () => ({
  openai: {
    embedding: () => ({}),
  },
}));

vi.mock("../components", () => ({
  components: {
    rag: {},
  },
}));

describe("upsert action", () => {
  const mockToken = "test-admin-token";
  const mockContent = "This is test blog post content";
  const mockSlug = "test-blog-post";
  const mockTitle = "Test Blog Post";
  const mockHash = "test-content-hash";

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.BLOG_POST_ADMIN_TOKEN = mockToken;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test("creates new blog post when none exists", async () => {
    const t = convexTest(schema);

    const mockEntryIdValue = mockEntryId("new-rag-entry-id");
    mockRagAdd.mockResolvedValue({ entryId: mockEntryIdValue });

    // Execute the action
    await t.action(api.blogPosts.actions.upsert, {
      token: mockToken,
      content: mockContent,
      slug: mockSlug,
      title: mockTitle,
      hash: mockHash,
    });

    // Verify RAG add was called with correct parameters
    expect(mockRagAdd).toHaveBeenCalledWith(expect.anything(), {
      namespace: "blog_posts",
      text: mockContent,
      key: mockSlug,
      title: mockTitle,
      contentHash: mockHash,
    });

    // Verify the blog post was created in the database
    const blogPost = await t.run(async (ctx) => {
      return await ctx.db
        .query("blogPosts")
        .withIndex("by_slug", (q) => q.eq("slug", mockSlug))
        .first();
    });

    expect(blogPost).toBeDefined();
    expect(blogPost).toMatchObject({
      slug: mockSlug,
      title: mockTitle,
      hash: mockHash,
      ragEntryId: mockEntryIdValue,
    });
  });

  test("updates existing blog post when ragEntryId changes", async () => {
    const t = convexTest(schema);

    const oldRagEntryId = mockEntryId("old-rag-entry-id");
    const newRagEntryId = mockEntryId("new-rag-entry-id");

    // First, create an existing blog post
    await t.run(async (ctx) => {
      await ctx.db.insert("blogPosts", {
        slug: mockSlug,
        title: "Old Title",
        hash: "old-hash",
        ragEntryId: oldRagEntryId,
      });
    });

    mockRagAdd.mockResolvedValue({ entryId: newRagEntryId });

    // Execute the action
    await t.action(api.blogPosts.actions.upsert, {
      token: mockToken,
      content: mockContent,
      slug: mockSlug,
      title: mockTitle,
      hash: mockHash,
    });

    // Verify the blog post was updated
    const updatedPost = await t.run(async (ctx) => {
      return await ctx.db
        .query("blogPosts")
        .withIndex("by_slug", (q) => q.eq("slug", mockSlug))
        .first();
    });

    expect(updatedPost).toBeDefined();
    expect(updatedPost).toMatchObject({
      slug: mockSlug,
      title: "Old Title", // Title shouldn't change in update
      hash: "old-hash", // Hash shouldn't change in update
      ragEntryId: newRagEntryId, // This should be updated
    });
  });

  test("does not update existing blog post when ragEntryId is the same", async () => {
    const t = convexTest(schema);

    const sameRagEntryId = mockEntryId("same-rag-entry-id");

    // First, create an existing blog post
    const originalPost = await t.run(async (ctx) => {
      return await ctx.db.insert("blogPosts", {
        slug: mockSlug,
        title: "Original Title",
        hash: "original-hash",
        ragEntryId: sameRagEntryId,
      });
    });

    mockRagAdd.mockResolvedValue({ entryId: sameRagEntryId });

    // Execute the action
    await t.action(api.blogPosts.actions.upsert, {
      token: mockToken,
      content: mockContent,
      slug: mockSlug,
      title: mockTitle,
      hash: mockHash,
    });

    // Verify the blog post was not updated (same ragEntryId)
    const unchangedPost = await t.run(async (ctx) => {
      return await ctx.db
        .query("blogPosts")
        .withIndex("by_slug", (q) => q.eq("slug", mockSlug))
        .first();
    });

    expect(unchangedPost).toBeDefined();
    expect(unchangedPost).toMatchObject({
      _id: originalPost,
      slug: mockSlug,
      title: "Original Title", // Should remain unchanged
      hash: "original-hash", // Should remain unchanged
      ragEntryId: sameRagEntryId,
    });
  });

  test("handles multiple blog posts with different slugs", async () => {
    const t = convexTest(schema);

    // Create first blog post
    const firstEntryId = mockEntryId("first-entry-id");
    mockRagAdd.mockResolvedValue({ entryId: firstEntryId });

    await t.action(api.blogPosts.actions.upsert, {
      token: mockToken,
      content: "First post content",
      slug: "first-post",
      title: "First Post",
      hash: "first-hash",
    });

    // Create second blog post
    const secondEntryId = mockEntryId("second-entry-id");
    mockRagAdd.mockResolvedValue({ entryId: secondEntryId });

    await t.action(api.blogPosts.actions.upsert, {
      token: mockToken,
      content: "Second post content",
      slug: "second-post",
      title: "Second Post",
      hash: "second-hash",
    });

    // Verify both posts exist in database
    const allPosts = await t.run(async (ctx) => {
      return await ctx.db.query("blogPosts").collect();
    });

    expect(allPosts).toHaveLength(2);

    const firstPost = allPosts.find((p) => p.slug === "first-post");
    const secondPost = allPosts.find((p) => p.slug === "second-post");

    expect(firstPost).toMatchObject({
      slug: "first-post",
      title: "First Post",
      hash: "first-hash",
      ragEntryId: firstEntryId,
    });

    expect(secondPost).toMatchObject({
      slug: "second-post",
      title: "Second Post",
      hash: "second-hash",
      ragEntryId: secondEntryId,
    });
  });

  test("validates admin token", async () => {
    const t = convexTest(schema);

    process.env.BLOG_POST_ADMIN_TOKEN = "correct-token";

    await expect(async () => {
      await t.action(api.blogPosts.actions.upsert, {
        token: "invalid-token",
        content: mockContent,
        slug: mockSlug,
        title: mockTitle,
        hash: mockHash,
      });
    }).rejects.toThrow("Invalid token does not match env var BLOG_POST_ADMIN_TOKEN");
  });

  test("handles RAG service errors gracefully", async () => {
    const t = convexTest(schema);

    // Mock RAG to throw an error
    mockRagAdd.mockRejectedValue(new Error("RAG service unavailable"));

    await expect(async () => {
      await t.action(api.blogPosts.actions.upsert, {
        token: mockToken,
        content: mockContent,
        slug: mockSlug,
        title: mockTitle,
        hash: mockHash,
      });
    }).rejects.toThrow("RAG service unavailable");

    // Verify no blog post was created
    const posts = await t.run(async (ctx) => {
      return await ctx.db.query("blogPosts").collect();
    });

    expect(posts).toHaveLength(0);
  });

  test("handles special characters in content and title", async () => {
    const t = convexTest(schema);

    const specialContent = "Content with special chars: @#$%^&*(){}[]|\\:;\"'<>,.?/~`";
    const specialTitle = "Title with émojis 🚀 and ñ characters";
    const specialSlug = "special-chars-post";
    const entryId = mockEntryId("special-entry-id");

    mockRagAdd.mockResolvedValue({ entryId });

    await t.action(api.blogPosts.actions.upsert, {
      token: mockToken,
      content: specialContent,
      slug: specialSlug,
      title: specialTitle,
      hash: mockHash,
    });

    const post = await t.run(async (ctx) => {
      return await ctx.db
        .query("blogPosts")
        .withIndex("by_slug", (q) => q.eq("slug", specialSlug))
        .first();
    });

    expect(post).toMatchObject({
      slug: specialSlug,
      title: specialTitle,
      hash: mockHash,
      ragEntryId: entryId,
    });

    // Verify RAG was called with special characters
    expect(mockRagAdd).toHaveBeenCalledWith(expect.anything(), {
      namespace: "blog_posts",
      text: specialContent,
      key: specialSlug,
      title: specialTitle,
      contentHash: mockHash,
    });
  });

  test("handles large content", async () => {
    const t = convexTest(schema);

    const largeContent = "Lorem ipsum ".repeat(1000); // ~11KB content
    const entryId = mockEntryId("large-content-entry-id");

    mockRagAdd.mockResolvedValue({ entryId });

    await t.action(api.blogPosts.actions.upsert, {
      token: mockToken,
      content: largeContent,
      slug: "large-content-post",
      title: "Large Content Post",
      hash: "large-content-hash",
    });

    const post = await t.run(async (ctx) => {
      return await ctx.db
        .query("blogPosts")
        .withIndex("by_slug", (q) => q.eq("slug", "large-content-post"))
        .first();
    });

    expect(post).toBeDefined();
    expect(post?.ragEntryId).toBe(entryId);
  });

  test("end-to-end: create, update, and verify database state", async () => {
    const t = convexTest(schema);

    // Step 1: Create initial blog post
    const initialEntryId = mockEntryId("initial-entry-id");
    mockRagAdd.mockResolvedValue({ entryId: initialEntryId });

    await t.action(api.blogPosts.actions.upsert, {
      token: mockToken,
      content: "Initial content",
      slug: "e2e-test-post",
      title: "E2E Test Post",
      hash: "initial-hash",
    });

    // Verify initial creation
    let post = await t.run(async (ctx) => {
      return await ctx.db
        .query("blogPosts")
        .withIndex("by_slug", (q) => q.eq("slug", "e2e-test-post"))
        .first();
    });

    expect(post).toMatchObject({
      slug: "e2e-test-post",
      title: "E2E Test Post",
      hash: "initial-hash",
      ragEntryId: initialEntryId,
    });

    // Step 2: Update with new content (different ragEntryId)
    const updatedEntryId = mockEntryId("updated-entry-id");
    mockRagAdd.mockResolvedValue({ entryId: updatedEntryId });

    await t.action(api.blogPosts.actions.upsert, {
      token: mockToken,
      content: "Updated content",
      slug: "e2e-test-post",
      title: "Updated E2E Test Post",
      hash: "updated-hash",
    });

    // Verify update
    post = await t.run(async (ctx) => {
      return await ctx.db
        .query("blogPosts")
        .withIndex("by_slug", (q) => q.eq("slug", "e2e-test-post"))
        .first();
    });

    expect(post).toMatchObject({
      slug: "e2e-test-post",
      title: "E2E Test Post", // Title should remain from original
      hash: "initial-hash", // Hash should remain from original
      ragEntryId: updatedEntryId, // This should be updated
    });

    // Step 3: Verify only one post exists (no duplicates)
    const allPosts = await t.run(async (ctx) => {
      return await ctx.db.query("blogPosts").collect();
    });

    expect(allPosts).toHaveLength(1);
    expect(allPosts[0].slug).toBe("e2e-test-post");
  });
});
