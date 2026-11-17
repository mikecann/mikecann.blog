import { convexTest } from "convex-test";
import { register as registerRag } from "@convex-dev/rag/test";
import { register } from "@convex-dev/state-machines/test";
import { INDEXNOW_KEY } from "../seo/indexNow";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { EntryId } from "@convex-dev/rag";
import { api, internal } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";
import schema from "../schema";
import { modules } from "../test.setup";
import type { PostEmailState } from "./campaignState";
import {
  POST_EMAIL_IN_PROGRESS_STUCK_AFTER_MS,
  POST_LIVE_CHECK_MAX_ATTEMPTS,
  POST_LIVE_CHECK_RETRY_DELAY_MS,
} from "./constants";
import { PRODUCTION_CONVEX_CLOUD_URL } from "./lib";
import { insertCampaignRow } from "./postEmail.testkit";

// The post email machine (machine.ts) as the send action, the delivery check, the admin
// mutations and the timers drive it. Mailchimp and the blog are faked with fetch.

const setup = () => {
  const t = convexTest(schema, modules);
  register(t);
  return t;
};
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
const MAILCHIMP = "https://us3.api.mailchimp.com/3.0";

type Campaign = Doc<"postEmailCampaigns">;
type CampaignId = Id<"postEmailCampaigns">;

/** The state a campaign is in once its SEND_DUE has fired and the send action is running. */
const checkingLive = (
  overrides: Partial<Extract<PostEmailState, { kind: "checkingLive" }>> = {},
): PostEmailState => ({
  kind: "checkingLive",
  liveChecks: 0,
  skipLiveCheck: false,
  allowEarlierEmail: false,
  ...overrides,
});

/** A post and its campaign, in `checkingLive` unless the overrides say otherwise. */
const insertCampaign = (
  t: TestConvex,
  overrides: Partial<Campaign> = {},
  { postExists = true } = {},
) =>
  t.run(async (ctx) => {
    const postId = await ctx.db.insert("blogPosts", {
      slug: overrides.slug ?? "my-new-post",
      title: overrides.title ?? "My $& <New> Post",
      hash: "hash",
      ragEntryId: "entry" as EntryId,
    });
    if (!postExists) await ctx.db.delete("blogPosts", postId);
    return await insertCampaignRow(ctx, {
      postId,
      slug: "my-new-post",
      title: "My $& <New> Post",
      attempts: 0,
      createdAt: NOW,
      updatedAt: NOW,
      state: checkingLive(),
      ...overrides,
    });
  });

const getCampaign = async (t: TestConvex, id: CampaignId) => {
  const campaign = await t.run((ctx) => ctx.db.get("postEmailCampaigns", id));
  if (!campaign) throw new Error("Expected the campaign");
  return campaign;
};

const send = (t: TestConvex, campaignId: CampaignId) =>
  t.action(internal.mailchimp.internal.actions.sendNewPostCampaign, { campaignId });

const retry = (t: TestConvex, slug: string, options: Record<string, boolean> = {}) =>
  t.mutation(api.mailchimp.admin.mutations.retryFailedPostEmailCampaign, {
    token,
    slug,
    ...options,
  });

/** Moves the clock on, running every job and timer due on the way. */
const advance = async (t: TestConvex, ms: number) => {
  await vi.advanceTimersByTimeAsync(ms);
  // A job a step schedules (the send action, from a timer's step) starts on the next tick
  for (let round = 0; round < 6; round += 1) {
    await t.finishInProgressScheduledFunctions();
    await vi.advanceTimersByTimeAsync(1);
  }
};

/** Fakes the blog and the Mailchimp API; returns the list of requests made. */
const mockFetch = ({
  /** What the site answers for the post (can be changed later through `site`). */
  postStatus = 200,
  failContent = false,
  failSend = false,
  mailchimpStatus = "save",
  /** Other post URLs and what the site answers for them (default: postStatus). */
  otherPosts = {} as Record<string, number | "error">,
} = {}) => {
  const site = { postStatus, mailchimpStatus };
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
      const status = other ?? site.postStatus;
      // Like fetch, a redirect that's followed answers with the page at the other end
      if (status >= 300 && status < 400 && init?.redirect !== "manual")
        return new Response("<html/>", { status: 200 });
      return new Response(null, { status });
    }
    if (url.startsWith("https://api.indexnow.org/")) return new Response(null, { status: 200 });
    if (url.endsWith("/campaigns") && method === "POST")
      return Response.json({ id: "mc-campaign-1" });
    if (url.endsWith("/content") && method === "PUT")
      return failContent ? new Response("Content rejected", { status: 400 }) : Response.json({});
    if (/\/campaigns\/[^/]+$/.test(url) && method === "GET")
      return Response.json({ id: url.split("/").pop(), status: site.mailchimpStatus });
    if (url.endsWith("/actions/send") && method === "POST")
      return failSend
        ? new Response("Your Campaign is not ready to send", { status: 400 })
        : new Response(null, { status: 204 });
    throw new Error(`Unexpected fetch: ${method} ${url}`);
  });
  return Object.assign(calls, { site });
};

