---
name: restore-diagram-legibility
description: >
  Restore legibility to an auto-generated graph diagram that has outgrown its
  canvas - rendering at single-digit percent scale with sub-pixel labels.
  Covers the levers that measurably reduce layout units (source-level label
  wrapping, invisible chain links so unconnected nodes stop spreading into one
  row, per-cluster splitting, layout direction picked by rendering both and
  measuring) and the rejected ones (raising the render font is a no-op because
  layout engines measure in text units; a topology heuristic for direction
  regressed 13 of 38 diagrams). Use when a generated Mermaid/Graphviz/DOT
  diagram is too small to read; not for hand-authoring a small diagram.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: visualization
  complexity: intermediate
  language: multi
  tags: visualization, diagrams, mermaid, graphviz, layout, legibility
  locale: es
  source_locale: en
  source_commit: ae8ae3dc
  translator: "Claude + human review"
  translation_date: "2026-07-22"
---

# Restore Diagram Legibility

Make an auto-generated graph diagram readable again after it has outgrown its
canvas. The content is usually fine — forced to 1:1 the labels are crisp — so
this is a delivery failure, not an authoring one, and the fix is reducing the
diagram's *layout units*, not styling its text.

All numbers in this skill are one measured instance (a 39-diagram corpus,
2026-07), shipped as evidence that a lever moves the needle — never as targets.

## When to Use

- A generated Mermaid/Graphviz/DOT diagram renders at single-digit percent
  scale in its display column, putting nominal 12px labels below ~1px
- Fullscreen or zoom helps by 2x against a 10x+ deficit
- The same diagram is legible when force-rendered at 1:1 (content is fine)
- NOT for hand-authoring a small diagram, and NOT for aesthetic styling —
  see `create-2d-composition` for composition work

## Inputs

- **Required**: The diagram source (Mermaid, Graphviz/DOT, or another
  Sugiyama/Dagre-family layout input)
