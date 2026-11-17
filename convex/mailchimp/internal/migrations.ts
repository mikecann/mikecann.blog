import { v } from "convex/values";
import { machines, postEmail } from "../../machines";
import { internal } from "../../_generated/api";
import { internalQuery } from "../../_generated/server";

// Switch: a campaign the widen step left in a state with a timer (queued, or one stuck mid-send)
// starts with none, so this arms what its state has, as if it had just entered it. A queued
// campaign's SEND_DUE fires at its `sendAt` (its old send job's time), at once if that's past; the
// old job, if it still runs, finds the campaign isn't checkingLive and does nothing. Rows that
// already have timers are left alone, so running it again changes nothing:
//   npx convex run --prod mailchimp/internal/migrations:armPostEmailTimers
export const armPostEmailTimers = machines.internalMutation({
  args: {},
  returns: v.array(
    v.object({ campaignId: v.id("postEmailCampaigns"), events: v.array(v.string()) }),
  ),
  handler: async (ctx) => {
    const armed = [];
    for (const kind of [
      "queued",
      "checkingLive",
      "creatingCampaign",
      "contentSet",
      "sending",
      "checkingDelivery",
    ] as const) {
      const campaigns = await ctx.db
        .query("postEmailCampaigns")
        .withIndex("by_state_and_updatedAt", (q) => q.eq("state.kind", kind))
        .take(100);
      for (const campaign of campaigns) {
        if (campaign.stateTimers.length > 0) continue;
        const timers = await postEmail.armTimers(ctx, campaign._id);
        armed.push({ campaignId: campaign._id, events: timers.map((timer) => timer.event) });
      }
    }
    return armed;
  },
});

// Narrow: clears the fields from before the machine (status, error, sentAt...) off every campaign,
// so the next deploy can drop them from the schema. Nothing has written them since the switch, so
// running it again changes nothing:
//   npx convex run --prod mailchimp/internal/migrations:unsetLegacyCampaignFields
export const unsetLegacyCampaignFields = machines.internalMutation({
  args: { cursor: v.optional(v.union(v.string(), v.null())) },
  returns: v.object({ cleared: v.number(), isDone: v.boolean() }),
  handler: async (ctx, { cursor }) => {
    const page = await ctx.db
      .query("postEmailCampaigns")
      .paginate({ cursor: cursor ?? null, numItems: 100 });
    let cleared = 0;
    for (const campaign of page.page) {
      const legacy = Object.keys(LEGACY_FIELDS).filter(
        (field) => campaign[field as keyof typeof LEGACY_FIELDS] !== undefined,
      );
      if (legacy.length === 0) continue;
      await ctx.db.patch("postEmailCampaigns", campaign._id, LEGACY_FIELDS);
      cleared++;
    }
    if (!page.isDone)
      await ctx.scheduler.runAfter(
        0,
        internal.mailchimp.internal.migrations.unsetLegacyCampaignFields,
        { cursor: page.continueCursor },
      );
    return { cleared, isDone: page.isDone };
  },
});

const LEGACY_FIELDS = {
  status: undefined,
  scheduledFunctionId: undefined,
  mailchimpCampaignId: undefined,
  error: undefined,
  sentAt: undefined,
  liveCheckAttempts: undefined,
  skipLiveCheck: undefined,
  allowEarlierEmail: undefined,
} as const;

/** How many campaigns are in each state, and how many still have old fields, to read a deployment back. */
export const postEmailStateCounts = internalQuery({
  args: {},
  returns: v.record(v.string(), v.number()),
  handler: async (ctx) => {
    const counts: Record<string, number> = {};
    for await (const campaign of ctx.db.query("postEmailCampaigns")) {
      const key =
        campaign.status === undefined
          ? campaign.state.kind
          : `${campaign.state.kind} (old status ${campaign.status})`;
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return counts;
  },
});
