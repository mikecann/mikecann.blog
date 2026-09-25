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
});

export default defineSchema({
  users: defineTable({
    kind: v.literal("anonymous"),
  }),
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
    .index("by_status", ["status"]),
});
