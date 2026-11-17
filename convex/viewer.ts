import { viewerArgs } from "@convex-dev/state-machines";
import { v } from "convex/values";
import { query, type QueryCtx } from "./_generated/server";
import { currentAdmin } from "./admin/auth";
import { machines } from "./machines";

// What the admin Machines page (/admin/machines) reads: every state machine as the blog runs it,
// with live counts, the rows in each state, and one row's state and history. Read-only: there's no
// `send` or `create`, so nothing here can move a campaign.
//
// Only an admin, signed in with Google (admin/auth.ts), reads anything. Everyone else gets null
// from every query, which the viewer shows as off, rather than an error.
const viewer = machines.viewer({
  read: async (ctx) => (await currentAdmin(ctx as QueryCtx)) !== null,
});

/** The signed-in admin's email, name and photo, for the page's header, or null. */
export const me = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({ email: v.string(), name: v.optional(v.string()), picture: v.optional(v.string()) }),
  ),
  handler: async (ctx) => {
    const admin = await currentAdmin(ctx);
    return admin && { email: admin.email, name: admin.name, picture: admin.picture };
  },
});

export const overview = query({
  args: viewerArgs.overview,
  handler: (ctx) => viewer.overview(ctx),
});
export const counts = query({
  args: viewerArgs.counts,
  handler: (ctx, args) => viewer.counts(ctx, args),
});
export const rows = query({
  args: viewerArgs.rows,
  handler: (ctx, args) => viewer.rows(ctx, args),
});
export const row = query({
  args: viewerArgs.row,
  handler: (ctx, args) => viewer.row(ctx, args),
});
