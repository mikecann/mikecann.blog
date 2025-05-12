import * as React from "react";
import { Horizontal } from "../../utils/gls";
import { BubbleMessageContent } from "./BubbleMessageContent";
import { HorizontalSpacer } from "gls";
import { MessageDoc } from "@convex-dev/agent";

interface Props {
  message: MessageDoc;
}

export const UserMessage: React.FC<Props> = ({ message }) => {
  if (!message.message) return null;
  if (message.message.role != "user") return null;
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", flexDirection: "row" }}>
      <div style={{ position: "relative", paddingLeft: "60px", paddingRight: "10px" }}>
        <div
          style={{
            padding: "10px",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "flex-end",
            background: "#acbef8",
            borderRadius: "6px",
            overflow: "hidden",
            maxWidth: "min(400px, 100%)",
          }}
        >
          <BubbleMessageContent message={message} />
        </div>
      </div>
    </div>
  );
};
