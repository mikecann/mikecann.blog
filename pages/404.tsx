import { ResponsiveSidebarLayouts } from "../components/layout/ResponsiveSidebarLayouts";
import * as React from "react";
import { getAlgoliaClient, getAlgoliaIndexName } from "../utils/algolia";
import { SearchResult } from "../components/searchModal/SearchResult";
import { SearchModal } from "../components/searchModal/SearchModal";
import Head from "next/head";
import { AlgoliaHit } from "../scripts/algolia/types";
import { Vertical } from "../components/utils/gls";

type Props = {};

const NotFoundPage = ({}: Props) => {
  const [results, setResults] = React.useState<Array<AlgoliaHit>>([]);
  const [loading, setLoading] = React.useState(false);
  const [searchVisible, setSearchVisible] = React.useState(false);

  const term = (() => {
    if (!global.window) return "";
    const parts = window.location.href.split("/");
    return parts[parts.length - 1];
  })();

  React.useEffect(() => {
    if (!term) return;
    setLoading(true);
    console.log(`Searching for '${term}'..`);
    const client = getAlgoliaClient();
    const indexName = getAlgoliaIndexName();
    client
      .searchSingleIndex({
        indexName,
        searchParams: { query: term },
      })
      .then((resp) => {
        setLoading(false);
        console.log(`Results loaded`, resp);
        if (resp.hits.length != 0) setResults(resp.hits as any);
        else
          client
            .searchSingleIndex({
              indexName,
              searchParams: { query: "" },
            })
            .then((resp) => setResults(resp.hits as any));
      })
      .catch((e) => {
        console.log(`Algolia search error`, e);
        setLoading(false);
      });
  }, [term]);

  const render = () => {
    if (loading)
      return (
        <Vertical spacing={20}>
          <h1>Page Not Found</h1>
          <p>Searching for matches..</p>
        </Vertical>
      );

    if (results.length == 0)
      return (
        <Vertical spacing={20}>
          <h1>Page Not Found</h1>
          <p>It seems like that page has moved or doesnt exist.</p>
          <p>
            You can try <a onClick={() => setSearchVisible(false)}>searching</a> for something else.
          </p>
        </Vertical>
      );

    if (results.length == 1) {
      const url = `/posts/${results[0].slug}`;
      window.open(url, "_self");
      return (
        <Vertical spacing={20}>
          <h1>Page Moved</h1>
          <p>
            Loading page at its new location: <a href={url}>{url}</a>
          </p>
        </Vertical>
      );
    }

    return (
      <Vertical spacing={20}>
        <h1>Page Not Found</h1>
        <p>It seems like that page has moved, heres some similar posts:</p>
        <Vertical spacing={20}>
          {results.map((hit) => (
            <SearchResult key={hit.slug} hit={hit} />
          ))}
        </Vertical>
      </Vertical>
    );
  };

  return (
    <ResponsiveSidebarLayouts>
      <Head>
        <title key="title">404 - mikecann.blog</title>
      </Head>
      {render()}
      {searchVisible && <SearchModal onClose={() => setSearchVisible(false)} />}
    </ResponsiveSidebarLayouts>
  );
};

export default NotFoundPage;
