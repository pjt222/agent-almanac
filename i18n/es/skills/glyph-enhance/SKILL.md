---
name: glyph-enhance
description: >
  Improve an existing R-based pictogram glyph for the visualization layer.
  Covers visual audit of the current glyph, diagnosis of specific issues
  (proportions, readability, glow balance), targeted modifications to the
  glyph function, re-rendering, and before/after comparison. Use when a glyph
  renders poorly at small sizes, its visual metaphor is unclear, it has
  proportion issues, the neon glow effect is unbalanced, or after adding new
  palettes or changing the rendering pipeline.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: design
  complexity: intermediate
  language: R
  tags: design, glyph, enhancement, icon, ggplot2, visualization, refinement
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Glyph Enhance

Improve an existing pictogram glyph in the `viz/` visualization layer — audit its current rendering, diagnose visual issues, apply targeted modifications, re-render, and compare before/after.

## Cuándo Usar

- A glyph renders poorly at small sizes (details lost, shapes merge)
- A glyph's visual metaphor is unclear or doesn't match the skill it represents
- A glyph has proportion issues (too large, too small, off-center)
- The neon glow effect overpowers or underwhelms the glyph
- A glyph looks good in one palette but poor in others
- Batch improvement after adding new palettes or changing the rendering pipeline

## Entradas

- **Requerido**: Skill ID of the glyph to enhance (e.g., `commit-changes`)
- **Requerido**: Specific issue to address (readability, proportions, glow, palette compat)
- **Opcional**: Reference glyph that demonstrates the desired quality level
- **Opcional**: Target palette(s) to optimize for (default: all palettes)

## Procedimiento

### Paso 1: Audit — Assess Current State

Examine the current glyph and identify specific issues.

1. Locate the glyph function:
   - Skill glyphs: `viz/R/primitives*.R` and mapped in `viz/R/glyphs.R`
   - Agent glyphs: `viz/R/agent_primitives.R` and mapped in `viz/R/agent_glyphs.R`
2. Read the glyph function to understand its structure:
   - How many layers does it use?
   - What primitives does it call (from `primitives.R`, `primitives_2.R`, etc.)?
   - What are the scale factors and positioning?
3. View the rendered output:
   - Check `viz/public/icons/cyberpunk/<domain>/<skillId>.webp` as the reference palette
   - If available, check 2-3 other palettes for cross-palette rendering
   - View at both icon size (~48px in the graph) and panel size (~160px in the detail panel)
4. Score the glyph on the **quality dimensions**:

```
Glyph Quality Dimensions:
+----------------+------+-----------------------------------------------+
| Dimension      | 1-5  | Assessment Criteria                           |
+----------------+------+-----------------------------------------------+
| Readability    |      | Recognizable at 48px? Clear at 160px?         |
| Proportions    |      | Well-centered? Good use of the 100x100 canvas?|
| Metaphor       |      | Does the shape clearly represent the skill?    |
| Glow balance   |      | Glow enhances without overwhelming?            |
| Palette compat |      | Looks good across cyberpunk + viridis palettes?|
| Complexity     |      | Appropriate layer count (not too busy/sparse)? |
+----------------+------+-----------------------------------------------+
```

5. Identify the 1-2 dimensions with the lowest scores — these are the enhancement targets

**Esperado:** A clear diagnosis of what's wrong with the glyph and which dimensions to improve. The audit should be specific: "proportions: glyph uses only 40% of canvas" not "looks bad."

**En caso de fallo:** If the glyph function is missing or the skill isn't in `glyphs.R`, the glyph may not have been created yet — use `create-skill-glyph` instead.

### Paso 2: Diagnose — Root Cause Analysis

Determine why the identified issues exist.

1. For **readability** issues:
   - Too many fine details that merge at small sizes?
   - Insufficient contrast between glyph elements?
   - Lines too thin (< 1.5 `size` at s=1.0)?
   - Elements too close together?
2. For **proportion** issues:
   - Scale factor `s` too small or too large?
   - Center offset from (50, 50)?
   - Elements extending beyond the safe area (10-90 range)?
3. For **glow** issues:
   - Glyph stroke width interacts with `ggfx::with_outer_glow()`:
     - Thin lines: glow makes them fuzzy
     - Thick fills: glow adds excessive bloom
   - Multiple overlapping elements: compound glow creates hot spots
4. For **palette compatibility** issues:
   - Glyph uses hardcoded colors instead of `col`/`bright` parameters?
   - Low-contrast palettes (cividis, mako) make the glyph invisible?
   - The glyph relies on color variation that some palettes don't provide?
5. Document the specific root cause for each issue

**Esperado:** Root causes that directly point to code changes. "The glyph is too small" → "scale factor is 0.6 but should be 0.8." "Glow overwhelms" → "three overlapping filled polygons each generate glow."

**En caso de fallo:** If the root cause isn't obvious from code inspection, render the glyph in isolation with different parameters to isolate the issue. Use `render_glyph()` with a single glyph to test.

