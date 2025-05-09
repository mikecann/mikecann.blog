import { Grid, Vertical, Horizontal, Stretch } from "../../components/utils/gls";
import * as React from "react";
import { style } from "typestyle";
import { useAction, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { IoSendOutline } from "react-icons/io5";

interface Props {
  userId: Id<"users"> | null | undefined;
  threadId: string | null | undefined;
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

export const MessageEntryBox: React.FC<Props> = ({ userId, threadId }) => {
  const [message, setMessage] = React.useState("");
  const createMessage = useAction(api.mikebot.actions.sendMessageToThreadFromUser);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!userId || !threadId) return;
    createMessage({
      message,
      userId,
      threadId,
      currentUrl: window.location.href,
    }).catch(console.error);
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
