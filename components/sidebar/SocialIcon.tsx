import Link from "next/link";
import * as React from "react";
import { style } from "typestyle";

interface Props {
  href: string;
  /** Accessible name for the icon-only link, e.g. "GitHub" (also shown as a tooltip) */
  label?: string;
  children?: React.ReactElement<React.SVGAttributes<SVGElement>>;
}

const styles = style({
  fontSize: "1.4em",
  opacity: 0.8,
  cursor: "pointer",
  color: "white",
  borderRadius: 2,
  $nest: {
    "&:hover, &:focus-visible": {
      opacity: 1,
      color: "white",
    },
    "&:focus-visible": {
      outline: "2px solid white",
      outlineOffset: 2,
    },
  },
});

export const SocialIcon: React.FC<Props> = ({ children, href, label }) => {
  // mailto: etc. shouldn't open a blank tab, only web links open in a new one
  const opensNewTab = /^https?:\/\//.test(href);
  return (
    <Link
      className={styles}
      href={href}
      target={opensNewTab ? "_blank" : undefined}
      rel={opensNewTab ? "noopener noreferrer" : undefined}
      aria-label={label && opensNewTab ? `${label} (opens in a new tab)` : label}
      title={label}
    >
      {children && React.cloneElement(children, { "aria-hidden": true, focusable: "false" })}
    </Link>
  );
};
