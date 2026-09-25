/**
 * Writes public/thumbs/<slug>.webp: each post's cover image, at most 640px wide, as WebP.
 *
 * Usage: bun run generateThumbnails [--force]
 *
 * Runs on every build. Thumbnails are committed, and public/thumbs/manifest.json records a hash of
 * each cover image (plus the thumbnail settings), so only new or changed covers are re-encoded.
 * Content hashes are used rather than mtimes because a fresh clone gives every file a new mtime.
 */
import crypto from "crypto";
import fs from "fs";
import os from "os";
import { join } from "path";
import pLimit from "p-limit";
import { getAllPosts } from "./posts";
import { getRelativePathForPost } from "../utils/posts";
import { resolveLocalFile } from "./lib/postAssets";
import {
  getThumbnailFile,
  THUMBNAIL_QUALITY,
  THUMBNAIL_WIDTH,
  thumbnailsDirectory,
  thumbnailsManifestPath,
} from "./lib/thumbnails";

type Manifest = Record<string, string>;

const readManifest = (): Manifest => {
  try {
    return JSON.parse(fs.readFileSync(thumbnailsManifestPath, "utf8"));
  } catch {
    return {};
  }
};

const hashCover = (cover: Buffer) =>
  crypto
    .createHash("sha1")
    .update(`${THUMBNAIL_WIDTH}:${THUMBNAIL_QUALITY}:`)
    .update(cover)
    .digest("hex");

const main = async () => {
  const force = process.argv.includes("--force");
  const posts = getAllPosts();
  const oldManifest = readManifest();
  const manifest: Manifest = {};
  fs.mkdirSync(thumbnailsDirectory, { recursive: true });

  const toGenerate: { slug: string; cover: Buffer }[] = [];
  for (const post of posts) {
    const coverFile = resolveLocalFile(
      post.slug,
      getRelativePathForPost(post.slug, post.meta.coverImage),
    );
    if (!coverFile) throw new Error(`${post.slug}: cover image is not a local file`);
    const cover = fs.readFileSync(coverFile);
    manifest[post.slug] = hashCover(cover);
    const upToDate =
      oldManifest[post.slug] == manifest[post.slug] && fs.existsSync(getThumbnailFile(post.slug));
    if (force || !upToDate) toGenerate.push({ slug: post.slug, cover });
  }

  if (toGenerate.length > 0) {
    // Only load sharp when there's work to do, so an up-to-date build doesn't need it.
    const { default: sharp } = await import("sharp");
    const limit = pLimit(Math.max(1, os.availableParallelism() - 1));
    await Promise.all(
      toGenerate.map(({ slug, cover }) =>
        limit(async () => {
          await sharp(cover)
            .autoOrient()
            .resize({ width: THUMBNAIL_WIDTH, withoutEnlargement: true })
            .webp({ quality: THUMBNAIL_QUALITY })
            .toFile(getThumbnailFile(slug));
          console.log(`generated ${getThumbnailFile(slug)}`);
        }),
      ),
    );
  }

  // Remove thumbnails of posts that no longer exist
  let removed = 0;
  for (const file of fs.readdirSync(thumbnailsDirectory)) {
    if (!file.endsWith(".webp")) continue;
    if (manifest[file.slice(0, -".webp".length)] !== undefined) continue;
    fs.rmSync(join(thumbnailsDirectory, file));
    removed++;
  }

  // Plain code-point order so the file is identical on every machine
  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => (a < b ? -1 : 1)));
  fs.writeFileSync(thumbnailsManifestPath, JSON.stringify(sorted, null, 2) + "\n");

  console.log(
    `Thumbnails: ${toGenerate.length} generated, ${posts.length - toGenerate.length} up to date, ${removed} removed.`,
  );
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
