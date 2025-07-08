import { convexTest } from "convex-test";
import { expect, test, vi, describe, beforeEach, afterEach } from "vitest";
import { api } from "../../_generated/api";
import schema from "../../schema";
import { EntryId } from "@convex-dev/rag";

// Mock the environment variable
const originalEnv = process.env;

// Mock the RAG getEntry function
const mockRagGetEntry = vi.fn();

// Helper function to cast string to EntryId for testing
const mockEntryId = (id: string): EntryId => id as EntryId;

// Mock the entire dependencies we need
vi.mock("@convex-dev/rag", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    RAG: class {
      constructor() {}
      getEntry = mockRagGetEntry;
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

describe("listPostsThatNeedProcessing", () => {
  const mockToken = "test-admin-token";

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.BLOG_POST_ADMIN_TOKEN = mockToken;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test("returns slugs for posts that don't exist in database", async () => {
    const t = convexTest(schema);

    const posts = [
      { slug: "non-existent-post-1", hash: "hash1" },
      { slug: "non-existent-post-2", hash: "hash2" },
    ];

    const result = await t.query(api.blogPosts.admin.queries.listPostsThatNeedProcessing, {
      token: mockToken,
      posts,
    });

    expect(result).toEqual(["non-existent-post-1", "non-existent-post-2"]);
  });

  test("returns slugs for posts that exist but have no ragEntryId", async () => {
    const t = convexTest(schema);

    // Insert a blog post with a placeholder ragEntryId to simulate legacy posts
    await t.run(async (ctx) => {
      await ctx.db.insert("blogPosts", {
        slug: "existing-post-no-rag",
        title: "Test Post",
        hash: "old-hash",
        ragEntryId: mockEntryId("placeholder-entry-id"),
      });
    });

    // Mock RAG to return null for this entry (simulating missing RAG entry)
    mockRagGetEntry.mockResolvedValue(null);

    const posts = [{ slug: "existing-post-no-rag", hash: "new-hash" }];

    const result = await t.query(api.blogPosts.admin.queries.listPostsThatNeedProcessing, {
      token: mockToken,
      posts,
    });

    expect(result).toEqual(["existing-post-no-rag"]);
  });

  test("returns slugs for posts where RAG entry doesn't exist", async () => {
    const t = convexTest(schema);

    // Insert a blog post with ragEntryId but mock RAG entry as non-existent
    await t.run(async (ctx) => {
      await ctx.db.insert("blogPosts", {
        slug: "post-with-missing-rag",
        title: "Test Post",
        hash: "hash123",
        ragEntryId: mockEntryId("non-existent-entry-id"),
      });
    });

    mockRagGetEntry.mockResolvedValue(null);

    const posts = [{ slug: "post-with-missing-rag", hash: "hash123" }];

    const result = await t.query(api.blogPosts.admin.queries.listPostsThatNeedProcessing, {
      token: mockToken,
      posts,
    });

    expect(result).toEqual(["post-with-missing-rag"]);
  });

  test("returns slugs for posts where content hash doesn't match", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      await ctx.db.insert("blogPosts", {
        slug: "post-with-outdated-hash",
        title: "Test Post",
        hash: "old-hash",
        ragEntryId: mockEntryId("valid-entry-id"),
      });
    });

    mockRagGetEntry.mockResolvedValue({
      entryId: "valid-entry-id",
      contentHash: "different-hash",
    });

    const posts = [{ slug: "post-with-outdated-hash", hash: "new-hash" }];

    const result = await t.query(api.blogPosts.admin.queries.listPostsThatNeedProcessing, {
      token: mockToken,
      posts,
    });

    expect(result).toEqual(["post-with-outdated-hash"]);
  });

  test("does not return slugs for posts that are up to date", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      await ctx.db.insert("blogPosts", {
        slug: "up-to-date-post",
        title: "Test Post",
        hash: "current-hash",
        ragEntryId: mockEntryId("valid-entry-id"),
      });
    });

    mockRagGetEntry.mockResolvedValue({
      entryId: "valid-entry-id",
      contentHash: "current-hash",
    });

    const posts = [{ slug: "up-to-date-post", hash: "current-hash" }];

    const result = await t.query(api.blogPosts.admin.queries.listPostsThatNeedProcessing, {
      token: mockToken,
      posts,
    });

    expect(result).toEqual([]);
  });

  test("handles empty posts array", async () => {
    const t = convexTest(schema);

    const result = await t.query(api.blogPosts.admin.queries.listPostsThatNeedProcessing, {
      token: mockToken,
      posts: [],
    });

    expect(result).toEqual([]);
  });

  test("handles mixed scenarios correctly", async () => {
    const t = convexTest(schema);

    // Set up various test cases
    await t.run(async (ctx) => {
      // Post that's up to date
      await ctx.db.insert("blogPosts", {
        slug: "up-to-date",
        title: "Up to Date Post",
        hash: "current-hash",
        ragEntryId: mockEntryId("valid-entry-1"),
      });

      // Post without ragEntryId (simulated with placeholder)
      await ctx.db.insert("blogPosts", {
        slug: "no-rag-id",
        title: "No RAG ID Post",
        hash: "some-hash",
        ragEntryId: mockEntryId("placeholder-no-rag-id"),
      });

      // Post with outdated hash
      await ctx.db.insert("blogPosts", {
        slug: "outdated-hash",
        title: "Outdated Post",
        hash: "old-hash",
        ragEntryId: mockEntryId("valid-entry-2"),
      });
    });

    // Mock RAG responses based on entry ID
    mockRagGetEntry.mockImplementation(async (ctx, { entryId }) => {
      if (entryId === "valid-entry-1") {
        return { entryId, contentHash: "current-hash" };
      }
      if (entryId === "valid-entry-2") {
        return { entryId, contentHash: "different-hash" };
      }
      return null;
    });

    const posts = [
      { slug: "up-to-date", hash: "current-hash" },
      { slug: "no-rag-id", hash: "some-hash" },
      { slug: "outdated-hash", hash: "new-hash" },
      { slug: "non-existent", hash: "any-hash" },
    ];

    const result = await t.query(api.blogPosts.admin.queries.listPostsThatNeedProcessing, {
      token: mockToken,
      posts,
    });

    expect(result).toEqual(["no-rag-id", "outdated-hash", "non-existent"]);
  });

  test("handles invalid token", async () => {
    const t = convexTest(schema);

    // Set invalid token in environment
    process.env.BLOG_POST_ADMIN_TOKEN = "correct-token";

    await expect(async () => {
      await t.query(api.blogPosts.admin.queries.listPostsThatNeedProcessing, {
        token: "invalid-token",
        posts: [],
      });
    }).rejects.toThrow("Invalid token does not match env var BLOG_POST_ADMIN_TOKEN");
  });

  test("processes multiple posts with same slug correctly", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      await ctx.db.insert("blogPosts", {
        slug: "duplicate-slug",
        title: "Test Post",
        hash: "existing-hash",
        ragEntryId: mockEntryId("valid-entry-id"),
      });
    });

    mockRagGetEntry.mockResolvedValue({
      entryId: "valid-entry-id",
      contentHash: "existing-hash",
    });

    const posts = [
      { slug: "duplicate-slug", hash: "existing-hash" }, // Should not need processing
      { slug: "duplicate-slug", hash: "new-hash" }, // Should need processing (different hash)
    ];

    const result = await t.query(api.blogPosts.admin.queries.listPostsThatNeedProcessing, {
      token: mockToken,
      posts,
    });

    // Should return the second occurrence since it has a different hash
    expect(result).toEqual(["duplicate-slug"]);
  });

  test("handles posts with special characters in slug", async () => {
    const t = convexTest(schema);

    const specialSlug = "post-with-special-chars-@#$%";
    const posts = [{ slug: specialSlug, hash: "hash123" }];

    const result = await t.query(api.blogPosts.admin.queries.listPostsThatNeedProcessing, {
      token: mockToken,
      posts,
    });

    expect(result).toEqual([specialSlug]);
  });

  test("handles posts with very long slugs", async () => {
    const t = convexTest(schema);

    const longSlug = "a".repeat(100);
    const posts = [{ slug: longSlug, hash: "hash123" }];

    const result = await t.query(api.blogPosts.admin.queries.listPostsThatNeedProcessing, {
      token: mockToken,
      posts,
    });

    expect(result).toEqual([longSlug]);
  });

  test("handles RAG getEntry errors gracefully", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      await ctx.db.insert("blogPosts", {
        slug: "error-test",
        title: "Test Post",
        hash: "hash123",
        ragEntryId: mockEntryId("error-entry-id"),
      });
    });

    // Mock RAG to throw an error
    mockRagGetEntry.mockRejectedValue(new Error("RAG service unavailable"));

    const posts = [{ slug: "error-test", hash: "hash123" }];

    // Should throw the error from RAG
    await expect(async () => {
      await t.query(api.blogPosts.admin.queries.listPostsThatNeedProcessing, {
        token: mockToken,
        posts,
      });
    }).rejects.toThrow("RAG service unavailable");
  });

  test("handles concurrent posts processing", async () => {
    const t = convexTest(schema);

    // Create multiple posts with different scenarios
    await t.run(async (ctx) => {
      await Promise.all([
        ctx.db.insert("blogPosts", {
          slug: "concurrent-1",
          title: "Concurrent Post 1",
          hash: "hash1",
          ragEntryId: mockEntryId("entry-1"),
        }),
        ctx.db.insert("blogPosts", {
          slug: "concurrent-2",
          title: "Concurrent Post 2",
          hash: "hash2",
          ragEntryId: mockEntryId("entry-2"),
        }),
        ctx.db.insert("blogPosts", {
          slug: "concurrent-3",
          title: "Concurrent Post 3",
          hash: "hash3",
          ragEntryId: mockEntryId("entry-3"),
        }),
      ]);
    });

    // Mock RAG responses
    mockRagGetEntry.mockImplementation(async (ctx, { entryId }) => {
      if (entryId === "entry-1") {
        return { entryId, contentHash: "hash1" }; // Up to date
      }
      if (entryId === "entry-3") {
        return { entryId, contentHash: "different-hash" }; // Outdated
      }
      return null;
    });

    const posts = [
      { slug: "concurrent-1", hash: "hash1" },
      { slug: "concurrent-2", hash: "hash2" },
      { slug: "concurrent-3", hash: "hash3" },
    ];

    const result = await t.query(api.blogPosts.admin.queries.listPostsThatNeedProcessing, {
      token: mockToken,
      posts,
    });

    expect(result.sort()).toEqual(["concurrent-2", "concurrent-3"]);
  });

  test("handles posts with empty or null values", async () => {
    const t = convexTest(schema);

    const posts = [
      { slug: "", hash: "hash1" },
      { slug: "valid-slug", hash: "" },
    ];

    const result = await t.query(api.blogPosts.admin.queries.listPostsThatNeedProcessing, {
      token: mockToken,
      posts,
    });

    expect(result).toEqual(["", "valid-slug"]);
  });

  test("handles large number of posts", async () => {
    const t = convexTest(schema);

    // Create 50 posts
    const posts = Array.from({ length: 50 }, (_, i) => ({
      slug: `post-${i}`,
      hash: `hash-${i}`,
    }));

    const result = await t.query(api.blogPosts.admin.queries.listPostsThatNeedProcessing, {
      token: mockToken,
      posts,
    });

    // All posts should need processing since none exist in the database
    expect(result).toHaveLength(50);
    expect(result).toEqual(posts.map((p) => p.slug));
  });
});
