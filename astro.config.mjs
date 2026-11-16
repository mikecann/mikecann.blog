// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";

// The browser code reads these as `process.env.NAME` (shared with the scripts and Convex code), so
// they're inlined at build time. Only public values belong here: they end up in the page JS.
const publicEnv = [
  "NEXT_PUBLIC_CONVEX_URL",
  "NEXT_PUBLIC_CONVEX_SITE_URL",
  "NEXT_PUBLIC_ASSET_BASE_URL",
  "NEXT_PUBLIC_POSTHOG_KEY",
  "NEXT_PUBLIC_POSTHOG_HOST",
  "BLOG_SENTRY_RELEASE",
];

const define = Object.fromEntries(
  publicEnv.map((name) => [`process.env.${name}`, JSON.stringify(process.env[name] ?? "")]),
);

export default defineConfig({
  site: "https://mikecann.blog",
  // Pages live at /posts/<slug> with no trailing slash, as they always have: `file` builds
  // posts/<slug>.html, which Cloudflare serves at /posts/<slug>.
  trailingSlash: "never",
  build: { format: "file" },
  integrations: [react()],
  vite: { define },
});
