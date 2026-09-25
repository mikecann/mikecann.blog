import { Horizontal, Vertical } from "../../components/utils/gls";
import * as React from "react";
import { Modal } from "../Modal";
import { useWindowSize } from "../../utils/useWindowSize";
import { CloseButton } from "../CloseButton";
import { SearchHit, searchPosts } from "../../utils/algolia";
import { SearchResult } from "./SearchResult";
import { onOpenMikebot } from "../mikebot/signals";

export interface SearchModalProps {
  onClose: () => any;
}

const SEARCH_DEBOUNCE_MS = 250;

type SearchState =
  | { kind: "loading"; hits: SearchHit[] }
  | { kind: "loaded"; hits: SearchHit[] }
  | { kind: "error"; hits: SearchHit[] };

const SearchModalContent: React.FC<SearchModalProps> = ({ onClose }) => {
  const [term, setTerm] = React.useState("");
  const [search, setSearch] = React.useState<SearchState>({ kind: "loading", hits: [] });
  const [input, setInput] = React.useState<HTMLInputElement | null>(null);
  const { innerHeight } = useWindowSize();

  React.useEffect(() => {
    // Ignore responses for terms that have since changed, so results never go out of order.
    let isCurrent = true;
    setSearch((prev) => ({ kind: "loading", hits: prev.hits }));

    const timeout = setTimeout(
      () => {
        searchPosts(term)
          .then((hits) => {
            if (isCurrent) setSearch({ kind: "loaded", hits });
          })
          .catch((error) => {
            console.error("Algolia search failed", error);
            if (isCurrent) setSearch({ kind: "error", hits: [] });
          });
      },
      term ? SEARCH_DEBOUNCE_MS : 0,
    );

    return () => {
      isCurrent = false;
      clearTimeout(timeout);
    };
  }, [term]);

  React.useEffect(() => {
    if (!input) return;
    input.focus();
  }, [input]);

  return (
    <Modal
      onClose={onClose}
      ariaLabel="Search"
      style={{
        maxWidth: 600,
        width: "calc(100% - 50px)",
        padding: 0,
        position: "relative",
      }}
    >
      <CloseButton style={{ position: "absolute", top: -16, right: -16 }} onClick={onClose} />
      <Horizontal style={{ width: "100%", borderBottom: "1px solid #eee", padding: 20 }}>
        <input
          aria-label="Search posts"
          placeholder="Search.."
          style={{ width: "100%" }}
          value={term}
          ref={setInput}
          onChange={(e) => setTerm(e.target.value)}
        />
      </Horizontal>
      {/* Ask Mikebot card */}
      <button
        type="button"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          width: "100%",
          padding: "8px 20px 8px 20px",
          cursor: "pointer",
          border: "none",
          borderBottom: "1px solid #eee",
          background: "#eafce1",
          font: "inherit",
          color: "inherit",
          textAlign: "left",
        }}
        onClick={() => {
          onClose();
          onOpenMikebot.dispatch(term);
        }}
        title="Ask Mikebot your question"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/mikebot.jpg"
          alt=""
          width={40}
          height={40}
          style={{ borderRadius: "50%", boxShadow: "0 2px 8px 0px rgba(0,0,0,0.15)" }}
        />
        <span style={{ fontWeight: 600, fontSize: 18 }}>Ask Mikebot</span>
        <span style={{ color: "#888", fontSize: 14, marginLeft: 8 }}>
          {term ? `"${term}"` : `Chat with a virtual mike about anything`}
        </span>
      </button>
      <Vertical
        spacing={10}
        aria-busy={search.kind == "loading"}
        style={{
          overflowY: "auto",
          height: innerHeight - 200,
          padding: 20,
          width: "100%",
        }}
      >
        {search.hits.map((hit) => (
          <SearchResult key={hit.objectID} hit={hit} onClick={onClose} />
        ))}
        {search.kind == "loaded" && search.hits.length == 0 && (
          <div style={{ height: "100%" }}>No posts matching your query.</div>
        )}
        {search.kind == "error" && (
          <div style={{ height: "100%" }}>Search is unavailable right now, please try again.</div>
        )}
      </Vertical>
    </Modal>
  );
};

export default SearchModalContent;
