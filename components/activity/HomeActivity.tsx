import * as React from "react";
import { media, style } from "typestyle";
import type { LatestActivity } from "../../utils/activity";
import { VideoCard, XPostCard } from "./ActivityCards";
import {
  LatestActivityPanel,
  LatestLabel,
  activityHeadingStyle,
  newestActivityDate,
} from "./LatestActivity";

/**
 * From this width the homepage has room for the column beside two columns of post cards, even
 * with a 15px scrollbar: 450px of sidebar padding + 10px right padding + 680px for two 320px cards
 * and their 20px margins + the column and its gap. Narrower screens get the strip above the posts.
 */
const homeActivityMinWidth = 1470;

const columnWidth = 290;
const columnGap = 16;

/** Lays the homepage out as posts plus the activity column on wide screens. */
export const homeColumnsClass = style(
  { display: "block" },
  media(
    { minWidth: homeActivityMinWidth },
    {
      display: "grid",
      gridTemplateColumns: `minmax(0, 1fr) ${columnWidth}px`,
      gap: columnGap,
      alignItems: "start",
    },
  ),
);

const railClass = style(
  {
    display: "none",
    position: "sticky",
    top: 20,
    // Stays in view while browsing the posts, scrolling on its own if the window is short.
    maxHeight: "calc(100vh - 40px)",
    overflowY: "auto",
    overscrollBehavior: "contain",
    // Room for the card shadows, which would otherwise be clipped by the scroll container.
    padding: "4px 6px 6px",
  },
  media({ minWidth: homeActivityMinWidth }, { display: "block" }),
);

const stripClass = style(
  { display: "flex", flexDirection: "column", gap: 10, marginTop: 14 },
  media({ minWidth: homeActivityMinWidth }, { display: "none" }),
);

const scrollerClass = style({
  display: "flex",
  gap: 12,
  overflowX: "auto",
  padding: "2px 2px 8px",
  scrollSnapType: "x mandatory",
  scrollbarWidth: "thin",
});

const stripItemClass = style({
  flex: "0 0 260px",
  display: "flex",
  flexDirection: "column",
  scrollSnapAlign: "start",
  // The cards fill the item, so every card in the strip is the same height.
  $nest: { "& > a": { flex: 1 } },
});

/** My latest video and X posts in a column beside the homepage posts, on wide screens. */
export const HomeActivityRail = ({ activity }: { activity: LatestActivity }) => (
  <aside aria-label="Mike, elsewhere" className={railClass}>
    <LatestActivityPanel heading="Elsewhere" activity={activity} />
  </aside>
);

/** The same as a swipeable strip above the posts, for narrower screens and phones. */
export const HomeActivityStrip = ({ activity }: { activity: LatestActivity }) => {
  const newestDate = newestActivityDate(activity);
  if (!newestDate) return null;

  return (
    <section aria-label="Mike, elsewhere" className={stripClass}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, paddingRight: 10 }}>
        <h2 style={activityHeadingStyle}>Elsewhere</h2>
        <LatestLabel date={newestDate} />
        <a href="https://x.com/mikeysee" style={{ marginLeft: "auto", fontSize: 14 }}>
          @mikeysee
        </a>
      </div>
      <div className={scrollerClass}>
        {activity.latestVideo ? (
          <div className={stripItemClass}>
            <VideoCard video={activity.latestVideo} />
          </div>
        ) : null}
        {activity.latestXPosts.map((xPost) => (
          <div key={`${xPost.date}-${xPost.url}`} className={stripItemClass}>
            <XPostCard xPost={xPost} maxLines={6} />
          </div>
        ))}
      </div>
    </section>
  );
};
