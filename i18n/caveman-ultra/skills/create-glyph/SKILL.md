---
name: create-glyph
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Create R-based pictogram glyphs for skill, agent, or team icons in the
  visualization layer. Covers concept sketching, ggplot2 layer composition using
  the primitives library, color strategy, registration in the appropriate glyph
  mapping file and manifest, rendering via the build pipeline, and visual
  verification of the neon-glow output. Use when a new entity has been added and
  needs a visual icon for the force-graph visualization, an existing glyph needs
  replacement, or when batch-creating glyphs for a new domain.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "2.0"
  domain: design
  complexity: intermediate
  language: R
  tags: design, glyph, pictogram, icon, ggplot2, visualization, neon
---

# Create Glyph

R pictogram glyphs → skill/agent/team icons in `viz/`. Pure-ggplot2 fn on 100x100 → neon glow → transparent WebP.

## Use When

- New skill/agent/team needs icon
- Existing glyph needs replace/redesign
- Batch-create for new domain
- Prototype visual metaphors

## In

- **Required**: Type — `skill`, `agent`, `team`
- **Required**: Entity ID (`create-glyph`, `mystic`, `r-package-review`) + domain (skills)
- **Required**: Visual concept
- **Optional**: Reference glyph (complexity calibration)
- **Optional**: Custom `--glow-sigma` (def: 4)

## Do

### Step 1: Concept

1. Read entity source:
   - Skills: `skills/<id>/SKILL.md`
   - Agents: `agents/<id>.md`
   - Teams: `teams/<id>.md`
2. Metaphor type:
   - **Literal**: flask→experiment, shield→security
   - **Abstract**: arrows→merge, spirals→iterate
   - **Composite**: 2-3 simple shapes (doc + pen)
3. Complexity ref:

```
Complexity Tiers:
+----------+--------+-------------------------------------------+
| Tier     | Layers | Examples                                  |
+----------+--------+-------------------------------------------+
| Simple   | 2      | glyph_flame, glyph_heartbeat              |
| Moderate | 3-5    | glyph_document, glyph_experiment_flask    |
| Complex  | 6+     | glyph_ship_wheel, glyph_bridge_cpp        |
+----------+--------+-------------------------------------------+
```

4. Fn name: `glyph_<descriptive_name>` (snake_case, unique)

**Got:** Mental sketch, 2-6 planned layers.

**If err:** Too abstract → concrete related. Check existing in same domain.

### Step 2: Compose

Write R fn → ggplot2 layers.

1. Signature (immutable):
   ```r
   glyph_<name> <- function(cx, cy, s, col, bright) {
     # cx, cy = center coordinates (50, 50 on 100x100 canvas)
     # s = scale factor (1.0 = fill ~70% of canvas)
     # col = domain color hex (e.g., "#ff88dd" for design)
     # bright = brightened variant of col (auto-computed by renderer)
     # Returns: list() of ggplot2 layers
   }
   ```

2. Apply `* s` to ALL dims:
   ```r
   r <- 20 * s        # radius
   hw <- 15 * s       # half-width
   lw <- .lw(s)       # line width (default base 2.5)
   lw_thin <- .lw(s, 1.2)  # thinner line width
   ```

3. Geometry primitives:

   | Geometry | Usage |
   |----------|-------|
   | `ggplot2::geom_polygon(data, .aes(x, y), ...)` | Filled shapes |
   | `ggplot2::geom_path(data, .aes(x, y), ...)` | Open lines/curves |
   | `ggplot2::geom_segment(data, .aes(x, xend, y, yend), ...)` | Segments, arrows |
   | `ggplot2::geom_rect(data, .aes(xmin, xmax, ymin, ymax), ...)` | Rects |
   | `ggforce::geom_circle(data, .aes(x0, y0, r), ...)` | Circles |

4. Color strategy:

   ```
   Alpha Guide:
   +----------------------+------------+--------------------------+
   | Purpose              | Alpha      | Example                  |
   +----------------------+------------+--------------------------+
   | Large fill (body)    | 0.08-0.15  | hex_with_alpha(col, 0.1) |
   | Medium fill (accent) | 0.15-0.25  | hex_with_alpha(col, 0.2) |
   | Small fill (detail)  | 0.25-0.35  | hex_with_alpha(bright, 0.3) |
   | Outline stroke       | 1.0        | color = bright           |
   | Secondary stroke     | 1.0        | color = col              |
   | No fill              | ---        | fill = NA                |
   +----------------------+------------+--------------------------+
   ```

5. Return flat `list()` → renderer wraps each w/ glow

