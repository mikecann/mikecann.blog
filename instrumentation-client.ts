import { isBotUserAgent } from "./utils/sentry";

// Production deployments only (see utils/sentry.ts). The hostname check keeps out a production
// build served anywhere else (the *.vercel.app URL, `next start` on a laptop), and
// navigator.webdriver keeps out Playwright and other automated browsers.
//
// The env check is written out here, not imported, so other builds drop the whole block. The SDK
// is loaded as its own chunk rather than added to the main bundle every page waits for; the cost
// is missing an error thrown in the few milliseconds before it arrives.
if (
  process.env.BLOG_SENTRY_ENABLED == "1" &&
  (location.hostname == "mikecann.blog" || location.hostname == "www.mikecann.blog") &&
  !navigator.webdriver &&
  !isBotUserAgent(navigator.userAgent)
) {
  void import("./utils/sentryClient").then(({ initSentry }) => initSentry());
}
