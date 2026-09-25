import { Vertical } from "../../components/utils/gls";
import { ResponsiveSidebarLayouts } from "../../components/layout/ResponsiveSidebarLayouts";
import Head from "next/head";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Items } from "../../components/items/Items";
import Image from "next/image";

// The StashIt project's Convex deployment (not this blog's). One client for the whole app, so
// visiting /stash repeatedly doesn't leak WebSocket connections. It only connects when first used.
const stashClient = new ConvexReactClient(
  process.env.NODE_ENV == "development"
    ? "https://clear-rabbit-84.convex.cloud"
    : "https://festive-sparrow-314.convex.cloud",
);

const Page = () => {
  return (
    <ConvexProvider client={stashClient}>
      <ResponsiveSidebarLayouts>
        <Head>
          <title key="title">stash - mikecann.blog</title>
        </Head>
        <Vertical className="stash-page" style={{ marginBottom: 20, overflowX: "hidden" }}>
          <Image
            src="/images/stashit-logo.png"
            alt="StashIt logo"
            width={200}
            height={60}
            style={{ height: "auto" }}
          />
          <h1 style={{ margin: "0px" }}>My Stash</h1>
          <p>
            Articles that I have been reading lately.. This is part of my{" "}
            <a href="https://mikecann.blog/posts/introducing-stashit">StashIt</a> project. Read more
            about it here:{" "}
            <a href="https://mikecann.blog/posts/introducing-stashit">
              https://mikecann.blog/posts/introducing-stashit
            </a>
          </p>
          <Items />
        </Vertical>
      </ResponsiveSidebarLayouts>
    </ConvexProvider>
  );
};

export default Page;
