import { type Infer, v } from "convex/values";
import type { Doc } from "../_generated/dataModel";

// The post email machine's state (machine.ts). Each member holds only its own data, so a campaign
// can't be `sent` without when, or `sending` without the Mailchimp campaign it's sending.
//
// Until narrowing, `status` stays on the row beside `state`: the widen step derives `state` from
// `status` (stateOfLegacyCampaign), and from the switch on `status` is written from `state`
// (legacyStatusOf), so code on either side of a deploy reads a row it understands.

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
  v.object({ kind: v.literal("cancelled"), reason: v.string() }),
  v.object({
    kind: v.literal("alreadyEmailed"),
    earlierCampaignId: v.id("postEmailCampaigns"),
    earlierSlug: v.string(),
  }),
);

export type PostEmailState = Infer<typeof postEmailStateValidator>;
export type PostEmailStateKind = PostEmailState["kind"];
export type LegacyCampaignStatus = Doc<"postEmailCampaigns">["status"];

/**
 * The state an old-style row stands for, from its `status` and the optional fields beside it.
 * `sendAt` is when its pending send job runs (or now, if it has none).
 */
export function stateOfLegacyCampaign(
  campaign: Doc<"postEmailCampaigns">,
  sendAt: number,
): PostEmailState {
  const id = campaign.mailchimpCampaignId;
  switch (campaign.status) {
    case "queued":
      return {
        kind: "queued",
        sendAt,
        liveChecks: campaign.liveCheckAttempts ?? 0,
        skipLiveCheck: campaign.skipLiveCheck ?? false,
        allowEarlierEmail: campaign.allowEarlierEmail ?? false,
        mailchimpCampaignId: id,
      };
    case "creating_campaign":
      return { kind: "creatingCampaign", mailchimpCampaignId: id };
    case "content_set":
      return { kind: "contentSet", mailchimpCampaignId: id ?? "" };
    case "sending":
      return { kind: "sending", mailchimpCampaignId: id ?? "" };
    case "sent":
      return {
        kind: "sent",
        sentAt: campaign.sentAt ?? campaign.updatedAt,
        mailchimpCampaignId: id,
      };
    case "failed":
      return { kind: "failed", error: campaign.error ?? "", mailchimpCampaignId: id };
    case "skipped":
      return { kind: "skipped", reason: campaign.error ?? "" };
  }
}

/** The old `status` a state stands for, written beside it until narrowing. */
export function legacyStatusOf(kind: PostEmailStateKind): LegacyCampaignStatus {
  switch (kind) {
    case "queued":
    case "checkingLive":
      return "queued";
    case "creatingCampaign":
      return "creating_campaign";
    case "contentSet":
      return "content_set";
    case "sending":
    case "checkingDelivery":
      return "sending";
    case "sent":
      return "sent";
    case "failed":
    case "cancelled":
      return "failed";
    case "skipped":
    case "alreadyEmailed":
      return "skipped";
  }
}
