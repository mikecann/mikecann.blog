import React, { ReactNode } from "react";

type Props = {
  children?: ReactNode;
};

const Layout = ({ children }: Props) => (
  <div style={{ width: "100%", height: "100%" }}>{children}</div>
);

export default Layout;
