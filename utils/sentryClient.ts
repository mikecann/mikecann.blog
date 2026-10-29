import { init } from "@sentry/nextjs";
import { SENTRY_DSN, sentryDataCollection, sentryRelease } from "./sentry";

/**
 * Sentry for the browser (component `web`). Only loaded by instrumentation-client.ts on the
 * production site, as its own chunk, so other pages and builds never download the SDK.
 */
export const initSentry = () =>
  init({
    dsn: SENTRY_DSN,
    environment: "production",
    release: sentryRelease,
    initialScope: { tags: { component: "web" } },
    dataCollection: sentryDataCollection,
    // Errors only. Leaving tracesSampleRate unset sends no spans, dropping BrowserTracing stops it
    // instrumenting navigations and fetches for nothing, and dropping BrowserSession stops a
    // release-health session being sent on every page view.
    integrations: (defaults) =>
      defaults.filter(({ name }) => name != "BrowserTracing" && name != "BrowserSession"),
    // Only errors thrown from this site's own scripts. Browser extensions, Ruffle (from unpkg) and
    // other injected scripts throw plenty of errors I can't fix.
    allowUrls: [/^https:\/\/(www\.)?mikecann\.blog\//],
    denyUrls: [/^(chrome|moz|safari|safari-web|ms-browser)-extension:\/\//],
    ignoreErrors: [
      // Benign browser warning surfaced as an error.
      "ResizeObserver loop",
      // Flaky connections: a reader going offline mid-fetch isn't a bug.
      "Failed to fetch",
      "NetworkError when attempting to fetch resource",
      "Load failed",
      "The network connection was lost",
      // Old tabs asking for chunks a newer deploy removed; a reload fixes them.
      "ChunkLoadError",
      /Loading chunk [\w-]+ failed/,
    ],
    beforeSend(event) {
      // denyUrls only looks at the frame that threw; drop anything with an extension frame anywhere.
      const frames =
        event.exception?.values?.flatMap((value) => value.stacktrace?.frames ?? []) ?? [];
      if (frames.some((frame) => /-extension:\/\//.test(frame.filename ?? ""))) return null;
      return event;
    },
  });
