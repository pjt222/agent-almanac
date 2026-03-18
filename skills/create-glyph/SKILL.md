---
name: create-glyph
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

Create R-based pictogram glyphs for skill, agent, or team icons in the `viz/` visualization layer. Each glyph is a pure-ggplot2 function that draws a recognizable shape on a 100x100 canvas, rendered with a neon glow effect to transparent-background WebP.

## When to Use

- A new skill, agent, or team has been added and needs a visual icon
- An existing glyph needs replacement or redesign
- Batch-creating glyphs for a new domain of skills
- Prototyping visual metaphors for entity concepts

## Inputs

- **Required**: Entity type — `skill`, `agent`, or `team`
- **Required**: Entity ID (e.g., `create-glyph`, `mystic`, `r-package-review`) and domain (for skills)
- **Required**: Visual concept — what the glyph should depict
- **Optional**: Reference glyph to study for complexity level
- **Optional**: Custom `--glow-sigma` value (default: 4)

## Procedure

### Step 1: Concept — Design the Visual Metaphor

Identify the entity being iconified and choose a visual metaphor.

1. Read the entity's source file to understand its core concept:
   - Skills: `skills/<id>/SKILL.md`
   - Agents: `agents/<id>.md`
   - Teams: `teams/<id>.md`
2. Choose a metaphor type:
   - **Literal object**: a flask for experiments, a shield for security
   - **Abstract symbol**: arrows for merging, spirals for iteration
   - **Composite**: combine 2-3 simple shapes (e.g., document + pen)
3. Reference existing glyphs for complexity calibration:

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

5. Return a flat `list()` of layers (the renderer iterates and wraps each with glow)

6. Place the function in the appropriate primitives file based on entity type:
   - **Skills**: domain-grouped across 19 primitives files:
     - `primitives.R` — bushcraft, compliance, containerization, data-serialization, defensive
     - `primitives_2.R` — devops, general, git, mcp-integration
     - `primitives_3.R` — mlops, observability, PM, r-packages, reporting, review, web-dev, esoteric, design
     - Additional `primitives_4.R` through `primitives_19.R` for newer domains
   - **Agents**: `viz/R/agent_primitives.R`
   - **Teams**: `viz/R/team_primitives.R`

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

### Step 3: Register — Map Entity to Glyph

Add the entity-to-glyph mapping in the appropriate glyph mapping file.

**For skills:**
1. Open `viz/R/glyphs.R`
2. Find the comment section for the target domain (e.g., `# -- design (3)`)
3. Add the entry in alphabetical order within the domain block:
   ```r
   "skill-id" = "glyph_function_name",
   ```
4. Update the domain count in the comment if applicable

**For agents:**
1. Open `viz/R/agent_glyphs.R`
2. Find the alphabetical position in `AGENT_GLYPHS`
3. Add the entry:
   ```r
   "agent-id" = "glyph_function_name",
   ```

**For teams:**
1. Open `viz/R/team_glyphs.R`
2. Find the alphabetical position in `TEAM_GLYPHS`
3. Add the entry:
   ```r
   "team-id" = "glyph_function_name",
   ```

5. Verify no duplicate ID exists in the target list

**Expected:** The appropriate `*_GLYPHS` list contains the new mapping.

**On failure:** If the build later reports "No glyph mapped", double-check that the entity ID exactly matches the one in the manifest and registry.

### Step 4: Manifest — Add Icon Entry

Register the icon in the appropriate manifest file.

**For skills:** `viz/data/icon-manifest.json`
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

**For agents:** `viz/data/agent-icon-manifest.json`
```json
{
  "agentId": "agent-id",
  "prompt": "<agent-specific descriptors>, dark background, vector art",
  "seed": <next_seed>,
  "path": "public/icons/cyberpunk/agents/<agent-id>.webp",
  "status": "pending"
}
```

**For teams:** `viz/data/team-icon-manifest.json`
```json
{
  "teamId": "team-id",
  "prompt": "<team-specific descriptors>, dark background, vector art",
  "seed": <next_seed>,
  "path": "public/icons/cyberpunk/teams/<team-id>.webp",
  "status": "pending"
}
```

**Expected:** Valid JSON with the new entry placed among its type siblings.

**On failure:** Validate JSON syntax. Common mistakes: trailing comma after last array element, missing quotes.

### Step 5: Render — Generate the Icon

Run the build pipeline to render the WebP.

1. Navigate to the `viz/` directory
2. Render based on entity type:

**For skills:**
```bash
cd viz && Rscript build-icons.R --only <domain>
# Or skip existing: Rscript build-icons.R --only <domain> --skip-existing
```

**For agents:**
```bash
cd viz && Rscript build-agent-icons.R --only <agent-id>
# Or skip existing: Rscript build-agent-icons.R --only <agent-id> --skip-existing
```

**For teams:**
```bash
cd viz && Rscript build-team-icons.R --only <team-id>
# Or skip existing: Rscript build-team-icons.R --only <team-id> --skip-existing
```

