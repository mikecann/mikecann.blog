import { liteClient } from "algoliasearch/lite";
import type { AlgoliaHit } from "../scripts/algolia/types";

const ALGOLIA_APP_ID = "JYZJ63OX7U";
const ALGOLIA_API_KEY = "01ddc3505766aa8d46cbbd65006671ec";
const ALGOLIA_INDEX_NAME = "next-mikecann";

const client = liteClient(ALGOLIA_APP_ID, ALGOLIA_API_KEY);

/** The fields of an indexed post that search results need. */
export type SearchHit = Pick<
  AlgoliaHit,
  "objectID" | "slug" | "title" | "coverImage" | "createdAt"
>;

const attributesToRetrieve: (keyof SearchHit)[] = ["slug", "title", "coverImage", "createdAt"];

/** Searches the posts index, returning only the fields needed to render results. */
export const searchPosts = async (query: string): Promise<SearchHit[]> => {
  const { results } = await client.searchForHits<SearchHit>({
    requests: [
      {
        indexName: ALGOLIA_INDEX_NAME,
        query,
        attributesToRetrieve,
        // The index stores a long excerpt per post; don't send highlights or snippets of it back.
        attributesToHighlight: [],
        attributesToSnippet: [],
      },
    ],
  });
  return results[0]?.hits ?? [];
};
