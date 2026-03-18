---
name: enhance-glyph
description: >
  Improve an existing R-based pictogram glyph for the visualization layer.
  Covers visual audit of the current glyph, diagnosis of specific issues
  (proportions, readability, glow balance), targeted modifications to the
  glyph function, re-rendering, and before/after comparison. Works for skill,
  agent, and team glyphs. Use when a glyph renders poorly at small sizes, its
  visual metaphor is unclear, it has proportion issues, the neon glow effect is
  unbalanced, or after adding new palettes or changing the rendering pipeline.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "2.0"
  domain: design
  complexity: intermediate
  language: R
  tags: design, glyph, enhancement, icon, ggplot2, visualization, refinement
---

# Enhance Glyph

Improve an existing pictogram glyph in the `viz/` visualization layer — audit its current rendering, diagnose visual issues, apply targeted modifications, re-render, and compare before/after. Works for skill, agent, and team glyphs.

## When to Use

- A glyph renders poorly at small sizes (details lost, shapes merge)
- A glyph's visual metaphor is unclear or doesn't match the entity it represents
- A glyph has proportion issues (too large, too small, off-center)
- The neon glow effect overpowers or underwhelms the glyph
- A glyph looks good in one palette but poor in others
- Batch improvement after adding new palettes or changing the rendering pipeline

## Inputs

- **Required**: Entity type — `skill`, `agent`, or `team`
- **Required**: Entity ID of the glyph to enhance (e.g., `commit-changes`, `mystic`, `tending`)
- **Required**: Specific issue to address (readability, proportions, glow, palette compat)
- **Optional**: Reference glyph that demonstrates the desired quality level
- **Optional**: Target palette(s) to optimize for (default: all palettes)

## Procedure

### Step 1: Audit — Assess Current State

Examine the current glyph and identify specific issues.

1. Locate the glyph function based on entity type:
   - **Skills**: `viz/R/primitives*.R` (19 domain-grouped files), mapped in `viz/R/glyphs.R`
   - **Agents**: `viz/R/agent_primitives.R`, mapped in `viz/R/agent_glyphs.R`
   - **Teams**: `viz/R/team_primitives.R`, mapped in `viz/R/team_glyphs.R`
2. Read the glyph function to understand its structure:
   - How many layers does it use?
   - What primitives does it call?
   - What are the scale factors and positioning?
