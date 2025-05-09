import * as React from "react";
import { Doc } from "../../convex/_generated/dataModel";
import Markdown from "react-markdown";
import { style } from "typestyle";
import { Annotation } from "../../convex/schema";
import { iife } from "../../essentials/misc/misc";
import { MessageDoc } from "@convex-dev/agent";

interface Props {
  message: MessageDoc;
}

const contentStyle = style({
  $nest: {
    "& p": {
      margin: "0",
    },
    "& ol": {
      marginLeft: "0em",
      paddingLeft: "1.5em",
    },
    "& li": {
      marginBottom: "1em",
    },
  },
});

const replaceAnnotationsWithLinks = (text: string, annotations: Annotation[] | undefined) => {
  if (!annotations) return text;

  let result = text;
  for (const annotation of annotations) {
    const linkEmoji = "🔗";
    const linkHref =
      annotation.kind === "page_citation" ? `/${annotation.pageId}` : `/posts/${annotation.postId}`;

    result = result.replace(annotation.text, `[${linkEmoji}](${linkHref} "Open in new tab")`);
  }
  return result;
};

export const MessageContent: React.FC<Props> = ({ message }) => {
  // const processedText = React.useMemo(
  //   () => replaceAnnotationsWithLinks(message.message?.content ?? "", message.message?.annotations),
  //   [message.message?.content, message.message?.annotations]
  // );

  const processedText = iife(() => {
    const content = message.message?.content;
    
    if (!content) return "";
    if (typeof content === "string") return content;
    return content
      .map((el) => {
        if (el.type === "text") return el.text;       
        return "unknown content type";
      })
      .join(",");
  });

  return (
    <div className={contentStyle}>
      <Markdown
        components={{
          a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
        }}
      >
        {processedText}
      </Markdown>
    </div>
  );
};
