import { z } from "zod";
import rawActivity from "../data/activity.json";
import { mergeActivityItems } from "../utils/activity";
import {
  PortfolioTweetSchema,
  PortfolioVideoSchema,
  toVideoItem,
  toXPostItem,
} from "../utils/liveActivity";

const isoDate = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), "must be a valid ISO date string");

export const XPostSchema = z.object({
  kind: z.literal("x"),
  date: isoDate,
  text: z.string().min(1),
  url: z.url(),
  likes: z.number().optional(),
  /** Slug of the blog post this X post is about, if any. */
  post: z.string().optional(),
});

export const VideoSchema = z.object({
  kind: z.literal("video"),
  /** The YouTube video id. */
  id: z.string().min(1),
  date: isoDate,
  title: z.string().min(1),
  durationSeconds: z.number().optional(),
  /** Slug of the blog post this video is about, if any. */
  post: z.string().optional(),
});

const ActivitySchema = z.object({
  items: z.array(z.discriminatedUnion("kind", [XPostSchema, VideoSchema])),
});

export type XPost = z.infer<typeof XPostSchema>;
export type Video = z.infer<typeof VideoSchema>;
export type ActivityItem = XPost | Video;

/** The hand-kept snapshot in `data/activity.json`, newest first. */
export const getSnapshotItems = (): ActivityItem[] =>
  [...ActivitySchema.parse(rawActivity).items].sort(
    (a, b) => Date.parse(b.date) - Date.parse(a.date),
  );

// convex.mikecann.blog's production deployment (github.com/mikecann/mikes-convex-portfolio). It
// already syncs my videos and X posts on a schedule, so the blog reads them from there rather
// than running a second sync.
const portfolioConvexUrl = "https://brave-oyster-758.convex.cloud";

// A slow or broken portfolio shouldn't hold up a build or a page, the snapshot is good enough.
const portfolioTimeoutMs = 5000;

const queryPortfolio = async (path: string): Promise<unknown[]> => {
  const response = await fetch(`${portfolioConvexUrl}/api/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, args: {}, format: "json" }),
    signal: AbortSignal.timeout(portfolioTimeoutMs),
  });
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  const body = await response.json();
  if (body?.status != "success" || !Array.isArray(body.value))
    throw new Error(`${path}: ${body?.errorMessage ?? "unexpected response"}`);
  return body.value;
};

/** Parses each row on its own, so one odd row doesn't throw away the rest. */
const parseRows = <T>(rows: unknown[], schema: z.ZodType<T>): T[] =>
  rows.flatMap((row) => {
    const parsed = schema.safeParse(row);
    return parsed.success ? [parsed.data] : [];
  });

type LiveItems = {
  items: ActivityItem[];
  /** Whether either query failed, so `items` is missing the videos or the X posts. */
  failed: boolean;
};

const fetchLiveItems = async (): Promise<LiveItems> => {
  const [videos, tweets] = await Promise.allSettled([
    queryPortfolio("videos:list"),
    queryPortfolio("tweets:list"),
  ]);
  if (videos.status == "rejected")
    console.warn(`Couldn't load videos from the portfolio, using the snapshot:`, videos.reason);
  if (tweets.status == "rejected")
    console.warn(`Couldn't load X posts from the portfolio, using the snapshot:`, tweets.reason);

  return {
    items: [
      ...(videos.status == "fulfilled" ? parseRows(videos.value, PortfolioVideoSchema) : []).map(
        toVideoItem,
      ),
      ...(tweets.status == "fulfilled" ? parseRows(tweets.value, PortfolioTweetSchema) : []).map(
        toXPostItem,
      ),
    ].filter((item) => item != null),
    failed: videos.status == "rejected" || tweets.status == "rejected",
  };
};

// A build renders hundreds of post pages per process, so they share one fetch. The cache expires
// so a long-running server (the /api/activity function) still picks up new posts.
const liveCacheMs = 5 * 60 * 1000;
let liveCache: { fetchedAt: number; result: Promise<LiveItems> } | undefined;

const getLiveItems = (): Promise<LiveItems> => {
  if (!liveCache || Date.now() - liveCache.fetchedAt > liveCacheMs)
    liveCache = { fetchedAt: Date.now(), result: fetchLiveItems() };
  return liveCache.result;
};

/**
 * Mike's recent X posts and YouTube videos, newest first: the live ones from the portfolio plus
 * anything in the snapshot they don't cover. `failed` says whether part of the portfolio couldn't
 * be reached, so some of these are only from the snapshot.
 */
export const getActivity = async (): Promise<{ items: ActivityItem[]; failed: boolean }> => {
  const live = await getLiveItems();
  return { items: mergeActivityItems(getSnapshotItems(), live.items), failed: live.failed };
};

/** {@link getActivity}'s items, for pages built with whatever's available. */
export const getActivityItems = async (): Promise<ActivityItem[]> => (await getActivity()).items;
