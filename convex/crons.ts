import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Post emails whose send action died mid-way would otherwise stay "in progress"
// forever; mark them failed so they're reported at deploy time and can be retried.
crons.interval(
  "fail stuck post email campaigns",
  { minutes: 15 },
  internal.mailchimp.internal.mutations.failStuckPostEmailCampaigns,
  {},
);

export default crons;
