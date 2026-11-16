import * as React from "react";
import { FaLink } from "react-icons/fa";

interface Props extends React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLAnchorElement>,
  HTMLAnchorElement
> {
  slug: string;
  /** react-markdown's AST node; accepted so it never ends up as a DOM attribute. */
  node?: unknown;
}

/**
 * A heading's text as a link to itself. A faint link icon shows beside it on hover; that's done in
 * CSS (`.heading-link-icon` in globals.css) so post pages need no JavaScript for it.
 */
export const HeadingLink: React.FC<Props> = ({ slug, node, ...rest }) => (
  <>
    <a href={`#${slug}`} {...rest} />
    <FaLink className="heading-link-icon" aria-hidden="true" focusable="false" />
  </>
);
