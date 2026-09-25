/// <reference types="vite/client" />
// Module map for convex-test. It must be globbed from the convex/ root so the
// keys line up with function paths. (The Convex CLI skips files whose names
// contain multiple dots, so this helper is never deployed.)
export const modules = import.meta.glob("./**/*.ts");
