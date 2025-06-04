import { PaginationStatus } from "convex/react";
import * as React from "react";
import { exhaustiveCheck } from "../../../essentials/misc/misc";
import { GenericButton } from "../../GenericButton";

interface Props {
  status: PaginationStatus;
  loadMore: (n: number) => void;
}

export const LoadMoreMessages: React.FC<Props> = ({ status, loadMore }) => {
  if (status == "LoadingMore")
    return <div style={{ textAlign: "center", opacity: 0.6, marginBottom: 8 }}>Loading more…</div>;

  if (status === "CanLoadMore")
    return (
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <GenericButton onClick={() => loadMore(10)}>Load more messages</GenericButton>
      </div>
    );

  if (status === "LoadingFirstPage")
    return (
      <div style={{ textAlign: "center", opacity: 0.6, marginBottom: 8 }}>Loading first page…</div>
    );

  if (status === "Exhausted")
    return (
      <div style={{ textAlign: "center", opacity: 0.6, marginBottom: 8 }}>No more messages</div>
    );

  exhaustiveCheck(status);
};
