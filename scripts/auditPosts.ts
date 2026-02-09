/**
 * Blog Post Audit Script
 *
 * Scans all 625+ blog posts for:
 * 1. Dead external links (HTTP 4xx/5xx or unreachable)
 * 2. Broken local images (file doesn't exist on disk)
 * 3. Broken external images (HTTP errors)
 * 4. Dead/obsolete embeds (Flash/SWF, defunct services)
 * 5. Missing or fallback cover images
 * 6. Broken iframes (YouTube removed, defunct services)
 *
 * Usage: bun run ./scripts/auditPosts.ts
 * Output: ./scripts/audit-report.json and ./scripts/audit-report.md
 */

import fs from "fs";
import { join, resolve } from "path";
import matter from "gray-matter";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Issue {
  type:
    | "dead-link"
    | "broken-image"
    | "flash-embed"
    | "defunct-embed"
    | "missing-cover-image"
    | "fallback-cover-image"
    | "broken-iframe"
    | "protocol-relative-url";
  severity: "error" | "warning" | "info";
  url?: string;
  description: string;
  line?: number;
  httpStatus?: number;
}

interface PostAuditResult {
  slug: string;
  title: string;
  date: string;
  issues: Issue[];
}

interface AuditReport {
  timestamp: string;
  totalPosts: number;
  postsWithIssues: number;
  totalIssues: number;
  issuesByType: Record<string, number>;
  issuesBySeverity: Record<string, number>;
  results: PostAuditResult[];
}

// ─── Config ──────────────────────────────────────────────────────────────────

const CONCURRENCY = 30; // max concurrent HTTP requests
const HTTP_TIMEOUT = 8_000; // 8 seconds
const RETRY_COUNT = 1;
const RETRY_DELAY = 500;

const postsDirectory = join(process.cwd(), "public/posts");
const publicDirectory = join(process.cwd(), "public");

// Domains known to block bots / always timeout - skip HTTP checks for these
const SKIP_DOMAINS = new Set([
  "linkedin.com",
  "www.linkedin.com",
  "facebook.com",
  "www.facebook.com",
  "instagram.com",
  "www.instagram.com",
  "twitter.com",
  "x.com",
  "t.co",
]);

// Domains that return 403 due to bot detection but are likely fine for real browsers
// These will be reported as "info" rather than "error"
const BOT_BLOCKED_403_DOMAINS = new Set([
  "www.mikecann.blog",
  "mikecann.blog",
  "medium.com",
  "openai.com",
  "beta.openai.com",
  "platform.openai.com",
  "soundcloud.com",
  "www.twitter.com",
  "stackoverflow.com",
  "serverfault.com",
  "themeforest.net",
  "www.forbes.com",
  "www.raspberrypi.org",
  "www.newgrounds.com",
  "www.midjourney.com",
  "www.unrealengine.com",
  "venturebeat.com",
  "www.weforum.org",
  "www.microsoft.com",
  "portal.acm.org",
]);

// Defunct services that we know are dead
const DEFUNCT_SERVICES: Record<string, string> = {
  "flash.revver.com": "Revver (defunct video platform)",
  "games.mochiads.com": "Mochi Media (defunct Flash game platform)",
  "www.videoegg.com": "VideoEgg (defunct video platform)",
  "video.google.com": "Google Video (defunct, merged into YouTube)",
  "picasaweb.google.com": "Picasa Web Albums (defunct, migrated to Google Photos)",
  "mapsengine.google.com": "Google Maps Engine (defunct)",
  "www.yourworldoftext.com": "Your World of Text (unreliable)",
  "feeds.feedburner.com": "FeedBurner (largely defunct)",
};

// ─── URL Extraction ──────────────────────────────────────────────────────────

function extractMarkdownLinks(content: string): Array<{ url: string; line: number }> {
  const results: Array<{ url: string; line: number }> = [];
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Markdown links: [text](url) - but not images
    const linkRegex = /(?<!!)\[([^\]]*)\]\(([^)]+)\)/g;
    let match;
    while ((match = linkRegex.exec(line)) !== null) {
      let url = match[2].trim();
      // Handle [text](url "title") - only split on space before a quote
      const titleMatch = url.match(/^(.+?)\s+["']/);
      if (titleMatch) {
        url = titleMatch[1];
      }
      if (url && !url.startsWith("#") && !url.startsWith("mailto:")) {
        results.push({ url, line: lineNum });
      }
    }
  }

  return results;
}

