import * as React from "react";
import ReactMarkdown from "react-markdown";

/**
 * Plain markdown, rendered at build time. Takes the text as `markdown` rather than `children`:
 * Astro passes a component's slot as `children`, which would replace the text with nothing.
 */
export const Markdown: React.FC<{ markdown: string }> = ({ markdown }) => (
  <ReactMarkdown>{markdown}</ReactMarkdown>
);
