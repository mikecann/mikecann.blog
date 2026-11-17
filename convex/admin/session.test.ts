import { convexTest } from "convex-test";
import { register as registerRateLimiter } from "@convex-dev/rate-limiter/test";
import { register } from "@convex-dev/state-machines/test";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { modules } from "../test.setup";
import { ADMIN_SUBJECT, isAdmin } from "./session";

vi.mock("@convex-dev/ai-sdk-provider", () => ({
  convexGateway: Object.assign(() => ({}), {
    embeddingModel: () => ({ modelId: "test-embedding", provider: "test" }),
  }),
}));

const SITE = "https://groovy-lapwing-575.convex.site";
const token = "test-admin-token";
const originalEnv = process.env;

const setup = () => {
  const t = convexTest(schema, modules);
  register(t);
  registerRateLimiter(t);
  return t;
};

const decode = (part: string) => JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/")));

beforeEach(async () => {
  const pair = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, [
    "sign",
    "verify",
  ]);
  process.env = {
    ...originalEnv,
    BLOG_POST_ADMIN_TOKEN: token,
    CONVEX_SITE_URL: SITE,
    ADMIN_JWT_PRIVATE_JWK: JSON.stringify(await crypto.subtle.exportKey("jwk", pair.privateKey)),
  };
});

afterEach(() => {
  process.env = originalEnv;
});

const signIn = (t: ReturnType<typeof setup>, withToken: string, origin = "https://mikecann.blog") =>
  t.fetch("/admin/session", {
    method: "POST",
    headers: { "Content-Type": "text/plain", Origin: origin },
    body: JSON.stringify({ token: withToken }),
  });

describe("the admin sign-in", () => {
  test("trades the admin token for a JWT that the published key verifies", async () => {
    const t = setup();
    const response = await signIn(t, token);
    expect(response.status).toBe(200);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://mikecann.blog");
    const { token: jwt, expiresAt } = await response.json();

    const [header, payload, signature] = jwt.split(".");
    expect(decode(header)).toEqual({ alg: "ES256", typ: "JWT", kid: "admin-1" });
    const claims = decode(payload);
    expect(claims).toMatchObject({ iss: SITE, sub: ADMIN_SUBJECT, aud: "mikecann-blog-admin" });
    expect(claims.exp * 1000).toBe(expiresAt);
    expect(claims.exp - claims.iat).toBe(3600);

    const jwks = await (await t.fetch("/.well-known/jwks.json")).json();
    expect(jwks.keys).toHaveLength(1);
    expect(jwks.keys[0]).not.toHaveProperty("d");
    const publicKey = await crypto.subtle.importKey(
      "jwk",
      jwks.keys[0],
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["verify"],
    );
    const bytes = Uint8Array.from(atob(signature.replace(/-/g, "+").replace(/_/g, "/")), (c) =>
      c.charCodeAt(0),
    );
    expect(
      await crypto.subtle.verify(
        { name: "ECDSA", hash: "SHA-256" },
        publicKey,
        bytes,
        new TextEncoder().encode(`${header}.${payload}`),
      ),
    ).toBe(true);
  });

  test("refuses a wrong token, and doesn't let another site's page read the answer", async () => {
    const t = setup();
    const wrong = await signIn(t, "guess");
    expect(wrong.status).toBe(401);

    const elsewhere = await signIn(t, token, "https://evil.example");
    expect(elsewhere.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });

  test("stops answering after a run of tries", async () => {
    const t = setup();
    const statuses = [];
    for (let i = 0; i < 12; i++) statuses.push((await signIn(t, "guess")).status);
    expect(statuses.slice(0, 10).every((s) => s === 401)).toBe(true);
    expect(statuses.at(-1)).toBe(429);
  });

  test("only this deployment's admin JWT counts as the admin", () => {
    expect(isAdmin({ subject: ADMIN_SUBJECT, issuer: SITE, tokenIdentifier: "x" })).toBe(true);
    expect(isAdmin({ subject: ADMIN_SUBJECT, issuer: "https://other", tokenIdentifier: "x" })).toBe(
      false,
    );
    expect(isAdmin({ subject: "someone", issuer: SITE, tokenIdentifier: "x" })).toBe(false);
    expect(isAdmin(null)).toBe(false);
  });
});

describe("the Machines page's queries", () => {
  test("answer the admin, and nobody else", async () => {
    const t = setup();
    expect(await t.query(api.viewer.overview, {})).toBeNull();
    expect(
      await t.withIdentity({ subject: "someone", issuer: SITE }).query(api.viewer.overview, {}),
    ).toBeNull();

    const overview = await t
      .withIdentity({ subject: ADMIN_SUBJECT, issuer: SITE })
      .query(api.viewer.overview, {});
    expect(overview).not.toBeNull();
    expect(JSON.stringify(overview)).toContain("postEmail");
  });
});
