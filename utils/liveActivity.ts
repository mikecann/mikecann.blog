import { z } from "zod";
import { byNewest, isSameActivity, type ActivityItem, type Video, type XPost } from "./activity";

/**
 * A video from convex.mikecann.blog's public `videos:list` query
 * (github.com/mikecann/mikes-convex-portfolio). That query only returns videos marked as mine,
 * not everything on the Convex channel. Only the fields used here are checked, so new fields there
 * don't break the blog.
 */
export const PortfolioVideoSchema = z.object({
  youtubeId: z.string(),
  title: z.string(),
  publishedAt: z.string(),
  /** ISO 8601, e.g. `"PT37M50S"`. */
  duration: z.string().optional(),
});

/** An X post from the same site's public `tweets:list` query, synced from the X API. */
export const PortfolioTweetSchema = z.object({
  tweetId: z.string(),
  text: z.string(),
  publishedAt: z.string(),
  likeCount: z.number().optional(),
});

export type PortfolioVideo = z.infer<typeof PortfolioVideoSchema>;
export type PortfolioTweet = z.infer<typeof PortfolioTweetSchema>;

/** `"PT1H2M5S"` → `3725`, or `undefined` if it isn't a duration. */
export const parseIsoDuration = (duration: string): number | undefined => {
  const match = duration.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match || duration == "PT") return undefined;
  const [hours, minutes, seconds] = match.slice(1).map((part) => parseInt(part ?? "0", 10));
  return hours * 3600 + minutes * 60 + seconds;
};

// The portfolio counts anything under 3 minutes as a Short. The sidebar has room for one video,
// so it goes to a proper one.
const shortMaxSeconds = 180;

const isValidDate = (date: string) => !Number.isNaN(Date.parse(date));

export const toVideoItem = (video: PortfolioVideo): Video | null => {
  const durationSeconds = video.duration ? parseIsoDuration(video.duration) : undefined;
  if (durationSeconds != undefined && durationSeconds < shortMaxSeconds) return null;
  if (!/^[\w-]{11}$/.test(video.youtubeId) || !isValidDate(video.publishedAt)) return null;
  return {
    kind: "video",
    id: video.youtubeId,
    date: new Date(video.publishedAt).toISOString(),
    title: video.title,
    ...(durationSeconds != undefined ? { durationSeconds } : {}),
  };
};

// The X API escapes these three in post text.
const decodeXEntities = (text: string) =>
  text.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

export const toXPostItem = (tweet: PortfolioTweet): XPost | null => {
  // Replies (to anyone else) and reposts aren't things I've posted, they'd just be noise here.
  if (tweet.text.startsWith("@") || tweet.text.startsWith("RT @")) return null;
  if (!/^\d+$/.test(tweet.tweetId) || !isValidDate(tweet.publishedAt)) return null;

  const text = decodeXEntities(tweet.text)
    // Trailing t.co links point at the post's own images, video, quoted post or link card, which
    // the card can't show and which mean nothing to a reader as bare t.co URLs.
    .replace(/(\s*https:\/\/t\.co\/\w+)+$/, "")
    .trim();
  if (!text) return null;

  return {
    kind: "x",
    date: new Date(tweet.publishedAt).toISOString(),
    text,
    url: `https://x.com/mikeysee/status/${tweet.tweetId}`,
    ...(tweet.likeCount != undefined ? { likes: tweet.likeCount } : {}),
  };
};

/**
 * The live items plus anything in the hand-kept snapshot they don't cover, newest first.
 *
 * Where both have the same item the live copy wins (it has the real date, link and likes), but
 * keeps the snapshot's `post`, as the snapshot is where items get linked to the blog post they're
 * about.
 */
export const mergeActivityItems = (
  snapshot: ActivityItem[],
  live: ActivityItem[],
): ActivityItem[] => {
  const fromLive = live.map((item) => {
    const post = snapshot.find((handKept) => isSameActivity(handKept, item))?.post;
    return post && !item.post ? { ...item, post } : item;
  });
  const snapshotOnly = snapshot.filter(
    (handKept) => !live.some((item) => isSameActivity(handKept, item)),
  );
  return [...fromLive, ...snapshotOnly].sort(byNewest);
};
