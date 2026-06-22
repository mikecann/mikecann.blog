import { Grid, Vertical } from "../../components/utils/gls";
import * as React from "react";
import { style } from "typestyle";
import { floatAnimation } from "../animations";
import { AvatarSpeechBubble } from "./AvatarSpeechBubble";

interface Props {
  onOpen: () => void;
}

const cardStyle = style({
  position: "fixed",
  right: "10px",
  bottom: "10px",
  animation: `${floatAnimation()} 6s ease-in-out infinite`,
  cursor: "pointer",
  zIndex: 1,
  pointerEvents: "initial",
});

export const MikebotMinimizedView: React.FC<Props> = ({ onOpen }) => {
  const [shouldShow, setShouldShow] = React.useState(true);
  const isPostsPage = window.location.pathname.includes("/posts");
  const lastScrollY = React.useRef(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isNearTop = currentScrollY === 0;
      const isNearBottom =
        document.documentElement.scrollHeight - (currentScrollY + window.innerHeight) <= 500;
      const isScrollingUp = currentScrollY < lastScrollY.current;
      const isWide = window.innerWidth >= 900;

      //console.log({ isPostsPage, isWide, isNearTop, isNearBottom, isScrollingUp });

      setShouldShow(!isPostsPage || isWide || isNearTop || isNearBottom || isScrollingUp);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isPostsPage]);

  return (
    <Vertical
      className={cardStyle}
      onClick={onOpen}
      style={{
        opacity: shouldShow ? 1 : 0,
        transition: "all 0.3s linear",
        pointerEvents: shouldShow ? "auto" : "none",
      }}
    >
      <img
        alt="profile picture of me mike cann"
        style={{
          borderRadius: "50%",
          boxShadow: "0 5px 15px 0px rgba(0, 0, 0, 0.6)",
        }}
        width={60}
        height={60}
        src="/images/me.webp"
      />
      <AvatarSpeechBubble />
    </Vertical>
  );
};
