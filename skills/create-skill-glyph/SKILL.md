---
name: create-skill-glyph
description: >
  Create R-based pictogram glyphs for skill icons in the visualization layer.
  Covers concept sketching, ggplot2 layer composition using the primitives library,
  color strategy, registration in glyphs.R and icon-manifest.json, rendering via
  build-icons.R, and visual verification of the neon-glow output. Use when a new
  skill has been added and needs a visual icon for the force-graph visualization,
  an existing glyph needs replacement, or when batch-creating glyphs for a new
  domain of skills.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: design
  complexity: intermediate
  language: R
  tags: design, glyph, pictogram, icon, ggplot2, visualization, neon
---

# Create Skill Glyph

Create R-based pictogram glyphs for skill icons in the `viz/` visualization layer. Each glyph is a pure-ggplot2 function that draws a recognizable shape on a 100x100 canvas, rendered with a neon glow effect to transparent-background WebP.

## When to Use

- A new skill has been added and needs a visual icon for the force-graph visualization
- An existing glyph needs replacement or redesign
- Batch-creating glyphs for a new domain of skills
- Prototyping visual metaphors for skill concepts

## Inputs

- **Required**: Skill ID (e.g., `create-skill-glyph`) and domain (e.g., `design`)
- **Required**: Visual concept — what the glyph should depict
- **Optional**: Reference glyph to study for complexity level
- **Optional**: Custom `--glow-sigma` value (default: 4)

## Procedure

### Step 1: Concept — Design the Visual Metaphor

Identify the skill being iconified and choose a visual metaphor.

1. Read the skill's SKILL.md to understand its core concept
2. Choose a metaphor type:
   - **Literal object**: a flask for experiments, a shield for security
   - **Abstract symbol**: arrows for merging, spirals for iteration
   - **Composite**: combine 2-3 simple shapes (e.g., document + pen)
3. Reference existing glyphs for complexity calibration:

```
Complexity Tiers:
┌──────────┬────────┬───────────────────────────────────────────┐
│ Tier     │ Layers │ Examples                                  │
├──────────┼────────┼───────────────────────────────────────────┤
│ Simple   │ 2      │ glyph_flame, glyph_heartbeat              │
│ Moderate │ 3-5    │ glyph_document, glyph_experiment_flask     │
│ Complex  │ 6+     │ glyph_ship_wheel, glyph_bridge_cpp        │
└──────────┴────────┴───────────────────────────────────────────┘
```

4. Decide on a function name: `glyph_<descriptive_name>` (snake_case, unique)

**Expected:** A clear mental sketch of the shape with 2-6 planned layers.

**On failure:** If the concept is too abstract, fall back to a related concrete object. Review existing glyphs in the same domain for inspiration.

### Step 2: Compose — Write the Glyph Function

Write the R function that produces ggplot2 layers.

1. Function signature (immutable contract):
   ```r
   glyph_<name> <- function(cx, cy, s, col, bright) {
     # cx, cy = center coordinates (50, 50 on 100x100 canvas)
     # s = scale factor (1.0 = fill ~70% of canvas)
     # col = domain color hex (e.g., "#ff88dd" for design)
     # bright = brightened variant of col (auto-computed by renderer)
     # Returns: list() of ggplot2 layers
   }
   ```

2. Apply scale factor `* s` to ALL dimensions for consistent scaling:
   ```r
   r <- 20 * s        # radius
   hw <- 15 * s       # half-width
   lw <- .lw(s)       # line width (default base 2.5)
   lw_thin <- .lw(s, 1.2)  # thinner line width
   ```

3. Build geometry using available primitives:

   | Geometry | Usage |
   |----------|-------|
   | `ggplot2::geom_polygon(data, .aes(x, y), ...)` | Filled shapes |
   | `ggplot2::geom_path(data, .aes(x, y), ...)` | Open lines/curves |
   | `ggplot2::geom_segment(data, .aes(x, xend, y, yend), ...)` | Line segments, arrows |
   | `ggplot2::geom_rect(data, .aes(xmin, xmax, ymin, ymax), ...)` | Rectangles |
   | `ggforce::geom_circle(data, .aes(x0, y0, r), ...)` | Circles |

