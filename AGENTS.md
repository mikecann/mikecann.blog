# Agents Guide

Context and instructions for AI agents working on this codebase.

## Project Overview

This is a personal blog (mikecann.blog) built with Next.js 16, React 19, and Convex. It contains 630+ markdown posts spanning 2003 to today, stored in `public/posts/<slug>/post.md` with YAML frontmatter. See `README.md` for setup, the build/deploy pipeline, scripts and environment variables.

## Blog Post Structure

- Posts live in `public/posts/<slug>/post.md`
- Each post directory may also contain images and other assets referenced by the post
- Frontmatter fields: `title`, `date`, `tags`, `coverImage`, and optional `oldUrl`, `status`, `canonical`
- Posts use standard markdown with raw HTML allowed (via `rehype-raw`)
- Common embedded content: YouTube iframes, Mixcloud iframes, and legacy Flash/SWF embeds
- Posts are parsed by `react-markdown` (remark + `remark-gfm`). An image path containing spaces must be wrapped in `<...>` or it renders as literal text, so name new files without spaces
- Many old posts have CRLF line endings and a UTF-8 BOM. Don't normalize or mass-reformat posts: `uploadPostsToConvex` hashes the content, so every changed post is re-embedded (prettier ignores `public/` for this reason)
- `public/thumbs/<slug>.webp` is a generated 640px thumbnail of each cover image (`bun run generateThumbnails`, which also runs in every build). Commit new thumbnails along with new posts
- Run `bun run validatePosts` after changing posts. It's fast and offline, runs in CI, and checks frontmatter, cover images, unique `oldUrl`s, that every rendered image exists locally, and that no file with an image extension isn't an image

## WordPress Legacy

The blog was migrated from WordPress. Many older posts reference images via `https://www.mikecann.blog/wp-content/uploads/...` URLs. These are served through a Next.js rewrite rule in `next.config.js` that proxies `/wp-content/*` to a CloudFront distribution (`d18l99bmg6trdn.cloudfront.net`). These URLs return 403 to automated requests (bot detection) but work fine in real browsers.

## Blog Audit and Fix Scripts

### `scripts/auditPosts.ts`

Comprehensive blog post auditor. Scans all posts for broken links, missing images, dead embeds, and other issues.

```bash
bun run auditPosts                # full audit, including every external URL
bun run auditPosts --local-only   # skip the HTTP checks (a few seconds, offline)
```

Links and images are extracted by parsing each post with the same markdown parser as the site (`scripts/lib/markdown.ts`), and local paths are resolved the way the browser resolves them (`scripts/lib/postAssets.ts`).

**What it checks:**

