// Give the production site time to finish deploying before subscribers receive
// links to a newly created post. Production deploys currently take around seven
// minutes, so thirty minutes leaves a generous safety margin.
export const NEW_POST_EMAIL_DELAY_MS = 30 * 60 * 1000;
