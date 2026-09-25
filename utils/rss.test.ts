import { describe, expect, it } from "vitest";
import { getExcerptMarkdown, postExcerptToHtml, toAbsoluteUrl } from "./rss";

describe("getExcerptMarkdown", () => {
  it("uses everything before the more marker", () => {
    expect(getExcerptMarkdown("Intro\n\n<!-- more -->\n\nRest")).toBe("Intro\n\n");
  });

  it("keeps whole blocks up to about 500 characters when there is no marker", () => {
    const first = "a".repeat(300);
    const second = "b".repeat(300);
    const third = "c".repeat(300);
    expect(getExcerptMarkdown(`${first}\n\n${second}\n\n${third}`)).toBe(`${first}\n\n${second}`);
  });

  it("returns short posts without a marker in full", () => {
    expect(getExcerptMarkdown("Just a short post")).toBe("Just a short post");
  });
});

describe("toAbsoluteUrl", () => {
  it("resolves post-relative, root-relative and absolute URLs", () => {
    expect(toAbsoluteUrl("my-post", "./header.jpg")).toBe(
      "https://mikecann.blog/posts/my-post/header.jpg",
    );
    expect(toAbsoluteUrl("my-post", "/posts/other")).toBe("https://mikecann.blog/posts/other");
    expect(toAbsoluteUrl("my-post", "../wp-content/a.png")).toBe(
      "https://mikecann.blog/wp-content/a.png",
    );
    expect(toAbsoluteUrl("my-post", "https://example.com/x")).toBe("https://example.com/x");
  });
});

describe("postExcerptToHtml", () => {
  it("renders markdown to HTML with absolute URLs", () => {
    const html = postExcerptToHtml(
      "my-post",
      `Hello **world** [link](/about)\n\n![](./a.png)\n\n<img src="./b.png" alt="b">\n\n<!-- more -->\n\nNot included`,
    );
    expect(html).toContain("<strong>world</strong>");
    expect(html).toContain('href="https://mikecann.blog/about"');
    expect(html).toContain('src="https://mikecann.blog/posts/my-post/a.png"');
    expect(html).toContain('<img src="https://mikecann.blog/posts/my-post/b.png" alt="b">');
    expect(html).not.toContain("Not included");
  });
});
