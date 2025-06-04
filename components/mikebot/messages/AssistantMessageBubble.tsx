import * as React from "react";
import { Horizontal } from "../../utils/gls";

interface AssistantMessageBubbleProps {
  children?: React.ReactNode; // for optional overlays like loading indicators
}

export const AssistantMessageBubble: React.FC<AssistantMessageBubbleProps> = ({ children }) => (
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
        overflow: "hidden",
        padding: 0,
        flexShrink: 0,
      }}
    >
      <img
        src="/images/mikebot-head.png"
        alt="Mikebot"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
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
        {children}
      </Horizontal>
    </div>
  </div>
);
