import RSS from "rss";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import type { Root } from "mdast";
import { PostWithContent } from "../scripts/posts";
import { walkMarkdown } from "../scripts/lib/markdown";

const SITE_URL = "https://mikecann.blog";
const MORE_MARKER = "<!-- more -->";
const EXCERPT_LENGTH = 500;

/**
 * The part of the post shown in the feed: everything before `<!-- more -->`, or else the
 * first whole blocks (paragraphs, images, ...) adding up to about EXCERPT_LENGTH characters.
 */
export const getExcerptMarkdown = (content: string): string => {
  const moreIndex = content.indexOf(MORE_MARKER);
  if (moreIndex >= 0) return content.substring(0, moreIndex);

  const tree = remark().use(remarkGfm).parse(content);
  for (const block of tree.children) {
    const end = block.position?.end.offset;
    if (end !== undefined && end >= EXCERPT_LENGTH) return content.substring(0, end);
  }
  return content;
};

/** Feed readers resolve URLs against the feed, not the post, so make them absolute. */
export const toAbsoluteUrl = (slug: string, url: string): string => {
  // The site renders `./x` as /posts/<slug>/x; anything else resolves against the post URL.
  const sitePath = url.startsWith("./") ? `/posts/${slug}/${url.slice(2)}` : url;
  try {
    return new URL(sitePath, `${SITE_URL}/posts/${slug}`).href;
  } catch {
    return url;
  }
};

const htmlUrlAttribute = /(\s(?:src|href)\s*=\s*)(?:"([^"]*)"|'([^']*)')/gi;

const absoluteUrls = (slug: string) => (tree: Root) =>
  walkMarkdown(tree, (node) => {
    if (node.type == "image" || node.type == "link" || node.type == "definition")
      node.url = toAbsoluteUrl(slug, node.url);
    else if (node.type == "html")
      node.value = node.value.replace(
        htmlUrlAttribute,
        (_, attr: string, double?: string, single?: string) =>
          `${attr}"${toAbsoluteUrl(slug, double ?? single ?? "")}"`,
      );
  });

export const postExcerptToHtml = (slug: string, content: string): string =>
  remark()
    .use(remarkGfm)
    .use(absoluteUrls, slug)
    // Keep the raw HTML (embeds, <img> tags) that posts use; it's our own content.
    .use(remarkHtml, { sanitize: false })
    .processSync(getExcerptMarkdown(content))
    .toString()
    .trim();

export const generateRss = (posts: PostWithContent[]): string => {
  const feed = new RSS({
    title: `Blog - Mike Cann`,
    site_url: SITE_URL,
    feed_url: `${SITE_URL}/rss.xml`,
  });

  for (let {
    slug,
    content,
    meta: { title, date },
  } of posts) {
    feed.item({
      title,
      guid: `${SITE_URL}/posts/${slug}`,
      url: `${SITE_URL}/posts/${slug}`,
      date: new Date(date).toUTCString(),
      description: postExcerptToHtml(slug, content),
      author: `Mike Cann`,
    });
  }

  return feed.xml({ indent: true });
};
