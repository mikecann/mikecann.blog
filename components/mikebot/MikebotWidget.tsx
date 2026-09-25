"use client";
import * as React from "react";
import { MikebotConvexProvider } from "./MikebotConvexProvider";
import { MikebotMeProvider } from "./MikebotMeProvider";
import { MikebotWidgetView } from "./MikebotWidgetView";

interface Props {
  onMinimize: () => void;
  initialMessage?: string | null;
}

/**
 * The open Mikebot chat window. This module (and everything it pulls in: the
 * Convex client, markdown rendering, ...) is loaded on demand by Mikebot.tsx.
 */
const MikebotWidget: React.FC<Props> = ({ onMinimize, initialMessage }) => (
  <MikebotConvexProvider>
    <MikebotMeProvider>
      <MikebotWidgetView onMinimize={onMinimize} initialMessage={initialMessage} />
    </MikebotMeProvider>
  </MikebotConvexProvider>
);

export default MikebotWidget;
