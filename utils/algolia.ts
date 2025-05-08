import { algoliasearch } from "algoliasearch";

const client = algoliasearch("JYZJ63OX7U", "01ddc3505766aa8d46cbbd65006671ec");

const index = client.initIndex("next-mikecann");

export const getAlgoliaIndex = () => index;
