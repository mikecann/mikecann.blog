import { afterEach, describe, expect, test, vi } from "vitest";
import {
  checkPostIsLive,
  escapeHtml,
  generateNewPostEmailHtml,
  getMailchimpDataCenter,
  getPostEmailDeploymentBlockReason,
  mailchimpFetch,
  PRODUCTION_CONVEX_CLOUD_URL,
  sanitizeMailchimpApiKey,
} from "./lib";
import { EMAIL_TEMPLATE } from "./emailTemplate";

const originalEnv = process.env;

afterEach(() => {
  vi.restoreAllMocks();
  process.env = originalEnv;
  delete process.env.MAILCHIMP_API_KEY;
});

describe("Mailchimp config helpers", () => {
  test("sanitizes accidental wrapping quotes and whitespace", () => {
    expect(sanitizeMailchimpApiKey(' "abc123-us3" \n')).toBe("abc123-us3");
    expect(sanitizeMailchimpApiKey("'abc123-us3'")).toBe("abc123-us3");
  });

  test("extracts a valid Mailchimp data center", () => {
    expect(getMailchimpDataCenter("abc123-us3")).toBe("us3");
  });

  test("rejects malformed Mailchimp data centers", () => {
    expect(() => getMailchimpDataCenter('abc123-us3"')).toThrow(
      "MAILCHIMP_API_KEY env var does not include a valid Mailchimp data center",
    );
  });

  test("handles successful Mailchimp responses with empty bodies", async () => {
    process.env.MAILCHIMP_API_KEY = "abc123-us3";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, {
        status: 204,
      }),
    );

    await expect(mailchimpFetch("/campaigns/abc/actions/send", { method: "POST" })).resolves.toBe(
      null,
    );
  });
});

describe("generateNewPostEmailHtml", () => {
  test("fills in the title and post URL everywhere", () => {
    const html = generateNewPostEmailHtml("Hello World", "hello-world");
    expect(html).not.toContain("{{POST_TITLE}}");
    expect(html).not.toContain("{{POST_URL}}");
    expect(html).toContain(">Hello World</a>");
    expect(html.split('href="https://mikecann.blog/posts/hello-world"')).toHaveLength(4);
  });

  test.each(["$&", "$1", "$$", "$'", "$`", "Costs $5 & up"])(
    "inserts %j in a title literally",
    (title) => {
      const html = generateNewPostEmailHtml(title, "slug");
      expect(html).toContain(`>${escapeHtml(title)}</a>`);
      // The template around the title is untouched
      expect(html.length).toBe(
        EMAIL_TEMPLATE.length -
          "{{POST_TITLE}}".length +
          escapeHtml(title).length +
          3 * ('"https://mikecann.blog/posts/slug"'.length - '"{{POST_URL}}"'.length),
      );
    },
  );

  test("HTML-escapes the title", () => {
    const html = generateNewPostEmailHtml(`<script>alert("hi")</script> & 'you'`, "slug");
    expect(html).toContain(
      ">&lt;script&gt;alert(&quot;hi&quot;)&lt;/script&gt; &amp; &#39;you&#39;</a>",
    );
    expect(html).not.toContain("<script>alert");
  });

  test("neutralises Mailchimp merge tags in the title", () => {
    const html = generateNewPostEmailHtml("Hi *|FNAME|*", "slug");
    expect(html).toContain(">Hi *&#124;FNAME&#124;*</a>");
  });

  test("URL-encodes odd slugs", () => {
    const html = generateNewPostEmailHtml("t", 'a"b c');
    expect(html).toContain('href="https://mikecann.blog/posts/a%22b%20c"');
  });
});

describe("getPostEmailDeploymentBlockReason", () => {
  test("allows only the production deployment by default", () => {
    process.env = { ...originalEnv, CONVEX_CLOUD_URL: PRODUCTION_CONVEX_CLOUD_URL };
    expect(getPostEmailDeploymentBlockReason()).toBeNull();

    process.env.CONVEX_CLOUD_URL = "https://wooden-warbler-780.convex.cloud";
    expect(getPostEmailDeploymentBlockReason()).toContain("is not production");

    delete process.env.CONVEX_CLOUD_URL;
    expect(getPostEmailDeploymentBlockReason()).toContain("unknown CONVEX_CLOUD_URL");
  });

  test("can be overridden explicitly", () => {
    process.env = {
      ...originalEnv,
      CONVEX_CLOUD_URL: "https://wooden-warbler-780.convex.cloud",
      MAILCHIMP_ALLOW_NON_PRODUCTION_SEND: "true",
    };
    expect(getPostEmailDeploymentBlockReason()).toBeNull();
  });
});

describe("checkPostIsLive", () => {
  test("is live only on HTTP 200", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    fetchMock.mockResolvedValueOnce(new Response("ok", { status: 200 }));
    expect(await checkPostIsLive("my-post")).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith("https://mikecann.blog/posts/my-post", {
      method: "GET",
      redirect: "follow",
    });

    fetchMock.mockResolvedValueOnce(new Response("nope", { status: 404 }));
    expect(await checkPostIsLive("my-post")).toEqual({
      ok: false,
      detail: "https://mikecann.blog/posts/my-post returned HTTP 404",
    });

    fetchMock.mockRejectedValueOnce(new Error("ECONNRESET"));
    expect(await checkPostIsLive("my-post")).toEqual({
      ok: false,
      detail: "https://mikecann.blog/posts/my-post could not be fetched: ECONNRESET",
    });
  });
});
