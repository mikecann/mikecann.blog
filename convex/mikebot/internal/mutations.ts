import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { hoursInMs } from "../../../essentials/misc/time";
import { convex } from "../../builder";

export const scheduleThreadUpdatedNotification = convex
  .mutation()
  .input({
    threadId: v.string(),
  })
  .handler(async (ctx, args) => {
    const notification = await ctx.db
      .query("pendingThreadUpdateNotifications")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .first();

    if (notification) await ctx.scheduler.cancel(notification.scheduledFunctionId);

    await ctx.db.insert("pendingThreadUpdateNotifications", {
      threadId: args.threadId,
      scheduledFunctionId: await ctx.scheduler.runAfter(
        hoursInMs(3),
        internal.mikebot.internal.actions.sendThreadUpdatedNotification,
        { threadId: args.threadId },
      ),
    });
  })
  .internal();

export const deletePendingThreadUpdateNotification = convex
  .mutation()
  .input({
    threadId: v.string(),
  })
  .handler(async (ctx, args) => {
    const notification = await ctx.db
      .query("pendingThreadUpdateNotifications")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .first();

    if (!notification) return;

    await Promise.all([
      ctx.scheduler.cancel(notification.scheduledFunctionId),
      ctx.db.delete(notification._id),
    ]);
  })
  .internal();
