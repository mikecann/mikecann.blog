import { convexTest } from "convex-test";
import { test, expect, beforeEach } from "vitest";
import schema from "../../schema";
import { internal } from "../../_generated/api";

const posts = [
  {
    slug: "first-post",
    title: "Hello World",
    hash: "hash1",
    chunks: ["This is the first chunk of the first post.", "Second chunk for the first post."],
  },
  {
    slug: "second-post",
    title: "Convex Testing",
    hash: "hash2",
    chunks: ["Convex makes testing easy.", "Another chunk about testing."],
  },
  {
    slug: "third-post",
    title: "Unrelated Title",
    hash: "hash3",
    chunks: ["Nothing to see here."],
  },
];

let t: ReturnType<typeof convexTest>;

beforeEach(async () => {
  t = convexTest(schema);
  // Insert posts and chunks
  for (const post of posts) {
    const postId = await t.run(async (ctx) => {
      return await ctx.db.insert("blogPosts", {
        slug: post.slug,
        title: post.title,
        hash: post.hash,
      });
    });
    for (let i = 0; i < post.chunks.length; i++) {
      await t.run(async (ctx) => {
        await ctx.db.insert("blogPostChunks", {
          postId,
          chunkIndex: i,
          content: post.chunks[i],
          embedding: Array(1536).fill(0), // dummy embedding
        });
      });
    }
  }
});

test("getBlogPostChunksByTitle finds first chunk for title match", async () => {
  const results = await t.query(internal.blogPosts.internal.queries.getBlogPostChunksByTitle, {
    query: "Hello",
  });
  expect(results.length).toBe(1);
  expect(results[0].blogPost.title).toBe("Hello World");
  expect(results[0].chunkContent).toBe(posts[0].chunks[0]);
});

test("getBlogPostChunksByTitle matches partial word", async () => {
  const results = await t.query(internal.blogPosts.internal.queries.getBlogPostChunksByTitle, {
    query: "Hell",
  });
  expect(results.length).toBe(1);
  expect(results[0].blogPost.title).toBe("Hello World");
});

test("getBlogPostChunksByTitle returns no results for no match", async () => {
  const results = await t.query(internal.blogPosts.internal.queries.getBlogPostChunksByTitle, {
    query: "Nonexistent",
  });
  expect(results.length).toBe(0);
});

test("getBlogPostChunksByTitle matches substring in the middle", async () => {
  const results = await t.query(internal.blogPosts.internal.queries.getBlogPostChunksByTitle, {
    query: "World",
  });
  expect(results.length).toBe(1);
  expect(results[0].blogPost.title).toBe("Hello World");
});

test("getBlogPostChunksByTitle matches multiple posts if applicable", async () => {
  // Add another post with 'Hello' in the title and a chunk
  await t.run(async (ctx) => {
    const postId = await ctx.db.insert("blogPosts", {
      slug: "hello-again",
      title: "Hello Again",
      hash: "hash4",
    });
    await ctx.db.insert("blogPostChunks", {
      postId,
      chunkIndex: 0,
      content: "First chunk of Hello Again.",
      embedding: Array(1536).fill(0),
    });
  });
  const results = await t.query(internal.blogPosts.internal.queries.getBlogPostChunksByTitle, {
    query: "Hello",
  });
  expect(results.length).toBeGreaterThanOrEqual(2);
  expect(results.some((r: any) => r.blogPost.title === "Hello World")).toBe(true);
  expect(results.some((r: any) => r.blogPost.title === "Hello Again")).toBe(true);
});
