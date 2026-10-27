import * as React from "react";
import { classes, media, style } from "typestyle";
import type { PostActivity } from "../../utils/activity";
import { TimeAgo, VideoCard, XPostCard } from "./ActivityCards";

interface Props {
  activity: PostActivity;
  /** The post's article. The rail hides once its top reaches the top of the viewport. */
  articleRef: React.RefObject<HTMLElement | null>;
}

/** Below this width there's no room beside the 700px article, so the rail isn't shown. */
export const activityRailMinWidth = 1280;

// Reading has started once the top of the article is within this fraction of the viewport top.
const readingThreshold = 0.15;

const railClass = style(
  {
    position: "absolute",
    // Lines up with the top of the article card.
    top: "60vh",
    left: "calc(50% + 382px)",
    width: "clamp(240px, calc(50vw - 414px), 300px)",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 28,
    transition: "opacity 0.3s ease, transform 0.3s ease, visibility 0s linear 0s",
    $nest: {
      "@media (prefers-reduced-motion: reduce)": { transition: "none" },
    },
  },
  media({ maxWidth: activityRailMinWidth - 1 }, { display: "none" }),
);

// `visibility` flips after the fade so hidden cards drop out of the tab order and screen readers.
const hiddenClass = style({
  opacity: 0,
  transform: "translateX(24px)",
  visibility: "hidden",
  pointerEvents: "none",
  transition: "opacity 0.3s ease, transform 0.3s ease, visibility 0s linear 0.3s",
  $nest: {
    "@media (prefers-reduced-motion: reduce)": { transform: "none" },
  },
});

const headingStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "#5d686f",
};

// A panel like the article card, as the top of the rail sits over the header image.
const sectionStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  padding: 12,
  backgroundColor: "white",
  border: "1px solid #ddd",
  borderRadius: 6,
  boxShadow: "rgb(221 221 221 / 15%) 0px 3px 0px 5px",
};

/** Whether the reader has scrolled the article up to the top of the screen. */
const useIsReading = (articleRef: React.RefObject<HTMLElement | null>) => {
  const [isReading, setIsReading] = React.useState(false);

  React.useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const article = articleRef.current;
      if (!article) return;
      setIsReading(article.getBoundingClientRect().top < window.innerHeight * readingThreshold);
    };
    const scheduleUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      cancelAnimationFrame(frame);
    };
  }, [articleRef]);

  return isReading;
};

/**
 * What Mike's been up to elsewhere, beside the top of a post. It slides away once the reader
 * gets into the article and comes back when they scroll back up to the top.
 */
export const ActivityRail: React.FC<Props> = ({ activity, articleRef }) => {
  const isReading = useIsReading(articleRef);
  const { elsewhere, latestVideo, latestXPosts } = activity;
  const newest = [latestVideo, ...latestXPosts]
    .filter((item) => item != null)
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))[0];

  if (!elsewhere.video && !elsewhere.xPost && !newest) return null;

  return (
    <aside aria-label="Mike, elsewhere" className={classes(railClass, isReading && hiddenClass)}>
      {elsewhere.video || elsewhere.xPost ? (
        <section style={sectionStyle}>
          <h2 style={headingStyle}>This post elsewhere</h2>
          {elsewhere.video ? <VideoCard video={elsewhere.video} /> : null}
          {elsewhere.xPost ? <XPostCard xPost={elsewhere.xPost} maxLines={4} /> : null}
        </section>
      ) : null}

      {newest ? (
        <section style={sectionStyle}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <h2 style={headingStyle}>Meanwhile</h2>
            <span
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#666" }}
            >
              <span
                aria-hidden="true"
                style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#f1773c" }}
              />
              <span>
                latest <TimeAgo date={newest.date} ago />
              </span>
            </span>
          </div>
          {latestVideo ? <VideoCard video={latestVideo} /> : null}
          {latestXPosts.map((xPost) => (
            <XPostCard key={`${xPost.date}-${xPost.url}`} xPost={xPost} />
          ))}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              paddingTop: 4,
              fontSize: 14,
            }}
          >
            <a href="https://x.com/mikeysee">Follow @mikeysee on X</a>
            <a href="https://www.youtube.com/@convex-dev">Watch the videos on YouTube</a>
          </div>
        </section>
      ) : null}
    </aside>
  );
};
