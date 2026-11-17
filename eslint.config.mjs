// Only the state machines library's rules, on the Convex backend: no optional fields beside a
// machine's state, no direct writes to it or deletes of its rows, no way round its internal brand,
// and a reason on any disable (convex/machines.ts). The rest of the codebase isn't linted.
import { registerHooks } from "node:module";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

// typescript-eslint refuses TypeScript 7 (the blog's), so its parser gets TypeScript 6, installed
// beside it as `typescript6`, as TypeScript 7's announcement suggests for tools on the old API.
const typescript6 = pathToFileURL(createRequire(import.meta.url).resolve("typescript6")).href;
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      specifier === "typescript" &&
      /typescript-eslint|ts-api-utils/.test(context.parentURL ?? "")
    )
      return { url: typescript6, shortCircuit: true, format: "commonjs" };
    return nextResolve(specifier, context);
  },
});

const { default: tseslint } = await import("typescript-eslint");
const { default: machines } = await import("@convex-dev/state-machines/eslint");

export default [
  { ignores: ["**/_generated/**", "dist/**", "node_modules/**"] },
  {
    files: ["convex/**/*.ts"],
    // Tests and their helpers set up rows in a given state on purpose
    ignores: ["convex/**/*.test.ts", "convex/**/*.testkit.ts", "convex/_generated/**"],
    languageOptions: { parser: tseslint.parser },
    ...machines.configs.recommended,
  },
  {
    // The catalog registers the delivery the timers fire through
    files: ["convex/machines.ts"],
    rules: { "machines/no-brand-bypass": ["error", { deliver: false }] },
  },
];
