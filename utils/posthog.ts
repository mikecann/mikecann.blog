let posthogStarted = false;

/**
 * PostHog is only used for analytics (no React hooks), so load it once the page is idle rather
 * than shipping it with the page.
 */
export const startPosthogWhenIdle = () => {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key || posthogStarted) return;
  posthogStarted = true;

  const start = () =>
    import("posthog-js")
      .then(({ default: posthog }) =>
        posthog.init(key, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
          person_profiles: "identified_only",
          loaded: (posthog) => {
            if (import.meta.env.DEV) posthog.debug();
          },
        }),
      )
      .catch((error) => console.warn("Failed to load PostHog", error));

  const startWhenIdle = () => {
    if ("requestIdleCallback" in window) window.requestIdleCallback(start, { timeout: 5000 });
    else setTimeout(start, 1000);
  };

  if (document.readyState === "complete") startWhenIdle();
  else window.addEventListener("load", startWhenIdle, { once: true });
};