const mailchimpCalls = (calls: { url: string; method: string }[]) =>
  calls.filter((c) => c.url.startsWith(MAILCHIMP)).map((c) => `${c.method} ${c.url}`);
const sends = (calls: { url: string }[]) =>
  calls.filter((c) => c.url.endsWith("/actions/send")).length;

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

describe("sending", () => {
  test("checks the post is live, then creates, fills and sends the campaign", async () => {
    const t = setup();
    const calls = mockFetch();
    const campaignId = await insertCampaign(t);

    await send(t, campaignId);

    expect(calls.map((c) => `${c.method} ${c.url}`)).toEqual([
      `GET ${POST_URL}`,
      `GET https://api.indexnow.org/indexnow?url=${encodeURIComponent(POST_URL)}&key=${INDEXNOW_KEY}`,
      `POST ${MAILCHIMP}/campaigns`,
      `PUT ${MAILCHIMP}/campaigns/mc-campaign-1/content`,
      `POST ${MAILCHIMP}/campaigns/mc-campaign-1/actions/send`,
    ]);
    const html = JSON.parse(calls[3].body!).html as string;
    expect(html).toContain(">My $&amp; &lt;New&gt; Post</a>");
    expect(html).not.toContain("{{POST_TITLE}}");

    expect(await getCampaign(t, campaignId)).toMatchObject({
      attempts: 1,
      state: { kind: "sent", sentAt: NOW, mailchimpCampaignId: "mc-campaign-1" },
      stateTimers: [],
    });
  });

  test("a queued email sends when its time comes", async () => {
    const t = setup();
    const calls = mockFetch();
    const campaignId = await insertCampaign(t, {
      state: {
        kind: "queued",
        sendAt: NOW + 30 * 60 * 1000,
        liveChecks: 0,
        skipLiveCheck: false,
        allowEarlierEmail: false,
      },
    });
    await t.mutation(internal.mailchimp.internal.migrations.armPostEmailTimers, {});

    await advance(t, 30 * 60 * 1000 - 100);
    expect(calls).toHaveLength(0);
    await advance(t, 100);

    expect((await getCampaign(t, campaignId)).state.kind).toBe("sent");
    expect(sends(calls)).toBe(1);
  });

  test("waits and checks again while the post is not live yet", async () => {
    const t = setup();
    const calls = mockFetch({ postStatus: 404 });
    const campaignId = await insertCampaign(t);

    await send(t, campaignId);

    expect(calls).toHaveLength(1);
    const campaign = await getCampaign(t, campaignId);
    expect(campaign).toMatchObject({
      attempts: 0,
      state: { kind: "queued", liveChecks: 1, sendAt: NOW + POST_LIVE_CHECK_RETRY_DELAY_MS },
    });
    expect(campaign.stateTimers).toMatchObject([
      { event: "SEND_DUE", dueAt: NOW + POST_LIVE_CHECK_RETRY_DELAY_MS },
    ]);

    // Once the deploy is live the timer sends it
    calls.site.postStatus = 200;
    await advance(t, POST_LIVE_CHECK_RETRY_DELAY_MS);
    expect((await getCampaign(t, campaignId)).state.kind).toBe("sent");
  });

  test("gives up after the maximum number of live checks", async () => {
    const t = setup();
    mockFetch({ postStatus: 404 });
    const campaignId = await insertCampaign(t, {
      state: checkingLive({ liveChecks: POST_LIVE_CHECK_MAX_ATTEMPTS - 1 }),
    });

    await send(t, campaignId);

    expect(await getCampaign(t, campaignId)).toMatchObject({
      state: {
        kind: "failed",
        error: expect.stringContaining(`never went live: checked ${POST_LIVE_CHECK_MAX_ATTEMPTS}`),
      },
      stateTimers: [],
    });
  });

  test("a post URL that redirects has moved, so it isn't live", async () => {
    const t = setup();
    const calls = mockFetch({ postStatus: 301 });
    const campaignId = await insertCampaign(t);

    await send(t, campaignId);

    expect(mailchimpCalls(calls)).toEqual([]);
    expect((await getCampaign(t, campaignId)).state).toMatchObject({
      kind: "queued",
      liveChecks: 1,
    });
  });

  test("only one run can claim a campaign", async () => {
    const t = setup();
    const calls = mockFetch();
    const campaignId = await insertCampaign(t);

    await send(t, campaignId);
    await send(t, campaignId);

    expect(sends(calls)).toBe(1);
    expect((await getCampaign(t, campaignId)).attempts).toBe(1);
  });

  test("a send job from before the machine does nothing to a queued campaign", async () => {
    // Its timer sends it instead
    const t = setup();
    const calls = mockFetch();
    const campaignId = await insertCampaign(t, {
      state: {
        kind: "queued",
        sendAt: NOW + HOUR,
        liveChecks: 0,
        skipLiveCheck: false,
        allowEarlierEmail: false,
      },
    });

    await send(t, campaignId);

    expect(calls).toHaveLength(0);
    expect((await getCampaign(t, campaignId)).state.kind).toBe("queued");
  });

  test("never sends from a non-production deployment", async () => {
    const t = setup();
    process.env.CONVEX_CLOUD_URL = "https://some-dev-deployment.convex.cloud";
    const calls = mockFetch();
    const campaignId = await insertCampaign(t);

    await send(t, campaignId);

    expect(calls).toHaveLength(0);
    expect((await getCampaign(t, campaignId)).state).toMatchObject({
      kind: "failed",
      error: expect.stringContaining("not production"),
    });
  });

  test("fails before sending when Mailchimp errors, and a retry resumes the same campaign", async () => {
    const t = setup();
    mockFetch({ failContent: true });
    const campaignId = await insertCampaign(t);

    await expect(send(t, campaignId)).rejects.toThrow("Mailchimp API error 400");
    expect(await getCampaign(t, campaignId)).toMatchObject({
      state: {
        kind: "failed",
        mailchimpCampaignId: "mc-campaign-1",
        error: expect.stringContaining("Content rejected"),
      },
    });

    vi.restoreAllMocks();
    const calls = mockFetch();
    await retry(t, "my-new-post");
    await advance(t, 0);

    // No second campaign is created in Mailchimp; the retry asks about the first one, then sends it
    expect(mailchimpCalls(calls)).toEqual([
      `GET ${MAILCHIMP}/campaigns/mc-campaign-1`,
      `PUT ${MAILCHIMP}/campaigns/mc-campaign-1/content`,
      `POST ${MAILCHIMP}/campaigns/mc-campaign-1/actions/send`,
    ]);
    expect(await getCampaign(t, campaignId)).toMatchObject({
      attempts: 2,
    });
  });

  test("a send that errors is checked with Mailchimp: not sent means failed, and safe to retry", async () => {
    const t = setup();
    const calls = mockFetch({ failSend: true });
    const campaignId = await insertCampaign(t);

    await expect(send(t, campaignId)).rejects.toThrow("Mailchimp API error 400");
    expect((await getCampaign(t, campaignId)).state.kind).toBe("checkingDelivery");

    await advance(t, 0);

    expect(mailchimpCalls(calls).at(-1)).toBe(`GET ${MAILCHIMP}/campaigns/mc-campaign-1`);
    expect(await getCampaign(t, campaignId)).toMatchObject({
      state: {
        kind: "failed",
        mailchimpCampaignId: "mc-campaign-1",
        error: expect.stringContaining("not ready to send"),
      },
    });
  });

  test("a send that errors but went out anyway is recorded as sent", async () => {
    // e.g. the response timed out after Mailchimp accepted the send
    const t = setup();
    const calls = mockFetch({ failSend: true, mailchimpStatus: "sent" });
    const campaignId = await insertCampaign(t);

    await expect(send(t, campaignId)).rejects.toThrow();
    await advance(t, 0);

    expect((await getCampaign(t, campaignId)).state).toMatchObject({
      kind: "sent",
      mailchimpCampaignId: "mc-campaign-1",
    });
    expect(sends(calls)).toBe(1);
  });

  test("a retry of a campaign Mailchimp already sent records it as sent, without sending again", async () => {
    // The run before died after Mailchimp accepted the send but before it was recorded
    const t = setup();
    const calls = mockFetch({ mailchimpStatus: "sent" });
    const campaignId = await insertCampaign(t, {
      state: checkingLive({ mailchimpCampaignId: "mc-campaign-1" }),
    });

    await send(t, campaignId);

    expect(calls.map((c) => `${c.method} ${c.url}`)).toEqual([
      `GET ${POST_URL}`,
      `GET ${MAILCHIMP}/campaigns/mc-campaign-1`,
    ]);
    expect((await getCampaign(t, campaignId)).state).toEqual({
      kind: "sent",
      sentAt: NOW,
      mailchimpCampaignId: "mc-campaign-1",
    });
  });
});

