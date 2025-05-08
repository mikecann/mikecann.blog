import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { validateUserExists, createMikebotAgent } from "./lib";
import { _findThreadForUser } from "../threads";

export const createThreadForUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await validateUserExists(ctx.db, { userId: args.userId });
    const mikebot = createMikebotAgent();
    const thread = await mikebot.createThread(ctx, { userId: args.userId });
    return thread.threadId;
  },
});
