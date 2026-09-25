import * as React from "react";
import Image from "next/image";
import { style } from "typestyle";
import Link from "next/link";
import { PostTags } from "./PostTags";
import type { PostTeaserData } from "../scripts/posts/teasers";
import { Vertical } from "./utils/gls";

interface Props {
  post: PostTeaserData;
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
});

export const PostTeaser: React.FC<Props> = ({ post }) => {
  const { slug, title, date, tags, image } = post;

  return (
    <Link className={linkStyle} href={`/posts/${slug}`}>
      <Vertical
        className={cardStyle}
        width={320}
        style={{ border: "1px solid #ddd", borderRadius: 6, overflow: "hidden" }}
      >
        <Image
          alt={`post cover image for ${title}`}
          className={imgStyle}
          src={image}
          width={320}
          height={180}
          style={{
            maxWidth: "100%",
            height: "auto",
          }}
        />
        <Vertical>
          <Vertical
            spacing={5}
            style={{ borderTop: "1px solid #ddd", padding: "5px 10px 10px 10px", margin: 0 }}
          >
            <div style={{ margin: 0, fontSize: "1.2em", fontWeight: "bold" }}>{title}</div>
            <div style={{ color: "#767676", fontSize: "0.8em" }}>{date}</div>
          </Vertical>
          {tags.length > 0 && (
            <div style={{ borderTop: "1px solid #eee", padding: 5 }}>
              <PostTags tags={tags} asLinks={false} />
            </div>
          )}
        </Vertical>
      </Vertical>
    </Link>
  );
};
