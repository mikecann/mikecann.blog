// import { v } from "convex/values";
// import { mutationWithUser } from "./functions";
// import { _getThreadForUser, _scheduleThreadUpdatedNotification } from "./threads";
// import { internalMutation, query } from "./_generated/server";
// import { internal } from "./_generated/api";
// import { annotationSchema, messageStatusSchema } from "./schema";

// export const listMessagesForUserThread = query({
//   args: {
//     userId: v.id("users"),
//     threadId: v.id("threads"),
//   },
//   handler: async (ctx, args) => {
//     const thread = await _getThreadForUser(ctx.db, {
//       userId: args.userId,
//       threadId: args.threadId,
//     });
//     return await ctx.db
//       .query("messages")
//       .withIndex("by_threadId", (q) => q.eq("threadId", thread._id))
//       .collect();
//   },
// });

// export const sendMessageToThreadFromUser = mutationWithUser({
//   args: {
//     message: v.string(),
//     threadId: v.id("threads"),
//     currentUrl: v.string(),
//   },
//   handler: async (ctx, args) => {
//     if (args.message.length === 0) return;

//     // We first should check if there is an existing message that is not finished
//     // and if so we should not proceed

//     const thread = await _getThreadForUser(ctx.db, {
//       userId: ctx.user._id,
//       threadId: args.threadId,
//     });

//     // Insert my message
//     await ctx.db.insert("messages", {
//       speaker: "user",
//       text: args.message,
//       threadId: thread._id,
//       status: { kind: "finished" },
//     });

//     // Now insert a placeholder one for the assistant
//     const itemChatMessageId = await ctx.db.insert("messages", {
//       threadId: args.threadId,
//       speaker: "assistant",
//       text: "",
//       status: { kind: "created" },
//     });

//     // Now schedule the request for the assistant
//     const scheduledApiCallTime = Date.now() + 100;
//     const scheduledFunctionId = await ctx.scheduler.runAt(
//       scheduledApiCallTime,
//       internal.openai.assistants.addUserMessageAndRequestAnswer,
//       {
//         userMessageText: args.message,
//         assistantMessageId: itemChatMessageId,
//         threadId: thread._id,
//         userId: ctx.user._id,
//         currentUrl: args.currentUrl,
//       },
//     );

//     // Update the message with the scheduled function id
//     await ctx.db.patch(itemChatMessageId, {
//       status: {
//         kind: "message_completion_requested",
//         scheduledFunctionId,
//         scheduledApiCallTime,
//         at: Date.now(),
//       },
//     });

//     // Let me know via email that someone has been chatting
//     await _scheduleThreadUpdatedNotification(ctx, { threadId: thread._id });
//   },
// });

// export const setOpenAIMessageId = internalMutation({
//   args: {
//     messageId: v.id("messages"),
//     openAIMessageId: v.string(),
//   },
//   handler: async (ctx, args) => {
//     const message = await ctx.db.get(args.messageId);
//     if (!message) throw new Error(`Message ${args.messageId} not found`);

//     if (message.openAIMessageId)
//       throw new Error(`Message ${args.messageId} already has a OpenAI message id`);

//     return ctx.db.patch(args.messageId, {
//       openAIMessageId: args.openAIMessageId,
//     });
//   },
// });

// export const updateMessageTextFromAssistant = internalMutation({
//   args: {
//     messageId: v.id("messages"),
//     text: v.string(),
//     annotations: v.array(annotationSchema),
//   },
//   handler: async (ctx, args) => {
//     const message = await ctx.db.get(args.messageId);
//     if (!message) throw new Error(`Message ${args.messageId} not found`);

//     return ctx.db.patch(args.messageId, {
//       text: args.text,
//       annotations: args.annotations,
//     });
//   },
// });

// export const updateMessageStatus = internalMutation({
//   args: {
//     messageId: v.id("messages"),
//     status: messageStatusSchema,
//   },
//   handler: async (ctx, args) => {
//     return ctx.db.patch(args.messageId, { status: args.status });
//   },
// });
