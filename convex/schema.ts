import { vEntryId } from "@convex-dev/rag";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const blogPostSchema = v.object({
  slug: v.string(),
  title: v.string(),
  hash: v.string(),
  ragEntryId: vEntryId,
});

export const postEmailCampaignStatusSchema = v.union(
  v.literal("queued"),
  v.literal("creating_campaign"),
  v.literal("content_set"),
  v.literal("sending"),
  v.literal("sent"),
  v.literal("failed"),
  // Never attempted, deliberately (e.g. the per-upload-run cap was hit or
  // MAILCHIMP_API_KEY is missing). Can be sent with retryFailedPostEmailCampaign.
  v.literal("skipped"),
);

export const postEmailCampaignSchema = v.object({
  postId: v.id("blogPosts"),
  slug: v.string(),
  title: v.string(),
  status: postEmailCampaignStatusSchema,
  attempts: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
  scheduledFunctionId: v.optional(v.id("_scheduled_functions")),
  mailchimpCampaignId: v.optional(v.string()),
  error: v.optional(v.string()),
  sentAt: v.optional(v.number()),
  /** How many times the post URL has been checked and wasn't live yet. */
  liveCheckAttempts: v.optional(v.number()),
  /** Set by an admin retry to send without checking the post URL first. */
  skipLiveCheck: v.optional(v.boolean()),
  /** The uploadPostsToConvex run that created this campaign (for the per-run cap). */
  uploadRunId: v.optional(v.string()),
});

/** Validators for whole documents (with system fields), for `.returns()`. */
export const blogPostDocSchema = v.object({
  _id: v.id("blogPosts"),
  _creationTime: v.number(),
  ...blogPostSchema.fields,
});

export const postEmailCampaignDocSchema = v.object({
  _id: v.id("postEmailCampaigns"),
  _creationTime: v.number(),
  ...postEmailCampaignSchema.fields,
});

export default defineSchema({
  users: defineTable({
    kind: v.literal("anonymous"),
    // SHA-256 (hex) of the secret token the visitor's browser keeps in
    // localStorage; the token itself is never stored. Rows created before tokens
    // existed have no hash and can no longer be signed in to.
    tokenHash: v.optional(v.string()),
  }).index("by_tokenHash", ["tokenHash"]),
  // One row per Mikebot thread that is waiting on a reply, so a visitor can't
  // queue up several expensive replies at once.
  mikebotPendingReplies: defineTable({
    threadId: v.string(),
    promptMessageId: v.string(),
    startedAt: v.number(),
  }).index("by_threadId", ["threadId"]),
  // Tokens and cost used by Mikebot per UTC day ("YYYY-MM-DD"), for the daily budgets.
  mikebotDailyUsage: defineTable({
    day: v.string(),
    inputTokens: v.number(),
    outputTokens: v.number(),
    totalTokens: v.number(),
    // USD as reported by the Convex AI Gateway; absent on rows written before cost was tracked.
    costUsd: v.optional(v.number()),
    updatedAt: v.number(),
  }).index("by_day", ["day"]),
  // LEGACY: nothing reads or writes this table any more (it backed the removed
  // Mikebot thread-notification emails). It is kept only because production may
  // still hold rows, and removing a table that has documents from the schema can
  // fail a deploy. To drop it: delete all its documents (dashboard > Data >
  // pendingThreadUpdateNotifications > Clear table), then remove this definition.
  pendingThreadUpdateNotifications: defineTable({
    scheduledFunctionId: v.id("_scheduled_functions"),
    threadId: v.string(),
  }).index("by_threadId", ["threadId"]),
  blogPosts: defineTable(blogPostSchema).index("by_slug", ["slug"]),
  postEmailCampaigns: defineTable(postEmailCampaignSchema)
    .index("by_slug", ["slug"])
    .index("by_postId", ["postId"])
    .index("by_status_and_updatedAt", ["status", "updatedAt"])
    .index("by_uploadRunId", ["uploadRunId"]),
});
