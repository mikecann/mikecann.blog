import * as React from "react";
import { style } from "typestyle";

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

// globals.css removes the outline from all inputs, give the submit button a visible keyboard focus ring
const submitStyles = style({
  $nest: {
    "&:focus-visible": {
      outline: "2px solid #f1773c",
      outlineOffset: 2,
    },
  },
});

export function MailchimpSignupForm() {
  const [email, setEmail] = React.useState("");
  const emailId = React.useId();
  return (
    <div>
      <form
        action="https://epicshrimp.us3.list-manage.com/subscribe/post?u=aaed03be8d4e6cc7ca902a572&amp;id=3c8f7e6e85"
        method="post"
        id="mc-embedded-subscribe-form"
        name="mc-embedded-subscribe-form"
        target="_blank"
      >
        <div style={{ display: "flex", marginBottom: 20 }}>
          <label htmlFor={emailId} className={visuallyHidden}>
            Email address
          </label>
          <input
            id={emailId}
            style={{ width: "100%", marginRight: 10 }}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            name="EMAIL"
          />
          <input type="submit" value="Subscribe" name="subscribe" className={submitStyles} />
        </div>
      </form>
    </div>
  );
}
