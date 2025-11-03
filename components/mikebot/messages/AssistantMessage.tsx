import * as React from "react";
import { BubbleMessageContent } from "./BubbleMessageContent";
import { HorizontalSpacer } from "gls";
import { type UIMessage } from "@convex-dev/agent/react";
import { AssistantMessageBubble } from "./AssistantMessageBubble";
import { useSmoothText } from "@convex-dev/agent/react";
import { ToolMessage } from "./ToolMessage";

interface Props {
  message: UIMessage;
}

// const fadedStyle: React.CSSProperties = {
//   color: "#888",
//   fontSize: "0.97em",
//   display: "flex",
//   alignItems: "center",
//   gap: 6,
//   fontStyle: "italic",
//   opacity: 0.7,
//   margin: "6px 0",
// };

export const AssistantMessage: React.FC<Props> = ({ message }) => {
  const hasToolParts = message.parts?.some((part) => part.type === "tool-call" || part.type === "tool-result");
  if (hasToolParts) return <ToolMessage message={message} />;

  const [visibleText] = useSmoothText(message.text ?? "", {
    startStreaming: message.status === "pending",
  });

  // if (
  //   typeof message.message.content == "object" &&
  //   message.message.content.some((el) => el.type == "tool-call")
  // ) {
  //   const content = message.message.content.find((el) => el.type == "tool-call");
  //   if (!content) return null;
  //   return (
  //     <div style={{ display: "flex", justifyContent: "center" }}>
  //       <div style={fadedStyle}>
  //         <span role="img" aria-label="tool" style={{ opacity: 0.5 }}>
  //           🛠️
  //         </span>
  //         {iife(() => {
  //           if (content.toolName == "searchBlogPosts" && "query" in content.args) {
  //             return (
  //               <>
  //                 Mikebot searched for{" "}
  //                 <span style={{ fontWeight: 500 }}>"{content.args.query}"</span>
  //               </>
  //             );
  //           }
  //           return (
  //             <>
  //               Mikebot used <span style={{ fontWeight: 500 }}>{content.toolName}</span>
  //             </>
  //           );
  //         })}
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div>
      <AssistantMessageBubble>
        <BubbleMessageContent message={visibleText} isLoading={message.status == "pending"} />
      </AssistantMessageBubble>
      <HorizontalSpacer />
    </div>
  );
};
