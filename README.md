# mikecann.blog

The personal blog of Mike Cann: https://mikecann.blog

## Stack

- **[Next.js 16](https://nextjs.org)** (pages router, Turbopack). Every page is statically generated at build time from markdown files in `public/posts`.
- **[Vercel](https://vercel.com)** hosting, behind Cloudflare.
- **[Convex](https://convex.dev)** backend (`convex/`): an embedding of every post (via `@convex-dev/rag`) for Mikebot, the AI chat bot on the site (`@convex-dev/agent`, OpenAI). It also emails subscribers about new posts via Mailchimp.
- **[Algolia](https://www.algolia.com)** for search (index `next-mikecann`).
- **[Utterances](https://utteranc.es)** for comments, **[Ruffle](https://ruffle.rs)** to play old Flash embeds, and **PostHog** and Vercel Analytics for analytics.
- **[bun](https://bun.sh)** as the package manager and to run the scripts in `scripts/`.

## Local setup

```bash
bun install
bun run dev        # next dev and convex dev side by side
```

On its first run, `convex dev` asks you to log in and pick a deployment, then writes `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` to `.env.local`. To run just the site, use `bun run dev:next`.

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

Old WordPress media (`/wp-content/...`) and old Flash projects (`/flash/`, `/projects/`, ...) are proxied to CloudFront/S3 by rewrites in `next.config.js`. See `AGENTS.md` for the post audit and fix tooling.

## Build and deploy

Vercel runs `bun run build-and-deploy` (this is the Build Command in the Vercel project settings).

- **`bun run build`** (every build, including previews):
  1. `generate` writes `public/rss.xml`, `public/sitemap.xml` (both gitignored) and any missing or outdated cover thumbnails in `public/thumbs/` (committed).
  2. `next build --turbopack`.
- **Production** (`VERCEL_ENV=production`):
  1. `convex deploy --cmd 'bun run build'`. The Convex CLI runs the build first, with `NEXT_PUBLIC_CONVEX_URL` set to the production deployment. It only pushes the Convex functions if the build succeeds.
  2. `populateAlgolia` replaces the search index atomically.
  3. `uploadPostsToConvex -- --production` upserts changed posts into Convex. It runs last because creating a new post schedules the subscriber email.

  If any step fails, the steps after it don't run.

- **Preview** builds only run `bun run build`.

## Scripts

| Script                                  | What it does                                                                                                       |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `dev`, `dev:next`, `dev:convex`         | Local development                                                                                                  |
| `build`, `build-and-deploy`, `start`    | See above                                                                                                          |
| `typecheck`                             | `tsc` for the app and for `scripts/` (which has its own `scripts/tsconfig.json`)                                   |
| `test`, `dev:test`                      | vitest (Convex functions, scripts, utils)                                                                          |
| `format`, `format:check`                | prettier (`public/` is ignored so post content is never reformatted)                                               |
| `validatePosts`                         | Fast offline checks of all posts (run in CI)                                                                       |
| `auditPosts`                            | Slow, thorough audit, including every external link; `--local-only` skips the HTTP checks. See `AGENTS.md`         |
| `generate`                              | Runs `generateRSS`, `generateSitemap` and `generateThumbnails`                                                     |
| `generateThumbnails`                    | Writes a 640px WebP of each cover image to `public/thumbs/<slug>.webp`; `--force` regenerates all of them          |
| `optimizeImages <path...>`              | Re-encodes the images under a path in place, keeping each one only if it got smaller (`--quality=82`, `--dry-run`) |
| `populateAlgolia`                       | Replaces the Algolia index with the publishable posts (`--dry-run` prints what it would index)                     |
| `uploadPostsToConvex [-- --production]` | Upserts changed posts into Convex (dev deployment unless `--production`)                                           |
| `fixFlashLinks`                         | Normalizes old Flash links so they play in the site's Ruffle modal (`--dry-run` supported)                         |

`scripts/fixPosts.ts` (run with `bun run ./scripts/fixPosts.ts`) applies the automated content fixes described in `AGENTS.md`.

## Environment variables

`.env.example` lists them all by name.

**Vercel** (Project → Settings → Environment Variables):

| Name                                                     | Used by                                                                                                                                                                                                       |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CONVEX_DEPLOY_KEY`                                      | `convex deploy` in production builds (a production deploy key)                                                                                                                                                |
| `NEXT_PUBLIC_CONVEX_URL` / `NEXT_PUBLIC_CONVEX_URL_PROD` | `uploadPostsToConvex` (in production it prefers `_PROD`). `convex deploy --cmd` sets `NEXT_PUBLIC_CONVEX_URL` only for the build command, so the upload that runs afterwards needs one of these set in Vercel |
| `BLOG_POST_ADMIN_TOKEN`                                  | `uploadPostsToConvex`. Must match the Convex env var of the same name                                                                                                                                         |
| `ALGOLIA_ADMIN_KEY`                                      | `populateAlgolia`                                                                                                                                                                                             |
| `ALGOLIA_APP_ID`                                         | `populateAlgolia` (optional; defaults to the app ID the frontend uses, `JYZJ63OX7U`)                                                                                                                          |
| `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`    | PostHog analytics in the browser (disabled when the key isn't set)                                                                                                                                            |

Vercel sets `VERCEL_ENV` itself. It decides whether a build deploys, and draft posts are left out when it is `production`.

**Convex** (Dashboard → Settings → Environment Variables, or `bunx convex env set NAME value`), for each deployment:

| Name                    | Used by                                                    |
| ----------------------- | ---------------------------------------------------------- |
| `BLOG_POST_ADMIN_TOKEN` | Authorizes the admin functions `uploadPostsToConvex` calls |
| `OPENAI_API_KEY`        | Post embeddings and Mikebot's model (via `@ai-sdk/openai`) |
| `MAILCHIMP_API_KEY`     | Creating and sending the new-post email campaigns          |
| `RESEND_API_KEY`        | Mikebot's thread notification emails                       |
