import * as React from "react";
import Link from "next/link";
import { classes, style } from "typestyle";
import { randomNiceColor } from "./utils/colors";
import { tagPath } from "../utils/tags";
import { HorizontalProps } from "gls";
import { Horizontal } from "./utils/gls";

interface Props extends HorizontalProps {
  tags: string[];
  style?: React.CSSProperties;
  /**
   * Render each tag as a link to its tag page (default). Pass `false` when the tags are rendered
   * inside another link (e.g. a post card) as nested links are invalid HTML, the tags are then
   * rendered as plain, non-interactive text.
   */
  asLinks?: boolean;
}

const tagStyles = style({
  padding: 5,
  backgroundColor: "#eee",
  borderRadius: 6,
  color: "#333",
});

const tagLinkStyles = style({
  cursor: "pointer",
  $nest: {
    // keep the text colour the same as before rather than picking up the global link colours
    "&:hover, &:focus, &:active, &:visited": {
      color: "#333",
    },
    "&:focus-visible": {
      outline: "2px solid #f1773c",
      outlineOffset: 1,
    },
  },
});

export const PostTags: React.FC<Props> = ({ tags, style, asLinks = true, ...rest }) => {
  if (tags.length == 0) return null;
  return (
    <Horizontal
      style={{
        color: "#ddd",
        fontSize: "0.6em",
        flexWrap: "wrap",
        marginBottom: "-0.5em",
        ...style,
      }}
      spacing={5}
      {...rest}
    >
      {tags.map((t, i) => {
        const tag = String(t);
        const tagStyle = { backgroundColor: randomNiceColor(t), marginBottom: "0.5em" };
        return asLinks ? (
          <Link
            key={i}
            href={tagPath(tag)}
            className={classes(tagStyles, tagLinkStyles)}
            style={tagStyle}
          >
            {tag}
          </Link>
        ) : (
          <span key={i} className={tagStyles} style={tagStyle}>
            {tag}
          </span>
        );
      })}
    </Horizontal>
  );
};
