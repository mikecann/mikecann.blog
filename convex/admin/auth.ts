import { getAuthUserId, setupConvexAuth } from "@convex-dev/auth/server";
import { setupGoogle, vGoogleProfile } from "@convex-dev/auth/methods/google/server";
import { ConvexError, v } from "convex/values";
import { components, internal } from "../_generated/api";
import { internalMutation, type QueryCtx } from "../_generated/server";

// Signing in to the blog's admin pages (/admin/machines), with Google through Convex Auth v2.
// The blog's readers never sign in: the only accounts are its admins, the Google addresses in the
// BLOG_ADMIN_EMAILS env var (comma separated). Google has to have verified the address, and
// anyone else is turned away before an account is made.

const auth = setupConvexAuth({ component: components.auth, usersTable: "admins" });
export const { signOut, refreshSession, isAuthenticated } = auth;

// Google's sign-in comes back to the admin page on the blog itself (or a local dev server).
const allowedRedirectOrigins = [
  "https://mikecann.blog",
  "https://www.mikecann.blog",
  "https://mikecann-blog.mikeysee.workers.dev",
  "http://localhost:4321",
];

export const { startSignInWithGoogle, completeSignInWithGoogle } = setupGoogle(auth, {
  component: components.authGoogle,
  allowedRedirectOrigins,
}).attachUserCallbacks({
  createUser: internal.admin.auth.createAdmin,
  onSignIn: internal.admin.auth.onAdminSignIn,
});

const vGoogle = v.object({
  name: v.literal("google"),
  accountId: v.string(),
  profile: vGoogleProfile,
});

const adminEmails = () =>
  (process.env.BLOG_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

/** Whether Google vouches for this address and it's one of the blog's admins. */
const isAdminEmail = (email: string | undefined, emailVerified: boolean) =>
  emailVerified && !!email && adminEmails().includes(email.toLowerCase());

/** The first sign-in of an admin's Google account makes their row. Nobody else gets one. */
export const createAdmin = internalMutation({
  args: { provider: vGoogle },
  returns: v.id("admins"),
  handler: async (ctx, { provider: { profile } }) => {
    if (!isAdminEmail(profile.email, profile.emailVerified))
      throw new ConvexError("That Google account isn't one of the blog's admins.");
    return await ctx.db.insert("admins", {
      email: profile.email!,
      name: profile.name,
      picture: profile.picture,
    });
  },
});

/**
 * Later sign-ins keep the email, name and photo up to date. Convex Auth finds a returning account
 * by Google's account id, not its email, so the address saved here is the one the list is checked
 * against: a Google account whose address changed is judged by the new one.
 */
export const onAdminSignIn = internalMutation({
  args: { provider: vGoogle, userId: v.id("admins") },
  returns: v.null(),
  handler: async (ctx, { provider: { profile }, userId }) => {
    if (!isAdminEmail(profile.email, profile.emailVerified))
      throw new ConvexError("That Google account isn't one of the blog's admins.");
    await ctx.db.patch("admins", userId, {
      email: profile.email!,
      name: profile.name,
      picture: profile.picture,
    });
    return null;
  },
});

/**
 * The signed-in admin, or null. Checked against BLOG_ADMIN_EMAILS on every call, so taking an
 * address off the list locks it out at once, even with a session still open.
 */
export async function currentAdmin(ctx: QueryCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) return null;
  const adminId = ctx.db.normalizeId("admins", userId);
  const admin = adminId === null ? null : await ctx.db.get("admins", adminId);
  return admin !== null && isAdminEmail(admin.email, true) ? admin : null;
}
