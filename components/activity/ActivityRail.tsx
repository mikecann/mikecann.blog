import * as React from "react";
import { classes, media, style } from "typestyle";
import type { PostActivity } from "../../utils/activity";
import { VideoCard, XPostCard } from "./ActivityCards";
import {
  LatestActivityPanel,
  activityHeadingStyle,
  activityPanelStyle,
  newestActivityDate,
} from "./LatestActivity";

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
  const { elsewhere } = activity;
  const hasLatest = newestActivityDate(activity) != null;

  if (!elsewhere.video && !elsewhere.xPost && !hasLatest) return null;

  return (
    <aside aria-label="Mike, elsewhere" className={classes(railClass, isReading && hiddenClass)}>
      {elsewhere.video || elsewhere.xPost ? (
        <section style={activityPanelStyle}>
          <h2 style={activityHeadingStyle}>This post elsewhere</h2>
          {elsewhere.video ? <VideoCard video={elsewhere.video} /> : null}
          {elsewhere.xPost ? <XPostCard xPost={elsewhere.xPost} maxLines={4} /> : null}
        </section>
      ) : null}

      <LatestActivityPanel heading="Meanwhile" activity={activity} />
    </aside>
  );
};
