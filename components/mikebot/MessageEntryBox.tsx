import { Grid, Vertical, Horizontal, Stretch } from "../../components/utils/gls";
import * as React from "react";
import { style } from "typestyle";
import { IoSendOutline } from "react-icons/io5";
import { Id } from "../../convex/_generated/dataModel";
import { useMutation, insertAtTop } from "convex/react";
import { api } from "../../convex/_generated/api";
import { optimisticallySendMessage } from "@convex-dev/agent/react";
import { createUserMessageJSON } from "./helpers";
import { MessageDoc } from "../../node_modules/@convex-dev/agent/src/client";
import { OptimisticLocalStore } from "convex/browser";
import { ThreadQuery } from "../../node_modules/@convex-dev/agent/src/react/types";

interface Props {
  userId: Id<"users"> | null | undefined;
  threadId: string | null | undefined;
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

export const MessageEntryBox: React.FC<Props> = ({ userId, threadId, defaultMessage }) => {
  const [message, setMessage] = React.useState(defaultMessage || "");
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
    setMessage(defaultMessage);
  }, [defaultMessage]);

  const handleSubmit = () => {
    if (!userId || !threadId || !message) return;
    sendMessage({
      message: createUserMessageJSON({ message, currentUrl: window.location.href }),
      threadId,
      userId,
    });
    setMessage("");
  };

  React.useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "40px";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }, [message]);

  const canSubmit = !!userId && !!threadId && !!message;

  // Add this new useEffect hook
  React.useEffect(() => {
    if (textareaRef.current) textareaRef.current.focus();
  }, []);

  return (
    <Horizontal padding="3px" spacing={"5px"}>
      <Stretch verticalAlign="center">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Your message..."
          className={textAreaStyle}
        />
      </Stretch>
      <Horizontal verticalAlign="center">
        <button
          onClick={handleSubmit}
          style={{
            height: "40px",
            width: "40px",
            border: "none",
            borderRadius: "4px",
            background: "none",
            cursor: "pointer",
          }}
        >
          <IoSendOutline style={{ opacity: canSubmit ? 1 : 0.5 }} />
        </button>
      </Horizontal>
    </Horizontal>
  );
};

export function optimisticallySendAssistantMessage(
  query: ThreadQuery<unknown, MessageDoc>,
): (store: OptimisticLocalStore, args: { threadId: string }) => void {
  return (store, args) => {
    const queries = store.getAllQueries(query);
    let maxOrder = 0;
    let maxStepOrder = 0;
    for (const q of queries) {
      if (q.args?.threadId !== args.threadId) continue;
      if (q.args.streamArgs) continue;
      for (const m of q.value?.page ?? []) {
        maxOrder = Math.max(maxOrder, m.order);
        maxStepOrder = Math.max(maxStepOrder, m.stepOrder);
      }
    }
    const order = maxOrder + 1;
    const stepOrder = 0;
    insertAtTop({
      paginatedQuery: query,
      argsToMatch: { threadId: args.threadId, streamArgs: undefined },
      item: {
        _creationTime: Date.now(),
        _id: crypto.randomUUID(),
        order,
        stepOrder,
        status: "pending",
        threadId: args.threadId,
        tool: false,
        message: {
          role: "assistant",
          content: "",
        },
        text: "",
      },
      localQueryStore: store,
    });
  };
}
