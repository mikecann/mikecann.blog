import * as React from "react";
import { style } from "typestyle";
import Link from "next/link";
import type { PostArchiveEntry } from "../scripts/posts/teasers";
import { Vertical } from "./utils/gls";

interface Props {
  title: string;
  posts: PostArchiveEntry[];
}

const cardStyle = style({
  padding: 10,
  border: "1px solid #ddd",
  borderRadius: 6,
  overflow: "hidden",
});

export const ArchiveCard: React.FC<Props> = ({ title, posts }) => {
  return (
    <Vertical className={cardStyle} width={320}>
      <h1 style={{ margin: "0 0 10px" }}>{title}</h1>
      <Vertical spacing={10}>
        {posts.map((post) => (
          <div key={post.slug}>
            <Link href={`/posts/${post.slug}`}>{post.title}</Link>
            <span style={{ marginLeft: 5, color: "#767676", fontSize: "0.7em" }}>{post.date}</span>
          </div>
        ))}
      </Vertical>
    </Vertical>
  );
};
