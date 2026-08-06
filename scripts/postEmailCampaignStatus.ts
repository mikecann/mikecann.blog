type PostEmailCampaignStatus = {
  status: string;
  scheduledFunctionId?: unknown;
};

export function isPostEmailCampaignScheduledOrSent(campaign: PostEmailCampaignStatus): boolean {
  if (campaign.status === "sent") return true;

  return campaign.status === "queued" && campaign.scheduledFunctionId != null;
}
