import { join } from "path";

export const publicDirectory = join(process.cwd(), "public");

/** Path prefixes that next.config.js rewrites to CloudFront/S3, so they aren't local files. */
export const REWRITTEN_PATH_PREFIXES = [
  "/wp-content/",
  "/flash/",
  "/DumpingGround/",
  "/projects/",
  "/ArtificialStudios1/",
  "/Files/",
  "/Work/",
];

const isExternalUrl = (url: string) => url.startsWith("//") || /^[a-z][a-z0-9+.-]*:/i.test(url);

/**
 * Resolves a URL referenced from a post to the file under public/ that the browser will request,
 * or undefined when it isn't a local file (external, data: or rewritten to CloudFront/S3).
 * The site's renderer turns `./x` into /posts/<slug>/x; anything else is resolved by the browser
 * against the page URL /posts/<slug> (no trailing slash), so `x` and `../x` land outside the post.
 */
export const resolveLocalFile = (slug: string, url: string): string | undefined => {
  const path = url.trim();
  if (!path || path.startsWith("#") || isExternalUrl(path)) return;

  const sitePath = path.startsWith("./") ? `/posts/${slug}/${path.slice(2)}` : path;
  const { pathname } = new URL(sitePath, `https://mikecann.blog/posts/${slug}`);
  if (REWRITTEN_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return;

  let decoded = pathname;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {}
  return join(publicDirectory, decoded);
};
