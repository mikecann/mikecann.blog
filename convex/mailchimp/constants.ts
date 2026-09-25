const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// Give the production site time to finish deploying before subscribers receive
// links to a newly created post. Before sending we also check that the post URL
// returns 200 (see POST_LIVE_CHECK_*), so this is just a first guess.
export const NEW_POST_EMAIL_DELAY_MS = 30 * MINUTE;

/** Only posts dated within this window get an email (guards against mass emails). */
export const POST_EMAIL_MAX_POST_AGE_MS = 14 * DAY;

/** Max campaigns one upload run may queue; more than this looks like a bulk import. */
export const POST_EMAIL_MAX_CAMPAIGNS_PER_UPLOAD_RUN = 3;

/** While the post URL isn't returning 200 yet, check again this often... */
export const POST_LIVE_CHECK_RETRY_DELAY_MS = 10 * MINUTE;
/** ...up to this many times in total before marking the campaign failed. */
export const POST_LIVE_CHECK_MAX_ATTEMPTS = 12;

/** A campaign stuck mid-send (creating_campaign / content_set / sending) this long is failed. */
export const POST_EMAIL_IN_PROGRESS_STUCK_AFTER_MS = HOUR;
/** A queued campaign with no pending send job for this long is failed. */
export const POST_EMAIL_QUEUED_STUCK_AFTER_MS = 3 * HOUR;

/** Failed / skipped campaigns updated within this window are reported at deploy time. */
export const POST_EMAIL_PROBLEM_REPORT_WINDOW_MS = 30 * DAY;
