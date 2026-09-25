import { Horizontal } from "../../components/utils/gls";
import Link from "next/link";
import * as React from "react";
import { classes, style } from "typestyle";

interface Props {
  icon: React.ReactNode;
  /** Visible text label */
  label?: string;
  /** Accessible name, required when there is no visible `label` (icon only) */
  ariaLabel?: string;
  href?: string;
  onClick?: () => any;
}

const styles = style({
  opacity: 0.8,
  cursor: "pointer",
  color: "rgba(255,255,255,0.8)",
  $nest: {
    "&:hover": {
      opacity: 1,
    },
  },
});

const focusStyles = style({
  borderRadius: 4,
  $nest: {
    "&:focus-visible": {
      outline: "2px solid white",
      outlineOffset: 4,
    },
  },
});

const actionStyles = style({
  appearance: "none",
  background: "none",
  border: 0,
  margin: 0,
  font: "inherit",
  lineHeight: "inherit",
  padding: 0,
  textAlign: "left",
});

export const PageButton: React.FC<Props> = ({ onClick, icon, label, ariaLabel, href = "" }) => {
  // Icon-only buttons need an explicit accessible name (also shown as a tooltip)
  const accessibleName = label ? undefined : ariaLabel;

  const decorativeIcon = React.isValidElement<React.SVGAttributes<SVGElement>>(icon)
    ? React.cloneElement(icon, { "aria-hidden": true, focusable: "false" })
    : icon;

  const content = (actionOnly: boolean) => (
    <Horizontal
      tag={actionOnly ? "button" : undefined}
      type={actionOnly ? "button" : undefined}
      aria-label={actionOnly ? accessibleName : undefined}
      title={actionOnly ? accessibleName : undefined}
      onClick={actionOnly ? onClick : undefined}
      className={classes(styles, actionOnly && actionStyles, actionOnly && focusStyles)}
      verticalAlign="center"
      spacing={7}
    >
      {decorativeIcon} {label && <span>{label}</span>}
    </Horizontal>
  );

  return href ? (
    <Link href={href} className={focusStyles} aria-label={accessibleName} title={accessibleName}>
      {content(false)}
    </Link>
  ) : (
    content(true)
  );
};
