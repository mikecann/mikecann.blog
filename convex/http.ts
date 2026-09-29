import { httpRouter } from "convex/server";
import { httpAction, type ActionCtx } from "./_generated/server";
import {
  addPendingSubscriber,
  isPlausibleEmail,
  newsletterRateLimiter,
  normalizeEmail,
  signupRedirectUrl,
} from "./newsletter/lib";
import { SUBSCRIBE_RESULTS, type SubscribeResult } from "./newsletter/results";
import { sha256Hex } from "./mikebot/sha256";

const http = httpRouter();

// The blog calls this from the browser. It's a public signup form, so any origin may use it.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

const json = (result: SubscribeResult, status = 200) =>
  new Response(JSON.stringify(result), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

/** `null` for anything that isn't a JSON object (JSON.parse also accepts `null`, `1`, `"text"`...). */
const parseJsonObject = (text: string): Record<string, unknown> | null => {
  try {
    const value: unknown = JSON.parse(text);
    return typeof value == "object" && value != null ? (value as Record<string, unknown>) : null;
  } catch {
    return null;
  }
};

/** `website` is a honeypot field that people never see or fill in. */
type SignupFields = { email?: unknown; source?: unknown; website?: unknown };

async function subscribe(ctx: ActionCtx, fields: SignupFields): Promise<SubscribeResult> {
  const email = typeof fields.email == "string" ? normalizeEmail(fields.email) : "";
  const source = typeof fields.source == "string" ? fields.source : "unknown";
  if (!isPlausibleEmail(email)) return SUBSCRIBE_RESULTS.invalid_email;

  // Bots fill in every field; pretend it worked so they don't adapt.
  if (typeof fields.website == "string" && fields.website.trim() != "")
    return SUBSCRIBE_RESULTS.confirm_email;

  const perEmail = await newsletterRateLimiter.limit(ctx, "newsletterSubscribePerEmail", {
    key: sha256Hex(email),
  });
  if (!perEmail.ok) return SUBSCRIBE_RESULTS.rate_limited;
  const global = await newsletterRateLimiter.limit(ctx, "newsletterSubscribeGlobal");
  if (!global.ok) return SUBSCRIBE_RESULTS.rate_limited;

  try {
    return await addPendingSubscriber(email, source);
  } catch (error) {
    // Mailchimp unreachable. A 500 would strand readers whose form posted here directly.
    console.error("Mailchimp signup request failed:", error);
    return SUBSCRIBE_RESULTS.error;
  }
}

/**
 * Newsletter signup: `{ email, source, website }` as JSON (sent as text/plain so browsers skip the
 * CORS preflight). A form submitted before the blog's JavaScript has loaded arrives instead as a
 * plain form post with the same fields plus `returnTo`, and gets a redirect back to that page.
 */
http.route({
  path: "/newsletter/subscribe",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (request.headers.get("Content-Type")?.startsWith("application/x-www-form-urlencoded")) {
      const form = new URLSearchParams(await request.text());
      const { status } = await subscribe(ctx, {
        email: form.get("email"),
        source: form.get("source"),
        website: form.get("website"),
      });
      // 303 so the browser follows it with a GET, and a reload doesn't resubmit the form.
      return new Response(null, {
        status: 303,
        headers: { Location: signupRedirectUrl(request.headers, form.get("returnTo"), status) },
      });
    }

    const body = parseJsonObject(await request.text());
    if (!body) return json({ status: "error", message: "Invalid request." }, 400);
    return json(await subscribe(ctx, body));
  }),
});

http.route({
  path: "/newsletter/subscribe",
  method: "OPTIONS",
  handler: httpAction(async () => new Response(null, { status: 204, headers: corsHeaders })),
});

export default http;
