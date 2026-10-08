import { describe, expect, test } from "vitest";
import { planAssetSync } from "./assetSync";

const localMd5s: Record<string, string> = {
  "posts/new-post/header.webp": "new",
  "posts/old-post/header.webp": "same",
  "posts/old-post/diagram.png": "edited",
  "thumbs/old-post.webp": "regenerated",
};

const remoteETags = new Map([
  ["posts/old-post/header.webp", "same"],
  ["posts/old-post/diagram.png", "original"],
  ["thumbs/old-post.webp", "original"],
]);

const plan = (overwrite: boolean) =>
  planAssetSync({
    localFiles: Object.keys(localMd5s),
    remoteETags,
    localMd5: (relPath) => localMd5s[relPath],
    overwrite,
  });

describe("planAssetSync", () => {
  test("production uploads missing and changed files, but not unchanged ones", () => {
    expect(plan(true)).toEqual({
      upload: ["posts/new-post/header.webp", "posts/old-post/diagram.png", "thumbs/old-post.webp"],
      skippedChanged: [],
    });
  });

  test("previews only upload missing files and never replace what production serves", () => {
    expect(plan(false)).toEqual({
      upload: ["posts/new-post/header.webp"],
      skippedChanged: ["posts/old-post/diagram.png", "thumbs/old-post.webp"],
    });
  });

  test("only hashes files that are already in the bucket", () => {
    const hashed: string[] = [];
    planAssetSync({
      localFiles: Object.keys(localMd5s),
      remoteETags,
      localMd5: (relPath) => {
        hashed.push(relPath);
        return localMd5s[relPath];
      },
      overwrite: false,
    });
    expect(hashed).not.toContain("posts/new-post/header.webp");
  });
});
