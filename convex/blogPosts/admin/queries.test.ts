import { convexTest } from "convex-test";
import { expect, test, vi, describe, beforeEach, afterEach } from "vitest";
import { api } from "../../_generated/api";
import schema from "../../schema";
import { EntryId } from "@convex-dev/rag";
import type { Id } from "../../_generated/dataModel";
import { modules } from "../../test.setup";

const setup = () => convexTest(schema, modules);
type TestConvex = ReturnType<typeof setup>;

vi.mock("@convex-dev/ai-sdk-provider", () => ({
  convexGateway: Object.assign(() => ({}), { embeddingModel: () => ({}) }),
}));

const originalEnv = process.env;
const token = "test-admin-token";
const NOW = new Date("2026-09-25T10:00:00.000Z").getTime();
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  process.env = { ...originalEnv, BLOG_POST_ADMIN_TOKEN: token };
});

afterEach(() => {
  vi.useRealTimers();
  process.env = originalEnv;
});

describe("listPostsThatNeedProcessing", () => {
  const insertPost = (t: TestConvex, slug: string, hash: string, title = slug) =>
    t.run((ctx) =>
      ctx.db.insert("blogPosts", { slug, title, hash, ragEntryId: `entry-${slug}` as EntryId }),
    );

  test("returns new posts and posts whose hash or title changed", async () => {
    const t = setup();
    await insertPost(t, "up-to-date", "hash-1");
    await insertPost(t, "content-changed", "old-hash");
    await insertPost(t, "title-changed", "hash-3", "Old title");

    const result = await t.query(api.blogPosts.admin.queries.listPostsThatNeedProcessing, {
      token,
      posts: [
        { slug: "up-to-date", hash: "hash-1", title: "up-to-date" },
        { slug: "content-changed", hash: "new-hash", title: "content-changed" },
        { slug: "title-changed", hash: "hash-3", title: "New title" },
        { slug: "brand-new", hash: "hash-4", title: "brand-new" },
      ],
    });

    expect(result).toEqual(["content-changed", "title-changed", "brand-new"]);
  });

  test("handles empty posts array", async () => {
    const t = setup();
    const result = await t.query(api.blogPosts.admin.queries.listPostsThatNeedProcessing, {
      token,
      posts: [],
    });
    expect(result).toEqual([]);
  });

  test("handles invalid token", async () => {
    const t = setup();
    await expect(
      t.query(api.blogPosts.admin.queries.listPostsThatNeedProcessing, {
        token: "invalid-token",
        posts: [],
      }),
    ).rejects.toThrow("Invalid token does not match env var BLOG_POST_ADMIN_TOKEN");
  });

  test("handles a large number of posts", async () => {
    const t = setup();
    const posts = Array.from({ length: 50 }, (_, i) => ({
      slug: `post-${i}`,
      hash: `hash-${i}`,
      title: `Post ${i}`,
    }));
    const result = await t.query(api.blogPosts.admin.queries.listPostsThatNeedProcessing, {
      token,
      posts,
    });
    expect(result).toEqual(posts.map((p) => p.slug));
  });
});

describe("listPostEmailCampaignProblems", () => {
  test("reports recent failed / skipped campaigns and stuck ones", async () => {
    const t = setup();
    await t.run(async (ctx) => {
      const postId = await ctx.db.insert("blogPosts", {
        slug: "p",
        title: "P",
        hash: "h",
        ragEntryId: "e" as EntryId,
      });
      const insert = (
        slug: string,
        status:
          | "queued"
          | "creating_campaign"
          | "content_set"
          | "sending"
          | "sent"
          | "failed"
          | "skipped",
        updatedAt: number,
        scheduledFunctionId?: Id<"_scheduled_functions">,
      ) =>
        ctx.db.insert("postEmailCampaigns", {
          postId,
          slug,
          title: slug,
          status,
          attempts: 1,
          createdAt: updatedAt,
          updatedAt,
          error: status === "failed" || status === "skipped" ? `${slug} error` : undefined,
          scheduledFunctionId,
        });
      await insert("recent-failure", "failed", NOW - DAY);
      await insert("ancient-failure", "failed", NOW - 60 * DAY);
      await insert("recent-skip", "skipped", NOW - HOUR);
      await insert("stuck-sending", "sending", NOW - 2 * HOUR);
      await insert("busy-sending", "sending", NOW - 5 * 60 * 1000);
      await insert("stuck-queued", "queued", NOW - 4 * HOUR);
      await insert("fresh-queued", "queued", NOW - HOUR);
      await insert("sent", "sent", NOW - HOUR);
    });

    const problems = await t.query(api.blogPosts.admin.queries.listPostEmailCampaignProblems, {
      token,
    });

    expect(problems.map((p) => p.slug).sort()).toEqual(
      ["recent-failure", "recent-skip", "stuck-queued", "stuck-sending"].sort(),
    );
    expect(problems.find((p) => p.slug === "recent-failure")).toMatchObject({
      status: "failed",
      error: "recent-failure error",
    });
  });
});