3. For a dry run first, add `--dry-run` to any command
4. Output locations:
   - Skills: `viz/public/icons/<palette>/<domain>/<skill-id>.webp`
   - Agents: `viz/public/icons/<palette>/agents/<agent-id>.webp`
   - Teams: `viz/public/icons/<palette>/teams/<team-id>.webp`

**Expected:** The log shows `OK: <entity> (seed=XXXXX, XX.XKB)` and the WebP file exists.

**On failure:**
- `"No glyph mapped"` — Step 3 mapping is missing or has a typo
- `"Unknown domain"` — Domain not in `get_palette_colors()` in `palettes.R`
- R package errors — Run `install.packages(c("ggplot2", "ggforce", "ggfx", "ragg", "magick"))` first
- If rendering crashes, test the glyph function interactively (see Step 2 fallback)

### Step 6: Verify — Visual Inspection

Check the rendered output meets quality standards.

1. Verify file exists and has reasonable size:
   ```bash
   ls -la viz/public/icons/cyberpunk/<type-path>/<entity-id>.webp
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
   # Delete the existing icon first, then re-render
   rm viz/public/icons/cyberpunk/<type-path>/<entity-id>.webp
   # Use the appropriate build command from Step 5
   ```

3. When satisfied, verify the manifest status shows `"done"` (the build script updates it automatically on success)

**Expected:** The final icon passes all verification checks from Step 6.

**On failure:** If after 3+ iterations the glyph still doesn't read well, consider using a completely different visual metaphor (return to Step 1).

## Reference

### Domain and Entity Color Palettes

All 58 domain colors (for skills) are defined in `viz/R/palettes.R` (the single source of truth). Agent and team colors are also managed in `palettes.R`. The cyberpunk palette (hand-tuned neon colors) is in `get_cyberpunk_colors()`. Viridis-family palettes are auto-generated via `viridisLite`.

To look up a color:
```r
source("viz/R/palettes.R")
get_palette_colors("cyberpunk")$domains[["design"]]   # skill domain
get_palette_colors("cyberpunk")$agents[["mystic"]]     # agent
get_palette_colors("cyberpunk")$teams[["tending"]]     # team
```

When adding a new domain, add it to three places in `palettes.R`:
1. `PALETTE_DOMAIN_ORDER` (alphabetical)
2. `get_cyberpunk_colors()` domains list
3. Run `Rscript generate-palette-colors.R` to regenerate JSON + JS

### Glyph Function Catalog

See the full catalog of available glyph functions in the primitives source files:
- **Skills**: `viz/R/primitives.R` through `viz/R/primitives_19.R` (domain-grouped)
- **Agents**: `viz/R/agent_primitives.R`
- **Teams**: `viz/R/team_primitives.R`

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
- [ ] Function placed in correct primitives file for entity type and domain
- [ ] Glyph mapping entry added in the appropriate `*_glyphs.R` file
- [ ] Manifest entry added with correct entity ID, path, and `"status": "pending"`
- [ ] Build command runs without error (dry-run first)
- [ ] Rendered WebP exists at the expected path
- [ ] File size in expected range (15-80 KB)
- [ ] Icon reads clearly at both 1024px and ~40px display sizes
- [ ] Transparent background (no solid rectangle behind the glyph)
- [ ] Manifest status updated to `"done"` after successful render

## Common Pitfalls

- **Forgetting `* s`**: Hard-coded pixel values break when scale changes. Always multiply by `s`.
- **Canvas origin confusion**: (0,0) is bottom-left, not top-left. Higher `y` values move UP.
- **Double glow**: The renderer already applies `ggfx::with_outer_glow()` to every layer. Do NOT add glow inside the glyph function.
- **Too many layers**: Each layer gets individual glow wrapping. More than 8 layers makes rendering slow and visually noisy.
- **Mismatched IDs**: The entity ID in the glyph mapping, manifest, and registry must all match exactly.
- **JSON trailing commas**: The manifest is strict JSON. No trailing comma after the last array element.
- **Missing domain color**: If the domain isn't in `get_cyberpunk_colors()` in `palettes.R`, rendering will error. Add the color first, then regenerate.
- **Wrong primitives file**: Skills go in domain-grouped `primitives*.R`, agents in `agent_primitives.R`, teams in `team_primitives.R`.

## Related Skills

- [enhance-glyph](../enhance-glyph/SKILL.md) — improve an existing glyph's visual quality, fix rendering issues, or add detail layers
- [audit-icon-pipeline](../audit-icon-pipeline/SKILL.md) — detect missing glyphs and icons to know what needs creating
- [render-icon-pipeline](../render-icon-pipeline/SKILL.md) — run the full rendering pipeline end-to-end
- [ornament-style-mono](../ornament-style-mono/SKILL.md) — complementary AI-based image generation (Z-Image vs R-coded glyphs)
- [ornament-style-color](../ornament-style-color/SKILL.md) — color theory applicable to glyph accent fill decisions
- [create-skill](../create-skill/SKILL.md) — the parent workflow that triggers glyph creation when adding new skills
