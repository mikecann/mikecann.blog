import { SITE_URL } from "./assets";

const decodeFully = (segment: string) => {
  let decoded = segment;
  for (let i = 0; i < 3; i++) {
    try {
      const next = decodeURIComponent(decoded);
      if (next == decoded) break;
      decoded = next;
    } catch {
      break;
    }
  }
  return decoded;
};

/**
 * Canonical URL for a page path, without query string or hash. The encoding is normalised so
 * `/tags/code assist`, `/tags/code%20assist` and `/tags/code%2520assist` all give the same URL.
 */
export const canonicalUrlForPath = (pathname: string) => {
  const path = pathname
    .split(/[?#]/)[0]
    .split("/")
    .map((segment) => encodeURIComponent(decodeFully(segment)))
    .join("/");
  return path == "/" || path == "" ? SITE_URL : `${SITE_URL}${path}`;
};
