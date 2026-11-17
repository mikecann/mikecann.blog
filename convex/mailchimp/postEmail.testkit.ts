// Test helpers for post email campaigns. (The Convex CLI skips files with more than one dot in
// their name, so this is never deployed.)
import type { GenericMutationCtx } from "convex/server";
import type { DataModel, Doc } from "../_generated/dataModel";
import type { PostEmailState } from "./campaignState";

type Fields = Omit<Doc<"postEmailCampaigns">, "_id" | "_creationTime" | "state" | "stateTimers"> & {
  state: PostEmailState;
  stateTimers?: Doc<"postEmailCampaigns">["stateTimers"];
};

/** Inserts a campaign row straight into a state, round the machine, as a test's setup. */
export async function insertCampaignRow(ctx: GenericMutationCtx<DataModel>, fields: Fields) {
  return await ctx.db.insert("postEmailCampaigns", {
    ...fields,
    stateTimers: fields.stateTimers ?? [],
  });
}
