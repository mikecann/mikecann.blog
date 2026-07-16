import { Horizontal } from "../../components/utils/gls";
import Link from "next/link";
import * as React from "react";
import { style } from "typestyle";

interface Props {
  icon: React.ReactNode;
  label?: string;
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

export const PageButton: React.FC<Props> = ({ onClick, icon, label, href = "" }) => {
  const content = (
    <Horizontal onClick={onClick} className={styles} verticalAlign="center" spacing={7}>
      {icon} {label && <div>{label}</div>}
    </Horizontal>
  );

  return href ? <Link href={href}>{content}</Link> : content;
};
