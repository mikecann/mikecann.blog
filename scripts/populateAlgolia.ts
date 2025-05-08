import { algoliasearch } from "algoliasearch";
import { config } from "../config/config";
import { AlgoliaHit } from "./algolia/types";
import { getAllPublishablePosts } from "./posts";

const { ALGOLIA_ADMIN_KEY, ALGOLIA_APP_ID } = config;

async function bootstrap() {
  if (!ALGOLIA_ADMIN_KEY) throw new Error(`missing algolia key!`);

  const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
  const indexName = "next-mikecann";

  await client.clearObjects({ indexName });

  const toAdd: AlgoliaHit[] = getAllPublishablePosts().map((e) => ({
    excerpt: e.content.substr(0, 5000),
    title: e.meta.title,
    coverImage: e.meta.coverImage,
    createdAt: new Date(e.meta.date).getTime(),
    objectID: e.slug,
    slug: e.slug,
  }));

  console.log(`adding ${toAdd.length} posts`);

  //console.log("indexing posts in algolia..");
  await client.saveObjects({ indexName, objects: toAdd });
}

bootstrap()
  .then(() => process.exit())
  .catch((e) => console.error(e));
