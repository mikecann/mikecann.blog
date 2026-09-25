import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { EntryId } from "@convex-dev/rag";
import { api, internal } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";
import schema from "../schema";
import { modules } from "../test.setup";
import { POST_LIVE_CHECK_MAX_ATTEMPTS, POST_LIVE_CHECK_RETRY_DELAY_MS } from "./constants";
import { PRODUCTION_CONVEX_CLOUD_URL } from "./lib";

const setup = () => convexTest(schema, modules);
type TestConvex = ReturnType<typeof setup>;

vi.mock("@ai-sdk/openai", () => ({
  openai: { embedding: () => ({}), responses: () => ({}) },
}));

const originalEnv = process.env;
const token = "test-admin-token";
const NOW = new Date("2026-09-25T10:00:00.000Z").getTime();
const HOUR = 60 * 60 * 1000;
const POST_URL = "https://mikecann.blog/posts/my-new-post";

type Campaign = Doc<"postEmailCampaigns">;

const insertCampaign = (t: TestConvex, overrides: Partial<Campaign> = {}) =>
  t.run(async (ctx) => {
    const postId = await ctx.db.insert("blogPosts", {
      slug: overrides.slug ?? "my-new-post",
      title: overrides.title ?? "My $& <New> Post",
      hash: "hash",
      ragEntryId: "entry" as EntryId,
    });
    return await ctx.db.insert("postEmailCampaigns", {
      postId,
      slug: "my-new-post",
      title: "My $& <New> Post",
      status: "queued",
      attempts: 0,
      createdAt: NOW,
      updatedAt: NOW,
      ...overrides,
    });
  });

const getCampaign = (t: TestConvex, id: Id<"postEmailCampaigns">) =>
  t.run((ctx) => ctx.db.get("postEmailCampaigns", id));

const send = (t: TestConvex, campaignId: Id<"postEmailCampaigns">) =>
  t.action(internal.mailchimp.internal.actions.sendNewPostCampaign, { campaignId });

/** Fakes the blog and the Mailchimp API; returns the list of requests made. */
const mockFetch = ({ postStatus = 200, failSend = false } = {}) => {
  const calls: { url: string; method: string; body?: string }[] = [];
  vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    const url = String(input);
    const method = init?.method ?? "GET";
    calls.push({ url, method, body: init?.body ? String(init.body) : undefined });

    if (url === POST_URL) return new Response("<html/>", { status: postStatus });
    if (url.endsWith("/campaigns") && method === "POST")
      return Response.json({ id: "mc-campaign-1" });
    if (url.endsWith("/content") && method === "PUT") return Response.json({});
    if (url.endsWith("/actions/send") && method === "POST")
      return failSend
        ? new Response("Your Campaign is not ready to send", { status: 400 })
        : new Response(null, { status: 204 });
    throw new Error(`Unexpected fetch: ${method} ${url}`);
  });
  return calls;
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  process.env = {
    ...originalEnv,
    BLOG_POST_ADMIN_TOKEN: token,
    CONVEX_CLOUD_URL: PRODUCTION_CONVEX_CLOUD_URL,
    MAILCHIMP_API_KEY: "abc123-us3",
  };
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  process.env = originalEnv;
});

