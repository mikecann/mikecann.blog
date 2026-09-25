import { convexTest } from "convex-test";
import { expect, test, vi, describe, beforeEach, afterEach } from "vitest";
import { api } from "../../_generated/api";
import schema from "../../schema";
import { EntryId } from "@convex-dev/rag";
import {
  NEW_POST_EMAIL_DELAY_MS,
  POST_EMAIL_MAX_CAMPAIGNS_PER_UPLOAD_RUN,
} from "../../mailchimp/constants";
import { PRODUCTION_CONVEX_CLOUD_URL } from "../../mailchimp/lib";
import { modules } from "../../test.setup";

const setup = () => convexTest(schema, modules);
type TestConvex = ReturnType<typeof setup>;

const ragMock = vi.hoisted(() => ({ add: vi.fn(), getEntry: vi.fn() }));

vi.mock("@convex-dev/rag", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@convex-dev/rag")>();
  return {
    ...actual,
    RAG: class {
      add = ragMock.add;
      getEntry = ragMock.getEntry;
    },
  };
});

vi.mock("@ai-sdk/openai", () => ({
  openai: { embedding: () => ({}), responses: () => ({}) },
}));

const originalEnv = process.env;
const mockEntryId = (id: string): EntryId => id as EntryId;

const NOW = new Date("2026-09-25T10:00:00.000Z").getTime();
const DAY = 24 * 60 * 60 * 1000;
const token = "test-admin-token";

const upsertArgs = (
  overrides: {
    slug?: string;
    title?: string;
    hash?: string;
    content?: string;
    date?: number;
    status?: "draft" | "published";
    uploadRunId?: string;
  } = {},
) => ({
  token,
  content: "This is test blog post content",
  slug: "test-blog-post",
  title: "Test Blog Post",
  hash: "test-content-hash",
  date: NOW - DAY,
  uploadRunId: "run-1",
  ...overrides,
});

