import * as React from "react";
import { Horizontal } from "../../utils/gls";
import { BubbleMessageContent } from "./BubbleMessageContent";
import { HorizontalSpacer } from "gls";
import { MessageDoc } from "@convex-dev/agent";
import { ToolMessage } from "./ToolMessage";

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

export const AssistantMessage: React.FC<Props> = ({ message }) => {
  if (!message.message) return null;
  if (message.message.role != "assistant") return null;

  // Don't show tool calls, they will be handled by the ToolMessage component
  if (
    typeof message.message.content == "object" &&
    message.message.content.some((el) => el.type == "tool-call")
  )
    return null;

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            background: "#b1f7c2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: "10px",
            aspectRatio: "1 / 1",
          }}
        >
          🤖
        </div>
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              left: "-8px",
              top: "7px",
              width: "0",
              height: "0",
              borderTop: "8px solid transparent",
              borderBottom: "8px solid transparent",
              borderRight: "8px solid #b1f7c2",
            }}
          />
          <Horizontal
            style={{
              padding: "10px",
              background: "#b1f7c2",
              borderRadius: "6px",
              overflow: "hidden",
              maxWidth: "min(370px, calc(100% - 40px))",
              minWidth: "40px",
              minHeight: "30px",
              position: "relative",
            }}
          >
            <BubbleMessageContent message={message} />
            {message.status == "pending" && (
              <div style={{ position: "absolute", bottom: "10px", right: "10px" }}>
                {/* l-bouncy is a web component registered by ldrs. TypeScript does not recognize it, so we suppress the error. */}
                {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                {/* @ts-ignore */}
                <l-bouncy size={20} color="#46b862" />
              </div>
            )}
          </Horizontal>
        </div>
      </div>
      <HorizontalSpacer />
    </div>
  );
};
