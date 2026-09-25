import { HOUR, RateLimiter } from "@convex-dev/rate-limiter";
import { components } from "../_generated/api";
import {
  MAILCHIMP_LIST_ID,
  getMailchimpApiKeyBlockReason,
  getPostEmailDeploymentBlockReason,
  mailchimpRequest,
} from "../mailchimp/lib";

/** Mailchimp's own hosted signup form, offered when we can't add someone through the API. */
export const HOSTED_SIGNUP_FORM_URL =
  "https://epicshrimp.us3.list-manage.com/subscribe?u=aaed03be8d4e6cc7ca902a572&id=3c8f7e6e85";

export type SubscribeStatus =
  "confirm_email" | "already_subscribed" | "invalid_email" | "rate_limited" | "error";

export type SubscribeResult = {
  status: SubscribeStatus;
  message: string;
  /** Where to go instead, when signing up here isn't possible. */
  fallbackUrl?: string;
};

// Each signup makes Mailchimp send a confirmation email, so these limits also stop the endpoint
// being used to flood someone's inbox.
export const newsletterRateLimiter = new RateLimiter(components.rateLimiter, {
  newsletterSubscribePerEmail: { kind: "fixed window", rate: 3, period: HOUR },
  newsletterSubscribeGlobal: { kind: "token bucket", rate: 60, period: HOUR, capacity: 20 },
});

export const MAX_EMAIL_LENGTH = 254;

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

/** A cheap sanity check; Mailchimp does the real validation. */
export const isPlausibleEmail = (email: string) =>
  email.length <= MAX_EMAIL_LENGTH && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/** Tag added to new subscribers so Mailchimp shows which signup form they used. */
export const sourceTag = (source: string) =>
  `blog-${source.replace(/[^a-z0-9-]/gi, "").slice(0, 40) || "unknown"}`;

const checkInbox: SubscribeResult = {
  status: "confirm_email",
  message: "Almost done! Check your inbox and click the link to confirm your subscription.",
};

/**
 * Adds `email` to the list as "pending", so Mailchimp sends its double opt-in confirmation email
 * and the address only receives posts once its owner confirms.
 */
export async function addPendingSubscriber(
  email: string,
  source: string,
): Promise<SubscribeResult> {
  const blockReason = getMailchimpApiKeyBlockReason() ?? getPostEmailDeploymentBlockReason();
  if (blockReason) {
    // Dev and preview deployments must not add test addresses to the real list.
    console.log(`Not adding a subscriber to Mailchimp: ${blockReason}`);
    return checkInbox;
  }

  const response = await mailchimpRequest(`/lists/${MAILCHIMP_LIST_ID}/members`, {
    method: "POST",
    body: JSON.stringify({ email_address: email, status: "pending", tags: [sourceTag(source)] }),
  });
  if (response.ok) return checkInbox;

  const body = await response.text();
  const title = (() => {
    try {
      return String(JSON.parse(body).title ?? "");
    } catch {
      return "";
    }
  })();

  if (title == "Member Exists")
    return {
      status: "already_subscribed",
      message:
        "You're already on the list, thanks! If you never got the confirmation email, you can " +
        "sign up again on Mailchimp's form.",
      fallbackUrl: HOSTED_SIGNUP_FORM_URL,
    };
  if (title == "Invalid Resource")
    return { status: "invalid_email", message: "That email address doesn't look right." };
  if (title == "Forgotten Email Not Subscribed")
    // Mailchimp won't let the API re-add an address that asked to be forgotten; its own form can.
    return {
      status: "error",
      message: "Please use Mailchimp's signup form to resubscribe this address.",
      fallbackUrl: HOSTED_SIGNUP_FORM_URL,
    };

  console.error(`Mailchimp signup failed with HTTP ${response.status}: ${body}`);
  return {
    status: "error",
    message: "Sorry, something went wrong. Please try Mailchimp's signup form instead.",
    fallbackUrl: HOSTED_SIGNUP_FORM_URL,
  };
}
