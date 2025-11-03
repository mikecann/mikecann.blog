import * as React from "react";
import { bouncy } from "ldrs";
import { type UIMessage } from "@convex-dev/agent/react";
import { AssistantMessage } from "./AssistantMessage";
import { UserMessage } from "./UserMessage";
import { exhaustiveCheck } from "../../../essentials/misc/misc";

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
