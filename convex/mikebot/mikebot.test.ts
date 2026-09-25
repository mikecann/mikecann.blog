import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import agentTest from "@convex-dev/agent/test";
import rateLimiterTest from "@convex-dev/rate-limiter/test";
import { api, internal } from "../_generated/api";
import schema from "../schema";
import { MIKEBOT_LIMITS } from "./config";
import { sha256Hex } from "./sha256";
import { getUtcDayKey } from "./guards";
import { modules } from "../test.setup";

// Never talk to OpenAI from tests.
vi.mock("@ai-sdk/openai", () => ({
  openai: { responses: () => ({}), embedding: () => ({}) },
}));

const TOKEN_A = "a".repeat(64);
const TOKEN_B = "b".repeat(64);
const START = new Date("2026-09-25T10:00:00.000Z").getTime();

const setup = () => {
  const t = convexTest(schema, modules);
  agentTest.register(t);
  rateLimiterTest.register(t);
  return t;
};

const expectMikebotError = async (promise: Promise<unknown>, code: string) => {
  await expect(promise).rejects.toMatchObject({ data: { kind: "mikebot", code } });
};

const createUserWithThread = async (t: ReturnType<typeof setup>, token = TOKEN_A) => {
  await t.mutation(api.users.ensureAnonymousUser, { token });
  const threadId = await t.mutation(api.mikebot.mutations.createThreadForUser, { token });
  return threadId;
};

const send = (t: ReturnType<typeof setup>, threadId: string, message = "hi", token = TOKEN_A) =>
  t.mutation(api.mikebot.mutations.sendMessageToThreadFromUser, {
    token,
    threadId,
    message,
    currentUrl: "https://mikecann.blog/",
  });

// Lets the next message through the "one reply at a time" guard without
// running the (scheduled) LLM action.
const finishPendingReplies = (t: ReturnType<typeof setup>) =>
  t.run(async (ctx) => {
    for (const row of await ctx.db.query("mikebotPendingReplies").collect())
      await ctx.db.delete("mikebotPendingReplies", row._id);
  });

beforeEach(() => {
  // Fake timers stop the scheduled streamStory action from running; we move
  // the clock with setSystemTime, which does not fire timers.
  vi.useFakeTimers();
  vi.setSystemTime(START);
  delete process.env.MIKEBOT_DAILY_TOKEN_BUDGET;
});

afterEach(() => {
  vi.useRealTimers();
  delete process.env.MIKEBOT_DAILY_TOKEN_BUDGET;
});

describe("anonymous identity", () => {
  test("stores only the SHA-256 hash of the token, and is idempotent", async () => {
    const t = setup();
    await t.mutation(api.users.ensureAnonymousUser, { token: TOKEN_A });
    await t.mutation(api.users.ensureAnonymousUser, { token: TOKEN_A });

    const users = await t.run((ctx) => ctx.db.query("users").collect());
    expect(users).toHaveLength(1);
    expect(users[0].tokenHash).toBe(sha256Hex(TOKEN_A));
    expect(JSON.stringify(users)).not.toContain(TOKEN_A);
  });

  test("rejects malformed tokens", async () => {
    const t = setup();
    await expectMikebotError(
      t.mutation(api.users.ensureAnonymousUser, { token: "short" }),
      "invalid_token",
    );
  });

  test("functions refuse unknown tokens", async () => {
    const t = setup();
    await expectMikebotError(
      t.mutation(api.mikebot.mutations.createThreadForUser, { token: TOKEN_A }),
      "unknown_user",
    );
  });

  test("caps how many anonymous users can be created globally", async () => {
    const t = setup();
    const { capacity } = MIKEBOT_LIMITS.rateLimits.createAnonymousUserGlobal;
    for (let i = 0; i < capacity; i++)
      await t.mutation(api.users.ensureAnonymousUser, { token: `user${i}`.padEnd(64, "x") });

    await expectMikebotError(t.mutation(api.users.ensureAnonymousUser, { token: TOKEN_B }), "busy");
  });
});

