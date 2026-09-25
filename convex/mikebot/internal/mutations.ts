import { v } from "convex/values";
import { convex } from "../../builder";
import { clearPendingReplies, findDailyUsage, getUtcDayKey } from "../guards";

/** Adds one LLM step's token usage to today's (UTC) total for the daily budget. */
export const recordTokenUsage = convex
  .mutation()
  .input({
    inputTokens: v.number(),
    outputTokens: v.number(),
    totalTokens: v.number(),
  })
  .returns(v.null())
  .handler(async (ctx, args) => {
    const now = Date.now();
    const day = getUtcDayKey(now);
    const usage = await findDailyUsage(ctx, day);

    if (usage) {
      await ctx.db.patch("mikebotDailyUsage", usage._id, {
        inputTokens: usage.inputTokens + args.inputTokens,
        outputTokens: usage.outputTokens + args.outputTokens,
        totalTokens: usage.totalTokens + args.totalTokens,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("mikebotDailyUsage", { day, ...args, updatedAt: now });
    }
    return null;
  })
  .internal();

/** Marks the reply to `promptMessageId` as finished so the thread accepts new messages. */
export const clearPendingReply = convex
  .mutation()
  .input({
    threadId: v.string(),
    promptMessageId: v.string(),
  })
  .returns(v.null())
  .handler(async (ctx, { threadId, promptMessageId }) => {
    await clearPendingReplies(ctx, threadId, promptMessageId);
    return null;
  })
  .internal();