describe("sendNewPostCampaign", () => {
  test("checks the post is live, then creates, fills and sends the campaign", async () => {
    const t = setup();
    const calls = mockFetch();
    const campaignId = await insertCampaign(t);

    await send(t, campaignId);

    expect(calls.map((c) => `${c.method} ${c.url}`)).toEqual([
      `GET ${POST_URL}`,
      "POST https://us3.api.mailchimp.com/3.0/campaigns",
      "PUT https://us3.api.mailchimp.com/3.0/campaigns/mc-campaign-1/content",
      "POST https://us3.api.mailchimp.com/3.0/campaigns/mc-campaign-1/actions/send",
    ]);
    const html = JSON.parse(calls[2].body!).html as string;
    expect(html).toContain(">My $&amp; &lt;New&gt; Post</a>");
    expect(html).not.toContain("{{POST_TITLE}}");

    expect(await getCampaign(t, campaignId)).toMatchObject({
      status: "sent",
      attempts: 1,
      mailchimpCampaignId: "mc-campaign-1",
      sentAt: NOW,
    });
  });

  test("waits and checks again while the post is not live yet", async () => {
    const t = setup();
    const calls = mockFetch({ postStatus: 404 });
    const campaignId = await insertCampaign(t);

    await send(t, campaignId);

    expect(calls).toHaveLength(1);
    const campaign = await getCampaign(t, campaignId);
    expect(campaign).toMatchObject({ status: "queued", liveCheckAttempts: 1, attempts: 0 });
    const job = await t.run((ctx) =>
      ctx.db.system.get("_scheduled_functions", campaign!.scheduledFunctionId!),
    );
    expect(job).toMatchObject({
      name: "mailchimp/internal/actions:sendNewPostCampaign",
      state: { kind: "pending" },
      scheduledTime: NOW + POST_LIVE_CHECK_RETRY_DELAY_MS,
    });

    // Once the deploy is live the scheduled retry sends it
    vi.restoreAllMocks();
    mockFetch();
    vi.advanceTimersByTime(POST_LIVE_CHECK_RETRY_DELAY_MS);
    await t.finishInProgressScheduledFunctions();
    expect(await getCampaign(t, campaignId)).toMatchObject({ status: "sent" });
  });

  test("gives up after the maximum number of live checks", async () => {
    const t = setup();
    mockFetch({ postStatus: 404 });
    const campaignId = await insertCampaign(t, {
      liveCheckAttempts: POST_LIVE_CHECK_MAX_ATTEMPTS - 1,
    });

    await send(t, campaignId);

    expect(await getCampaign(t, campaignId)).toMatchObject({
      status: "failed",
      liveCheckAttempts: POST_LIVE_CHECK_MAX_ATTEMPTS,
      error: expect.stringContaining(`${POST_URL} returned HTTP 404`),
    });
  });

  test.each(["creating_campaign", "content_set", "sending", "sent", "failed", "skipped"] as const)(
    "does nothing for a campaign that is '%s'",
    async (status) => {
      const t = setup();
      const calls = mockFetch();
      const campaignId = await insertCampaign(t, { status });

      await send(t, campaignId);

      expect(calls).toEqual([]);
      expect(await getCampaign(t, campaignId)).toMatchObject({ status, attempts: 0 });
    },
  );

  test("only one run can claim a queued campaign", async () => {
    const t = setup();
    const campaignId = await insertCampaign(t);
    const claim = () =>
      t.mutation(internal.mailchimp.internal.mutations.beginPostEmailCampaign, { campaignId });

    expect(await claim()).toMatchObject({ kind: "claimed", slug: "my-new-post" });
    expect(await claim()).toEqual({ kind: "not_queued", status: "creating_campaign" });
  });

  test("never sends from a non-production deployment", async () => {
    const t = setup();
    process.env.CONVEX_CLOUD_URL = "https://wooden-warbler-780.convex.cloud";
    const calls = mockFetch();
    const campaignId = await insertCampaign(t);

    await send(t, campaignId);

    expect(calls).toEqual([]);
    expect(await getCampaign(t, campaignId)).toMatchObject({
      status: "failed",
      error: expect.stringContaining("is not production"),
    });
  });

  test("marks the campaign failed when Mailchimp errors, and a retry reuses it", async () => {
    const t = setup();
    mockFetch({ failSend: true });
    const campaignId = await insertCampaign(t);

    await expect(send(t, campaignId)).rejects.toThrow("Mailchimp API error 400");
    expect(await getCampaign(t, campaignId)).toMatchObject({
      status: "failed",
      mailchimpCampaignId: "mc-campaign-1",
      error: expect.stringContaining("not ready to send"),
    });

    vi.restoreAllMocks();
    const calls = mockFetch();
    await t.mutation(api.mailchimp.admin.mutations.retryFailedPostEmailCampaign, {
      token,
      slug: "my-new-post",
    });
    await t.finishInProgressScheduledFunctions();
    await vi.runOnlyPendingTimersAsync();
    await t.finishInProgressScheduledFunctions();

    // No second campaign is created in Mailchimp
    expect(calls.some((c) => c.url.endsWith("/campaigns") && c.method === "POST")).toBe(false);
    expect(await getCampaign(t, campaignId)).toMatchObject({ status: "sent", attempts: 2 });
  });
});