function extractMarkdownImages(content: string): Array<{ url: string; line: number }> {
  const results: Array<{ url: string; line: number }> = [];
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Markdown images: ![alt](url)
    const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let match;
    while ((match = imgRegex.exec(line)) !== null) {
      let url = match[2].trim();
      // Handle ![alt](url "title") - only split on space before a quote
      const titleMatch = url.match(/^(.+?)\s+["']/);
      if (titleMatch) {
        url = titleMatch[1];
      }
      if (url) {
        results.push({ url, line: lineNum });
      }
    }
  }

  return results;
}

function extractHtmlImages(content: string): Array<{ url: string; line: number }> {
  const results: Array<{ url: string; line: number }> = [];
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // HTML img tags: <img src="url">
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
    let match;
    while ((match = imgRegex.exec(line)) !== null) {
      results.push({ url: match[1], line: lineNum });
    }
  }

  return results;
}

function extractIframes(content: string): Array<{ url: string; line: number; raw: string }> {
  const results: Array<{ url: string; line: number; raw: string }> = [];
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    const iframeRegex = /<iframe[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let match;
    while ((match = iframeRegex.exec(line)) !== null) {
      results.push({ url: match[1], line: lineNum, raw: match[0] });
    }
  }

  return results;
}

function extractFlashEmbeds(
  content: string
): Array<{ url: string; line: number; raw: string }> {
  const results: Array<{ url: string; line: number; raw: string }> = [];
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // <embed> tags with SWF
    const embedRegex = /<embed[^>]+src=["']([^"']*\.swf[^"']*)["'][^>]*>/gi;
    let match;
    while ((match = embedRegex.exec(line)) !== null) {
      results.push({ url: match[1], line: lineNum, raw: match[0] });
    }

    // <object> tags with SWF data
    const objectRegex = /<object[^>]+data=["']([^"']*\.swf[^"']*)["'][^>]*>/gi;
    while ((match = objectRegex.exec(line)) !== null) {
      results.push({ url: match[1], line: lineNum, raw: match[0] });
    }

    // <param> tags with SWF value
    const paramRegex = /<param[^>]+value=["']([^"']*\.swf[^"']*)["'][^>]*>/gi;
    while ((match = paramRegex.exec(line)) !== null) {
      results.push({ url: match[1], line: lineNum, raw: match[0] });
    }
  }

  return results;
}

function extractHtmlLinks(content: string): Array<{ url: string; line: number }> {
  const results: Array<{ url: string; line: number }> = [];
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // <a href="url">
    const linkRegex = /<a[^>]+href=["']([^"']+)["']/gi;
    let match;
    while ((match = linkRegex.exec(line)) !== null) {
      const url = match[1];
      if (url && !url.startsWith("#") && !url.startsWith("mailto:") && !url.startsWith("javascript:")) {
        results.push({ url, line: lineNum });
      }
    }
  }

  return results;
}

// ─── URL Checking ────────────────────────────────────────────────────────────

function getDomain(url: string): string | null {
  try {
    const parsed = new URL(url.startsWith("//") ? `https:${url}` : url);
    return parsed.hostname;
  } catch {
    return null;
  }
}

function isExternalUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//");
}

function isLocalFileRef(url: string): boolean {
  return url.startsWith("./") || url.startsWith("../") || (url.startsWith("/") && !url.startsWith("//"));
}

// Cache of URL check results to avoid rechecking the same URL
const urlCache = new Map<string, { ok: boolean; status?: number; error?: string }>();

