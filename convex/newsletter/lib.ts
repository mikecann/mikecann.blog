import { HOUR, RateLimiter } from "@convex-dev/rate-limiter";
import { components } from "../_generated/api";
import {
  MAILCHIMP_LIST_ID,
  getMailchimpApiKeyBlockReason,
  getPostEmailDeploymentBlockReason,
  mailchimpRequest,
} from "../mailchimp/lib";
import {
  HOSTED_SIGNUP_FORM_URL,
  SIGNUP_STATUS_PARAM,
  SUBSCRIBE_RESULTS,
  type SubscribeResult,
  type SubscribeStatus,
} from "./results";

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
    return SUBSCRIBE_RESULTS.confirm_email;
  }

  const response = await mailchimpRequest(`/lists/${MAILCHIMP_LIST_ID}/members`, {
    method: "POST",
    body: JSON.stringify({ email_address: email, status: "pending", tags: [sourceTag(source)] }),
  });
  if (response.ok) return SUBSCRIBE_RESULTS.confirm_email;

  const body = await response.text();
  const title = (() => {
    try {
      return String(JSON.parse(body).title ?? "");
    } catch {
      return "";
    }
  })();

  if (title == "Member Exists") return SUBSCRIBE_RESULTS.already_subscribed;
  if (title == "Invalid Resource") return SUBSCRIBE_RESULTS.invalid_email;
  if (title == "Forgotten Email Not Subscribed")
    // Mailchimp won't let the API re-add an address that asked to be forgotten; its own form can.
    return {
      status: "error",
      message: "Please use Mailchimp's signup form to resubscribe this address.",
      fallbackUrl: HOSTED_SIGNUP_FORM_URL,
    };

  console.error(`Mailchimp signup failed with HTTP ${response.status}: ${body}`);
  return SUBSCRIBE_RESULTS.error;
}

const LIVE_BLOG_ORIGIN = "https://mikecann.blog";

/** Origins the signup endpoint may send readers back to: the blog, its Vercel previews and local dev. */
const isBlogOrigin = (origin: string) =>
  origin == LIVE_BLOG_ORIGIN ||
  origin == "https://www.mikecann.blog" ||
  /^https:\/\/next-mikecann-[a-z0-9-]+-mikecanns-projects\.vercel\.app$/.test(origin) ||
  /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

const parseUrl = (value: string | null, base?: string) => {
  if (!value) return null;
  try {
    return new URL(value, base);
  } catch {
    return null;
  }
};

/**
 * Where to send a reader after a signup form was posted as a plain HTML form (before the page's
 * JavaScript loaded): back to `returnTo`, the path of the page they were on, with the status in the
 * query string. The origin comes from the request's Origin or Referer header, which the browser
 * sets, and must be a blog origin, so this can't be used to bounce people to other sites.
 */
export function signupRedirectUrl(
  headers: Headers,
  returnTo: string | null,
  status: SubscribeStatus,
): string {
  const origin =
    [headers.get("Origin"), headers.get("Referer")]
      .map((header) => parseUrl(header)?.origin)
      .find((candidate) => candidate != null && isBlogOrigin(candidate)) ?? LIVE_BLOG_ORIGIN;

  // A returnTo that resolves to another origin ("//evil.com", "/\evil.com", "https://...") is
  // ignored in favour of the subscribe page.
  const page = parseUrl(returnTo, origin);
  const url = page?.origin == origin ? page : new URL("/subscribe", origin);
  url.hash = "";
  url.searchParams.set(SIGNUP_STATUS_PARAM, status);
  return url.href;
}
