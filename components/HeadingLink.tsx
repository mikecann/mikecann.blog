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

export const HeadingLink: React.FC<Props> = ({ slug, node, ...rest }) => {
  const [isOver, setIsOver] = React.useState(false);
  return (
    <>
      {isOver ? (
        <FaLink
          style={{
            position: "absolute",
            left: "-1.3em",
            top: "0.4em",
            fontSize: "0.7em",
            opacity: 0.1,
          }}
        />
      ) : null}
      <a
        href={`#${slug}`}
        onMouseOver={() => setIsOver(true)}
        onMouseLeave={() => setIsOver(false)}
        {...rest}
      />
    </>
  );
};
