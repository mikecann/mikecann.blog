// @vitest-environment node
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  explainTransitions,
  linkedDiagram,
  missingDescriptions,
  stateDiagram,
} from "@convex-dev/state-machines";
import { expect, test, vi } from "vitest";

vi.mock("@convex-dev/ai-sdk-provider", () => ({
  convexGateway: Object.assign(() => ({}), {
    embeddingModel: () => ({ modelId: "test-embedding", provider: "test" }),
  }),
}));

const { machines } = await import("./machines");

// The diagrams check: docs/state-machines.md is drawn from the rules each machine runs
// (convex/machines.ts), so it fails here when a rule changes and the doc doesn't.
// `bun run machines:diagrams` rewrites it.

const docPath = path.join(__dirname, "..", "docs", "state-machines.md");
const fence = (code: string) => ["```mermaid", code, "```"].join("\n");

function renderDiagrams() {
  const manifests = machines.manifests;
  return [
    "# State machines",
    "",
    "Generated from each machine's rules by `bun run machines:diagrams`, and checked by `bun run test` (`convex/machines.test.ts`). Don't edit it by hand. The live version, with the real rows in each state, is the admin Machines page (/admin/machines).",
    "",
    "The rules live in `convex/<area>/machine.ts`, and every machine is in the catalog in `convex/machines.ts`. Under each state are its own data fields. `[*] -->` is how a row is born and `--> [*]` marks a final state. Each event says who sends it: `(server)` for internal code, or its timer. The notes and the list under each diagram are the rules' own descriptions.",
    "",
    ...(manifests.length > 1 ? ["## Every machine", "", fence(linkedDiagram(manifests)), ""] : []),
    ...manifests.flatMap((manifest) => [
      `## \`${manifest.name}\`, on \`${manifest.table}.${manifest.field}\``,
      "",
      ...(manifest.description ? [manifest.description, ""] : []),
      fence(stateDiagram(manifest, manifests)),
      "",
      explainTransitions(manifest),
      "",
    ]),
  ].join("\n");
}

test("every machine, state, transition and timer says what it means", () => {
  expect(missingDescriptions(machines.manifests)).toEqual([]);
});

test("docs/state-machines.md is drawn from the rules the app runs", () => {
  const markdown = renderDiagrams();
  if (process.env.UPDATE_MACHINE_DIAGRAMS === "1") writeFileSync(docPath, markdown);
  expect(
    readFileSync(docPath, "utf8"),
    "docs/state-machines.md is out of date: run `bun run machines:diagrams`",
  ).toBe(markdown);
});
