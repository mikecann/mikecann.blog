import * as React from "react";
import { classes, style } from "typestyle";
import { RiCloseCircleFill } from "react-icons/ri";
import { HorizontalProps } from "gls";
import { Horizontal } from "./utils/gls";

interface Props extends HorizontalProps {
  /** Accessible name for the button, defaults to "Close". */
  ariaLabel?: string;
}

const styles = style({
  // reset default button styling
  appearance: "none",
  border: 0,
  margin: 0,
  padding: 0,
  font: "inherit",
  lineHeight: "inherit",
  // actual styling
  color: "#666",
  cursor: "pointer",
  transition: "all 0.15s ease",
  backgroundColor: "white",
  fontSize: "2.5em",
  borderRadius: "50%",
  // transform: "translate(-50%, -50%)",
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

export const CloseButton: React.FC<Props> = ({ ariaLabel, className, ...rest }) => {
  return (
    <Horizontal
      tag="button"
      type="button"
      aria-label={ariaLabel ?? "Close"}
      verticalAlign="center"
      horizontalAlign="center"
      className={classes(styles, className)}
      {...rest}
    >
      <RiCloseCircleFill aria-hidden="true" focusable="false" />
    </Horizontal>
  );
};
