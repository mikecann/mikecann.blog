import { CONVEX_SITE_URL } from "./convex";

export type SubscribeStatus =
  "confirm_email" | "already_subscribed" | "invalid_email" | "rate_limited" | "error";

/** Mirrors `SubscribeResult` in convex/newsletter/lib.ts. */
export type SubscribeResult = {
  status: SubscribeStatus;
  message: string;
  fallbackUrl?: string;
};

/** Mailchimp's hosted form, used when the request can't reach our endpoint at all. */
export const HOSTED_SIGNUP_FORM_URL =
  "https://epicshrimp.us3.list-manage.com/subscribe?u=aaed03be8d4e6cc7ca902a572&id=3c8f7e6e85";

export const isSuccess = (status: SubscribeStatus) =>
  status == "confirm_email" || status == "already_subscribed";

/**
 * Signs `email` up to new-post emails (Mailchimp double opt-in). `source` says which form was
 * used and becomes a tag in Mailchimp; `website` is the honeypot field's value.
 */
export async function subscribeToNewsletter(args: {
  email: string;
  source: string;
  website?: string;
}): Promise<SubscribeResult> {
  try {
    // text/plain keeps this a "simple" CORS request, so there's no preflight round trip.
    const response = await fetch(`${CONVEX_SITE_URL}/newsletter/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(args),
    });
    return (await response.json()) as SubscribeResult;
  } catch {
    return {
      status: "error",
      message: "Sorry, something went wrong. Please try Mailchimp's signup form instead.",
      fallbackUrl: HOSTED_SIGNUP_FORM_URL,
    };
  }
}

// Remembered in the browser so readers who signed up, or said no, aren't asked again.
const SUBSCRIBED_KEY = "newsletter:subscribed";
const DISMISSED_UNTIL_KEY = "newsletter:promptDismissedUntil";
const DISMISS_FOR_MS = 30 * 24 * 60 * 60 * 1000;

const readStorage = (key: string) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Private mode or storage disabled; the prompt just shows again next time.
  }
};

export const rememberSubscribed = () => writeStorage(SUBSCRIBED_KEY, "1");

export const rememberPromptDismissed = (now = Date.now()) =>
  writeStorage(DISMISSED_UNTIL_KEY, String(now + DISMISS_FOR_MS));

/** Whether the signup prompt may be shown to this reader. */
export const shouldOfferSubscribePrompt = (now = Date.now()): boolean => {
  if (readStorage(SUBSCRIBED_KEY)) return false;
  if (Number(readStorage(DISMISSED_UNTIL_KEY) ?? 0) > now) return false;
  // Readers arriving from one of the new-post emails are already subscribed.
  const params = new URLSearchParams(window.location.search);
  if (params.has("mc_cid") || params.get("utm_medium") == "email") return false;
  return true;
};
