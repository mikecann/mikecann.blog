import { getRelativePathForPost } from "./posts";

const swfRegex = /\.swf(?:$|[?#])/i;

/** Links that should open in the in-page Flash player (Ruffle) instead of navigating. */
export const isFlashPlayableHref = (href: string): boolean => {
  if (swfRegex.test(href)) return true;

  const isFlashPath = href.startsWith("/flash/") || href.startsWith("/DumpingGround/");
  const isProjectPath = href.startsWith("/projects/");
  const isHtml = /\.html?(?:$|[?#])/i.test(href);

  return (isFlashPath || isProjectPath) && isHtml;
};

const markdownLinkRegex = /\]\(\s*<?([^)\s>]+)/g;
const htmlLinkRegex = /\bhref\s*=\s*["']([^"']+)["']/gi;

/**
 * Whether a post needs the Ruffle Flash emulator: it embeds a .swf or links to Flash content that
 * opens in the Flash player modal.
 */
export const postNeedsFlash = (slug: string, markdown: string): boolean => {
  if (/\.swf\b/i.test(markdown)) return true;
  const hrefs = [
    ...Array.from(markdown.matchAll(markdownLinkRegex), (match) => match[1]),
    ...Array.from(markdown.matchAll(htmlLinkRegex), (match) => match[1]),
  ];
  return hrefs.some((href) => isFlashPlayableHref(getRelativePathForPost(slug, href)));
};
