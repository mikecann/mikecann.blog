import dotenv from "dotenv";
dotenv.config({ path: `.env` });

import { getAllPublishablePosts } from "./posts";
import { api } from "../convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import crypto from "crypto";
import { Id } from "../convex/_generated/dataModel";
import { ensure } from "../essentials/misc/ensure";

const token = ensure(process.env.BLOG_POST_ADMIN_TOKEN, "Missing env BLOG_POST_ADMIN_TOKEN");

const client = new ConvexHttpClient(
  ensure(process.env.NEXT_PUBLIC_CONVEX_URL, "Missing env NEXT_PUBLIC_CONVEX_URL"),
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
  return crypto.createHash("sha256").update(content).digest("hex");
}

async function main() {
  const posts = getAllPublishablePosts(); //..slice(0, 10);
  console.log(`Uploading ${posts.length} posts...`);
  for (const post of posts) {
    const { slug, content, meta } = post;
    const title = meta.title;
    const hash = hashContent(content);

    // Get blog post by slug
    const existing = await client.query(api.blogPosts.queries.getBlogPostBySlug, { slug, token });

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

    if (existing.hash === hash) {
      console.log(`Post '${slug}' unchanged, skipping chunks.`);
      continue;
    }

    const delRes = await client.mutation(api.blogPosts.mutations.deleteChunksForPost, {
      postId: existing._id,
      token,
    });
    if (delRes.deleted > 0) console.log(`Deleted ${delRes.deleted} old chunks for post '${slug}'`);
    await uploadChunks(existing._id);
  }
  console.log("Done.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