4. Apply the color strategy:

   ```
   Alpha Guide:
   ┌──────────────────────┬────────────┬──────────────────────────┐
   │ Purpose              │ Alpha      │ Example                  │
   ├──────────────────────┼────────────┼──────────────────────────┤
   │ Large fill (body)    │ 0.08-0.15  │ hex_with_alpha(col, 0.1) │
   │ Medium fill (accent) │ 0.15-0.25  │ hex_with_alpha(col, 0.2) │
   │ Small fill (detail)  │ 0.25-0.35  │ hex_with_alpha(bright, 0.3) │
   │ Outline stroke       │ 1.0        │ color = bright           │
   │ Secondary stroke     │ 1.0        │ color = col              │
   │ No fill              │ —          │ fill = NA                │
   └──────────────────────┴────────────┴──────────────────────────┘
   ```

5. Return a flat `list()` of layers (the renderer iterates and wraps each with glow)

6. Place the function in the appropriate primitives file based on domain grouping:
   - `primitives.R` — bushcraft, compliance, containerization, data-serialization, defensive
   - `primitives_2.R` — devops, general, git, mcp-integration
   - `primitives_3.R` — mlops, observability, project-management, r-packages, reporting, review, web-dev, esoteric, design

**Expected:** A working R function that returns a list of 2-6 ggplot2 layers.

**On failure:** If `ggforce::geom_circle` causes errors, ensure ggforce is installed. If coordinates are off, remember the canvas is 100x100 with (0,0) at bottom-left. Test the function interactively:
```r
source("viz/R/utils.R"); source("viz/R/primitives.R")  # etc.
layers <- glyph_<name>(50, 50, 1.0, "#ff88dd", "#ffa8f0")
p <- ggplot2::ggplot() + ggplot2::coord_fixed(xlim=c(0,100), ylim=c(0,100)) +
     ggplot2::theme_void()
for (l in layers) p <- p + l
print(p)
```

### Step 3: Register — Map Skill to Glyph

Add the skill-to-glyph mapping in `viz/R/glyphs.R`.

1. Open `viz/R/glyphs.R`
2. Find the comment section for the target domain (e.g., `# -- design (3)`)
3. Add the entry in alphabetical order within the domain block:
   ```r
   "skill-id" = "glyph_function_name",
   ```
4. Update the domain count in the comment if applicable (e.g., `(3)` -> `(4)`)
5. Verify no duplicate skill ID exists in `SKILL_GLYPHS`

**Expected:** The `SKILL_GLYPHS` list contains the new mapping.

**On failure:** If the build later reports "No glyph mapped for skill", double-check that the skill ID exactly matches the one in the manifest and registry.

### Step 4: Manifest — Add Icon Entry

Register the icon in `viz/data/icon-manifest.json`.

1. Open the manifest and find the domain's existing entries
2. Identify the next seed number for that domain:

   ```
   Domain Seed Ranges:
   ┌──────────────────────┬──────────────┐
   │ Domain               │ Seed Range   │
   ├──────────────────────┼──────────────┤
   │ bushcraft            │ 10001-10xxx  │
   │ compliance           │ 20001-20xxx  │
   │ containerization     │ 30001-30xxx  │
   │ data-serialization   │ 40001-40xxx  │
   │ defensive            │ 50001-50xxx  │
   │ design               │ 60001-60xxx  │
   │ devops               │ 70001-70xxx  │
   │ esoteric             │ 80001-80xxx  │
   │ general              │ 90001-90xxx  │
   │ git                  │ 100001-100xxx│
   │ mcp-integration      │ 110001-110xxx│
   │ mlops                │ 120001-120xxx│
   │ observability        │ 130001-130xxx│
   │ project-management   │ 140001-140xxx│
   │ r-packages           │ 150001-150xxx│
   │ reporting            │ 160001-160xxx│
   │ review               │ 170001-170xxx│
   │ web-dev              │ 180001-180xxx│
   │ workflow-visualization│ (none yet)  │
   └──────────────────────┴──────────────┘
   ```

3. Add the entry to the `icons` array:
   ```json
   {
     "skillId": "skill-id",
     "domain": "domain-name",
     "prompt": "<domain basePrompt>, <skill-specific descriptors>, dark background, vector art, clean edges, single centered icon, no text",
     "seed": <next_seed>,
     "path": "public/icons/cyberpunk/<domain>/<skill-id>.webp",
     "status": "pending"
   }
   ```

**Expected:** Valid JSON with the new entry placed among its domain siblings.

**On failure:** Validate JSON syntax. Common mistakes: trailing comma after last array element, missing quotes.

### Step 5: Render — Generate the Icon

Run the build pipeline to render the WebP.

1. Navigate to the `viz/` directory (or project root)
2. Render the target domain:
   ```bash
   cd viz && Rscript build-icons.R --only <domain>
   ```
