import { media, style } from "typestyle";

export const postContainerClass = style(
  {},
  media({ minWidth: 0, maxWidth: 500 }, { padding: 10 }),
  media({ minWidth: 501 }, { padding: 40 }),
);
