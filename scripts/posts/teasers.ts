import fs from "fs";
import { join } from "path";
import { Post } from "./index";
import { getPostRootCoverImagePath } from "../../utils/posts";
import { formatUTCDate } from "../../utils/dates";
import { assetUrl } from "../../utils/assets";

/** The minimal data needed to render a post in a list (teaser cards, archive, search). */
export type PostTeaserData = {
  slug: string;
  title: string;
  /** The post date, already formatted in UTC so server and client render the same text. */
  date: string;
  tags: string[];
  /** URL of a small image for the post (thumbnail when generated, otherwise the cover). */
  image: string;
};

export type PostArchiveEntry = {
  slug: string;
  title: string;
  /** Day and month, formatted in UTC. */
  date: string;
};

/** Thumbnails are generated as `public/thumbs/<slug>.webp` (640px wide). */
export const getPostThumbnailRootPath = (post: Post): string => {
  const thumbnail = `/thumbs/${post.slug}.webp`;
  if (fs.existsSync(join(process.cwd(), "public", thumbnail))) return thumbnail;
  return getPostRootCoverImagePath(post);
};

export const toPostTeaser = (post: Post): PostTeaserData => ({
  slug: post.slug,
  title: post.meta.title,
  date: formatUTCDate(post.meta.date),
  tags: post.meta.tags,
  image: assetUrl(getPostThumbnailRootPath(post)),
});

export const toPostArchiveEntry = (post: Post): PostArchiveEntry => ({
  slug: post.slug,
  title: post.meta.title,
  date: formatUTCDate(post.meta.date, "do MMMM"),
});
