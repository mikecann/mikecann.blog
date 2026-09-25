// Values shared by the Mikebot Convex functions and the Mikebot React client.
// Keep this file free of server-only imports: it ends up in the browser bundle.

/** Longest message (in characters) a visitor can send to Mikebot. */
export const MIKEBOT_MAX_MESSAGE_LENGTH = 2000;

/**
 * Shape of the secret anonymous-identity token the browser generates and keeps
 * in localStorage. The client sends 64 hex characters (32 random bytes).
 */
export const MIKEBOT_TOKEN_PATTERN = /^[A-Za-z0-9_-]{32,128}$/;

export type MikebotErrorCode =
  | "invalid_token"
  | "unknown_user"
  | "thread_not_found"
  | "empty_message"
  | "message_too_long"
  | "reply_pending"
  | "rate_limited"
  | "daily_limit"
  | "busy"
  | "budget_exhausted";

/** The `data` of every ConvexError thrown by the public Mikebot functions. */
export type MikebotErrorData = {
  kind: "mikebot";
  code: MikebotErrorCode;
  /** A friendly message that is safe to show to the visitor as-is. */
  message: string;
  retryAfterMs?: number;
};

export const isMikebotErrorData = (data: unknown): data is MikebotErrorData =>
  typeof data === "object" &&
  data !== null &&
  (data as { kind?: unknown }).kind === "mikebot" &&
  typeof (data as { message?: unknown }).message === "string";

/** Returns a friendly message for any error thrown by a Mikebot function call. */
export const getMikebotErrorMessage = (
  error: unknown,
  fallback = "Sorry, something went wrong talking to Mikebot. Please try again.",
): string => {
  const data =
    typeof error === "object" && error !== null ? (error as { data?: unknown }).data : null;
  return isMikebotErrorData(data) ? data.message : fallback;
};