6. Place fn in right primitives file:
   - **Skills**: domain-grouped across 19 files:
     - `primitives.R` — bushcraft, compliance, containerization, data-serialization, defensive
     - `primitives_2.R` — devops, general, git, mcp-integration
     - `primitives_3.R` — mlops, observability, PM, r-packages, reporting, review, web-dev, esoteric, design
     - `primitives_4.R` through `primitives_19.R` for newer
   - **Agents**: `viz/R/agent_primitives.R`
   - **Teams**: `viz/R/team_primitives.R`

**Got:** Working R fn → list of 2-6 layers.

**If err:** `ggforce::geom_circle` err → install ggforce. Coords off → canvas 100x100, (0,0) bottom-left. Test:
```r
source("viz/R/utils.R"); source("viz/R/primitives.R")  # etc.
layers <- glyph_<name>(50, 50, 1.0, "#ff88dd", "#ffa8f0")
p <- ggplot2::ggplot() + ggplot2::coord_fixed(xlim=c(0,100), ylim=c(0,100)) +
     ggplot2::theme_void()
for (l in layers) p <- p + l
print(p)
```

### Step 3: Register

Map entity → glyph.

**Skills:**
1. Open `viz/R/glyphs.R`
2. Find domain section comment (`# -- design (3)`)
3. Alphabetical in domain block:
   ```r
   "skill-id" = "glyph_function_name",
   ```
4. Update count comment if applicable

**Agents:**
1. Open `viz/R/agent_glyphs.R`
2. Alphabetical in `AGENT_GLYPHS`:
   ```r
   "agent-id" = "glyph_function_name",
   ```

**Teams:**
1. Open `viz/R/team_glyphs.R`
2. Alphabetical in `TEAM_GLYPHS`:
   ```r
   "team-id" = "glyph_function_name",
   ```

5. Verify no dup ID

**Got:** `*_GLYPHS` list has new mapping.

**If err:** "No glyph mapped" → check ID exact match vs manifest + registry.

### Step 4: Manifest

Register icon.

**Skills:** `viz/data/icon-manifest.json`
```json
{
  "skillId": "skill-id",
  "domain": "domain-name",
  "prompt": "<domain basePrompt>, <descriptors>, dark background, vector art",
  "seed": <next_seed>,
  "path": "public/icons/cyberpunk/<domain>/<skill-id>.webp",
  "status": "pending"
}
```

**Agents:** `viz/data/agent-icon-manifest.json`
```json
{
  "agentId": "agent-id",
  "prompt": "<agent-specific descriptors>, dark background, vector art",
  "seed": <next_seed>,
  "path": "public/icons/cyberpunk/agents/<agent-id>.webp",
  "status": "pending"
}
```

**Teams:** `viz/data/team-icon-manifest.json`
```json
{
  "teamId": "team-id",
  "prompt": "<team-specific descriptors>, dark background, vector art",
  "seed": <next_seed>,
  "path": "public/icons/cyberpunk/teams/<team-id>.webp",
  "status": "pending"
}
```

**Got:** Valid JSON, entry among type siblings.

**If err:** Validate syntax. Common: trailing comma after last elem, missing quotes.

### Step 5: Render

Run pipeline. Always `build.sh` → platform detect + R binary. See [render-icon-pipeline](../render-icon-pipeline/SKILL.md).

```bash
# From project root — renders all palettes, standard + HD, skips existing icons
bash viz/build.sh --only <domain> --skip-existing          # skills
bash viz/build.sh --type agent --only <id> --skip-existing # agents
bash viz/build.sh --type team --only <id> --skip-existing  # teams

# Dry run first:
bash viz/build.sh --only <domain> --dry-run
```

`build.sh` = full pipeline (palette → data → manifest → render → terminal glyphs). Non-render steps +~10s but ensure current.

Out:
   - Skills: `viz/public/icons/<palette>/<domain>/<skill-id>.webp`
   - Agents: `viz/public/icons/<palette>/agents/<agent-id>.webp`
   - Teams: `viz/public/icons/<palette>/teams/<team-id>.webp`

**Got:** Log `OK: <entity> (seed=XXXXX, XX.XKB)`, WebP exists.

**If err:**
- `"No glyph mapped"` — Step 3 missing / typo
- `"Unknown domain"` — Not in `get_palette_colors()` in `palettes.R`
- R pkg err — `install.packages(c("ggplot2", "ggforce", "ggfx", "ragg", "magick"))`
- Crash → test fn interactive (Step 2 fallback)

### Step 6: Verify

1. Check file + size:
   ```bash
   ls -la viz/public/icons/cyberpunk/<type-path>/<entity-id>.webp
   # Expected: 15-80 KB typical range
   ```

2. Open WebP → check:
   - Shape clear @ 1024x1024
   - Neon glow present, not overpowering
   - BG transparent (no rect)
   - No edge clip