describe("stuck campaigns", () => {
  test("one stuck creating its campaign fails after an hour, safe to retry", async () => {
    const t = setup();
    mockFetch();
    const campaignId = await insertCampaign(t, {
      state: { kind: "creatingCampaign", mailchimpCampaignId: "mc-1" },
    });
    await t.mutation(internal.mailchimp.internal.migrations.armPostEmailTimers, {});

    await advance(t, POST_EMAIL_IN_PROGRESS_STUCK_AFTER_MS - 100);
    expect((await getCampaign(t, campaignId)).state.kind).toBe("creatingCampaign");
    await advance(t, 100);

    expect((await getCampaign(t, campaignId)).state).toMatchObject({
      kind: "failed",
      error: expect.stringContaining("Safe to retry"),
      mailchimpCampaignId: "mc-1",
    });
  });

  test("one stuck mid-send asks Mailchimp whether it went out", async () => {
    const t = setup();
    const calls = mockFetch({ mailchimpStatus: "sent" });
    const campaignId = await insertCampaign(t, {
      state: { kind: "sending", mailchimpCampaignId: "mc-1" },
    });
    await t.mutation(internal.mailchimp.internal.migrations.armPostEmailTimers, {});

    await advance(t, POST_EMAIL_IN_PROGRESS_STUCK_AFTER_MS);

    expect(mailchimpCalls(calls)).toEqual([`GET ${MAILCHIMP}/campaigns/mc-1`]);
    expect((await getCampaign(t, campaignId)).state).toMatchObject({ kind: "sent" });
  });

  test("when Mailchimp can't be asked, it fails after an hour and a retry asks again", async () => {
    const t = setup();
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("fetch failed"));
    const campaignId = await insertCampaign(t, {
      state: { kind: "sending", mailchimpCampaignId: "mc-1" },
    });
    await t.mutation(internal.mailchimp.internal.migrations.armPostEmailTimers, {});

    await advance(t, POST_EMAIL_IN_PROGRESS_STUCK_AFTER_MS);
    expect((await getCampaign(t, campaignId)).state.kind).toBe("checkingDelivery");
    await advance(t, POST_EMAIL_IN_PROGRESS_STUCK_AFTER_MS);

    expect((await getCampaign(t, campaignId)).state).toMatchObject({
      kind: "failed",
      error: expect.stringContaining("a retry asks again"),
      mailchimpCampaignId: "mc-1",
    });
  });
});

