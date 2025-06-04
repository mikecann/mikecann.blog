import { customAction, customMutation, customQuery } from "convex-helpers/server/customFunctions";
import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ensureFP } from "../essentials/misc/ensure";

export const queryWithUser = customQuery(query, {
  args: {
    userId: v.id("users"),
  },
  input: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId).then(ensureFP(`User ${userId} not found`));
    return { ctx: { ...ctx, user }, args: {} };
  },
});

export const mutationWithUser = customMutation(mutation, {
  args: {
    userId: v.id("users"),
  },
  input: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId).then(ensureFP(`User ${userId} not found`));
    return { ctx: { ...ctx, user }, args: {} };
  },
});


