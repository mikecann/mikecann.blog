import { AppProps } from "next/app";
import "../styles/normalize.css";
import "../styles/globals.css";
import Head from "next/head";
import { useEffect } from "react";
import { setStylesTarget } from "typestyle";
import { Analytics } from "@vercel/analytics/react";
import { PostHogProvider } from "posthog-js/react";
import posthog from "posthog-js";
import dynamic from "next/dynamic";
import { GLSDefaults } from "gls";
import Script from "next/script";

const MikebotDynamic = dynamic(() => import("../components/mikebot/Mikebot"), { ssr: false });

if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  // checks that we are client-side
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "", {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    person_profiles: "identified_only", // or 'always' to create profiles for anonymous users as well
    loaded: (posthog) => {
      if (process.env.NODE_ENV === "development") posthog.debug(); // debug mode in development
    },
  });
}

// normalize();
// setupPage("body");

// This default export is required in a new `pages/_app.js` file.
const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  useEffect(() => {
    setStylesTarget(document.getElementById("styles-target")!);
  }, []);

  return (
    <GLSDefaults.Provider value={{ verticalSpacing: 0, horizontalSpacing: 0 }}>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />

        <meta charSet="utf-8" />
        <title key="title">mikecann.blog</title>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" key="icon" />
        <link rel="shortcut icon" href="/favicon.ico" key="favicon" />
        <meta name="description" content="BattleTabs" key="description" />
        <meta
          name="keywords"
          content="Mike Cann Personal Blog Developer Programmer Typescript Games Unity BattleTabs Tinkering Software England Australia Manchester Perth"
          key="keywords"
        />

        <meta property="og:title" content="mikecann.blog" key="og-title" />
        <meta property="og:site_name" content="mikecann.blog" key="og-site_name" />
        <meta property="og:url" content="https://mikecann.blog" key="og-url" />
        <meta property="og:description" content="The Blog of Mike Cann" key="og-description" />
        <meta property="og:image" content="https://mikecann.blog/images/me.jpg" key="og-image" />
        <meta property="og:type" content="website" key="og-type" />
      </Head>
      <PostHogProvider client={posthog}>
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
      </PostHogProvider>
      <Analytics />
      {/* Ruffle - Flash emulator, auto-intercepts all <embed src="*.swf"> on the page */}
      <Script src="https://unpkg.com/@ruffle-rs/ruffle" strategy="lazyOnload" />
    </GLSDefaults.Provider>
  );
};

export default MyApp;
