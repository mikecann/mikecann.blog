import { Horizontal } from "../../components/utils/gls";
import Link from "next/link";
import * as React from "react";
import { style } from "typestyle";

interface Props {
  icon: React.ReactNode;
  label?: string;
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

const actionStyles = style({
  appearance: "none",
  background: "none",
  border: 0,
  font: "inherit",
  padding: 0,
  textAlign: "left",
});

export const PageButton: React.FC<Props> = ({ onClick, icon, label, ariaLabel, href = "" }) => {
  const content = (actionOnly: boolean) => (
    <Horizontal
      tag={actionOnly ? "button" : undefined}
      type={actionOnly ? "button" : undefined}
      aria-label={actionOnly && !label ? ariaLabel : undefined}
      onClick={actionOnly ? onClick : undefined}
      className={`${styles} ${actionOnly ? actionStyles : ""}`}
      verticalAlign="center"
      spacing={7}
    >
      {icon} {label && <div>{label}</div>}
    </Horizontal>
  );

  return href ? <Link href={href}>{content(false)}</Link> : content(true);
};
