import * as React from "react";
import { style } from "typestyle";
import { RiCloseCircleFill } from "react-icons/ri";
import { HorizontalProps } from "gls";
import { Horizontal } from "./utils/gls";

interface Props extends HorizontalProps {}

const styles = style({
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
  },
});

export const CloseButton: React.FC<Props> = ({ ...rest }) => {
  return (
    <Horizontal verticalAlign="center" horizontalAlign="center" className={styles} {...rest}>
      <RiCloseCircleFill />
    </Horizontal>
  );
};
