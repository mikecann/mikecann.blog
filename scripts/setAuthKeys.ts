/**
 * Puts Convex Auth's signing keys (AUTH_PRIVATE_KEY, AUTH_JWKS) on a deployment, for the admin
 * pages' Google sign-in (convex/admin/auth.ts). Skips if they're already set; --force makes new
 * ones, which signs everyone out. Nothing secret is printed.
 *
 * Usage: bun run ./scripts/setAuthKeys.ts [--prod] [--force]
 */
import { spawnSync } from "node:child_process";
import { generateKeyPairSync, randomUUID } from "node:crypto";

const prod = Bun.argv.includes("--prod");
const force = Bun.argv.includes("--force");
const where = prod ? "production" : "dev";
const convexEnv = (args: string[]) =>
  spawnSync("bunx", ["convex", "env", ...args, ...(prod ? ["--prod"] : [])], { encoding: "utf8" });

const existing = convexEnv(["get", "AUTH_JWKS"]);
if (!force && existing.status === 0 && existing.stdout.trim().length > 0) {
  console.log(`AUTH_PRIVATE_KEY and AUTH_JWKS are already set on ${where}, left unchanged.`);
  process.exit(0);
}

const { publicKey, privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const keys = {
  AUTH_PRIVATE_KEY: Buffer.from(privateKey.export({ type: "pkcs8", format: "pem" })).toString(
    "base64",
  ),
  AUTH_JWKS: JSON.stringify({
    keys: [{ ...publicKey.export({ format: "jwk" }), kid: randomUUID(), alg: "RS256", use: "sig" }],
  }),
};
for (const [name, value] of Object.entries(keys)) {
  const result = convexEnv(["set", name, value]);
  if (result.status !== 0) {
    console.error(`Couldn't set ${name} on ${where}:\n${result.stderr}`);
    process.exit(1);
  }
}
console.log(`Set AUTH_PRIVATE_KEY and AUTH_JWKS on ${where}.`);
