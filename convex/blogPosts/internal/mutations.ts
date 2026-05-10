import { v } from "convex/values";
import { convex } from "../../builder";
import { ensureFP } from "../../../essentials/misc/ensure";
import { vEntryId } from "@convex-dev/rag";
import { internal } from "../../_generated/api";

export const createBlogPost = convex
  .mutation()
  .input({
    slug: v.string(),
    title: v.string(),
    hash: v.string(),
    ragEntryId: vEntryId,
  })
  .handler(async (ctx, { slug, title, hash, ragEntryId }) => {
    const id = await ctx.db.insert("blogPosts", {
      slug,
      title,
      hash,
      ragEntryId,
    });

    const campaignId = await ctx.runMutation(
      internal.mailchimp.internal.mutations.createQueuedPostEmailCampaign,
      {
        postId: id,
        slug,
        title,
      },
    );

    const scheduledFunctionId = await ctx.scheduler.runAfter(
      0,
      internal.mailchimp.internal.actions.sendNewPostCampaign,
      {
        campaignId,
      },
    );

    await ctx.runMutation(internal.mailchimp.internal.mutations.attachScheduledFunction, {
      campaignId,
      scheduledFunctionId,
    });

    return await ctx.db.get(id).then(ensureFP("Blog post not found"));
  })
  .internal();

export const updateBlogPost = convex
  .mutation()
  .input({
    postId: v.id("blogPosts"),
    ragEntryId: vEntryId,
  })
  .handler(async (ctx, { postId, ragEntryId }) => {
    await ctx.db.patch(postId, { ragEntryId });
  })
  .internal();