3. To render only the new icon (avoid re-rendering existing ones):
   ```bash
   Rscript build-icons.R --only <domain> --skip-existing
   ```
4. For a dry run first:
   ```bash
   Rscript build-icons.R --only <domain> --dry-run
   ```
5. Output location: `viz/public/icons/<palette>/<domain>/<skill-id>.webp`

**Expected:** The log shows `OK: <domain>/<skill-id> (seed=XXXXX, XX.XKB)` and the WebP file exists.

**On failure:**
- `"No glyph mapped for skill"` — Step 3 mapping is missing or has a typo
- `"Unknown domain"` — Domain not in `get_palette_colors()` in `palettes.R`
- R package errors — Run `install.packages(c("ggplot2", "ggforce", "ggfx", "ragg", "magick"))` first
- If rendering crashes, test the glyph function interactively (see Step 2 fallback)

### Step 6: Verify — Visual Inspection

Check the rendered output meets quality standards.

1. Verify file exists and has reasonable size:
   ```bash
   ls -la viz/public/icons/cyberpunk/<domain>/<skill-id>.webp
   # Expected: 15-80 KB typical range
   ```

2. Open the WebP in an image viewer to check:
   - Shape reads clearly at full size (1024x1024)
   - Neon glow is present but not overpowering
   - Background is transparent (no black/white rectangle)
   - No clipping at canvas edges

3. Check at small sizes (the icon renders at ~40-160px in the force graph):
   - Shape remains recognizable
   - Detail doesn't turn to noise
   - Glow doesn't overwhelm the shape

**Expected:** A clear, recognizable pictogram with even neon glow on transparent background.

**On failure:**
- Glow too strong: re-render with `--glow-sigma 2` (default is 4)
- Glow too weak: re-render with `--glow-sigma 8`
- Shape unreadable at small sizes: simplify the glyph (fewer layers, bolder strokes, increase `.lw(s, base)` base value)
- Clipping at edges: reduce shape dimensions or shift center

### Step 7: Iterate — Refine if Needed

Make adjustments and re-render.

1. Common adjustments:
   - **Bolder strokes**: increase `.lw(s, base)` — try `base = 3.0` or `3.5`
   - **More visible fill**: increase alpha from 0.10 to 0.15-0.20
   - **Shape proportions**: adjust multipliers on `s` (e.g., `20 * s` -> `24 * s`)
   - **Add/remove detail layers**: keep total layers between 2-6 for best results

2. To re-render after changes:
   ```bash
   # Delete the existing icon first
   rm viz/public/icons/cyberpunk/<domain>/<skill-id>.webp
   # Re-render
   Rscript build-icons.R --only <domain> --skip-existing
   ```

3. When satisfied, verify the manifest status shows `"done"` (the build script updates it automatically on success)

**Expected:** The final icon passes all verification checks from Step 6.

**On failure:** If after 3+ iterations the glyph still doesn't read well, consider using a completely different visual metaphor (return to Step 1).

## Reference

### Domain Color Palette

All 52 domain colors are defined in `viz/R/palettes.R` (the single source of truth).
The cyberpunk palette (hand-tuned neon colors) is in `get_cyberpunk_colors()`.
Viridis-family palettes are auto-generated via `viridisLite`.

To look up a domain color:
```r
source("viz/R/palettes.R")
get_palette_colors("cyberpunk")$domains[["design"]]
# [1] "#ff88dd"
```

When adding a new domain, add it to three places in `palettes.R`:
1. `PALETTE_DOMAIN_ORDER` (alphabetical)
2. `get_cyberpunk_colors()` domains list
3. Run `Rscript generate-palette-colors.R` to regenerate JSON + JS

### Glyph Function Catalog

All glyph functions across the three primitives files, grouped by source file:

