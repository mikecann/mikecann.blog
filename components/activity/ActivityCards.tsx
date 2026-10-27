import * as React from "react";
import { classes, style } from "typestyle";
import { FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import {
  formatAgo,
  formatDuration,
  youTubeThumbnailUrl,
  youTubeUrl,
  type Video,
  type XPost,
} from "../../utils/activity";
import { formatUTCDate } from "../../utils/dates";

const weekMs = 7 * 24 * 60 * 60 * 1000;

/** `null` until mounted, so the server and the first client render show the same dates. */
const useNow = () => {
  const [now, setNow] = React.useState<number | null>(null);
  React.useEffect(() => setNow(Date.now()), []);
  return now;
};

/**
 * "3h" (or "3h ago" with `ago`) for anything in the last week, otherwise "16 Oct". Server
 * renders always show the date.
 */
export const TimeAgo = ({ date, ago = false }: { date: string; ago?: boolean }) => {
  const now = useNow();
  const isRecent = now != null && now - Date.parse(date) < weekMs;
  const text = isRecent ? formatAgo(date, now) + (ago ? " ago" : "") : formatUTCDate(date, "d MMM");
  return <time dateTime={date}>{text}</time>;
};

export const cardClass = style({
  display: "flex",
  flexDirection: "column",
  backgroundColor: "white",
  border: "1px solid #ddd",
  borderRadius: 6,
  overflow: "hidden",
  color: "#333",
  transition: "box-shadow 0.2s ease, transform 0.2s ease",
  $nest: {
    // Keep the text colour rather than picking up the global link colours.
    "&:hover, &:focus, &:active, &:visited": { color: "#333" },
    "&:hover": { boxShadow: "0 5px 15px 0px rgba(0, 0, 0, 0.15)", transform: "translateY(-2px)" },
    "&:focus-visible": { outline: "2px solid #f1773c", outlineOffset: 1 },
    "@media (prefers-reduced-motion: reduce)": { transition: "none" },
  },
});

export const metaStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: 12,
  color: "#666",
};

const durationBadgeStyle: React.CSSProperties = {
  position: "absolute",
  right: 6,
  bottom: 6,
  padding: "2px 6px",
  borderRadius: 4,
  backgroundColor: "rgba(0, 0, 0, 0.8)",
  color: "white",
  fontSize: 11,
  fontWeight: 600,
};

export const VideoThumbnail = ({ video }: { video: Video }) => (
  <span style={{ position: "relative", display: "block" }}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src={youTubeThumbnailUrl(video.id)}
      alt=""
      width={320}
      height={180}
      loading="lazy"
      decoding="async"
      style={{
        display: "block",
        width: "100%",
        height: "auto",
        aspectRatio: "16 / 9",
        objectFit: "cover",
      }}
    />
    {video.durationSeconds == null ? null : (
      <span style={durationBadgeStyle}>{formatDuration(video.durationSeconds)}</span>
    )}
  </span>
);

export const VideoCard = ({ video, className }: { video: Video; className?: string }) => (
  <a className={classes(cardClass, className)} href={youTubeUrl(video.id)}>
    <VideoThumbnail video={video} />
    <span style={{ display: "flex", flexDirection: "column", gap: 6, padding: "10px 12px 12px" }}>
      <span style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3, color: "#222" }}>
        {video.title}
      </span>
      <span style={metaStyle}>
        <FaYoutube aria-hidden="true" focusable="false" color="#e62117" size={15} />
        Video · <TimeAgo date={video.date} />
      </span>
    </span>
  </a>
);

const mentionPattern = /(@\w+)/;

/** Highlights @mentions. They aren't links of their own as the whole card is already a link. */
const renderPostText = (text: string) =>
  text.split(mentionPattern).map((part, i) =>
    mentionPattern.test(part) ? (
      <span key={i} style={{ color: "#4183c4" }}>
        {part}
      </span>
    ) : (
      part
    ),
  );

export const XPostCard = ({ xPost, maxLines = 5 }: { xPost: XPost; maxLines?: number }) => (
  <a className={cardClass} href={xPost.url} style={{ gap: 8, padding: 12 }}>
    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/me.webp"
        alt=""
        width={28}
        height={28}
        style={{ borderRadius: "50%", objectFit: "cover" }}
      />
      <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.25 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#222" }}>Mike Cann</span>
        <span style={{ fontSize: 12, color: "#666" }}>
          @mikeysee · <TimeAgo date={xPost.date} />
        </span>
      </span>
      <FaXTwitter
        aria-label="on X"
        role="img"
        focusable="false"
        size={14}
        style={{ marginLeft: "auto", color: "#222", flexShrink: 0 }}
      />
    </span>
    <span
      style={{
        fontSize: 14,
        lineHeight: 1.45,
        whiteSpace: "pre-line",
        display: "-webkit-box",
        WebkitLineClamp: maxLines,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}
    >
      {renderPostText(xPost.text)}
    </span>
  </a>
);
