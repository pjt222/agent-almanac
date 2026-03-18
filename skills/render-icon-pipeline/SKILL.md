---
name: render-icon-pipeline
description: >
  Run the viz pipeline to render icons from existing glyphs. Entry point for the
  viz subproject covering palette generation, data building, manifest creation,
  and icon rendering for skills, agents, and teams.
license: MIT
allowed-tools: Read Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: visualization
  complexity: basic
  language: multi
  tags: visualization, rendering, pipeline, icons, glyphs, build
---

# Render Icon Pipeline

Run the viz pipeline end-to-end to render icons from existing glyphs. Covers palette generation, data building, manifest creation, and icon rendering for skills, agents, and teams.

## When to Use

- After creating or modifying glyph functions
- After adding new skills, agents, or teams to registries
- When icons need re-rendering for new or updated palettes
- For a full pipeline rebuild (e.g., after infrastructure changes)
- When setting up the viz environment for the first time

## Inputs

- **Optional**: Entity type — `skill`, `agent`, `team`, or `all` (default: `all`)
- **Optional**: Palette — specific palette name or `all` (default: `all`)
- **Optional**: Domain filter — specific domain for skill icons (e.g., `git`, `design`)
- **Optional**: Render mode — `full`, `incremental`, or `dry-run` (default: `incremental`)

## Procedure

### Step 1: Verify Prerequisites

Ensure the environment is ready for rendering.

1. Confirm working directory is `viz/` (or navigate there):
   ```bash
   cd /mnt/d/dev/p/agent-almanac/viz
   ```
2. Verify R packages are available:
   ```bash
   Rscript -e "requireNamespace('ggplot2'); requireNamespace('ggforce'); requireNamespace('ggfx'); requireNamespace('ragg'); requireNamespace('magick')"
   ```
3. Verify Node.js is available:
   ```bash
   node --version
   ```
4. Check that `config.yml` exists (OS-aware R path selection)

**Expected:** All prerequisites pass without error.

**On failure:** Install missing R packages with `install.packages()`. If Node.js is missing, install via nvm. If `config.yml` is missing, the pipeline will fall back to system defaults.

### Step 2: Generate Palette Colors

Generate the JSON and JS palette data from R palette definitions.

```bash
Rscript generate-palette-colors.R
```

**Expected:** `viz/public/data/palette-colors.json` and `viz/js/palette-colors.js` updated.

**On failure:** Check that `viz/R/palettes.R` is valid R code. Common issue: syntax error in new domain color entry.

### Step 3: Build Data

Generate the skills/agents/teams data files from registries.

```bash
node build-data.js
```

**Expected:** `viz/public/data/skills.json` updated with current registry data.

**On failure:** Verify `skills/_registry.yml`, `agents/_registry.yml`, `teams/_registry.yml` are valid YAML.

### Step 4: Build Manifests

Generate icon manifests from the data files.

```bash
node build-icon-manifest.js
```

**Expected:** Three manifest files updated:
- `viz/public/data/icon-manifest.json`
- `viz/public/data/agent-icon-manifest.json`
- `viz/public/data/team-icon-manifest.json`

**On failure:** If manifests are stale, delete them and re-run. Check that `build-data.js` was run first.

### Step 5: Render Icons

Run the icon renderer with appropriate flags.

**Full pipeline (all types, all palettes, standard + HD):**
```bash
Rscript build-all-icons.R
```

**Incremental (skip unchanged glyphs):**
```bash
Rscript build-all-icons.R --skip-existing
```

**Single entity type:**
```bash
Rscript build-all-icons.R --type skill
Rscript build-all-icons.R --type agent
Rscript build-all-icons.R --type team
```

**Single domain (skills only):**
```bash
Rscript build-icons.R --only design
```

**Single agent or team:**
```bash
Rscript build-agent-icons.R --only mystic
Rscript build-team-icons.R --only r-package-review
```

**Dry run (preview without rendering):**
```bash
Rscript build-all-icons.R --dry-run
```

**Standard size only (skip HD):**
```bash
Rscript build-all-icons.R --no-hd
```

**CLI reference:**

| Flag | Default | Description |
|------|---------|-------------|
| `--type <types>` | `all` | Comma-separated: skill, agent, team |
| `--palette <name>` | `all` | Single palette or `all` (9 palettes) |
| `--only <filter>` | none | Domain (skills) or entity ID (agents/teams) |
| `--skip-existing` | off | Skip icons with existing WebP files |
| `--dry-run` | off | List what would be generated |
| `--size <n>` | `512` | Output dimension in pixels |
| `--glow-sigma <n>` | `4` | Glow blur radius |
| `--workers <n>` | auto | Parallel workers (detectCores()-1) |
| `--no-cache` | off | Ignore content-hash cache |
| `--hd` | on | Enable HD variants (1024px) |
| `--no-hd` | off | Skip HD variants |
| `--strict` | off | Exit on first sub-script failure |

**Expected:** Icons rendered to `viz/public/icons/<palette>/` and `viz/public/icons-hd/<palette>/`.

**On failure:**
- **renv hang**: Run from `viz/` directory so `.Rprofile` activates the library path workaround
- **Missing packages**: `install.packages(c("ggplot2", "ggforce", "ggfx", "ragg", "magick", "future", "furrr", "digest"))`
- **Exit code 5**: Usually means a glyph function errored — check the log for the specific skill/agent/team ID
- **No glyph mapped**: The entity needs a glyph function — use the `create-glyph` skill

### Step 6: Verify Output

Confirm the render completed successfully.

1. Check file counts match expectations:
   ```bash
   find viz/public/icons/cyberpunk -name "*.webp" | wc -l
   find viz/public/icons-hd/cyberpunk -name "*.webp" | wc -l
   ```
2. Check for reasonable file sizes (2-80 KB per icon)
3. Verify manifests are up to date (run `audit-icon-pipeline` for a full check)

**Expected:** File counts match manifest entry counts. File sizes in expected range.

**On failure:** If counts don't match, some glyphs may have errored during rendering. Check the build log for `[ERROR]` lines.

## Docker Alternative

The pipeline can also run in Docker:

```bash
cd viz
docker compose up --build
```

This runs the full pipeline in an isolated Linux environment and serves the result on port 8080.

## Validation Checklist

- [ ] Working directory is `viz/`
- [ ] Palette colors generated (JSON + JS)
- [ ] Data files built from registries
- [ ] Manifests generated from data
- [ ] Icons rendered for target types and palettes
- [ ] File counts match expectations
- [ ] File sizes in expected range (2-80 KB)

## Common Pitfalls

- **Wrong working directory**: R scripts expect to be run from `viz/` or to find `viz/R/utils.R` relative to the project root
- **renv not activated**: The `.Rprofile` workaround requires running from `viz/` — using `--vanilla` flag or running from another directory will skip it
- **Stale manifests**: Always run Steps 2-4 (palette -> data -> manifest) before Step 5 (render) after registry changes
- **Parallel on Windows**: Windows doesn't support fork-based parallelism — the pipeline auto-selects `multisession` via `config.yml`

## Related Skills

- [audit-icon-pipeline](../audit-icon-pipeline/SKILL.md) — detect missing glyphs and icons before rendering
- [create-glyph](../create-glyph/SKILL.md) — create new glyph functions for entities missing icons
- [enhance-glyph](../enhance-glyph/SKILL.md) — improve existing glyphs before re-rendering
