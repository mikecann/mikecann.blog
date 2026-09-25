import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import {
  addPendingSubscriber,
  isPlausibleEmail,
  newsletterRateLimiter,
  normalizeEmail,
  type SubscribeResult,
} from "./newsletter/lib";
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

/**
 * Newsletter signup: `{ email, source, website }` as JSON (sent as text/plain so browsers skip the
 * CORS preflight). `website` is a honeypot field that people never see or fill in.
 */
http.route({
  path: "/newsletter/subscribe",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    let body: { email?: unknown; source?: unknown; website?: unknown };
    try {
      body = JSON.parse(await request.text());
    } catch {
      return json({ status: "error", message: "Invalid request." }, 400);
    }

    const email = typeof body.email == "string" ? normalizeEmail(body.email) : "";
    const source = typeof body.source == "string" ? body.source : "unknown";
    if (!isPlausibleEmail(email))
      return json({ status: "invalid_email", message: "That email address doesn't look right." });

    // Bots fill in every field; pretend it worked so they don't adapt.
    if (typeof body.website == "string" && body.website.trim() != "")
      return json({
        status: "confirm_email",
        message: "Almost done! Check your inbox and click the link to confirm your subscription.",
      });

    const tooMany = {
      status: "rate_limited",
      message: "Too many signup attempts right now. Please try again in a little while.",
    } as const;
    const perEmail = await newsletterRateLimiter.limit(ctx, "newsletterSubscribePerEmail", {
      key: sha256Hex(email),
    });
    if (!perEmail.ok) return json(tooMany);
    const global = await newsletterRateLimiter.limit(ctx, "newsletterSubscribeGlobal");
    if (!global.ok) return json(tooMany);

    return json(await addPendingSubscriber(email, source));
  }),
});

http.route({
  path: "/newsletter/subscribe",
  method: "OPTIONS",
  handler: httpAction(async () => new Response(null, { status: 204, headers: corsHeaders })),
});

export default http;
