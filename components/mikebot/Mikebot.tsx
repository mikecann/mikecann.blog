"use client";
import * as React from "react";
import { MikebotWidgetView } from "./MikebotWidgetView";
import { MikebotConvexProvider } from "./MikebotConvexProvider";
import { MikebotMeProvider } from "./MikebotMeProvider";
import { MikebotMinimizedView } from "./MikebotMinimizedView";
import { onOpenMikebot } from "./signals";

interface Props {}

type View = "minimized" | "widget";

const Mikebot: React.FC<Props> = ({}) => {
  const [view, setView] = React.useState<View>("minimized");
  const [initialMessage, setInitialMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    return onOpenMikebot.add((message) => {
      console.log("onOpenMikebot", message);
      setInitialMessage(message);
      setView("widget");
    });
  }, [setInitialMessage]);

  if (view == "minimized") return <MikebotMinimizedView onOpen={() => setView("widget")} />;

  if (view == "widget")
    return (
      <MikebotConvexProvider>
        <MikebotMeProvider>
          <MikebotWidgetView
            onMinimize={() => setView("minimized")}
            initialMessage={initialMessage}
          />
        </MikebotMeProvider>
      </MikebotConvexProvider>
    );

  return null;
};

export default Mikebot;
