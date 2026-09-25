/**
 * Replaces the contents of the Algolia search index with the publishable posts.
 *
 * Usage: bun run populateAlgolia [--dry-run]
 *
 * Needs ALGOLIA_ADMIN_KEY. Runs in the production deploy after the site has built.
 * replaceAllObjects writes to a temporary index and then swaps it in, so search keeps working
 * (with the old records) if anything fails, and a failure exits non-zero so the deploy fails.
 */
import { algoliasearch } from "algoliasearch";
import { config } from "../config/config";
import { AlgoliaHit } from "./algolia/types";
import { getAllPublishablePosts, type Post } from "./posts";
import { getThumbnailRootPath, hasThumbnail } from "./lib/thumbnails";
import { getPostRootCoverImagePath } from "../utils/posts";

const { ALGOLIA_ADMIN_KEY, ALGOLIA_APP_ID, ALGOLIA_INDEX_NAME } = config;

/** Site-root path of a small version of the cover image, for search result thumbnails. */
const getSearchImage = (post: Post) =>
  hasThumbnail(post.slug) ? getThumbnailRootPath(post.slug) : getPostRootCoverImagePath(post);

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  const objects: AlgoliaHit[] = getAllPublishablePosts().map((e) => ({
    excerpt: e.content.substring(0, 5000),
    title: e.meta.title,
    coverImage: getSearchImage(e),
    createdAt: new Date(e.meta.date).getTime(),
    objectID: e.slug,
    slug: e.slug,
  }));

  if (dryRun) {
    console.log(`[dry run] would replace ${ALGOLIA_INDEX_NAME} with ${objects.length} posts, e.g.`);
    console.log({ ...objects[0], excerpt: objects[0].excerpt.slice(0, 100) + "..." });
    return;
  }

  if (!ALGOLIA_ADMIN_KEY) throw new Error(`Missing env ALGOLIA_ADMIN_KEY`);
  const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);

  console.log(`Replacing Algolia index ${ALGOLIA_INDEX_NAME} with ${objects.length} posts...`);
  await client.replaceAllObjects({ indexName: ALGOLIA_INDEX_NAME, objects });
  console.log("Done.");
}

main().catch((e) => {
  console.error("Failed to populate Algolia:", e);
  process.exit(1);
});
