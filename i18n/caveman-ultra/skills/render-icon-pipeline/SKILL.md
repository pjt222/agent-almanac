---
name: render-icon-pipeline
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Run viz pipeline → render icons from existing glyphs. Entry for viz
  subproject: palette gen, data build, manifest create, icon render for
  skills, agents, teams. Always use build.sh as entry — never call Rscript
  direct.
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

Run viz pipeline end-to-end → render icons from existing glyphs. Palette gen, data build, manifest create, icon render for skills, agents, teams.

**Canonical entry**: `bash viz/build.sh [flags]` from project root, or `bash build.sh [flags]` from `viz/`. Script handles platform detection (WSL, Docker, native), R binary select, step ordering. Never call `Rscript` direct for build scripts — that path only for MCP server config.

## Use When

- After create/modify glyph fns
- After add new skills, agents, teams to registries
- Icons need re-render for new/updated palettes
- Full pipeline rebuild (after infra changes)
- Setting up viz env first time

## In

- **Optional**: Entity type — `skill`, `agent`, `team`, `all` (default `all`)
- **Optional**: Palette — specific name or `all` (default `all`)
- **Optional**: Domain filter — specific domain for skill icons (e.g. `git`, `design`)
- **Optional**: Render mode — `full`, `incremental`, `dry-run` (default `incremental`)

## Do

### Step 1: Verify Prereqs

Ensure env ready for rendering.

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

`build.sh` handles R binary resolution auto — no need verify R paths manually. WSL → `/usr/local/bin/Rscript` (WSL-native R), Docker → container R, native Linux/macOS → `Rscript` from PATH.

→ `build.sh`, Node.js, `config.yml` present.

If err: `config.yml` missing → pipeline falls back to system defaults. Node.js missing → install via nvm.

### Step 2: Run Pipeline

`build.sh` exec 5 steps in order:
1. Generate palette colors (R) → `palette-colors.json` + `colors-generated.js`
2. Build data (Node) → `skills.json`
3. Build manifests (Node) → `icon-manifest.json`, `agent-icon-manifest.json`, `team-icon-manifest.json`
4. Render icons (R) → `icons/` + `icons-hd/` WebP files
5. Generate terminal glyphs (Node) → `cli/lib/glyph-data.json`

**Full pipeline (all types, all palettes, std + HD):**
```bash
bash viz/build.sh
```

**Incremental (skip icons existing on disk):**
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

**Dry run (preview no rendering):**
```bash
bash viz/build.sh --dry-run
```

**Std size only (skip HD):**
```bash
bash viz/build.sh --no-hd
```

All flags after `build.sh` passed through to `build-all-icons.R`.

→ Icons rendered to `viz/public/icons/<palette>/` + `viz/public/icons-hd/<palette>/`.

If err:
- **renv hang on NTFS**: viz `.Rprofile` bypasses `renv/activate.R` + sets `.libPaths()` direct. Ensure run from `viz/` (build.sh does auto via `cd "$(dirname "$0")"`)
- **Missing R pkgs**: Run `Rscript -e "install.packages(c('ggplot2', 'ggforce', 'ggfx', 'ragg', 'magick', 'future', 'furrr', 'digest'))"` from R env build.sh selects
- **No glyph mapped**: Entity needs glyph fn — use `create-glyph` before rendering

### Step 3: Verify Output

Confirm render completed.

1. Check file counts match:
   ```bash
   find viz/public/icons/cyberpunk -name "*.webp" | wc -l
   find viz/public/icons-hd/cyberpunk -name "*.webp" | wc -l
   ```
2. Check reasonable file sizes (2-80 KB per icon)
3. Run `audit-icon-pipeline` for comprehensive check

→ File counts match manifest entry counts. Sizes in expected range.

If err: counts don't match → some glyphs errored during render. Check build log for `[ERROR]` lines.

## CLI Flag Reference

All flags passed through `build.sh` → `build-all-icons.R`:

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

For ref only — do NOT run these manually:

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

Runs full pipeline in isolated Linux env + serves on port 8080.

## Check

- [ ] Ran `bash viz/build.sh` (not bare `Rscript`)
- [ ] Palette colors generated (JSON + JS)
- [ ] Data files built from registries
- [ ] Manifests generated from data
- [ ] Icons rendered for target types + palettes
- [ ] File counts match
- [ ] Sizes in expected range (2-80 KB)

## Traps

- **Calling Rscript direct**: Never `Rscript build-icons.R` or `Rscript generate-palette-colors.R` manually. Always `bash build.sh [flags]`. Direct calls bypass platform detection + may use wrong R binary (Windows R via `~/bin/Rscript` wrapper instead of WSL-native R at `/usr/local/bin/Rscript`). Note: Windows R path in CLAUDE.md + guides for **MCP server config only**, not build scripts.
- **Wrong cwd**: `build.sh` CDs to own dir auto (`cd "$(dirname "$0")"`), so call from anywhere: `bash viz/build.sh` from project root works.
- **Stale manifests**: `build.sh` runs Steps 1-5 in order, manifests always regen before render. Only need manifests no render → `node viz/build-data.js && node viz/build-icon-manifest.js` (Node steps no need R).
- **renv not activated**: `.Rprofile` workaround needs running from `viz/` — `build.sh` handles. Using `--vanilla` or running R from another dir skips it.
- **Parallel on Windows**: Windows no support fork-based parallelism — pipeline auto-selects `multisession` via `config.yml`.

## →

- [audit-icon-pipeline](../audit-icon-pipeline/SKILL.md) — detect missing glyphs + icons before render
- [create-glyph](../create-glyph/SKILL.md) — create new glyph fns for entities missing icons
- [enhance-glyph](../enhance-glyph/SKILL.md) — improve existing glyphs before re-render
