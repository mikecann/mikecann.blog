import * as React from "react";
import Link from "next/link";
import { classes, style } from "typestyle";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** When omitted the IconButton renders a `<button type="button">`. */
  href?: undefined;
};

type LinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  /** When provided the IconButton renders a `next/link` to this href instead of a button. */
  href: string;
};

/**
 * Icon-only buttons have no visible text, so always pass an `aria-label` (and optionally a
 * `title`) describing the action, and mark the icon itself as `aria-hidden`.
 */
type Props = ButtonProps | LinkProps;

const styles = style({
  // reset default button styling so it looks identical to the previous plain div
  appearance: "none",
  background: "none",
  border: 0,
  margin: 0,
  font: "inherit",
  lineHeight: "inherit",
  textAlign: "inherit",
  // actual styling
  display: "block",
  padding: 5,
  color: "#666",
  cursor: "pointer",
  transition: "all 0.15s ease",
  borderRadius: 4,
  $nest: {
    "&:hover": {
      color: "#f1773c",
    },
    "&:focus-visible": {
      outline: "2px solid #f1773c",
      outlineOffset: 2,
    },
  },
});

export const IconButton: React.FC<Props> = (props) => {
  if (props.href !== undefined) {
    const { href, className, children, ...rest } = props;
    return (
      <Link href={href} className={classes(styles, className)} {...rest}>
        {children}
      </Link>
    );
  }

  const { className, children, type = "button", ...rest } = props;
  return (
    <button type={type} className={classes(styles, className)} {...rest}>
      {children}
    </button>
  );
};
