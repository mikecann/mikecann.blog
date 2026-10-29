import type { Instrumentation } from "next";
import { isBotUserAgent, SENTRY_DSN, sentryDataCollection, sentryRelease } from "./utils/sentry";

// Production deployments only (see utils/sentry.ts). VERCEL is checked at runtime as well, so a
// production build started anywhere but Vercel (`next start` on a laptop) stays quiet. There is
// no middleware or edge route, so only the Node.js runtime needs it. The SDK is imported only
// when it's on, so other builds and dev servers never load it.
const enabled =
  process.env.BLOG_SENTRY_ENABLED == "1" &&
  process.env.VERCEL == "1" &&
  process.env.NEXT_RUNTIME == "nodejs";

export async function register() {
  if (!enabled) return;
  const Sentry = await import("@sentry/nextjs");
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: "production",
    release: sentryRelease,
    initialScope: { tags: { component: "server" } },
    dataCollection: sentryDataCollection,
    // Errors only: leaving tracesSampleRate unset sends no spans.
    beforeSend(event) {
      const userAgent = event.request?.headers?.["user-agent"];
      if (isBotUserAgent(userAgent)) return null;
      return event;
    },
  });
}

// Errors thrown while rendering pages and API routes.
export const onRequestError: Instrumentation.onRequestError = async (...args) => {
  if (!enabled) return;
  const Sentry = await import("@sentry/nextjs");
  Sentry.captureRequestError(...args);
};
