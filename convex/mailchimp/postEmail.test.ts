import { convexTest } from "convex-test";
import { register as registerRag } from "@convex-dev/rag/test";
import { INDEXNOW_KEY } from "../seo/indexNow";
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

vi.mock("@convex-dev/ai-sdk-provider", () => ({
  convexGateway: Object.assign(() => ({}), {
    embeddingModel: () => ({ modelId: "test-embedding", provider: "test" }),
  }),
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
const mockFetch = ({
  postStatus = 200,
  failSend = false,
  mailchimpStatus = "save",
  /** Other post URLs and what the site answers for them (default: postStatus). */
  otherPosts = {} as Record<string, number | "error">,
} = {}) => {
  const calls: { url: string; method: string; body?: string }[] = [];
  vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    // The live check adds a unique ?live-check= to get past Cloudflare's cache; leave it out so
    // the requests read the same every run.
    const url = String(input).replace(/\?live-check=\d+$/, "");
    const method = init?.method ?? "GET";
    calls.push({ url, method, body: init?.body ? String(init.body) : undefined });

    const other = otherPosts[url.replace("https://mikecann.blog/posts/", "")];
    if (other === "error") throw new TypeError("fetch failed");
    if (url.startsWith("https://mikecann.blog/posts/")) {
      const status = other ?? postStatus;
      // Like fetch, a redirect that's followed answers with the page at the other end
      if (status >= 300 && status < 400 && init?.redirect !== "manual")
        return new Response("<html/>", { status: 200 });
      return new Response(null, { status });
    }
    if (url.startsWith("https://api.indexnow.org/")) return new Response(null, { status: 200 });
    if (url.endsWith("/campaigns") && method === "POST")
      return Response.json({ id: "mc-campaign-1" });
    if (url.endsWith("/content") && method === "PUT") return Response.json({});
    if (/\/campaigns\/[^/]+$/.test(url) && method === "GET")
      return Response.json({ id: url.split("/").pop(), status: mailchimpStatus });
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
      `GET https://api.indexnow.org/indexnow?url=${encodeURIComponent(POST_URL)}&key=${INDEXNOW_KEY}`,
      "POST https://us3.api.mailchimp.com/3.0/campaigns",
      "PUT https://us3.api.mailchimp.com/3.0/campaigns/mc-campaign-1/content",
      "POST https://us3.api.mailchimp.com/3.0/campaigns/mc-campaign-1/actions/send",
    ]);
    const html = JSON.parse(calls[3].body!).html as string;
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

    // No second campaign is created in Mailchimp; the retry asks about the first one, then sends it
    expect(calls.some((c) => c.url.endsWith("/campaigns") && c.method === "POST")).toBe(false);
    expect(calls).toContainEqual(
      expect.objectContaining({
        method: "GET",
        url: "https://us3.api.mailchimp.com/3.0/campaigns/mc-campaign-1",
      }),
    );
    expect(await getCampaign(t, campaignId)).toMatchObject({ status: "sent", attempts: 2 });
  });

  test("a retry of a campaign Mailchimp already sent records it as sent, without sending again", async () => {
    // The run before died after Mailchimp accepted the send but before it was recorded
    const t = setup();
    const calls = mockFetch({ mailchimpStatus: "sent" });
    const campaignId = await insertCampaign(t, { mailchimpCampaignId: "mc-campaign-1" });

    await send(t, campaignId);

    expect(calls.map((c) => `${c.method} ${c.url}`)).toEqual([
      `GET ${POST_URL}`,
      "GET https://us3.api.mailchimp.com/3.0/campaigns/mc-campaign-1",
    ]);
    expect(await getCampaign(t, campaignId)).toMatchObject({ status: "sent", sentAt: NOW });
  });
});

