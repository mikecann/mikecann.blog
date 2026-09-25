/**
 * Writes public/rss.xml (gitignored; generated on every build).
 *
 * Usage: bun run generateRSS
 */
import fs from "fs";
import { generateRss } from "../utils/rss";
import { sortPosts } from "../utils/posts";
import { getAllPublishablePosts } from "./posts";

const posts = sortPosts(getAllPublishablePosts(), "desc");
fs.writeFileSync("./public/rss.xml", generateRss(posts));
console.log(`Wrote public/rss.xml with ${posts.length} posts`);
