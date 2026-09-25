import { describe, expect, it } from "vitest";
import { producePostMeta } from "./PostMeta";
import { getPostDescription } from "./description";
import { postNeedsFlash } from "../../utils/flash";

describe("producePostMeta", () => {
  const valid = {
    title: "A post",
    tags: ["convex"],
    coverImage: "./header.webp",
    date: "2026-09-18T00:00:00.000Z",
  };

  it("accepts valid frontmatter", () => {
    expect(producePostMeta({ ...valid, status: "draft" }, "a-post")).toEqual({
      ...valid,
      status: "draft",
    });
  });

  it("throws an error naming the post for invalid frontmatter", () => {
    expect(() => producePostMeta({ ...valid, date: "not a date" }, "a-post")).toThrow(
      /a-post[\s\S]*date/,
    );
    expect(() => producePostMeta({ ...valid, tags: "convex" }, "a-post")).toThrow(/tags/);
    expect(() => producePostMeta({ ...valid, status: "live" }, "a-post")).toThrow(/status/);
    expect(() => producePostMeta({ tags: [] }, "a-post")).toThrow(/title/);
  });
});

describe("getPostDescription", () => {
  it("strips markdown, html, images and code", () => {
    const markdown = [
      "![cover](./header.webp)",
      '<iframe src="https://youtube.com/embed/x"></iframe>',
      "",
      "# Hello **world**",
      "",
      "This is [a link](https://example.com) and `code`.",
      "",
      "```ts",
      "const x = 1;",
      "```",
    ].join("\n");
    expect(getPostDescription(markdown)).toBe("Hello world This is a link and code.");
  });

  it("truncates long text on a word boundary", () => {
    const description = getPostDescription("word ".repeat(100));
    expect(description.length).toBeLessThanOrEqual(160);
    expect(description.endsWith("word…")).toBe(true);
  });
});

describe("postNeedsFlash", () => {
  it("detects swf embeds and flash links", () => {
    expect(postNeedsFlash("p", '<embed src="/wp-content/uploads/game.swf">')).toBe(true);
    expect(postNeedsFlash("p", "[play](/flash/game/index.html)")).toBe(true);
    expect(postNeedsFlash("p", '<a href="/projects/thing/index.html">play</a>')).toBe(true);
    expect(postNeedsFlash("p", "[site](https://example.com/flash/index.html)")).toBe(false);
    expect(postNeedsFlash("p", "No flash here, [a page](/posts/other)")).toBe(false);
  });
});
