import * as React from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Items } from "./Items";

// The StashIt project's Convex deployment (not this blog's). Created on first render in the
// browser, so building the page doesn't open a connection.
let stashClient: ConvexReactClient | undefined;
const getStashClient = () =>
  (stashClient ??= new ConvexReactClient(
    import.meta.env.DEV
      ? "https://clear-rabbit-84.convex.cloud"
      : "https://festive-sparrow-314.convex.cloud",
  ));

/** The reading list on /stash, live from StashIt. */
export const StashItems: React.FC = () => (
  <ConvexProvider client={getStashClient()}>
    <Items />
  </ConvexProvider>
);
