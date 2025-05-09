import { v } from "convex/values";
import { action } from "../_generated/server";
import { createMikebotAgent } from "./lib";

export const sendMessageToThreadFromUser = action({
  args: {
    message: v.string(),
    threadId: v.string(),
    userId: v.id("users"),
    currentUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const mikebot = createMikebotAgent();
    const { thread } = await mikebot.continueThread(ctx, {
      threadId: args.threadId,
      userId: args.userId,
    });
    const result = await thread.generateText({ prompt: args.message });
    return result.text;
  },
});
