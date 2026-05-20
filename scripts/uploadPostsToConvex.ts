import dotenv from "dotenv";
dotenv.config({ path: `.env` });

import { getAllPublishablePosts } from "./posts";
import { api } from "../convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { ensure } from "../essentials/misc/ensure";
import { hashContent } from "../utils/hashing";
import pLimit from "p-limit";

const token = ensure(process.env.BLOG_POST_ADMIN_TOKEN, "Missing env BLOG_POST_ADMIN_TOKEN");

const isProd = Bun.argv.includes("--production") || process.env.VERCEL_ENV === "production";

const convexURL = isProd
  ? (process.env.NEXT_PUBLIC_CONVEX_URL_PROD ?? process.env.NEXT_PUBLIC_CONVEX_URL)
  : process.env.NEXT_PUBLIC_CONVEX_URL;

console.log("Uploading blog posts to", isProd ? "production" : "development");
console.log("Convex URL:", convexURL);

const client = new ConvexHttpClient(
  ensure(
    convexURL,
    isProd
      ? "Missing env NEXT_PUBLIC_CONVEX_URL_PROD or NEXT_PUBLIC_CONVEX_URL"
      : "Missing env NEXT_PUBLIC_CONVEX_URL",
  ),
);

async function main() {
  const posts = getAllPublishablePosts(isProd);
  console.log(`Found ${posts.length} posts...`);

  // First, batch check which posts need processing
  console.log("Checking which posts need processing...");
  const postChecks = posts.map((post) => ({
    slug: post.slug,
    hash: hashContent(post.content),
  }));

  const slugIds = await client.query(api.blogPosts.admin.queries.listPostsThatNeedProcessing, {
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
      const result = await client.action(api.blogPosts.admin.actions.upsert, {
        slug: post.slug,
        title: post.meta.title,
        hash: hashContent(post.content),
        content: preprocessContent(post.content),
        token,
      });

      console.log(`Updated or inserted blog post '${post.slug}'`);
      return result;
    }),
  );

  const results = await Promise.all(uploadPromises);
  const newPostSlugs = results.filter((r) => r.created).map((r) => r.slug);

  await verifyNewPostEmails(newPostSlugs);

  console.log("Done.");
  process.exit(0);
}

async function verifyNewPostEmails(slugs: string[]) {
  if (slugs.length === 0) return;

  const timeoutMs = 60_000;
  const startedAt = Date.now();

  console.log(`Verifying Mailchimp email status for ${slugs.length} new post(s)...`);

  while (Date.now() - startedAt < timeoutMs) {
    const rows = await client.query(api.blogPosts.admin.queries.listPostEmailCampaigns, {
      token,
      slugs,
    });

    const missing = rows.filter((row) => !row.campaign);
    const failed = rows.filter((row) => row.campaign?.status === "failed");
    const pending = rows.filter((row) =>
      row.campaign ? !["sent", "failed"].includes(row.campaign.status) : true,
    );

    if (failed.length > 0) {
      const details = failed
        .map((row) => `${row.slug}: ${row.campaign?.error ?? "unknown error"}`)
        .join("\n");
      throw new Error(`Mailchimp email send failed:\n${details}`);
    }

    if (missing.length === 0 && pending.length === 0) {
      for (const row of rows) {
        console.log(`Mailchimp email sent for '${row.slug}'`);
      }
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  const rows = await client.query(api.blogPosts.admin.queries.listPostEmailCampaigns, {
    token,
    slugs,
  });
  const summary = rows
    .map((row) => `${row.slug}: ${row.campaign?.status ?? "missing campaign row"}`)
    .join("\n");

  throw new Error(`Timed out waiting for Mailchimp email status:\n${summary}`);
}

// Function to clean up content before sending to OpenAI
function preprocessContent(content: string): string {
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

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
