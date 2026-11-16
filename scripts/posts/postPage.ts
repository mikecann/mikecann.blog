import fs from "node:fs";
import path from "node:path";
import imageSize from "image-size";
import { getRelativePathForPost } from "../../utils/posts";
import { assetUrl } from "../../utils/assets";
import type { NewerPost } from "../../utils/activity";
import type { ImageSizes } from "../../components/post/PostMarkdown";
import { getAllPublishablePosts, type Post } from "./index";
import { getPostThumbnailRootPath } from "./teasers";

/** Sizes of the post's local images, so they're laid out before they load. */
export const getImageSizes = (slug: string, markdown: string): ImageSizes => {
  const imageRegex = /!\[[^\]]*\]\(([^)]+)\)/g;
  const imageSizes: ImageSizes = {};

  for (const match of markdown.matchAll(imageRegex)) {
    // Remove any title after the src (e.g. ![alt](src "title"))
    const imgSrc = match[1].split(" ")[0];
    const relSrc = getRelativePathForPost(slug, imgSrc);
    // Only process local images; sizes are always read from the files in public/
    if (!relSrc.startsWith("/posts/")) continue;
    const absPath = path.join(process.cwd(), "public", relSrc);
    if (!fs.existsSync(absPath)) continue;
    const { width, height } = imageSize(fs.readFileSync(absPath));
    if (width && height) imageSizes[relSrc] = { width, height };
  }

  return imageSizes;
};

/** The posts published after this one, newest first, for "Since this post". */
export const getNewerPosts = (post: Post, limit: number): NewerPost[] =>
  getAllPublishablePosts()
    .filter((other) => Date.parse(other.meta.date) > Date.parse(post.meta.date))
    .sort((a, b) => Date.parse(b.meta.date) - Date.parse(a.meta.date))
    .slice(0, limit)
    .map((other) => ({
      kind: "post",
      slug: other.slug,
      title: other.meta.title,
      date: other.meta.date,
      image: assetUrl(getPostThumbnailRootPath(other)),
    }));
