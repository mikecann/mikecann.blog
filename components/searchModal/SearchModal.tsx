import { Horizontal, Vertical } from "../../components/utils/gls";
import * as React from "react";
import { Modal } from "../Modal";
import { useWindowSize } from "../../utils/useWindowSize";
import { CloseButton } from "../CloseButton";
import { getAlgoliaClient, getAlgoliaIndexName } from "../../utils/algolia";
import { SearchResult } from "./SearchResult";
import { match } from "ramda";
import { AlgoliaHit } from "../../scripts/algolia/types";
import { onOpenMikebot } from "../mikebot/signals";

interface Props {
  onClose: () => any;
}

declare global {
  interface Window {
    __mikebotSearchTerm?: string;
  }
}

export const SearchModal: React.FC<Props> = ({ onClose }) => {
  const [term, setTerm] = React.useState("");
  const [results, setResults] = React.useState<Array<AlgoliaHit>>([]);
  //const windowSize = useWindowSize();
  const [input, setInput] = React.useState<HTMLInputElement | null>(null);
  const { innerHeight, innerWidth } = useWindowSize();

  React.useEffect(() => {
    const client = getAlgoliaClient();
    const indexName = getAlgoliaIndexName();
    client
      .searchSingleIndex({
        indexName,
        searchParams: { query: term },
      })
      .then((resp) => {
        console.log("algolia response", resp);
        setResults(resp.hits as unknown as AlgoliaHit[]);
      });
  }, [term]);

  React.useEffect(() => {
    if (!input) return;
    input.focus();
  }, [input]);

  React.useEffect(() => {
    const onEvent = (e: KeyboardEvent) => {
      if (e.key == "Escape") onClose();
    };
    window.addEventListener("keyup", onEvent);
    return () => window.removeEventListener("keyup", onEvent);
  }, [onClose]);

  return (
    <Modal
      onClose={onClose}
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
          placeholder="Search.."
          style={{ width: "100%" }}
          value={term}
          ref={setInput}
          onChange={(e) => setTerm(e.target.value)}
        />
      </Horizontal>
      {/* Ask Mikebot card */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "8px 20px 8px 20px",
          cursor: "pointer",
          borderBottom: "1px solid #eee",
          background: "#eafce1",
        }}
        onClick={() => {
          onClose();
          onOpenMikebot.dispatch(term);
        }}
        title="Ask Mikebot your question"
      >
        <img
          src="/images/mikebot.jpg"
          alt="Mikebot"
          width={40}
          height={40}
          style={{ borderRadius: "50%", boxShadow: "0 2px 8px 0px rgba(0,0,0,0.15)" }}
        />
        <div style={{ fontWeight: 600, fontSize: 18 }}>Ask Mikebot</div>
        <div style={{ color: "#888", fontSize: 14, marginLeft: 8 }}>
          {term ? `"${term}"` : `Chat with a virtual mike about anything`}
        </div>
      </div>
      <Vertical
        spacing={10}
        style={{
          overflowY: "auto",
          height: innerHeight - 200,
          padding: 20,
          width: "100%",
        }}
      >
        {results.map((hit) => (
          <SearchResult key={hit.objectID} hit={hit} onClick={onClose} />
        ))}
        {results.length == 0 && (
          <div style={{ height: "100%" }}>
            {/* <Header icon>
            <Icon name="search" /> */}
            No posts matching your query.
            {/* </Header> */}
          </div>
        )}
      </Vertical>
    </Modal>
  );
};
