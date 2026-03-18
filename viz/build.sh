#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

# Read R path from config.yml (bootstrap with system R)
R_CMD=$(Rscript --vanilla -e "cat(config::get('r_path', file='config.yml'))" 2>/dev/null || echo "Rscript")

echo "=== Using R: $R_CMD ==="

echo "=== Step 1/4: Generate palette colors (JSON + JS) ==="
"$R_CMD" generate-palette-colors.R

echo "=== Step 2/4: Generate skills.json from registries ==="
node build-data.js

echo "=== Step 3/4: Generate icon-manifest.json from skills.json ==="
node build-icon-manifest.js

echo "=== Step 4/4: Render all icons (standard + HD) ==="
"$R_CMD" build-all-icons.R "$@"

echo "=== Done ==="
