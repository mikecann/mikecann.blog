import { format } from "date-fns";

/**
 * Formats the UTC calendar date of an ISO timestamp.
 *
 * Post dates are stored as UTC ISO strings (new posts at UTC midnight), so the intended date is
 * the UTC date. Formatting in local time would give different output on the server and in
 * browsers west of UTC, causing hydration mismatches.
 */
export const formatUTCDate = (isoDate: string | number, pattern = "do MMMM yyyy"): string => {
  const date = new Date(isoDate);
  // A local Date with the same calendar fields as the UTC date, so `format` prints the UTC day.
  return format(new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()), pattern);
};
