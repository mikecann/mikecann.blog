import { Grid, Vertical } from "../../components/utils/gls";
import { GetStaticProps, GetStaticPaths } from "next";
import { PostTeaser } from "../../components/PostTeaser";
import { ensure } from "../../essentials/misc/ensure";
import { getAllYears, getPostsByYear, sortPosts, sortYears } from "../../utils/posts";
import { ArchiveYears } from "../../components/ArchiveYears";
import { ResponsiveSidebarLayouts } from "../../components/layout/ResponsiveSidebarLayouts";
import Head from "next/head";
import { getAllPostsWithoutContent } from "../../scripts/posts";
import { PostTeaserData, toPostTeaser } from "../../scripts/posts/teasers";

type Props = {
  year: string;
  posts: PostTeaserData[];
  years: string[];
};

const Page = ({ year, posts, years }: Props) => {
  return (
    <ResponsiveSidebarLayouts>
      <Head>
        <title key="title">{`archive ${year} - mikecann.blog`}</title>
      </Head>
      <Vertical width="100%">
        <h1>{year}</h1>
        <Grid width="100%" spacing={20} style={{ alignItems: "start" }}>
          {posts.map((post) => (
            <PostTeaser key={post.slug} post={post} />
          ))}
        </Grid>
      </Vertical>
      <Vertical style={{ marginBottom: 20 }}>
        <h1>Archive</h1>
        <ArchiveYears years={years} />
      </Vertical>
    </ResponsiveSidebarLayouts>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const years = getAllYears(getAllPostsWithoutContent());
  return {
    paths: years.map((year) => ({
      params: {
        year,
      },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const query = ensure(params);
  const year = ensure(query.year) + "";

  const allPosts = sortPosts(getAllPostsWithoutContent(), "desc");
  const posts = getPostsByYear(year, allPosts);
  const years = sortYears(getAllYears(allPosts));

  return {
    props: { posts: posts.map(toPostTeaser), year, years },
  };
};

export default Page;