async function checkUrl(
  url: string,
  retries = RETRY_COUNT
): Promise<{ ok: boolean; status?: number; error?: string }> {
  // Normalize
  const normalizedUrl = url.startsWith("//") ? `https:${url}` : url;

  if (urlCache.has(normalizedUrl)) {
    return urlCache.get(normalizedUrl)!;
  }

  const domain = getDomain(normalizedUrl);
  if (domain && SKIP_DOMAINS.has(domain)) {
    const result = { ok: true, status: 0, error: "skipped (known bot-blocking domain)" };
    urlCache.set(normalizedUrl, result);
    return result;
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), HTTP_TIMEOUT);

      // Try HEAD first (faster), fall back to GET
      let response: Response;
      try {
        response = await fetch(normalizedUrl, {
          method: "HEAD",
          signal: controller.signal,
          redirect: "follow",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });
      } catch {
        // Some servers reject HEAD, try GET
        response = await fetch(normalizedUrl, {
          method: "GET",
          signal: controller.signal,
          redirect: "follow",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });
      }

      clearTimeout(timeout);

      const result = {
        ok: response.status < 400,
        status: response.status,
      };
      urlCache.set(normalizedUrl, result);
      return result;
    } catch (e: any) {
      if (attempt < retries) {
        await sleep(RETRY_DELAY * (attempt + 1));
        continue;
      }
      const result = {
        ok: false,
        error: e.code || e.message || "Unknown error",
      };
      urlCache.set(normalizedUrl, result);
      return result;
    }
  }

  // Should never reach here
  const result = { ok: false, error: "Max retries exceeded" };
  urlCache.set(normalizedUrl, result);
  return result;
}

function checkLocalFile(url: string, postDir: string): boolean {
  if (url.startsWith("./") || url.startsWith("../")) {
    const absPath = resolve(postDir, url);
    return fs.existsSync(absPath);
  }

  if (url.startsWith("/")) {
    // Could be /posts/... or /images/... - resolve from public dir
    const absPath = join(publicDirectory, url);
    return fs.existsSync(absPath);
  }

  return true; // Can't determine, assume OK
}

// ─── Concurrency helpers ─────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function pMap<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency: number
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let idx = 0;

  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      results[i] = await fn(items[i]);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

// ─── Post Audit ──────────────────────────────────────────────────────────────

// Phase 1: Parse all posts synchronously and collect local issues + external URLs to check
interface ParsedPost {
  slug: string;
  title: string;
  date: string;
  localIssues: Issue[];
  externalUrls: Array<{ url: string; line: number; isImage: boolean }>;
}

