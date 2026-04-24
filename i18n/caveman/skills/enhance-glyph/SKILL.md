---
name: enhance-glyph
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
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

Improve existing pictogram glyph in `viz/` viz layer — audit how it renders, diagnose issues, apply tight fixes, re-render, and compare before/after. Works for skill, agent, team glyphs.

## When Use

- Glyph renders poor at small size (details lost, shapes merge)
- Glyph visual meaning unclear or not match entity
- Glyph has proportion issue (too big, too small, off-center)
- Neon glow eats glyph or too weak
- Glyph good in one palette, poor in others
- Batch fix after new palette or new render pipeline

## Inputs

- **Required**: Entity type — `skill`, `agent`, or `team`
- **Required**: Entity ID of glyph to enhance (e.g., `commit-changes`, `mystic`, `tending`)
- **Required**: Specific issue to fix (readability, proportions, glow, palette compat)
- **Optional**: Reference glyph that shows target quality
- **Optional**: Target palette(s) to tune for (default: all palettes)

## Steps

### Step 1: Audit — Check Current State

Look at current glyph; spot specific issues.

1. Find glyph function by entity type:
   - **Skills**: `viz/R/primitives*.R` (19 domain-grouped files), mapped in `viz/R/glyphs.R`
   - **Agents**: `viz/R/agent_primitives.R`, mapped in `viz/R/agent_glyphs.R`
   - **Teams**: `viz/R/team_primitives.R`, mapped in `viz/R/team_glyphs.R`
2. Read glyph function to grasp shape:
   - How many layers?
   - What primitives call?
   - What scale factors and place?
3. View rendered output:
   - Skills: `viz/public/icons/cyberpunk/<domain>/<skillId>.webp`
   - Agents: `viz/public/icons/cyberpunk/agents/<agentId>.webp`
   - Teams: `viz/public/icons/cyberpunk/teams/<teamId>.webp`
   - If can, check 2-3 other palettes for cross-palette render
   - View at icon size (~48px in graph) and panel size (~160px in detail panel)
4. Score glyph on **quality dimensions**:

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

5. Spot 1-2 dimensions with lowest scores — these are fix targets

**Got:** Clear pick of what wrong with glyph and which dimension to fix. Audit specific: "proportions: glyph uses only 40% of canvas" not "looks bad."

**If fail:** Glyph function missing or entity not in its `*_glyphs.R` map? Glyph maybe not made yet — use `create-glyph` instead.

### Step 2: Diagnose — Root Cause

Find why issues exist.

1. For **readability** issues:
   - Too many fine details that merge at small size?
   - Weak contrast between glyph elements?
   - Lines too thin (< 1.5 `size` at s=1.0)?
   - Elements too close?
2. For **proportion** issues:
   - Scale factor `s` too small or too big?
   - Center off from (50, 50)?
   - Elements past safe area (10-90 range)?
3. For **glow** issues:
   - Glyph stroke width mixes with `ggfx::with_outer_glow()`:
     - Thin lines: glow make fuzzy
     - Thick fills: glow add bloom
   - Many overlap elements: stacked glow make hot spots
4. For **palette compat** issues:
   - Glyph use hardcoded colors, not `col`/`bright` params?
   - Low-contrast palettes (cividis, mako) hide glyph?
   - Glyph needs color variation some palettes miss?
5. Write specific root cause for each issue

**Got:** Root causes that point to code change. "Glyph too small" -> "scale factor 0.6 but should be 0.8." "Glow eats" -> "three overlap filled polygons each make glow."

**If fail:** Root cause not clear from code read? Render glyph alone with different params to isolate. Use `render_glyph()` with one glyph to test.

### Step 3: Modify — Apply Tight Fixes

Edit glyph function to fix diagnosed issues.

1. Open file with glyph function
2. Apply fixes matched to diagnosis:
   - **Scale/proportion**: Tune `s` multiplier or element offsets
   - **Readability**: Simplify complex parts, thicker stroke, add space
   - **Glow balance**: Fewer overlap filled areas, use outlines where fills bloom
   - **Palette compat**: All colors from `col`/`bright` params, add alpha for depth
