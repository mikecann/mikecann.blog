import mikecannLint from "mikecann-lint";

export default [
  // work/ is local scratch and blueprint-templates/ holds file templates with
  // placeholder names.
  ...(await mikecannLint({
    root: import.meta.dirname,
    ignores: ["work/**", "blueprint-templates/**", ".astro/**"],
  })),
  {
    // Test helpers set up rows in a given state on purpose.
    files: ["convex/**/*.testkit.ts"],
    rules: {
      "machines/no-direct-state-writes": "off",
      "machines/no-optional-on-machine-tables": "off",
      "machines/no-brand-bypass": "off",
    },
  },
  {
    // An old blanket disable, recorded as exempt; ESLint can't record the
    // unused-directive report it also makes.
    files: ["essentials/misc/object.ts"],
    linterOptions: { reportUnusedDisableDirectives: "off" },
  },
];
