import { useEffect, useState } from "react";

type ScriptStatus = "idle" | "loading" | "ready" | "error";

/**
 * Injects the utterances comments script into the element referenced by `ref`.
 *
 * Borrowed from: https://imkarthikeyans.hashnode.dev/how-to-add-comments-using-utterances-to-your-nextjs-blog
 */
const useScript = ({
  url,
  theme,
  issueTerm,
  repo,
  label,
  ref,
}: {
  url: string;
  theme: string;
  issueTerm: string;
  label: string;
  repo: string;
  ref: React.RefObject<HTMLElement | null>;
}): ScriptStatus => {
  const [status, setStatus] = useState<ScriptStatus>(url ? "loading" : "idle");

  useEffect(() => {
    if (!url) {
      setStatus("idle");
      return;
    }

    const container = ref.current;
    if (!container) return;

    setStatus("loading");

    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("theme", theme);
    script.setAttribute("issue-term", issueTerm);
    script.setAttribute("repo", repo);
    script.setAttribute("label", label);

    const onScriptEvent = (event: Event) => setStatus(event.type === "load" ? "ready" : "error");
    script.addEventListener("load", onScriptEvent);
    script.addEventListener("error", onScriptEvent);

    container.appendChild(script);

    return () => {
      script.removeEventListener("load", onScriptEvent);
      script.removeEventListener("error", onScriptEvent);
      // Remove the script and anything it injected (utterances adds an iframe), so a re-run or a
      // remount for another post starts from an empty container.
      script.remove();
      container.replaceChildren();
    };
  }, [url, theme, issueTerm, repo, label, ref]);

  return status;
};

export default useScript;
