import { GetStaticProps } from "next";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";
import { join } from "path";
import fs from "fs";
import { ResponsiveSidebarLayouts } from "../components/layout/ResponsiveSidebarLayouts";
import Head from "next/head";
import { Vertical } from "../components/utils/gls";

type Props = {
  content: string;
};

const About = ({ content }: Props) => (
  <ResponsiveSidebarLayouts>
    <Head>
      <title key="title">about - mikecann.blog</title>
    </Head>
    <Vertical
      style={{
        //fontWeight: 400,
        paddingRight: 20,
        maxWidth: 700,
        width: "100%",
      }}
    >
      <h1>About</h1>
      <ReactMarkdown children={content} />
    </Vertical>
  </ResponsiveSidebarLayouts>
);

export const getStaticProps: GetStaticProps<Props> = async () => {
  const absPath = join(process.cwd(), "public/pages/about/index.md");
  const { content } = matter(fs.readFileSync(absPath, "utf8"));
  return {
    props: { content },
  };
};

export default About;
