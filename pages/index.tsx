import { GetStaticProps } from "next";
import { groupPostsByYear, sortPosts, sortYears } from "../utils/posts";
import { ArchiveYears } from "../components/ArchiveYears";
import React from "react";
import { PostsGrid, YearOfPosts } from "../components/PostsGrid";
import { ResponsiveSidebarLayouts } from "../components/layout/ResponsiveSidebarLayouts";
import { getAllPostsWithoutContent } from "../scripts/posts";
import { toPostTeaser } from "../scripts/posts/teasers";
import { Vertical } from "../components/utils/gls";
import { getActivityItems } from "../scripts/activity";
import { buildLatestActivity, type LatestActivity } from "../utils/activity";
import {
  HomeActivityRail,
  HomeActivityStrip,
  homeColumnsClass,
} from "../components/activity/HomeActivity";

type Props = {
  latestYears: YearOfPosts[];
  theOtherYears: string[];
  /** My latest video and X posts (see utils/activity.ts). */
  activity: LatestActivity;
};

const IndexPage = ({ latestYears, theOtherYears, activity }: Props) => {
  return (
    <ResponsiveSidebarLayouts>
      <HomeActivityStrip activity={activity} />
      <div className={homeColumnsClass}>
        <Vertical spacing={40} style={{ minWidth: 0 }}>
          <PostsGrid years={latestYears} />
          <Vertical style={{ marginBottom: 20 }}>
            <h1>Archive</h1>
            <ArchiveYears years={theOtherYears} />
          </Vertical>
        </Vertical>
        <HomeActivityRail activity={activity} />
      </div>
    </ResponsiveSidebarLayouts>
  );
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  const postsByYear = groupPostsByYear(sortPosts(getAllPostsWithoutContent(), "desc"));
  const years = sortYears(Object.keys(postsByYear), "desc");

  const latestYears = years.slice(0, 3).map((year) => ({
    year,
    posts: postsByYear[parseInt(year)].map(toPostTeaser),
  }));

  return {
    props: {
      latestYears,
      theOtherYears: years.slice(3),
      activity: buildLatestActivity(getActivityItems(), 4),
    },
  };
};

export default IndexPage;
