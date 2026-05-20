import { describe, expect, test } from "vitest";
import { getMailchimpDataCenter, sanitizeMailchimpApiKey } from "./lib";

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
});
