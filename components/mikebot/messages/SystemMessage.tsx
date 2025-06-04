import { MessageDoc } from "@convex-dev/agent";
import * as React from "react";
import { BubbleMessageContent } from "./BubbleMessageContent";
import { getMessageStringFromMessageDoc } from "./utils";

interface Props {
  message: MessageDoc;
}

export const SystemMessage: React.FC<Props> = ({ message }) => {
  if (!message.text) return null;

  return (
    <div style={{ display: "flex", justifyContent: "flex-end", flexDirection: "row" }}>
      <div style={{ position: "relative", paddingLeft: "60px", paddingRight: "10px" }}>
        <div
          style={{
            padding: "10px",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "flex-end",
            background: "#ace4f8",
            borderRadius: "6px",
            overflow: "hidden",
            maxWidth: "min(400px, 100%)",
          }}
        >
          <BubbleMessageContent message={message.text} />
        </div>
      </div>
    </div>
  );
};
