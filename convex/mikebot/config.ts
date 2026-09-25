import { openrouter } from "@openrouter/ai-sdk-provider";
import { DAY, HOUR, MINUTE, type RateLimitConfig } from "@convex-dev/rate-limiter";
import { MIKEBOT_MAX_MESSAGE_LENGTH } from "./shared";

/**
 * Model tiers the OpenRouter auto router may pick from: the cheap, fast tiers of each major
 * family. It picks the best of these for each message, and newer versions that match a pattern
 * are used automatically, so Mikebot keeps up with new models without code changes. Without
 * this list the router can pick frontier models that cost 20-100x more.
 */
export const MIKEBOT_ALLOWED_MODELS = [
  "openai/gpt-*-luna",
  "openai/gpt-*-luna-pro",
  "google/gemini-*-flash",
  "google/gemini-*-flash-lite",
  "deepseek/deepseek-*-flash",
  "qwen/qwen*-flash",
  "z-ai/glm-*-flash",
  "z-ai/glm-*-flashx",
];

/**
 * Hard price ceiling in USD per million tokens, in case a pattern above ever matches a pricier
 * model. OpenRouter fails the request rather than exceed it.
 */
export const MIKEBOT_MAX_PRICE_PER_MILLION_TOKENS = { prompt: 1, completion: 4 };

/**
 * The language model behind Mikebot: OpenRouter's auto router (needs OPENROUTER_API_KEY in the
 * Convex environment). Usage accounting is on so each step reports its cost for the daily budget.
 */
export const MIKEBOT_LANGUAGE_MODEL = openrouter("openrouter/auto", {
  plugins: [{ id: "auto-router", allowed_models: MIKEBOT_ALLOWED_MODELS }],
  provider: { max_price: MIKEBOT_MAX_PRICE_PER_MILLION_TOKENS },
  usage: { include: true },
});

/** Env var holding the max tokens Mikebot may use per UTC day (0 turns Mikebot off). */
export const MIKEBOT_DAILY_TOKEN_BUDGET_ENV_VAR = "MIKEBOT_DAILY_TOKEN_BUDGET";

/** Env var holding the max USD Mikebot may spend per UTC day (0 turns Mikebot off). */
export const MIKEBOT_DAILY_COST_BUDGET_ENV_VAR = "MIKEBOT_DAILY_COST_BUDGET_USD";

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
  /** Used when MIKEBOT_DAILY_COST_BUDGET_USD is not set. */
  defaultDailyCostBudgetUsd: 2,
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
