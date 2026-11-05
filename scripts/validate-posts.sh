#!/bin/zsh
# The "Validate posts" hook in .threadbear/patches. Threadbear only runs a
# patch's automatic hooks when they're a single script path, so the script
# it trusted is exactly what runs (Threadbear docs/protocol.md, "Patches").
cd "$(dirname "$0")/.." || exit 1
setopt pipefail
bun run validatePosts 2>&1 | tail -5
