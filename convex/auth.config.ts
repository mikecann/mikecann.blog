import type { AuthConfig } from "convex/server";

// The only sign-in is the blog's admin, whose JWTs this deployment signs itself (admin/session.ts)
// and serves the public key for at /.well-known/jwks.json.
export default {
  providers: [
    {
      type: "customJwt",
      applicationID: "mikecann-blog-admin",
      issuer: process.env.CONVEX_SITE_URL!,
      jwks: `${process.env.CONVEX_SITE_URL}/.well-known/jwks.json`,
      algorithm: "ES256",
    },
  ],
} satisfies AuthConfig;
