import { Vertical } from "../../components/utils/gls";
import * as React from "react";
import { type UsePaginatedQueryResult } from "convex/react";
import { MessageRow } from "./messages/MessageRow";
import { style } from "typestyle";
import { type UIMessage } from "@convex-dev/agent/react";
import { LoadMoreMessages } from "./messages/LoadMoreMessages";

interface Props {
  messages: UsePaginatedQueryResult<UIMessage>;
}

const listStyles = style({
  height: "100%",
  overflowY: "auto",
  overflowX: "hidden",
  scrollbarWidth: "thin",
  scrollbarColor: "rgba(0,0,0,0.2) transparent",
  paddingTop: "10px",
  scrollBehavior: "smooth",
  scrollSnapType: "y proximity",
  $nest: {
    "&::-webkit-scrollbar": {
      width: "8px",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(0,0,0,0.2)",
      borderRadius: "4px",
    },
    "&::-webkit-scrollbar-thumb:hover": {
      backgroundColor: "rgba(0,0,0,0.3)",
    },
    "&:hover": {
      scrollbarColor: "rgba(0,0,0,0.2) transparent",
    },
    "&:not(:hover)": {
      scrollbarColor: "transparent transparent",
      $nest: {
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "transparent",
        },
      },
    },
  },
});

const snapEndStyle = style({
  scrollSnapAlign: "end",
});

export const MessagesList: React.FC<Props> = ({ messages }) => {
  return (
    <Vertical
      spacing="10px"
      width="100%"
      className={listStyles}
      style={{ position: "relative", paddingRight: "0px", paddingLeft: "8px" }}
    >
      <LoadMoreMessages status={messages.status} loadMore={messages.loadMore} />
      {messages.results
        .filter((m) => {
          // Filter out tool result messages
          if (!m.parts) return true;
          return !m.parts.some((part) => part.type === "tool-result");
        })
        .map((m) => (
          <MessageRow key={m.key} message={m} />
        ))}
      <div className={snapEndStyle} />
    </Vertical>
  );
};