- **Required**: A way to render and measure output width in layout units or
  pixels (CLI renderer, browser devtools, or the generated SVG's viewBox)
- **Optional**: The display context's column width, to compute effective
  label size (nominal font px x render scale)

## Procedure

### Step 1: Measure the Deficit Before Touching Anything

Compute the render scale and effective label size; confirm the situation
matches this skill.

```bash
# SVG output: viewBox width = layout units. Effective label px =
# nominal font px * (display column px / viewBox width).
grep -o 'viewBox="[^"]*"' diagram.svg
# e.g. viewBox="0 0 2685 900" in a 640px column:
# scale = 640/2685 = 23.8%; a 12px label renders at 2.9px
```

One measured instance: a system map rendered at 6.9% scale — nominal 12px
labels at 0.83px effective. Fullscreen was a 2x improvement against a ~15x
deficit.

**Expected:** A number pair (scale %, effective label px) and confirmation
that a 1:1 render is crisp. If 1:1 is also illegible, the problem is
authoring, not delivery — stop here, this skill does not apply.

**On failure:** If the renderer emits raster only, measure image width vs
display width instead; the ratio is the same scale factor.

### Step 2: Skip the Two Levers That Measurably Do Not Work

Do not spend time on these; both were killed by measurement.

1. **Raising the render font is a no-op.** Sugiyama/Dagre-family layout
   engines measure node sizes in text units, so the canvas grows with the
   font and the ratio barely moves. Measured: 5.2px -> 8.3px effective for a
   much larger file — against a 10x+ deficit. This is a property of the
   layout family, not of any one tool version.
2. **Predicting layout direction from topology fails.** A star-shape
   heuristic (one hub holding most edges -> flip direction) helped the two
   diagrams still too wide but regressed 13 of 38 others, dropping the
   median effective label from 25.9px to 16.3px. Direction can only be
   measured (Step 6), not predicted.

**Expected:** Neither lever is attempted; effort goes to Steps 3-6.

**On failure:** If a font increase was already applied, revert it before
measuring the real levers — it inflates layout units and masks their effect.

### Step 3: Wrap Long Labels at the Source

Node width tracks the longest unbroken line in the label, and total canvas
width follows. Break labels into short lines in the diagram source (Mermaid:
`<br/>` inside the label text; Graphviz: `\n` in the label attribute).

One measured instance: 2685 -> 901 layout units from wrapping alone.

**Expected:** Canvas width in layout units drops substantially on re-render;
labels occupy 2-3 short lines instead of one long one.

**On failure:** If wrapping changes nothing, the width driver is elsewhere —
check for one very wide row of disconnected nodes (Step 4) or a single
oversized cluster (Step 5).

### Step 4: Chain Disconnected Components with Invisible Links

Layout engines place nodes with no edges in one wide row, spreading the
canvas. Add invisible links (Mermaid: `~~~`; Graphviz: `style=invis` edges)
between disconnected components so the engine stacks them instead.

One measured instance: 3292 -> 881 layout units. The worst single case was a
cluster 3292 units wide holding 6 nodes and zero edges.

**Expected:** Disconnected nodes stack into rows/columns; canvas width drops.

**On failure:** If the renderer treats the invisible-link syntax as a real
edge (arrows appear), check the tool's spelling for an invisible or
unstyled link; the construct is general even where the syntax differs.

### Step 5: Split One Canvas into Per-Cluster Diagrams

A whole system on one canvas divides one column width across every parallel
cluster. Emit one diagram per cluster (or per subsystem) instead; the index
page links them.

One measured instance: median effective label size went 0.8px -> 25.9px.
Do NOT pick split candidates by node count — in the measured corpus the
illegible clusters had a median of 6 nodes, identical to the legible ones;
width, not membership, is the axis.

**Expected:** Each split diagram is independently legible at its display
size; nothing shares a canvas with an unrelated cluster.

**On failure:** If clusters are interlinked so splitting breaks edges,
duplicate boundary nodes into both diagrams with a visual marker rather
than keeping one merged canvas.

### Step 6: Pick Layout Direction by Rendering Both and Measuring

Direction (top-down vs left-right) is shape-dependent: measure, do not
predict (Step 2.2). Render the diagram in both directions, compare canvas
width in layout units, keep the narrower.

One measured instance: 2682 -> 1311 units from a direction flip — on that
diagram; the same flip regresses others, which is why the comparison is
per-diagram.

**Expected:** Both renders exist; the kept direction is the measured winner
for this diagram, not a global default.

**On failure:** If both directions are still too wide, return to Steps 3-5;
direction is the last lever, not the first.

### Step 7: Re-Measure and Record the Numbers

Recompute scale % and effective label px per diagram. Record before/after in
the commit or PR that ships the change, as one measured instance.

Across the measured 39-diagram corpus: median effective label 13.7px ->
25.9px; 30/39 -> 37/39 diagrams at 10px or better.

**Expected:** The before/after pair is recorded next to the change; any
diagram still below the display's legibility floor is listed explicitly,
not averaged away.

**On failure:** If a diagram resists all four levers, say so in the record —
an explicit residual beats a silently truncated claim of success.

## Validation

- [ ] Deficit measured before any change (scale %, effective label px, 1:1 crispness confirmed)
- [ ] Neither rejected lever (render font size, topology-predicted direction) was applied
- [ ] Canvas width in layout units recorded before/after each applied lever
- [ ] Direction chosen by rendering both and comparing, per diagram
- [ ] Before/after numbers recorded as one measured instance, not stated as targets
- [ ] Any still-illegible residual diagrams listed explicitly

## Common Pitfalls

- **Raising the render font**: Layout engines measure in text units, so the canvas grows with the font — measured 5.2px -> 8.3px against a 10x+ deficit, at a much larger file size. Wrap the text instead; the lever is the text, not the font
- **Predicting direction from topology**: A hub-shape heuristic regressed 13 of 38 diagrams (median 25.9px -> 16.3px). Render both directions and measure; direction is per-diagram
- **Splitting by node count**: The wrong axis — illegible and legible clusters had the same median node count (6); one 6-node zero-edge cluster was 3292 units wide. Split by measured width
- **Shipping the numbers as targets**: Every figure here is one measured instance. Copying "901 units" or "25.9px" into acceptance criteria turns evidence into cargo cult; measure your own corpus
- **A rejected approach without its measurement**: "We tried X, it did not help" is not a negative result — it earns its place only with the measurement that killed it, so the next reader can check whether their case differs

## Related Skills

- [generate-workflow-diagram](../generate-workflow-diagram/SKILL.md) - produces the generated diagrams this skill makes legible
- [create-2d-composition](../create-2d-composition/SKILL.md) - authoring-side composition and layout, when the content itself is the problem
- [render-publication-graphic](../render-publication-graphic/SKILL.md) - DPI/color-profile/print delivery once the diagram is legible on screen
- [stale-proof-rendered-numbers](../stale-proof-rendered-numbers/SKILL.md) - keeping recorded measurements from rotting once shipped

<!-- Keep under 500 lines. Extract large examples to references/EXAMPLES.md if needed. -->
