import { ResponsiveSidebarLayouts } from "../components/layout/ResponsiveSidebarLayouts";
import * as React from "react";
import { useRouter } from "next/router";
import { SearchHit, searchPosts } from "../utils/algolia";
import { SearchResult } from "../components/searchModal/SearchResult";
import { SearchModal } from "../components/searchModal/SearchModal";
import Head from "next/head";
import { Vertical } from "../components/utils/gls";

type State =
  | { kind: "searching" }
  | { kind: "results"; hits: SearchHit[] }
  | { kind: "redirecting"; url: string };

/** The last segment of the missing URL, which is usually the old post slug. */
const getSearchTerm = () => {
  const parts = window.location.pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1] ?? "";
  try {
    return decodeURIComponent(last);
  } catch {
    return last;
  }
};

const NotFoundPage = () => {
  const router = useRouter();
  const [state, setState] = React.useState<State>({ kind: "searching" });
  const [searchVisible, setSearchVisible] = React.useState(false);

  React.useEffect(() => {
    const term = getSearchTerm();
    if (!term) {
      setState({ kind: "results", hits: [] });
      return;
    }

    let cancelled = false;
    const search = async () => {
      const hits = await searchPosts(term);
      if (hits.length == 1) return { kind: "redirecting", url: `/posts/${hits[0].slug}` } as const;
      if (hits.length > 1) return { kind: "results", hits } as const;
      // Nothing matched, suggest some posts instead.
      return { kind: "results", hits: await searchPosts("") } as const;
    };

    search()
      .then((next) => {
        if (!cancelled) setState(next);
      })
      .catch((error) => {
        console.error("Algolia search error", error);
        if (!cancelled) setState({ kind: "results", hits: [] });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (state.kind == "redirecting") router.replace(state.url);
  }, [state, router]);

  const openSearch = (event: React.MouseEvent) => {
    event.preventDefault();
    setSearchVisible(true);
  };

  const render = () => {
    if (state.kind == "searching")
      return (
        <Vertical spacing={20}>
          <h1>Page Not Found</h1>
          <p>Searching for matches..</p>
        </Vertical>
      );

    if (state.kind == "redirecting")
      return (
        <Vertical spacing={20}>
          <h1>Page Moved</h1>
          <p>
            Loading page at its new location: <a href={state.url}>{state.url}</a>
          </p>
        </Vertical>
      );

    if (state.hits.length == 0)
      return (
        <Vertical spacing={20}>
          <h1>Page Not Found</h1>
          <p>It seems like that page has moved or doesnt exist.</p>
          <p>
            You can try{" "}
            <a href="#search" onClick={openSearch}>
              searching
            </a>{" "}
            for something else.
          </p>
        </Vertical>
      );

    return (
      <Vertical spacing={20}>
        <h1>Page Not Found</h1>
        <p>It seems like that page has moved, heres some similar posts:</p>
        <Vertical spacing={20}>
          {state.hits.map((hit) => (
            <SearchResult key={hit.slug} hit={hit} />
          ))}
        </Vertical>
      </Vertical>
    );
  };

  return (
    <>
      <ResponsiveSidebarLayouts>
        <Head>
          <title key="title">404 - mikecann.blog</title>
        </Head>
        {render()}
      </ResponsiveSidebarLayouts>
      {searchVisible && <SearchModal onClose={() => setSearchVisible(false)} />}
    </>
  );
};

export default NotFoundPage;
