import { ensure } from "../../essentials/misc/ensure";
import { EMAIL_TEMPLATE } from "./emailTemplate";

export const MAILCHIMP_LIST_ID = "3c8f7e6e85";
export const MAILCHIMP_FROM_NAME = "Mike Cann";
export const MAILCHIMP_REPLY_TO = "mike.cann@gmail.com";

export function sanitizeMailchimpApiKey(apiKey: string): string {
  return apiKey.trim().replace(/^["']+|["']+$/g, "");
}

export function getMailchimpDataCenter(apiKey: string): string {
  const dc = apiKey.split("-").pop();
  if (!dc || !/^[a-z]+\d+$/i.test(dc)) {
    throw new Error("MAILCHIMP_API_KEY env var does not include a valid Mailchimp data center");
  }
  return dc;
}

function getMailchimpConfig() {
  const apiKey = sanitizeMailchimpApiKey(
    ensure(process.env.MAILCHIMP_API_KEY, "MAILCHIMP_API_KEY env var is not set"),
  );
  const dc = getMailchimpDataCenter(apiKey);
  return { apiKey, dc, baseUrl: `https://${dc}.api.mailchimp.com/3.0` };
}

/** Calls the Mailchimp API and returns the raw response, including error responses. */
export async function mailchimpRequest(path: string, options: RequestInit = {}) {
  const { apiKey, baseUrl } = getMailchimpConfig();
  return fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Basic ${btoa(`anystring:${apiKey}`)}`,
      "Content-Type": "application/json",
    },
  });
}

export async function mailchimpFetch(path: string, options: RequestInit = {}) {
  const response = await mailchimpRequest(path, options);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Mailchimp API error ${response.status}: ${body}`);
  }
  const body = await response.text();
  if (body.length === 0) return null;
  return JSON.parse(body);
}

/** The public URL of a post, used in emails and for the "is it live yet" check. */
export function getPostUrl(slug: string): string {
  return `https://mikecann.blog/posts/${encodeURIComponent(slug)}`;
}

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  // Stops text like "*|UNSUB|*" in a title being treated as a Mailchimp merge tag.
  "|": "&#124;",
};

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"'|]/g, (char) => HTML_ESCAPES[char]);
}

export function generateNewPostEmailHtml(title: string, slug: string): string {
  const safeTitle = escapeHtml(title);
  const safeUrl = escapeHtml(getPostUrl(slug));
  // Replacer functions, so "$&", "$1" etc. in a title are inserted literally.
  return EMAIL_TEMPLATE.replace(/\{\{POST_TITLE\}\}/g, () => safeTitle).replace(
    /\{\{POST_URL\}\}/g,
    () => safeUrl,
  );
}

// ---------------------------------------------------------------------------
// Only the production deployment may email subscribers
// ---------------------------------------------------------------------------

/**
 * The production deployment. MAILCHIMP_LIST_ID is the real subscriber list, so
 * any other deployment (e.g. dev) must not send post emails.
 */
export const PRODUCTION_CONVEX_CLOUD_URL = "https://groovy-lapwing-575.convex.cloud";

/** Set to "true" on a deployment to let it send post emails even if it isn't production. */
export const MAILCHIMP_ALLOW_NON_PRODUCTION_SEND_ENV_VAR = "MAILCHIMP_ALLOW_NON_PRODUCTION_SEND";

/**
 * Why this deployment must not send post emails, or null if it may. Uses the
 * built-in CONVEX_CLOUD_URL env var, so production needs no extra config.
 */
export function getPostEmailDeploymentBlockReason(): string | null {
  if (process.env[MAILCHIMP_ALLOW_NON_PRODUCTION_SEND_ENV_VAR] === "true") return null;
  const url = process.env.CONVEX_CLOUD_URL;
  if (url === PRODUCTION_CONVEX_CLOUD_URL) return null;
  return (
    `this deployment (${url ?? "unknown CONVEX_CLOUD_URL"}) is not production ` +
    `(${PRODUCTION_CONVEX_CLOUD_URL}); set ${MAILCHIMP_ALLOW_NON_PRODUCTION_SEND_ENV_VAR}=true on it to allow sending`
  );
}

/** Why Mailchimp can't be called from this deployment, or null if it can. */
export function getMailchimpApiKeyBlockReason(): string | null {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  return apiKey && sanitizeMailchimpApiKey(apiKey) ? null : "MAILCHIMP_API_KEY is not set";
}

// ---------------------------------------------------------------------------
// Is the post live on the site yet?
// ---------------------------------------------------------------------------

export type PostLiveCheck = { ok: true } | { ok: false; detail: string };

export async function checkPostIsLive(slug: string): Promise<PostLiveCheck> {
  const url = getPostUrl(slug);
  try {
    const response = await fetch(url, { method: "GET", redirect: "follow" });
    if (response.status === 200) return { ok: true };
    return { ok: false, detail: `${url} returned HTTP ${response.status}` };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, detail: `${url} could not be fetched: ${message}` };
  }
}
