import { PaginationStatus } from "convex/react";
import * as React from "react";
import { GenericButton } from "../../GenericButton";

interface Props {
  status: PaginationStatus;
  loadMore: (n: number) => void;
}

/** Shown at the top of the message list when older messages can be loaded. */
export const LoadMoreMessages: React.FC<Props> = ({ status, loadMore }) => {
  if (status == "LoadingMore")
    return <div style={{ textAlign: "center", opacity: 0.6, marginBottom: 8 }}>Loading more…</div>;

  if (status === "CanLoadMore")
    return (
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <GenericButton onClick={() => loadMore(10)}>Load older messages</GenericButton>
      </div>
    );

  // Nothing to show while the first page loads or once everything is loaded.
  return null;
};
