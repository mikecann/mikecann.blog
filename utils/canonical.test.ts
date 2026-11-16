import { describe, expect, test } from "vitest";
import { canonicalUrlForPath } from "./canonical";

describe("canonicalUrlForPath", () => {
  test("drops the .html of the built file", () => {
    expect(canonicalUrlForPath("/index.html")).toBe("https://mikecann.blog");
    expect(canonicalUrlForPath("/about.html")).toBe("https://mikecann.blog/about");
    expect(canonicalUrlForPath("/posts/my-post.html")).toBe("https://mikecann.blog/posts/my-post");
  });

  test("normalises the encoding of tag paths", () => {
    const expected = "https://mikecann.blog/tags/code%20assist";
    expect(canonicalUrlForPath("/tags/code assist.html")).toBe(expected);
    expect(canonicalUrlForPath("/tags/code%20assist")).toBe(expected);
    expect(canonicalUrlForPath("/tags/code%2520assist")).toBe(expected);
  });

  test("leaves paths without .html alone", () => {
    expect(canonicalUrlForPath("/")).toBe("https://mikecann.blog");
    expect(canonicalUrlForPath("/about")).toBe("https://mikecann.blog/about");
  });
});
