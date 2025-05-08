import { algoliasearch } from "algoliasearch";

const ALGOLIA_APP_ID = "JYZJ63OX7U";
const ALGOLIA_API_KEY = "01ddc3505766aa8d46cbbd65006671ec";
const ALGOLIA_INDEX_NAME = "next-mikecann";

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);

export const getAlgoliaClient = () => client;
export const getAlgoliaIndexName = () => ALGOLIA_INDEX_NAME;
