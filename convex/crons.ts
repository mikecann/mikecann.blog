import { cronJobs } from "convex/server";

// Post emails stuck mid-send used to be failed by a cron here. Each state the send can stall in now
// has its own timer in the post email machine (mailchimp/machine.ts).
const crons = cronJobs();

export default crons;
