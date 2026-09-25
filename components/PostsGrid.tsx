import * as React from "react";
import { PostTeaser } from "./PostTeaser";
import type { PostTeaserData } from "../scripts/posts/teasers";
import { Grid, Vertical } from "./utils/gls";

export type YearOfPosts = {
  year: string;
  posts: PostTeaserData[];
};

interface Props {
  years: YearOfPosts[];
}

export const PostsGrid: React.FC<Props> = ({ years }) => {
  return (
    <>
      {years.map(({ year, posts }) => (
        <Vertical key={year} width="100%">
          <h1>{year}</h1>
          <Grid width="100%" spacing={20} style={{ alignItems: "start" }}>
            {posts.map((post) => (
              <PostTeaser key={post.slug} post={post} />
            ))}
          </Grid>
        </Vertical>
      ))}
    </>
  );
};
