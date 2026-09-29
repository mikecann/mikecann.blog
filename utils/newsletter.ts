import { CONVEX_SITE_URL } from "./convex";
import {
  SIGNUP_STATUS_PARAM,
  SUBSCRIBE_RESULTS,
  isSubscribeStatus,
  type SubscribeResult,
  type SubscribeStatus,
} from "../convex/newsletter/results";

// Statuses, messages and the redirect's query parameter are shared with the signup endpoint.
export * from "../convex/newsletter/results";

/**
 * The signup endpoint (convex/http.ts). The form's JavaScript posts JSON here; a form submitted
 * before the JavaScript loads posts here as a plain HTML form.
 */
export const SUBSCRIBE_ENDPOINT = `${CONVEX_SITE_URL}/newsletter/subscribe`;

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
    const response = await fetch(SUBSCRIBE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(args),
    });
    return (await response.json()) as SubscribeResult;
  } catch {
    return SUBSCRIBE_RESULTS.error;
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
  const params = new URLSearchParams(window.location.search);
  // Readers arriving from one of the new-post emails are already subscribed.
  if (params.has("mc_cid") || params.get("utm_medium") == "email") return false;
  // They've just used the signup form on this page (see SubscribeForm).
  if (isSubscribeStatus(params.get(SIGNUP_STATUS_PARAM))) return false;
  return true;
};
