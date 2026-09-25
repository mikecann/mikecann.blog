/**
 * Writes public/sitemap.xml (gitignored; generated on every build). public/robots.txt points to it.
 *
 * Usage: bun run generateSitemap
 */
import fs from "fs";
import { getAllPublishablePosts, type Post } from "./posts";
import { groupPostsByTag, groupPostsByYear, sortPosts } from "../utils/posts";
import { tagPath } from "../utils/tags";

const SITE_URL = "https://mikecann.blog";

type Entry = { path: string; lastmod?: Date };

const escapeXml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const latestDate = (posts: Post[]) =>
  new Date(Math.max(...posts.map((post) => new Date(post.meta.date).getTime())));

const byKey = <T>(entries: [string, T][]) => entries.sort(([a], [b]) => (a < b ? -1 : 1));

export const generateSitemap = (unsortedPosts: Post[]): string => {
  const posts = sortPosts([...unsortedPosts], "desc");
  const byTag = byKey(Object.entries(groupPostsByTag(posts)));
  const byYear = byKey(Object.entries(groupPostsByYear(posts)));

  const entries: Entry[] = [
    { path: "/", lastmod: latestDate(posts) },
    { path: "/about" },
    { path: "/stash" },
    { path: "/subscribe" },
    ...posts.map((post) => ({ path: `/posts/${post.slug}`, lastmod: new Date(post.meta.date) })),
    { path: "/tags", lastmod: latestDate(posts) },
    ...byTag.map(([tag, tagPosts]) => ({
      path: tagPath(tag),
      lastmod: latestDate(tagPosts),
    })),
    { path: "/years", lastmod: latestDate(posts) },
    ...byYear.map(([year, yearPosts]) => ({
      path: `/years/${year}`,
      lastmod: latestDate(yearPosts),
    })),
  ];

  const urls = entries.map(({ path, lastmod }) =>
    [
      `  <url>`,
      `    <loc>${escapeXml(SITE_URL + path)}</loc>`,
      ...(lastmod && !isNaN(lastmod.getTime())
        ? [`    <lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>`]
        : []),
      `  </url>`,
    ].join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
    ``,
  ].join("\n");
};

if (import.meta.main) {
  const posts = getAllPublishablePosts();
  fs.writeFileSync("./public/sitemap.xml", generateSitemap(posts));
  console.log(`Wrote public/sitemap.xml with ${posts.length} posts`);
}
