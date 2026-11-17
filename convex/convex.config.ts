import { defineApp } from "convex/server";
import { v } from "convex/values";
import agent from "@convex-dev/agent/convex.config";
import auth from "@convex-dev/auth/convex.config.js";
import authGoogle from "@convex-dev/auth/components/google/convex.config.js";
import rag from "@convex-dev/rag/convex.config";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";
import stateMachines from "@convex-dev/state-machines/convex.config.js";

const app = defineApp({
  env: {
    // Convex Auth's signing keys (scripts/setAuthKeys.ts makes them)
    AUTH_PRIVATE_KEY: v.string(),
    AUTH_JWKS: v.string(),
    // A Google OAuth client of the "Web application" type, for the admin pages' sign-in
    AUTH_GOOGLE_CLIENT_ID: v.string(),
    AUTH_GOOGLE_CLIENT_SECRET: v.string(),
  },
});
app.use(agent);
app.use(rag);
app.use(rateLimiter);
app.use(stateMachines);

// Convex Auth v2, only for the admin pages (admin/auth.ts): the blog's readers never sign in.
app.use(auth, {
  httpPrefix: "/auth",
  env: { AUTH_PRIVATE_KEY: app.env.AUTH_PRIVATE_KEY, AUTH_JWKS: app.env.AUTH_JWKS },
});
// Google sends people back to <site>/oauth/google/callback, the redirect URI registered on the
// OAuth client.
app.use(authGoogle, {
  httpPrefix: "/oauth/google",
  env: {
    CLIENT_ID: app.env.AUTH_GOOGLE_CLIENT_ID,
    CLIENT_SECRET: app.env.AUTH_GOOGLE_CLIENT_SECRET,
  },
});

export default app;
