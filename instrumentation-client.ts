import { isBotUserAgent } from "./utils/sentry";

// Production only (see utils/sentry.ts). Only the production deployment is served on
// mikecann.blog: previews are on *.vercel.app and dev servers and `next start` on localhost.
// navigator.webdriver keeps out Playwright and other automated browsers.
//
// The SDK is loaded as its own chunk rather than added to the main bundle every page waits for;
// the cost is missing an error thrown in the few milliseconds before it arrives. Dev builds drop
// the whole block.
if (
  process.env.NODE_ENV == "production" &&
  (location.hostname == "mikecann.blog" || location.hostname == "www.mikecann.blog") &&
  !navigator.webdriver &&
  !isBotUserAgent(navigator.userAgent)
) {
  void import("./utils/sentryClient").then(({ initSentry }) => initSentry());
}
