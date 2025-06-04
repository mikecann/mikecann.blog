import * as React from "react";
import { MessageDoc } from "@convex-dev/agent";
import { exhaustiveCheck, iife } from "../../../essentials/misc/misc";

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
  if (message.message?.role != "assistant") return null;
  if (!message.message.content) return null;
  if (typeof message.message.content == "string") return null;

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      {message.message.content.map((content, idx) => {
        if (content.type == "tool-call")
          return (
            <div key={idx} style={fadedStyle}>
              <span role="img" aria-label="tool" style={{ opacity: 0.5 }}>
                🛠️
              </span>
              {iife(() => {
                if (content.toolName == "searchBlogPosts" && "query" in content.args) {
                  return (
                    <>
                      Mikebot searched for{" "}
                      <span style={{ fontWeight: 500 }}>"{content.args.query}"</span>
                    </>
                  );
                }
                return (
                  <>
                    Mikebot used <span style={{ fontWeight: 500 }}>{content.toolName}</span>
                  </>
                );
              })}
            </div>
          );

        return (
          <div key={idx} style={fadedStyle}>
            Unknown tool message content..
          </div>
        );
      })}
    </div>
  );
};
