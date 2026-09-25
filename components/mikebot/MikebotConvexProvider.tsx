"use client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { CONVEX_URL } from "../../utils/convex";

interface Props {
  children: React.ReactNode;
}

let client: ConvexReactClient | undefined;

/**
 * One client (and so one WebSocket) per page load, created the first time the
 * widget is opened and reused every time it is reopened.
 */
const getMikebotConvexClient = () => (client ??= new ConvexReactClient(CONVEX_URL));

export const MikebotConvexProvider: React.FC<Props> = ({ children }) => (
  <ConvexProvider client={getMikebotConvexClient()}>{children}</ConvexProvider>
);
