import { GetStaticProps } from "next";
import { groupPostsByYear, sortPosts, sortYears } from "../../utils/posts";
import { ArchiveCard } from "../../components/ArchiveCard";
import { ResponsiveSidebarLayouts } from "../../components/layout/ResponsiveSidebarLayouts";
import Head from "next/head";
import { getAllPostsWithoutContent } from "../../scripts/posts";
import { PostArchiveEntry, toPostArchiveEntry } from "../../scripts/posts/teasers";
import { Grid, Vertical } from "../../components/utils/gls";

type Props = {
  years: { year: string; posts: PostArchiveEntry[] }[];
};

const Page = ({ years }: Props) => {
  return (
    <ResponsiveSidebarLayouts>
      <Head>
        <title key="title">archive - mikecann.blog</title>
      </Head>
      <Vertical style={{ marginBottom: 20 }}>
        <Grid width="100%" spacing={20} style={{ alignItems: "start" }}>
          {years.map(({ year, posts }) => (
            <ArchiveCard key={year} title={year} posts={posts} />
          ))}
        </Grid>
      </Vertical>
    </ResponsiveSidebarLayouts>
  );
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  // Years newest first, posts within each year oldest first.
  const postsByYear = groupPostsByYear(sortPosts(getAllPostsWithoutContent()));
  const years = sortYears(Object.keys(postsByYear), "desc").map((year) => ({
    year,
    posts: postsByYear[parseInt(year)].map(toPostArchiveEntry),
  }));
  return { props: { years } };
};

export default Page;
