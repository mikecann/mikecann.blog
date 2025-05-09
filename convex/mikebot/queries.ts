import { v } from "convex/values";
import { query } from "../_generated/server";
import { components } from "../_generated/api";
import { _getThreadForUser } from "../threads";
import { validateThreadBelongsToUser, findThread, getThread } from "./lib";

export const findThreadForUser = query({
  args: {
    threadId: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const thread = await findThread(ctx, { threadId: args.threadId });
    if (!thread) return null;
    validateThreadBelongsToUser({ thread, userId: args.userId });

    return thread;
  },
});

export const listMessagesForUserThread = query({
  args: {
    userId: v.id("users"),
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    const thread = await getThread(ctx, { threadId: args.threadId });
    validateThreadBelongsToUser({ thread, userId: args.userId });

    return await ctx.runQuery(components.agent.messages.getThreadMessages, {
      threadId: args.threadId,
      order: "asc",
      statuses: ["failed", "pending", "success"],
    });
  },
});

