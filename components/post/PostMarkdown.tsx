import * as React from "react";
import ReactMarkdown, { Components, ExtraProps } from "react-markdown";
import gfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Image from "../utils/Image";
import CodeBlock from "../markdown/CodeBlock";
import { slugFromChildren } from "../utils/slug";
import { HeadingLink } from "../HeadingLink";
import { getRelativePathForPost } from "../../utils/posts";
import { isFlashPlayableHref } from "../../utils/flash";
import { assetUrl } from "../../utils/assets";

export type ImageSizes = Record<string, { width: number; height: number }>;

const inlineCodeStyle: React.CSSProperties = {
  padding: "0.2em 0.4em",
  margin: "0",
  fontSize: "85%",
  backgroundColor: "rgb(161, 161, 161)",
  borderRadius: 6,
  color: "white",
};

const headingStyle: React.CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
};

type HastElement = NonNullable<ExtraProps["node"]>;
type HastNode = HastElement["children"][number];

const hastToText = (node: HastNode): string => {
  if (node.type == "text") return node.value;
  if (node.type == "element") return node.children.map(hastToText).join("");
  return "";
};

const getCodeLanguage = (code: HastElement): string | undefined => {
  const className = code.properties?.className;
  const classNames = Array.isArray(className) ? className : [className];
  const languageClass = classNames.map(String).find((name) => name.startsWith("language-"));
  return languageClass?.slice("language-".length);
};

const containsLink = (node: HastNode): boolean =>
  node.type == "element" && (node.tagName == "a" || node.children.some(containsLink));

const createHeading =
  (Tag: "h1" | "h2" | "h3" | "h4" | "h5") =>
  ({ node, children, ...rest }: React.HTMLAttributes<HTMLHeadingElement> & ExtraProps) => {
    const slug = slugFromChildren(children);
    // A heading that is already a link can't be wrapped in its own #slug link: browsers don't
    // nest links and would split the heading in two.
    if (node && containsLink(node))
      return (
        <Tag id={slug} style={headingStyle}>
          {children}
        </Tag>
      );
    return (
      <Tag id={slug} style={headingStyle}>
        <HeadingLink slug={slug} {...(rest as React.HTMLAttributes<HTMLAnchorElement>)}>
          {children}
        </HeadingLink>
      </Tag>
    );
  };

const createMarkdownComponents = ({
  slug,
  imageSizes,
}: {
  slug: string;
  imageSizes: ImageSizes;
}): Components => {
  // Relative (`./foo.png`) paths live in the post's folder; post media may be served from the
  // asset host.
  const resolvePath = (src: unknown) =>
    typeof src == "string" ? getRelativePathForPost(slug, src) : undefined;
  const resolveMediaUrl = (src: unknown) => {
    const resolved = resolvePath(src);
    return resolved === undefined ? undefined : assetUrl(resolved);
  };

  return {
    img: ({ node, src, alt, width, height }) => {
      const localSrc = resolvePath(src);
      if (!localSrc) return null;

      const url = assetUrl(localSrc);
      const size = imageSizes[localSrc];

      if (!size) {
        // No local size - render as plain img so the browser can fetch it
        // (e.g. /wp-content/ paths, which the Worker proxies to CloudFront).
        // No <a> wrapper here - the markdown may already wrap this in a link.
        return (
          <span className="image-wrapper">
            <img
              src={url}
              alt={alt ?? ""}
              loading="lazy"
              decoding="async"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </span>
        );
      }

      return (
        <span className="image-wrapper">
          <Image
            src={url}
            alt={alt ?? ""}
            width={width == null ? size.width : Number(width)}
            height={height == null ? size.height : Number(height)}
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </span>
      );
    },
    iframe: ({ node, ...props }) => <iframe loading="lazy" {...props} />,
    video: ({ node, src, poster, ...props }) => (
      <video {...props} src={resolveMediaUrl(src)} poster={resolveMediaUrl(poster)} />
    ),
    audio: ({ node, src, ...props }) => <audio {...props} src={resolveMediaUrl(src)} />,
    source: ({ node, src, ...props }) => <source {...props} src={resolveMediaUrl(src)} />,
    h1: createHeading("h1"),
    h2: createHeading("h2"),
    h3: createHeading("h3"),
    h4: createHeading("h4"),
    h5: createHeading("h5"),
    // Fenced code blocks. Inline code is rendered by `code` below.
    pre: ({ node, children, ...rest }) => {
      const code = node?.children.find(
        (child): child is HastElement => child.type == "element" && child.tagName == "code",
      );
      if (!code) return <pre {...rest}>{children}</pre>;
      return (
        <CodeBlock code={hastToText(code).replace(/\n$/, "")} language={getCodeLanguage(code)} />
      );
    },
    code: ({ node, children, ...rest }) => (
      <code {...rest} style={inlineCodeStyle}>
        {children}
      </code>
    ),
    a: ({ node, href, children, ...rest }) => {
      const localHref = resolvePath(href);

      if (localHref && isFlashPlayableHref(localHref)) {
        // Opened in the Flash player by the FlashLinks island, which looks for this attribute.
        return (
          <a href={localHref} data-flash-url={localHref} {...rest}>
            {children}
          </a>
        );
      }

      return (
        <a href={localHref === undefined ? undefined : assetUrl(localHref)} {...rest}>
          {children}
        </a>
      );
    },
  };
};

type Props = {
  slug: string;
  /** The post body as markdown. */
  markdown: string;
  imageSizes: ImageSizes;
};

/**
 * A post's body, rendered to static HTML at build time. Code blocks are highlighted here too, so
 * post pages ship no JavaScript for them.
 */
export const PostMarkdown: React.FC<Props> = ({ slug, markdown, imageSizes }) => (
  <ReactMarkdown
    rehypePlugins={[rehypeRaw]}
    remarkPlugins={[gfm]}
    components={createMarkdownComponents({ slug, imageSizes })}
  >
    {markdown}
  </ReactMarkdown>
);
