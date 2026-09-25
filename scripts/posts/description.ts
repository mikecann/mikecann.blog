import { remark } from "remark";

type MdNode = {
  type: string;
  value?: string;
  alt?: string | null;
  children?: MdNode[];
};

// Nodes whose text doesn't belong in a summary.
const skippedTypes = new Set(["html", "code", "image", "imageReference", "definition", "yaml"]);

const collectText = (node: MdNode, parts: string[]) => {
  if (skippedTypes.has(node.type)) return;
  if (node.type == "text" || node.type == "inlineCode") {
    parts.push(node.value ?? "");
    return;
  }
  for (const child of node.children ?? []) collectText(child, parts);
  // Separate block-level content (paragraphs, headings, list items, ...) with a space.
  if (node.type != "link" && node.type != "emphasis" && node.type != "strong") parts.push(" ");
};

/** Plain text of a markdown document, with markup, raw HTML, images and code blocks removed. */
export const markdownToPlainText = (markdown: string): string => {
  const parts: string[] = [];
  collectText(remark().parse(markdown) as MdNode, parts);
  return parts.join("").replace(/\s+/g, " ").trim();
};

/** Truncates text to at most `maxLength` characters on a word boundary, adding an ellipsis. */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const trimmed = lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${trimmed.replace(/[\s,.;:!?-]+$/, "")}…`;
};

/** A short plain-text description of a post for meta tags (~160 characters). */
export const getPostDescription = (markdown: string, maxLength = 160): string =>
  truncateText(markdownToPlainText(markdown), maxLength);
