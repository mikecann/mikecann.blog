import fs from "fs";
import { join, isAbsolute } from "path";
import matter from "gray-matter";
import { PostMeta, producePostMeta } from "./PostMeta";

export type { PostMeta } from "./PostMeta";

export type PostContent = string;

export type PostSlug = string;

export interface Post {
  slug: PostSlug;
  meta: PostMeta;
}

export type PostWithContent = Post & {
  content: PostContent;
};

export const postsDirectory = join(process.cwd(), "public/posts");

export const getPostSlugs = (): PostSlug[] =>
  fs
    .readdirSync(postsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

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

/**
 * In `next dev` posts are re-read on every call so edits show up on refresh. Everywhere else
 * (`next build` workers, scripts) each post is parsed at most once per process.
 */
const shouldCachePosts = () => process.env.NODE_ENV !== "development";

const postCache = new Map<PostSlug, PostWithContent>();
let allPostsCache: PostWithContent[] | undefined;

const loadPost = (slug: PostSlug): PostWithContent => {
  const fileContents = fs.readFileSync(join(postsDirectory, slug, `post.md`), "utf8");
  const { data, content } = matter(fileContents);
  return { slug, meta: producePostMeta(data, slug), content };
};

/**
 * Returns the post with the given slug. The returned object may be shared between callers, so
 * treat it as read-only.
 */
export const getPostBySlug = (slug: PostSlug): PostWithContent => {
  if (!shouldCachePosts()) return loadPost(slug);
  let post = postCache.get(slug);
  if (!post) {
    post = loadPost(slug);
    postCache.set(slug, post);
  }
  return post;
};

/**
 * Every post on disk, including drafts. Most callers want {@link getAllPublishablePosts}.
 */
export const getAllPosts = (): PostWithContent[] => {
  if (allPostsCache && shouldCachePosts()) return allPostsCache;
  const posts = getPostSlugs().map(getPostBySlug);
  if (shouldCachePosts()) allPostsCache = posts;
  return posts;
};

export const isDraft = (post: Post) => post.meta.status == "draft";

/**
 * Drafts are only included when running `next dev` or when `INCLUDE_DRAFTS=1` is set, and never
 * in a Vercel production deployment.
 */
export const shouldIncludeDrafts = () => {
  if (process.env.VERCEL_ENV == "production") return false;
  return process.env.NODE_ENV == "development" || process.env.INCLUDE_DRAFTS == "1";
};

/**
 * All posts that should appear on the site. Pass `isProduction = true` to always exclude drafts.
 */
export const getAllPublishablePosts = (isProduction = false): PostWithContent[] => {
  const posts = getAllPosts();
  if (!isProduction && shouldIncludeDrafts()) return posts;
  return posts.filter((post) => !isDraft(post));
};

export const getAllPostsWithoutContent = (): Post[] =>
  getAllPublishablePosts().map(({ slug, meta }) => ({ slug, meta }));
