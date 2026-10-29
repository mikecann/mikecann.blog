import type { BrowserOptions } from "@sentry/nextjs";

/**
 * Shared by the two Sentry inits: instrumentation-client.ts (component `web`) and
 * instrumentation.ts (component `server`). Errors only: no tracing, replay or profiling.
 *
 * Production only. Agents run dev servers and preview deployments of this site all day, and an
 * agent watches Sentry and opens a thread for anything serious, so nothing but the production
 * deployment may report. next.config.js sets BLOG_SENTRY_ENABLED at build time from VERCEL_ENV,
 * and both inits check it.
 */

// A public client key (it ships to every browser), so it's fine in git.
export const SENTRY_DSN =
  "https://0dc3a8af05ccc8a24c4d467a677c84f0@o4508736647266304.ingest.us.sentry.io/4512336957800448";

// The git sha of the deployment.
export const sentryRelease = process.env.BLOG_SENTRY_RELEASE || undefined;

/**
 * What sendDefaultPii: false used to mean (v11 replaced it with dataCollection, whose defaults
 * collect all of this). Only the user agent header is kept, which the bot filter needs.
 */
export const sentryDataCollection: BrowserOptions["dataCollection"] = {
  userInfo: false,
  cookies: false,
  httpHeaders: { request: { allow: ["user-agent"] }, response: false },
  httpBodies: [],
  urlQueryParams: false,
  stackFrameVariables: false,
};

const botUserAgent =
  /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|facebookexternalhit|embedly|python|curl|wget|go-http-client|playwright|puppeteer|phantomjs/i;

/** Crawlers, link unfurlers and automation hit odd paths and run old browsers; their errors are noise. */
export const isBotUserAgent = (userAgent: string | undefined) =>
  !!userAgent && botUserAgent.test(userAgent);
