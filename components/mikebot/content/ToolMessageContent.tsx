import * as React from "react";
import { MessageDoc } from "@convex-dev/agent";

interface Props {
  message: MessageDoc;
}

export const ToolMessageContent: React.FC<Props> = ({ message }) => {
  if (message.message?.role != "tool") return null;
  return <div>TOOL CALL: {JSON.stringify(message.message)}</div>;
};
