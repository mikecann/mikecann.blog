import { v } from "convex/values";
import { mikebot } from "../lib";
import { convex } from "../../builder";

export const streamStory = convex
  .action()
  .input({ promptMessageId: v.string(), threadId: v.string() })
  .handler(async (ctx, { promptMessageId, threadId }) => {
    // Generate the embeddings for the message from the user, this shouldnt be
    // needed in the future
    await mikebot.generateAndSaveEmbeddings(ctx, {
      messageIds: [promptMessageId],
    });

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
  })
  .internal();
