import * as React from "react";
import { PiChatCircleTextDuotone } from "react-icons/pi";
import { floatAnimation } from "../animations";

interface Props {
  style?: React.CSSProperties;
  strokeColor?: string;
  strokeSize?: string;
  top?: string;
  left?: string;
  floatAnimSize?: number;
}

export const AvatarSpeechBubble: React.FC<Props> = ({
  style,
  strokeColor = "white",
  strokeSize = "2px",
  top = "0px",
  left = "-20px",
  floatAnimSize,
}) => {
  return (
    // A span (not a div) because this sits inside the sidebar's avatar <button>; it's decorative.
    <span aria-hidden style={{ transform: "scale(-1, 1)", position: "absolute", top, left }}>
      <PiChatCircleTextDuotone
        style={{
          zIndex: 1,
          fontSize: "2em",
          color: "#6d6de4",
          filter: `drop-shadow(${strokeSize} 0 0 ${strokeColor}) drop-shadow(0 ${strokeSize} 0 ${strokeColor}) drop-shadow(-${strokeSize} 0 0 ${strokeColor}) drop-shadow(0 -${strokeSize} 0 ${strokeColor})`,
          animation: `${floatAnimation(floatAnimSize)} 5s 1s ease-in-out infinite`,
          ...style,
        }}
      />
    </span>
  );
};
