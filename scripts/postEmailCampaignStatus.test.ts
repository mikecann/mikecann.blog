import { describe, expect, test } from "vitest";
import { isPostEmailCampaignScheduledOrSent } from "./postEmailCampaignStatus";

describe("isPostEmailCampaignScheduledOrSent", () => {
  test("accepts a queued campaign with a durable scheduled function", () => {
    expect(
      isPostEmailCampaignScheduledOrSent({
        status: "queued",
        scheduledFunctionId: "scheduled-function-id",
      }),
    ).toBe(true);
  });

  test("rejects a queued campaign before its scheduled function is attached", () => {
    expect(isPostEmailCampaignScheduledOrSent({ status: "queued" })).toBe(false);
  });

  test("accepts a campaign that has already been sent", () => {
    expect(isPostEmailCampaignScheduledOrSent({ status: "sent" })).toBe(true);
  });

  test.each(["creating_campaign", "content_set", "sending", "failed"])(
    "does not treat %s as safely scheduled",
    (status) => {
      expect(isPostEmailCampaignScheduledOrSent({ status })).toBe(false);
    },
  );
});
