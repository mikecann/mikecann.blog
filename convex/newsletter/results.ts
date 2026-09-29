// The blog imports this file too (utils/newsletter.ts), so keep it free of server-only imports.

/** Mailchimp's own hosted signup form, offered when we can't add someone through the API. */
export const HOSTED_SIGNUP_FORM_URL =
  "https://epicshrimp.us3.list-manage.com/subscribe?u=aaed03be8d4e6cc7ca902a572&id=3c8f7e6e85";

export type SubscribeStatus =
  "confirm_email" | "already_subscribed" | "invalid_email" | "rate_limited" | "error";

export type SubscribeResult = {
  status: SubscribeStatus;
  message: string;
  /** Where to go instead, when signing up here isn't possible. */
  fallbackUrl?: string;
};

/** The usual result for each status. */
export const SUBSCRIBE_RESULTS = {
  confirm_email: {
    status: "confirm_email",
    message: "Almost done! Check your inbox and click the link to confirm your subscription.",
  },
  already_subscribed: {
    status: "already_subscribed",
    message:
      "You're already on the list, thanks! If you never got the confirmation email, you can " +
      "sign up again on Mailchimp's form.",
    fallbackUrl: HOSTED_SIGNUP_FORM_URL,
  },
  invalid_email: { status: "invalid_email", message: "That email address doesn't look right." },
  rate_limited: {
    status: "rate_limited",
    message: "Too many signup attempts right now. Please try again in a little while.",
  },
  error: {
    status: "error",
    message: "Sorry, something went wrong. Please try Mailchimp's signup form instead.",
    fallbackUrl: HOSTED_SIGNUP_FORM_URL,
  },
} as const satisfies { [S in SubscribeStatus]: SubscribeResult & { status: S } };

export const isSubscribeStatus = (value: unknown): value is SubscribeStatus =>
  typeof value == "string" && Object.hasOwn(SUBSCRIBE_RESULTS, value);

/**
 * A signup form submitted before the page's JavaScript has loaded posts to the endpoint as a plain
 * HTML form. The endpoint then redirects back to the page with the status in this query parameter.
 */
export const SIGNUP_STATUS_PARAM = "newsletter";