function parsePost(slug: string): ParsedPost {
  const postDir = join(postsDirectory, slug);
  const absPostPath = join(postDir, "post.md");
  const fileContents = fs.readFileSync(absPostPath, "utf8");
  const { data, content } = matter(fileContents);

  const localIssues: Issue[] = [];
  const title = data.title || slug;
  const date = data.date instanceof Date ? data.date.toISOString() : String(data.date || "unknown");

  // ── 1. Check cover image ──────────────────────────────────────────────────

  const coverImage: string = data.coverImage || "";

  if (!coverImage) {
    localIssues.push({
      type: "missing-cover-image",
      severity: "warning",
      description: "No coverImage set in frontmatter",
    });
  } else if (coverImage === "/images/fallback-post-header.png") {
    localIssues.push({
      type: "fallback-cover-image",
      severity: "info",
      description: "Using fallback cover image (no custom header)",
      url: coverImage,
    });
  } else {
    if (!isExternalUrl(coverImage)) {
      const exists = checkLocalFile(coverImage, postDir);
      if (!exists) {
        localIssues.push({
          type: "broken-image",
          severity: "error",
          description: `Cover image file not found: ${coverImage}`,
          url: coverImage,
        });
      }
    }
  }

  // ── 2. Check Flash embeds ─────────────────────────────────────────────────

  const flashEmbeds = extractFlashEmbeds(content);
  for (const embed of flashEmbeds) {
    localIssues.push({
      type: "flash-embed",
      severity: "error",
      description: `Flash/SWF embed (no longer supported in browsers)`,
      url: embed.url,
      line: embed.line,
    });
  }

  // ── 3. Check iframes ─────────────────────────────────────────────────────

  const iframes = extractIframes(content);
  for (const iframe of iframes) {
    const domain = getDomain(iframe.url);

    if (domain && DEFUNCT_SERVICES[domain]) {
      localIssues.push({
        type: "defunct-embed",
        severity: "error",
        description: `Iframe to defunct service: ${DEFUNCT_SERVICES[domain]}`,
        url: iframe.url,
        line: iframe.line,
      });
      continue;
    }

    if (iframe.url.startsWith("//")) {
      localIssues.push({
        type: "protocol-relative-url",
        severity: "warning",
        description: `Protocol-relative iframe URL (should use https://)`,
        url: iframe.url,
        line: iframe.line,
      });
    }
  }

  // ── 4. Collect all URLs ───────────────────────────────────────────────────

  const markdownLinks = extractMarkdownLinks(content);
  const markdownImages = extractMarkdownImages(content);
  const htmlImages = extractHtmlImages(content);
  const htmlLinks = extractHtmlLinks(content);

  const allUrlItems: Array<{ url: string; line: number; isImage: boolean }> = [];
  const seenUrls = new Set<string>();

  const addUrl = (url: string, line: number, isImage: boolean) => {
    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      allUrlItems.push({ url, line, isImage });
    }
  };

  for (const l of markdownLinks) addUrl(l.url, l.line, false);
  for (const i of markdownImages) addUrl(i.url, i.line, true);
  for (const i of htmlImages) addUrl(i.url, i.line, true);
  for (const l of htmlLinks) addUrl(l.url, l.line, false);

  // ── 5. Check local file references ────────────────────────────────────────

  for (const item of allUrlItems) {
    if (isLocalFileRef(item.url)) {
      if (item.url.match(/^\/posts\/[a-z0-9-]+\/?$/i) && !item.isImage) {
        const linkedSlug = item.url.replace(/^\/posts\//, "").replace(/\/$/, "");
        const linkedPostDir = join(postsDirectory, linkedSlug);
        if (!fs.existsSync(linkedPostDir)) {
          localIssues.push({
            type: "dead-link",
            severity: "error",
            description: `Internal link to non-existent post`,
            url: item.url,
            line: item.line,
          });
        }
        continue;
      }

      if (item.url.startsWith("/") && !item.isImage && !item.url.match(/\.\w{2,5}$/)) {
        continue;
      }

      const exists = checkLocalFile(item.url, postDir);
      if (!exists) {
        localIssues.push({
          type: item.isImage ? "broken-image" : "dead-link",
          severity: "error",
          description: `Local file not found`,
          url: item.url,
          line: item.line,
        });
      }
    }
  }

  // ── 6. Collect external URLs for later batch checking ─────────────────────

  const externalUrls = allUrlItems.filter((item) => isExternalUrl(item.url));

  // Also add iframe URLs that aren't from defunct services
  for (const iframe of iframes) {
    const domain = getDomain(iframe.url);
    if (domain && !DEFUNCT_SERVICES[domain] && isExternalUrl(iframe.url.startsWith("//") ? `https:${iframe.url}` : iframe.url)) {
      if (!seenUrls.has(iframe.url)) {
        seenUrls.add(iframe.url);
        externalUrls.push({ url: iframe.url, line: iframe.line, isImage: false });
      }
    }
  }

  // Add defunct/protocol-relative issues for external URLs too
  for (const item of externalUrls) {
    const domain = getDomain(item.url);
    if (domain && DEFUNCT_SERVICES[domain]) {
      localIssues.push({
        type: "defunct-embed",
        severity: "warning",
        description: `Link to defunct service: ${DEFUNCT_SERVICES[domain]}`,
        url: item.url,
        line: item.line,
      });
    }
    if (item.url.startsWith("//") && !localIssues.some(i => i.url === item.url && i.type === "protocol-relative-url")) {
      localIssues.push({
        type: "protocol-relative-url",
        severity: "warning",
        description: `Protocol-relative URL (should use https://)`,
        url: item.url,
        line: item.line,
      });
    }
  }

  // Filter out defunct service URLs from the check list (we already reported them)
  const urlsToCheck = externalUrls.filter((item) => {
    const domain = getDomain(item.url);
    return !(domain && DEFUNCT_SERVICES[domain]);
  });

  return { slug, title, date, localIssues, externalUrls: urlsToCheck };
}

// ─── Report Generation ───────────────────────────────────────────────────────