describe("a renamed post", () => {
  /** An email that already went out about a post whose slug has since been renamed away. */
  const insertEarlierEmail = (
    t: TestConvex,
    state: PostEmailState = { kind: "sent", sentAt: NOW - HOUR, mailchimpCampaignId: "mc-earlier" },
    { postStillExists = false, title = "My $& <New> Post" } = {},
  ) =>
    insertCampaign(
      t,
      { slug: "my-old-slug", title, postDate: NOW - 2 * HOUR, state },
      { postExists: postStillExists },
    );

  /** The renamed post's own campaign, created after the earlier one, about to send. */
  const insertRenamed = (t: TestConvex, overrides: Partial<Campaign> = {}) =>
    insertCampaign(t, { postDate: NOW - 2 * HOUR, ...overrides });

  test("isn't emailed again under its new slug", async () => {
    const t = setup();
    const calls = mockFetch();
    const earlierId = await insertEarlierEmail(t);
    const campaignId = await insertRenamed(t);

    await send(t, campaignId);

    expect(mailchimpCalls(calls)).toEqual([]);
    expect(await getCampaign(t, campaignId)).toMatchObject({
      attempts: 0,
      state: { kind: "alreadyEmailed", earlierCampaignId: earlierId, earlierSlug: "my-old-slug" },
    });
  });

  test("is recognised by its date when the rename changed its title too", async () => {
    const t = setup();
    mockFetch();
    await insertEarlierEmail(t, undefined, { title: "My Old Title" });
    const campaignId = await insertRenamed(t);

    await send(t, campaignId);

    expect((await getCampaign(t, campaignId)).state.kind).toBe("alreadyEmailed");
  });

  test("a different post with the same title, still on the blog, is emailed", async () => {
    const t = setup();
    const calls = mockFetch();
    await insertEarlierEmail(t, undefined, { postStillExists: true });
    const campaignId = await insertRenamed(t);

    await send(t, campaignId);

    expect((await getCampaign(t, campaignId)).state.kind).toBe("sent");
    expect(sends(calls)).toBe(1);
  });

  test("is emailed if the old slug's email never reached Mailchimp", async () => {
    const t = setup();
    mockFetch();
    await insertEarlierEmail(t, { kind: "cancelled", reason: "Not sent: the post was removed" });
    const campaignId = await insertRenamed(t);

    await send(t, campaignId);

    expect((await getCampaign(t, campaignId)).state.kind).toBe("sent");
  });

  test.each([
    [
      "failed after reaching Mailchimp",
      { kind: "failed", error: "fetch failed", mailchimpCampaignId: "mc-earlier" },
    ],
    [
      "queued again by a retry, with its Mailchimp campaign",
      {
        kind: "queued",
        sendAt: NOW + HOUR,
        liveChecks: 0,
        skipLiveCheck: false,
        allowEarlierEmail: false,
        mailchimpCampaignId: "mc-earlier",
      },
    ],
    [
      "unsure whether it went out",
      { kind: "checkingDelivery", mailchimpCampaignId: "mc-earlier", error: "timeout" },
    ],
  ] as [string, PostEmailState][])(
    "isn't emailed again when the old slug's email was %s",
    async (_, state) => {
      const t = setup();
      const calls = mockFetch();
      await insertEarlierEmail(t, state);
      const campaignId = await insertRenamed(t);

      await send(t, campaignId);

      expect(mailchimpCalls(calls)).toEqual([]);
      expect((await getCampaign(t, campaignId)).state.kind).toBe("alreadyEmailed");
    },
  );

  test.each([404, 301])(
    "isn't emailed again when the prune missed the old slug but the site answers %i for it",
    async (oldSlugAnswer) => {
      // The prune safety limit refused, or the upload died between the upsert and the prune
      const t = setup();
      const calls = mockFetch({ otherPosts: { "my-old-slug": oldSlugAnswer } });
      await insertEarlierEmail(t, undefined, { postStillExists: true });
      const campaignId = await insertRenamed(t);

      await send(t, campaignId);

      expect(mailchimpCalls(calls)).toEqual([]);
      expect((await getCampaign(t, campaignId)).state.kind).toBe("alreadyEmailed");
    },
  );

  test("waits rather than sending when the site can't say whether the old slug is still there", async () => {
    const t = setup();
    const calls = mockFetch({ otherPosts: { "my-old-slug": "error" } });
    await insertEarlierEmail(t, undefined, { postStillExists: true });
    const campaignId = await insertRenamed(t);

    await send(t, campaignId);

    expect(mailchimpCalls(calls)).toEqual([]);
    expect((await getCampaign(t, campaignId)).state).toMatchObject({
      kind: "queued",
      liveChecks: 1,
    });
  });

  test("two renames in a row, each changing one of title and date, still send one email", async () => {
    const t = setup();
    const calls = mockFetch();
    // A (title T1, date D1) was emailed, then renamed to B with title T2: B is held back
    await insertCampaign(
      t,
      { slug: "a", title: "T1", postDate: 1, state: { kind: "sent", sentAt: NOW } },
      { postExists: false },
    );
    vi.setSystemTime(NOW + HOUR);
    const b = await insertCampaign(t, { slug: "b", title: "T2", postDate: 1 });
    await send(t, b);
    expect((await getCampaign(t, b)).state.kind).toBe("alreadyEmailed");

    // Then B is renamed to C with date D2: C only matches B
    await t.run(async (ctx) => {
      const campaign = await ctx.db.get("postEmailCampaigns", b);
      await ctx.db.delete("blogPosts", campaign!.postId);
    });
    vi.setSystemTime(NOW + 2 * HOUR);
    const c = await insertCampaign(t, { slug: "c", title: "T2", postDate: 2 });
    await send(t, c);

    expect(mailchimpCalls(calls)).toEqual([]);
    expect((await getCampaign(t, c)).state).toMatchObject({
      kind: "alreadyEmailed",
      earlierSlug: "b",
    });
  });

  test("a retry cancelled by the rename still counts as maybe emailed", async () => {
    // A's send may have gone out, an admin retried it, and the rename's prune cancelled the retry
    const t = setup();
    const calls = mockFetch();
    await insertEarlierEmail(t, {
      kind: "cancelled",
      reason: "Not sent: the post was removed before its email went out",
      mailchimpCampaignId: "mc-earlier",
    });
    const campaignId = await insertRenamed(t);

    await send(t, campaignId);

    expect(mailchimpCalls(calls)).toHaveLength(0);
    expect((await getCampaign(t, campaignId)).state.kind).toBe("alreadyEmailed");
  });

  test("the prune keeps a cancelled retry's Mailchimp campaign", async () => {
    const t = setup();
    registerRag(t);
    const campaignId = await insertCampaign(t, {
      state: {
        kind: "queued",
        sendAt: NOW + HOUR,
        liveChecks: 0,
        skipLiveCheck: false,
        allowEarlierEmail: false,
        mailchimpCampaignId: "mc-1",
      },
    });

    await t.mutation(api.blogPosts.admin.mutations.pruneRemovedPosts, {
      token,
      slugs: [],
      force: true,
    });

    expect((await getCampaign(t, campaignId)).state).toMatchObject({
      kind: "cancelled",
      mailchimpCampaignId: "mc-1",
    });
  });

  test.each([
    ["pruned", { pruned: true, site: 404 }],
    ["left by the prune but gone from the site", { pruned: false, site: 404 }],
  ] as const)(
    "a post renamed twice finds the first email, once the middle rename is %s",
    async (_, { pruned, site }) => {
      // A (T1, D1) emailed; renamed to B (T2, D1), held back; then B renamed to C (T1, D2): C
      // matches only A, which B was matched to, but B's post is gone too
      const t = setup();
      const otherPosts: Record<string, number> = {};
      const calls = mockFetch({ otherPosts });
      const a = await insertCampaign(
        t,
        { slug: "a", title: "T1", postDate: 1, state: { kind: "sent", sentAt: NOW } },
        { postExists: false },
      );
      vi.setSystemTime(NOW + HOUR);
      const b = await insertCampaign(t, { slug: "b", title: "T2", postDate: 1 });
      await send(t, b);
      expect((await getCampaign(t, b)).state).toMatchObject({ earlierCampaignId: a });
      // B is renamed away: the site stops serving it
      otherPosts.b = site;
      if (pruned)
        await t.run(async (ctx) => {
          const campaign = await ctx.db.get("postEmailCampaigns", b);
          await ctx.db.delete("blogPosts", campaign!.postId);
        });

      vi.setSystemTime(NOW + 2 * HOUR);
      const c = await insertCampaign(t, { slug: "c", title: "T1", postDate: 2 });
      await send(t, c);

      expect(sends(calls)).toBe(0);
      expect((await getCampaign(t, c)).state).toMatchObject({
        kind: "alreadyEmailed",
        earlierCampaignId: a,
      });
    },
  );

  test("an email more than 30 days earlier doesn't count", async () => {
    const t = setup();
    mockFetch();
    vi.setSystemTime(NOW - 31 * 24 * HOUR);
    await insertEarlierEmail(t);
    vi.setSystemTime(NOW);
    const campaignId = await insertRenamed(t);

    await send(t, campaignId);

    expect((await getCampaign(t, campaignId)).state.kind).toBe("sent");
  });

  test("a third post that only shares the renamed post's date is still emailed", async () => {
    // Two posts dated the same day: the earlier email belongs to the renamed post, not this one
    const t = setup();
    mockFetch();
    const earlierId = await insertEarlierEmail(t);
    const renamed = await insertRenamed(t);
    await send(t, renamed);
    expect((await getCampaign(t, renamed)).state).toMatchObject({
      kind: "alreadyEmailed",
      earlierCampaignId: earlierId,
    });

    vi.setSystemTime(NOW + HOUR);
    const other = await insertCampaign(t, {
      slug: "another-post",
      title: "Another Post",
      postDate: NOW - 2 * HOUR,
    });
    await send(t, other);

    expect((await getCampaign(t, other)).state.kind).toBe("sent");
  });

  test("an admin can still send it, if it really is a different post", async () => {
    const t = setup();
    const calls = mockFetch();
    await insertEarlierEmail(t);
    const campaignId = await insertRenamed(t);
    await send(t, campaignId);
    expect((await getCampaign(t, campaignId)).state.kind).toBe("alreadyEmailed");

    await retry(t, "my-new-post", { allowEarlierEmail: true });
    await advance(t, 0);

    expect((await getCampaign(t, campaignId)).state.kind).toBe("sent");
    expect(sends(calls)).toBe(1);
  });

  test("a retry of the old slug's email, after the renamed post's went out, doesn't send", async () => {
    // The rename came before the old slug's email went out, so it was cancelled. Retrying it later
    // must not email about the same post again (its URL may redirect to the new slug).
    const t = setup();
    const calls = mockFetch();
    const oldEmail = await insertEarlierEmail(t, {
      kind: "cancelled",
      reason: "Not sent: the post was removed before its email went out",
    });
    const newEmail = await insertRenamed(t);
    await send(t, newEmail);
    expect((await getCampaign(t, newEmail)).state.kind).toBe("sent");

    await retry(t, "my-old-slug");
    await advance(t, 0);

    expect(sends(calls)).toBe(1);
    expect((await getCampaign(t, oldEmail)).state).toMatchObject({
      kind: "cancelled",
      reason: expect.stringContaining("removed"),
    });
  });

  test("a retry of the old slug's email doesn't send when its URL now redirects to the new one", async () => {
    // As above, but the upload stopped before pruning the old slug, so its post row is still there
    const t = setup();
    const calls = mockFetch({ otherPosts: { "my-old-slug": 301 } });
    const oldEmail = await insertEarlierEmail(
      t,
      { kind: "failed", error: "boom" },
      { postStillExists: true },
    );
    const newEmail = await insertRenamed(t);
    await send(t, newEmail);
    expect((await getCampaign(t, newEmail)).state.kind).toBe("sent");

    await retry(t, "my-old-slug");
    await advance(t, 0);

    expect(sends(calls)).toBe(1);
    expect((await getCampaign(t, oldEmail)).state).toMatchObject({ kind: "queued", liveChecks: 1 });
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
    const campaignFor = (slug: string) =>
      t.run((ctx) =>
        ctx.db
          .query("postEmailCampaigns")
          .withIndex("by_slug", (q) => q.eq("slug", slug))
          .unique(),
      );

    // The first deploy publishes the post, and its email goes out 30 minutes later
    expect((await upsert("my-old-slug", "run-1")).email.kind).toBe("queued");
    await advance(t, 30 * 60 * 1000);
    expect(sends(calls)).toBe(1);
    expect((await campaignFor("my-old-slug"))?.state.kind).toBe("sent");

    // The next deploy has the folder renamed: the upload creates the new slug, then prunes the old
    vi.setSystemTime(Date.now() + HOUR);
    expect((await upsert("my-new-post", "run-2")).email.kind).toBe("queued");
    await t.mutation(api.blogPosts.admin.mutations.pruneRemovedPosts, {
      token,
      slugs: ["my-new-post"],
      force: false,
    });

    // 30 minutes later the new slug's send runs
    await advance(t, 30 * 60 * 1000);

    expect(sends(calls)).toBe(1);
    expect((await campaignFor("my-new-post"))?.state).toMatchObject({
      kind: "alreadyEmailed",
      earlierSlug: "my-old-slug",
    });
  });
});

