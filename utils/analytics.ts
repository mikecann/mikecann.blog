/**
 * Records an analytics event in PostHog if it's configured and has loaded (see `_app.tsx`, which
 * loads it once the page is idle). Never throws and never delays the caller.
 */
export const trackEvent = (event: string, properties?: Record<string, unknown>) => {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  import("posthog-js")
    .then(({ default: posthog }) => {
      if (posthog.__loaded) posthog.capture(event, properties);
    })
    .catch(() => {});
};