describe("a renamed post", () => {
  const RENAMED_URL = "https://mikecann.blog/posts/my-new-post";

  /** An email that already went out about a post whose slug has since been renamed away. */
  const insertEarlierEmail = async (
    t: TestConvex,
    overrides: Partial<Campaign> = {},
    { postStillExists = false } = {},
  ) => {
    const id = await insertCampaign(t, {
      slug: "my-old-slug",
      status: "sent",
      mailchimpCampaignId: "mc-earlier",
      sentAt: NOW - HOUR,
      postDate: NOW - 2 * HOUR,
      ...overrides,
    });
    if (!postStillExists)
      await t.run(async (ctx) => {
        const campaign = await ctx.db.get("postEmailCampaigns", id);
        await ctx.db.delete("blogPosts", campaign!.postId);
      });
    return id;
  };

  const mailchimpCalls = (calls: { url: string }[]) =>
    calls.filter((c) => c.url.includes("api.mailchimp.com"));

  test("isn't emailed again under its new slug", async () => {
    const t = setup();
    const calls = mockFetch();
    await insertEarlierEmail(t);
    const campaignId = await insertCampaign(t, { postDate: NOW - 2 * HOUR });

    await send(t, campaignId);

    expect(mailchimpCalls(calls)).toEqual([]);
    const campaign = await getCampaign(t, campaignId);
    expect(campaign).toMatchObject({ status: "skipped", attempts: 0 });
    expect(campaign?.error).toContain("'my-old-slug'");
    expect(calls.map((c) => c.url)).toEqual([RENAMED_URL]);
  });

  test("is recognised by its date when the rename changed its title too", async () => {
    const t = setup();
    const calls = mockFetch();
    await insertEarlierEmail(t, { title: "My Old Title" });
    const campaignId = await insertCampaign(t, { postDate: NOW - 2 * HOUR });

    await send(t, campaignId);

    expect(mailchimpCalls(calls)).toEqual([]);
    expect(await getCampaign(t, campaignId)).toMatchObject({ status: "skipped" });
  });

  test("a different post with the same title, still on the blog, is emailed", async () => {
    const t = setup();
    const calls = mockFetch();
    await insertEarlierEmail(t, {}, { postStillExists: true });
    const campaignId = await insertCampaign(t, { postDate: NOW - 2 * HOUR });

    await send(t, campaignId);

    expect(await getCampaign(t, campaignId)).toMatchObject({ status: "sent" });
    expect(mailchimpCalls(calls).some((c) => c.url.endsWith("/actions/send"))).toBe(true);
  });

  test("is emailed if the old slug's email never went out", async () => {
    const t = setup();
    mockFetch();
    await insertEarlierEmail(t, {
      status: "failed",
      error: "Not sent: the post was removed",
      mailchimpCampaignId: undefined,
      sentAt: undefined,
    });
    const campaignId = await insertCampaign(t, { postDate: NOW - 2 * HOUR });

    await send(t, campaignId);

    expect(await getCampaign(t, campaignId)).toMatchObject({ status: "sent" });
  });

  test("isn't emailed again when the old slug's send failed after reaching Mailchimp", async () => {
    // Mailchimp may have accepted the send and the response timed out
    const t = setup();
    const calls = mockFetch();
    await insertEarlierEmail(t, { status: "failed", error: "fetch failed", sentAt: undefined });
    const campaignId = await insertCampaign(t, { postDate: NOW - 2 * HOUR });

    await send(t, campaignId);

    expect(mailchimpCalls(calls)).toEqual([]);
    expect(await getCampaign(t, campaignId)).toMatchObject({ status: "skipped" });
  });

  test("isn't emailed again when the deploy didn't prune the old slug but the site dropped it", async () => {
    // The prune safety limit refused, or the upload died between the upsert and the prune
    for (const oldSlugAnswer of [404, 301]) {
      const t = setup();
      const calls = mockFetch({ otherPosts: { "my-old-slug": oldSlugAnswer } });
      await insertEarlierEmail(t, {}, { postStillExists: true });
      const campaignId = await insertCampaign(t, { postDate: NOW - 2 * HOUR });

      await send(t, campaignId);

      expect(mailchimpCalls(calls)).toEqual([]);
      expect(await getCampaign(t, campaignId)).toMatchObject({ status: "skipped" });
      vi.restoreAllMocks();
    }
  });

  test("waits rather than sending when the site can't say whether the old slug is still there", async () => {
    const t = setup();
    const calls = mockFetch({ otherPosts: { "my-old-slug": "error" } });
    await insertEarlierEmail(t, {}, { postStillExists: true });
    const campaignId = await insertCampaign(t, { postDate: NOW - 2 * HOUR });

    await send(t, campaignId);

    expect(mailchimpCalls(calls)).toEqual([]);
    expect(await getCampaign(t, campaignId)).toMatchObject({
      status: "queued",
      liveCheckAttempts: 1,
    });
  });

  test("isn't emailed again while the old slug's uncertain send is being retried", async () => {
    // The old slug's send may have gone out, it was renamed, and an admin retried the old one
    const t = setup();
    const calls = mockFetch();
    await insertEarlierEmail(t, { status: "queued", sentAt: undefined });
    const campaignId = await insertCampaign(t, { postDate: NOW - 2 * HOUR });

    await send(t, campaignId);

    expect(mailchimpCalls(calls)).toEqual([]);
    expect(await getCampaign(t, campaignId)).toMatchObject({ status: "skipped" });
  });

  test("a retry of the old slug's email, after the renamed post's went out, doesn't send", async () => {
    // The rename came before the old slug's email went out, so it was cancelled. An admin
    // retrying it later must not email about the same post again (its URL may redirect to the
    // new slug, so the live check passes).
    const t = setup();
    const calls = mockFetch();
    const oldEmail = await insertEarlierEmail(t, {
      status: "failed",
      error: "Not sent: the post was removed before its email went out",
      mailchimpCampaignId: undefined,
      sentAt: undefined,
    });
    const newEmail = await insertCampaign(t, { postDate: NOW - 2 * HOUR });
    await send(t, newEmail);
    expect(await getCampaign(t, newEmail)).toMatchObject({ status: "sent" });

    await t.mutation(api.mailchimp.admin.mutations.retryFailedPostEmailCampaign, {
      token,
      slug: "my-old-slug",
    });
    await vi.runOnlyPendingTimersAsync();
    await t.finishInProgressScheduledFunctions();

    expect(calls.filter((c) => c.url.endsWith("/actions/send"))).toHaveLength(1);
    expect(await getCampaign(t, oldEmail)).toMatchObject({
      status: "failed",
      error: expect.stringContaining("removed"),
    });
  });

  test("a retry of the old slug's email doesn't send when its URL now redirects to the new one", async () => {
    // As above, but the upload stopped before pruning the old slug, so its post row is still there
    const t = setup();
    const calls = mockFetch({ otherPosts: { "my-old-slug": 301 } });
    const oldEmail = await insertEarlierEmail(
      t,
      { status: "failed", error: "boom", mailchimpCampaignId: undefined, sentAt: undefined },
      { postStillExists: true },
    );
    const newEmail = await insertCampaign(t, { postDate: NOW - 2 * HOUR });
    await send(t, newEmail);
    expect(await getCampaign(t, newEmail)).toMatchObject({ status: "sent" });

    await t.mutation(api.mailchimp.admin.mutations.retryFailedPostEmailCampaign, {
      token,
      slug: "my-old-slug",
    });
    await vi.runOnlyPendingTimersAsync();
    await t.finishInProgressScheduledFunctions();

    expect(calls.filter((c) => c.url.endsWith("/actions/send"))).toHaveLength(1);
    expect(await getCampaign(t, oldEmail)).toMatchObject({
      status: "queued",
      liveCheckAttempts: 1,
    });
  });

  test("two renames in a row, each changing one of title and date, still send one email", async () => {
    const t = setup();
    const calls = mockFetch();
    // A (title T1, date D1) was emailed, then renamed to B with title T2: B is held back
    await insertEarlierEmail(t, { title: "T1", postDate: 1 });
    vi.setSystemTime(NOW + HOUR);
    const b = await insertCampaign(t, { slug: "b", title: "T2", postDate: 1 });
    await send(t, b);
    expect(await getCampaign(t, b)).toMatchObject({ status: "skipped" });

    // Then B is renamed to C with date D2: C only matches B
    await t.run(async (ctx) => {
      const campaign = await ctx.db.get("postEmailCampaigns", b);
      await ctx.db.delete("blogPosts", campaign!.postId);
    });
    vi.setSystemTime(NOW + 2 * HOUR);
    const c = await insertCampaign(t, { slug: "c", title: "T2", postDate: 2 });
    await send(t, c);

    expect(mailchimpCalls(calls)).toEqual([]);
    expect(await getCampaign(t, c)).toMatchObject({ status: "skipped" });
  });

  test("an email more than 30 days earlier doesn't count", async () => {
    const t = setup();
    mockFetch();
    vi.setSystemTime(NOW - 31 * 24 * HOUR);
    await insertEarlierEmail(t);
    vi.setSystemTime(NOW);
    const campaignId = await insertCampaign(t, { postDate: NOW - 2 * HOUR });

    await send(t, campaignId);

    expect(await getCampaign(t, campaignId)).toMatchObject({ status: "sent" });
  });

  test("an admin can still send it, if it really is a different post", async () => {
    const t = setup();
    mockFetch();
    await insertEarlierEmail(t);
    const campaignId = await insertCampaign(t, { postDate: NOW - 2 * HOUR });
    await send(t, campaignId);
    expect(await getCampaign(t, campaignId)).toMatchObject({ status: "skipped" });

    await t.mutation(api.mailchimp.admin.mutations.retryFailedPostEmailCampaign, {
      token,
      slug: "my-new-post",
      allowEarlierEmail: true,
    });
    await vi.runOnlyPendingTimersAsync();
    await t.finishInProgressScheduledFunctions();

    expect(await getCampaign(t, campaignId)).toMatchObject({ status: "sent" });
  });

  test("end to end: a deploy that renames a sent post's folder sends one email, not two", async () => {
    const t = setup();
    registerRag(t);
    const calls = mockFetch();
    const upsert = (slug: string, uploadRunId: string) =>
      t.mutation(internal.blogPosts.internal.mutations.upsertBlogPost, {
        slug,
        title: "My New Post",
        hash: "hash",
        ragEntryId: "entry" as EntryId,
        date: NOW - HOUR,
        uploadRunId,
      });
    const sends = () => calls.filter((c) => c.url.endsWith("/actions/send")).length;
    const campaignFor = (slug: string) =>
      t.run((ctx) =>
        ctx.db
          .query("postEmailCampaigns")
          .withIndex("by_slug", (q) => q.eq("slug", slug))
          .unique(),
      );

    // The first deploy publishes the post, and its email goes out
    expect((await upsert("my-old-slug", "run-1")).email.kind).toBe("queued");
    await send(t, (await campaignFor("my-old-slug"))!._id);
    expect(sends()).toBe(1);

    // The next deploy has the folder renamed: the upload creates the new slug, then prunes the old
    expect((await upsert("my-new-post", "run-2")).email.kind).toBe("queued");
    await t.mutation(api.blogPosts.admin.mutations.pruneRemovedPosts, {
      token,
      slugs: ["my-new-post"],
      force: false,
    });

    // 30 minutes later the new slug's send runs
    await send(t, (await campaignFor("my-new-post"))!._id);

    expect(sends()).toBe(1);
    expect(await campaignFor("my-new-post")).toMatchObject({ status: "skipped" });
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
    expect((await getCampaign(t, ids.stuckSending))?.error).toContain("Safe to retry");
    expect(await status(ids.busy)).toBe("content_set");
    expect(await status(ids.orphanedQueued)).toBe("failed");
    expect(await status(ids.scheduledQueued)).toBe("queued");
    expect(await status(ids.sent)).toBe("sent");
  });
});

