import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { validateUserExists, getAndValidateThread, mikebot } from "./lib";
import { internal } from "../_generated/api";

export const createThreadForUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await validateUserExists(ctx.db, { userId: args.userId });
    const thread = await mikebot.createThread(ctx, { userId: args.userId });
    return thread.threadId;
  },
});

export const sendMessageToThreadFromUser = mutation({
  args: {
    message: v.string(),
    threadId: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Make sure the user can send a message to this thread
    await getAndValidateThread(ctx, { threadId: args.threadId, userId: args.userId });

    // Push the user message into the database
    const { messageId } = await mikebot.saveMessage(ctx, {
      threadId: args.threadId,
      prompt: args.message,

      // we need to do this for now otherwise it will try to generate the embeddings
      // immediately which is a fetch in a mutation which is not allowed.
      // We instead generate the embeddings in the streamStory
      skipEmbeddings: true,
    });

    // Schedule the actual call to the LLM to stream it
    await ctx.scheduler.runAfter(0, internal.mikebot.internal.actions.streamStory, {
      threadId: args.threadId,
      promptMessageId: messageId,
    });
  },
});
