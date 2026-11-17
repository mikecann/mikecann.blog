import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { internalMutation, internalQuery } from "../../_generated/server";
import { syncCampaignState } from "../campaigns";

// Widen: gives every post email campaign the machine `state` its `status` stands for, and an empty
// `stateTimers`. Writes keep the two in step since this shipped, so a run only changes rows from
// before it, and running it again changes nothing. A page at a time, scheduling the next:
//   npx convex run --prod mailchimp/internal/migrations:backfillPostEmailState
export const backfillPostEmailState = internalMutation({
  args: { cursor: v.optional(v.union(v.string(), v.null())) },
  returns: v.null(),
  handler: async (ctx, { cursor }) => {
    const page = await ctx.db
      .query("postEmailCampaigns")
      .paginate({ cursor: cursor ?? null, numItems: 100 });
    for (const campaign of page.page) await syncCampaignState(ctx, campaign._id);
    if (!page.isDone)
      await ctx.scheduler.runAfter(
        0,
        internal.mailchimp.internal.migrations.backfillPostEmailState,
        {
          cursor: page.continueCursor,
        },
      );
    return null;
  },
});

/** How many campaigns are in each state, and how many have none yet: to check the backfill. */
export const postEmailStateCounts = internalQuery({
  args: {},
  returns: v.record(v.string(), v.number()),
  handler: async (ctx) => {
    const counts: Record<string, number> = {};
    for await (const campaign of ctx.db.query("postEmailCampaigns")) {
      const key = campaign.state
        ? `${campaign.status} -> ${campaign.state.kind}`
        : `${campaign.status} -> (none)`;
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return counts;
  },
});
