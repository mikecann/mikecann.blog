import { Grid, Vertical } from "../../components/utils/gls";
import { GetStaticProps, GetStaticPaths } from "next";
import { PostTeaser } from "../../components/PostTeaser";
import { ensure } from "../../essentials/misc/ensure";
import { groupPostsByTag, getAllTags, sortPosts } from "../../utils/posts";
import { ResponsiveSidebarLayouts } from "../../components/layout/ResponsiveSidebarLayouts";
import { tagToParam } from "../../utils/tags";
import Head from "next/head";
import { getAllPostsWithoutContent } from "../../scripts/posts";
import { PostTeaserData, toPostTeaser } from "../../scripts/posts/teasers";

type Props = {
  tag: string;
  posts: PostTeaserData[];
};

const Page = ({ tag, posts }: Props) => {
  return (
    <ResponsiveSidebarLayouts>
      <Head>
        <title key="title">{`${tag} - mikecann.blog`}</title>
      </Head>

      <Vertical width="100%">
        <h1>{tag}</h1>
        <Grid width="100%" spacing={20} style={{ alignItems: "start" }}>
          {posts.map((post) => (
            <PostTeaser key={post.slug} post={post} />
          ))}
        </Grid>
      </Vertical>
    </ResponsiveSidebarLayouts>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const tags = getAllTags(getAllPostsWithoutContent());
  return {
    // Unencoded: Next encodes params itself, so `raspberry pi` is served at /tags/raspberry%20pi.
    paths: tags.map((tag) => ({
      params: {
        tag: tagToParam(tag),
      },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const param = ensure(params?.tag) + "";
  const postsByTag = groupPostsByTag(getAllPostsWithoutContent());
  const tag = ensure(
    Object.keys(postsByTag).find((t) => tagToParam(t) == param),
    `No posts found for tag "${param}"`,
  );
  const posts = sortPosts(postsByTag[tag], "desc");
  return {
    props: { tag, posts: posts.map(toPostTeaser) },
  };
};

export default Page;