function generateMarkdownReport(report: AuditReport): string {
  const lines: string[] = [];

  lines.push("# Blog Post Audit Report");
  lines.push("");
  lines.push(`Generated: ${report.timestamp}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- **Total posts scanned:** ${report.totalPosts}`);
  lines.push(`- **Posts with issues:** ${report.postsWithIssues}`);
  lines.push(`- **Total issues found:** ${report.totalIssues}`);
  lines.push("");

  lines.push("### Issues by Type");
  lines.push("");
  lines.push("| Type | Count |");
  lines.push("|------|-------|");
  for (const [type, count] of Object.entries(report.issuesByType).sort((a, b) => b[1] - a[1])) {
    lines.push(`| ${type} | ${count} |`);
  }
  lines.push("");

  lines.push("### Issues by Severity");
  lines.push("");
  lines.push("| Severity | Count |");
  lines.push("|----------|-------|");
  for (const [severity, count] of Object.entries(report.issuesBySeverity).sort(
    (a, b) => b[1] - a[1]
  )) {
    lines.push(`| ${severity} | ${count} |`);
  }
  lines.push("");

  // Group results by issue type for easier scanning
  const errorResults = report.results
    .filter((r) => r.issues.some((i) => i.severity === "error"))
    .sort((a, b) => b.issues.filter((i) => i.severity === "error").length - a.issues.filter((i) => i.severity === "error").length);

  if (errorResults.length > 0) {
    lines.push("## Posts with Errors");
    lines.push("");

    for (const result of errorResults) {
      const errors = result.issues.filter((i) => i.severity === "error");
      lines.push(`### ${result.title}`);
      lines.push(`- **Slug:** \`${result.slug}\``);
      lines.push(`- **Date:** ${result.date}`);
      lines.push(`- **Errors:** ${errors.length}`);
      lines.push("");

      for (const issue of errors) {
        const urlPart = issue.url ? ` - \`${issue.url}\`` : "";
        const linePart = issue.line ? ` (line ${issue.line})` : "";
        lines.push(`- **[${issue.type}]** ${issue.description}${urlPart}${linePart}`);
      }
      lines.push("");
    }
  }

  // Warnings section
  const warningOnlyResults = report.results.filter(
    (r) =>
      r.issues.some((i) => i.severity === "warning") &&
      !r.issues.some((i) => i.severity === "error")
  );

  if (warningOnlyResults.length > 0) {
    lines.push("## Posts with Warnings Only");
    lines.push("");

    for (const result of warningOnlyResults) {
      const warnings = result.issues.filter((i) => i.severity === "warning");
      lines.push(`### ${result.title}`);
      lines.push(`- **Slug:** \`${result.slug}\``);
      lines.push("");

      for (const issue of warnings) {
        const urlPart = issue.url ? ` - \`${issue.url}\`` : "";
        const linePart = issue.line ? ` (line ${issue.line})` : "";
        lines.push(`- **[${issue.type}]** ${issue.description}${urlPart}${linePart}`);
      }
      lines.push("");
    }
  }

  // Warnings section (only warnings, no errors)
  const warningResults = report.results.filter(
    (r) =>
      r.issues.some((i) => i.severity === "warning")
  );

  if (warningResults.length > 0) {
    lines.push("## Posts with Warnings");
    lines.push("");

    for (const result of warningResults) {
      const warnings = result.issues.filter((i) => i.severity === "warning");
      if (warnings.length === 0) continue;
      lines.push(`### ${result.title}`);
      lines.push(`- **Slug:** \`${result.slug}\``);
      lines.push("");

      for (const issue of warnings) {
        const urlPart = issue.url ? ` - \`${issue.url}\`` : "";
        const linePart = issue.line ? ` (line ${issue.line})` : "";
        lines.push(`- **[${issue.type}]** ${issue.description}${urlPart}${linePart}`);
      }
      lines.push("");
    }
  }

  // Fallback cover image section
  const fallbackResults = report.results.filter((r) =>
    r.issues.some((i) => i.type === "fallback-cover-image")
  );

  if (fallbackResults.length > 0) {
    lines.push("## Posts Using Fallback Cover Image");
    lines.push("");
    lines.push(`Total: ${fallbackResults.length} posts`);
    lines.push("");

    for (const result of fallbackResults) {
      lines.push(`- \`${result.slug}\` - ${result.title}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Blog Post Audit Script");
  console.log("========================\n");

  const slugs = fs.readdirSync(postsDirectory).filter((name) => {
    const stat = fs.lstatSync(join(postsDirectory, name));
    return stat.isDirectory();
  });

  console.log(`Found ${slugs.length} posts to audit.\n`);

  // ── Phase 1: Parse all posts (synchronous, fast) ──────────────────────────

  console.log("Phase 1: Parsing all posts and checking local files...");
  const parsedPosts: ParsedPost[] = [];

  for (let i = 0; i < slugs.length; i++) {
    try {
      parsedPosts.push(parsePost(slugs[i]));
    } catch (e: any) {
      console.error(`  ERROR parsing ${slugs[i]}: ${e.message}`);
      parsedPosts.push({
        slug: slugs[i],
        title: slugs[i],
        date: "unknown",
        localIssues: [
          {
            type: "dead-link" as const,
            severity: "error" as const,
            description: `Failed to parse post: ${e.message}`,
          },
        ],
        externalUrls: [],
      });
    }
  }

  console.log(`  Parsed ${parsedPosts.length} posts.`);

  // ── Phase 2: Collect all unique external URLs ─────────────────────────────

  const uniqueUrls = new Map<string, { isImage: boolean }>();
  for (const post of parsedPosts) {
    for (const item of post.externalUrls) {
      const normalized = item.url.startsWith("//") ? `https:${item.url}` : item.url;
      if (!uniqueUrls.has(normalized)) {
        uniqueUrls.set(normalized, { isImage: item.isImage });
      }
    }
  }

  console.log(`\nPhase 2: Checking ${uniqueUrls.size} unique external URLs (concurrency: ${CONCURRENCY})...\n`);

  // ── Phase 3: Check all external URLs concurrently ─────────────────────────

  const urlList = Array.from(uniqueUrls.keys());
  let checked = 0;
  let deadCount = 0;

  await pMap(
    urlList,
    async (url) => {
      const result = await checkUrl(url);
      checked++;
      if (!result.ok) {
        deadCount++;
      }
      if (checked % 50 === 0 || checked === urlList.length) {
        console.log(`  Checked ${checked}/${urlList.length} URLs (${deadCount} dead so far)`);
      }
    },
    CONCURRENCY
  );

  console.log(`\n  Done! ${deadCount} dead URLs out of ${urlList.length} checked.\n`);

  // ── Phase 4: Build results by mapping URL results back to posts ───────────

  console.log("Phase 3: Building report...");

  const results: PostAuditResult[] = [];

  for (const post of parsedPosts) {
    const issues: Issue[] = [...post.localIssues];

    for (const item of post.externalUrls) {
      const normalized = item.url.startsWith("//") ? `https:${item.url}` : item.url;
      const domain = getDomain(item.url);

      // Skip defunct services (already reported)
      if (domain && DEFUNCT_SERVICES[domain]) continue;

      const result = urlCache.get(normalized);
      if (result && !result.ok) {
        // Check if this is a known bot-blocked 403
        const isBotBlocked = result.status === 403 && domain && BOT_BLOCKED_403_DOMAINS.has(domain);

        issues.push({
          type: item.isImage ? "broken-image" : "dead-link",
          severity: isBotBlocked ? "info" : "error",
          description: isBotBlocked
            ? `HTTP 403 (likely bot-blocked, probably fine for real users)`
            : result.error
              ? `Request failed: ${result.error}`
              : `HTTP ${result.status}`,
          url: item.url,
          line: item.line,
          httpStatus: result.status,
        });
      }
    }

    results.push({
      slug: post.slug,
      title: post.title,
      date: post.date,
      issues,
    });
  }

  // Build report
  const resultsWithIssues = results.filter((r) => r.issues.length > 0);

  const issuesByType: Record<string, number> = {};
  const issuesBySeverity: Record<string, number> = {};

  for (const result of results) {
    for (const issue of result.issues) {
      issuesByType[issue.type] = (issuesByType[issue.type] || 0) + 1;
      issuesBySeverity[issue.severity] = (issuesBySeverity[issue.severity] || 0) + 1;
    }
  }

  const report: AuditReport = {
    timestamp: new Date().toISOString(),
    totalPosts: results.length,
    postsWithIssues: resultsWithIssues.length,
    totalIssues: results.reduce((sum, r) => sum + r.issues.length, 0),
    issuesByType,
    issuesBySeverity,
    results: resultsWithIssues,
  };

  // Write reports
  const jsonPath = join(__dirname, "audit-report.json");
  const mdPath = join(__dirname, "audit-report.md");

  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  fs.writeFileSync(mdPath, generateMarkdownReport(report));

  console.log("\n========================");
  console.log("Audit Complete!\n");
  console.log(`Total posts scanned: ${report.totalPosts}`);
  console.log(`Posts with issues:   ${report.postsWithIssues}`);
  console.log(`Total issues:        ${report.totalIssues}`);
  console.log("");
  console.log("Issues by type:");
  for (const [type, count] of Object.entries(issuesByType).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${type}: ${count}`);
  }
  console.log("");
  console.log(`Reports written to:`);
  console.log(`  JSON: ${jsonPath}`);
  console.log(`  Markdown: ${mdPath}`);
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
