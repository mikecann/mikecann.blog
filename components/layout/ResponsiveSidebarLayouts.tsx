import * as React from "react";
import { style } from "typestyle";
import Layout from "./Layout";
import { Horizontal, Vertical } from "../utils/gls";
import { MobileSidebar } from "../sidebar/MobileSidebar";
import { TabletSidebar } from "../sidebar/TabletSidebar";
import { DesktopSidebar } from "../sidebar/DesktopSidebar";

interface Props {
  children?: React.ReactNode;
}

const mobileQuery = "@media (max-width: 769px)";
const tabletQuery = "@media (min-width: 770px) and (max-width: 999px)";
const desktopQuery = "@media (min-width: 1000px)";

const showOnly = (query: string) =>
  style({
    display: "none",
    $nest: {
      [query]: {
        display: `unset`,
      },
    },
  });

const mobileClassName = showOnly(mobileQuery);
const tabletClassName = showOnly(tabletQuery);
const desktopClassName = showOnly(desktopQuery);

// Leaves room for the fixed-position sidebar of the current breakpoint.
const contentClassName = style({
  $nest: {
    [mobileQuery]: { padding: "10px 0px 40px 80px" },
    [tabletQuery]: { padding: "10px 0px 40px 240px" },
    [desktopQuery]: { padding: "10px 10px 40px 450px" },
  },
});

/**
 * Page chrome with a sidebar that adapts to the viewport. The page content is rendered once;
 * only the (fixed-position) sidebars are switched with CSS media queries so the server-rendered
 * HTML is correct at every size.
 */
export const ResponsiveSidebarLayouts: React.FC<Props> = ({ children }) => {
  return (
    <Layout>
      <Horizontal height="100%">
        <div className={mobileClassName}>
          <MobileSidebar />
        </div>
        <div className={tabletClassName}>
          <TabletSidebar />
        </div>
        <div className={desktopClassName}>
          <DesktopSidebar />
        </div>

        <Vertical width="100%" className={contentClassName} spacing={40}>
          {children}
        </Vertical>
      </Horizontal>
    </Layout>
  );
};
