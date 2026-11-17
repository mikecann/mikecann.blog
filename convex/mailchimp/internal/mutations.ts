import { v } from "convex/values";
import { convex } from "../../builder";
import { machines, postEmail, throwIfRefused } from "../../machines";
import { findLatestCampaignBySlug, recordStep, sendPostEmailEvent } from "../campaigns";

// How the server moves a post email (machine.ts). The send action and the delivery check report
// each step here as an event, and the admin mutations (admin/mutations.ts, blogPosts/) come here
// once they've checked the admin token, as only the catalog's internalMutation may send server
// events.

/**
 * One step of the send action or the delivery check. A refusal isn't an error: it means the
 * campaign moved on under the action (cancelled, or another run), so the action stops.
 */
export const report = machines.internalMutation({
  args: { campaignId: v.id("postEmailCampaigns"), event: postEmail.events.server },
  returns: v.object({ done: v.boolean(), to: v.union(v.string(), v.null()) }),
  handler: async (ctx, { campaignId, event }) => {
    const result = await sendPostEmailEvent(ctx, campaignId, event);
    if (result.status !== "done") {
      console.warn(
        `[post email] ${event.type} refused for ${campaignId}: ${result.reasons.join(" ")}`,
      );
      return { done: false, to: null };
    }
    // Each claim is one attempt at sending, for the record
    if (result.to === "creatingCampaign" && result.from === "checkingLive") {
      const campaign = await ctx.db.get("postEmailCampaigns", campaignId);
      if (campaign)
        await ctx.db.patch("postEmailCampaigns", campaignId, { attempts: campaign.attempts + 1 });
    }
    return { done: true, to: result.to };
  },
});

/** An admin's retry of a post email that didn't go out (see admin/mutations.ts). */
export const retry = machines.internalMutation({
  args: { slug: v.string(), skipLiveCheck: v.boolean(), allowEarlierEmail: v.boolean() },
  returns: v.object({ slug: v.string(), status: v.string(), scheduled: v.boolean() }),
  handler: async (ctx, { slug, skipLiveCheck, allowEarlierEmail }) => {
    const campaign = await findLatestCampaignBySlug(ctx, slug);
    if (!campaign) throw new Error(`No Mailchimp email campaign found for post '${slug}'`);
    if (campaign.state.kind === "sent") return { slug, status: "sent", scheduled: false };
    throwIfRefused(
      await sendPostEmailEvent(ctx, campaign._id, {
        type: "RETRY",
        skipLiveCheck,
        allowEarlierEmail,
      }),
    );
    return { slug, status: "queued", scheduled: true };
  },
});

/** An admin records that a post email's Mailchimp campaign went out (see admin/mutations.ts). */
export const markSentByHand = machines.internalMutation({
  args: { slug: v.string(), mailchimpCampaignId: v.string() },
  returns: v.null(),
  handler: async (ctx, { slug, mailchimpCampaignId }) => {
    const campaign = await findLatestCampaignBySlug(ctx, slug);
    if (!campaign) throw new Error(`No Mailchimp email campaign found for post '${slug}'`);
    if (campaign.state.kind === "sent") return null;
    throwIfRefused(
      await sendPostEmailEvent(ctx, campaign._id, { type: "MARK_SENT", mailchimpCampaignId }),
    );
    return null;
  },
});

/**
 * A post was pruned (deleted or renamed): its email is cancelled if it hasn't started sending.
 * Once it's sending it can't be, and the refusal is left at that.
 */
export const cancelForRemovedPost = machines.internalMutation({
  args: { slug: v.string() },
  returns: v.null(),
  handler: async (ctx, { slug }) => {
    const campaigns = await ctx.db
      .query("postEmailCampaigns")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .take(20);
    for (const campaign of campaigns) {
      const result = await postEmail.send(ctx, campaign._id, {
        type: "CANCEL",
        reason: "Not sent: the post was removed before its email went out",
      });
      if (result.status === "done") await recordStep(ctx, campaign._id);
    }
    return null;
  },
});

/**
 * Gives campaigns from before `postDate` was recorded their post's frontmatter date, so a rename
 * that also changes the title is still recognised (findEarlierEmailForSamePost). Only fills it in
 * where it's missing. Run once per deployment, with the dates from the posts' frontmatter:
 *   npx convex run --prod mailchimp/internal/mutations:recordMissingPostDates '{"posts":[...]}'
 */
export const recordMissingPostDates = convex
  .mutation()
  .input({ posts: v.array(v.object({ slug: v.string(), postDate: v.number() })) })
  .returns(v.array(v.string()))
  .handler(async (ctx, { posts }) => {
    const updated: string[] = [];
    for (const { slug, postDate } of posts) {
      const campaigns = await ctx.db
        .query("postEmailCampaigns")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .take(20);
      for (const campaign of campaigns) {
        if (campaign.postDate !== undefined) continue;
        await ctx.db.patch("postEmailCampaigns", campaign._id, { postDate });
        updated.push(slug);
      }
    }
    return updated;
  })
  .internal();
