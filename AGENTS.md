# Agents Guide

Context and instructions for AI agents working on this codebase.

## Project Overview

This is a personal blog (mikecann.blog) built with Next.js 16, React 19, and Convex. It contains 625+ markdown posts spanning 2004-2025, stored in `public/posts/<slug>/post.md` with YAML frontmatter.

## Blog Post Structure

- Posts live in `public/posts/<slug>/post.md`
- Each post directory may also contain images and other assets referenced by the post
- Frontmatter fields: `title`, `date`, `tags`, `coverImage`, and optional `oldUrl`, `status`, `canonical`
- Posts use standard markdown with raw HTML allowed (via `rehype-raw`)
- Common embedded content: YouTube iframes, Mixcloud iframes, and legacy Flash/SWF embeds

## WordPress Legacy

The blog was migrated from WordPress. Many older posts reference images via `https://www.mikecann.blog/wp-content/uploads/...` URLs. These are served through a Next.js rewrite rule in `next.config.js` that proxies `/wp-content/*` to a CloudFront distribution (`d18l99bmg6trdn.cloudfront.net`). These URLs return 403 to automated requests (bot detection) but work fine in real browsers.

## Blog Audit and Fix Scripts

### `scripts/auditPosts.ts`

Comprehensive blog post auditor. Scans all posts for broken links, missing images, dead embeds, and other issues.

```bash
bun run ./scripts/auditPosts.ts
```

**What it checks:**
- Dead external links (HTTP 4xx/5xx, unreachable domains, SSL errors)
- Broken local images (file doesn't exist on disk)
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

## Known Remaining Issues

As of Feb 2025, the following issues are known but intentionally deferred:

- **Flash/SWF embeds** (79 across 45 posts) - these render as nothing in modern browsers. A future project could use Ruffle (Flash WASM emulator) to restore them.
- **Dead external links** (around 460 across around 200 posts) - these need case-by-case decisions (Wayback Machine, removal, etc.)
- **Fallback cover images** (410 posts) - these use `/images/fallback-post-header.png` instead of a custom header. This is a content/design task.
- **Bot-blocked 403s** (around 1200 URLs, mostly `www.mikecann.blog/wp-content/...`) - these work for real users via the CloudFront rewrite but fail for automated checkers.

## Other Scripts

- `scripts/generateRSS.ts` - generates RSS feed
- `scripts/uploadPostsToConvex.ts` - uploads post metadata to Convex
- `scripts/populateAlgolia.ts` - populates Algolia search index
- `scripts/normalizePosts.ts` - one-time migration script for normalizing post metadata
- `scripts/replaceUrlsInPosts.ts` - URL replacement utility
- `scripts/extractAndInsertOldUrls.ts` - extracts old WordPress URLs for redirect mapping
