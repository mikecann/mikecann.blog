// Test helpers for post email campaigns. (The Convex CLI skips files with more than one dot in
// their name, so this is never deployed.)
import type { GenericMutationCtx } from "convex/server";
import type { DataModel, Doc } from "../_generated/dataModel";
import { type PostEmailState, stateOfLegacyCampaign } from "./campaignState";

type Fields = Omit<Doc<"postEmailCampaigns">, "_id" | "_creationTime" | "state" | "stateTimers"> & {
  state?: PostEmailState;
  stateTimers?: Doc<"postEmailCampaigns">["stateTimers"];
};

/**
 * Inserts a campaign row straight into a state, round the machine, as a test's setup. Without a
 * `state`, it's the one its old `status` and fields stand for, as the widen step wrote it.
 */
export async function insertCampaignRow(ctx: GenericMutationCtx<DataModel>, fields: Fields) {
  const state =
    fields.state ??
    stateOfLegacyCampaign(fields as unknown as Doc<"postEmailCampaigns">, fields.updatedAt);
  return await ctx.db.insert("postEmailCampaigns", {
    ...fields,
    state,
    stateTimers: fields.stateTimers ?? [],
  });
}
