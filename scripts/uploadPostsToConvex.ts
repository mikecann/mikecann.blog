import dotenv from "dotenv";
dotenv.config({ path: `.env` });

import { getAllPublishablePosts } from "./posts";
import { api } from "../convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { ensure } from "../essentials/misc/ensure";
import { hashContent } from "../utils/hashing";
import pLimit from "p-limit";

const token = ensure(process.env.BLOG_POST_ADMIN_TOKEN, "Missing env BLOG_POST_ADMIN_TOKEN");

const isProd = Bun.argv[2] == "--production";

const convexURL = isProd
  ? process.env.NEXT_PUBLIC_CONVEX_URL_PROD
  : process.env.NEXT_PUBLIC_CONVEX_URL;

console.log("Uploading blog posts to", isProd ? "production" : "development");

const client = new ConvexHttpClient(
  ensure(convexURL, `Missing env NEXT_PUBLIC_CONVEX_URL${isProd ? "_PROD" : ""}`),
);

async function main() {
  const posts = getAllPublishablePosts(); //..slice(0, 10);
  console.log(`Found ${posts.length} posts...`);

  // First, batch check which posts need processing
  console.log("Checking which posts need processing...");
  const postChecks = posts.map((post) => ({
    slug: post.slug,
    hash: hashContent(post.content),
  }));

  const slugIds = await client.query(api.blogPosts.queries.listPostsThatNeedProcessing, {
    posts: postChecks,
    token,
  });

  // Filter to only posts that need processing
  const postsToProcess = posts.filter((post) => slugIds.some((r) => r === post.slug));

  const skippedCount = posts.length - postsToProcess.length;
  console.log(
    `${postsToProcess.length} posts need processing, ${skippedCount} posts are up to date`,
  );

  // Now process only the posts that need it - in parallel with max 4 concurrent requests
  const limit = pLimit(5);

  const uploadPromises = postsToProcess.map((post) =>
    limit(async () => {
      await client.action(api.blogPosts.actions.upsert, {
        slug: post.slug,
        title: post.meta.title,
        hash: hashContent(post.content),
        content: post.content,
        token,
      });

      console.log(`Updated or inserted blog post '${post.slug}'`);
    }),
  );

  await Promise.all(uploadPromises);
  console.log("Done.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
