import * as React from "react";
import { MessageDoc } from "@convex-dev/agent";
import { exhaustiveCheck } from "../../../essentials/misc/misc";

interface Props {
  message: MessageDoc;
}

const fadedStyle: React.CSSProperties = {
  color: "#888",
  fontSize: "0.97em",
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontStyle: "italic",
  opacity: 0.7,
  margin: "6px 0",
};

export const ToolMessage: React.FC<Props> = ({ message }) => {
  if (message.message?.role != "tool") return null;

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      {message.message.content.map((content, idx) => {
        if (content.type === "tool-result") {
          return (
            <div key={content.toolCallId || idx} style={fadedStyle}>
              <span role="img" aria-label="tool" style={{ opacity: 0.5 }}>
                🛠️
              </span>
              Mikebot used <span style={{ fontWeight: 500 }}>{content.toolName}</span>
            </div>
          );
        }
        return (
          <div key={idx} style={fadedStyle}>
            Unknown tool message content..
          </div>
        );
      })}
    </div>
  );
};
