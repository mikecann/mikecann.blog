import { Horizontal, Stretch, Vertical } from "../../components/utils/gls";
import * as React from "react";
import { style } from "typestyle";
import { IoSendOutline } from "react-icons/io5";
import { useMutation, insertAtTop } from "convex/react";
import { api } from "../../convex/_generated/api";
import { optimisticallySendMessage } from "@convex-dev/agent/react";
import { OptimisticLocalStore } from "convex/browser";
import { type UIMessage } from "@convex-dev/agent/react";
import { getMikebotErrorMessage, MIKEBOT_MAX_MESSAGE_LENGTH } from "../../convex/mikebot/shared";

interface Props {
  token: string | null;
  threadId: string | null;
  /** True while Mikebot is still replying to the previous message. */
  isReplyPending: boolean;
  defaultMessage?: string | null;
}

const textAreaStyle = style({
  width: "100%",
  minHeight: "40px",
  maxHeight: "120px",
  resize: "none",
  border: "none",
  background: "none",
  borderRadius: "4px",
  padding: "10px",
  fontFamily: "inherit",
  fontSize: "inherit",
  overflow: "hidden",
  outline: "none", // Add this line to remove the outline when focused
});

/** Show the character counter once the message gets close to the limit. */
const COUNTER_THRESHOLD = Math.floor(MIKEBOT_MAX_MESSAGE_LENGTH * 0.8);

const clampMessage = (message: string | null | undefined) =>
  (message ?? "").slice(0, MIKEBOT_MAX_MESSAGE_LENGTH);

export const MessageEntryBox: React.FC<Props> = ({
  token,
  threadId,
  isReplyPending,
  defaultMessage,
}) => {
  const [message, setMessage] = React.useState(() => clampMessage(defaultMessage));
  const [error, setError] = React.useState<string | null>(null);
  const [isSending, setIsSending] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const sendMessage = useMutation(
    api.mikebot.mutations.sendMessageToThreadFromUser,
  ).withOptimisticUpdate((store, args) => {
    optimisticallySendMessage(api.mikebot.queries.listMessagesForUserThread)(store, {
      threadId: args.threadId,
      prompt: args.message,
    });
    optimisticallySendAssistantMessage(api.mikebot.queries.listMessagesForUserThread)(store, {
      threadId: args.threadId,
    });
  });

  React.useEffect(() => {
    if (!defaultMessage) return;
    setMessage(clampMessage(defaultMessage));
  }, [defaultMessage]);

  const trimmed = message.trim();
  const isTooLong = trimmed.length > MIKEBOT_MAX_MESSAGE_LENGTH;
  const canSubmit =
    !!token && !!threadId && trimmed.length > 0 && !isTooLong && !isReplyPending && !isSending;

  const handleSubmit = async () => {
    if (!canSubmit || !token || !threadId) return;
    const sent = message;
    setError(null);
    setIsSending(true);
    setMessage("");
    try {
      await sendMessage({
        token,
        threadId,
        message: trimmed,
        currentUrl: window.location.href,
      });
    } catch (e) {
      // Give the visitor their text back (unless they've started typing again)
      // and tell them why it didn't go through.
      setMessage((current) => (current.trim() ? current : sent));
      setError(getMikebotErrorMessage(e));
    } finally {
      setIsSending(false);
    }
  };

  React.useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "40px";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }, [message]);

  React.useEffect(() => {
    if (textareaRef.current) textareaRef.current.focus();
  }, []);

  return (
    <Vertical>
      {error ? (
        <div
          role="alert"
          style={{
            margin: "6px 8px 0",
            padding: "6px 8px",
            borderRadius: "4px",
            background: "#fdecea",
            color: "#8a1c1c",
            fontSize: "0.85em",
          }}
        >
          {error}
        </div>
      ) : null}
      <Horizontal padding="3px" spacing={"5px"}>
        <Stretch verticalAlign="center">
          <textarea
            ref={textareaRef}
            value={message}
            maxLength={MIKEBOT_MAX_MESSAGE_LENGTH}
            onChange={(e) => {
              setMessage(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
                e.preventDefault();
                void handleSubmit();
              }
            }}
            placeholder={isReplyPending ? "Mikebot is replying…" : "Your message..."}
            aria-label="Message to Mikebot"
            className={textAreaStyle}
          />
        </Stretch>
        <Horizontal verticalAlign="center">
          <button
            onClick={() => void handleSubmit()}
            disabled={!canSubmit}
            aria-label="Send message"
            style={{
              height: "40px",
              width: "40px",
              border: "none",
              borderRadius: "4px",
              background: "none",
              cursor: canSubmit ? "pointer" : "default",
            }}
          >
            <IoSendOutline style={{ opacity: canSubmit ? 1 : 0.5 }} />
          </button>
        </Horizontal>
      </Horizontal>
      {message.length >= COUNTER_THRESHOLD ? (
        <div
          style={{
            textAlign: "right",
            fontSize: "0.75em",
            padding: "0 10px 4px",
            color: message.length >= MIKEBOT_MAX_MESSAGE_LENGTH ? "#8a1c1c" : "#888",
          }}
        >
          {message.length}/{MIKEBOT_MAX_MESSAGE_LENGTH}
        </div>
      ) : null}
    </Vertical>
  );
};

export function optimisticallySendAssistantMessage(
  query: any,
): (store: OptimisticLocalStore, args: { threadId: string }) => void {
  return (store, args) => {
    const queries = store.getAllQueries(query);
    let maxOrder = 0;
    for (const q of queries) {
      if (q.args?.threadId !== args.threadId) continue;
      if (q.args.streamArgs) continue;
      for (const m of q.value?.page ?? []) {
        maxOrder = Math.max(maxOrder, m.order ?? 0);
      }
    }
    const order = maxOrder + 1;
    const stepOrder = 0;
    insertAtTop({
      paginatedQuery: query,
      argsToMatch: { threadId: args.threadId, streamArgs: undefined },
      item: {
        id: `optimistic-${Date.now()}`,
        key: `optimistic-${Date.now()}`,
        order,
        stepOrder,
        status: "pending" as const,
        role: "assistant" as const,
        parts: [],
        text: "",
        _creationTime: Date.now(),
      } as unknown as UIMessage,
      localQueryStore: store,
    });
  };
}
