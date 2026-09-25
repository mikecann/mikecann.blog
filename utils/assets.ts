export const SITE_URL = "https://mikecann.blog";

/** Extensions of post media files that may be served from the asset host. */
export const MEDIA_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "svg",
  "avif",
  "mp4",
  "m4v",
  "webm",
  "mov",
  "mp3",
  "zip",
  "pdf",
] as const;

const mediaExtensionRegex = new RegExp(`\\.(?:${MEDIA_EXTENSIONS.join("|")})$`, "i");

const stripQueryAndHash = (path: string) => path.split(/[?#]/)[0];

// `process.env.NEXT_PUBLIC_ASSET_BASE_URL` must be referenced literally so Next can inline it.
const getAssetBaseUrl = () => (process.env.NEXT_PUBLIC_ASSET_BASE_URL ?? "").replace(/\/+$/, "");

/**
 * True for root-relative paths to post media files (`/posts/<slug>/<file>.<media ext>`) and
 * thumbnails (`/thumbs/...`). Everything else (pages, post.md, site chrome in `/images`, legacy
 * rewrite paths like `/wp-content`, external URLs) is not an asset.
 */
export const isAssetPath = (path: string): boolean => {
  const clean = stripQueryAndHash(path);
  if (/^\/thumbs\/[^/]/.test(clean)) return true;
  return /^\/posts\/[^/]+\/./.test(clean) && mediaExtensionRegex.test(clean);
};

/**
 * Returns the URL a post media file or thumbnail should be loaded from. When
 * `NEXT_PUBLIC_ASSET_BASE_URL` is set (e.g. `https://assets.mikecann.blog`) asset paths are
 * served from there, otherwise they are returned unchanged. Non-asset paths are never changed.
 *
 * Relative paths (`./header.webp`) must be resolved to `/posts/<slug>/...` before calling this.
 */
export const assetUrl = (path: string, baseUrl: string = getAssetBaseUrl()): string => {
  const base = baseUrl.replace(/\/+$/, "");
  if (!base || !isAssetPath(path)) return path;
  return `${base}${path}`;
};

/** Makes a root-relative path absolute against the site URL. Absolute URLs pass through. */
export const absoluteUrl = (path: string): string => {
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(path)) return path;
  if (path.startsWith("//")) return `https:${path}`;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

/** Like {@link assetUrl} but always absolute, for `og:image`, JSON-LD and the like. */
export const absoluteAssetUrl = (path: string, baseUrl: string = getAssetBaseUrl()): string =>
  absoluteUrl(assetUrl(path, baseUrl));
