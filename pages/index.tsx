import { GetStaticProps } from "next";
import { groupPostsByYear, sortPosts, sortYears } from "../utils/posts";
import { ArchiveYears } from "../components/ArchiveYears";
import React from "react";
import { PostsGrid, YearOfPosts } from "../components/PostsGrid";
import { ResponsiveSidebarLayouts } from "../components/layout/ResponsiveSidebarLayouts";
import { getAllPostsWithoutContent } from "../scripts/posts";
import { toPostTeaser } from "../scripts/posts/teasers";
import { Vertical } from "../components/utils/gls";

type Props = {
  latestYears: YearOfPosts[];
  theOtherYears: string[];
};

const IndexPage = ({ latestYears, theOtherYears }: Props) => {
  return (
    <ResponsiveSidebarLayouts>
      <PostsGrid years={latestYears} />
      <Vertical style={{ marginBottom: 20 }}>
        <h1>Archive</h1>
        <ArchiveYears years={theOtherYears} />
      </Vertical>
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
    props: { latestYears, theOtherYears: years.slice(3) },
  };
};

export default IndexPage;
