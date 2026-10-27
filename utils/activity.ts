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

const byNewest = (a: { date: string }, b: { date: string }) =>
  Date.parse(b.date) - Date.parse(a.date);

const isNewer = (date: string, than: string) => Date.parse(date) > Date.parse(than);

/** The newest video and the newest `maxXPosts` X posts, for the homepage. */
export const buildLatestActivity = (items: ActivityItem[], maxXPosts = 5): LatestActivity => {
  const sorted = [...items].sort(byNewest);
  return {
    latestVideo: sorted.find((item): item is Video => item.kind == "video") ?? null,
    latestXPosts: sorted.filter((item): item is XPost => item.kind == "x").slice(0, maxXPosts),
  };
};

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
  maxXPosts = 4,
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
    latestVideo: videos.find((other) => other.id != video?.id) ?? null,
    latestXPosts: xPosts.filter((other) => other != xPost).slice(0, maxXPosts),
    since,
  };
};