describe("thread ownership", () => {
  test("only the owner's token can see, list, post to or delete a thread", async () => {
    const t = setup();
    const threadId = await createUserWithThread(t, TOKEN_A);
    await t.mutation(api.users.ensureAnonymousUser, { token: TOKEN_B });

    expect(
      await t.query(api.mikebot.queries.findThreadForUser, { token: TOKEN_A, threadId }),
    ).toMatchObject({ _id: threadId });
    expect(
      await t.query(api.mikebot.queries.findThreadForUser, { token: TOKEN_B, threadId }),
    ).toBeNull();

    await send(t, threadId, "hello from A");
    const listFor = (token: string) =>
      t.query(api.mikebot.queries.listMessagesForUserThread, {
        token,
        threadId,
        paginationOpts: { numItems: 10, cursor: null },
      });
    expect((await listFor(TOKEN_A)).page.length).toBeGreaterThan(0);
    expect((await listFor(TOKEN_B)).page).toEqual([]);

    await expectMikebotError(send(t, threadId, "hello from B", TOKEN_B), "thread_not_found");

    // Deleting someone else's thread is a no-op
    await t.mutation(api.mikebot.mutations.deleteThreadForUser, { token: TOKEN_B, threadId });
    expect(
      await t.query(api.mikebot.queries.findThreadForUser, { token: TOKEN_A, threadId }),
    ).not.toBeNull();

    await t.mutation(api.mikebot.mutations.deleteThreadForUser, { token: TOKEN_A, threadId });
    await t.finishAllScheduledFunctions(() => vi.runOnlyPendingTimers());
    expect(
      await t.query(api.mikebot.queries.findThreadForUser, { token: TOKEN_A, threadId }),
    ).toBeNull();
    expect(await t.run((ctx) => ctx.db.query("mikebotPendingReplies").collect())).toEqual([]);
  }, 20_000);

  test("garbage thread ids are treated as not found", async () => {
    const t = setup();
    await t.mutation(api.users.ensureAnonymousUser, { token: TOKEN_A });
    expect(
      await t.query(api.mikebot.queries.findThreadForUser, {
        token: TOKEN_A,
        threadId: "not-a-real-id",
      }),
    ).toBeNull();
  });
});

