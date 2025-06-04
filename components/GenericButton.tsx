import * as React from "react";
import { style } from "typestyle";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const buttonStyle = style({
  padding: "7px 16px",
  borderRadius: "6px",
  background: "#e0e7ef",
  color: "#2d3748",
  fontWeight: 500,
  fontSize: "0.95em",
  border: "none",
  cursor: "pointer",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  transition: "background 0.2s, box-shadow 0.2s, transform 0.1s",
  outline: "none",
  $nest: {
    "&:hover, &:focus": {
      background: "#d1dae7",
      boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
      transform: "translateY(-1px)",
    },
    "&:active": {
      background: "#bfc9d9",
      transform: "translateY(1px)",
    },
    "&[disabled]": {
      opacity: 0.6,
      cursor: "not-allowed",
      boxShadow: "none",
    },
  },
});

export const GenericButton: React.FC<Props> = ({ children, ...rest }) => (
  <button className={buttonStyle} {...rest}>
    {children}
  </button>
);
