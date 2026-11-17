import { type Infer, v } from "convex/values";

// The post email machine's state (machine.ts). Each member holds only its own data, so a campaign
// can't be `sent` without when, or `sending` without the Mailchimp campaign it's sending.

/** The Mailchimp campaign, once one has been created for this email (a retry resumes it). */
const mailchimpCampaignId = v.optional(v.string());

/** Waiting to send, and how the next send should go. */
const sendOptions = {
  /** How many times the post's page has been checked and wasn't live yet. */
  liveChecks: v.number(),
  /** An admin retry asked to send without checking the post's page first. */
  skipLiveCheck: v.boolean(),
  /** An admin retry asked to send even though an earlier email looks like this post's. */
  allowEarlierEmail: v.boolean(),
  mailchimpCampaignId,
};

export const postEmailStateValidator = v.union(
  v.object({ kind: v.literal("queued"), sendAt: v.number(), ...sendOptions }),
  v.object({ kind: v.literal("checkingLive"), ...sendOptions }),
  v.object({ kind: v.literal("creatingCampaign"), mailchimpCampaignId }),
  v.object({ kind: v.literal("contentSet"), mailchimpCampaignId: v.string() }),
  v.object({ kind: v.literal("sending"), mailchimpCampaignId: v.string() }),
  v.object({
    kind: v.literal("checkingDelivery"),
    mailchimpCampaignId: v.string(),
    error: v.string(),
  }),
  v.object({ kind: v.literal("sent"), sentAt: v.number(), mailchimpCampaignId }),
  v.object({ kind: v.literal("failed"), error: v.string(), mailchimpCampaignId }),
  v.object({ kind: v.literal("skipped"), reason: v.string() }),
  // Keeps the Mailchimp campaign of a retry it cancelled, which may have sent before
  v.object({ kind: v.literal("cancelled"), reason: v.string(), mailchimpCampaignId }),
  v.object({
    kind: v.literal("alreadyEmailed"),
    earlierCampaignId: v.id("postEmailCampaigns"),
    earlierSlug: v.string(),
  }),
);

export type PostEmailState = Infer<typeof postEmailStateValidator>;
export type PostEmailStateKind = PostEmailState["kind"];
