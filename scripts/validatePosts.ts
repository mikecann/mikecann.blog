/**
 * Fast, offline checks of the post content. Runs in CI; exits 1 if anything is wrong.
 *
 * Usage: bun run validatePosts
 *
 * - every post loads (frontmatter is valid and the cover image can be read)
 * - the cover image exists and is an image
 * - oldUrl redirects are unique and start with "/"
 * - every image the post renders (markdown or raw <img>) points to an existing local file
 *   (remote images and paths proxied to CloudFront/S3 are not checked; see auditPosts.ts)
 * - no image syntax is rendered as literal text (e.g. unescaped spaces in the path)
 * - nothing under public/ has an image extension without being an image
 */
import fs from "fs";
import { join, relative } from "path";
import { getPostBySlug, postsDirectory, type PostWithContent } from "./posts";
import { getRelativePathForPost } from "../utils/posts";
import {
  getImageRefs,
  getUnparsedImageSyntax,
  parseMarkdown,
  type MarkdownRef,
} from "./lib/markdown";
import { resolveLocalFile, publicDirectory } from "./lib/postAssets";
import { detectImageFormatOfFile, getExpectedImageFormat, listFiles } from "./lib/images";

const errors: string[] = [];
const warnings: string[] = [];

const at = (slug: string, line?: number) => `public/posts/${slug}/post.md${line ? `:${line}` : ""}`;

// Markdown line numbers are relative to the content; add the frontmatter lines back.
const frontmatterLineCount = (post: PostWithContent) => {
  const raw = fs.readFileSync(join(postsDirectory, post.slug, "post.md"), "utf8");
  return raw.split("\n").length - post.content.split("\n").length;
};

const loadPosts = (): PostWithContent[] => {
  const posts: PostWithContent[] = [];
  for (const slug of fs.readdirSync(postsDirectory)) {
    if (!fs.statSync(join(postsDirectory, slug)).isDirectory()) continue;
    try {
      posts.push(getPostBySlug(slug));
    } catch (e) {
      errors.push(`${at(slug)}: failed to load post: ${e instanceof Error ? e.message : e}`);
    }
  }
  return posts;
};

const checkCoverImage = (post: PostWithContent) => {
  const cover = getRelativePathForPost(post.slug, post.meta.coverImage);
  const file = resolveLocalFile(post.slug, cover);
  if (!file) return errors.push(`${at(post.slug)}: coverImage must be a local file: ${cover}`);
  if (!fs.existsSync(file)) return errors.push(`${at(post.slug)}: coverImage not found: ${cover}`);
  if (!detectImageFormatOfFile(file))
    errors.push(`${at(post.slug)}: coverImage is not an image: ${cover}`);
};

const checkOldUrls = (posts: PostWithContent[]) => {
  const slugsByOldUrl = new Map<string, string[]>();
  for (const post of posts) {
    const { oldUrl } = post.meta;
    if (oldUrl === undefined) continue;
    if (!oldUrl.startsWith("/")) errors.push(`${at(post.slug)}: oldUrl must start with "/": ${oldUrl}`);
    slugsByOldUrl.set(oldUrl, [...(slugsByOldUrl.get(oldUrl) ?? []), post.slug]);
  }
  for (const [oldUrl, slugs] of slugsByOldUrl)
    if (slugs.length > 1) errors.push(`oldUrl ${oldUrl} is used by several posts: ${slugs.join(", ")}`);
};

const checkImageRefs = (post: PostWithContent) => {
  const tree = parseMarkdown(post.content);
  const offset = frontmatterLineCount(post);
  const line = (ref: MarkdownRef) => (ref.line === undefined ? undefined : ref.line + offset);

  for (const ref of getImageRefs(tree)) {
    const file = resolveLocalFile(post.slug, ref.url);
    if (file && !fs.existsSync(file))
      errors.push(`${at(post.slug, line(ref))}: image not found: ${ref.url}`);
  }

  for (const ref of getUnparsedImageSyntax(tree))
    errors.push(
      `${at(post.slug, line(ref))}: image syntax renders as text (spaces in a path need <...>): ${ref.url}`,
    );
};

const checkImageFiles = () => {
  let mismatched = 0;
  for (const file of listFiles(publicDirectory)) {
    const expected = getExpectedImageFormat(file);
    if (!expected) continue;
    const actual = detectImageFormatOfFile(file);
    if (!actual) errors.push(`${relative(process.cwd(), file)}: has an image extension but isn't an image`);
    else if (actual != expected) mismatched++;
  }
  // Browsers sniff the real format, so these still render; they're just misleadingly named.
  if (mismatched > 0)
    warnings.push(`${mismatched} images have content that doesn't match their extension`);
};

const main = () => {
  const posts = loadPosts();
  for (const post of posts) {
    checkCoverImage(post);
    checkImageRefs(post);
  }
  checkOldUrls(posts);
  checkImageFiles();

  for (const warning of warnings) console.warn(`warning: ${warning}`);
  for (const error of errors) console.error(`error: ${error}`);
  console.log(
    `\nValidated ${posts.length} posts: ${errors.length} errors, ${warnings.length} warnings.`,
  );
  if (errors.length > 0) process.exit(1);
};

main();
