---
name: render-icon-pipeline
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Run viz pipeline to render icons from existing glyphs. Entry point for
  viz subproject covering palette generation, data building, manifest
  creation, icon rendering for skills, agents, teams. Always use
  build.sh as pipeline entry point — never call Rscript direct.
license: MIT
allowed-tools: Read Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: visualization
  complexity: basic
  language: multi
  tags: visualization, rendering, pipeline, icons, glyphs, build
---

# Render Icon Pipeline

Run viz pipeline end-to-end to render icons from existing glyphs. Cover palette generation, data building, manifest creation, icon rendering for skills, agents, teams.

**Canonical entry point**: `bash viz/build.sh [flags]` from project root, or `bash build.sh [flags]` from `viz/`. This script handles platform detection (WSL, Docker, native), R binary selection, step ordering. Never call `Rscript` direct for build scripts — that path is only for MCP server configuration.

## When Use

- After create or modify glyph functions
- After add new skills, agents, or teams to registries
- When icons need re-rendering for new or updated palettes
- For full pipeline rebuild (e.g., after infrastructure changes)
- When set up viz environment for first time

## Inputs

- **Optional**: Entity type — `skill`, `agent`, `team`, or `all` (default: `all`)
- **Optional**: Palette — specific palette name or `all` (default: `all`)
- **Optional**: Domain filter — specific domain for skill icons (e.g., `git`, `design`)
- **Optional**: Render mode — `full`, `incremental`, or `dry-run` (default: `incremental`)

## Steps

### Step 1: Verify Prerequisites

Ensure environment ready for rendering.

1. Confirm `viz/build.sh` exists:
   ```bash
   ls -la viz/build.sh
   ```
2. Verify Node.js available:
   ```bash
   node --version
   ```
3. Check `viz/config.yml` exists (platform-specific R path profiles):
   ```bash
   ls viz/config.yml
   ```

`build.sh` handles R binary resolution automatic — no need to verify R paths manual. On WSL it uses `/usr/local/bin/Rscript` (WSL-native R), on Docker it uses container R, on native Linux/macOS it uses `Rscript` from PATH.

**Got:** `build.sh`, Node.js, `config.yml` are present.

**If fail:** `config.yml` missing? Pipeline falls back to system defaults. Node.js missing? Install via nvm.

### Step 2: Run the Pipeline

`build.sh` executes 5 steps in order:
1. Generate palette colors (R) → `palette-colors.json` + `colors-generated.js`
2. Build data (Node) → `skills.json`
3. Build manifests (Node) → `icon-manifest.json`, `agent-icon-manifest.json`, `team-icon-manifest.json`
4. Render icons (R) → `icons/` and `icons-hd/` WebP files
5. Generate terminal glyphs (Node) → `cli/lib/glyph-data.json`

**Full pipeline (all types, all palettes, standard + HD):**
```bash
bash viz/build.sh
```

**Incremental (skip icons that already exist on disk):**
```bash
bash viz/build.sh --skip-existing
```

**Single domain (skills only):**
```bash
bash viz/build.sh --only design
```

**Single entity type:**
```bash
bash viz/build.sh --type skill
bash viz/build.sh --type agent
bash viz/build.sh --type team
```

**Dry run (preview without rendering):**
```bash
bash viz/build.sh --dry-run
```

**Standard size only (skip HD):**
```bash
bash viz/build.sh --no-hd
```

All flags after `build.sh` pass through to `build-all-icons.R`.

**Got:** Icons rendered to `viz/public/icons/<palette>/` and `viz/public/icons-hd/<palette>/`.

**If fail:**
- **renv hang on NTFS**: viz `.Rprofile` bypasses `renv/activate.R` and sets `.libPaths()` direct. Ensure you run from `viz/` (build.sh does this auto via `cd "$(dirname "$0")"`)
- **Missing R packages**: Run `Rscript -e "install.packages(c('ggplot2', 'ggforce', 'ggfx', 'ragg', 'magick', 'future', 'furrr', 'digest'))"` from R environment that `build.sh` selects
- **No glyph mapped**: Entity needs glyph function — use `create-glyph` skill before rendering

### Step 3: Verify Output

Confirm render completed successful.

1. Check file counts match expectations:
   ```bash
   find viz/public/icons/cyberpunk -name "*.webp" | wc -l
   find viz/public/icons-hd/cyberpunk -name "*.webp" | wc -l
   ```
2. Check for reasonable file sizes (2-80 KB per icon)
3. Run `audit-icon-pipeline` skill for comprehensive check

**Got:** File counts match manifest entry counts. File sizes in expected range.

**If fail:** Counts no match? Some glyphs may have errored during rendering. Check build log for `[ERROR]` lines.

## CLI Flag Reference

All flags pass through `build.sh` to `build-all-icons.R`:

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

## What build.sh Does Internally

For reference only — do NOT run these steps manual:

```
cd viz/
# 1. Platform detection: sets R_CONFIG_ACTIVE (wsl, docker, or unset)
# 2. R binary selection: WSL → /usr/local/bin/Rscript, Docker → same, native → Rscript
# 3. $RSCRIPT generate-palette-colors.R
# 4. node build-data.js
# 5. node build-icon-manifest.js --type all
# 6. $RSCRIPT build-all-icons.R "$@"  (flags passed through)
# 7. node build-terminal-glyphs.js
```

## Docker Alternative

Pipeline can also run in Docker:

```bash
cd viz
docker compose up --build
```

Runs full pipeline in isolated Linux environment. Serves result on port 8080.

## Checks

- [ ] Ran `bash viz/build.sh` (not bare `Rscript`)
- [ ] Palette colors generated (JSON + JS)
- [ ] Data files built from registries
- [ ] Manifests generated from data
- [ ] Icons rendered for target types and palettes
- [ ] File counts match expectations
- [ ] File sizes in expected range (2-80 KB)

## Pitfalls

- **Call Rscript direct**: Never run `Rscript build-icons.R` or `Rscript generate-palette-colors.R` manual. Always use `bash build.sh [flags]`. Direct Rscript calls bypass platform detection. May use wrong R binary (Windows R via `~/bin/Rscript` wrapper instead of WSL-native R at `/usr/local/bin/Rscript`). Note: Windows R path in CLAUDE.md and guides is for **MCP server configuration only**, not for build scripts.
- **Wrong working directory**: `build.sh` CDs to its own directory auto (`cd "$(dirname "$0")"`), so you can call it from anywhere: `bash viz/build.sh` from project root works correct.
- **Stale manifests**: `build.sh` runs Steps 1-5 in order, so manifests always regenerated before rendering. Need only manifests without rendering? Use `node viz/build-data.js && node viz/build-icon-manifest.js` (Node steps no need R).
- **renv not activated**: `.Rprofile` workaround needs running from `viz/` — `build.sh` handles this. Using `--vanilla` flag or running R from another directory will skip it.
- **Parallel on Windows**: Windows no support fork-based parallelism — pipeline auto-selects `multisession` via `config.yml`.

## See Also

- [audit-icon-pipeline](../audit-icon-pipeline/SKILL.md) — detect missing glyphs and icons before rendering
- [create-glyph](../create-glyph/SKILL.md) — create new glyph functions for entities missing icons
- [enhance-glyph](../enhance-glyph/SKILL.md) — improve existing glyphs before re-rendering