**primitives.R** (bushcraft, compliance, containerization, data-serialization, defensive):
- `glyph_flame` — teardrop flame shape
- `glyph_droplet` — water drop with wave lines
- `glyph_leaf` — leaf with central and side veins
- `glyph_shield_check` — shield with checkmark
- `glyph_document` — page with text lines
- `glyph_footprints` — trail of footprints
- `glyph_microscope` — microscope with eyepiece and stage
- `glyph_clipboard` — clipboard with clip and content lines
- `glyph_barcode` — vertical barcode stripes
- `glyph_blueprint` — blueprint grid with cross-hairs
- `glyph_refresh_arrows` — circular refresh arrows
- `glyph_fingerprint` — concentric arcs (fingerprint)
- `glyph_numbered_list` — numbered steps list
- `glyph_database_shield` — database cylinder with shield overlay
- `glyph_graduation_cap` — mortarboard cap
- `glyph_power_off` — power button circle with gap
- `glyph_checklist` — checklist with checkboxes
- `glyph_fishbone` — fishbone/Ishikawa diagram
- `glyph_badge_star` — star badge with ribbon
- `glyph_docker_box` — container box (Docker)
- `glyph_compose_stack` — stacked containers
- `glyph_box_plug` — box with connection plug
- `glyph_layers_arrow` — layered cache with speed arrow
- `glyph_brackets_stream` — angle brackets with data stream
- `glyph_schema_tree` — tree of schema nodes
- `glyph_yin_yang` — yin-yang circle
- `glyph_spiral_arrow` — spiral with directional arrow
- `glyph_lotus` — lotus flower petals

**primitives_2.R** (devops, general, git, mcp-integration):
- `glyph_pipeline` — multi-stage pipeline with arrows
- `glyph_terraform_blocks` — interlocking infrastructure blocks
- `glyph_ship_wheel` — Kubernetes helm wheel with spokes
- `glyph_key_lock` — key and lock combination
- `glyph_registry_box` — box with version lines and tag
- `glyph_git_sync` — circular git sync arrows
- `glyph_gateway` — gateway arch with traffic flow
- `glyph_mesh_grid` — interconnected mesh grid
- `glyph_policy_shield` — shield with code lines
- `glyph_cost_down` — downward cost arrow with graph
- `glyph_cluster_local` — local cluster nodes
- `glyph_anchor` — anchor shape (Helm)
- `glyph_terminal` — terminal window with prompt
- `glyph_robot_doc` — robot head above document
- `glyph_shield_scan` — shield with scan lines
- `glyph_spark_create` — creation spark/starburst
- `glyph_evolution_arrow` — evolution spiral arrow
- `glyph_git_config` — gear with git branch
- `glyph_commit_diamond` — diamond commit node
- `glyph_branch_fork` — branching fork
- `glyph_merge_arrows` — converging merge arrows
- `glyph_conflict_cross` — crossed conflict lines
- `glyph_tag_release` — tag with release indicator
- `glyph_server_plug` — server with connection plug
- `glyph_wrench_server` — wrench over server
- `glyph_debug_cable` — debug probe cable

**primitives_3.R** (mlops, observability, PM, r-packages, reporting, review, web-dev, esoteric, design):
- `glyph_experiment_flask` — lab flask with bubbles
- `glyph_model_registry` — box with version lines and tag
- `glyph_serve_endpoint` — server box with arrow to endpoint
- `glyph_table_store` — data table grid with header
- `glyph_version_branch` — version tree branch
- `glyph_dag_pipeline` — DAG nodes with edges
- `glyph_drift_curve` — drifting distribution curves
- `glyph_split_ab` — A/B split with divider
- `glyph_auto_tune` — tuning knobs/dials
- `glyph_anomaly_spike` — signal with anomaly spike
- `glyph_forecast_line` — trend line with forecast extension
- `glyph_label_tag` — label tag with marker
- `glyph_prometheus_fire` — Prometheus flame
- `glyph_dashboard_grid` — dashboard panels grid
- `glyph_log_funnel` — funnel collecting log lines
- `glyph_trace_spans` — distributed trace spans
- `glyph_gauge_slo` — SLO gauge meter
- `glyph_bell_alert` — alert bell
- `glyph_runbook` — runbook document with steps
- `glyph_timeline` — horizontal timeline with events
- `glyph_capacity_chart` — capacity bar chart
- `glyph_rotation_clock` — clock with rotation arrows
- `glyph_chaos_monkey` — chaos/disruption symbol
- `glyph_heartbeat` — heartbeat ECG line
- `glyph_signals_unified` — unified signal streams
- `glyph_charter_scroll` — scroll document
- `glyph_wbs_tree` — WBS hierarchy tree
- `glyph_sprint_board` — kanban/sprint board
- `glyph_backlog_stack` — stacked backlog cards
- `glyph_status_gauge` — status gauge meter
- `glyph_retro_mirror` — reflection mirror
- `glyph_hexagon_r` — R hexagon logo
- `glyph_upload_check` — upload arrow with checkmark
- `glyph_doc_pen` — document with pen nib
- `glyph_test_tube` — test tube with liquid
- `glyph_github_actions` — GitHub actions workflow
- `glyph_book_web` — book with web pages
- `glyph_lock_tree` — lock with dependency tree
- `glyph_bridge_cpp` — bridge connector (C++)
- `glyph_scroll_tutorial` — tutorial scroll (alias)
- `glyph_rocket_tag` — rocket with tag (alias)
- `glyph_rocket_deploy` — rocket launch
- `glyph_quarto_diamond` — Quarto diamond shape
- `glyph_academic_paper` — academic paper layout
- `glyph_template_params` — template with parameter slots
- `glyph_table_stats` — statistical table
- `glyph_magnifier_paper` — magnifier over paper
- `glyph_magnifier_chart` — magnifier over chart
- `glyph_magnifier_arch` — magnifier over architecture
- `glyph_magnifier_layout` — magnifier over layout
- `glyph_magnifier_user` — magnifier over user
- `glyph_nextjs_scaffold` — Next.js scaffold
- `glyph_tailwind_ts` — Tailwind/TypeScript
- `glyph_healing_hands` — healing hands energy
- `glyph_lotus_seated` — seated lotus meditation
- `glyph_third_eye` — third eye symbol
- `glyph_palette` — artist palette
- `glyph_compass_drafting` — drafting compass
- `glyph_healing_hands_guide` — healing hands with guide figure
- `glyph_lotus_seated_guide` — lotus with guide figure
- `glyph_third_eye_guide` — third eye with monitor figure

