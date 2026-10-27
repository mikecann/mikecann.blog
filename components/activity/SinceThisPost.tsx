import * as React from "react";
import Link from "next/link";
import { classes, media, style } from "typestyle";
import { FaYoutube } from "react-icons/fa";
import type { NewerPost, SinceItem, Video } from "../../utils/activity";
import { youTubeUrl } from "../../utils/activity";
import { formatUTCDate } from "../../utils/dates";
import { cardClass, metaStyle, VideoThumbnail } from "./ActivityCards";

// A row of three on wider screens, a horizontal scroller on phones.
const listClass = style(
  { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 },
  media(
    { maxWidth: 600 },
    {
      display: "flex",
      overflowX: "auto",
      // Let the scroller run to the edges of the post card.
      margin: "0 -10px",
      padding: "0 10px 6px",
      scrollSnapType: "x mandatory",
      scrollPadding: "0 10px",
    },
  ),
);

const itemClass = style(
  { minWidth: 0 },
  media({ maxWidth: 600 }, { flex: "0 0 200px", scrollSnapAlign: "start" }),
);

const titleStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  lineHeight: 1.3,
  color: "#222",
};

const PostItem = ({ post }: { post: NewerPost }) => (
  <Link className={classes(cardClass, itemClass)} href={`/posts/${post.slug}`}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src={post.image}
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
    <span style={{ display: "flex", flexDirection: "column", gap: 6, padding: "8px 10px 10px" }}>
      <span style={titleStyle}>{post.title}</span>
      <span style={metaStyle}>Blog post · {formatUTCDate(post.date, "d MMM")}</span>
    </span>
  </Link>
);

const VideoItem = ({ video }: { video: Video }) => (
  <a className={classes(cardClass, itemClass)} href={youTubeUrl(video.id)}>
    <VideoThumbnail video={video} />
    <span style={{ display: "flex", flexDirection: "column", gap: 6, padding: "8px 10px 10px" }}>
      <span style={titleStyle}>{video.title}</span>
      <span style={metaStyle}>
        <FaYoutube aria-hidden="true" focusable="false" color="#e62117" size={14} />
        Video · {formatUTCDate(video.date, "d MMM")}
      </span>
    </span>
  </a>
);

/** The newest blog posts and videos published after the post being read. */
export const SinceThisPost: React.FC<{ items: SinceItem[] }> = ({ items }) => {
  if (items.length == 0) return null;

  return (
    <section style={{ marginTop: 30 }}>
      <h3 style={{ textAlign: "center", color: "#5d686f", margin: "0 0 14px" }}>SINCE THIS POST</h3>
      <div className={listClass}>
        {items.map((item) =>
          item.kind == "post" ? (
            <PostItem key={item.slug} post={item} />
          ) : (
            <VideoItem key={item.id} video={item} />
          ),
        )}
      </div>
    </section>
  );
};