describe("recordMissingPostDates", () => {
  test("fills in the post date only where it's missing", async () => {
    const t = setup();
    const old = await insertCampaign(t, { slug: "old-post", status: "sent" });
    const recorded = await insertCampaign(t, { slug: "new-post", postDate: 5 });

    const updated = await t.mutation(internal.mailchimp.internal.mutations.recordMissingPostDates, {
      posts: [
        { slug: "old-post", postDate: 7 },
        { slug: "new-post", postDate: 9 },
      ],
    });

    expect(updated).toEqual(["old-post"]);
    expect((await getCampaign(t, old))?.postDate).toBe(7);
    expect((await getCampaign(t, recorded))?.postDate).toBe(5);
  });
});

describe("the post email machine's state, beside status (widen)", () => {
  test("a send keeps state in step with status at every step", async () => {
    const t = setup();
    mockFetch();
    const { email } = await t.mutation(internal.blogPosts.internal.mutations.upsertBlogPost, {
      slug: "my-new-post",
      title: "My New Post",
      hash: "hash",
      ragEntryId: "entry" as EntryId,
      date: NOW - HOUR,
      uploadRunId: "run-1",
    });
    expect(email.kind).toBe("queued");
    const [queued] = await t.run((ctx) => ctx.db.query("postEmailCampaigns").collect());
    expect(queued.state).toEqual({
      kind: "queued",
      sendAt: NOW + 30 * 60 * 1000,
      liveChecks: 0,
      skipLiveCheck: false,
      allowEarlierEmail: false,
    });
    expect(queued.stateTimers).toEqual([]);

    await send(t, queued._id);

    expect((await getCampaign(t, queued._id))?.state).toEqual({
      kind: "sent",
      sentAt: NOW,
      mailchimpCampaignId: "mc-campaign-1",
    });
  });

  test("a failed send and a skipped rename have their reasons in state", async () => {
    const t = setup();
    mockFetch({ failSend: true });
    const failing = await insertCampaign(t);
    await expect(send(t, failing)).rejects.toThrow();
    expect((await getCampaign(t, failing))?.state).toMatchObject({
      kind: "failed",
      error: expect.stringContaining("not ready to send"),
      mailchimpCampaignId: "mc-campaign-1",
    });
  });

  test("the backfill gives old rows the state their status stands for, and changes nothing twice", async () => {
    const t = setup();
    const ids = [
      await insertCampaign(t, {
        status: "sent",
        sentAt: NOW - HOUR,
        mailchimpCampaignId: "mc-1",
      }),
      await insertCampaign(t, { status: "failed", error: "boom" }),
      await insertCampaign(t, { status: "skipped", error: "Not sent: cap" }),
      await insertCampaign(t, { status: "sending", mailchimpCampaignId: "mc-2" }),
    ];

    await t.mutation(internal.mailchimp.internal.migrations.backfillPostEmailState, {});
    const states = async () =>
      Promise.all(ids.map(async (id) => (await getCampaign(t, id))?.state));
    const first = await states();
    expect(first).toEqual([
      { kind: "sent", sentAt: NOW - HOUR, mailchimpCampaignId: "mc-1" },
      { kind: "failed", error: "boom" },
      { kind: "skipped", reason: "Not sent: cap" },
      { kind: "sending", mailchimpCampaignId: "mc-2" },
    ]);

    await t.mutation(internal.mailchimp.internal.migrations.backfillPostEmailState, {});
    expect(await states()).toEqual(first);
    expect(await t.query(internal.mailchimp.internal.migrations.postEmailStateCounts, {})).toEqual({
      "sent -> sent": 1,
      "failed -> failed": 1,
      "skipped -> skipped": 1,
      "sending -> sending": 1,
    });
  });
});