### Paso 3: Modify — Apply Targeted Fixes

Edit the glyph function to address the diagnosed issues.

1. Open the file containing the glyph function
2. Apply modifications specific to the diagnosis:
   - **Scale/proportion**: Adjust `s` multiplier or element offsets
   - **Readability**: Simplify complex elements, increase stroke width, add spacing
   - **Glow balance**: Reduce overlapping filled areas, use outlines where fills create bloom
   - **Palette compat**: Ensure all colors derive from `col`/`bright` parameters, add alpha for depth
3. Follow the **glyph function contract**:
   ```r
   glyph_name <- function(cx, cy, s, col, bright) {
     # cx, cy = center (50, 50)
     # s = scale (1.0 = ~70% of canvas)
     # col = domain color, bright = brightened variant
     # Returns: list() of ggplot2 layers
   }
   ```
4. Preserve the function signature — do not change parameters
5. Keep modifications minimal: fix the diagnosed issues, don't redesign the entire glyph

**Esperado:** A modified glyph function that addresses the specific issues identified in Steps 1-2. Changes are targeted and minimal — enhance, don't redesign.

**En caso de fallo:** If the modifications make other dimensions worse (e.g., fixing proportions breaks readability), revert and try a different approach. If the glyph needs a complete redesign, use `create-skill-glyph` instead.

### Paso 4: Re-render — Generate Updated Icons

Render the modified glyph and verify the fix.

1. Re-render the specific glyph using the build pipeline:
   ```bash
   cd /mnt/d/dev/p/agent-almanac/viz
   Rscript build-icons.R --only <domain> --no-cache
   ```
   For agent glyphs:
   ```bash
   Rscript build-agent-icons.R --only <agent-id> --no-cache
   ```
2. Verify the output files exist:
   - `viz/public/icons/<palette>/<domain>/<skillId>.webp` for each palette
3. Check file sizes — icons should be 2-15 KB (WebP):
   - Under 2 KB: glyph may be too simple or rendering failed
   - Over 15 KB: glyph may be too complex (too many layers)

**Esperado:** Fresh icon files generated for all palettes. File sizes are in the expected range.

**En caso de fallo:** If `build-icons.R` errors, check the R console output for the specific error. Common causes: missing closing parenthesis in the glyph function, referencing undefined primitives, or returning non-list from the function. If rendering succeeds but output is blank, the glyph layers may be outside the canvas bounds.

### Paso 5: Compare — Before/After Verification

Verify the enhancement improved the target dimensions.

1. Compare old and new renderings:
   - View the cyberpunk palette version at both icon (48px) and panel (160px) sizes
   - View at least 2 other palettes (one light like turbo, one dark like mako)
2. Re-score the quality dimensions from Step 1:
   - Target dimensions should improve by at least 1 point
   - Non-target dimensions should not decrease
3. If the glyph is used in the force-graph, test it there:
   - Start the HTTP server: `python3 -m http.server 8080` from `viz/`
   - Load the graph and find the skill node
   - Verify the icon renders correctly at default zoom and when zoomed in
4. Document the changes made and the improvement achieved

**Esperado:** Measurable improvement on the target dimensions with no regression on others. The glyph looks better at both sizes and across palettes.

**En caso de fallo:** If improvement is marginal or regression occurs, revert the changes and reconsider the diagnosis. Sometimes the original glyph's limitations are inherent to the metaphor, not the implementation — in that case, the metaphor itself may need to change (escalate to `create-skill-glyph`).

## Validación

- [ ] Current glyph audited with specific issue diagnosis
- [ ] Root cause identified for each issue
- [ ] Modifications targeted to diagnosed issues (not over-edited)
- [ ] Glyph function contract preserved (signature unchanged)
- [ ] Icons re-rendered for all palettes
- [ ] Before/after comparison shows improvement on target dimensions
- [ ] No regression on non-target dimensions
- [ ] File sizes in expected range (2-15 KB WebP)
- [ ] Glyph renders correctly in force-graph context (if applicable)

## Errores Comunes

- **Over-enhancement**: Fixing one issue and then tweaking everything else. Stick to the diagnosed issues
- **Breaking the contract**: Changing the function signature breaks the rendering pipeline. The 5-parameter contract is immutable
- **Palette-specific optimization**: Making the glyph perfect for cyberpunk but poor for viridis. Always check 3+ palettes
- **Ignoring small-size rendering**: A beautiful 160px icon that becomes a blob at 48px is a failed enhancement
- **Forgetting to re-render**: Editing the function without running `build-icons.R` means the changes aren't visible

## Habilidades Relacionadas

- `create-skill-glyph` — Create a new glyph from scratch (use when enhancement isn't enough)
- `ornament-style-mono` — Visual design principles that apply to glyph composition
- `chrysopoeia` — Value extraction methodology parallels glyph optimization (amplify gold, remove dross)
