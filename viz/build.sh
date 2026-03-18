#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

# Detect platform and set R_CONFIG_ACTIVE for config.yml profile selection
if [ -f /.dockerenv ] || [ -n "${DOCKER_CONTAINER:-}" ]; then
  export R_CONFIG_ACTIVE="docker"
elif grep -qi microsoft /proc/version 2>/dev/null; then
  export R_CONFIG_ACTIVE="wsl"
  export WSLENV="${WSLENV:-}${WSLENV:+:}R_CONFIG_ACTIVE"
fi

# Resolve platform-appropriate Rscript binary
if [ "${R_CONFIG_ACTIVE:-}" = "wsl" ] || [ "${R_CONFIG_ACTIVE:-}" = "docker" ]; then
  RSCRIPT="/usr/local/bin/Rscript"
else
  RSCRIPT="Rscript"
fi

echo "=== Step 1/4: Generate palette colors (JSON + JS) ==="
$RSCRIPT generate-palette-colors.R

echo "=== Step 2/4: Generate skills.json from registries ==="
node build-data.js

echo "=== Step 3/4: Generate icon manifests from skills.json ==="
node build-icon-manifest.js --type all

echo "=== Step 4/4: Render all icons (standard + HD) ==="
$RSCRIPT build-all-icons.R "$@"

echo "=== Done ==="
