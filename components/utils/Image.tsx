import * as React from "react";

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string;
  /** Fill the (positioned) parent, like next/image's `fill`. */
  fill?: boolean;
  /** Load straight away at high priority: for the image at the top of the page. */
  preload?: boolean;
};

/**
 * A plain `<img>` with the defaults next/image gave us (lazy loading, async decoding). Image
 * optimisation was always off on this blog, so this renders the same markup next/image did.
 */
const Image: React.FC<Props> = ({ fill, preload, style, ...rest }) => (
  <img
    loading={preload ? "eager" : "lazy"}
    fetchPriority={preload ? "high" : undefined}
    decoding="async"
    style={
      fill
        ? {
            position: "absolute",
            height: "100%",
            width: "100%",
            inset: 0,
            color: "transparent",
            ...style,
          }
        : { color: "transparent", ...style }
    }
    {...rest}
  />
);

export default Image;
