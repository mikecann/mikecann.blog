import { v } from "convex/values";
import { machines, postEmail } from "../../machines";
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

/** How many campaigns are in each state, to read a deployment back. */
export const postEmailStateCounts = internalQuery({
  args: {},
  returns: v.record(v.string(), v.number()),
  handler: async (ctx) => {
    const counts: Record<string, number> = {};
    for await (const campaign of ctx.db.query("postEmailCampaigns")) {
      const key = campaign.state.kind;
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return counts;
  },
});
