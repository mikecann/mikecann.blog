import { AppProps } from "next/app";
import "../styles/normalize.css";
import "../styles/globals.css";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { setStylesTarget } from "typestyle";
import { Analytics } from "@vercel/analytics/react";
import dynamic from "next/dynamic";
import { GLSDefaults } from "gls";
import { SITE_URL } from "../utils/assets";

const MikebotDynamic = dynamic(() => import("../components/mikebot/Mikebot"), { ssr: false });

const SITE_DESCRIPTION =
  "The blog of Mike Cann, a software developer who can't stop tinkering. Posts since 2004 on games, TypeScript, AI, Convex, side projects and life.";

let posthogStarted = false;

/**
 * PostHog is only used for analytics (no React hooks), so load it once the page is idle rather
 * than shipping it in the main bundle.
 */
const startPosthogWhenIdle = () => {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key || posthogStarted) return;
  posthogStarted = true;

  const start = () =>
    import("posthog-js")
      .then(({ default: posthog }) =>
        posthog.init(key, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
          person_profiles: "identified_only", // or 'always' to create profiles for anonymous users as well
          loaded: (posthog) => {
            if (process.env.NODE_ENV === "development") posthog.debug(); // debug mode in development
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

const decodeFully = (segment: string) => {
  let decoded = segment;
  for (let i = 0; i < 3; i++) {
    try {
      const next = decodeURIComponent(decoded);
      if (next == decoded) break;
      decoded = next;
    } catch {
      break;
    }
  }
  return decoded;
};

/** Canonical URL of the current page, without query string or hash. */
const useCanonicalUrl = () => {
  const { asPath } = useRouter();
  // Normalise the encoding: during prerendering asPath comes back double-encoded for params that
  // are already encoded (e.g. /tags/code%2520assist), in the browser it is /tags/code%20assist.
  const path = asPath
    .split(/[?#]/)[0]
    .split("/")
    .map((segment) => encodeURIComponent(decodeFully(segment)))
    .join("/");
  return path == "/" ? SITE_URL : `${SITE_URL}${path}`;
};

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  const { pathname } = useRouter();
  const canonicalUrl = useCanonicalUrl();
  const isErrorPage = pathname == "/404" || pathname == "/_error";

  useEffect(() => {
    setStylesTarget(document.getElementById("styles-target")!);
    startPosthogWhenIdle();
  }, []);

  return (
    <GLSDefaults.Provider value={{ verticalSpacing: 0, horizontalSpacing: 0 }}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta charSet="utf-8" />
        <title key="title">mikecann.blog</title>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" key="icon" />
        <link rel="shortcut icon" href="/favicon.ico" key="favicon" />
        <meta name="description" content={SITE_DESCRIPTION} key="description" />
        <meta
          name="keywords"
          content="Mike Cann Personal Blog Developer Programmer Typescript Games Unity BattleTabs Tinkering Software England Australia Manchester Perth"
          key="keywords"
        />

        {isErrorPage ? (
          <meta name="robots" content="noindex" key="robots" />
        ) : (
          <link rel="canonical" href={canonicalUrl} key="canonical" />
        )}
        <meta property="og:title" content="mikecann.blog" key="og-title" />
        <meta property="og:site_name" content="mikecann.blog" key="og-site_name" />
        <meta property="og:url" content={canonicalUrl} key="og-url" />
        <meta property="og:description" content={SITE_DESCRIPTION} key="og-description" />
        <meta property="og:image" content={`${SITE_URL}/images/me.jpg`} key="og-image" />
        <meta property="og:type" content="website" key="og-type" />
        <meta name="twitter:card" content="summary" key="twitter-card" />
        <meta name="twitter:description" content={SITE_DESCRIPTION} key="twitter-description" />
      </Head>
      <Component {...pageProps} />
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          pointerEvents: "none",
        }}
      >
        <MikebotDynamic />
      </div>
      <Analytics />
    </GLSDefaults.Provider>
  );
};

export default MyApp;
