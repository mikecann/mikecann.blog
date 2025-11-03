import * as React from "react";
import { BubbleMessageContent } from "./BubbleMessageContent";
import { type UIMessage } from "@convex-dev/agent/react";
import { parseUserMessageJSON } from "../helpers";

interface Props {
  message: UIMessage;
}

export const UserMessage: React.FC<Props> = ({ message }) => {
  if (!message.text) return null;
  let userMessage = message.text ?? "";

  try {
    userMessage = parseUserMessageJSON(message.text).message;
  } catch (e) {
  }

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
          <BubbleMessageContent message={userMessage} />
        </div>
      </div>
    </div>
  );
};
