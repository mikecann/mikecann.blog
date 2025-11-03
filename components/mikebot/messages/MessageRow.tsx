import { Grid, Horizontal, Vertical } from "../../utils/gls";
import * as React from "react";
import { Doc } from "../../../convex/_generated/dataModel";
import { BubbleMessageContent } from "./BubbleMessageContent";
import { bouncy } from "ldrs";
import { HorizontalSpacer } from "gls";
import { Message } from "@convex-dev/agent/validators";
import { type UIMessage } from "@convex-dev/agent/react";
import { ToolMessage } from "./ToolMessage";
import { AssistantMessage } from "./AssistantMessage";
import { UserMessage } from "./UserMessage";
import { exhaustiveCheck } from "../../../essentials/misc/misc";
import { SystemMessage } from "./SystemMessage";

interface Props {
  message: UIMessage;
}

bouncy.register();

export const MessageRow: React.FC<Props> = ({ message }) => {
  if (!message.role) return null;

  if (message.role == "assistant") return <AssistantMessage message={message} />;

  if (message.role == "user") return <UserMessage message={message} />;

  if (message.role == "system") return null;

  exhaustiveCheck(message.role);
};
