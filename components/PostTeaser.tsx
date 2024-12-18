import * as React from "react";
import { format } from "date-fns";
import Image from "next/image";
import { getPostRootCoverImagePath } from "../utils/posts";
import { style } from "typestyle";
import Link from "next/link";
import { PostTags } from "./PostTags";
import { Post } from "../scripts/posts";
import { Vertical } from "./utils/gls";

interface Props {
  post: Post;
}

const imgStyle = style({
  objectFit: "cover",
});

const cardStyle = style({
  cursor: "pointer",
  transition: "all 0.2s ease",
  filter: "grayscale(0.5)",
  $nest: {
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: "0 5px 15px 0px rgba(0, 0, 0, 0.2)",
      filter: "grayscale(0)",
    },
  },
});

const linkStyle = style({
  color: "#222",
  // $nest: {
  //   "&:hover": {
  //     transform: "translateY(-5px)",
  //     boxShadow: "0 5px 15px 0px rgba(0, 0, 0, 0.2)",
  //     filter: "grayscale(0)",
  //   },
  // },
});

export const PostTeaser: React.FC<Props> = ({ post }) => {
  const { meta, slug } = post;
  const { title, date, tags } = meta;

  return (
    <Link className={linkStyle} href="/posts/[slug]" as={`/posts/${slug}`}>
      <Vertical
        className={cardStyle}
        width={320}
        style={{ border: "1px solid #ddd", borderRadius: 6, overflow: "hidden" }}
      >
        <Image
          alt={`post cover image for ${title}`}
          className={imgStyle}
          src={getPostRootCoverImagePath(post)}
          width={320}
          height={180}
          quality={80}
          style={{
            maxWidth: "100%",
            height: "auto"
          }} />
        <Vertical>
          <Vertical
            spacing={5}
            style={{ borderTop: "1px solid #ddd", padding: "5px 10px 10px 10px", margin: 0 }}
          >
            <div style={{ margin: 0, fontSize: "1.2em", fontWeight: "bold" }}>{title}</div>
            <div style={{ color: "#bbbbbb", fontSize: "0.8em" }}>
              {format(new Date(date), "do MMMM yyyy")}
            </div>
          </Vertical>
          {tags.length > 0 && (
            <div style={{ borderTop: "1px solid #eee", padding: 5 }}>
              <PostTags tags={tags} />
            </div>
          )}
        </Vertical>
      </Vertical>
    </Link>
  );
};
