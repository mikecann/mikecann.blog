import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { ResponsiveSidebarLayouts } from "../components/layout/ResponsiveSidebarLayouts";
import { Vertical } from "../components/utils/gls";
import { SubscribeForm } from "../components/newsletter/SubscribeForm";
import { getAllPostsWithoutContent } from "../scripts/posts";
import { sortPosts } from "../utils/posts";
import { formatUTCDate } from "../utils/dates";

type Props = {
  recentPosts: { slug: string; title: string; date: string }[];
};

const DESCRIPTION =
  "Get Mike Cann's new blog posts by email: AI, coding, games and side projects, about one post a month.";

const Subscribe = ({ recentPosts }: Props) => (
  <ResponsiveSidebarLayouts>
    <Head>
      <title key="title">subscribe - mikecann.blog</title>
      <meta name="description" content={DESCRIPTION} key="description" />
      <meta property="og:title" content="Subscribe to mikecann.blog" key="og-title" />
      <meta property="og:description" content={DESCRIPTION} key="og-description" />
    </Head>
    <Vertical style={{ paddingRight: 20, maxWidth: 700, width: "100%", marginBottom: 40 }}>
      <h1>Get new posts by email</h1>
      <p>
        I write about whatever I&apos;m tinkering with: AI, TypeScript, games, Convex, side projects
        and the odd bit of life. Pop your email in below and you&apos;ll get an email whenever
        there&apos;s a new post, which is about once a month.
      </p>
      <p style={{ color: "#5d686f" }}>
        No spam, and you can unsubscribe with one click from any email. You&apos;ll get a quick
        email to confirm first.
      </p>
      <SubscribeForm source="subscribe-page" />

      <h2 style={{ marginTop: 40 }}>Recent posts</h2>
      <ul style={{ paddingLeft: 20, lineHeight: 1.8 }}>
        {recentPosts.map((post) => (
          <li key={post.slug}>
            <Link href={`/posts/${post.slug}`}>{post.title}</Link>{" "}
            <span style={{ color: "#5d686f", fontSize: 14 }}>({post.date})</span>
          </li>
        ))}
      </ul>
      <p style={{ color: "#5d686f" }}>
        Prefer a feed reader? There&apos;s an <a href="/rss.xml">RSS feed</a> too.
      </p>
    </Vertical>
  </ResponsiveSidebarLayouts>
);

export const getStaticProps: GetStaticProps<Props> = async () => ({
  props: {
    recentPosts: sortPosts(getAllPostsWithoutContent(), "desc")
      .slice(0, 5)
      .map((post) => ({
        slug: post.slug,
        title: post.meta.title,
        date: formatUTCDate(post.meta.date, "MMMM yyyy"),
      })),
  },
});

export default Subscribe;