describe("retryFailedPostEmailCampaign", () => {
  test("re-queues a failed email and sends it now", async () => {
    const t = setup();
    const calls = mockFetch();
    const campaignId = await insertCampaign(t, {
      state: { kind: "failed", error: "boom" },
    });

    expect(await retry(t, "my-new-post")).toEqual({
      slug: "my-new-post",
      status: "queued",
      scheduled: true,
    });
    expect((await getCampaign(t, campaignId)).state).toEqual({
      kind: "queued",
      sendAt: NOW,
      liveChecks: 0,
      skipLiveCheck: false,
      allowEarlierEmail: false,
    });
    await advance(t, 0);

    expect((await getCampaign(t, campaignId)).state.kind).toBe("sent");
    expect(sends(calls)).toBe(1);
  });

  test("can skip the live check when asked to", async () => {
    const t = setup();
    const calls = mockFetch({ postStatus: 404 });
    await insertCampaign(t, { state: { kind: "skipped", reason: "cap" } });

    await retry(t, "my-new-post", { skipLiveCheck: true });
    await advance(t, 0);

    expect(calls.some((c) => c.url === POST_URL)).toBe(false);
    expect(sends(calls)).toBe(1);
  });

  test("leaves a sent campaign alone", async () => {
    const t = setup();
    await insertCampaign(t, { state: { kind: "sent", sentAt: NOW } });
    expect(await retry(t, "my-new-post")).toEqual({
      slug: "my-new-post",
      status: "sent",
      scheduled: false,
    });
  });

  test("refuses campaigns that are queued or in progress", async () => {
    const t = setup();
    await insertCampaign(t, {
      state: { kind: "sending", mailchimpCampaignId: "mc-1" },
    });
    await expect(retry(t, "my-new-post")).rejects.toThrow();
  });

  test("validates the admin token", async () => {
    const t = setup();
    await insertCampaign(t, { state: { kind: "failed", error: "boom" } });
    await expect(
      t.mutation(api.mailchimp.admin.mutations.retryFailedPostEmailCampaign, {
        token: "wrong",
        slug: "my-new-post",
      }),
    ).rejects.toThrow("Invalid token");
  });
});

