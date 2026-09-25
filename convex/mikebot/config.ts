import { openai } from "@ai-sdk/openai";
import { DAY, HOUR, MINUTE, type RateLimitConfig } from "@convex-dev/rate-limiter";
import { MIKEBOT_MAX_MESSAGE_LENGTH } from "./shared";

/**
 * The language model behind Mikebot. Change this one line to switch model or
 * provider.
 */
export const MIKEBOT_LANGUAGE_MODEL = openai.responses("gpt-5.6-luna");

/** Env var holding the max tokens Mikebot may use per UTC day (0 turns Mikebot off). */
export const MIKEBOT_DAILY_TOKEN_BUDGET_ENV_VAR = "MIKEBOT_DAILY_TOKEN_BUDGET";

/** Every abuse / cost limit Mikebot enforces, in one place. */
export const MIKEBOT_LIMITS = {
  /** Longest message a visitor can send, in characters. */
  maxMessageLength: MIKEBOT_MAX_MESSAGE_LENGTH,
  /** The page URL sent along as context is truncated to this many characters. */
  maxContextUrlLength: 500,
  /** How many recent thread messages are sent to the model as context. */
  recentMessages: 20,
  /** Max LLM steps (tool calls + answer) per reply. */
  maxSteps: 5,
  /** A reply still pending after this long is assumed dead and no longer blocks sends. */
  pendingReplyTimeoutMs: 5 * MINUTE,
  /** Used when MIKEBOT_DAILY_TOKEN_BUDGET is not set. */
  defaultDailyTokenBudget: 2_000_000,
  /** Largest page of messages a client can request at once. */
  maxMessagesPerPage: 50,
  rateLimits: {
    /** Per user: roughly 5 messages a minute, with a burst of 3. */
    sendMessagePerUser: { kind: "token bucket", rate: 5, period: MINUTE, capacity: 3 },
    /** Per user: 50 messages a day. */
    sendMessagePerUserPerDay: { kind: "fixed window", rate: 50, period: DAY },
    /** Everyone together: 300 messages an hour. */
    sendMessageGlobal: { kind: "fixed window", rate: 300, period: HOUR },
    /** Per user: new conversations (threads). */
    createThreadPerUser: { kind: "token bucket", rate: 10, period: HOUR, capacity: 3 },
    /** Everyone together: new anonymous identities. */
    createAnonymousUserGlobal: { kind: "token bucket", rate: 200, period: HOUR, capacity: 50 },
  },
} as const satisfies {
  rateLimits: Record<string, RateLimitConfig>;
  [key: string]: unknown;
};

export type MikebotRateLimitName = keyof typeof MIKEBOT_LIMITS.rateLimits;
