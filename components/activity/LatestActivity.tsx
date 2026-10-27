import * as React from "react";
import type { LatestActivity } from "../../utils/activity";
import { TimeAgo, VideoCard, XPostCard } from "./ActivityCards";

export const activityHeadingStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "#5d686f",
};

// A white panel like the post card, so it reads on top of header images and the patterned
// background alike.
export const activityPanelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  padding: 12,
  backgroundColor: "white",
  border: "1px solid #ddd",
  borderRadius: 6,
  boxShadow: "rgb(221 221 221 / 15%) 0px 3px 0px 5px",
};

/** The date of the newest video or X post, if there is one. */
export const newestActivityDate = ({ latestVideo, latestXPosts }: LatestActivity) =>
  [latestVideo, ...latestXPosts]
    .filter((item) => item != null)
    .map((item) => item.date)
    .sort((a, b) => Date.parse(b) - Date.parse(a))[0];

/** An orange dot and "latest 3h ago". */
export const LatestLabel = ({ date }: { date: string }) => (
  <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#666" }}>
    <span
      aria-hidden="true"
      style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#f1773c" }}
    />
    <span>
      latest <TimeAgo date={date} ago />
    </span>
  </span>
);

export const FollowLinks = ({ style }: { style?: React.CSSProperties }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14, ...style }}>
    <a href="https://x.com/mikeysee">Follow @mikeysee on X</a>
    <a href="https://www.youtube.com/@convex-dev">Watch the videos on YouTube</a>
  </div>
);

/** My latest video and X posts in a panel, used beside posts and on the homepage. */
export const LatestActivityPanel = ({
  heading,
  activity,
}: {
  heading: string;
  activity: LatestActivity;
}) => {
  const newestDate = newestActivityDate(activity);
  if (!newestDate) return null;

  return (
    <section style={activityPanelStyle}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <h2 style={activityHeadingStyle}>{heading}</h2>
        <LatestLabel date={newestDate} />
      </div>
      {activity.latestVideo ? <VideoCard video={activity.latestVideo} /> : null}
      {activity.latestXPosts.map((xPost) => (
        <XPostCard key={`${xPost.date}-${xPost.url}`} xPost={xPost} />
      ))}
      <FollowLinks style={{ paddingTop: 4 }} />
    </section>
  );
};
