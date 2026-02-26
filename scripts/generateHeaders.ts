/**
 * Blog Post Header Image Generator
 *
 * Generates AI header images for posts that use the fallback cover image.
 * Randomly picks between Style A (vibrant) and Style C (graphic) for variety.
 *
 * Usage:
 *   # Test on specific slugs:
 *   bun run ./scripts/generateHeaders.ts --slugs camping-oz-2017-west-kimberly,ludum-dare-hour-40-complete
 *
 *   # Run on all fallback posts (batches of 5, pauses between batches):
 *   bun run ./scripts/generateHeaders.ts --all
 *
 *   # Limit to N posts:
 *   bun run ./scripts/generateHeaders.ts --all --limit 20
 */

import fs from "fs";
import { join, dirname } from "path";
import matter from "gray-matter";
import sharp from "sharp";

// ─── Config ──────────────────────────────────────────────────────────────────

const POSTS_DIR = join(process.cwd(), "public/posts");
const FALLBACK_COVER = "/images/fallback-post-header.png";
const MODEL = "google/gemini-3-pro-image-preview";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Load API key from mikerosoft .env (two levels up from blog root, or from local .env)
function loadApiKey(): string {
  const candidates = [
    join(process.cwd(), ".env"),
    join(dirname(process.cwd()), "mikerosoft", ".env"),
    "C:\\dev\\me\\mikerosoft\\.env",
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      const line = fs.readFileSync(p, "utf8").split("\n").find((l) => l.startsWith("OPENROUTER_API_KEY="));
      if (line) return line.replace("OPENROUTER_API_KEY=", "").replace(/"/g, "").trim();
    }
  }
  throw new Error("OPENROUTER_API_KEY not found in any .env file");
}

// ─── Style definitions ───────────────────────────────────────────────────────

const STYLE_SUFFIX =
  "No text or letters anywhere in the image. Not photorealistic. Wide 21:9 panoramic landscape banner.";

const STYLES = {
  A: `Style: vibrant cartoon illustration, rich saturated pastel colours (deep coral, warm amber, electric teal), bold smooth shapes, energetic playful composition. No harsh black outlines - use colour-on-colour. ${STYLE_SUFFIX}`,
  C: `Style: flat-design cartoon illustration, bright vivid pastels with punchy contrast (cobalt blue, hot coral, sunny yellow), clean geometric shapes, modern graphic-novel feel. ${STYLE_SUFFIX}`,
};

function pickStyle(): { key: string; desc: string } {
  const keys = Object.keys(STYLES) as Array<keyof typeof STYLES>;
  const key = keys[Math.floor(Math.random() * keys.length)];
  return { key, desc: STYLES[key] };
}

// ─── Prompt builder ──────────────────────────────────────────────────────────

function buildPrompt(title: string, tags: string[], excerpt: string, styleDesc: string): string {
  const tagStr = tags.filter(Boolean).join(", ");
  const context = [title, tagStr && `Topics: ${tagStr}`, excerpt && `Context: ${excerpt}`]
    .filter(Boolean)
    .join(". ");

  return `Create a wide panoramic header illustration for a personal blog post. ${context}. Design a scene or set of floating objects that visually captures the essence of this post. ${styleDesc}`;
}

function getExcerpt(content: string, maxLen = 200): string {
  return content
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/[#*`[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, maxLen);
}

function getTags(data: Record<string, any>): string[] {
  if (!data.tags) return [];
  if (Array.isArray(data.tags)) return data.tags.map(String).filter(Boolean);
  if (typeof data.tags === "string") return data.tags.split(",").map((t: string) => t.trim()).filter(Boolean);
  return [];
}

// ─── API call ────────────────────────────────────────────────────────────────

async function generateImage(prompt: string, apiKey: string): Promise<Buffer> {
  const body = {
    model: MODEL,
    modalities: ["image", "text"],
    image_config: { aspect_ratio: "21:9" },
    messages: [{ role: "user", content: [{ type: "text", text: prompt }] }],
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://github.com/mikecann/mikecann.blog",
      "X-Title": "mikecann.blog/generate-headers",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);

  const data = (await res.json()) as any;
  const images = data.choices[0].message.images as Array<{ image_url: { url: string } }> | undefined;
  if (!images?.length) throw new Error("No image in response");

  const b64 = images[0].image_url.url.split(",", 2)[1];
  return Buffer.from(b64, "base64");
}

// ─── Post processing ─────────────────────────────────────────────────────────

function updateFrontmatter(raw: string, newCoverImage: string): string {
  return raw.replace(
    /^(coverImage:\s*)(.+)$/m,
    `$1${newCoverImage}`
  );
}

async function processPost(slug: string, apiKey: string): Promise<void> {
  const postPath = join(POSTS_DIR, slug, "post.md");
  const raw = fs.readFileSync(postPath, "utf8");
  const { data, content } = matter(raw);

  const title = (data.title as string) ?? slug;
  const tags = getTags(data);
  const excerpt = getExcerpt(content);
  const style = pickStyle();
  const prompt = buildPrompt(title, tags, excerpt, style.desc);

  console.log(`  [Style ${style.key}] ${title}`);
  console.log(`  Prompt: ${prompt.substring(0, 120)}...`);

  const rawBuffer = await generateImage(prompt, apiKey);

  // Convert whatever Gemini returns (usually JPEG) to proper WebP
  const imgBuffer = await sharp(rawBuffer).webp({ quality: 82 }).toBuffer();

  const outPath = join(POSTS_DIR, slug, "header.webp");
  fs.writeFileSync(outPath, imgBuffer);

  const updatedRaw = updateFrontmatter(raw, "./header.webp");
  fs.writeFileSync(postPath, updatedRaw, "utf8");

  console.log(`  Saved: ${outPath}`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const runAll = args.includes("--all");
  const limitArg = args.find((a) => a.startsWith("--limit="))?.split("=")[1];
  const limit = limitArg ? parseInt(limitArg) : Infinity;
  const slugsArg = args.find((a) => a.startsWith("--slugs="))?.split("=")[1];
  const specificSlugs = slugsArg ? slugsArg.split(",") : null;

  console.log("Blog Post Header Generator");
  console.log("==========================\n");

  const apiKey = loadApiKey();
  console.log("API key loaded.\n");

  let slugs: string[];

  if (specificSlugs) {
    slugs = specificSlugs;
  } else if (runAll) {
    slugs = fs
      .readdirSync(POSTS_DIR)
      .filter((name) => fs.lstatSync(join(POSTS_DIR, name)).isDirectory())
      .filter((slug) => {
        try {
          const raw = fs.readFileSync(join(POSTS_DIR, slug, "post.md"), "utf8");
          const { data } = matter(raw);
          return data.coverImage === FALLBACK_COVER;
        } catch {
          return false;
        }
      })
      .slice(0, limit);
  } else {
    console.error("Usage: bun run ./scripts/generateHeaders.ts --slugs slug1,slug2 OR --all [--limit=N]");
    process.exit(1);
  }

  console.log(`Processing ${slugs.length} post(s)...\n`);

  let ok = 0;
  let fail = 0;

  for (const slug of slugs) {
    console.log(`\n[${ok + fail + 1}/${slugs.length}] ${slug}`);
    try {
      await processPost(slug, apiKey);
      ok++;
    } catch (e: any) {
      console.error(`  ERROR: ${e.message}`);
      fail++;
    }
    // Small delay between requests to be kind to the API
    if (ok + fail < slugs.length) await new Promise((r) => setTimeout(r, 1000));
  }

  console.log(`\n==========================`);
  console.log(`Done. Success: ${ok}, Failed: ${fail}`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
