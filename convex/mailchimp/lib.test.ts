import { afterEach, describe, expect, test, vi } from "vitest";
import { getMailchimpDataCenter, mailchimpFetch, sanitizeMailchimpApiKey } from "./lib";

afterEach(() => {
  vi.restoreAllMocks();
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
    expect(() => getMailchimpDataCenter("abc123-us3\"")).toThrow(
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
