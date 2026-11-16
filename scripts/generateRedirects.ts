/**
 * Writes worker/redirects.generated.json (gitignored; generated on every build): each post's
 * `oldUrl` (from the WordPress days) mapped to its page. The Worker answers them with a 308.
 *
 * Usage: bun run generateRedirects
 */
import fs from "fs";
import { getAllPublishablePosts } from "./posts";

const redirects: Record<string, string> = {};
for (const { slug, meta } of getAllPublishablePosts()) {
  if (!meta.oldUrl) continue;
  // Looked up without a trailing slash (see normalisePath in worker/index.ts).
  redirects[meta.oldUrl.replace(/\/+$/, "")] = `/posts/${slug}`;
}

fs.writeFileSync("worker/redirects.generated.json", JSON.stringify(redirects, null, 2) + "\n");
console.log(`Wrote ${Object.keys(redirects).length} redirects to worker/redirects.generated.json`);
