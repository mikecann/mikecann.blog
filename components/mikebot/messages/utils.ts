import {MessageDoc} from '@convex-dev/agent';


export const getMessageStringFromMessageDoc = (message: MessageDoc): string | null => {
  if (!message.message) return "";
  if (!message.message) return null;

  const content = message.message?.content;

  if (!content) return "";

  if (typeof content === "string") return content;

  return content
    .map((el) => {
      if (el.type === "text") return el.text;
      if (el.type == "tool-call") {
        console.log("tool-call", el);
        return `Im using the tool ${el.toolName}`;
      }
      console.log(`Unknown content type ${el.type}`, { el, content });
      return `unknown content type ${el.type}`;
    })
    .join(",");
};
