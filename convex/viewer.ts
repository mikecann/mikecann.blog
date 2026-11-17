import { viewerArgs } from "@convex-dev/state-machines";
import { query } from "./_generated/server";
import { isAdmin } from "./admin/session";
import { machines } from "./machines";

// What the admin Machines page (/admin/machines) reads: every state machine as the blog runs it,
// with live counts, the rows in each state, and one row's state and history. Read-only: there's no
// `send` or `create`, so nothing here can move a campaign.
//
// Only the admin, signed in with the blog's own admin JWT (admin/session.ts), reads anything.
// Everyone else gets null from every query, which the viewer shows as off, rather than an error.
const viewer = machines.viewer({ read: async (ctx) => isAdmin(await ctx.auth.getUserIdentity()) });

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
