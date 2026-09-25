import { GetStaticPaths, GetStaticProps } from "next";
import Image from "next/image";
import Head from "next/head";
import dynamic from "next/dynamic";
import ReactMarkdown, { Components, ExtraProps } from "react-markdown";
import gfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { media, style } from "typestyle";
import imageSize from "image-size";
import path from "path";
import fs from "fs";
import * as React from "react";
import { ensure } from "../../essentials/misc/ensure";
import { Horizontal, Vertical } from "../../components/utils/gls";
import { getPostRootCoverImagePath, getRelativePathForPost } from "../../utils/posts";
import { TopNavbar } from "../../components/navbar/TopNavbar";
import Layout from "../../components/layout/Layout";
import { SubscribeForm } from "../../components/newsletter/SubscribeForm";
import { PostTags } from "../../components/PostTags";
import { PostComments } from "../../components/PostComments";
import { Post, getAllPublishablePosts, getPostBySlug } from "../../scripts/posts";
import { getPostDescription } from "../../scripts/posts/description";
import { slugFromChildren } from "../../components/utils/slug";
import { HeadingLink } from "../../components/HeadingLink";
import { RuffleScript } from "../../components/flash/RuffleScript";
import { isFlashPlayableHref, postNeedsFlash } from "../../utils/flash";
import { formatUTCDate } from "../../utils/dates";
import { SITE_URL, absoluteAssetUrl, assetUrl } from "../../utils/assets";

// Syntax highlighting is only downloaded by posts that contain code blocks.
const CodeBlock = dynamic(() => import("../../components/markdown/CodeBlock"));

// Client-only: whether it shows depends on the reader's scrolling and browser storage.
const SubscribePrompt = dynamic(
  () => import("../../components/newsletter/SubscribePrompt").then((m) => m.SubscribePrompt),
  { ssr: false },
);

// Only needed once a Flash link is clicked.
const FlashPlayerModal = dynamic(
  () => import("../../components/flash/FlashPlayerModal").then((m) => m.FlashPlayerModal),
  { ssr: false },
);

type ImageSizes = Record<string, { width: number; height: number }>;

type Props = {
  post: Post;
  /** The post body as markdown. */
  markdown: string;
  imageSizes: ImageSizes;
  /** The post date formatted in UTC, so server and client render the same text. */
  formattedDate: string;
  description: string;
  /** Root path of the cover image, e.g. `/posts/<slug>/header.webp`. */
  coverImage: string;
  needsFlash: boolean;
};

const postContainerClass = style(
  {},
  media({ minWidth: 0, maxWidth: 500 }, { padding: 10 }),
  media({ minWidth: 501 }, { padding: 40 }),
);

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

