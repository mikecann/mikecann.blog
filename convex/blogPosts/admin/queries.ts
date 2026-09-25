import { v } from "convex/values";
import { validateBlogPostAdminToken } from "../lib";
import { convex } from "../../builder";
import type { Doc } from "../../_generated/dataModel";
import {
  POST_EMAIL_IN_PROGRESS_STUCK_AFTER_MS,
  POST_EMAIL_PROBLEM_REPORT_WINDOW_MS,
  POST_EMAIL_QUEUED_STUCK_AFTER_MS,
} from "../../mailchimp/constants";
import { IN_PROGRESS_STATUSES } from "../../mailchimp/campaigns";
import { postEmailCampaignDocSchema } from "../../schema";

export type SlugId = string;

/** Returns the slugs whose content hash or title differ from what's stored. */
export const listPostsThatNeedProcessing = convex
  .query()
  .input({
    token: v.string(),
    posts: v.array(
      v.object({
        slug: v.string(),
        hash: v.string(),
        title: v.string(),
      }),
    ),
  })
  .returns(v.array(v.string()))
  .handler(async (ctx, { token, posts }): Promise<SlugId[]> => {
    validateBlogPostAdminToken(token);

    const results = await Promise.all(
      posts.map(async ({ slug, hash, title }) => {
        const existing = await ctx.db
          .query("blogPosts")
          .withIndex("by_slug", (q) => q.eq("slug", slug))
          .first();

        if (!existing || existing.hash !== hash || existing.title !== title) return slug;
        return null;
      }),
    );

    return results.filter((slug) => slug !== null);
  })
  .public();

export const listPostEmailCampaigns = convex
  .query()
  .input({
    token: v.string(),
    slugs: v.array(v.string()),
  })
  .returns(
    v.array(
      v.object({ slug: v.string(), campaign: v.union(v.null(), postEmailCampaignDocSchema) }),
    ),
  )
  .handler(async (ctx, { token, slugs }) => {
    validateBlogPostAdminToken(token);

    return await Promise.all(
      slugs.map(async (slug) => {
        const campaign = await ctx.db
          .query("postEmailCampaigns")
          .withIndex("by_slug", (q) => q.eq("slug", slug))
          .order("desc")
          .first();

        return {
          slug,
          campaign,
        };
      }),
    );
  })
  .public();

/**
 * Post emails that need a human: recently failed or skipped ones, and ones
 * that look stuck. Printed by the upload script at deploy time.
 */
export const listPostEmailCampaignProblems = convex
  .query()
  .input({
    token: v.string(),
  })
  .returns(
    v.array(
      v.object({
        slug: v.string(),
        status: v.string(),
        error: v.optional(v.string()),
        updatedAt: v.number(),
      }),
    ),
  )
  .handler(async (ctx, { token }) => {
    validateBlogPostAdminToken(token);
    const now = Date.now();

    const byStatus = (
      status: Doc<"postEmailCampaigns">["status"],
      range: { after?: number; before?: number },
    ) =>
      ctx.db
        .query("postEmailCampaigns")
        .withIndex("by_status_and_updatedAt", (q) => {
          const withStatus = q.eq("status", status);
          if (range.after !== undefined) return withStatus.gte("updatedAt", range.after);
          if (range.before !== undefined) return withStatus.lt("updatedAt", range.before);
          return withStatus;
        })
        .order("desc")
        .take(20);

    const groups = await Promise.all([
      byStatus("failed", { after: now - POST_EMAIL_PROBLEM_REPORT_WINDOW_MS }),
      byStatus("skipped", { after: now - POST_EMAIL_PROBLEM_REPORT_WINDOW_MS }),
      ...IN_PROGRESS_STATUSES.map((status) =>
        byStatus(status, { before: now - POST_EMAIL_IN_PROGRESS_STUCK_AFTER_MS }),
      ),
      byStatus("queued", { before: now - POST_EMAIL_QUEUED_STUCK_AFTER_MS }),
    ]);

    return groups.flat().map((c) => ({
      slug: c.slug,
      status: c.status,
      error: c.error,
      updatedAt: c.updatedAt,
    }));
  })
  .public();
