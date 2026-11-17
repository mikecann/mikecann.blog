import { HOUR, RateLimiter } from "@convex-dev/rate-limiter";
import type { UserIdentity } from "convex/server";
import { components } from "../_generated/api";
import { sha256Hex } from "../mikebot/sha256";

// The blog's admin sign-in, for the admin pages (the Machines page, /admin/machines). The blog has
// no accounts: the admin is whoever holds BLOG_POST_ADMIN_TOKEN, the secret the deploy already
// uses. The page trades it, once, at POST /admin/session (http.ts) for a short-lived JWT that this
// deployment signs itself, and Convex checks that JWT on every query like any auth provider's
// (auth.config.ts), so the admin token is never sent as a query argument.

/** Who the JWT says is signed in: there's only the one admin. */
export const ADMIN_SUBJECT = "admin";
export const ADMIN_APPLICATION_ID = "mikecann-blog-admin";
const SESSION_LIFETIME_SECONDS = 60 * 60;
const KEY_ID = "admin-1";

/** The private signing key, an ES256 (P-256) JWK, from the deployment's environment. */
const ADMIN_JWT_PRIVATE_JWK_ENV_VAR = "ADMIN_JWT_PRIVATE_JWK";

export const adminRateLimiter = new RateLimiter(components.rateLimiter, {
  // Every wrong token counts too, so guessing it is hopeless, at the cost of locking the right one
  // out for a few minutes while someone tries
  adminSignIn: { kind: "token bucket", rate: 20, period: HOUR, capacity: 10 },
});

/** Whether a query's caller is the admin, signed in through this deployment's own JWT. */
export const isAdmin = (identity: UserIdentity | null) =>
  identity !== null &&
  identity.subject === ADMIN_SUBJECT &&
  identity.issuer === process.env.CONVEX_SITE_URL;

/** Compares the admin token by hash, so the time it takes doesn't give the token away. */
export const isAdminToken = (token: string) => {
  const expected = process.env.BLOG_POST_ADMIN_TOKEN;
  return !!expected && sha256Hex(token) === sha256Hex(expected);
};

type PrivateJwk = JsonWebKey & { kty: "EC"; crv: "P-256"; x: string; y: string; d: string };

const readPrivateJwk = (): PrivateJwk => {
  const raw = process.env[ADMIN_JWT_PRIVATE_JWK_ENV_VAR];
  if (!raw) throw new Error(`${ADMIN_JWT_PRIVATE_JWK_ENV_VAR} isn't set on this deployment`);
  const jwk = JSON.parse(raw) as PrivateJwk;
  if (jwk.kty !== "EC" || jwk.crv !== "P-256" || !jwk.d)
    throw new Error(`${ADMIN_JWT_PRIVATE_JWK_ENV_VAR} must be a private P-256 JWK`);
  return jwk;
};

/** The JWKS Convex checks the JWTs against: the signing key's public half. */
export const adminJwks = () => {
  const { kty, crv, x, y } = readPrivateJwk();
  return { keys: [{ kty, crv, x, y, kid: KEY_ID, alg: "ES256", use: "sig" }] };
};

const base64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
const encodeJson = (value: unknown) => base64url(new TextEncoder().encode(JSON.stringify(value)));

/** A JWT for the admin, signed with ES256, good for an hour. */
export async function signAdminJwt(now = Date.now()) {
  const issuer = process.env.CONVEX_SITE_URL;
  if (!issuer) throw new Error("CONVEX_SITE_URL isn't set");
  const key = await crypto.subtle.importKey(
    "jwk",
    readPrivateJwk(),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );
  const issuedAt = Math.floor(now / 1000);
  const expiresAt = issuedAt + SESSION_LIFETIME_SECONDS;
  const unsigned = `${encodeJson({ alg: "ES256", typ: "JWT", kid: KEY_ID })}.${encodeJson({
    iss: issuer,
    sub: ADMIN_SUBJECT,
    aud: ADMIN_APPLICATION_ID,
    iat: issuedAt,
    exp: expiresAt,
  })}`;
  // WebCrypto's ECDSA signature is r and s back to back, which is what a JWT wants
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    new TextEncoder().encode(unsigned),
  );
  return {
    token: `${unsigned}.${base64url(new Uint8Array(signature))}`,
    expiresAt: expiresAt * 1000,
  };
}
