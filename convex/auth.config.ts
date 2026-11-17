import type { AuthConfig } from "convex/server";

// Convex Auth v2's sessions (admin/auth.ts), signed by this deployment and checked against the
// keys its auth component serves.
export default {
  providers: [
    {
      type: "customJwt",
      applicationID: "convex",
      issuer: process.env.CONVEX_SITE_URL!,
      jwks: `${process.env.CONVEX_SITE_URL}/auth/.well-known/jwks.json`,
      algorithm: "RS256",
    },
  ],
} satisfies AuthConfig;
