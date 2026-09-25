"use client";
import * as React from "react";
import { MikebotMinimizedView } from "./MikebotMinimizedView";
import { onOpenMikebot } from "./signals";

// This component is rendered on every page, so it must stay tiny: the chat
// widget (Convex client, markdown rendering, ...) is only downloaded when the
// visitor opens Mikebot, or starts to (hover / focus / touch on the avatar).
const loadWidget = () => import("./MikebotWidget");

const prefetchWidget = () => {
  loadWidget().catch(() => {
    // Ignore: opening the widget will try again and surface the failure.
  });
};

type View = "minimized" | "widget";

const Mikebot: React.FC = () => {
  const [view, setView] = React.useState<View>("minimized");
  const [initialMessage, setInitialMessage] = React.useState<string | null>(null);
  // Bumped after a failure so that reopening retries loading the widget.
  const [loadAttempt, setLoadAttempt] = React.useState(0);
  const MikebotWidget = React.useMemo(() => React.lazy(loadWidget), [loadAttempt]);

  React.useEffect(() => {
    return onOpenMikebot.add((message) => {
      setInitialMessage(message);
      setView("widget");
    });
  }, []);

  const minimized = (
    <MikebotMinimizedView onOpen={() => setView("widget")} onPrefetch={prefetchWidget} />
  );

  if (view == "minimized") return minimized;

  return (
    <MikebotErrorBoundary
      key={loadAttempt}
      onError={() => {
        setView("minimized");
        setLoadAttempt((n) => n + 1);
      }}
    >
      <React.Suspense fallback={minimized}>
        <MikebotWidget onMinimize={() => setView("minimized")} initialMessage={initialMessage} />
      </React.Suspense>
    </MikebotErrorBoundary>
  );
};

/**
 * Mikebot sits on every page: if the widget fails to load or crashes, fall
 * back to the minimized avatar rather than taking the whole page down.
 */
class MikebotErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: () => void },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Mikebot crashed", error);
    this.props.onError();
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

export default Mikebot;
