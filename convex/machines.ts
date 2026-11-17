import {
  type AppCtx,
  defineMachines,
  deliveryArgs,
  type InternalCtx,
  type Machines,
} from "@convex-dev/state-machines";
import { v } from "convex/values";
import { components, internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { internalMutation, internalQuery, mutation, type MutationCtx } from "./_generated/server";
import schema from "./schema";
// Import a machine from here rather than its own module: sending needs the catalog, and importing
// this loads it
import { postEmail } from "./mailchimp/machine";

// Every state machine in the blog, checked together when the app loads (@convex-dev/state-machines,
// vendored in vendor/). The rest of the app stays on fluent-convex (builder.ts). Every event here is
// the server's, so the functions that send them use this catalog's internalMutation, which carries
// the library's internal brand. The diagrams are in docs/state-machines.md, and the live version is
// the admin Machines page (/admin/machines).
export const machines: Machines<typeof schema> = defineMachines(schema, [postEmail], {
  mutation,
  internalMutation,
  internalQuery,
  deliver: internal.machines.deliver,
  component: components.stateMachines,
});

export { postEmail };

/** A handler's ctx in machines.internalMutation, for the helpers it calls. */
export type InternalMachineCtx = AppCtx<DataModel> &
  InternalCtx & {
    runMutation: MutationCtx["runMutation"];
    runQuery: MutationCtx["runQuery"];
  };

// Timers fire through this
export const deliver = machines.internalMutation({
  args: deliveryArgs,
  handler: machines.deliver,
});

// For an operator: timers whose step threw, which stay pending until rearmed.
//   npx convex run --prod machines:failedTimers
export const failedTimers = machines.internalQuery({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => await machines.failedTimers(ctx, args),
});

// Once the bug is fixed: npx convex run --prod machines:rearmTimer '{"machine", "id", "event"}'
export const rearmTimer = machines.internalMutation({
  args: { machine: v.string(), id: v.string(), event: v.string() },
  handler: async (ctx, args) => await machines.rearmTimer(ctx, args),
});

/**
 * A step the server asked for and can't do without: a refusal (a guard, or a state that doesn't
 * take the event) throws its reasons, as the mutation's error.
 */
export function throwIfRefused<Result extends { status: string }>(
  result: Result | { status: "rejected"; reasons: string[] },
): Extract<Result, { status: "done" }> {
  if (result.status !== "done")
    throw new Error((result as { reasons: string[] }).reasons.join(" "));
  return result as Extract<Result, { status: "done" }>;
}
