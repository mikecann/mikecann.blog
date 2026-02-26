/**
 * Fix WordPress ?p=ID style links across all posts.
 * Builds a map of oldUrl -> slug, then resolves ?p=ID links where possible.
 * Unresolvable links are stripped to plain text.
 *
 * Usage: bun run ./scripts/fixWordPressIdLinks.ts
 */

import fs from "fs";
import { join } from "path";
import matter from "gray-matter";

const POSTS_DIR = join(process.cwd(), "public/posts");

// ─── Build oldUrl -> slug map ─────────────────────────────────────────────────

function buildOldUrlMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const slug of fs.readdirSync(POSTS_DIR)) {
    const postPath = join(POSTS_DIR, slug, "post.md");
    if (!fs.existsSync(postPath)) continue;
    try {
      const { data } = matter(fs.readFileSync(postPath, "utf8"));
      if (data.oldUrl) {
        // oldUrl can be "/category/slug/" or "/?p=123" etc
        map.set(String(data.oldUrl).toLowerCase().replace(/\/$/, ""), slug);
      }
    } catch {}
  }
  return map;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const oldUrlMap = buildOldUrlMap();
console.log(`Built oldUrl map with ${oldUrlMap.size} entries.\n`);

// Find all ?p=ID patterns (as links or hrefs)
const wpIdPattern = /\[([^\]]*)\]\(([^)]*\?p=(\d+)[^)]*)\)/g;
const htmlHrefPattern = /href="([^"]*\?p=(\d+)[^"]*)"/g;

let totalFound = 0;
let totalResolved = 0;
let totalStripped = 0;
const unresolved: Array<{ slug: string; id: string; context: string }> = [];

const slugs = fs.readdirSync(POSTS_DIR).filter((n) =>
  fs.lstatSync(join(POSTS_DIR, n)).isDirectory()
);

for (const slug of slugs) {
  const postPath = join(POSTS_DIR, slug, "post.md");
  if (!fs.existsSync(postPath)) continue;

  let raw = fs.readFileSync(postPath, "utf8");
  const original = raw;
  let changed = false;

  // Fix markdown links: [text](?p=123) or [text](/posts/?p=123)
  raw = raw.replace(/\[([^\]]*)\]\(([^)]*\?p=(\d+)[^)]*)\)/g, (full, text, url, id) => {
    totalFound++;
    // Try /?p=ID and /posts?p=ID and plain ?p=ID
    const candidates = [
      `/?p=${id}`,
      `/posts?p=${id}`,
      `/posts/?p=${id}`,
      `?p=${id}`,
    ];
    for (const c of candidates) {
      const match = oldUrlMap.get(c.toLowerCase().replace(/\/$/, ""));
      if (match) {
        totalResolved++;
        console.log(`  [${slug}] Resolved ?p=${id} -> /posts/${match}`);
        changed = true;
        return `[${text}](/posts/${match})`;
      }
    }
    // Not resolved - strip to plain text
    totalStripped++;
    unresolved.push({ slug, id, context: full.substring(0, 80) });
    console.log(`  [${slug}] Unresolved ?p=${id} - stripping link, keeping text: "${text}"`);
    changed = true;
    return text || `*(link no longer available)*`;
  });

  // Fix HTML href attributes
  raw = raw.replace(/href="([^"]*\?p=(\d+)[^"]*)"/g, (full, url, id) => {
    totalFound++;
    const candidates = [`/?p=${id}`, `/posts?p=${id}`, `/posts/?p=${id}`, `?p=${id}`];
    for (const c of candidates) {
      const match = oldUrlMap.get(c.toLowerCase().replace(/\/$/, ""));
      if (match) {
        totalResolved++;
        console.log(`  [${slug}] Resolved href ?p=${id} -> /posts/${match}`);
        changed = true;
        return `href="/posts/${match}"`;
      }
    }
    totalStripped++;
    unresolved.push({ slug, id, context: full.substring(0, 80) });
    console.log(`  [${slug}] Unresolved href ?p=${id} - leaving as-is`);
    return full;
  });

  if (changed && raw !== original) {
    fs.writeFileSync(postPath, raw, "utf8");
  }
}

console.log(`\n=== Summary ===`);
console.log(`Total ?p= links found: ${totalFound}`);
console.log(`Resolved to slugs:     ${totalResolved}`);
console.log(`Stripped (no match):   ${totalStripped}`);

if (unresolved.length > 0) {
  console.log(`\nUnresolved links:`);
  for (const u of unresolved) {
    console.log(`  [${u.slug}] ?p=${u.id}: ${u.context}`);
  }
}
