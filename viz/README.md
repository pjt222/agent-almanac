# Interactive Skills Visualization

Force-graph explorer for the 333-skill, 67-agent, 15-team agent-almanac platform. Nodes are skills, agents, and teams; edges express domain membership and cross-references. Each node renders a domain-colored WebP pictogram produced by an R/ggplot2 icon pipeline. Built with [force-graph](https://github.com/vasturiano/force-graph), 9 color themes, and 5 locales.

## Quick Start

```bash
cd viz
npm install
npm run dev        # starts Vite dev server
```

The dev server runs at `http://localhost:5173`. For a production build:

```bash
npm run build      # outputs to viz/dist/
npm run preview    # serves dist/ locally
```

## Build Pipeline

The data and icon pipeline is separate from the Vite frontend build. Run it whenever registry content changes:

```bash
npm run pipeline   # runs build.sh — the single entry point
```

`build.sh` executes four steps:

| Step | Command | What it does |
|------|---------|--------------|
| 1 | `Rscript generate-palette-colors.R` | Generates palette JSON and JS color data |
| 2 | `node build-data.js` | Reads all registries, writes `public/data/skills.json` |
| 3 | `node build-icon-manifest.js` | Produces icon manifests for skills, agents, and teams |
| 4 | `Rscript build-all-icons.R` | Renders standard and HD WebP icons |

Individual stages can be run separately:

```bash
npm run build-data      # step 2 only
npm run build-manifest  # step 3 only
npm run build-favicon   # regenerate favicon assets
```

## Docker

```bash
docker compose up --build
# Open http://localhost:8080
```

## Configuration

`config.yml` holds platform-specific settings (R path, parallel strategy). Four profiles: default, wsl, windows, docker. Set `R_CONFIG_ACTIVE=wsl` to use a non-default profile.

## Related Skills

- [`audit-icon-pipeline`](../skills/audit-icon-pipeline/SKILL.md) — verify icon coverage and detect missing glyphs
- [`create-glyph`](../skills/create-glyph/SKILL.md) — author a new glyph for a skill, agent, or team icon
- [`enhance-glyph`](../skills/enhance-glyph/SKILL.md) — improve an existing glyph's visual quality
- [`render-icon-pipeline`](../skills/render-icon-pipeline/SKILL.md) — run the full pipeline end-to-end

## See Also

- [Root README](../README.md) — project overview
- [Understanding the System](../guides/understanding-the-system.md) — how skills, agents, and teams compose
- [Setting Up Your Environment](../guides/setting-up-your-environment.md) — R, Node.js, and WSL2 setup
