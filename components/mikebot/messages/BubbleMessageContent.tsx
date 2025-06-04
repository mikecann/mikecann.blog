import * as React from "react";
import Markdown from "react-markdown";
import { style } from "typestyle";

interface Props {
  message: string | null;
  isLoading?: boolean;
}

const contentStyle = style({
  $nest: {
    "& p": {
      margin: "0",
    },
    "& ol": {
      marginLeft: "0em",
      paddingLeft: "1.5em",
    },
    "& li": {
      marginBottom: "1em",
    },
  },
});

export const BubbleMessageContent: React.FC<Props> = ({ message, isLoading }) => {
  return (
    <div className={contentStyle}>
      <Markdown
        components={{
          a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
        }}
      >
        {message}
      </Markdown>
      {/* @ts-ignore */}
      {isLoading ? <l-bouncy size={20} color="#a0a0a0" /> : null}
    </div>
  );
};
