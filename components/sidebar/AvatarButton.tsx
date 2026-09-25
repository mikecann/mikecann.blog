import * as React from "react";
import { style } from "typestyle";
import { onOpenMikebot } from "../mikebot/signals";
import { AvatarSpeechBubble } from "../mikebot/AvatarSpeechBubble";
import { floatAnimation } from "../animations";

interface Props {
  /** Width and height of the avatar image in px */
  size: number;
  /** How far (px) the avatar floats up and down */
  floatAnimSize?: number;
  bubbleProps?: React.ComponentProps<typeof AvatarSpeechBubble>;
}

const label = "Chat with Mikebot";

const styles = style({
  // reset default button styling so it looks identical to the previous plain div
  appearance: "none",
  background: "none",
  border: 0,
  margin: 0,
  padding: 0,
  font: "inherit",
  lineHeight: "inherit",
  color: "inherit",
  textAlign: "inherit",
  // actual styling
  display: "block",
  position: "relative",
  cursor: "pointer",
  $nest: {
    // draw the focus ring around the round avatar rather than the button's box
    "&:focus-visible": {
      outline: "none",
    },
    "&:focus-visible img": {
      outline: "3px solid white",
      outlineOffset: 3,
    },
  },
});

/**
 * The profile picture at the top of the sidebars, clicking it opens Mikebot.
 */
export const AvatarButton: React.FC<Props> = ({ size, floatAnimSize, bubbleProps }) => (
  <button
    type="button"
    className={styles}
    aria-label={label}
    title={label}
    onClick={() => onOpenMikebot.dispatch("")}
    style={{ animation: `${floatAnimation(floatAnimSize)} 6s ease-in-out infinite` }}
  >
    <img
      alt="profile picture of me mike cann"
      style={{
        borderRadius: "50%",
        boxShadow: "0 5px 15px 0px rgba(0, 0, 0, 0.6)",
      }}
      width={size}
      height={size}
      src="/images/me.webp"
    />
    <AvatarSpeechBubble {...bubbleProps} />
  </button>
);
