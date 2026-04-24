---
name: enhance-glyph
locale: caveman-ultra
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

Improve existing pictogram glyph in `viz/` → audit render, diagnose issues, targeted mods, re-render, compare before/after. Works skill/agent/team.

## Use When

- Glyph renders poor small sizes (details lost, shapes merge)
- Metaphor unclear / mismatch entity
- Proportion issues (too big/small, off-center)
- Neon glow overpowers or underwhelms
- Good in 1 palette, poor others
- Batch improve after new palettes / pipeline change

## In

- **Required**: Entity type — `skill`, `agent`, `team`
- **Required**: Entity ID (e.g., `commit-changes`, `mystic`, `tending`)
- **Required**: Specific issue (readability, proportions, glow, palette compat)
- **Optional**: Reference glyph showing desired quality
- **Optional**: Target palette(s) (default: all)

## Do

### Step 1: Audit

Examine current, identify issues.

1. Locate glyph fn by entity type:
   - **Skills**: `viz/R/primitives*.R` (19 domain files), map `viz/R/glyphs.R`
   - **Agents**: `viz/R/agent_primitives.R`, map `viz/R/agent_glyphs.R`
   - **Teams**: `viz/R/team_primitives.R`, map `viz/R/team_glyphs.R`
2. Read fn structure:
   - How many layers?
   - Which primitives?
   - Scale + position?
3. View rendered output:
   - Skills: `viz/public/icons/cyberpunk/<domain>/<skillId>.webp`
   - Agents: `viz/public/icons/cyberpunk/agents/<agentId>.webp`
   - Teams: `viz/public/icons/cyberpunk/teams/<teamId>.webp`
   - Check 2-3 other palettes
   - View icon (~48px) + panel (~160px)
4. Score on **quality dimensions**:

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

5. Identify 1-2 lowest dims → enhancement targets

→ Clear diagnosis. Specific: "proportions: uses 40% canvas" not "looks bad."

If err: fn missing or entity not in `*_glyphs.R` → glyph not created → use `create-glyph`.

### Step 2: Diagnose

Root cause.

1. **Readability**:
   - Too many fine details merge small?
   - Low contrast between elements?
   - Lines too thin (< 1.5 `size` at s=1.0)?
   - Elements too close?
2. **Proportion**:
   - Scale `s` too small/large?
   - Center offset from (50, 50)?
   - Elements beyond safe area (10-90)?
3. **Glow**:
   - Stroke width + `ggfx::with_outer_glow()`:
     - Thin lines → glow fuzzy
     - Thick fills → excessive bloom
   - Multiple overlapping → compound glow hot spots
4. **Palette compat**:
   - Hardcoded colors not `col`/`bright`?
   - Low-contrast palettes (cividis, mako) make invisible?
   - Relies on color variation some palettes lack?
5. Document specific root cause each issue

→ Root causes point to code changes. "Too small" → "s=0.6, should be 0.8." "Glow overwhelms" → "3 overlapping filled polygons each generate glow."

If err: root cause not obvious from code → render isolation w/ diff params. `render_glyph()` single glyph to test.

### Step 3: Modify

Edit fn → targeted fixes.

1. Open file containing fn
2. Mods per diagnosis:
   - **Scale/proportion**: Adjust `s` multiplier or element offsets
   - **Readability**: Simplify, increase stroke width, spacing
   - **Glow balance**: Reduce overlapping fills, outlines where bloom
   - **Palette compat**: All colors from `col`/`bright`, alpha for depth
3. Follow **contract**:
   ```r
   glyph_name <- function(cx, cy, s, col, bright) {
     # cx, cy = center (50, 50)
     # s = scale (1.0 = ~70% of canvas)
     # col = domain color, bright = brightened variant
     # Returns: list() of ggplot2 layers
   }
   ```
4. Preserve signature — no param change
5. Minimal mods — fix diagnosed, no redesign

→ Modified fn addresses Step 1-2 issues. Targeted + minimal.

If err: mods make other dims worse → revert, try diff. Needs redesign → `create-glyph`.

### Step 4: Re-render

Render + verify. Always `build.sh` → handles platform + R binary. See [render-icon-pipeline](../render-icon-pipeline/SKILL.md) for flags.

1. Re-render by entity:

   ```bash
   # From project root — use --no-cache to force re-render of modified glyph
   bash viz/build.sh --only <domain> --no-cache          # skills
   bash viz/build.sh --type agent --only <id> --no-cache # agents
   bash viz/build.sh --type team --only <id> --no-cache  # teams
   ```

2. Verify output exists each palette
3. Check sizes — icons 2-15 KB (WebP):
   - Under 2 KB: too simple or render failed
   - Over 15 KB: too complex (too many layers)

→ Fresh icons each palette. Sizes in range.

If err: build errs → R console for specific. Common: missing paren, undefined primitives, non-list return. Renders but blank → layers outside canvas.

### Step 5: Compare

Verify enhancement improved targets.

1. Compare old/new:
   - Cyberpunk at icon (48px) + panel (160px)
   - ≥2 other palettes (light = turbo, dark = mako)
2. Re-score dims from Step 1:
   - Target dims ↑ ≥1 pt
   - Non-target dims no ↓
3. If in force-graph, test there:
   - HTTP server: `python3 -m http.server 8080` from `viz/`
   - Load graph, find entity node
   - Verify renders default zoom + zoomed in
4. Document changes + improvement

→ Measurable improvement on targets, no regression others. Better both sizes + all palettes.

If err: marginal improvement or regression → revert, reconsider diagnosis. Sometimes orig limit = inherent to metaphor → metaphor itself needs change (escalate `create-glyph`).

## Check

- [ ] Audited w/ specific issue diagnosis
- [ ] Root cause each issue
- [ ] Mods targeted to diagnosed (no over-edit)
- [ ] Fn contract preserved (sig unchanged)
- [ ] Re-rendered all palettes
- [ ] Before/after shows target improvement
- [ ] No regression non-target
- [ ] Sizes 2-15 KB WebP
- [ ] Renders correctly force-graph (if applicable)

## Traps

- **Over-enhance**: Fix 1 + tweak all. Stick to diagnosed.
- **Break contract**: Sig change breaks pipeline. 5-param contract immutable.
- **Palette-specific opt**: Perfect cyberpunk but poor viridis. Check 3+ palettes.
- **Ignore small-size**: Beautiful 160px that blobs at 48px = fail.
- **Forget re-render**: Edit fn no build → changes invisible.
- **Wrong build cmd**: Skills `build-icons.R`, agents `build-agent-icons.R`, teams `build-team-icons.R`.

## →

- [create-glyph](../create-glyph/SKILL.md) — new glyph scratch (enhancement insufficient)
- [audit-icon-pipeline](../audit-icon-pipeline/SKILL.md) — detect which need enhance pipeline-wide
- [render-icon-pipeline](../render-icon-pipeline/SKILL.md) — full pipeline after enhancements
- [ornament-style-mono](../ornament-style-mono/SKILL.md) — design principles applied to composition
- [chrysopoeia](../chrysopoeia/SKILL.md) — value extraction parallels optimization (amplify gold, remove dross)
