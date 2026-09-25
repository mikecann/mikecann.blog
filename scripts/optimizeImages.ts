/**
 * Re-encodes images in place to make them smaller.
 *
 * Usage: bun run optimizeImages <file-or-dir...> [--quality=82] [--dry-run]
 *   e.g. bun run optimizeImages public/posts/my-new-post
 *
 * - .jpg/.jpeg -> mozjpeg at --quality
 * - .png       -> lossless, max compression
 * - .webp      -> lossy WebP at --quality
 *
 * Each file is re-encoded into the format its extension promises (so a JPEG saved as .webp
 * becomes a real WebP), keeping its dimensions and applying any EXIF rotation. The file is only
 * replaced when the result is smaller. GIFs, SVGs, animations and other files are left alone.
 */
import fs from "fs";
import os from "os";
import { relative } from "path";
import pLimit from "p-limit";
import sharp from "sharp";
import { detectImageFormat, getExpectedImageFormat, listFiles } from "./lib/images";

type Result = { path: string; before: number; after: number; note?: string };

export const optimizeImage = async (
  path: string,
  { quality = 82, dryRun = false } = {},
): Promise<Result | undefined> => {
  const target = getExpectedImageFormat(path);
  if (target != "jpeg" && target != "png" && target != "webp") return;

  const input = fs.readFileSync(path);
  const actual = detectImageFormat(input);
  if (!actual) return { path, before: input.length, after: input.length, note: "not an image" };

  const meta = await sharp(input).metadata();
  if ((meta.pages ?? 1) > 1)
    return { path, before: input.length, after: input.length, note: "animated, skipped" };
  if (target == "jpeg" && meta.hasAlpha)
    return { path, before: input.length, after: input.length, note: "has alpha, skipped" };

  const image = sharp(input).autoOrient();
  const output =
    target == "jpeg"
      ? await image.jpeg({ quality, mozjpeg: true }).toBuffer()
      : target == "png"
        ? await image.png({ compressionLevel: 9, effort: 10 }).toBuffer()
        : await image.webp({ quality, effort: 6 }).toBuffer();

  const note = actual != target ? `was ${actual}` : undefined;
  if (output.length >= input.length)
    return { path, before: input.length, after: input.length, note: note ?? "already optimal" };

  if (!dryRun) fs.writeFileSync(path, output);
  return { path, before: input.length, after: output.length, note };
};

const main = async () => {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const qualityArg = args.find((a) => a.startsWith("--quality="));
  const quality = qualityArg ? parseInt(qualityArg.split("=")[1]) : 82;
  const paths = args.filter((a) => !a.startsWith("--"));

  if (paths.length == 0 || !(quality > 0 && quality <= 100)) {
    console.error("Usage: bun run optimizeImages <file-or-dir...> [--quality=82] [--dry-run]");
    process.exit(1);
  }

  const files = paths.flatMap(listFiles);
  const limit = pLimit(Math.max(1, os.availableParallelism() - 1));
  const results = await Promise.all(
    files.map((f) => limit(() => optimizeImage(f, { quality, dryRun }))),
  );
  const optimized = results.filter((r): r is Result => r != undefined);

  const kb = (n: number) => `${(n / 1024).toFixed(0)}KB`;
  for (const r of optimized)
    console.log(
      `${relative(process.cwd(), r.path)}: ${kb(r.before)} -> ${kb(r.after)}${r.note ? ` (${r.note})` : ""}`,
    );

  const before = optimized.reduce((sum, r) => sum + r.before, 0);
  const after = optimized.reduce((sum, r) => sum + r.after, 0);
  console.log(
    `\n${dryRun ? "[dry run] " : ""}${optimized.length} images: ${kb(before)} -> ${kb(after)} (saved ${kb(before - after)})`,
  );
};

if (import.meta.main)
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
