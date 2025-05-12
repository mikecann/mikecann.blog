import { Grid, Horizontal, Vertical } from "../../utils/gls";
import * as React from "react";
import { Doc } from "../../../convex/_generated/dataModel";
import { BubbleMessageContent } from "./BubbleMessageContent";
import { bouncy } from "ldrs";
import { HorizontalSpacer } from "gls";
import { Message } from "@convex-dev/agent/validators";
import { MessageDoc } from "@convex-dev/agent";
import { ToolMessage } from "./ToolMessage";
import { AssistantMessage } from "./AssistantMessage";
import { UserMessage } from "./UserMessage";
import { exhaustiveCheck } from "../../../essentials/misc/misc";
import { SystemMessage } from "./SystemMessage";

interface Props {
  message: MessageDoc;
}

bouncy.register();

export const MessageRow: React.FC<Props> = ({ message }) => {
  if (!message.message) return "Message missing!";

  if (message.message.role == "assistant") return <AssistantMessage message={message} />;

  if (message.message.role == "tool") return null; // <ToolMessage message={message} />;

  if (message.message.role == "user") return <UserMessage message={message} />;

  if (message.message.role == "system") return <SystemMessage message={message} />;

  exhaustiveCheck(message.message);
};
