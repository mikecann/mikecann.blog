// Uploads post media and thumbnails to Cloudflare R2 so pages can load them from
// NEXT_PUBLIC_ASSET_BASE_URL instead of Vercel storing ~300MB of media in every deployment.
//
//   bun run ./scripts/syncAssetsToR2.ts            upload new/changed files
//   bun run ./scripts/syncAssetsToR2.ts --dry-run  list what would be uploaded
//   bun run ./scripts/syncAssetsToR2.ts --strip    upload, then delete the local media so the
//                                                  Vercel deployment doesn't include it
//
// Opt-in: without the R2_* env vars this does nothing (the site serves media from /public as
// before). Remote objects are never deleted, so old URLs and preview deployments keep working.

import fs from "fs";
import path from "path";
import { S3Client } from "bun";
import { AwsClient } from "aws4fetch";
import pLimit from "p-limit";

const publicDir = path.join(process.cwd(), "public");
const syncedDirs = ["posts", "thumbs"];
const cacheControl = "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400";

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const strip = args.has("--strip");

const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = process.env;
// Override for other S3-compatible stores or a local mock when testing.
const endpoint =
  process.env.R2_ENDPOINT ?? (R2_ACCOUNT_ID && `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`);
const assetBaseUrl = process.env.NEXT_PUBLIC_ASSET_BASE_URL;

const isMediaFile = (relPath: string) => path.basename(relPath) != "post.md";

const listLocalFiles = (): string[] => {
  const files: string[] = [];
  const walk = (relDir: string) => {
    const absDir = path.join(publicDir, relDir);
    if (!fs.existsSync(absDir)) return;
    for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
      const relPath = path.posix.join(relDir, entry.name);
      if (entry.isDirectory()) walk(relPath);
      else if (entry.isFile() && isMediaFile(relPath)) files.push(relPath);
    }
  };
  for (const dir of syncedDirs) walk(dir);
  return files;
};

const md5 = (absPath: string) =>
  new Bun.CryptoHasher("md5").update(fs.readFileSync(absPath)).digest("hex");

const listRemoteETags = async (client: S3Client): Promise<Map<string, string>> => {
  const etags = new Map<string, string>();
  for (const prefix of syncedDirs) {
    let continuationToken: string | undefined;
    do {
      const page = await client.list({ prefix: `${prefix}/`, continuationToken, maxKeys: 1000 });
      for (const obj of page.contents ?? [])
        if (obj.eTag) etags.set(obj.key, obj.eTag.replaceAll('"', ""));
      continuationToken = page.isTruncated ? page.nextContinuationToken : undefined;
    } while (continuationToken);
  }
  return etags;
};

// Deleting local files is only safe inside a throwaway build container.
const assertSafeToStrip = () => {
  const onVercel = process.env.VERCEL == "1" && process.cwd().startsWith("/vercel/");
  if (onVercel || process.env.ALLOW_STRIP_OUTSIDE_VERCEL == "1") return;
  throw new Error(
    "--strip deletes media from public/ and only runs on Vercel build machines " +
      "(set ALLOW_STRIP_OUTSIDE_VERCEL=1 to override in a disposable copy)",
  );
};

async function main() {
  if (!endpoint || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
    if (assetBaseUrl)
      throw new Error(
        "NEXT_PUBLIC_ASSET_BASE_URL is set but R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, " +
          "R2_SECRET_ACCESS_KEY or R2_BUCKET is missing, so pages would link to media that " +
          "was never uploaded",
      );
    console.log("R2 not configured, skipping asset sync (media is served from public/)");
    return;
  }
  if (strip) assertSafeToStrip();

  const client = new S3Client({
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
    bucket: R2_BUCKET,
    endpoint,
  });
  const signer = new AwsClient({
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
    service: "s3",
    region: "auto",
  });

  const localFiles = listLocalFiles();
  const remoteETags = await listRemoteETags(client);
  const toUpload = localFiles.filter(
    (relPath) => remoteETags.get(relPath) != md5(path.join(publicDir, relPath)),
  );

  console.log(
    `${localFiles.length} local media files, ${remoteETags.size} already in R2, ` +
      `${toUpload.length} to upload`,
  );

  if (dryRun) {
    for (const relPath of toUpload) console.log(`  would upload ${relPath}`);
    return;
  }

  const limit = pLimit(16);
  let uploaded = 0;
  await Promise.all(
    toUpload.map((relPath) =>
      limit(async () => {
        const file = Bun.file(path.join(publicDir, relPath));
        const url = `${endpoint}/${R2_BUCKET}/${relPath.split("/").map(encodeURIComponent).join("/")}`;
        const response = await signer.fetch(url, {
          method: "PUT",
          body: await file.arrayBuffer(),
          headers: {
            "Content-Type": file.type || "application/octet-stream",
            "Cache-Control": cacheControl,
          },
        });
        if (!response.ok)
          throw new Error(
            `Uploading ${relPath} failed: ${response.status} ${await response.text()}`,
          );
        uploaded++;
        if (uploaded % 100 == 0) console.log(`  uploaded ${uploaded}/${toUpload.length}`);
      }),
    ),
  );
  console.log(`Uploaded ${uploaded} files to R2 bucket ${R2_BUCKET}`);

  if (strip) {
    for (const relPath of localFiles) fs.rmSync(path.join(publicDir, relPath));
    console.log(`Removed ${localFiles.length} media files from public/ for this deployment`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
