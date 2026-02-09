/**
 * Blog Post Fix Script
 *
 * Applies systematic fixes to blog posts based on audit findings.
 * Outputs a detailed log of all changes made.
 *
 * Usage: bun run ./scripts/fixPosts.ts
 * Output: ./scripts/fix-log.json
 */

import fs from "fs";
import { join } from "path";
import matter from "gray-matter";

// ─── Types ───────────────────────────────────────────────────────────────────

interface FixLogEntry {
  slug: string;
  category: string;
  description: string;
  line?: number;
  oldText: string;
  newText: string;
}

interface FixLog {
  timestamp: string;
  totalPostsModified: number;
  totalFixes: number;
  fixesByCategory: Record<string, number>;
  entries: FixLogEntry[];
}

// ─── Config ──────────────────────────────────────────────────────────────────

const postsDirectory = join(process.cwd(), "public/posts");
const fixLog: FixLogEntry[] = [];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function readPost(slug: string): { raw: string; data: Record<string, any>; content: string } {
  const absPostPath = join(postsDirectory, slug, "post.md");
  const raw = fs.readFileSync(absPostPath, "utf8");
  const { data, content } = matter(raw);
  return { raw, data, content };
}

function writePost(slug: string, raw: string): void {
  const absPostPath = join(postsDirectory, slug, "post.md");
  fs.writeFileSync(absPostPath, raw, "utf8");
}

function logFix(slug: string, category: string, description: string, oldText: string, newText: string, line?: number): void {
  fixLog.push({ slug, category, description, line, oldText, newText });
}

// ─── Fix 1: aboveunder.com -> aboveunder.com.au ─────────────────────────────

function fixAboveunder(slug: string, raw: string): string {
  let result = raw;

  // Replace aboveunder.com with aboveunder.com.au in URLs
  // Use a regex that matches "aboveunder.com" only when NOT followed by ".au"
  // This prevents compounding on re-runs (aboveunder.com.au won't match)
  const regex = /aboveunder\.com(?!\.au)/g;
  const matches = result.match(regex);

  if (matches && matches.length > 0) {
    result = result.replace(regex, "aboveunder.com.au");
    logFix(slug, "aboveunder-domain", `Updated ${matches.length} aboveunder.com -> aboveunder.com.au`, "aboveunder.com", "aboveunder.com.au");
  }

  return result;
}

// ─── Fix 2: Protocol-relative URLs -> https:// ──────────────────────────────

function fixProtocolRelativeUrls(slug: string, raw: string): string {
  let result = raw;

  // Fix protocol-relative URLs: src="//domain", href="//domain", (//domain)
  // IMPORTANT: Only match "//" that is NOT preceded by ":" (to avoid matching https://domain)
  const domains = ["cdn.shopify.com", "www.youtube.com", "www.mixcloud.com"];

  for (const domain of domains) {
    // Use regex with negative lookbehind to only match protocol-relative, not https://
    const regex = new RegExp(`(?<!:)\\/\\/${domain.replace(/\./g, "\\.")}`, "g");
    const matches = result.match(regex);
    if (matches && matches.length > 0) {
      result = result.replace(regex, `https://${domain}`);
      logFix(slug, "protocol-relative-url", `Fixed ${matches.length} protocol-relative URL(s) for ${domain}`, `//${domain}`, `https://${domain}`);
    }
  }

  return result;
}

// ─── Fix 3: Specific broken image/link fixes ────────────────────────────────

