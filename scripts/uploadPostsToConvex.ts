import dotenv from "dotenv";
dotenv.config({ path: `.env` });

import { getAllPublishablePosts } from "./posts";
import { api } from "../convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import type { FunctionReturnType } from "convex/server";
import { ensure } from "../essentials/misc/ensure";
import { hashContent } from "../utils/hashing";
import pLimit from "p-limit";
import { isPostEmailCampaignScheduledOrSent } from "./postEmailCampaignStatus";

// Usage: bun run ./scripts/uploadPostsToConvex.ts [--production] [--force-prune]
//   --production   upload to the production deployment
//   --force-prune  allow deleting more posts than the safety limit from Convex

const token = ensure(process.env.BLOG_POST_ADMIN_TOKEN, "Missing env BLOG_POST_ADMIN_TOKEN");

const isProd = Bun.argv.includes("--production") || process.env.VERCEL_ENV === "production";
const forcePrune = Bun.argv.includes("--force-prune");

// Identifies this run so the server can cap how many new-post emails one upload
// can trigger (a bulk re-upload must never email subscribers about old posts).
const uploadRunId = crypto.randomUUID();

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

type UpsertResult = FunctionReturnType<typeof api.blogPosts.admin.actions.upsert>;

async function main() {
  const posts = getAllPublishablePosts(isProd);
  console.log(`Found ${posts.length} posts...`);

  // First, batch check which posts need processing
  console.log("Checking which posts need processing...");
  const postChecks = posts.map((post) => ({
    slug: post.slug,
    hash: hashContent(post.content),
    title: post.meta.title,
  }));

  const slugIds = await client.query(api.blogPosts.admin.queries.listPostsThatNeedProcessing, {
    posts: postChecks,
    token,
  });

  // Filter to only posts that need processing
  const slugsToProcess = new Set(slugIds);
  const postsToProcess = posts.filter((post) => slugsToProcess.has(post.slug));

  const skippedCount = posts.length - postsToProcess.length;
  console.log(
    `${postsToProcess.length} posts need processing, ${skippedCount} posts are up to date`,
  );

  // Now process only the posts that need it, at most 5 at a time
  const limit = pLimit(5);

  const results: UpsertResult[] = await Promise.all(
    postsToProcess.map((post) =>
      limit(async () => {
        const result = await client.action(api.blogPosts.admin.actions.upsert, {
          slug: post.slug,
          title: post.meta.title,
          hash: hashContent(post.content),
          content: preprocessContent(post.content),
          date: parsePostDate(post.slug, post.meta.date),
          status: post.meta.status,
          uploadRunId,
          token,
        });

        console.log(`${result.created ? "Inserted" : "Updated"} blog post '${post.slug}'`);
        return result;
      }),
    ),
  );

  reportNewPostEmails(results);

  await pruneRemovedPosts(posts.map((post) => post.slug));

  await verifyNewPostEmails(results.filter((r) => r.email.kind === "queued").map((r) => r.slug));

  // (Skipped emails from this run were already reported above.)
  await reportPostEmailProblems(
    new Set(results.filter((r) => r.email.kind === "skipped").map((r) => r.slug)),
  );

  console.log("Done.");
  process.exit(0);
}

function parsePostDate(slug: string, date: string): number {
  const ms = new Date(date).getTime();
  if (Number.isFinite(ms)) return ms;
  // An unparseable date is treated as ancient, so it can never trigger an email.
  console.warn(`Post '${slug}' has an invalid date '${date}'; no email will be sent for it`);
  return 0;
}

function warnLoudly(title: string, lines: string[]) {
  const bar = "!".repeat(80);
  console.warn(`\n${bar}\n!! ${title}\n${bar}`);
  for (const line of lines) console.warn(`!! ${line}`);
  console.warn(`${bar}\n`);
}

const retryCommand = (slug: string) =>
  `npx convex run ${isProd ? "--prod " : ""}mailchimp/admin/mutations:retryFailedPostEmailCampaign ` +
  `'{"token":"<BLOG_POST_ADMIN_TOKEN>","slug":"${slug}"}'`;

function reportNewPostEmails(results: UpsertResult[]) {
  for (const { slug, created, email } of results) {
    if (!created) continue;
    if (email.kind === "queued") console.log(`New post '${slug}': email to subscribers queued`);
    if (email.kind === "none") console.log(`New post '${slug}': no email (${email.reason})`);
  }

  const skipped = results.filter((r) => r.email.kind === "skipped");
  if (skipped.length === 0) return;

  warnLoudly(`Did NOT email subscribers about ${skipped.length} new post(s)`, [
    ...skipped.map((r) => `${r.slug}: ${r.email.kind === "skipped" ? r.email.reason : ""}`),
    "",
    "If a post really is new and should be emailed, send it with:",
    `  ${retryCommand("<slug>")}`,
  ]);
}

async function pruneRemovedPosts(slugs: string[]) {
  if (slugs.length === 0) {
    console.warn("No posts found locally; not pruning anything from Convex");
    return;
  }

  const { staleSlugs, removed } = await client.mutation(
    api.blogPosts.admin.mutations.pruneRemovedPosts,
    { token, slugs, force: forcePrune },
  );

  if (staleSlugs.length === 0) return;

  if (removed) {
    console.log(
      `Removed ${staleSlugs.length} deleted/renamed post(s) from Convex: ${staleSlugs.join(", ")}`,
    );
    return;
  }

  warnLoudly(`NOT removing ${staleSlugs.length} posts that no longer exist locally`, [
    ...staleSlugs,
    "",
    "That is more than the safety limit allows in one go, so nothing was deleted.",
    "If these posts really were deleted or renamed, run:",
    `  bun run ./scripts/uploadPostsToConvex.ts ${isProd ? "--production " : ""}--force-prune`,
  ]);
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
    const pending = rows.filter((row) => {
      if (!row.campaign) return true;
      if (row.campaign.status === "failed") return false;
      return !isPostEmailCampaignScheduledOrSent(row.campaign);
    });

    if (failed.length > 0) {
      const details = failed
        .map((row) => `${row.slug}: ${row.campaign?.error ?? "unknown error"}`)
        .join("\n");
      throw new Error(`Mailchimp email send failed:\n${details}`);
    }

    if (missing.length === 0 && pending.length === 0) {
      for (const row of rows) {
        const message = row.campaign?.status === "sent" ? "sent" : "scheduled";
        console.log(`Mailchimp email ${message} for '${row.slug}'`);
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

/** Warns about post emails that failed, were skipped, or look stuck. */
async function reportPostEmailProblems(alreadyReported: Set<string>) {
  const problems = (
    await client.query(api.blogPosts.admin.queries.listPostEmailCampaignProblems, { token })
  ).filter((p) => !(p.status === "skipped" && alreadyReported.has(p.slug)));
  if (problems.length === 0) return;

  warnLoudly(`${problems.length} post email(s) need attention`, [
    ...problems.map(
      (p) =>
        `${p.slug}: ${p.status} (last update ${new Date(p.updatedAt).toISOString()})` +
        (p.error ? ` - ${p.error}` : ""),
    ),
    "",
    "Once the cause is fixed, retry a failed/skipped email with:",
    `  ${retryCommand("<slug>")}`,
    'If the post is live but the "not live" check keeps failing, add "skipLiveCheck":true.',
    "If it was actually sent (check Mailchimp), record that with",
    "  mailchimp/admin/mutations:markPostEmailCampaignSent instead.",
  ]);
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
