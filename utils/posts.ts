import type { Post } from "../scripts/posts";

type SortDirection = "asc" | "desc";

/** Returns a sorted copy of the posts, oldest first by default. */
export const sortPosts = <T extends Post>(posts: T[], direction: SortDirection = "asc"): T[] => {
  const sign = direction == "desc" ? -1 : 1;
  return [...posts].sort(
    (post1, post2) => (Date.parse(post1.meta.date) - Date.parse(post2.meta.date)) * sign,
  );
};

/** Resolves a `./relative` path in a post's markdown to its root path under `/posts/<slug>/`. */
export const getRelativePathForPost = (slug: string, path: string) =>
  path.startsWith("./") ? `/posts/${slug}/${path.replace("./", "")}` : path;

export const getPostRootCoverImagePath = ({ meta: { coverImage }, slug }: Post) =>
  getRelativePathForPost(slug, coverImage);

// Post dates are UTC ISO strings, so group by the UTC year.
export const getPostYear = (post: Post): number => new Date(post.meta.date).getUTCFullYear();

export type PostsByYear<T extends Post = Post> = {
  [year: number]: T[];
};

export type PostsByTag<T extends Post = Post> = {
  [tag: string]: T[];
};

export const groupPostsByYear = <T extends Post>(posts: T[]): PostsByYear<T> => {
  const postsByYear: PostsByYear<T> = {};

  for (const post of posts) {
    const year = getPostYear(post);
    if (!postsByYear[year]) postsByYear[year] = [];
    postsByYear[year].push(post);
  }

  return postsByYear;
};

export const groupPostsByTag = <T extends Post>(posts: T[]): PostsByTag<T> => {
  const postsByTag: PostsByTag<T> = {};

  for (const post of posts) {
    for (const tag of post.meta.tags) {
      if (!postsByTag[tag]) postsByTag[tag] = [];
      postsByTag[tag].push(post);
    }
  }

  return postsByTag;
};

export const calculateTagsLastUse = <T extends Post>(
  tags: PostsByTag<T>,
): { tag: string; posts: T[]; lastUse: Date }[] =>
  Object.entries(tags).map(([tag, posts]) => ({
    tag,
    posts,
    lastUse: posts.length == 0 ? new Date(0) : new Date(sortPosts(posts, "desc")[0].meta.date),
  }));

export const getPostsByYear = <T extends Post>(year: string, posts: T[]): T[] =>
  groupPostsByYear(posts)[parseInt(year)] ?? [];

export const getAllYears = (posts: Post[]) => Object.keys(groupPostsByYear(posts));

export const getAllTags = (posts: Post[]) => Object.keys(groupPostsByTag(posts));

/** Returns a sorted copy of the years. */
export const sortYears = (years: string[], direction: SortDirection = "asc") =>
  [...years].sort((a, b) => (parseInt(a) - parseInt(b)) * (direction == "desc" ? -1 : 1));