function fixSpecificPosts(slug: string, raw: string): string {
  let result = raw;

  switch (slug) {
    // Double .png extension
    case "a-game-developer-learns-machine-learning-a-little-deeper": {
      const old = "./building-environment.png.png";
      const fix = "./building-environment.png";
      if (result.includes(old)) {
        result = result.split(old).join(fix);
        logFix(slug, "broken-image", "Fixed double .png extension", old, fix);
      }
      break;
    }

    // flash-develop-plugin-highlight-selected: image is lost, remove the broken reference
    case "flash-develop-plugin-highlight-selected": {
      const old = "![](/posts/highlightselectionscreen01.png)";
      const fix = "*[Screenshot no longer available]*";
      if (result.includes(old)) {
        result = result.replace(old, fix);
        logFix(slug, "broken-image", "Replaced lost image with placeholder note", old, fix);
      }
      break;
    }

    // flashdevelop-preloaders-and-gamejacket: fix image paths to use downloaded local files
    // (we download them separately before running this)
    case "flashdevelop-preloaders-and-gamejacket": {
      for (let i = 1; i <= 5; i++) {
        const padded = `0${i}`;
        const old = `../../../../../flash/GameJacketTutorial/${padded}.png`;
        const fix = `./${padded}.png`;
        if (result.includes(old)) {
          result = result.split(old).join(fix);
          logFix(slug, "broken-image", `Fixed tutorial image path ${padded}.png`, old, fix);
        }
      }
      // Also fix the zip file link
      const oldZip = "../../../../../flash/GameJacketTutorial/GameJacketProject.zip";
      const fixZip = "./GameJacketProject.zip";
      if (result.includes(oldZip)) {
        result = result.replace(oldZip, fixZip);
        logFix(slug, "broken-link", "Fixed tutorial zip path", oldZip, fixZip);
      }
      break;
    }

    // Internal dead links
    case "chrome-crawler-a-web-crawler-written-in-javascript": {
      const old = "/posts/recursive/";
      const fix = "/posts/recursive-explore-the-endless-web";
      if (result.includes(old)) {
        result = result.replace(old, fix);
        logFix(slug, "internal-dead-link", "Fixed internal link to Recursive post", old, fix);
      }
      break;
    }

    case "lets-make-a-mobile-game-in-3-weeks-with-haxe-nme": {
      // No good match for /posts/haxe-2/ - convert to plain text
      const old = "[using for my personal projects](/posts/haxe-2/)";
      const fix = "using for my personal projects";
      if (result.includes(old)) {
        result = result.replace(old, fix);
        logFix(slug, "internal-dead-link", "Removed dead link to non-existent haxe-2 post (no matching post found)", old, fix);
      }
      break;
    }

    case "liero3d-progress": {
      const old = "/posts/lieroxna/";
      const fix = "/posts/lieroxna-a-tentative-beginning";
      if (result.includes(old)) {
        result = result.replace(old, fix);
        logFix(slug, "internal-dead-link", "Fixed internal link to LieroXNA post", old, fix);
      }
      break;
    }

    case "spring-cleaning-updated-bio": {
      const old = "/posts/about-2/";
      const fix = "/about";
      if (result.includes(old)) {
        result = result.replace(old, fix);
        logFix(slug, "internal-dead-link", "Fixed About page link (was /posts/about-2/, now /about)", old, fix);
      }
      break;
    }

    // Defunct Google Maps Engine iframe
    case "north-western-australia-winter-2014": {
      const old = `<iframe src="https://mapsengine.google.com/map/embed?mid=zqHG_2WyX1Rw.kCEeJQ21ypI8" width="640" height="480"></iframe>`;
      const fix = `*[Interactive map no longer available - Google Maps Engine was discontinued]*`;
      if (result.includes(old)) {
        result = result.replace(old, fix);
        logFix(slug, "defunct-embed", "Replaced defunct Google Maps Engine iframe with note", old, fix);
      }
      break;
    }

    // Defunct Google Maps Engine links
    case "the-trip-2013-the-stats": {
      // Line 11: [![screenshot_02](wp-content-url)](mapsengine-url) -> just the image, no link
      const oldImgLine = `[![screenshot_02](https://www.mikecann.blog/wp-content/uploads/2014/01/screenshot_02.png)](https://mapsengine.google.com/map/embed?mid=zqHG_2WyX1Rw.kX4lL2DfOU1E)`;
      const fixImgLine = `![screenshot_02](https://www.mikecann.blog/wp-content/uploads/2014/01/screenshot_02.png)`;
      // Line 13: **[ Click](mapsengine...) the image above...** -> note
      const oldTextLink = `**[ Click](https://mapsengine.google.com/map/embed?mid=zqHG_2WyX1Rw.kX4lL2DfOU1E) the image above to browse the map interactively.**`;
      const fixTextLink = `*[Interactive map no longer available - Google Maps Engine was discontinued]*`;
      if (result.includes(oldImgLine)) {
        result = result.replace(oldImgLine, fixImgLine);
        logFix(slug, "defunct-embed", "Removed defunct Maps Engine link from image", oldImgLine, fixImgLine);
      }
      if (result.includes(oldTextLink)) {
        result = result.replace(oldTextLink, fixTextLink);
        logFix(slug, "defunct-embed", "Replaced defunct Maps Engine link text with note", oldTextLink, fixTextLink);
      }
      break;
    }
  }

  return result;
}