const getPost = (t: TestConvex, slug = "test-blog-post") =>
  t.run((ctx) =>
    ctx.db
      .query("blogPosts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first(),
  );

const getCampaigns = (t: TestConvex) =>
  t.run((ctx) => ctx.db.query("postEmailCampaigns").collect());

describe("upsert action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    process.env = {
      ...originalEnv,
      BLOG_POST_ADMIN_TOKEN: token,
      CONVEX_CLOUD_URL: PRODUCTION_CONVEX_CLOUD_URL,
      MAILCHIMP_API_KEY: "abc123-us3",
    };
    ragMock.getEntry.mockResolvedValue(null);
  });

  afterEach(() => {
    vi.useRealTimers();
    process.env = originalEnv;
  });

  test("creates a new recent post and queues its email", async () => {
    const t = setup();
    ragMock.add.mockResolvedValue({ entryId: mockEntryId("new-rag-entry-id") });

    const result = await t.action(api.blogPosts.admin.actions.upsert, upsertArgs());
    expect(result).toEqual({ slug: "test-blog-post", created: true, email: { kind: "queued" } });

    expect(ragMock.add).toHaveBeenCalledWith(expect.anything(), {
      namespace: "blog_posts",
      text: "This is test blog post content",
      key: "test-blog-post",
      title: "Test Blog Post",
      contentHash: "test-content-hash",
    });

    const blogPost = await getPost(t);
    expect(blogPost).toMatchObject({
      slug: "test-blog-post",
      title: "Test Blog Post",
      hash: "test-content-hash",
      ragEntryId: "new-rag-entry-id",
    });

    const [campaign] = await getCampaigns(t);
    expect(campaign).toMatchObject({
      postId: blogPost?._id,
      slug: "test-blog-post",
      title: "Test Blog Post",
      status: "queued",
      attempts: 0,
      uploadRunId: "run-1",
    });

    const scheduledFunction = await t.run((ctx) =>
      ctx.db.system.get("_scheduled_functions", campaign.scheduledFunctionId!),
    );
    expect(scheduledFunction).toMatchObject({
      name: "mailchimp/internal/actions:sendNewPostCampaign",
      state: { kind: "pending" },
      scheduledTime: NOW + NEW_POST_EMAIL_DELAY_MS,
    });
  });

  test.each([
    ["older than 14 days", { date: NOW - 15 * DAY }, "more than 14 days ago"],
    ["a draft", { status: "draft" as const }, "draft"],
    ["an invalid date", { date: Number.NaN }, "invalid date"],
  ])("creates the post but does not email when it is %s", async (_, overrides, reason) => {
    const t = setup();
    ragMock.add.mockResolvedValue({ entryId: mockEntryId("entry") });

    const result = await t.action(api.blogPosts.admin.actions.upsert, upsertArgs(overrides));

    expect(result.created).toBe(true);
    expect(result.email).toMatchObject({ kind: "none", reason: expect.stringContaining(reason) });
    expect(await getPost(t)).not.toBeNull();
    expect(await getCampaigns(t)).toEqual([]);
  });

  test("never emails from a non-production deployment", async () => {
    const t = setup();
    process.env.CONVEX_CLOUD_URL = "https://wooden-warbler-780.convex.cloud";
    ragMock.add.mockResolvedValue({ entryId: mockEntryId("entry") });

    const result = await t.action(api.blogPosts.admin.actions.upsert, upsertArgs());

    expect(result.email).toMatchObject({
      kind: "none",
      reason: expect.stringContaining("is not production"),
    });
    expect(await getCampaigns(t)).toEqual([]);
  });

  test("MAILCHIMP_ALLOW_NON_PRODUCTION_SEND=true allows other deployments to send", async () => {
    const t = setup();
    process.env.CONVEX_CLOUD_URL = "https://wooden-warbler-780.convex.cloud";
    process.env.MAILCHIMP_ALLOW_NON_PRODUCTION_SEND = "true";
    ragMock.add.mockResolvedValue({ entryId: mockEntryId("entry") });

    const result = await t.action(api.blogPosts.admin.actions.upsert, upsertArgs());
    expect(result.email).toEqual({ kind: "queued" });
  });

  test("records a skipped campaign when MAILCHIMP_API_KEY is missing", async () => {
    const t = setup();
    delete process.env.MAILCHIMP_API_KEY;
    ragMock.add.mockResolvedValue({ entryId: mockEntryId("entry") });

    const result = await t.action(api.blogPosts.admin.actions.upsert, upsertArgs());

    expect(result.email).toEqual({ kind: "skipped", reason: "MAILCHIMP_API_KEY is not set" });
    const [campaign] = await getCampaigns(t);
    expect(campaign).toMatchObject({
      status: "skipped",
      error: expect.stringContaining("API_KEY"),
    });
    expect(campaign.scheduledFunctionId).toBeUndefined();
  });

  test("caps how many emails one upload run can queue", async () => {
    const t = setup();
    ragMock.add.mockResolvedValue({ entryId: mockEntryId("entry") });

    const results = [];
    for (let i = 0; i < POST_EMAIL_MAX_CAMPAIGNS_PER_UPLOAD_RUN + 2; i++)
      results.push(
        await t.action(api.blogPosts.admin.actions.upsert, upsertArgs({ slug: `post-${i}` })),
      );

    expect(results.map((r) => r.email.kind)).toEqual([
      ...Array(POST_EMAIL_MAX_CAMPAIGNS_PER_UPLOAD_RUN).fill("queued"),
      "skipped",
      "skipped",
    ]);
    const campaigns = await getCampaigns(t);
    expect(campaigns.filter((c) => c.status === "skipped")).toHaveLength(2);
    expect(campaigns.filter((c) => c.status === "skipped")[0].error).toContain("bulk import");

    // A new run starts a fresh count
    const next = await t.action(
      api.blogPosts.admin.actions.upsert,
      upsertArgs({ slug: "next-run-post", uploadRunId: "run-2" }),
    );
    expect(next.email).toEqual({ kind: "queued" });
  });

  test("does not email again for a slug that already had a campaign", async () => {
    const t = setup();
    ragMock.add.mockResolvedValue({ entryId: mockEntryId("entry") });
    await t.action(api.blogPosts.admin.actions.upsert, upsertArgs());

    // e.g. the post was pruned and later re-added
    await t.run(async (ctx) => {
      const post = await ctx.db.query("blogPosts").first();
      await ctx.db.delete("blogPosts", post!._id);
    });

    const result = await t.action(
      api.blogPosts.admin.actions.upsert,
      upsertArgs({ uploadRunId: "run-2" }),
    );
    expect(result.created).toBe(true);
    expect(result.email).toMatchObject({
      kind: "none",
      reason: expect.stringContaining("already"),
    });
    expect(await getCampaigns(t)).toHaveLength(1);
  });

  test("updates title, hash and ragEntryId of an existing post without emailing", async () => {
    const t = setup();
    await t.run((ctx) =>
      ctx.db.insert("blogPosts", {
        slug: "test-blog-post",
        title: "Old Title",
        hash: "old-hash",
        ragEntryId: mockEntryId("old-rag-entry-id"),
      }),
    );
    ragMock.getEntry.mockResolvedValue({
      entryId: "old-rag-entry-id",
      status: "ready",
      contentHash: "old-hash",
      title: "Old Title",
    });
    ragMock.add.mockResolvedValue({ entryId: mockEntryId("new-rag-entry-id") });

    const result = await t.action(api.blogPosts.admin.actions.upsert, upsertArgs());

    expect(result).toMatchObject({ created: false, email: { kind: "none" } });
    expect(ragMock.add).toHaveBeenCalledTimes(1);
    expect(await getPost(t)).toMatchObject({
      title: "Test Blog Post",
      hash: "test-content-hash",
      ragEntryId: "new-rag-entry-id",
    });
    expect(await getCampaigns(t)).toEqual([]);
  });

  test("skips re-embedding when the RAG entry already has this content and title", async () => {
    const t = setup();
    await t.run((ctx) =>
      ctx.db.insert("blogPosts", {
        slug: "test-blog-post",
        title: "Test Blog Post",
        hash: "stale-hash",
        ragEntryId: mockEntryId("current-entry"),
      }),
    );
    ragMock.getEntry.mockResolvedValue({
      entryId: "current-entry",
      status: "ready",
      contentHash: "test-content-hash",
      title: "Test Blog Post",
    });

    await t.action(api.blogPosts.admin.actions.upsert, upsertArgs());

    expect(ragMock.add).not.toHaveBeenCalled();
    expect(await getPost(t)).toMatchObject({
      hash: "test-content-hash",
      ragEntryId: "current-entry",
    });
  });

  test("validates admin token", async () => {
    const t = setup();
    await expect(
      t.action(api.blogPosts.admin.actions.upsert, { ...upsertArgs(), token: "invalid-token" }),
    ).rejects.toThrow("Invalid token does not match env var BLOG_POST_ADMIN_TOKEN");
  });

  test("creates nothing when RAG fails", async () => {
    const t = setup();
    ragMock.add.mockRejectedValue(new Error("RAG service unavailable"));

    await expect(t.action(api.blogPosts.admin.actions.upsert, upsertArgs())).rejects.toThrow(
      "RAG service unavailable",
    );
    expect(await t.run((ctx) => ctx.db.query("blogPosts").collect())).toHaveLength(0);
    expect(await getCampaigns(t)).toEqual([]);
  });

  test("handles special characters in content and title", async () => {
    const t = setup();
    const specialTitle = "Title with émojis 🚀, $& and <b>tags</b>";
    ragMock.add.mockResolvedValue({ entryId: mockEntryId("special") });

    await t.action(
      api.blogPosts.admin.actions.upsert,
      upsertArgs({ slug: "special-chars-post", title: specialTitle }),
    );

    expect(await getPost(t, "special-chars-post")).toMatchObject({ title: specialTitle });
    const [campaign] = await getCampaigns(t);
    expect(campaign.title).toBe(specialTitle);
  });
});
