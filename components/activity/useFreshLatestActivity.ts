import * as React from "react";
import { buildLatestActivity, type ActivityItem, type LatestActivity } from "../../utils/activity";
import type { ActivityResponse } from "../../pages/api/activity";

// One request per visit, shared by every panel and page the visitor goes through.
let freshItems: Promise<ActivityItem[] | null> | undefined;

const loadFreshItems = () =>
  (freshItems ??= fetch("/api/activity")
    .then((response) => (response.ok ? (response.json() as Promise<ActivityResponse>) : null))
    .then((body) => (Array.isArray(body?.items) ? body.items : null))
    .catch(() => null));

/**
 * The activity a page was built with, swapped for the latest from /api/activity once it loads.
 * Pages are only rebuilt on deploy, so without this the panels would be as old as the last
 * deploy. If the request fails the built-in activity stays.
 */
export const useFreshLatestActivity = (
  built: LatestActivity,
  maxXPosts: number,
  exclude: (ActivityItem | null)[] = [],
): LatestActivity => {
  const [items, setItems] = React.useState<ActivityItem[] | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    loadFreshItems().then((loaded) => {
      if (!cancelled && loaded) setItems(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!items) return built;
  return buildLatestActivity(
    items,
    maxXPosts,
    exclude.filter((item) => item != null),
  );
};
