import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import agentTest from "@convex-dev/agent/test";
import rateLimiterTest from "@convex-dev/rate-limiter/test";
import schema from "../schema";
import { modules } from "../test.setup";
import { HOSTED_SIGNUP_FORM_URL, sourceTag } from "./lib";

const setup = () => {
  const t = convexTest(schema, modules);
  agentTest.register(t);
  rateLimiterTest.register(t);
  return t;
};

const subscribe = async (t: ReturnType<typeof setup>, body: Record<string, unknown> | string) => {
  const response = await t.fetch("/newsletter/subscribe", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: typeof body == "string" ? body : JSON.stringify(body),
  });
  return { status: response.status, headers: response.headers, json: await response.json() };
};

const mailchimpReplies = (...replies: Array<{ status: number; body?: unknown }>) => {
  const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => {
    const reply = replies.shift() ?? { status: 200, body: {} };
    return new Response(JSON.stringify(reply.body ?? {}), { status: reply.status });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

beforeEach(() => {
  process.env.MAILCHIMP_API_KEY = "test-key-us3";
  process.env.MAILCHIMP_ALLOW_NON_PRODUCTION_SEND = "true";
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.MAILCHIMP_API_KEY;
  delete process.env.MAILCHIMP_ALLOW_NON_PRODUCTION_SEND;
});

describe("newsletter signup endpoint", () => {
  test("adds the address as a pending (double opt-in) member tagged with its source", async () => {
    const t = setup();
    const fetchMock = mailchimpReplies({ status: 200, body: { status: "pending" } });

    const { status, headers, json } = await subscribe(t, {
      email: "  Reader@Example.com ",
      source: "post-footer",
    });

    expect(status).toBe(200);
    expect(headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(json.status).toBe("confirm_email");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://us3.api.mailchimp.com/3.0/lists/3c8f7e6e85/members");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual({
      email_address: "reader@example.com",
      status: "pending",
      tags: ["blog-post-footer"],
    });
  });

  test("reports addresses that are already on the list", async () => {
    const t = setup();
    mailchimpReplies({ status: 400, body: { title: "Member Exists" } });
    const { json } = await subscribe(t, { email: "reader@example.com", source: "popup" });
    expect(json).toMatchObject({
      status: "already_subscribed",
      fallbackUrl: HOSTED_SIGNUP_FORM_URL,
    });
  });

  test("maps Mailchimp's validation and forgotten-email errors", async () => {
    const t = setup();
    mailchimpReplies(
      { status: 400, body: { title: "Invalid Resource" } },
      { status: 400, body: { title: "Forgotten Email Not Subscribed" } },
      { status: 500, body: { title: "Internal Server Error" } },
    );
    expect((await subscribe(t, { email: "a@example.com" })).json.status).toBe("invalid_email");
    expect((await subscribe(t, { email: "b@example.com" })).json).toMatchObject({
      status: "error",
      fallbackUrl: HOSTED_SIGNUP_FORM_URL,
    });
    expect((await subscribe(t, { email: "c@example.com" })).json).toMatchObject({
      status: "error",
      fallbackUrl: HOSTED_SIGNUP_FORM_URL,
    });
  });

  test("rejects malformed requests and emails without calling Mailchimp", async () => {
    const t = setup();
    const fetchMock = mailchimpReplies();
    expect((await subscribe(t, "not json")).status).toBe(400);
    expect((await subscribe(t, { email: "nope" })).json.status).toBe("invalid_email");
    expect((await subscribe(t, { email: `${"a".repeat(250)}@x.co` })).json.status).toBe(
      "invalid_email",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("quietly ignores bots that fill in the honeypot field", async () => {
    const t = setup();
    const fetchMock = mailchimpReplies();
    const { json } = await subscribe(t, { email: "bot@example.com", website: "http://spam" });
    expect(json.status).toBe("confirm_email");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("rate limits repeated signups for the same address", async () => {
    const t = setup();
    const fetchMock = mailchimpReplies();
    for (let i = 0; i < 3; i++)
      expect((await subscribe(t, { email: "Same@example.com" })).json.status).toBe("confirm_email");
    expect((await subscribe(t, { email: "same@EXAMPLE.com" })).json.status).toBe("rate_limited");
    expect(fetchMock).toHaveBeenCalledTimes(3);
    // Other addresses are unaffected
    expect((await subscribe(t, { email: "other@example.com" })).json.status).toBe("confirm_email");
  });

  test("never touches the real list from a non-production deployment", async () => {
    const t = setup();
    delete process.env.MAILCHIMP_ALLOW_NON_PRODUCTION_SEND;
    const fetchMock = mailchimpReplies();
    const { json } = await subscribe(t, { email: "reader@example.com" });
    expect(json.status).toBe("confirm_email");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("answers the CORS preflight", async () => {
    const t = setup();
    const response = await t.fetch("/newsletter/subscribe", { method: "OPTIONS" });
    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Methods")).toContain("POST");
  });

  test("source tags are sanitized", () => {
    expect(sourceTag("post-footer")).toBe("blog-post-footer");
    expect(sourceTag("<script>")).toBe("blog-script");
    expect(sourceTag("")).toBe("blog-unknown");
  });
});