3. View the rendered output:
   - Skills: `viz/public/icons/cyberpunk/<domain>/<skillId>.webp`
   - Agents: `viz/public/icons/cyberpunk/agents/<agentId>.webp`
   - Teams: `viz/public/icons/cyberpunk/teams/<teamId>.webp`
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
| Metaphor       |      | Does the shape clearly represent the entity?   |
| Glow balance   |      | Glow enhances without overwhelming?            |
| Palette compat |      | Looks good across cyberpunk + viridis palettes?|
| Complexity     |      | Appropriate layer count (not too busy/sparse)? |
+----------------+------+-----------------------------------------------+
```

5. Identify the 1-2 dimensions with the lowest scores — these are the enhancement targets

**Expected:** A clear diagnosis of what's wrong with the glyph and which dimensions to improve. The audit should be specific: "proportions: glyph uses only 40% of canvas" not "looks bad."

**On failure:** If the glyph function is missing or the entity isn't in its `*_glyphs.R` mapping, the glyph may not have been created yet — use `create-glyph` instead.

### Step 2: Diagnose — Root Cause Analysis

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

**Expected:** Root causes that directly point to code changes. "The glyph is too small" -> "scale factor is 0.6 but should be 0.8." "Glow overwhelms" -> "three overlapping filled polygons each generate glow."

**On failure:** If the root cause isn't obvious from code inspection, render the glyph in isolation with different parameters to isolate the issue. Use `render_glyph()` with a single glyph to test.

### Step 3: Modify — Apply Targeted Fixes

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

**Expected:** A modified glyph function that addresses the specific issues identified in Steps 1-2. Changes are targeted and minimal — enhance, don't redesign.

**On failure:** If the modifications make other dimensions worse (e.g., fixing proportions breaks readability), revert and try a different approach. If the glyph needs a complete redesign, use `create-glyph` instead.

### Step 4: Re-render — Generate Updated Icons

Render the modified glyph and verify the fix.

1. Re-render based on entity type:

   **For skills:**
   ```bash
   cd /mnt/d/dev/p/agent-almanac/viz
   Rscript build-icons.R --only <domain> --no-cache
   ```

   **For agents:**
   ```bash
   cd /mnt/d/dev/p/agent-almanac/viz
   Rscript build-agent-icons.R --only <agent-id> --no-cache
   ```

   **For teams:**
   ```bash
   cd /mnt/d/dev/p/agent-almanac/viz
   Rscript build-team-icons.R --only <team-id> --no-cache
   ```

2. Verify the output files exist at the expected path for each palette
3. Check file sizes — icons should be 2-15 KB (WebP):
   - Under 2 KB: glyph may be too simple or rendering failed
   - Over 15 KB: glyph may be too complex (too many layers)

**Expected:** Fresh icon files generated for all palettes. File sizes are in the expected range.

**On failure:** If the build script errors, check the R console output for the specific error. Common causes: missing closing parenthesis in the glyph function, referencing undefined primitives, or returning non-list from the function. If rendering succeeds but output is blank, the glyph layers may be outside the canvas bounds.

### Step 5: Compare — Before/After Verification

Verify the enhancement improved the target dimensions.

1. Compare old and new renderings:
   - View the cyberpunk palette version at both icon (48px) and panel (160px) sizes
   - View at least 2 other palettes (one light like turbo, one dark like mako)
2. Re-score the quality dimensions from Step 1:
   - Target dimensions should improve by at least 1 point
   - Non-target dimensions should not decrease
3. If the glyph is used in the force-graph, test it there:
   - Start the HTTP server: `python3 -m http.server 8080` from `viz/`
   - Load the graph and find the entity node
   - Verify the icon renders correctly at default zoom and when zoomed in
4. Document the changes made and the improvement achieved

**Expected:** Measurable improvement on the target dimensions with no regression on others. The glyph looks better at both sizes and across palettes.

**On failure:** If improvement is marginal or regression occurs, revert the changes and reconsider the diagnosis. Sometimes the original glyph's limitations are inherent to the metaphor, not the implementation — in that case, the metaphor itself may need to change (escalate to `create-glyph`).

## Validation Checklist

- [ ] Current glyph audited with specific issue diagnosis
- [ ] Root cause identified for each issue
- [ ] Modifications targeted to diagnosed issues (not over-edited)
- [ ] Glyph function contract preserved (signature unchanged)
- [ ] Icons re-rendered for all palettes
- [ ] Before/after comparison shows improvement on target dimensions
- [ ] No regression on non-target dimensions
- [ ] File sizes in expected range (2-15 KB WebP)
- [ ] Glyph renders correctly in force-graph context (if applicable)

## Common Pitfalls

- **Over-enhancement**: Fixing one issue and then tweaking everything else. Stick to the diagnosed issues
- **Breaking the contract**: Changing the function signature breaks the rendering pipeline. The 5-parameter contract is immutable
- **Palette-specific optimization**: Making the glyph perfect for cyberpunk but poor for viridis. Always check 3+ palettes
- **Ignoring small-size rendering**: A beautiful 160px icon that becomes a blob at 48px is a failed enhancement
- **Forgetting to re-render**: Editing the function without running the build command means the changes aren't visible
- **Wrong build command**: Skills use `build-icons.R`, agents use `build-agent-icons.R`, teams use `build-team-icons.R`

## Related Skills

- [create-glyph](../create-glyph/SKILL.md) — create a new glyph from scratch (use when enhancement isn't enough)
- [audit-icon-pipeline](../audit-icon-pipeline/SKILL.md) — detect which glyphs need enhancement across the pipeline
- [render-icon-pipeline](../render-icon-pipeline/SKILL.md) — run the full rendering pipeline after enhancements
- [ornament-style-mono](../ornament-style-mono/SKILL.md) — visual design principles that apply to glyph composition
- [chrysopoeia](../chrysopoeia/SKILL.md) — value extraction methodology parallels glyph optimization (amplify gold, remove dross)
