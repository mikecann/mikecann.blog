import * as React from "react";
import { FlashPlayerModal } from "./FlashPlayerModal";

/**
 * Opens a post's Flash links (marked `data-flash-url` by PostMarkdown) in the Flash player modal
 * instead of navigating. The post body is static HTML, so this listens on the document.
 */
export const FlashLinks: React.FC = () => {
  const [url, setUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button != 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.("a[data-flash-url]");
      const flashUrl = link?.getAttribute("data-flash-url");
      if (!flashUrl) return;
      event.preventDefault();
      setUrl(flashUrl);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return url ? <FlashPlayerModal url={url} onClose={() => setUrl(null)} /> : null;
};
