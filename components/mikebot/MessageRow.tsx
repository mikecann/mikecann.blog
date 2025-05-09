import { Grid, Horizontal, Vertical } from "../../components/utils/gls";
import * as React from "react";
import { Doc } from "../../convex/_generated/dataModel";
import { MessageContent } from "./content/MessageContent";
import { bouncy } from "ldrs";
import { HorizontalSpacer } from "gls";
import { Message } from "@convex-dev/agent/validators";
import { MessageDoc } from "@convex-dev/agent";

interface Props {
  message: MessageDoc;
}

bouncy.register();

export const MessageRow: React.FC<Props> = ({ message }) => {
  if (!message.message) return "Message missing!";
  if (message.message.role == "assistant")
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
              <MessageContent message={message} />
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
          <MessageContent message={message} />
        </div>
      </div>
    </div>
  );
};
