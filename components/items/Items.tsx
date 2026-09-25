import { Grid, Horizontal, Vertical } from "../../components/utils/gls";
import { PostTeaser } from "../PostTeaser";
import { ResponsiveSidebarLayouts } from "../layout/ResponsiveSidebarLayouts";
import Head from "next/head";
import { PostWithContent } from "../../scripts/posts";
import { usePaginatedQuery, useQuery } from "convex/react";
import Link from "next/link";
import { makeFunctionReference } from "convex/server";
import { style, media } from "typestyle";
import { formatDistance } from "date-fns";
import { LuBookOpenCheck } from "react-icons/lu";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

type Props = {};

type Item = {
  _id: string;
  url: string;
  headerImageUrl?: string;
  title: string;
  description: string;
  status:
    | {
        kind: "unread";
      }
    | { kind: "archived"; archivedAt: number };
};

type StatusKind = Item["status"]["kind"];

const defaultHeaderImageUrl = `https://images.unsplash.com/photo-1617050318658-a9a3175e34cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80`;

const itemStyle = style(
  {
    cursor: "pointer",
    transition: "all 0.2s ease",
    filter: "grayscale(0.5)",
    border: "1px solid rgba(0,0,0,0.2)",
    borderRadius: "6px",
    overflow: "hidden",
    $nest: {
      "&:hover": {
        transform: "translateY(-5px)",
        boxShadow: "0 5px 15px 0px rgba(0, 0, 0, 0.2)",
        filter: "grayscale(0)",
      },
    },
  },
  media({ minWidth: 0, maxWidth: 500 }, { width: "100%", maxWidth: "100%" }),
  media({ minWidth: 501 }, { maxWidth: "280px" }),
);

export const Items = ({}: Props) => {
  const [statusKind] = useState<StatusKind>("archived");
  const { isLoading, loadMore, results, status } = usePaginatedQuery(
    makeFunctionReference<"query">("items:listForMikesBlogPaginated"),
    { statusKind },
    { initialNumItems: 50 },
  );

  const { ref, inView, entry } = useInView({
    delay: 500,
  });

  const canLoadMore = status == "CanLoadMore";

  useEffect(() => {
    if (!inView) return;
    if (!canLoadMore) return;
    console.log(`loading more..`);
    loadMore(50);
  }, [inView, status]);

  const items: Item[] = results;

  if (!items) return <div>loading..</div>;

  return (
    <>
      <div style={{ marginBottom: "10px", opacity: 0.5 }}>(showing 50 latest items)</div>
      <div style={{ display: "flex", gap: "1em", flexWrap: "wrap", paddingRight: "20px" }}>
        {items.map((item) => (
          <Link key={item._id} href={item.url}>
            <div className={itemStyle} key={item._id}>
              <img
                style={{
                  width: "100%",
                  height: "150px",
                  objectFit: "cover",
                }}
                src={item.headerImageUrl ?? defaultHeaderImageUrl}
                alt=""
                loading="lazy"
                decoding="async"
              />
              <Vertical style={{ padding: "0px 10px 10px 10px" }}>
                <h3
                  style={{
                    marginBottom: "5px",
                    marginTop: "0px",
                  }}
                >
                  {item.title}
                </h3>
                <div style={{ opacity: 0.5, fontSize: "0.9em" }}>{item.url}</div>
                <Horizontal
                  style={{
                    opacity: 0.9,
                    fontSize: "0.9em",
                    background: "rgba(0,0,0,0.03)",
                    borderRadius: "5px",
                    padding: "5px",
                    marginTop: "10px",
                  }}
                  spacing={5}
                  verticalAlign="center"
                >
                  <LuBookOpenCheck />
                  <div>
                    Read{" "}
                    {item.status.kind == "archived"
                      ? formatDistance(item.status.archivedAt, new Date(), { addSuffix: true })
                      : null}
                  </div>
                </Horizontal>
              </Vertical>
            </div>
          </Link>
        ))}
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "5px 10px 10px 10px",
            height: "50px",
            marginTop: "50px",
            opacity: 0.3,
          }}
          ref={ref}
        >
          {canLoadMore ? `Loading More..` : `No more items!`}
        </div>
      </div>
    </>
  );
};
