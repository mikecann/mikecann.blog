import * as React from "react";
import { type UIMessage } from "@convex-dev/agent/react";
import { exhaustiveCheck, iife } from "../../../essentials/misc/misc";

interface Props {
  message: UIMessage;
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
  if (message.role != "assistant") return null;
  if (!message.parts) return null;

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      {message.parts.map((part, idx) => {
        // Handle tool-call parts - check for exact type match first
        if (part.type === "tool-call") {
          const toolCallPart = part as unknown as { type: "tool-call"; toolCallId: string; toolName?: string; args?: any };
          if (!toolCallPart.toolName) return null;
          
          return (
            <div key={idx} style={fadedStyle}>
              <span role="img" aria-label="tool" style={{ opacity: 0.5 }}>
                🛠️
              </span>
              {iife(() => {
                if (toolCallPart.toolName == "searchBlogPosts" && toolCallPart.args && "query" in toolCallPart.args) {
                  return (
                    <>
                      Mikebot searched for{" "}
                      <span style={{ fontWeight: 500 }}>"{toolCallPart.args.query}"</span>
                    </>
                  );
                }
                return (
                  <>
                    Mikebot used <span style={{ fontWeight: 500 }}>{toolCallPart.toolName}</span>
                  </>
                );
              })}
            </div>
          );
        }

        // Handle other tool-* types (like tool-call-* variants)
        if (part.type.startsWith("tool-") && part.type !== "tool-result") {
          const toolPart = part as any;
          if (toolPart.toolName) {
            return (
              <div key={idx} style={fadedStyle}>
                <span role="img" aria-label="tool" style={{ opacity: 0.5 }}>
                  🛠️
                </span>
                {iife(() => {
                  if (toolPart.toolName == "searchBlogPosts" && toolPart.args && "query" in toolPart.args) {
                    return (
                      <>
                        Mikebot searched for{" "}
                        <span style={{ fontWeight: 500 }}>"{toolPart.args.query}"</span>
                      </>
                    );
                  }
                  return (
                    <>
                      Mikebot used <span style={{ fontWeight: 500 }}>{toolPart.toolName}</span>
                    </>
                  );
                })}
              </div>
            );
          }
        }

        if (part.type === "tool-result") return null;

        return null;
      })}
    </div>
  );
};
