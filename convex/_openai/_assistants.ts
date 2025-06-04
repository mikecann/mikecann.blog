// import { v } from "convex/values";
// import { internalAction, internalMutation } from "../_generated/server";
// import OpenAI from "openai";
// import { ensure } from "../../essentials/misc/ensure";
// import { api, internal } from "../_generated/api";
// import { Signal } from "../../essentials/Signal";
// import { Annotation } from "../schema";
// import { findKnownPageIdFromFileId } from "./files";
// import { wait } from "../../essentials/misc/misc";
// import { updateThreadTokensUsed } from "../threads";

// // Cache for file-id to file-name mappings
// const fileIdToNameCache = new Map<string, string>();

// export const addUserMessageAndRequestAnswer = internalAction({
//   args: {
//     userMessageText: v.string(),
//     userId: v.id("users"),
//     assistantMessageId: v.id("messages"),
//     threadId: v.id("threads"),
//     currentUrl: v.string(),
//   },
//   handler: async (ctx, args) => {
//     // Initialize OpenAI client
//     const openai = new OpenAI({
//       apiKey: ensure(
//         process.env.OPEN_AI_API_KEY,
//         `Missing env OPEN_AI_API_KEY, have you added it to the Convex environment?`
//       ),
//     });

//     const assistantId = ensure(
//       process.env.OPENAI_MIKEBOT_ASSISTANT_ID,
//       `Missing env OPENAI_MIKEBOT_ASSISTANT_ID, have you added it to the Convex environment?`
//     );

//     // Get the thread
//     const thread = await ctx.runQuery(api.threads.getThreadForUser, {
//       threadId: args.threadId,
//       userId: args.userId,
//     });

//     // If the openAI thread id is not set, we need to create a new thread
//     if (!thread.openAIThreadId) {
//       const openAIThreadId = await openai.beta.threads.create();
//       await ctx.runMutation(internal.threads.setOpenAIThreadId, {
//         threadId: thread._id,
//         openAIThreadId: openAIThreadId.id,
//       });
//       thread.openAIThreadId = openAIThreadId.id;
//     }

//     // Lets insert the user's message into the thread
//     const userMessage = await openai.beta.threads.messages.create(thread.openAIThreadId, {
//       role: "user",
//       content: args.userMessageText,
//     });

//     // And now update the message with the openai id
//     await ctx.runMutation(internal.messages.setOpenAIMessageId, {
//       messageId: args.assistantMessageId,
//       openAIMessageId: userMessage.id,
//     });

//     let updateTimeout: NodeJS.Timeout | null = null;
//     let latestSnapshot: OpenAI.Beta.Threads.Messages.Text | null = null;
//     const timeoutTime = 250;

//     const updateMessage = async (snapshot: OpenAI.Beta.Threads.Messages.Text) => {
//       latestSnapshot = snapshot;
//       if (updateTimeout) return;

//       updateTimeout = setTimeout(async () => {
//         if (!latestSnapshot) return;
//         try {
//           await ctx.runMutation(internal.messages.updateMessageTextFromAssistant, {
//             messageId: args.assistantMessageId,
//             text: latestSnapshot.value ?? "",
//             annotations: await convertOpenAIAnnotationsToSchemaAnnotations(
//               latestSnapshot.annotations ?? [],
//               openai
//             ),
//           });
//         } catch (e) {
//           console.error(e);
//         }
//         updateTimeout = null;
//       }, 250);
//     };

//     await new Promise((resolve) => {
//       openai.beta.threads.runs
//         .stream(ensure(thread.openAIThreadId, "Missing thread.openAIThreadId"), {
//           assistant_id: assistantId,
//           additional_instructions: `\n\nThe user is currently on the url: ${args.currentUrl}. This may or may not be a post. You should lookup the contents of this using you file search ability if the user asks about it for example if they ask you to summarize it. If there are no results from the file search, respond by giving the url and saying you couldn't find any information about it.`,
//         })
//         .on("textCreated", (text) => console.log("textCreated", text))
//         .on("textDelta", async (textDelta, snapshot) => {
//           //console.log("textDelta", textDelta, snapshot);
//           await updateMessage(snapshot);
//         })
//         .on("toolCallCreated", (toolCall) => console.log("toolCallCrated", toolCall))
//         .on("toolCallDelta", (toolCallDelta, snapshot) => {
//           console.log("toolCallDelta", toolCallDelta);
//         })
//         .on("textDone", async (snapshot, x) => {
//           console.log("textDone", snapshot);
//           await updateMessage(snapshot);
//         })
//         .on("runStepDone", async (runStepDone) => {
//           console.log("runStepDone", runStepDone);
//           await ctx.runMutation(internal.threads.updateThreadTokensUsed, {
//             threadId: thread._id,
//             completionTokensUsed: runStepDone.usage?.completion_tokens ?? 0,
//             promptTokensUsed: runStepDone.usage?.prompt_tokens ?? 0,
//             totalTokensUsed: runStepDone.usage?.total_tokens ?? 0,
//           });
//         })
//         .on("end", async () => {
//           await wait(500);
//           await ctx.runMutation(internal.messages.updateMessageStatus, {
//             messageId: args.assistantMessageId,
//             status: {
//               kind: "finished",
//             },
//           });
//           resolve(null);
//         })
//         .on("error", async (error) => {
//           console.log("error", error);
//           await wait(500);
//           resolve(null);
//           await ctx.runMutation(internal.messages.updateMessageStatus, {
//             messageId: args.assistantMessageId,
//             status: {
//               kind: "message_completion_errored",
//               at: Date.now(),
//               error: `${error}`,
//             },
//           });
//         });
//     });
//   },
// });

// async function convertOpenAIAnnotationsToSchemaAnnotations(
//   openAIAnnotations: OpenAI.Beta.Threads.Messages.Annotation[],
//   openai: OpenAI
// ): Promise<Annotation[]> {
//   const annotations: Annotation[] = [];

//   for (const annotation of openAIAnnotations) {
//     if (annotation.type === "file_citation") {
//       const pageId = findKnownPageIdFromFileId(annotation.file_citation.file_id);
//       if (pageId) {
//         annotations.push({
//           kind: "page_citation",
//           startIndex: annotation.start_index,
//           endIndex: annotation.end_index,
//           openAIFileId: annotation.file_citation.file_id,
//           pageId,
//           text: annotation.text,
//         });
//         continue;
//       }

//       let fileName = fileIdToNameCache.get(annotation.file_citation.file_id);
//       if (!fileName) {
//         try {
//           const file = await openai.files.retrieve(annotation.file_citation.file_id);
//           fileName = file.filename;
//           fileIdToNameCache.set(annotation.file_citation.file_id, fileName);
//         } catch (error) {
//           console.error("Error retrieving file:", error);
//           continue;
//         }
//       }

//       annotations.push({
//         kind: "post_citation",
//         startIndex: annotation.start_index,
//         endIndex: annotation.end_index,
//         openAIFileId: annotation.file_citation.file_id,
//         postId: fileName.replaceAll(".md", ""),
//         text: annotation.text,
//       });
//     }
//   }

//   return annotations;
// }
