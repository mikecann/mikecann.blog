/**
 * Normalizes old Flash/game links in posts so they can be played inline in the site modal.
 *
 * What it fixes:
 * - Converts absolute mikecann.blog / mikecann.co.uk flash URLs to relative URLs
 * - Appends /index.html to flash project folder links with no file extension
 *
 * Usage:
 *   bun run ./scripts/fixFlashPlayableLinks.ts
 *   bun run ./scripts/fixFlashPlayableLinks.ts --dry-run
 */
import fs from "fs";
import { join } from "path";

const POSTS_DIR = join(process.cwd(), "public/posts");
const DRY_RUN = process.argv.includes("--dry-run");

const FLASH_ROOTS = ["/projects/", "/flash/", "/DumpingGround/"];
const ABSOLUTE_OWN_DOMAIN_RE = /^https?:\/\/(?:www\.)?mikecann\.(?:blog|co\.uk)/i;

type Change = {
  slug: string;
  from: string;
  to: string;
  kind: "markdown" | "html";
};

const changes: Change[] = [];

const splitUrlParts = (url: string): { base: string; suffix: string } => {
  const match = url.match(/^([^?#]*)(.*)$/);
  return {
    base: match?.[1] ?? url,
    suffix: match?.[2] ?? "",
  };
};

const isFlashPath = (url: string): boolean => FLASH_ROOTS.some((root) => url.startsWith(root));

const hasExtension = (url: string): boolean => /\.[a-z0-9]{2,6}$/i.test(url);

const normalizeFlashPlayableUrl = (input: string, markdownText?: string): string => {
  const trimmed = input.trim();
  const relative = trimmed.replace(ABSOLUTE_OWN_DOMAIN_RE, "");

  if (!isFlashPath(relative)) return trimmed;

  const { base, suffix } = splitUrlParts(relative);
  if (hasExtension(base)) return relative;

  if (base.startsWith("/projects/")) {
    // Keep generic project links untouched, only rewrite likely playable game links.
    const isLikelyPlayableGameLink = markdownText ? /\bplay\b/i.test(markdownText) : false;
    if (!isLikelyPlayableGameLink) return relative;
  }

  const normalizedBase = `${base.replace(/\/+$/, "")}/index.html`;
  return `${normalizedBase}${suffix}`;
};

const postSlugs = fs
  .readdirSync(POSTS_DIR)
  .filter((name) => fs.existsSync(join(POSTS_DIR, name, "post.md")));

for (const slug of postSlugs) {
  const postPath = join(POSTS_DIR, slug, "post.md");
  const original = fs.readFileSync(postPath, "utf8");
  let updated = original;

  // Markdown links: [text](url "optional title")
  updated = updated.replace(/\[([^\]]+)\]\(([^)\s]+)([^)]*)\)/g, (full, text, url, tail) => {
    const normalized = normalizeFlashPlayableUrl(url, text);
    if (normalized === url) return full;

    changes.push({ slug, from: url, to: normalized, kind: "markdown" });
    return `[${text}](${normalized}${tail})`;
  });

  // Raw HTML anchors: href="url"
  updated = updated.replace(/href=(["'])([^"']+)\1/gi, (full, quote, url) => {
    const normalized = normalizeFlashPlayableUrl(url);
    if (normalized === url) return full;

    changes.push({ slug, from: url, to: normalized, kind: "html" });
    return `href=${quote}${normalized}${quote}`;
  });

  if (!DRY_RUN && updated !== original) {
    fs.writeFileSync(postPath, updated, "utf8");
  }
}

const changedSlugs = Array.from(new Set(changes.map((change) => change.slug)));

console.log(`Scanned ${postSlugs.length} posts.`);
console.log(`${DRY_RUN ? "Would update" : "Updated"} ${changedSlugs.length} posts.`);
console.log(`Total link rewrites: ${changes.length}`);

for (const change of changes.slice(0, 100)) {
  console.log(`[${change.slug}] (${change.kind}) ${change.from} -> ${change.to}`);
}

if (changes.length > 100) {
  console.log(`...and ${changes.length - 100} more`);
}
