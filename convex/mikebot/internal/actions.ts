import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { mikebot } from "../lib";
import { convex } from "../../builder";

export const streamStory = convex
  .action()
  .input({ promptMessageId: v.string(), threadId: v.string() })
  .returns(v.null())
  .handler(async (ctx, { promptMessageId, threadId }) => {
    try {
      // Start streaming the reponse by line into the database
      const result = await mikebot.streamText(
        ctx,
        { threadId },
        { promptMessageId },
        {
          saveStreamDeltas: {
            chunking: "word",
            throttleMs: 250,
          },
        },
      );

      await result.consumeStream();
    } finally {
      // Let the visitor send their next message, even if this reply failed.
      await ctx.runMutation(internal.mikebot.internal.mutations.clearPendingReply, {
        threadId,
        promptMessageId,
      });
    }
    return null;
  })
  .internal();
