import Link from "next/link";
import * as React from "react";
import { FaHome, FaSearch } from "react-icons/fa";
import { IconButton } from "../IconButton";
import { SearchModal } from "../searchModal/SearchModal";
import { Horizontal } from "../utils/gls";
import { StretchSpacer } from "gls";

interface Props {}

export const TopNavbar: React.FC<Props> = () => {
  const [shouldShow, setShouldShow] = React.useState(true);
  const [searchVisible, setSearchVisible] = React.useState(false);
  const lastScrollY = React.useRef(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isAtTop = currentScrollY === 0;
      const isScrollingUp = currentScrollY < lastScrollY.current;

      setShouldShow(isAtTop || isScrollingUp);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <Horizontal
        tag="nav"
        aria-label="Main"
        verticalAlign="center"
        // The bar fades out while scrolling down; bring it back if a keyboard user tabs into it so
        // focus never lands on an invisible control.
        onFocus={() => setShouldShow(true)}
        style={{
          width: "100%",
          backgroundColor: "white",
          height: 60,
          position: "fixed",
          zIndex: 10,
          paddingLeft: 20,
          paddingRight: 20,
          fontSize: "1.5em",
          borderBottom: "2px solid #ffc7ad",
          boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
          opacity: shouldShow ? 1 : 0,
          transition: "all 0.3s linear",
          pointerEvents: shouldShow ? "auto" : "none",
        }}
      >
        <IconButton href="/" aria-label="Home" title="Home">
          <FaHome aria-hidden="true" focusable="false" />
        </IconButton>

        <StretchSpacer />

        <div
          className="navbar-title"
          style={{ fontSize: "1.2rem", fontWeight: "bold", opacity: 0.5, color: "#333" }}
        >
          <Link href="/">mikecann.blog</Link>
        </div>

        <StretchSpacer />

        <IconButton
          aria-label="Search"
          title="Search"
          aria-haspopup="dialog"
          onClick={() => setSearchVisible(true)}
        >
          <FaSearch aria-hidden="true" focusable="false" />
        </IconButton>
      </Horizontal>

      {searchVisible && <SearchModal onClose={() => setSearchVisible(false)} />}
    </>
  );
};
