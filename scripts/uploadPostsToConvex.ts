import dotenv from "dotenv";
dotenv.config({ path: `.env` });

import { getAllPublishablePosts } from "./posts";
import { api } from "../convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import crypto from "crypto";
import { Id } from "../convex/_generated/dataModel";
import { ensure } from "../essentials/misc/ensure";

const token = ensure(process.env.BLOG_POST_ADMIN_TOKEN, "Missing env BLOG_POST_ADMIN_TOKEN");

const isProd = Bun.argv[2] == "--production";

const convexURL = isProd
  ? process.env.NEXT_PUBLIC_CONVEX_URL_PROD
  : process.env.NEXT_PUBLIC_CONVEX_URL;

console.log("Uploading blog posts to", isProd ? "production" : "development");

const client = new ConvexHttpClient(
  ensure(convexURL, `Missing env NEXT_PUBLIC_CONVEX_URL${isProd ? "_PROD" : ""}`),
);

function chunkContent(content: string, maxLen = 1500): string[] {
  const paragraphs = content.split(/\n\n+/);
  const chunks: string[] = [];
  let current = "";
  for (const para of paragraphs) {
    if ((current + "\n\n" + para).length > maxLen) {
      if (current) chunks.push(current.trim());
      current = para;
    } else {
      current = current ? current + "\n\n" + para : para;
    }
  }
  if (current) chunks.push(current.trim());
  return chunks;
}

function hashContent(content: string): string {
  // Normalize line endings to ensure consistent hashes across different OS
  const normalizedContent = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return crypto.createHash("sha256").update(normalizedContent).digest("hex");
}

async function main() {
  const posts = getAllPublishablePosts(); //..slice(0, 10);
  console.log(`Found ${posts.length} posts...`);

  // First, batch check which posts need processing
  console.log("Checking which posts need processing...");
  const postChecks = posts.map((post) => ({
    slug: post.slug,
    hash: hashContent(post.content),
  }));

  const checkResults = await client.query(api.blogPosts.queries.checkBlogPostsNeedProcessing, {
    posts: postChecks,
    token,
  });

  // Filter to only posts that need processing
  const postsToProcess = posts.filter((post) => {
    const checkResult = checkResults.find((r) => r.slug === post.slug);
    return checkResult?.needsProcessing;
  });

  const skippedCount = posts.length - postsToProcess.length;
  console.log(
    `${postsToProcess.length} posts need processing, ${skippedCount} posts are up to date`,
  );

  // Now process only the posts that need it
  for (const post of postsToProcess) {
    const { slug, content, meta } = post;
    const title = meta.title;
    const hash = hashContent(content);

    const uploadChunks = async (postId: Id<"blogPosts">) => {
      // Chunk and upload
      const chunks = chunkContent(content);
      console.log(`Post '${slug}' split into ${chunks.length} chunks, uploading...`);
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        await client.action(api.blogPosts.actions.generateEmbeddingAndCreateChunk, {
          postId,
          chunkIndex: i,
          content: chunk,
          token,
        });
        console.log(`  Uploaded chunk ${i + 1}/${chunks.length}`);
      }
    };

    // Check if this post exists (we already know from batch check, but need the actual post object)
    const existing = await client.query(api.blogPosts.queries.getBlogPostBySlug, { slug, token });

    if (!existing) {
      const post = await client.mutation(api.blogPosts.mutations.createBlogPost, {
        slug,
        title,
        hash,
        token,
      });
      console.log(`Created new blog post '${slug}' (id: ${post._id})`);
      await uploadChunks(post._id);
      continue;
    }

    // If we get here, the post exists but hash doesn't match
    const delRes = await client.mutation(api.blogPosts.mutations.deleteChunksForPost, {
      postId: existing._id,
      token,
    });
    if (delRes.deleted > 0) console.log(`Deleted ${delRes.deleted} old chunks for post '${slug}'`);
    await uploadChunks(existing._id);

    // Update the post with new hash and title
    await client.mutation(api.blogPosts.mutations.patchBlogPost, {
      postId: existing._id,
      title,
      hash,
      token,
    });
    console.log(`Updated blog post '${slug}' with new hash`);
  }
  console.log("Done.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