const createHeading =
  (Tag: "h1" | "h2" | "h3" | "h4" | "h5") =>
  ({ node, children, ...rest }: React.HTMLAttributes<HTMLHeadingElement> & ExtraProps) => {
    const slug = slugFromChildren(children);
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
  openFlash,
}: {
  slug: string;
  imageSizes: ImageSizes;
  openFlash: (url: string) => void;
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
        // (e.g. /wp-content/ paths go through the Next.js CloudFront rewrite).
        // No <a> wrapper here - the markdown may already wrap this in a link.
        return (
          <span className="image-wrapper">
            {/* eslint-disable-next-line @next/next/no-img-element */}
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
        return (
          <a
            href={localHref}
            {...rest}
            onClick={(event) => {
              event.preventDefault();
              openFlash(localHref);
            }}
          >
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

const PostPageContent = ({
  post,
  markdown,
  imageSizes,
  formattedDate,
  description,
  coverImage,
  needsFlash,
}: Props) => {
  const { meta, slug } = post;
  const { title, date, tags } = meta;
  const [flashUrl, setFlashUrl] = React.useState<string | null>(null);

  const components = React.useMemo(
    () => createMarkdownComponents({ slug, imageSizes, openFlash: setFlashUrl }),
    [slug, imageSizes],
  );

  const url = `${SITE_URL}/posts/${slug}`;
  const canonical = meta.canonical ?? url;
  const imageUrl = absoluteAssetUrl(coverImage);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    datePublished: date,
    image: [imageUrl],
    author: { "@type": "Person", name: "Mike Cann", url: `${SITE_URL}/about` },
    url,
    mainEntityOfPage: canonical,
    keywords: tags.join(", "),
  };

  return (
    <Layout>
      <Head>
        <title key="title">{`${title} - mikecann.blog`}</title>
        <meta name="description" content={description} key="description" />
        <link rel="canonical" href={canonical} key="canonical" />
        <meta property="og:type" content="article" key="og-type" />
        <meta property="og:title" content={title} key="og-title" />
        <meta property="og:description" content={description} key="og-description" />
        <meta property="og:url" content={url} key="og-url" />
        <meta property="og:image" content={imageUrl} key="og-image" />
        <meta property="article:published_time" content={date} key="article-published-time" />
        <meta name="twitter:card" content="summary_large_image" key="twitter-card" />
        <meta name="twitter:title" content={title} key="twitter-title" />
        <meta name="twitter:description" content={description} key="twitter-description" />
        <meta name="twitter:image" content={imageUrl} key="twitter-image" />
        <script
          type="application/ld+json"
          key="json-ld"
          // Escape "<" so post content can never close the script tag.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      </Head>

      <TopNavbar />

      <Vertical
        width="100%"
        style={{
          position: "relative",
          backgroundImage: `url('/images/background-pattern.jpg')`,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "75vh",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 0,
          }}
        >
          <Image
            className="post-header"
            src={assetUrl(coverImage)}
            preload
            alt={`post header image for ${title}`}
            fill
            sizes="100vw"
          />
          <div
            style={{
              width: `100%`,
              height: 40,
              background:
                "linear-gradient(0deg, rgba(250, 250, 250, 1) 0%, rgba(250,250,250,0) 100%)",
              bottom: 0,
              left: 0,
              position: "absolute",
            }}
          ></div>
        </div>
        <Horizontal width="100%" horizontalAlign="center">
          <Vertical
            className={postContainerClass}
            style={{
              marginTop: `60vh`,
              marginBottom: 40,
              maxWidth: 700,
              width: "100%",
              border: `1px solid #ddd`,
              boxShadow: `rgb(221 221 221 / 15%) 0px 3px 0px 5px`,
              backgroundColor: `white`,
              borderRadius: 6,
              zIndex: 1,
            }}
          >
            <h1 style={{ fontSize: "3em", margin: 0, color: "#555", textAlign: "center" }}>
              {title}
            </h1>
            <Vertical spacing={5} style={{ marginBottom: 10, marginTop: 10, textAlign: "center" }}>
              <time dateTime={date} style={{ color: "#767676" }}>
                {formattedDate}
              </time>
              <PostTags horizontalAlign="center" tags={tags} />
            </Vertical>
            <Horizontal width="100%" horizontalAlign="center">
              <div
                style={{ height: 10, marginTop: 20, borderTop: `1px solid #ddd`, width: `10%` }}
              />
            </Horizontal>
            <div className="markdown-content">
              <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                remarkPlugins={[gfm]}
                components={components}
              >
                {markdown}
              </ReactMarkdown>
            </div>

            <div
              style={{
                borderTop: `1px dashed #ddd`,
                width: "100%",
                marginTop: 20,
                marginBottom: 20,
              }}
            />

            <div id="subscribe" style={{ backgroundColor: `rgba(0,0,0,0.015)`, padding: 10 }}>
              <h3 style={{ textAlign: "center", color: "#5d686f", marginBottom: 4 }}>
                GET NEW POSTS BY EMAIL
              </h3>
              <p style={{ textAlign: "center", color: "#5d686f", marginTop: 0, fontSize: 14 }}>
                About one post a month on AI, coding, games and side projects. No spam, unsubscribe
                any time.
              </p>
              <SubscribeForm source="post-footer" />
            </div>
            <SubscribePrompt inlineFormId="subscribe" />

            <div
              style={{
                borderTop: `1px dashed #ddd`,
                width: "100%",
                marginTop: 20,
                marginBottom: 20,
              }}
            />

            <div style={{ backgroundColor: `rgba(0,0,0,0.015)`, padding: 10 }}>
              <h3 style={{ textAlign: "center", color: "#aaa" }}>COMMENT</h3>
              <PostComments />
            </div>
          </Vertical>
        </Horizontal>
      </Vertical>
      {flashUrl ? <FlashPlayerModal url={flashUrl} onClose={() => setFlashUrl(null)} /> : null}
      {needsFlash ? <RuffleScript /> : null}
    </Layout>
  );
};

// Keyed by slug so navigating between posts remounts the page: per-post state (the Flash modal,
// the comments widget, ...) starts fresh instead of leaking from the previous post.
const PostPage = (props: Props) => <PostPageContent key={props.post.slug} {...props} />;

export default PostPage;

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = getAllPublishablePosts();
  return {
    paths: posts.map((post) => ({
      params: {
        slug: post.slug,
      },
    })),
    fallback: false,
  };
};

const getImageSizes = (slug: string, markdown: string): ImageSizes => {
  // Find all image references in the markdown
  const imageRegex = /!\[[^\]]*\]\(([^)]+)\)/g;
  const imageSizes: ImageSizes = {};

  for (const match of markdown.matchAll(imageRegex)) {
    // Remove any title after the src (e.g. ![alt](src "title"))
    const imgSrc = match[1].split(" ")[0];
    const relSrc = getRelativePathForPost(slug, imgSrc);
    // Only process local images; sizes are always read from the files in public/
    if (!relSrc.startsWith("/posts/")) continue;
    const absPath = path.join(process.cwd(), "public", relSrc);
    if (!fs.existsSync(absPath)) continue;
    const { width, height } = imageSize(fs.readFileSync(absPath));
    if (width && height) imageSizes[relSrc] = { width, height };
  }

  return imageSizes;
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = ensure(params?.slug) + "";
  const { meta, content } = getPostBySlug(slug);
  const post: Post = { slug, meta };

  return {
    props: {
      post,
      markdown: content,
      imageSizes: getImageSizes(slug, content),
      formattedDate: formatUTCDate(meta.date),
      description: getPostDescription(content) || meta.title,
      coverImage: getPostRootCoverImagePath(post),
      needsFlash: postNeedsFlash(slug, content),
    },
  };
};
