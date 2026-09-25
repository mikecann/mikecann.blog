import { remark } from "remark";
import remarkGfm from "remark-gfm";
import type { Nodes, Root } from "mdast";

// Same parser as the site: react-markdown (remark) with remark-gfm. Raw HTML is kept as
// `html` nodes, which the site renders through rehype-raw.
const parser = remark().use(remarkGfm);

export const parseMarkdown = (markdown: string): Root => parser.parse(markdown);

export const walkMarkdown = (node: Nodes, visit: (node: Nodes) => void) => {
  visit(node);
  if ("children" in node) for (const child of node.children) walkMarkdown(child, visit);
};

export interface MarkdownRef {
  url: string;
  line?: number;
  source: "markdown" | "html";
}

const lineOffset = (text: string, index: number) => text.slice(0, index).split("\n").length - 1;

const htmlAttrRefs = (tag: string, attr: string) =>
  new RegExp(`<${tag}\\b[^>]*?\\s${attr}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "gi");

const findHtmlRefs = (node: Nodes, regex: RegExp): MarkdownRef[] => {
  if (node.type != "html") return [];
  return [...node.value.matchAll(regex)].map((m) => ({
    url: m[1] ?? m[2] ?? m[3],
    line:
      node.position?.start.line === undefined
        ? undefined
        : node.position.start.line + lineOffset(node.value, m.index),
    source: "html" as const,
  }));
};

/** Every image the rendered post will request: `![](...)`, `![][ref]` and raw `<img src>`. */
export const getImageRefs = (tree: Root): MarkdownRef[] => {
  const definitions = new Map<string, string>();
  walkMarkdown(tree, (n) => {
    if (n.type == "definition") definitions.set(n.identifier, n.url);
  });

  const imgSrc = htmlAttrRefs("img", "src");
  const refs: MarkdownRef[] = [];
  walkMarkdown(tree, (n) => {
    const line = n.position?.start.line;
    if (n.type == "image") refs.push({ url: n.url, line, source: "markdown" });
    else if (n.type == "imageReference") {
      const url = definitions.get(n.identifier);
      if (url !== undefined) refs.push({ url, line, source: "markdown" });
    } else refs.push(...findHtmlRefs(n, imgSrc));
  });
  return refs;
};

/** Every link in the post: `[](...)`, `[][ref]` and raw `<a href>`. */
export const getLinkRefs = (tree: Root): MarkdownRef[] => {
  const definitions = new Map<string, string>();
  walkMarkdown(tree, (n) => {
    if (n.type == "definition") definitions.set(n.identifier, n.url);
  });

  const aHref = htmlAttrRefs("a", "href");
  const refs: MarkdownRef[] = [];
  walkMarkdown(tree, (n) => {
    const line = n.position?.start.line;
    if (n.type == "link") refs.push({ url: n.url, line, source: "markdown" });
    else if (n.type == "linkReference") {
      const url = definitions.get(n.identifier);
      if (url !== undefined) refs.push({ url, line, source: "markdown" });
    } else refs.push(...findHtmlRefs(n, aHref));
  });
  return refs;
};

/**
 * Image syntax that the parser did not accept, so it renders as literal text. The usual
 * cause is a path with spaces: `![](./my image.png)` must be written `![](<./my image.png>)`.
 */
export const getUnparsedImageSyntax = (tree: Root): MarkdownRef[] => {
  const refs: MarkdownRef[] = [];
  walkMarkdown(tree, (n) => {
    if (n.type != "text") return;
    for (const m of n.value.matchAll(/!\[[^\]\n]*\]\(([^)\n]*)\)/g))
      refs.push({ url: m[1], line: n.position?.start.line, source: "markdown" });
  });
  return refs;
};
