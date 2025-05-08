import fs from "fs";
import { join, isAbsolute } from "path";
import matter from "gray-matter";
import { map, pipe } from "ramda";
import { PostMeta, producePostMeta } from "./PostMeta";
import imageSize from "image-size";
import { removeContentFromPosts } from "../../utils/posts";

export type PostContent = string;

export type PostSlug = string;

export interface Post {
  absPostPath: string;
  slug: PostSlug;
  meta: PostMeta;

  coverImageSize: {
    width: number;
    height: number;
  };
}

export type PostWithContent = Post & {
  content: PostContent;
};

export const postsDirectory = join(process.cwd(), "public/posts");

export const getPostSlugs = (): PostSlug[] => fs.readdirSync(postsDirectory);

export const getPostCoverImageAbsolutePath = (cwd: string, coverImage: string) => {
  if (coverImage == "/images/fallback-post-header.png")
    return join(process.cwd(), "public/images/fallback-post-header.png");

  if (coverImage.startsWith("./")) return join(cwd, coverImage);

  return join(process.cwd(), "public", coverImage);
};

export const getPostCoverImageRootPath = (slug: string, coverImage: string) => {
  if (isAbsolute(coverImage)) return coverImage;
  return join(`/posts/${slug}`, coverImage);
};

export const getPostBySlug = (slug: PostSlug): PostWithContent => {
  const postDir = join(postsDirectory, slug);
  const absPostPath = join(postDir, `post.md`);
  const fileContents = fs.readFileSync(absPostPath, "utf8");

  const { data, content } = matter(fileContents);

  const meta = producePostMeta(data as any);

  const coverImagePath = getPostCoverImageAbsolutePath(postDir, meta.coverImage);
  const coverImageBuffer = fs.readFileSync(coverImagePath);
  const coverSize = imageSize(new Uint8Array(coverImageBuffer));

  return {
    absPostPath,
    slug,
    meta,
    coverImageSize: {
      width: coverSize.width || 10,
      height: coverSize.height || 10,
    },
    content,
  };
};

export const getAllPosts = () => {
  const slugs = getPostSlugs();
  const posts = slugs.map((slug) => getPostBySlug(slug));
  return posts;
};

export const getAllPublishablePosts = () => {
  let posts = getAllPosts();
  if (process.env.NODE_ENV == "production")
    posts = posts.filter(
      (post) => post.meta.status == "published" || post.meta.status == undefined,
    );
  return posts;
};

export const getAllPostsWithoutContent = () => {
  const posts = getAllPublishablePosts();
  return removeContentFromPosts(posts);
};
