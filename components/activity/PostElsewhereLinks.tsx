import * as React from "react";
import { media, style } from "typestyle";
import { FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { formatDuration, youTubeUrl, type PostActivity } from "../../utils/activity";
import { activityRailMinWidth } from "./ActivityRail";

// On wide screens the activity rail shows these instead.
const containerClass = style(
  { display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 6 },
  media({ minWidth: activityRailMinWidth }, { display: "none" }),
);

const chipClass = style({
  display: "flex",
  alignItems: "center",
  gap: 8,
  minHeight: 40,
  padding: "0 14px",
  border: "1px solid #ddd",
  borderRadius: 20,
  backgroundColor: "#fafafa",
  color: "#333",
  fontSize: 14,
  fontWeight: 600,
  $nest: {
    "&:hover, &:focus, &:active, &:visited": { color: "#333" },
    "&:hover": { backgroundColor: "#f2f2f2" },
    "&:focus-visible": { outline: "2px solid #f1773c", outlineOffset: 1 },
  },
});

/** "Also a video" and "Discuss on X" links under a post's title. */
export const PostElsewhereLinks: React.FC<PostActivity["elsewhere"]> = ({ video, xPost }) => {
  if (!video && !xPost) return null;

  return (
    <div className={containerClass}>
      {video ? (
        <a className={chipClass} href={youTubeUrl(video.id)}>
          <FaYoutube aria-hidden="true" focusable="false" color="#e62117" size={18} />
          Also a video
          {video.durationSeconds == null ? null : (
            <span style={{ fontWeight: 400, color: "#666" }}>
              {formatDuration(video.durationSeconds)}
            </span>
          )}
        </a>
      ) : null}
      {xPost ? (
        <a className={chipClass} href={xPost.url}>
          <FaXTwitter aria-hidden="true" focusable="false" size={14} />
          Discuss on X
          {xPost.likes ? (
            <span style={{ fontWeight: 400, color: "#666" }}>{xPost.likes} likes</span>
          ) : null}
        </a>
      ) : null}
    </div>
  );
};
