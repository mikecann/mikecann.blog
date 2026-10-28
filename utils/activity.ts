import type { ActivityItem, Video, XPost } from "../scripts/activity";
import { formatUTCDate } from "./dates";

export type { ActivityItem, Video, XPost };

/** A blog post published after the one being read. */
export type NewerPost = {
  kind: "post";
  slug: string;
  title: string;
  /** ISO date. */
  date: string;
  /** Thumbnail URL. */
  image: string;
};

export type SinceItem = NewerPost | Video;

/** My newest video and X posts. */
export type LatestActivity = {
  latestVideo: Video | null;
  latestXPosts: XPost[];
};

export type PostActivity = LatestActivity & {
  /** The same project in other formats: the video embedded in the post, an X post about it. */
  elsewhere: { video: Video | null; xPost: XPost | null };
  /** Blog posts and videos published after this post, newest first. */
  since: SinceItem[];
};

// Video ids are exactly 11 characters. Playlist embeds (`/embed/videoseries?list=...`) are
// skipped: "videoseries" happens to be 11 characters too, but it isn't a video.
const youTubeEmbedPattern =
  /youtube(?:-nocookie)?\.com\/embed\/(?!videoseries)([\w-]{11})(?![\w-])/;

/** The id of the first YouTube video embedded in a post's markdown. */
export const findEmbeddedYouTubeId = (markdown: string): string | undefined =>
  markdown.match(youTubeEmbedPattern)?.[1];

export const youTubeUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;

export const youTubeThumbnailUrl = (id: string) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;

/** `2280` → `"38:00"`, `3725` → `"1:02:05"`. */
export const formatDuration = (totalSeconds: number): string => {
  const seconds = Math.round(totalSeconds);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = String(seconds % 60).padStart(2, "0");
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, "0")}:${rest}`;
  return `${minutes}:${rest}`;
};

/** A short relative time such as "5m", "3h" or "2d", falling back to "16 Oct" after a week. */
export const formatAgo = (isoDate: string, now: number): string => {
  const seconds = Math.max(0, (now - Date.parse(isoDate)) / 1000);
  if (seconds < 3600) return `${Math.max(1, Math.floor(seconds / 60))}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 7 * 86400) return `${Math.floor(seconds / 86400)}d`;
  return formatUTCDate(isoDate, "d MMM");
};

export const byNewest = (a: { date: string }, b: { date: string }) =>
  Date.parse(b.date) - Date.parse(a.date);

const isNewer = (date: string, than: string) => Date.parse(date) > Date.parse(than);

/** `https://x.com/mikeysee/status/123` → `"123"`. Hand-copied posts may only have the profile URL. */
const xStatusId = (url: string) => url.match(/\/status\/(\d+)/)?.[1];

/**
 * X post text cut down to its first few words, so a post copied by hand (without its link, and
 * with the odd apostrophe or link missing) still matches the same post from the X API.
 */
export const normaliseXText = (text: string) =>
  text
    .replace(/https?:\/\/\S+/g, "")
    .replace(/['’]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .slice(0, 60);

/** Whether two items are the same video or X post, wherever each copy came from. */
export const isSameActivity = (a: ActivityItem, b: ActivityItem): boolean => {
  if (a.kind == "video" && b.kind == "video") return a.id == b.id;
  if (a.kind == "x" && b.kind == "x") {
    const aId = xStatusId(a.url);
    const bId = xStatusId(b.url);
    if (aId && bId) return aId == bId;
    return normaliseXText(a.text) == normaliseXText(b.text);
  }
  return false;
};

/**
 * The newer items plus anything in the older ones they don't cover, newest first. Merges the
 * portfolio's items into the hand-kept snapshot, and fresh items into the ones a page was built
 * with.
 *
 * Where both have the same item the newer copy wins (from the portfolio it has the real date,
 * link and likes), but keeps the older copy's `post`, as the snapshot is where items get linked to
 * the blog post they're about.
 */
export const mergeActivityItems = (
  older: ActivityItem[],
  newer: ActivityItem[],
): ActivityItem[] => {
  const fromNewer = newer.map((item) => {
    const post = older.find((other) => isSameActivity(other, item))?.post;
    return post && !item.post ? { ...item, post } : item;
  });
  const olderOnly = older.filter((other) => !newer.some((item) => isSameActivity(other, item)));
  return [...fromNewer, ...olderOnly].sort(byNewest);
};

/**
 * The newest video and the newest `maxXPosts` X posts, for the homepage. Anything in `exclude`
 * is left out, e.g. a post's own video, which is already shown as "this post elsewhere".
 */
export const buildLatestActivity = (
  items: ActivityItem[],
  maxXPosts = 5,
  exclude: ActivityItem[] = [],
): LatestActivity => {
  const sorted = [...items]
    .filter((item) => !exclude.some((excluded) => isSameActivity(item, excluded)))
    .sort(byNewest);
  return {
    latestVideo: sorted.find((item): item is Video => item.kind == "video") ?? null,
    latestXPosts: sorted.filter((item): item is XPost => item.kind == "x").slice(0, maxXPosts),
  };
};

/** How many X posts the "Meanwhile" panel beside a post shows. */
export const postMaxXPosts = 4;

/**
 * Works out what to show around a post: the same project elsewhere, what Mike has been posting
 * lately, and what he has published since.
 */
export const buildPostActivity = ({
  slug,
  date,
  title,
  markdown,
  items,
  newerPosts,
  maxXPosts = postMaxXPosts,
  maxSince = 3,
}: {
  slug: string;
  /** The post's ISO date. */
  date: string;
  title: string;
  markdown: string;
  items: ActivityItem[];
  /** Blog posts published after this one, in any order. */
  newerPosts: NewerPost[];
  maxXPosts?: number;
  maxSince?: number;
}): PostActivity => {
  const videos = items.filter((item): item is Video => item.kind == "video").sort(byNewest);
  const xPosts = items.filter((item): item is XPost => item.kind == "x").sort(byNewest);

  // A video embedded in the post that isn't in the activity data still gets linked, just without
  // its duration.
  const embeddedId = findEmbeddedYouTubeId(markdown);
  const embeddedVideo = embeddedId
    ? (videos.find((video) => video.id == embeddedId) ??
      ({ kind: "video", id: embeddedId, date, title } satisfies Video))
    : null;
  const video = videos.find((video) => video.post == slug) ?? embeddedVideo;
  const xPost = xPosts.find((xPost) => xPost.post == slug) ?? null;

  const since = [
    ...newerPosts.filter((post) => post.slug != slug && isNewer(post.date, date)),
    ...videos.filter((other) => other.id != video?.id && isNewer(other.date, date)),
  ]
    .sort(byNewest)
    .slice(0, maxSince);

  return {
    elsewhere: { video, xPost },
    ...buildLatestActivity(
      items,
      maxXPosts,
      [video, xPost].filter((item) => item != null),
    ),
    since,
  };
};
