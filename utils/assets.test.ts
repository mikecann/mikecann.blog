import { describe, expect, it } from "vitest";
import { absoluteAssetUrl, assetUrl, isAssetPath } from "./assets";

const base = "https://assets.mikecann.blog";

describe("assetUrl", () => {
  it("returns paths unchanged when no asset base url is configured", () => {
    expect(assetUrl("/posts/my-post/header.webp", "")).toBe("/posts/my-post/header.webp");
    expect(assetUrl("/thumbs/my-post.webp", "")).toBe("/thumbs/my-post.webp");
  });

  it("prefixes post media and thumbnails with the asset base url", () => {
    expect(assetUrl("/posts/my-post/header.webp", base)).toBe(
      "https://assets.mikecann.blog/posts/my-post/header.webp",
    );
    expect(assetUrl("/posts/my-post/nested/clip.MP4", base)).toBe(
      "https://assets.mikecann.blog/posts/my-post/nested/clip.MP4",
    );
    expect(assetUrl("/thumbs/my-post.webp", base)).toBe(
      "https://assets.mikecann.blog/thumbs/my-post.webp",
    );
  });

  it("ignores a trailing slash on the base url", () => {
    expect(assetUrl("/thumbs/my-post.webp", `${base}/`)).toBe(
      "https://assets.mikecann.blog/thumbs/my-post.webp",
    );
  });

  it("leaves everything that isn't post media alone", () => {
    for (const path of [
      "/posts/my-post",
      "/posts/my-post/",
      "/posts/my-post/post.md",
      "/images/me.jpg",
      "/wp-content/uploads/2011/11/tm.png",
      "/flash/game.swf",
      "https://example.com/posts/my-post/header.webp",
      "//example.com/posts/my-post/header.webp",
      "./header.webp",
      "#heading",
    ])
      expect(assetUrl(path, base)).toBe(path);
  });

  it("keeps query strings and hashes", () => {
    expect(assetUrl("/posts/my-post/doc.pdf#page=2", base)).toBe(
      `${base}/posts/my-post/doc.pdf#page=2`,
    );
  });
});

describe("isAssetPath", () => {
  it("only matches files inside a post folder with a media extension", () => {
    expect(isAssetPath("/posts/a/b.png")).toBe(true);
    expect(isAssetPath("/posts/a/b.zip")).toBe(true);
    expect(isAssetPath("/posts/a/b.html")).toBe(false);
    expect(isAssetPath("/posts/a.png")).toBe(false);
  });
});

describe("absoluteAssetUrl", () => {
  it("uses the site url when no asset base url is configured", () => {
    expect(absoluteAssetUrl("/posts/my-post/header.webp", "")).toBe(
      "https://mikecann.blog/posts/my-post/header.webp",
    );
    expect(absoluteAssetUrl("/images/me.jpg", base)).toBe("https://mikecann.blog/images/me.jpg");
  });

  it("uses the asset base url when configured", () => {
    expect(absoluteAssetUrl("/posts/my-post/header.webp", base)).toBe(
      "https://assets.mikecann.blog/posts/my-post/header.webp",
    );
  });
});
