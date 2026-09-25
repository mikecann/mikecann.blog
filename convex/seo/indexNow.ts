/**
 * IndexNow tells Bing, Yandex, Seznam, Naver and other participating search engines that a page
 * changed, so a new post is indexed within minutes instead of waiting for a crawl. (Google doesn't
 * take part; it finds new posts through the sitemap listed in robots.txt.)
 *
 * The key is public by design: search engines check it by fetching
 * https://mikecann.blog/<key>.txt, which is in public/.
 */
export const INDEXNOW_KEY = "bac03a698e38dcc31173aeb0a2de4001";

/** Best effort: never throws, so a search engine hiccup can't hold up a post email. */
export async function notifyIndexNow(url: string): Promise<void> {
  const endpoint = `https://api.indexnow.org/indexnow?url=${encodeURIComponent(url)}&key=${INDEXNOW_KEY}`;
  try {
    const response = await fetch(endpoint);
    if (response.ok) console.log(`Told search engines about ${url} (IndexNow)`);
    else console.warn(`IndexNow rejected ${url}: HTTP ${response.status}`);
  } catch (error) {
    console.warn(`IndexNow request for ${url} failed`, error);
  }
}
