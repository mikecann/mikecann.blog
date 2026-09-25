import { useState, useEffect } from "react";

function getSize() {
  if (!globalThis.window)
    return {
      innerHeight: 500,
      innerWidth: 300,
      outerHeight: 500,
      outerWidth: 300,
    };

  return {
    innerHeight: window.innerHeight,
    innerWidth: window.innerWidth,
    outerHeight: window.outerHeight,
    outerWidth: window.outerWidth,
  };
}

export function useWindowSize() {
  let [windowSize, setWindowSize] = useState(getSize());

  function handleResize() {
    setWindowSize(getSize());
  }

  useEffect(() => {
    if (globalThis.window) window.addEventListener("resize", handleResize);
    return () => {
      if (globalThis.window) window.removeEventListener("resize", handleResize);
    };
  }, []);

  return windowSize;
}
