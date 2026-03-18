# Interactive Skills Visualization

Force-graph explorer for the 328-skill, 66-agent, 15-team development platform. Built with [force-graph](https://github.com/vasturiano/force-graph), R/ggplot2 icon rendering, and 9 color themes.

## Architecture

- **Force-graph** (`js/graph.js`): 2D canvas rendering with zoom, pan, and click-to-inspect
- **R icon pipeline** (`R/`): ggplot2 + ggfx neon glow pictograms rendered per-skill as transparent WebP icons
- **328 skill icons** (`icons/<domain>/`): one glyph per skill, domain-colored
- **9 color themes**: cyberpunk, viridis, magma, inferno, plasma, cividis, mako, rocket, turbo
- **Data pipeline**: `build-data.js` reads all three registries and generates `data/skills.json`

## Build Pipeline

```bash
# Generate skills.json from registries
node build-data.js

# Render R-based pictogram icons (requires R with ggplot2, ggfx)
Rscript build-icons.R

# Build icon manifest and convert to WebP
node build-icons.js
```

## Run Locally

```bash
cd viz && python3 -m http.server 8080
# Open http://localhost:8080
```

## Docker

```bash
docker compose up --build
# Open http://localhost:8080
```

## Directory Layout

```
viz/
├── index.html                 # Force-graph explorer
├── build-data.js              # Registry → skills.json pipeline
├── build-icons.R              # R icon rendering orchestrator
├── build-icons.js             # WebP conversion + manifest
├── build-icon-manifest.js     # Icon manifest generator
├── generate-palette-colors.R  # Domain color palette generator
├── Dockerfile                 # Container build
├── docker-compose.yml         # Compose configuration
├── js/                        # Graph, filters, panel, color themes
├── css/                       # Styles
├── R/                         # Glyph primitives, render, utilities
├── data/                      # skills.json, icon-manifest.json, palette-colors.json
└── icons/                     # WebP skill icons by domain
```