// ─── Download CloudFront assets ──────────────────────────────────────────────

async function downloadCloudFrontAssets(): Promise<void> {
  const baseUrl = "http://d18l99bmg6trdn.cloudfront.net";

  // Download GameJacket tutorial images + zip
  const gamejacketDir = join(postsDirectory, "flashdevelop-preloaders-and-gamejacket");
  const gamejacketFiles = ["01.png", "02.png", "03.png", "04.png", "05.png", "GameJacketProject.zip"];

  for (const file of gamejacketFiles) {
    const destPath = join(gamejacketDir, file);
    if (fs.existsSync(destPath)) {
      console.log(`  Already exists: ${file}`);
      continue;
    }

    const url = `${baseUrl}/flash/GameJacketTutorial/${file}`;
    console.log(`  Downloading: ${url}`);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`    Failed: HTTP ${response.status}`);
        continue;
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(destPath, buffer);
      console.log(`    Saved: ${destPath}`);
    } catch (e: any) {
      console.error(`    Error: ${e.message}`);
    }
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Blog Post Fix Script");
  console.log("====================\n");

  // Step 1: Download assets needed for fixes
  console.log("Step 1: Downloading assets from CloudFront...");
  await downloadCloudFrontAssets();

  // Step 2: Apply fixes to all posts
  console.log("\nStep 2: Applying fixes to posts...\n");

  const slugs = fs.readdirSync(postsDirectory).filter((name) => {
    const stat = fs.lstatSync(join(postsDirectory, name));
    return stat.isDirectory();
  });

  let modifiedCount = 0;

  for (const slug of slugs) {
    try {
      let { raw } = readPost(slug);
      const original = raw;

      // Apply all fix categories
      raw = fixAboveunder(slug, raw);
      raw = fixProtocolRelativeUrls(slug, raw);
      raw = fixSpecificPosts(slug, raw);

      // Only write if changed
      if (raw !== original) {
        writePost(slug, raw);
        modifiedCount++;
        console.log(`  Fixed: ${slug}`);
      }
    } catch (e: any) {
      console.error(`  ERROR processing ${slug}: ${e.message}`);
    }
  }

  // Step 3: Build and write log
  console.log("\nStep 3: Writing fix log...\n");

  const fixesByCategory: Record<string, number> = {};
  for (const entry of fixLog) {
    fixesByCategory[entry.category] = (fixesByCategory[entry.category] || 0) + 1;
  }

  const log: FixLog = {
    timestamp: new Date().toISOString(),
    totalPostsModified: modifiedCount,
    totalFixes: fixLog.length,
    fixesByCategory,
    entries: fixLog,
  };

  const logPath = join(__dirname, "fix-log.json");
  fs.writeFileSync(logPath, JSON.stringify(log, null, 2));

  console.log("====================");
  console.log("Fix Complete!\n");
  console.log(`Posts modified: ${modifiedCount}`);
  console.log(`Total fixes:   ${fixLog.length}`);
  console.log("");
  console.log("Fixes by category:");
  for (const [cat, count] of Object.entries(fixesByCategory).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`);
  }
  console.log("");
  console.log(`Fix log written to: ${logPath}`);
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
