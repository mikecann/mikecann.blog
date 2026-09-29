import * as React from "react";
import { useRouter } from "next/router";
import { classes, style } from "typestyle";
import {
  SIGNUP_STATUS_PARAM,
  SUBSCRIBE_ENDPOINT,
  SUBSCRIBE_RESULTS,
  isSubscribeStatus,
  isSuccess,
  rememberSubscribed,
  subscribeToNewsletter,
  type SubscribeResult,
} from "../../utils/newsletter";
import { trackEvent } from "../../utils/analytics";

interface Props {
  /** Which signup form this is (e.g. "post-footer"); becomes a tag on the subscriber in Mailchimp. */
  source: string;
  onSubscribed?: (result: SubscribeResult) => void;
  className?: string;
}

const visuallyHidden = style({
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
});

// Off-screen rather than display:none, which some bots detect and skip.
const honeypot = style({ position: "absolute", left: -10000, top: "auto", width: 1, height: 1 });

const row = style({ display: "flex", flexWrap: "wrap", gap: 8 });

const focusRing = {
  "&:focus-visible": { outline: "2px solid #c2521b", outlineOffset: 2 },
};

const input = style({
  flex: "1 1 200px",
  minWidth: 0,
  padding: "10px 12px",
  // 16px stops iOS Safari zooming the page when the field is focused.
  fontSize: 16,
  fontFamily: "inherit",
  border: "1px solid #bbb",
  borderRadius: 4,
  background: "white",
  $nest: focusRing,
});

// #c2521b is the blog's orange darkened enough for white text to pass WCAG AA (4.65:1).
const button = style({
  flex: "0 0 auto",
  padding: "10px 18px",
  fontSize: 16,
  fontFamily: "inherit",
  fontWeight: 600,
  color: "white",
  background: "#c2521b",
  border: 0,
  borderRadius: 4,
  cursor: "pointer",
  $nest: {
    ...focusRing,
    "&:hover": { background: "#a84410" },
    "&:disabled": { opacity: 0.7, cursor: "progress" },
  },
});

const message = style({ margin: "8px 0 0", fontSize: 14, color: "#5d686f", minHeight: "1em" });
const successMessage = style({ color: "#2e7d32", fontWeight: 600 });

export const SubscribeForm: React.FC<Props> = ({ source, onSubscribed, className }) => {
  const router = useRouter();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [email, setEmail] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<SubscribeResult | null>(null);
  const emailId = React.useId();
  const done = result != null && isSuccess(result.status);

  const showOutcome = (outcome: SubscribeResult, eventProperties?: Record<string, unknown>) => {
    setResult(outcome);
    trackEvent(isSuccess(outcome.status) ? "newsletter_subscribed" : "newsletter_signup_failed", {
      source,
      status: outcome.status,
      ...eventProperties,
    });
    if (isSuccess(outcome.status)) {
      rememberSubscribed();
      onSubscribed?.(outcome);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setResult(null);
    const outcome = await subscribeToNewsletter({ email, source, website });
    setSubmitting(false);
    showOutcome(outcome);
  };

  // If the form was submitted before this page's JavaScript loaded, the browser posted it to the
  // endpoint itself, and the endpoint redirected back here with the status in the URL. Show it, then
  // take it out of the URL so a reload or a shared link doesn't show it again.
  React.useEffect(() => {
    if (!router.isReady) return;
    const { [SIGNUP_STATUS_PARAM]: status, ...query } = router.query;
    if (!isSubscribeStatus(status)) return;
    router
      .replace({ pathname: router.pathname, query }, undefined, { shallow: true, scroll: false })
      .catch(() => {});
    showOutcome(SUBSCRIBE_RESULTS[status], { via: "form-post" });
    containerRef.current?.scrollIntoView({ block: "center" });
  }, [router.isReady]);

  return (
    <div className={className} ref={containerRef}>
      {!done && (
        // method and action only matter if the form is submitted before React takes over; they keep
        // the address out of the URL (a GET would put it in the query string).
        <form method="post" action={SUBSCRIBE_ENDPOINT} onSubmit={onSubmit}>
          <input type="hidden" name="source" value={source} />
          <input type="hidden" name="returnTo" value={router.asPath.split(/[?#]/)[0]} />
          <label htmlFor={emailId} className={visuallyHidden}>
            Email address
          </label>
          <div className={row}>
            <input
              id={emailId}
              className={input}
              type="email"
              name="email"
              required
              maxLength={254}
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
            />
            <button type="submit" className={button} disabled={submitting}>
              {submitting ? "Subscribing…" : "Subscribe"}
            </button>
          </div>
          <div className={honeypot} aria-hidden="true">
            <label>
              Leave this empty
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </label>
          </div>
        </form>
      )}
      <p role="status" className={classes(message, done && successMessage)}>
        {result?.message}
        {result?.fallbackUrl && (
          <>
            {" "}
            <a href={result.fallbackUrl} target="_blank" rel="noopener noreferrer">
              Open Mailchimp&apos;s signup form
            </a>
          </>
        )}
      </p>
    </div>
  );
};
