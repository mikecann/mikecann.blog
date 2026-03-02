import * as React from "react";
import { Modal } from "../Modal";
import { CloseButton } from "../CloseButton";

interface Props {
  url: string;
  onClose: () => void;
}

const isSwfUrl = (url: string): boolean => /\.swf(?:$|[?#])/i.test(url);
const isHtmlUrl = (url: string): boolean => /\.html?(?:$|[?#])/i.test(url);

const extractSwfFromWrapperHtml = (html: string): string | null => {
  const patterns = [
    /embedSWF\(\s*["']([^"']+\.swf(?:\?[^"']*)?)["']/i,
    /<param[^>]+name=["']movie["'][^>]+value=["']([^"']+\.swf(?:\?[^"']*)?)["']/i,
    /<object[^>]+data=["']([^"']+\.swf(?:\?[^"']*)?)["']/i,
    /<embed[^>]+src=["']([^"']+\.swf(?:\?[^"']*)?)["']/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (!match?.[1]) continue;
    if (/playerProductInstall\.swf/i.test(match[1])) continue;
    return match[1];
  }

  return null;
};

export const FlashPlayerModal: React.FC<Props> = ({ url, onClose }) => {
  const normalizedUrl = React.useMemo(() => {
    // Some old links point to a project folder, serve index.html explicitly.
    if (/^\/(?:projects|flash|DumpingGround)\//.test(url) && !/\.[a-z0-9]{2,6}(?:$|[?#])/i.test(url)) {
      return `${url.replace(/\/+$/, "")}/index.html`;
    }
    return url;
  }, [url]);

  const [resolvedUrl, setResolvedUrl] = React.useState(normalizedUrl);
  const [isResolving, setIsResolving] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    const resolveWrapperToSwf = async () => {
      setResolvedUrl(normalizedUrl);

      if (!isHtmlUrl(normalizedUrl)) return;
      if (!/^\/(?:projects|flash|DumpingGround)\//.test(normalizedUrl)) return;

      setIsResolving(true);
      try {
        const response = await fetch(normalizedUrl);
        if (!response.ok) return;

        const html = await response.text();
        const swfPath = extractSwfFromWrapperHtml(html);
        if (!swfPath) return;

        const absoluteSwfUrl = new URL(swfPath, new URL(normalizedUrl, window.location.origin)).toString();
        const sameOriginSwfUrl = absoluteSwfUrl.replace(window.location.origin, "");
        if (!cancelled) setResolvedUrl(sameOriginSwfUrl);
      } catch {
        // Fallback to the original URL if we fail to resolve wrapper HTML.
      } finally {
        if (!cancelled) setIsResolving(false);
      }
    };

    resolveWrapperToSwf();
    return () => {
      cancelled = true;
    };
  }, [normalizedUrl]);

  const showSwfObject = isSwfUrl(resolvedUrl);

  React.useEffect(() => {
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keyup", onKeyUp);
    return () => window.removeEventListener("keyup", onKeyUp);
  }, [onClose]);

  return (
    <Modal
      onClose={onClose}
      style={{
        width: "min(1200px, calc(100vw - 40px))",
        height: "min(780px, calc(100vh - 40px))",
        padding: 0,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <CloseButton style={{ position: "absolute", top: 8, right: 8, zIndex: 2 }} onClick={onClose} />
      <div style={{ height: "100%", width: "100%", backgroundColor: "#111" }}>
        {isResolving ? (
          <div
            style={{
              color: "white",
              height: "100%",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Loading Flash content...
          </div>
        ) : null}
        {showSwfObject ? (
          <object
            data={resolvedUrl}
            type="application/x-shockwave-flash"
            width="100%"
            height="100%"
            aria-label="Flash player"
            style={{ display: isResolving ? "none" : "block" }}
          >
            <embed
              src={resolvedUrl}
              type="application/x-shockwave-flash"
              width="100%"
              height="100%"
            />
          </object>
        ) : (
          <iframe
            src={resolvedUrl}
            title="Flash content"
            style={{ border: 0, width: "100%", height: "100%", display: isResolving ? "none" : "block" }}
            allowFullScreen
          />
        )}
      </div>
    </Modal>
  );
};
