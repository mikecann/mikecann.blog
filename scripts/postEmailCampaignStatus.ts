import type { Doc } from "../convex/_generated/dataModel";

type PostEmailCampaignStatus = Pick<
  Doc<"postEmailCampaigns">,
  "status" | "scheduledFunctionId"
>;

export function isPostEmailCampaignScheduledOrSent(campaign: PostEmailCampaignStatus): boolean {
  if (campaign.status === "sent") return true;

  return campaign.status === "queued" && campaign.scheduledFunctionId != null;
}