describe("sending messages", () => {
  test("saves the prompt with context, marks the reply pending and schedules it", async () => {
    const t = setup();
    const threadId = await createUserWithThread(t);
    await send(t, threadId, "  What does Mike do?  ");

    const pending = await t.run((ctx) => ctx.db.query("mikebotPendingReplies").collect());
    expect(pending).toMatchObject([{ threadId, startedAt: START }]);

    const scheduled = await t.run((ctx) => ctx.db.system.query("_scheduled_functions").collect());
    expect(scheduled.map((s) => s.name)).toContain("mikebot/internal/actions:streamStory");

    const { page } = await t.query(api.mikebot.queries.listMessagesForUserThread, {
      token: TOKEN_A,
      threadId,
      paginationOpts: { numItems: 10, cursor: null },
    });
    expect(JSON.parse(page[0].text)).toEqual({
      context: { currentUrl: "https://mikecann.blog/" },
      message: "What does Mike do?",
    });
  });

  test("rejects empty and overly long messages", async () => {
    const t = setup();
    const threadId = await createUserWithThread(t);
    await expectMikebotError(send(t, threadId, "   "), "empty_message");
    await expectMikebotError(
      send(t, threadId, "x".repeat(MIKEBOT_LIMITS.maxMessageLength + 1)),
      "message_too_long",
    );
    await send(t, threadId, "x".repeat(MIKEBOT_LIMITS.maxMessageLength));
  });

  test("refuses a new message while the previous reply is pending", async () => {
    const t = setup();
    const threadId = await createUserWithThread(t);
    await send(t, threadId, "first");
    await expectMikebotError(send(t, threadId, "second"), "reply_pending");

    // Finishing the reply unblocks the thread
    const [pending] = await t.run((ctx) => ctx.db.query("mikebotPendingReplies").collect());
    await t.mutation(internal.mikebot.internal.mutations.clearPendingReply, {
      threadId,
      promptMessageId: pending.promptMessageId,
    });
    await send(t, threadId, "second");

    // A reply that never finishes stops blocking after the timeout
    await expectMikebotError(send(t, threadId, "third"), "reply_pending");
    vi.setSystemTime(START + MIKEBOT_LIMITS.pendingReplyTimeoutMs + 1);
    await send(t, threadId, "third");
    expect(await t.run((ctx) => ctx.db.query("mikebotPendingReplies").collect())).toHaveLength(1);
  });

  test("rate limits bursts of messages from one user", async () => {
    const t = setup();
    const threadId = await createUserWithThread(t);
    const { capacity } = MIKEBOT_LIMITS.rateLimits.sendMessagePerUser;
    for (let i = 0; i < capacity; i++) {
      await send(t, threadId, `message ${i}`);
      await finishPendingReplies(t);
    }
    await expectMikebotError(send(t, threadId, "one too many"), "rate_limited");

    // Other users are unaffected
    const otherThreadId = await createUserWithThread(t, TOKEN_B);
    await send(t, otherThreadId, "hello", TOKEN_B);
  });

  test("caps messages per user per day", async () => {
    const t = setup();
    const threadId = await createUserWithThread(t);
    const { rate } = MIKEBOT_LIMITS.rateLimits.sendMessagePerUserPerDay;
    for (let i = 0; i < rate; i++) {
      // Space messages out so only the daily limit applies
      vi.setSystemTime(START + i * 60_000);
      await send(t, threadId, `message ${i}`);
      await finishPendingReplies(t);
    }
    vi.setSystemTime(START + rate * 60_000);
    await expectMikebotError(send(t, threadId, "one too many"), "daily_limit");
  });

  test("refuses messages once the daily token budget is used up", async () => {
    const t = setup();
    const threadId = await createUserWithThread(t);

    await t.mutation(internal.mikebot.internal.mutations.recordTokenUsage, {
      inputTokens: 1_500_000,
      outputTokens: 400_000,
      totalTokens: 1_900_000,
    });
    await send(t, threadId, "still fine");
    await finishPendingReplies(t);

    await t.mutation(internal.mikebot.internal.mutations.recordTokenUsage, {
      inputTokens: 90_000,
      outputTokens: 10_000,
      totalTokens: 100_000,
    });
    const usage = await t.run((ctx) => ctx.db.query("mikebotDailyUsage").collect());
    expect(usage).toMatchObject([
      {
        day: getUtcDayKey(START),
        inputTokens: 1_590_000,
        outputTokens: 410_000,
        totalTokens: 2_000_000,
      },
    ]);
    await expectMikebotError(send(t, threadId, "over budget"), "budget_exhausted");

    // The budget resets on the next UTC day
    vi.setSystemTime(START + 24 * 60 * 60 * 1000);
    await send(t, threadId, "a new day");
  });

  test("MIKEBOT_DAILY_TOKEN_BUDGET=0 switches Mikebot off", async () => {
    const t = setup();
    const threadId = await createUserWithThread(t);
    process.env.MIKEBOT_DAILY_TOKEN_BUDGET = "0";
    await expectMikebotError(send(t, threadId, "hello?"), "budget_exhausted");
  });

  test("rate limits thread creation per user", async () => {
    const t = setup();
    await t.mutation(api.users.ensureAnonymousUser, { token: TOKEN_A });
    const { capacity } = MIKEBOT_LIMITS.rateLimits.createThreadPerUser;
    for (let i = 0; i < capacity; i++)
      await t.mutation(api.mikebot.mutations.createThreadForUser, { token: TOKEN_A });
    await expectMikebotError(
      t.mutation(api.mikebot.mutations.createThreadForUser, { token: TOKEN_A }),
      "rate_limited",
    );
  });
});