describe("retryFailedPostEmailCampaign", () => {
  const retry = (t: TestConvex) =>
    t.mutation(api.mailchimp.admin.mutations.retryFailedPostEmailCampaign, {
      token,
      slug: "my-new-post",
    });

  test.each(["failed", "skipped"] as const)("re-queues a %s campaign", async (status) => {
    const t = setup();
    const campaignId = await insertCampaign(t, {
      status,
      error: "boom",
      liveCheckAttempts: 5,
    });

    expect(await retry(t)).toEqual({ slug: "my-new-post", status: "queued", scheduled: true });

    const campaign = await getCampaign(t, campaignId);
    expect(campaign).toMatchObject({ status: "queued", liveCheckAttempts: 0 });
    expect(campaign?.error).toBeUndefined();
    const job = await t.run((ctx) =>
      ctx.db.system.get("_scheduled_functions", campaign!.scheduledFunctionId!),
    );
    expect(job).toMatchObject({ state: { kind: "pending" }, scheduledTime: NOW });
  });

  test("can skip the live check when asked to", async () => {
    const t = setup();
    const calls = mockFetch({ postStatus: 403 });
    const campaignId = await insertCampaign(t, { status: "failed" });

    await t.mutation(api.mailchimp.admin.mutations.retryFailedPostEmailCampaign, {
      token,
      slug: "my-new-post",
      skipLiveCheck: true,
    });
    await vi.runOnlyPendingTimersAsync();
    await t.finishInProgressScheduledFunctions();

    expect(calls.some((c) => c.url === POST_URL)).toBe(false);
    expect(await getCampaign(t, campaignId)).toMatchObject({ status: "sent" });
  });

  test("leaves a sent campaign alone", async () => {
    const t = setup();
    await insertCampaign(t, { status: "sent" });
    expect(await retry(t)).toEqual({ slug: "my-new-post", status: "sent", scheduled: false });
  });

  test("refuses campaigns that are queued or in progress", async () => {
    const t = setup();
    await insertCampaign(t, { status: "sending" });
    await expect(retry(t)).rejects.toThrow("is 'sending', not failed or skipped");
  });

  test("validates the admin token", async () => {
    const t = setup();
    await insertCampaign(t, { status: "failed" });
    await expect(
      t.mutation(api.mailchimp.admin.mutations.retryFailedPostEmailCampaign, {
        token: "nope",
        slug: "my-new-post",
      }),
    ).rejects.toThrow("Invalid token");
  });
});

describe("markPostEmailCampaignSent", () => {
  test("marks the campaign sent when the Mailchimp id matches", async () => {
    const t = setup();
    const campaignId = await insertCampaign(t, {
      status: "failed",
      mailchimpCampaignId: "mc-1",
      error: "stuck",
    });

    await t.mutation(api.mailchimp.admin.mutations.markPostEmailCampaignSent, {
      token,
      slug: "my-new-post",
      mailchimpCampaignId: "mc-1",
    });
    expect(await getCampaign(t, campaignId)).toMatchObject({ status: "sent", sentAt: NOW });

    await expect(
      t.mutation(api.mailchimp.admin.mutations.markPostEmailCampaignSent, {
        token,
        slug: "my-new-post",
        mailchimpCampaignId: "other",
      }),
    ).rejects.toThrow("id mismatch");
  });
});

describe("failStuckPostEmailCampaigns", () => {
  test("fails campaigns stuck mid-send or queued without a send job", async () => {
    const t = setup();
    const ids = {
      stuckCreating: await insertCampaign(t, {
        status: "creating_campaign",
        updatedAt: NOW - 2 * HOUR,
      }),
      stuckSending: await insertCampaign(t, { status: "sending", updatedAt: NOW - 2 * HOUR }),
      busy: await insertCampaign(t, { status: "content_set", updatedAt: NOW - 10 * 60 * 1000 }),
      orphanedQueued: await insertCampaign(t, { status: "queued", updatedAt: NOW - 4 * HOUR }),
      scheduledQueued: await insertCampaign(t, { status: "queued", updatedAt: NOW - 4 * HOUR }),
      sent: await insertCampaign(t, { status: "sent", updatedAt: NOW - 10 * HOUR }),
    };
    await t.run(async (ctx) => {
      const scheduledFunctionId = await ctx.scheduler.runAfter(
        HOUR,
        internal.mailchimp.internal.actions.sendNewPostCampaign,
        { campaignId: ids.scheduledQueued },
      );
      await ctx.db.patch("postEmailCampaigns", ids.scheduledQueued, { scheduledFunctionId });
    });

    const failed = await t.mutation(
      internal.mailchimp.internal.mutations.failStuckPostEmailCampaigns,
      {},
    );

    expect(failed).toBe(3);
    const status = async (id: Id<"postEmailCampaigns">) => (await getCampaign(t, id))?.status;
    expect(await status(ids.stuckCreating)).toBe("failed");
    expect(await status(ids.stuckSending)).toBe("failed");
    expect((await getCampaign(t, ids.stuckSending))?.error).toContain("MAY have gone out");
    expect(await status(ids.busy)).toBe("content_set");
    expect(await status(ids.orphanedQueued)).toBe("failed");
    expect(await status(ids.scheduledQueued)).toBe("queued");
    expect(await status(ids.sent)).toBe("sent");
  });
});
