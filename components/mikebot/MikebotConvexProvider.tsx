"use client";
import { ConvexProvider, ConvexReactClient } from "convex/react";

interface Props {
  children: React.ReactNode;
}

const PRODUCTION_CONVEX_URL = "https://groovy-lapwing-575.convex.cloud";
const DEVELOPMENT_CONVEX_URL = "https://wooden-warbler-780.convex.cloud";

/**
 * NEXT_PUBLIC_CONVEX_URL is inlined at build time (the Convex CLI sets it when
 * deploying with `convex deploy --cmd`); the hardcoded URLs are fallbacks.
 */
export const MIKEBOT_CONVEX_URL =
  process.env.NEXT_PUBLIC_CONVEX_URL ||
  (process.env.NODE_ENV === "development" ? DEVELOPMENT_CONVEX_URL : PRODUCTION_CONVEX_URL);

let client: ConvexReactClient | undefined;

/**
 * One client (and so one WebSocket) per page load, created the first time the
 * widget is opened and reused every time it is reopened.
 */
const getMikebotConvexClient = () => (client ??= new ConvexReactClient(MIKEBOT_CONVEX_URL));

export const MikebotConvexProvider: React.FC<Props> = ({ children }) => (
  <ConvexProvider client={getMikebotConvexClient()}>{children}</ConvexProvider>
);
