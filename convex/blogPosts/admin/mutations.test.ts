import { convexTest } from "convex-test";
import { expect, test, vi, describe, beforeEach, afterEach } from "vitest";
import { api, internal } from "../../_generated/api";
import schema from "../../schema";
import { EntryId } from "@convex-dev/rag";
import { MAX_POSTS_TO_PRUNE_WITHOUT_FORCE } from "../lib";
import { modules } from "../../test.setup";

const setup = () => convexTest(schema, modules);
type TestConvex = ReturnType<typeof setup>;

const ragMock = vi.hoisted(() => ({ getNamespace: vi.fn(), deleteByKeyAsync: vi.fn() }));

vi.mock("@convex-dev/rag", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@convex-dev/rag")>();
  return {
    ...actual,
    RAG: class {
      getNamespace = ragMock.getNamespace;
      deleteByKeyAsync = ragMock.deleteByKeyAsync;
    },
  };
});

vi.mock("@convex-dev/ai-sdk-provider", () => ({
  convexGateway: Object.assign(() => ({}), { embeddingModel: () => ({}) }),
}));

const originalEnv = process.env;
const token = "test-admin-token";

const insertPosts = (t: TestConvex, slugs: string[]) =>
  t.run(async (ctx) => {
    for (const slug of slugs)
      await ctx.db.insert("blogPosts", {
        slug,
        title: slug,
        hash: `hash-${slug}`,
        ragEntryId: `entry-${slug}` as EntryId,
      });
  });

const remainingSlugs = (t: TestConvex) =>
  t.run(async (ctx) => (await ctx.db.query("blogPosts").collect()).map((p) => p.slug).sort());

describe("pruneRemovedPosts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    process.env = { ...originalEnv, BLOG_POST_ADMIN_TOKEN: token };
    ragMock.getNamespace.mockResolvedValue({ namespaceId: "ns-1" });
  });

  afterEach(() => {
    vi.useRealTimers();
    process.env = originalEnv;
  });

  test("deletes posts (and their RAG entries) that are no longer in the list", async () => {
    const t = setup();
    await insertPosts(t, ["keep-a", "keep-b", "deleted-post", "old-slug"]);

    const result = await t.mutation(api.blogPosts.admin.mutations.pruneRemovedPosts, {
      token,
      slugs: ["keep-a", "keep-b", "new-slug"],
      force: false,
    });

    expect(result).toEqual({ staleSlugs: ["deleted-post", "old-slug"], removed: true });
    expect(await remainingSlugs(t)).toEqual(["keep-a", "keep-b"]);
    expect(ragMock.deleteByKeyAsync).toHaveBeenCalledTimes(2);
    expect(ragMock.deleteByKeyAsync).toHaveBeenCalledWith(expect.anything(), {
      namespaceId: "ns-1",
      key: "deleted-post",
    });
  });

  test("does nothing when every post is still present", async () => {
    const t = setup();
    await insertPosts(t, ["a", "b"]);
    const result = await t.mutation(api.blogPosts.admin.mutations.pruneRemovedPosts, {
      token,
      slugs: ["a", "b"],
      force: false,
    });
    expect(result).toEqual({ staleSlugs: [], removed: false });
    expect(ragMock.deleteByKeyAsync).not.toHaveBeenCalled();
  });

  test(`refuses to prune more than ${MAX_POSTS_TO_PRUNE_WITHOUT_FORCE} posts unless forced`, async () => {
    const t = setup();
    const slugs = Array.from({ length: MAX_POSTS_TO_PRUNE_WITHOUT_FORCE + 1 }, (_, i) => `p-${i}`);
    await insertPosts(t, slugs);

    const refused = await t.mutation(api.blogPosts.admin.mutations.pruneRemovedPosts, {
      token,
      slugs: [],
      force: false,
    });
    expect(refused).toEqual({ staleSlugs: slugs, removed: false });
    expect(await remainingSlugs(t)).toEqual([...slugs].sort());
    expect(ragMock.deleteByKeyAsync).not.toHaveBeenCalled();

    const forced = await t.mutation(api.blogPosts.admin.mutations.pruneRemovedPosts, {
      token,
      slugs: [],
      force: true,
    });
    expect(forced.removed).toBe(true);
    expect(await remainingSlugs(t)).toEqual([]);
  });

  test("cancels a queued email for a pruned post", async () => {
    const t = setup();
    await insertPosts(t, ["keep", "removed"]);
    const campaignId = await t.run(async (ctx) => {
      const post = await ctx.db
        .query("blogPosts")
        .withIndex("by_slug", (q) => q.eq("slug", "removed"))
        .unique();
      const id = await ctx.db.insert("postEmailCampaigns", {
        postId: post!._id,
        slug: "removed",
        title: "removed",
        status: "queued",
        attempts: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      const scheduledFunctionId = await ctx.scheduler.runAfter(
        60_000,
        internal.mailchimp.internal.actions.sendNewPostCampaign,
        { campaignId: id },
      );
      await ctx.db.patch("postEmailCampaigns", id, { scheduledFunctionId });
      return id;
    });

    await t.mutation(api.blogPosts.admin.mutations.pruneRemovedPosts, {
      token,
      slugs: ["keep"],
      force: false,
    });

    const campaign = await t.run((ctx) => ctx.db.get("postEmailCampaigns", campaignId));
    expect(campaign).toMatchObject({ status: "failed", error: expect.stringContaining("removed") });
    const job = await t.run((ctx) =>
      ctx.db.system.get("_scheduled_functions", campaign!.scheduledFunctionId!),
    );
    expect(job?.state.kind).toBe("canceled");
  });

  test("validates admin token", async () => {
    const t = setup();
    await expect(
      t.mutation(api.blogPosts.admin.mutations.pruneRemovedPosts, {
        token: "nope",
        slugs: [],
        force: true,
      }),
    ).rejects.toThrow("Invalid token");
  });
});
