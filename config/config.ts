import fs from "fs";
import { join } from "path";

// Config for the build scripts. Values come from the environment (bun loads .env files
// automatically), falling back to an optional, gitignored config/local.config.json.
const readLocalConfig = (): Record<string, string | undefined> => {
  const path = join(__dirname, "local.config.json");
  return fs.existsSync(path) ? JSON.parse(fs.readFileSync(path, "utf8")) : {};
};

const local = readLocalConfig();

export const config = {
  // Public app ID; the frontend hardcodes the same one in utils/algolia.ts.
  ALGOLIA_APP_ID: process.env.ALGOLIA_APP_ID || local.ALGOLIA_APP_ID || "JYZJ63OX7U",
  ALGOLIA_ADMIN_KEY: process.env.ALGOLIA_ADMIN_KEY || local.ALGOLIA_ADMIN_KEY || "",
  ALGOLIA_INDEX_NAME: "next-mikecann",
} as const;
