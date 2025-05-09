import { v } from "convex/values";
import { query } from "../_generated/server";
import { components } from "../_generated/api";
import { _getThreadForUser } from "../threads";
import { MessageDoc } from "@convex-dev/agent";

export const findThreadForUser = query({
  args: {
    threadId: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const thread = await ctx.runQuery(components.agent.messages.getThread, {
      threadId: args.threadId,
    });

    if (!thread) return null;

    if (thread.userId !== args.userId)
      throw new Error(`Thread ${args.threadId} does not belong to user ${args.userId}`);

    return thread;
  },
});

export const listMessagesForUserThread = query({
  args: {
    userId: v.id("users"),
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    const thread = await ctx.runQuery(components.agent.messages.getThread, {
      threadId: args.threadId,
    });

    if (!thread) return null;

    if (thread.userId !== args.userId)
      throw new Error(`Thread ${args.threadId} does not belong to user ${args.userId}`);

    return await ctx.runQuery(components.agent.messages.getThreadMessages, {
      threadId: args.threadId,
      order: "asc",
      statuses: ["failed", "pending", "success"],
    });
  },
});
