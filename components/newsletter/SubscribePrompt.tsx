import * as React from "react";
import { keyframes, media, style } from "typestyle";
import { SubscribeForm } from "./SubscribeForm";
import { rememberPromptDismissed, shouldOfferSubscribePrompt } from "../../utils/newsletter";
import { trackEvent } from "../../utils/analytics";

/** Only offer once the reader has clearly engaged with the post. */
const MIN_TIME_ON_PAGE_MS = 15_000;
const MIN_SCROLL_FRACTION = 0.5;
const HIDE_AFTER_SUBSCRIBING_MS = 6_000;

interface Props {
  /** id of the in-page signup form; once that has been on screen the prompt isn't needed. */
  inlineFormId: string;
}

const slideIn = keyframes({
  from: { transform: "translateY(24px)", opacity: 0 },
  to: { transform: "translateY(0)", opacity: 1 },
});

const card = style(
  {
    position: "fixed",
    left: 16,
    bottom: 16,
    zIndex: 50,
    width: 300,
    // Leaves room for the Mikebot avatar in the bottom-right corner.
    maxWidth: "calc(100vw - 100px)",
    boxSizing: "border-box",
    padding: "16px 16px 8px",
    background: "white",
    borderRadius: 8,
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.18)",
    animation: `${slideIn} 0.3s ease-out`,
    $nest: {
      "@media (prefers-reduced-motion: reduce)": { animation: "none" },
    },
  },
  media({ maxWidth: 500 }, { left: 8, bottom: 8, padding: "12px 12px 4px" }),
);

const heading = style({ margin: "0 28px 6px 0", fontSize: 18, lineHeight: 1.3 });
const blurb = style({ margin: "0 0 12px", fontSize: 14, color: "#5d686f" });

const closeButton = style({
  position: "absolute",
  top: 6,
  right: 6,
  width: 32,
  height: 32,
  padding: 0,
  fontSize: 22,
  lineHeight: 1,
  color: "#5d686f",
  background: "none",
  border: 0,
  borderRadius: 4,
  cursor: "pointer",
  $nest: {
    "&:hover": { color: "#222" },
    "&:focus-visible": { outline: "2px solid #c2521b", outlineOffset: 2 },
  },
});

/**
 * A small, dismissible "get new posts by email" card that slides in on post pages once the reader
 * is halfway through. It never covers the post, doesn't steal focus, and stays away for 30 days
 * once dismissed (and for good once they subscribe).
 */
export const SubscribePrompt: React.FC<Props> = ({ inlineFormId }) => {
  const [visible, setVisible] = React.useState(false);
  const headingId = React.useId();

  React.useEffect(() => {
    if (!shouldOfferSubscribePrompt()) return;

    const startedAt = Date.now();
    let settled = false;

    const inlineForm = document.getElementById(inlineFormId);
    const observer =
      inlineForm && "IntersectionObserver" in window
        ? new IntersectionObserver((entries) => {
            if (!entries.some((entry) => entry.isIntersecting)) return;
            // They've reached the form at the end of the post; that's enough asking.
            settled = true;
            setVisible(false);
          })
        : null;
    if (inlineForm) observer?.observe(inlineForm);

    const check = () => {
      if (settled) return;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = scrollable > 0 ? window.scrollY / scrollable : 1;
      if (Date.now() - startedAt < MIN_TIME_ON_PAGE_MS || scrolled < MIN_SCROLL_FRACTION) return;
      settled = true;
      setVisible(true);
      trackEvent("newsletter_prompt_shown");
    };

    window.addEventListener("scroll", check, { passive: true });
    const timer = window.setTimeout(check, MIN_TIME_ON_PAGE_MS);
    return () => {
      window.removeEventListener("scroll", check);
      window.clearTimeout(timer);
      observer?.disconnect();
    };
  }, [inlineFormId]);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    rememberPromptDismissed();
    trackEvent("newsletter_prompt_dismissed");
  };

  return (
    <aside
      className={card}
      aria-labelledby={headingId}
      onKeyDown={(e) => {
        if (e.key == "Escape") dismiss();
      }}
    >
      <button type="button" className={closeButton} onClick={dismiss} aria-label="No thanks">
        ×
      </button>
      <h2 id={headingId} className={heading}>
        Enjoying this post?
      </h2>
      <p className={blurb}>
        Get the next one in your inbox. About one post a month, no spam, unsubscribe any time.
      </p>
      <SubscribeForm
        source="post-prompt"
        onSubscribed={() => window.setTimeout(() => setVisible(false), HIDE_AFTER_SUBSCRIBING_MS)}
      />
    </aside>
  );
};
