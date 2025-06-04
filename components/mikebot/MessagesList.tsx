import { Vertical } from "../../components/utils/gls";
import * as React from "react";
import { Id } from "../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { MessageRow } from "./messages/MessageRow";
import { style } from "typestyle";
import { useThreadMessages } from "@convex-dev/agent/react";
import { LoadMoreMessages } from "./messages/LoadMoreMessages";

interface Props {
  threadId: string;
  userId: Id<"users">;
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

export const MessagesList: React.FC<Props> = ({ threadId, userId }) => {
  const messages = useThreadMessages(
    api.mikebot.queries.listMessagesForUserThread,
    { threadId, userId },
    { initialNumItems: 10, stream: true },
  );

  React.useEffect(() => {
    console.log(`MESSAGES`, messages.status, messages.results);
  }, [messages.results]);

  return (
    <Vertical
      spacing="10px"
      width="100%"
      className={listStyles}
      style={{ position: "relative", paddingRight: "0px", paddingLeft: "8px" }}
    >
      {/* <LoadMoreMessages status={messages.status} loadMore={messages.loadMore} /> */}
      {messages.results.map((m) => (
        <MessageRow key={m._id} message={m} />
      ))}
      <div className={snapEndStyle} />
    </Vertical>
  );
};
