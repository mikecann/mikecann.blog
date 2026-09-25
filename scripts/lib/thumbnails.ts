import fs from "fs";
import { join } from "path";

/** Small WebP copies of every post's cover image, for teasers, search results and feeds. */
export const THUMBNAIL_WIDTH = 640;
export const THUMBNAIL_QUALITY = 70;

export const thumbnailsDirectory = join(process.cwd(), "public/thumbs");

/** Maps each slug to a hash of its cover image and the settings its thumbnail was made with. */
export const thumbnailsManifestPath = join(thumbnailsDirectory, "manifest.json");

export const getThumbnailFile = (slug: string) => join(thumbnailsDirectory, `${slug}.webp`);

export const getThumbnailRootPath = (slug: string) => `/thumbs/${slug}.webp`;

export const hasThumbnail = (slug: string) => fs.existsSync(getThumbnailFile(slug));