3. Follow **glyph function contract**:
   ```r
   glyph_name <- function(cx, cy, s, col, bright) {
     # cx, cy = center (50, 50)
     # s = scale (1.0 = ~70% of canvas)
     # col = domain color, bright = brightened variant
     # Returns: list() of ggplot2 layers
   }
   ```
4. Keep function signature — do not change params
5. Keep changes tight: fix diagnosed issues, do not redesign whole glyph

**Got:** Modified glyph function that fix specific issues from Steps 1-2. Changes tight and minimal — enhance, not redesign.

**If fail:** Fixes make other dimensions worse (e.g., fixing proportions breaks readability)? Revert and try other path. If glyph need full redesign, use `create-glyph` instead.

### Step 4: Re-render — Make New Icons

Render modified glyph and check fix. Always use `build.sh` — it handles platform detect and R binary pick. See [render-icon-pipeline](../render-icon-pipeline/SKILL.md) for full flag list.

1. Re-render by entity type:

   ```bash
   # From project root — use --no-cache to force re-render of modified glyph
   bash viz/build.sh --only <domain> --no-cache          # skills
   bash viz/build.sh --type agent --only <id> --no-cache # agents
   bash viz/build.sh --type team --only <id> --no-cache  # teams
   ```

2. Check output files at expected path for each palette
3. Check file sizes — icons should be 2-15 KB (WebP):
   - Under 2 KB: glyph maybe too simple or render fail
   - Over 15 KB: glyph maybe too complex (too many layers)

**Got:** Fresh icon files made for all palettes. File sizes in expected range.

**If fail:** Build script errors? Check R console output for specific error. Common: missing close paren in glyph function, ref undefined primitives, or return non-list from function. If render OK but output blank, glyph layers maybe outside canvas bounds.

### Step 5: Compare — Before/After Check

Check fix improved target dimensions.

1. Compare old and new renderings:
   - View cyberpunk palette at icon (48px) and panel (160px) sizes
   - View at least 2 other palettes (one light like turbo, one dark like mako)
2. Re-score quality dimensions from Step 1:
   - Target dimensions should improve by at least 1 point
   - Non-target dimensions should not drop
3. If glyph used in force-graph, test there:
   - Start HTTP server: `python3 -m http.server 8080` from `viz/`
   - Load graph and find entity node
   - Check icon renders right at default zoom and zoomed in
4. Write what changes made and gain reached

**Got:** Measurable gain on target dimensions with no drop on others. Glyph looks better at both sizes and across palettes.

**If fail:** Gain tiny or drop happens? Revert changes and rethink diagnosis. Sometimes old glyph limits come from metaphor, not code — then metaphor itself may need change (escalate to `create-glyph`).

## Validation Checklist

- [ ] Current glyph audited with specific issue call
- [ ] Root cause found for each issue
- [ ] Changes tight to diagnosed issues (not over-edited)
- [ ] Glyph function contract kept (signature unchanged)
- [ ] Icons re-rendered for all palettes
- [ ] Before/after compare shows gain on target dimensions
- [ ] No drop on non-target dimensions
- [ ] File sizes in expected range (2-15 KB WebP)
- [ ] Glyph renders right in force-graph context (if used)

## Pitfalls

- **Over-enhancement**: Fix one issue then tweak everything else. Stick to diagnosed issues
- **Break contract**: Change function signature break render pipeline. 5-param contract is fixed
- **Palette-specific tune**: Make glyph perfect for cyberpunk but poor for viridis. Always check 3+ palettes
- **Ignore small-size render**: Pretty 160px icon that become blob at 48px is fail
- **Forget re-render**: Edit function without run build cmd means changes not visible
- **Wrong build cmd**: Skills use `build-icons.R`, agents use `build-agent-icons.R`, teams use `build-team-icons.R`

## See Also

- [create-glyph](../create-glyph/SKILL.md) — make new glyph from scratch (when enhance not enough)
- [audit-icon-pipeline](../audit-icon-pipeline/SKILL.md) — spot which glyphs need fix across pipeline
- [render-icon-pipeline](../render-icon-pipeline/SKILL.md) — run full render pipeline after fixes
- [ornament-style-mono](../ornament-style-mono/SKILL.md) — visual design rules that apply to glyph composition
- [chrysopoeia](../chrysopoeia/SKILL.md) — value extraction method parallels glyph tune (amplify gold, drop dross)