### Helper Functions

| Function | Signature | Purpose |
|----------|-----------|---------|
| `.lw(s, base)` | `(scale, base=2.5)` | Scale-aware line width |
| `.aes(...)` | alias for `ggplot2::aes` | Shorthand aesthetic mapping |
| `hex_with_alpha(hex, alpha)` | `(string, 0-1)` | Add alpha to hex color |
| `brighten_hex(hex, factor)` | `(string, factor=1.3)` | Brighten a hex color |
| `dim_hex(hex, factor)` | `(string, factor=0.4)` | Dim a hex color |

## Validation Checklist

- [ ] Glyph function follows `glyph_<name>(cx, cy, s, col, bright) -> list()` signature
- [ ] All dimensions use `* s` scaling factor
- [ ] Color strategy uses `col` for fills, `bright` for outlines, `hex_with_alpha()` for transparency
- [ ] Function placed in correct primitives file for domain grouping
- [ ] `SKILL_GLYPHS` entry added in `viz/R/glyphs.R` with correct skill ID
- [ ] `icon-manifest.json` entry added with correct domain, seed, path, and `"status": "pending"`
- [ ] `build-icons.R --dry-run` runs without error
- [ ] Rendered WebP exists at `viz/public/icons/cyberpunk/<domain>/<skill-id>.webp`
- [ ] File size in expected range (15-80 KB)
- [ ] Icon reads clearly at both 1024px and ~40px display sizes
- [ ] Transparent background (no solid rectangle behind the glyph)
- [ ] Manifest status updated to `"done"` after successful render

## Common Pitfalls

- **Forgetting `* s`**: Hard-coded pixel values break when scale changes. Always multiply by `s`.
- **Canvas origin confusion**: (0,0) is bottom-left, not top-left. Higher `y` values move UP.
- **Double glow**: The renderer already applies `ggfx::with_outer_glow()` to every layer. Do NOT add glow inside the glyph function.
- **Too many layers**: Each layer gets individual glow wrapping. More than 8 layers makes rendering slow and visually noisy.
- **Mismatched IDs**: The skill ID in `SKILL_GLYPHS`, `icon-manifest.json`, and `_registry.yml` must all match exactly.
- **JSON trailing commas**: The manifest is strict JSON. No trailing comma after the last array element.
- **Missing domain color**: If the domain isn't in `get_cyberpunk_colors()` in `palettes.R`, rendering will error. Add the color to `palettes.R` first, then run `Rscript generate-palette-colors.R` to regenerate the JS module.

## Related Skills

- [glyph-enhance](../glyph-enhance/SKILL.md) — improve an existing glyph's visual quality, fix rendering issues, or add detail layers
- [ornament-style-mono](../ornament-style-mono/SKILL.md) — complementary AI-based image generation (Z-Image vs R-coded glyphs)
- [ornament-style-color](../ornament-style-color/SKILL.md) — color theory applicable to glyph accent fill decisions
- [create-skill](../create-skill/SKILL.md) — the parent workflow that triggers glyph creation when adding new skills
