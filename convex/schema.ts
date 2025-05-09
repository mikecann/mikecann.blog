import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const pageIdSchema = v.union(v.literal("about"));

export const annotationSchema = v.union(
  v.object({
    kind: v.literal("post_citation"),
    startIndex: v.number(),
    endIndex: v.number(),
    text: v.string(),
    openAIFileId: v.string(),
    postId: v.string(),
  }),
  v.object({
    kind: v.literal("page_citation"),
    startIndex: v.number(),
    endIndex: v.number(),
    openAIFileId: v.string(),
    text: v.string(),
    pageId: pageIdSchema,
  })
);

export type Annotation = typeof annotationSchema.type;
export type AnnotationKind = Annotation["kind"];
export type AnnotationByKind<TKind = AnnotationKind> = Extract<Annotation, { kind: TKind }>;
export type PageId = AnnotationByKind<"page_citation">["pageId"];

export const messageStatusSchema = v.union(
  v.object({ kind: v.literal("created") }),
  v.object({
    kind: v.literal("message_completion_requested"),
    at: v.number(),
    scheduledFunctionId: v.id("_scheduled_functions"),
    scheduledApiCallTime: v.number(),
  }),
  v.object({
    kind: v.literal("message_completion_errored"),
    at: v.number(),
    error: v.string(),
  }),
  v.object({ kind: v.literal("finished") })
);

export const threadSchema = v.object({
  owningUserId: v.id("users"),
  openAIThreadId: v.optional(v.string()),
  completionTokensUsed: v.number(),
  promptTokensUsed: v.number(),
  totalTokensUsed: v.number(),
  threadUpdatedNoticationFunctionId: v.optional(v.id("_scheduled_functions")),
});

export const messageSchema = v.object({
  speaker: v.union(v.literal("assistant"), v.literal("user")),
  threadId: v.id("threads"),
  openAIMessageId: v.optional(v.string()),
  text: v.string(),
  annotations: v.optional(v.array(annotationSchema)),
  status: messageStatusSchema,
});

export default defineSchema({
  users: defineTable({
    kind: v.literal("anonymous"),
  }),
  messages: defineTable(messageSchema).index("by_threadId", ["threadId"]),
  threads: defineTable(threadSchema).index("by_owningUserId", ["owningUserId"]),
});
