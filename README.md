# mikecann.blog

The personal blog of Mike Cann: https://mikecann.blog

## Stack

- **[Astro](https://astro.build)** builds every page to a static HTML file from the markdown in `public/posts`. The page components are React (`components/`), rendered to HTML at build time; only the interactive parts (search, Mikebot, the newsletter forms, comments, the activity panels) load JavaScript, as Astro islands. Pages are in `src/pages`, layouts in `src/layouts`.
- **[Cloudflare Workers](https://developers.cloudflare.com/workers/static-assets/)** hosting: the pages are the Worker's static assets, and `worker/index.ts` handles the rest (`/api/activity`, old WordPress URLs, the 404 page).
- **[Convex](https://convex.dev)** backend (`convex/`): an embedding of every post (via `@convex-dev/rag`) for Mikebot, the AI chat bot on the site (`@convex-dev/agent`, OpenAI). It also emails subscribers about new posts via Mailchimp.
- **[Algolia](https://www.algolia.com)** for search (index `next-mikecann`).
- **[Utterances](https://utteranc.es)** for comments, **[Ruffle](https://ruffle.rs)** to play old Flash embeds, and **PostHog** for analytics.
- **[Sentry](https://sentry.io)** for errors (project `mikecann-blog`), from the production deployment only: the browser in `instrumentation-client.ts` / `utils/sentryClient.ts` (tag `component: web`) and pages and API routes in `instrumentation.ts` (`component: server`). Errors only, no tracing or replay, and no source map upload. The Convex backend's errors reach Sentry through Convex's log stream.
- **[bun](https://bun.sh)** as the package manager and to run the scripts in `scripts/`.

## Local setup

```bash
bun install
bun run dev        # astro dev and convex dev side by side
```

On its first run, `convex dev` asks you to log in and pick a deployment, then writes `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` to `.env.local`. To run just the site, use `bun run dev:astro`. To try the production build with the Worker, `bun run build` then `bun run preview` (wrangler dev).

For the scripts that talk to other services, copy `.env.example` to `.env` and fill in what you need. Bun loads `.env` and `.env.local` automatically.

## Posts

Each post is a folder: `public/posts/<slug>/post.md`, with its images and other files next to it. The folder name is the URL: `/posts/<slug>`.

```yaml
---
title: My Post
date: 2026-01-31T00:00:00.000Z
tags: [convex, ai]
coverImage: ./header.webp # relative to the post folder, or an absolute /path under public/
status: draft # optional: draft posts are left out of production builds
oldUrl: /2014/01/my-post # optional: permanently redirects here (from the WordPress days)
canonical: https://... # optional
---
The intro. It's used as the RSS excerpt.

<!-- more -->

The rest of the post. Standard markdown plus GFM, and raw HTML (iframes etc.) is allowed.

![alt text](./image.png)
```

- Refer to images with `./file.png`. File names with spaces must be wrapped in `<...>`, so it's easier to avoid spaces.
- Shrink new images with `bun run optimizeImages public/posts/<slug>`.
- Run `bun run validatePosts` before pushing. It checks frontmatter, cover images and image references, and runs in CI.
- Avoid mass-reformatting or re-saving old posts (many have CRLF line endings or a BOM). The Convex upload hashes each post's content, so any change re-embeds that post.

Old WordPress media (`/wp-content/...`) and old Flash projects (`/flash/`, `/projects/`, ...) are proxied to CloudFront/S3 by the Worker (`worker/index.ts`). See `AGENTS.md` for the post audit and fix tooling.

## Build and deploy

Every push to `main` deploys, through `.github/workflows/deploy.yml`:

1. `convex deploy --cmd 'bun run build && bun run syncAssets'`. The Convex CLI runs the build first, with `NEXT_PUBLIC_CONVEX_URL` set to the production deployment, then uploads new or changed media to R2 (see below). It only pushes the Convex functions if both succeed.
   - `bun run build` runs `generate` (writes `public/rss.xml`, `public/sitemap.xml` and `worker/redirects.generated.json`, all gitignored, plus any missing cover thumbnails in `public/thumbs/`, which are committed), then `astro build` into `dist/`.
2. `wrangler deploy` uploads `dist/` and the Worker to Cloudflare. Only changed files are uploaded.
3. `uploadPostsToConvex -- --production` upserts changed posts into Convex. It runs once the site is live because creating a new post schedules the subscriber email, which waits until the post's page loads.
4. `populateAlgolia` replaces the search index atomically. It's last so a search problem can't hold up the posts.

If any step fails, the steps after it don't run. `DEPLOY_ENV=production` marks a production build: drafts are left out and `syncAssets` may replace files already in R2.

To try a build on Cloudflare without touching the live site, `bunx wrangler versions upload` gives a preview URL for that version.

### Serving media from Cloudflare R2

Post media and thumbnails are served from the `mikecann-blog-assets` R2 bucket at `assets.mikecann.blog` (`NEXT_PUBLIC_ASSET_BASE_URL`). Images stay in git next to each `post.md`; deploys upload anything new or changed (compared by MD5). The Worker's own assets include the media too, so old `/posts/<slug>/<file>` links still work.

With `NEXT_PUBLIC_ASSET_BASE_URL` set, pages, RSS, `og:image` and search thumbnails link straight to the asset domain. `syncAssets` never deletes objects from R2, so old links keep working. Unset it and the pages link to the copies in the Worker's assets instead.

Only production deploys (`DEPLOY_ENV=production`) replace a file that's already in R2. Local runs only upload files that are missing, and list the changed ones they skipped.

The R2 credentials are derived from the deploy's Cloudflare API token (access key ID = the token's ID, secret = the SHA-256 of the token), so one token covers both.

## Newsletter signups

New posts are emailed to a Mailchimp list (see `convex/mailchimp`). Readers sign up through the site's own forms, which call the Convex HTTP action `POST /newsletter/subscribe` (`convex/http.ts`); nothing from Mailchimp is loaded on the page.

- The endpoint adds the address as `pending`, so Mailchimp sends its double opt-in confirmation email, and tags it with the form it came from (`blog-post-footer`, `blog-post-prompt`, `blog-subscribe-page`, `blog-about`). Filter by tag in Mailchimp to see which forms work.
- It's rate limited per address and overall (each signup triggers a confirmation email), has a honeypot field for bots, and only the production deployment adds people to the real list.
- The forms: the end of every post (`#subscribe`), a dismissible slide-in on posts once a reader is halfway through (never shown again after signing up, and hidden for 30 days after "No thanks"), the `/subscribe` page (linked from the sidebar) and the About page.
- Signups, failures and prompt views/dismissals are sent to PostHog as `newsletter_*` events.

## New post emails

When a deploy uploads a new, recent, published post, its email to subscribers is a row in `postEmailCampaigns` that the `postEmail` state machine moves along ([`@convex-dev/state-machines`](https://github.com/convex/state-machines), vendored in `vendor/`). The rules, with a sentence on every state and transition, are in `convex/mailchimp/machine.ts`, and the diagram is in [docs/state-machines.md](docs/state-machines.md), generated from them (`bun run machines:diagrams`; `bun run test` fails when it's out of date).

- It waits 30 minutes, then checks the post's page returns 200 (every 10 minutes for two hours), then creates, fills and sends one Mailchimp campaign. Each state the send can stall in has a timer, so nothing stays stuck.
- A renamed post isn't emailed twice: before sending, it looks for an earlier email with the same title or date whose post has gone (`convex/mailchimp/earlierEmail.ts`).
- A retry resumes the same Mailchimp campaign and asks Mailchimp first whether it already went out, so it never sends twice. When a send call fails, it asks Mailchimp too, rather than guessing.
- Problems are printed at the end of every deploy, with the command to retry: `mailchimp/admin/mutations:retryFailedPostEmailCampaign`.
- Only the catalog's `internalMutation` (`convex/machines.ts`) may move a campaign, and `bun run lint` runs the library's rules on `convex/` (the rest of the codebase isn't linted).

The admin Machines page, [/admin/machines](https://mikecann.blog/admin/machines), shows the machines live, with the rows in each state and their history. Sign in with Google (Convex Auth v2, `convex/admin/auth.ts`). Only the Google addresses on `BLOG_ADMIN_EMAILS` get an account, and the page's queries (`convex/viewer.ts`) answer nobody else. The Google OAuth client is "mikecann.blog admin (Convex)" in the `mikecann-blog` Google Cloud project on mike.cann@gmail.com. Its consent screen is in Testing, so a new admin also has to be added as a test user there. Its redirect URIs are `<deployment>.convex.site/oauth/google/callback` for prod and dev.

## Scripts

| Script                                  | What it does                                                                                                       |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `dev`, `dev:astro`, `dev:convex`        | Local development                                                                                                  |
| `build`, `preview`                      | See above; `preview` serves `dist/` with the Worker through `wrangler dev`                                         |
| `lint`                                  | The state machines library's lint rules on `convex/`                                                               |
| `machines:diagrams`                     | Rewrites `docs/state-machines.md` from the machines' rules                                                         |
| `typecheck`                             | `tsc` for the app, `scripts/` and `worker/` (each has its own tsconfig)                                            |
| `test`, `dev:test`                      | vitest (Convex functions, scripts, utils)                                                                          |
| `format`, `format:check`                | prettier (`public/` is ignored so post content is never reformatted)                                               |
| `validatePosts`                         | Fast offline checks of all posts (run in CI)                                                                       |
| `auditPosts`                            | Slow, thorough audit, including every external link; `--local-only` skips the HTTP checks. See `AGENTS.md`         |
| `generate`                              | Runs `generateRSS`, `generateSitemap`, `generateThumbnails` and `generateRedirects` (old WordPress URLs)           |
| `generateThumbnails`                    | Writes a 640px WebP of each cover image to `public/thumbs/<slug>.webp`; `--force` regenerates all of them          |
| `optimizeImages <path...>`              | Re-encodes the images under a path in place, keeping each one only if it got smaller (`--quality=82`, `--dry-run`) |
| `populateAlgolia`                       | Replaces the Algolia index with the publishable posts (`--dry-run` prints what it would index)                     |
| `uploadPostsToConvex [-- --production]` | Upserts changed posts into Convex (dev deployment unless `--production`)                                           |
| `syncAssets [-- --dry-run]`             | Uploads new post media and thumbnails to R2 (and changed ones in production); a no-op without the `R2_*` env vars  |
| `fixFlashLinks`                         | Normalizes old Flash links so they play in the site's Ruffle modal (`--dry-run` supported)                         |

`scripts/fixPosts.ts` (run with `bun run ./scripts/fixPosts.ts`) applies the automated content fixes described in `AGENTS.md`.

## Environment variables

`.env.example` lists them all by name.

**GitHub** (repo → Settings → Secrets and variables → Actions), used by the deploy workflow. Public values are variables, the rest are secrets:

| Name                                                  | Kind     | Used by                                                                                                                      |
| ----------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `CONVEX_DEPLOY_KEY`                                   | secret   | `convex deploy` (a production deploy key with only `deployment:deploy`)                                                      |
| `CLOUDFLARE_API_TOKEN`                                | secret   | `wrangler deploy`; also the source of the R2 credentials. Scoped to the account's Workers and R2 and the blog's zone         |
| `CLOUDFLARE_ACCOUNT_ID`                               | variable | `wrangler deploy`                                                                                                            |
| `R2_ACCOUNT_ID`, `R2_BUCKET`                          | variable | `syncAssets`                                                                                                                 |
| `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`            | secret   | `syncAssets`; derived from `CLOUDFLARE_API_TOKEN` (see "Serving media from Cloudflare R2")                                   |
| `NEXT_PUBLIC_CONVEX_URL_PROD`                         | variable | `uploadPostsToConvex` (`convex deploy --cmd` only sets `NEXT_PUBLIC_CONVEX_URL` for the build command)                       |
| `BLOG_POST_ADMIN_TOKEN`                               | secret   | `uploadPostsToConvex`. Must match the Convex env var of the same name                                                        |
| `ALGOLIA_ADMIN_KEY`                                   | secret   | `populateAlgolia`: a key limited to the `next-mikecann*` indices with only the write permissions it needs, not the admin key |
| `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` | variable | PostHog analytics in the browser (disabled when the key isn't set)                                                           |
| `NEXT_PUBLIC_ASSET_BASE_URL`                          | variable | Where post media and thumbnails are served from (`https://assets.mikecann.blog`)                                             |

The `NEXT_PUBLIC_` names are left over from Next.js; `astro.config.mjs` inlines them into the browser code. `ALGOLIA_APP_ID` is optional and defaults to the app ID the frontend uses, `JYZJ63OX7U`.

**Convex** (Dashboard → Settings → Environment Variables, or `bunx convex env set NAME value`), for each deployment:

Mikebot's model and the blog-search embeddings go through the [Convex AI Gateway](https://docs.convex.dev/ai-gateway/overview), so no AI provider keys are needed; it needs a paid Convex plan and bills at OpenRouter's rates. Mikebot's own daily budgets (below) stop it before Convex's deployment usage limits would: hitting a Convex **disable** threshold turns off the whole deployment, including post uploads and newsletter signups, so set those limits well above the Mikebot budget.

| Name                                                 | Used by                                                                                                                                 |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `BLOG_POST_ADMIN_TOKEN`                              | Authorizes the admin functions `uploadPostsToConvex` calls                                                                              |
| `MAILCHIMP_API_KEY`                                  | Creating and sending the new-post email campaigns (only the production deployment sends)                                                |
| `MIKEBOT_MODEL`                                      | Optional. Which Convex AI Gateway model Mikebot uses (default `openai/gpt-6-luna`), e.g. `google/gemini-3.8-flash` or `openrouter/auto` |
| `MIKEBOT_DAILY_TOKEN_BUDGET`                         | Optional. Max tokens Mikebot may use per UTC day (default 2,000,000; `0` turns Mikebot off)                                             |
| `MIKEBOT_DAILY_COST_BUDGET_USD`                      | Optional. Max USD Mikebot may spend per UTC day (default 2; `0` turns Mikebot off)                                                      |
| `AUTH_PRIVATE_KEY`, `AUTH_JWKS`                      | Convex Auth's signing keys, for the admin pages' sign-in. `bun run ./scripts/setAuthKeys.ts [--prod]` makes them                        |
| `AUTH_GOOGLE_CLIENT_ID`, `AUTH_GOOGLE_CLIENT_SECRET` | The Google OAuth client the admin pages sign in with (see "New post emails")                                                            |
| `BLOG_ADMIN_EMAILS`                                  | The Google addresses that may sign in to the admin pages, comma separated                                                               |
| `MAILCHIMP_ALLOW_NON_PRODUCTION_SEND`                | Optional. `true` lets a non-production deployment send real campaign emails                                                             |
