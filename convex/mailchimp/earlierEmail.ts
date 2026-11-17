import type { GenericDatabaseReader } from "convex/server";
import type { DataModel, Doc } from "../_generated/dataModel";

// Recognising a renamed post, so it isn't emailed twice.
//
// Renaming a post's folder changes its slug, so the deploy creates a new post (and a new campaign)
// before it prunes the old one, and campaigns are keyed by slug. So before a campaign sends, the
// post email machine's LIVE step looks for an earlier email about what may be the same post: the
// same title or the same frontmatter date, in the 30 days before. What tells a rename from a second
// post that shares a title or date is that the earlier post is gone, from Convex (pruned) or from
// the live site (the send action checks it, as the prune can be refused or not get to run).
//
// A campaign whose own post is gone never sends (the machine's postRemoved guard), so an admin
// retry of an old slug's email can't email about the renamed post a second time.

type Db = GenericDatabaseReader<DataModel>;
type Campaign = Doc<"postEmailCampaigns">;

/** How far back an earlier email can be and still be the same post: a rename comes soon after. */
export const EARLIER_EMAIL_WINDOW_MS = 30 * 86_400_000;

/**
 * Whether subscribers may have had this campaign's email. Once a campaign is being created in
 * Mailchimp a send can follow, and one that got as far as a Mailchimp campaign may have sent even if
 * it's failed since (a timed-out response) or an admin retry has queued it again.
 */
export function mayHaveEmailed(state: Campaign["state"]): boolean {
  if (state.kind === "creatingCampaign" || state.kind === "sent") return true;
  // One held back as a rename stands for a post that was emailed, so a second rename finds it
  if (state.kind === "alreadyEmailed") return true;
  return "mailchimpCampaignId" in state && state.mailchimpCampaignId !== undefined;
}

/**
 * Whether a campaign's post is gone: pruned from Convex, or, in `goneFromSite`, no longer served by
 * the live site.
 */
const isPostGone = async (db: Db, campaign: Campaign, goneFromSite: ReadonlySet<string>) =>
  goneFromSite.has(campaign._id) || !(await db.get("blogPosts", campaign.postId));

/** Earlier campaigns that may be about this same post under another slug, by title or date. */
async function listMatches(db: Db, campaign: Campaign): Promise<Campaign[]> {
  // Every index ends with _creationTime, so each lookup reads only the window, newest first.
  const after = campaign._creationTime - EARLIER_EMAIL_WINDOW_MS;
  const before = campaign._creationTime;
  const byTitle = await db
    .query("postEmailCampaigns")
    .withIndex("by_title", (q) =>
      q.eq("title", campaign.title).gt("_creationTime", after).lt("_creationTime", before),
    )
    .order("desc")
    .take(50);
  const postDate = campaign.postDate;
  const byDate =
    postDate === undefined
      ? []
      : await db
          .query("postEmailCampaigns")
          .withIndex("by_postDate", (q) =>
            q.eq("postDate", postDate).gt("_creationTime", after).lt("_creationTime", before),
          )
          .order("desc")
          .take(50);

  const seen = new Set<string>();
  return [...byTitle, ...byDate].filter((earlier) => {
    if (seen.has(earlier._id)) return false;
    seen.add(earlier._id);
    return earlier.postId !== campaign.postId && mayHaveEmailed(earlier.state);
  });
}

/** Other renames already matched to an earlier email (alreadyEmailed campaigns pointing at it). */
const claimantsOf = (db: Db, earlier: Campaign, campaign: Campaign) =>
  db
    .query("postEmailCampaigns")
    .withIndex("by_earlierCampaign", (q) => q.eq("state.earlierCampaignId", earlier._id))
    .take(10)
    .then((claimants) => claimants.filter((claimant) => claimant._id !== campaign._id));

/**
 * The slugs the send action should ask the live site about, as Convex alone can't say whether
 * they're gone (the prune can be refused or not get to run): every earlier email and every rename
 * matched to one, whose post Convex still has.
 */
export async function listSlugsToCheck(db: Db, campaign: Campaign) {
  const toCheck = new Map<string, { campaignId: Campaign["_id"]; slug: string }>();
  for (const earlier of await listMatches(db, campaign))
    for (const one of [earlier, ...(await claimantsOf(db, earlier, campaign))])
      if (await db.get("blogPosts", one.postId))
        toCheck.set(one._id, { campaignId: one._id, slug: one.slug });
  return [...toCheck.values()];
}

/**
 * The email that already went out (or may have) about this same post under an earlier slug, if
 * there is one: a match whose post is gone (from Convex, or in `goneFromSite`).
 *
 * A match that another rename has already been matched to belongs to that rename's post, as long as
 * that post is still on the blog. So a third post that only shares its date (two posts dated the
 * same day) isn't held back by it, while a post renamed again and again still finds the email.
 */
export async function findEarlierEmailForSamePost(
  db: Db,
  campaign: Campaign,
  goneFromSite: ReadonlySet<string>,
): Promise<Campaign | null> {
  for (const earlier of await listMatches(db, campaign)) {
    if (!(await isPostGone(db, earlier, goneFromSite))) continue;
    let claimedByLivePost = false;
    for (const claimant of await claimantsOf(db, earlier, campaign))
      if (!(await isPostGone(db, claimant, goneFromSite))) claimedByLivePost = true;
    if (!claimedByLivePost) return earlier;
  }
  return null;
}