- Dead external links (HTTP 4xx/5xx, unreachable domains, SSL errors)
- Broken local images (file doesn't exist on disk)
- Image syntax that renders as literal text (e.g. unescaped spaces in the path)
- Broken external images
- Flash/SWF embeds (no longer supported in browsers)
- Defunct service embeds (Picasa, Google Maps Engine, etc.)
- Missing or fallback cover images
- Protocol-relative URLs
- Internal links to non-existent posts

**Output:**

- `scripts/audit-report.json` - structured machine-readable report
- `scripts/audit-report.md` - human-readable markdown report

**Notes:**

- Takes around 2-3 minutes to run (checks around 3500 unique external URLs with concurrency 30)
- Uses a URL cache to avoid rechecking duplicates
- Classifies known bot-blocking domains (LinkedIn, Facebook, Medium, etc.) as skipped
- Classifies 403s from known bot-blocked sites (mikecann.blog, stackoverflow, etc.) as info severity rather than error

### `scripts/fixPosts.ts`

Applies automated fixes to blog posts based on audit findings. Idempotent - safe to re-run.

```bash
bun run ./scripts/fixPosts.ts
```

**What it fixes:**

- Domain migrations (e.g. `aboveunder.com` to `aboveunder.com.au`)
- Protocol-relative URLs (`//domain.com` to `https://domain.com`)
- Specific broken image paths (double extensions, wrong paths)
- Internal dead links (corrected slugs)
- Defunct embed replacements (replaces with no-longer-available notes)
- Downloads missing assets from CloudFront when needed

**Output:**

- `scripts/fix-log.json` - detailed log of every change made (post slug, category, old text, new text)

**Adding new fixes:**
To add a new fix category, add a new function in the script and call it from the main loop. For post-specific fixes, add a case to the `fixSpecificPosts` switch statement.

## Audit and fix workflow

When working through audit issues:

1. **Run the audit** to get the current list: `bun run auditPosts`. The list of issues is in `scripts/audit-report.json`.
2. **Fix issues** (by hand or by running `bun run ./scripts/fixPosts.ts` for automated fixes).
3. **Verify each fix.** You MUST test that the fix works (e.g. open the post on the site, check the link or image) before declaring it done. Do not mark an issue fixed without verifying.
4. **Re-run the audit** after fixes. The report shrinks because fixed issues no longer appear. Repeat until the list is empty or only items needing your input remain.

**Rules for agents:**

- If you need input from the user on how to fix something (e.g. replace dead link with Wayback vs remove), stop and ask. Do not guess.
- You MUST verify your fix works by testing it yourself (e.g. load the post in the browser, click the link, confirm the image loads) before declaring it fixed.

## Known Remaining Issues

As of Feb 2026, the blog has been comprehensively cleaned up. The audit script (`scripts/auditPosts.ts`) should show **zero errors** when run. Any errors that appear are new and should be fixed.

### Audit severity levels

- **error** - genuinely broken, fixable, should be zero of these
- **warning** - known-deferred issues (external dead links, can't fix other people's websites)
- **info** - handled by the system (Flash via Ruffle, bot-blocked 403s)

### Accepted/deferred issues (warning or info severity)

- **Dead external links** (~490 across ~200 posts, severity: `warning`) - old posts link to sites that have gone dark over the years. Not fixable without manual curation post-by-post.
- **Flash/SWF embeds** (~60 across ~40 posts, severity: `info`) - handled by the Ruffle Flash emulator loaded in `_app.tsx`. Internal SWF files are served via Next.js rewrites to CloudFront/S3.
- **Bot-blocked 403s** (~84 URLs, severity: `info`) - mostly `www.mikecann.blog/wp-content/...` which work fine in real browsers via the CloudFront rewrite.

### What was fixed in Feb 2026

- Added Ruffle Flash emulator for all SWF embeds
- Added Next.js rewrites for `/flash/`, `/DumpingGround/`, `/projects/`, `/ArtificialStudios1/`, `/Files/`, `/Work/` to CloudFront/S3
- Fixed all dead third-party Flash embeds (replaced with notes), rescued Vimeo ones to iframes
- Fixed all WordPress absolute URLs to relative paths
- Fixed all broken images from old `mikecann.blog/Images/`, `/Work/`, `/Files/` paths
- Fixed all WordPress `?p=ID` style links (38 across posts)
- Fixed S3 directory links and mikes-mirror cross-post links
- Generated AI header images for all 419 posts that had the fallback cover
- Fixed `/atom.xml` links to `/rss.xml`

## Other Scripts

All of them are also `package.json` scripts (`bun run <name>`); see `README.md`.

- `scripts/validatePosts.ts` - fast offline content checks, run in CI
- `scripts/generateRSS.ts` - writes `public/rss.xml` (gitignored, generated in every build)
- `scripts/generateSitemap.ts` - writes `public/sitemap.xml` (gitignored, generated in every build)
- `scripts/generateThumbnails.ts` - writes `public/thumbs/<slug>.webp` for new or changed cover images
- `scripts/optimizeImages.ts` - re-encodes images in place (`bun run optimizeImages public/posts/<slug>`)
- `scripts/fixFlashPlayableLinks.ts` - normalizes old Flash links so they play in the Ruffle modal (`--dry-run`)
- `scripts/populateAlgolia.ts` - replaces the Algolia search index (production deploys only; `--dry-run`)
- `scripts/uploadPostsToConvex.ts` - upserts changed posts into Convex; creating a new post schedules the subscriber email, so it runs last in production deploys

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