describe("markPostEmailCampaignSent", () => {
  const mark = (t: TestConvex, mailchimpCampaignId: string) =>
    t.mutation(api.mailchimp.admin.mutations.markPostEmailCampaignSent, {
      token,
      slug: "my-new-post",
      mailchimpCampaignId,
    });

  test("marks the campaign sent when the Mailchimp id matches", async () => {
    const t = setup();
    const campaignId = await insertCampaign(t, {
      state: { kind: "failed", error: "boom", mailchimpCampaignId: "mc-1" },
    });

    await mark(t, "mc-1");

    expect(await getCampaign(t, campaignId)).toMatchObject({
      state: { kind: "sent", sentAt: NOW, mailchimpCampaignId: "mc-1" },
    });
  });

  test("refuses a different Mailchimp campaign", async () => {
    const t = setup();
    await insertCampaign(t, {
      state: { kind: "failed", error: "boom", mailchimpCampaignId: "mc-1" },
    });
    await expect(mark(t, "other")).rejects.toThrow("isn't this email's Mailchimp campaign");
  });
});

describe("recordMissingPostDates", () => {
  test("fills in the post date only where it's missing", async () => {
    const t = setup();
    const old = await insertCampaign(t, { slug: "old-post" });
    const recorded = await insertCampaign(t, { slug: "new-post", postDate: 5 });

    const updated = await t.mutation(internal.mailchimp.internal.mutations.recordMissingPostDates, {
      posts: [
        { slug: "old-post", postDate: 7 },
        { slug: "new-post", postDate: 9 },
      ],
    });

    expect(updated).toEqual(["old-post"]);
    expect((await getCampaign(t, old)).postDate).toBe(7);
    expect((await getCampaign(t, recorded)).postDate).toBe(5);
  });
});

describe("the switch", () => {
  test("arms the timers of rows the widen step left, once, and reads back by state", async () => {
    const t = setup();
    const queued = await insertCampaign(t, {
      slug: "queued",
      state: {
        kind: "queued",
        sendAt: NOW + HOUR,
        liveChecks: 0,
        skipLiveCheck: false,
        allowEarlierEmail: false,
      },
    });
    await insertCampaign(t, { slug: "sent", state: { kind: "sent", sentAt: NOW } });

    const armed = await t.mutation(internal.mailchimp.internal.migrations.armPostEmailTimers, {});
    expect(armed).toEqual([{ campaignId: queued, events: ["SEND_DUE"] }]);
    expect(await t.mutation(internal.mailchimp.internal.migrations.armPostEmailTimers, {})).toEqual(
      [],
    );
    expect(await t.query(internal.mailchimp.internal.migrations.postEmailStateCounts, {})).toEqual({
      queued: 1,
      sent: 1,
    });
  });
});
