import { ConvexError } from "convex/values";
import { RateLimiter } from "@convex-dev/rate-limiter";
import { components } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import {
  MIKEBOT_DAILY_COST_BUDGET_ENV_VAR,
  MIKEBOT_DAILY_TOKEN_BUDGET_ENV_VAR,
  MIKEBOT_LIMITS,
  type MikebotRateLimitName,
} from "./config";
import { MIKEBOT_TOKEN_PATTERN, type MikebotErrorCode, type MikebotErrorData } from "./shared";
import { sha256Hex } from "./sha256";

// Server-side checks shared by the public Mikebot functions: who is calling,
// do they own the thread, and are they within the abuse / cost limits.

export const mikebotError = (
  code: MikebotErrorCode,
  message: string,
  extra: { retryAfterMs?: number } = {},
) => {
  const data: MikebotErrorData = { kind: "mikebot", code, message };
  if (extra.retryAfterMs !== undefined) data.retryAfterMs = Math.ceil(extra.retryAfterMs);
  return new ConvexError(data);
};

// ---------------------------------------------------------------------------
// Identity: the browser holds a random secret token; we only store its hash.
// ---------------------------------------------------------------------------

export const hashMikebotToken = (token: string): string => {
  if (!MIKEBOT_TOKEN_PATTERN.test(token))
    throw mikebotError("invalid_token", "Your Mikebot session is invalid. Please reload the page.");
  return sha256Hex(token);
};

export const findUserByToken = async (
  ctx: QueryCtx,
  token: string,
): Promise<Doc<"users"> | null> => {
  if (!MIKEBOT_TOKEN_PATTERN.test(token)) return null;
  const tokenHash = sha256Hex(token);
  return await ctx.db
    .query("users")
    .withIndex("by_tokenHash", (q) => q.eq("tokenHash", tokenHash))
    .unique();
};

export const requireUserByToken = async (ctx: QueryCtx, token: string) => {
  const user = await findUserByToken(ctx, token);
  if (!user)
    throw mikebotError(
      "unknown_user",
      "Mikebot doesn't recognise you any more. Please reload the page and try again.",
    );
  return user;
};

// ---------------------------------------------------------------------------
// Thread ownership
// ---------------------------------------------------------------------------

/** Returns the agent thread if it exists and belongs to `userId`, otherwise null. */
export const findOwnedThread = async (
  ctx: QueryCtx,
  { threadId, userId }: { threadId: string; userId: Id<"users"> },
) => {
  let thread;
  try {
    thread = await ctx.runQuery(components.agent.threads.getThread, { threadId });
  } catch {
    // A malformed thread id (e.g. stale localStorage) is treated as not found.
    return null;
  }
  if (!thread || thread.userId !== userId) return null;
  return thread;
};

export const requireOwnedThread = async (
  ctx: QueryCtx,
  args: { threadId: string; userId: Id<"users"> },
) => {
  const thread = await findOwnedThread(ctx, args);
  if (!thread)
    throw mikebotError(
      "thread_not_found",
      "That conversation no longer exists. Please start a new one.",
    );
  return thread;
};

// ---------------------------------------------------------------------------
// One reply at a time per thread
// ---------------------------------------------------------------------------

const listPendingReplies = (ctx: QueryCtx, threadId: string) =>
  ctx.db
    .query("mikebotPendingReplies")
    .withIndex("by_threadId", (q) => q.eq("threadId", threadId))
    .take(20);

export const isPendingReplyActive = (pending: Doc<"mikebotPendingReplies">, now: number) =>
  now - pending.startedAt < MIKEBOT_LIMITS.pendingReplyTimeoutMs;

/** Throws if the previous reply in this thread is still being generated. */
export const assertNoActivePendingReply = async (ctx: QueryCtx, threadId: string, now: number) => {
  const pending = await listPendingReplies(ctx, threadId);
  if (pending.some((p) => isPendingReplyActive(p, now)))
    throw mikebotError(
      "reply_pending",
      "Mikebot is still replying to your last message. Please wait for it to finish.",
    );
};

/** Records that a reply is being generated, replacing any stale records. */
export const markReplyPending = async (
  ctx: MutationCtx,
  { threadId, promptMessageId, now }: { threadId: string; promptMessageId: string; now: number },
) => {
  await clearPendingReplies(ctx, threadId);
  await ctx.db.insert("mikebotPendingReplies", { threadId, promptMessageId, startedAt: now });
};

