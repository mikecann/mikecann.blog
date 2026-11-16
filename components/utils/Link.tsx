import * as React from "react";

/** A plain link. Every page is a static HTML file, so there's no client-side routing to hook into. */
const Link = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  (props, ref) => <a ref={ref} {...props} />,
);

export default Link;
