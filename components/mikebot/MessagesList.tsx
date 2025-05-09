import { Vertical } from "../../components/utils/gls";
import * as React from "react";
import { Id } from "../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { MessageRow } from "./MessageRow";
import { style } from "typestyle";

interface Props {
  threadId: string;
  userId: Id<"users">;
  isMaximized: boolean;
}

const listStyles = style({
  height: "100%",
  overflowY: "auto",
  overflowX: "hidden",
  scrollbarWidth: "thin",
  scrollbarColor: "rgba(0,0,0,0.2) transparent",
  paddingTop: "10px",
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

export const MessagesList: React.FC<Props> = ({ threadId, userId, isMaximized }) => {
  const messages = useQuery(api.mikebot.queries.listMessagesForUserThread, {
    threadId,
    userId,
  });

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [isFirstLoad, setIsFirstLoad] = React.useState(true);
  const [shouldScrollToBottom, setShouldScrollToBottom] = React.useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => scrollToBottom(), [isMaximized]);

  React.useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const isScrolledToBottom =
        Math.abs(
          scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight,
        ) < 1;
      setShouldScrollToBottom(isScrolledToBottom);
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    if (!messages) return;

    if (isFirstLoad) {
      scrollToBottom();
      setIsFirstLoad(false);
    } else if (shouldScrollToBottom) {
      scrollToBottom();
    }
  }, [messages, isFirstLoad, shouldScrollToBottom]);

  return (
    <Vertical
      spacing="10px"
      width="100%"
      className={listStyles}
      ref={scrollContainerRef}
      style={{ position: "relative", paddingRight: "0px", paddingLeft: "8px" }}
    >
      {messages?.page
        .map((threadMessage) => {
     
          
          return <MessageRow key={threadMessage._id} message={threadMessage} />;
        })
        .filter((m) => m != null)}
      <div ref={messagesEndRef} />
    </Vertical>
  );
};