export const clearPendingReplies = async (
  ctx: MutationCtx,
  threadId: string,
  onlyPromptMessageId?: string,
) => {
  for (const pending of await listPendingReplies(ctx, threadId)) {
    if (onlyPromptMessageId && pending.promptMessageId !== onlyPromptMessageId) continue;
    await ctx.db.delete("mikebotPendingReplies", pending._id);
  }
};

// ---------------------------------------------------------------------------
// Daily token and cost budgets (kill switches)
// ---------------------------------------------------------------------------

export const getUtcDayKey = (now: number) => new Date(now).toISOString().slice(0, 10);

const readBudgetEnv = (envVar: string, fallback: number): number => {
  const raw = process.env[envVar];
  if (raw === undefined || raw.trim() === "") return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) {
    console.warn(`Ignoring invalid ${envVar}="${raw}", using the default budget`);
    return fallback;
  }
  return parsed;
};

export const getDailyTokenBudget = () =>
  readBudgetEnv(MIKEBOT_DAILY_TOKEN_BUDGET_ENV_VAR, MIKEBOT_LIMITS.defaultDailyTokenBudget);

export const getDailyCostBudgetUsd = () =>
  readBudgetEnv(MIKEBOT_DAILY_COST_BUDGET_ENV_VAR, MIKEBOT_LIMITS.defaultDailyCostBudgetUsd);

export const findDailyUsage = (ctx: QueryCtx, day: string) =>
  ctx.db
    .query("mikebotDailyUsage")
    .withIndex("by_day", (q) => q.eq("day", day))
    .unique();

export const assertWithinDailyBudget = async (ctx: QueryCtx, now: number) => {
  const usage = await findDailyUsage(ctx, getUtcDayKey(now));
  if (
    (usage?.totalTokens ?? 0) >= getDailyTokenBudget() ||
    (usage?.costUsd ?? 0) >= getDailyCostBudgetUsd()
  )
    throw mikebotError(
      "budget_exhausted",
      "Mikebot has used up all of its thinking for today. Please come back tomorrow!",
    );
};

// ---------------------------------------------------------------------------
// Rate limits
// ---------------------------------------------------------------------------

export const mikebotRateLimiter = new RateLimiter(
  components.rateLimiter,
  MIKEBOT_LIMITS.rateLimits,
);

const formatRetryAfter = (ms: number) => {
  const seconds = Math.max(1, Math.ceil(ms / 1000));
  if (seconds < 90) return `${seconds} second${seconds === 1 ? "" : "s"}`;
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 90) return `${minutes} minutes`;
  return `${Math.ceil(minutes / 60)} hours`;
};

const rateLimitErrors: Record<
  MikebotRateLimitName,
  { code: MikebotErrorCode; message: (retryIn: string) => string }
> = {
  sendMessagePerUser: {
    code: "rate_limited",
    message: (retryIn) =>
      `Whoa, slow down! You're sending messages too quickly. Try again in ${retryIn}.`,
  },
  sendMessagePerUserPerDay: {
    code: "daily_limit",
    message: () => "You've reached today's Mikebot message limit. Please come back tomorrow!",
  },
  sendMessageGlobal: {
    code: "busy",
    message: (retryIn) =>
      `Mikebot is very popular right now and needs a breather. Please try again in ${retryIn}.`,
  },
  createThreadPerUser: {
    code: "rate_limited",
    message: (retryIn) =>
      `You're starting new conversations too quickly. Please try again in ${retryIn}.`,
  },
  createAnonymousUserGlobal: {
    code: "busy",
    message: (retryIn) => `Mikebot is very busy right now. Please try again in ${retryIn}.`,
  },
};

/** Consumes one unit of the named rate limit, throwing a friendly error when exhausted. */
export const consumeRateLimit = async (
  ctx: MutationCtx,
  name: MikebotRateLimitName,
  key?: string,
) => {
  const status = await mikebotRateLimiter.limit(ctx, name, key === undefined ? {} : { key });
  if (status.ok) return;
  const { code, message } = rateLimitErrors[name];
  throw mikebotError(code, message(formatRetryAfter(status.retryAfter)), {
    retryAfterMs: status.retryAfter,
  });
};
