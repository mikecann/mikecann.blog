import { v } from "convex/values";
import { createUserPrompt, mikebot } from "./lib";
import { internal } from "../_generated/api";
import { convex } from "../builder";
import { MIKEBOT_LIMITS } from "./config";
import {
  assertNoActivePendingReply,
  assertWithinDailyTokenBudget,
  clearPendingReplies,
  consumeRateLimit,
  findOwnedThread,
  markReplyPending,
  mikebotError,
  requireOwnedThread,
  requireUserByToken,
} from "./guards";

export const createThreadForUser = convex
  .mutation()
  .input({
    token: v.string(),
  })
  .returns(v.string())
  .handler(async (ctx, { token }) => {
    const user = await requireUserByToken(ctx, token);
    await consumeRateLimit(ctx, "createThreadPerUser", user._id);
    const { threadId } = await mikebot.createThread(ctx, { userId: user._id });
    return threadId;
  })
  .public();

export const sendMessageToThreadFromUser = convex
  .mutation()
  .input({
    token: v.string(),
    threadId: v.string(),
    message: v.string(),
    currentUrl: v.optional(v.string()),
  })
  .returns(v.null())
  .handler(async (ctx, args) => {
    const message = args.message.trim();
    if (message.length === 0)
      throw mikebotError("empty_message", "Please type a message for Mikebot first.");
    if (message.length > MIKEBOT_LIMITS.maxMessageLength)
      throw mikebotError(
        "message_too_long",
        `That message is a bit long for Mikebot. Please keep it under ${MIKEBOT_LIMITS.maxMessageLength} characters (it's ${message.length}).`,
      );

    // Make sure the user can send a message to this thread
    const user = await requireUserByToken(ctx, args.token);
    await requireOwnedThread(ctx, { threadId: args.threadId, userId: user._id });

    // Cheap checks first, then consume rate limits. If any check throws, the
    // whole mutation (including rate-limit consumption) is rolled back.
    const now = Date.now();
    await assertNoActivePendingReply(ctx, args.threadId, now);
    await assertWithinDailyTokenBudget(ctx, now);
    await consumeRateLimit(ctx, "sendMessagePerUser", user._id);
    await consumeRateLimit(ctx, "sendMessagePerUserPerDay", user._id);
    await consumeRateLimit(ctx, "sendMessageGlobal");

    // Push the user message into the database
    const { messageId } = await mikebot.saveMessage(ctx, {
      threadId: args.threadId,
      prompt: createUserPrompt({ message, currentUrl: args.currentUrl }),
    });

    await markReplyPending(ctx, { threadId: args.threadId, promptMessageId: messageId, now });

    // Schedule the actual call to the LLM to stream it
    await ctx.scheduler.runAfter(0, internal.mikebot.internal.actions.streamStory, {
      threadId: args.threadId,
      promptMessageId: messageId,
    });

    return null;
  })
  .public();

export const deleteThreadForUser = convex
  .mutation()
  .input({
    token: v.string(),
    threadId: v.string(),
  })
  .returns(v.null())
  .handler(async (ctx, { token, threadId }) => {
    const user = await requireUserByToken(ctx, token);

    // Already gone (or never theirs): nothing to do.
    const thread = await findOwnedThread(ctx, { threadId, userId: user._id });
    if (!thread) return null;

    await mikebot.deleteThreadAsync(ctx, { threadId });
    await clearPendingReplies(ctx, threadId);
    return null;
  })
  .public();
