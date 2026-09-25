"use client";
import * as React from "react";
import { Horizontal } from "../../components/utils/gls";
import { useUIMessages, type UIMessage } from "@convex-dev/agent/react";
import { mirage } from "ldrs";
import { api } from "../../convex/_generated/api";
import { MessagesList } from "./MessagesList";
import { MessageEntryBox } from "./MessageEntryBox";

interface Props {
  token: string | null;
  threadId: string | null;
  initialMessage?: string | null;
}

mirage.register();

/** Matches the server's pending-reply timeout: after this we stop waiting. */
const PENDING_REPLY_UI_TIMEOUT_MS = 5 * 60 * 1000;

const isReplyPending = (messages: UIMessage[]) => {
  const last = messages[messages.length - 1];
  if (!last) return false;
  if (last.status !== "pending" && last.status !== "streaming") return false;
  return Date.now() - last._creationTime < PENDING_REPLY_UI_TIMEOUT_MS;
};

export const MikebotConversation: React.FC<Props> = ({ token, threadId, initialMessage }) => {
  const messages = useUIMessages(
    api.mikebot.queries.listMessagesForUserThread,
    token && threadId ? { token, threadId } : "skip",
    { initialNumItems: 10, stream: true },
  );

  const isReady = !!token && !!threadId && messages.status !== "LoadingFirstPage";

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          borderBottom: "1px solid #eee",
          height: "max(50vh, 300px)",
        }}
      >
        {isReady ? (
          <MessagesList messages={messages} />
        ) : (
          <Horizontal
            style={{
              height: "100%",
            }}
            horizontalAlign="center"
            verticalAlign="center"
          >
            {/* @ts-ignore */}
            <l-mirage size={80} color="#a0a0a0" />
          </Horizontal>
        )}
      </div>
      <MessageEntryBox
        token={token}
        threadId={isReady ? threadId : null}
        isReplyPending={isReplyPending(messages.results)}
        defaultMessage={initialMessage}
      />
    </>
  );
};
