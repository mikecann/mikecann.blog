import type { NextApiRequest, NextApiResponse } from "next";
import { getActivity } from "../../scripts/activity";
import type { ActivityItem } from "../../utils/activity";

export type ActivityResponse = { items: ActivityItem[] };

// Enough for the newest video and X posts even after a post's own ones are left out.
const maxVideos = 3;
const maxXPosts = 10;

/**
 * My newest videos and X posts. Pages are only built on deploy, so their activity panels fetch
 * this after loading to show what's new since then (see useFreshLatestActivity).
 */
export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<ActivityResponse>,
) {
  const { items, failed } = await getActivity();
  // Vercel's CDN keeps the response for an hour, so the portfolio is asked about once an hour,
  // not once per visitor. If part of it couldn't be reached, only for a minute, so a blip doesn't
  // leave the snapshot showing for the next hour.
  res.setHeader(
    "Cache-Control",
    failed ? "public, s-maxage=60" : "public, s-maxage=3600, stale-while-revalidate=86400",
  );
  res.status(200).json({
    items: [
      ...items.filter((item) => item.kind == "video").slice(0, maxVideos),
      ...items.filter((item) => item.kind == "x").slice(0, maxXPosts),
    ],
  });
}