3. Small sizes (~40-160px in graph):
   - Shape recognizable
   - Detail ≠ noise
   - Glow doesn't overwhelm

**Got:** Clear pictogram + even glow + transparent BG.

**If err:**
- Glow strong → re-render `--glow-sigma 2`
- Glow weak → `--glow-sigma 8`
- Unreadable small → simplify (fewer layers, bolder strokes, `.lw(s, base)` higher)
- Edge clip → reduce dims / shift center

### Step 7: Iterate

1. Common adjustments:
   - **Bolder strokes**: `.lw(s, base)` → `base = 3.0` / `3.5`
   - **Visible fill**: alpha 0.10 → 0.15-0.20
   - **Proportions**: tweak `s` multipliers (`20 * s` → `24 * s`)
   - **Add/rm layers**: 2-6 best

2. Re-render:
   ```bash
   # Delete the existing icon first, then re-render
   rm viz/public/icons/cyberpunk/<type-path>/<entity-id>.webp
   # Use the appropriate build command from Step 5
   ```

3. When done → manifest status = `"done"` (auto on success)

**Got:** Icon passes Step 6.

**If err:** 3+ iter fail → try diff metaphor (→ Step 1).

## Reference

### Domain + Entity Palettes

All 58 domain colors (skills) in `viz/R/palettes.R` (single truth). Agent/team colors same. Cyberpunk (hand-tuned neon) in `get_cyberpunk_colors()`. Viridis auto via `viridisLite`.

Lookup:
```r
source("viz/R/palettes.R")
get_palette_colors("cyberpunk")$domains[["design"]]   # skill domain
get_palette_colors("cyberpunk")$agents[["mystic"]]     # agent
get_palette_colors("cyberpunk")$teams[["tending"]]     # team
```

New domain → 3 places in `palettes.R`:
1. `PALETTE_DOMAIN_ORDER` (alphabetical)
2. `get_cyberpunk_colors()` domains list
3. Run `bash viz/build.sh` → regen palettes + data + manifests

### Glyph Fn Catalog

Full catalog in primitives source:
- **Skills**: `viz/R/primitives.R` → `viz/R/primitives_19.R` (domain-grouped)
- **Agents**: `viz/R/agent_primitives.R`
- **Teams**: `viz/R/team_primitives.R`

### Helpers

| Fn | Sig | Purpose |
|----------|-----------|---------|
| `.lw(s, base)` | `(scale, base=2.5)` | Scale-aware line width |
| `.aes(...)` | alias for `ggplot2::aes` | Shorthand aes map |
| `hex_with_alpha(hex, alpha)` | `(string, 0-1)` | Alpha on hex |
| `brighten_hex(hex, factor)` | `(string, factor=1.3)` | Brighten |
| `dim_hex(hex, factor)` | `(string, factor=0.4)` | Dim |

## Check

- [ ] Fn signature: `glyph_<name>(cx, cy, s, col, bright) -> list()`
- [ ] All dims `* s`
- [ ] Colors: `col` fills, `bright` outlines, `hex_with_alpha()` transparency
- [ ] Fn in correct primitives file
- [ ] Mapping in right `*_glyphs.R`
- [ ] Manifest entry + correct path + `"status": "pending"`
- [ ] Build runs no err (dry-run first)
- [ ] WebP at expected path
- [ ] Size 15-80 KB
- [ ] Reads clear 1024px + ~40px
- [ ] Transparent BG
- [ ] Status → `"done"` post-render

## Traps

- **Forgot `* s`**: Hard-coded px breaks on scale. Multiply by `s` always.
- **Canvas origin**: (0,0) bottom-left. Higher `y` = UP.
- **Double glow**: Renderer applies `ggfx::with_outer_glow()`. Do NOT add in fn.
- **Too many layers**: Each gets glow wrap. >8 = slow + noisy.
- **ID mismatch**: Glyph map + manifest + registry must match exact.
- **JSON trailing commas**: Strict JSON. No trailing comma.
- **Missing domain color**: Not in `get_cyberpunk_colors()` → render err. Add color first.
- **Wrong primitives file**: Skills → `primitives*.R`, agents → `agent_primitives.R`, teams → `team_primitives.R`.

## →

- [enhance-glyph](../enhance-glyph/SKILL.md) — improve quality / fix / add layers
- [audit-icon-pipeline](../audit-icon-pipeline/SKILL.md) — detect missing
- [render-icon-pipeline](../render-icon-pipeline/SKILL.md) — full pipeline E2E
- [ornament-style-mono](../ornament-style-mono/SKILL.md) — AI img gen alt
- [ornament-style-color](../ornament-style-color/SKILL.md) — color theory
- [create-skill](../create-skill/SKILL.md) — parent workflow triggering glyph
