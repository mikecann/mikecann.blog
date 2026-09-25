import { convexGateway } from "@convex-dev/ai-sdk-provider";
import { DAY, HOUR, MINUTE, type RateLimitConfig } from "@convex-dev/rate-limiter";
import { MIKEBOT_MAX_MESSAGE_LENGTH } from "./shared";

/** Used when the MIKEBOT_MODEL env var isn't set. */
export const MIKEBOT_DEFAULT_MODEL = "openai/gpt-5.6-luna";

/**
 * Env var that picks Mikebot's model without a code change, using any Convex AI Gateway model id,
 * e.g. "openai/gpt-6-luna" once the gateway lists it, or "openrouter/auto". The gateway doesn't
 * accept OpenRouter's routing options, so "openrouter/auto" can't be limited to cheap models and
 * may pick pricey ones; the daily cost budget below still caps the spend.
 */
export const MIKEBOT_MODEL_ENV_VAR = "MIKEBOT_MODEL";

/**
 * The language model behind Mikebot, called through the Convex AI Gateway: Convex holds the
 * provider keys and bills the usage, so the deployment needs no API key (it does need a paid
 * Convex plan). The gateway reports each step's cost, which feeds the daily cost budget.
 */
export const MIKEBOT_LANGUAGE_MODEL = convexGateway(
  process.env[MIKEBOT_MODEL_ENV_VAR]?.trim() || MIKEBOT_DEFAULT_MODEL,
);

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
