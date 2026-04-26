---
name: ornament-style-color
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Design polychromatic ornamental patterns grounded in Alexander Speltz's classical
  ornament taxonomy. Builds on monochrome structural analysis by adding period-authentic
  color palettes, color-to-motif mapping, and rendering styles suited to painted,
  illuminated, and glazed ornament. Use when creating decorative designs where color
  is integral to the tradition (Islamic tilework, illuminated manuscripts, Art Nouveau),
  exploring how historical periods used color in ornament, or producing colored reference
  imagery for design, illustration, or educational materials.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: design
  complexity: intermediate
  language: natural
  tags: design, ornament, polychromatic, color, art-history, speltz, generative-ai, z-image
---

# Ornament Style — Color

Polychromatic ornament: art-history color knowledge + AI image gen. Builds on `ornament-style-mono` w/ period-authentic palettes, harmony, rendering for painted/illuminated/glazed.

## Use When

- Color integral to tradition (Islamic tile, illuminated MS, Art Nouveau)
- Explore how periods used color (palette, distribution, symbolism)
- Color reference imagery for design/illustration/edu
- Painted/illuminated/glazed/stained-glass renderings
- Study color-form relationship in ornament

## In

- **Required**: Period or style (or "surprise me")
- **Required**: Application (border, medallion, frieze, panel, tile, standalone)
- **Optional**: Palette pref (period, custom, specific colors)
- **Optional**: Motif pref (acanthus, arabesque, rosette)
- **Optional**: Rendering style (painted, illuminated, glazed tile, stained glass, watercolor)
- **Optional**: Mood (muted/balanced/vivid)
- **Optional**: Resolution + aspect
- **Optional**: Seed for reproducibility

## Do

### Step 1: Pick period + palette

Each period's palette = pigments avail + culture + material.

```
Historical Ornament Periods with Characteristic Palettes:
┌───────────────────┬─────────────────┬────────────────────────────────────────────────────────┐
│ Period            │ Date Range      │ Characteristic Palette                                  │
├───────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Egyptian          │ 3100–332 BCE    │ Lapis blue, gold/ochre, terracotta red, black, white   │
│                   │                 │ Mineral pigments: flat, unmodulated, high contrast      │
├───────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Greek             │ 800–31 BCE      │ Terracotta red, black, ochre, white, blue (rare)       │
│                   │                 │ Pottery palette; architectural color largely lost        │
├───────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Roman             │ 509 BCE–476 CE  │ Pompeii red, ochre yellow, black, white, verdigris     │
│                   │                 │ Fresco palette: warm earth tones, strong red dominant    │
├───────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Byzantine         │ 330–1453 CE     │ Gold (dominant), deep blue, crimson, purple, white      │
│                   │                 │ Mosaic tesserae: jewel tones, gold ground, luminous      │
├───────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Islamic           │ 7th–17th c.     │ Turquoise/cobalt blue, white, gold, emerald green       │
│                   │                 │ Tile glazes: luminous, saturated, geometric precision    │
├───────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Romanesque        │ 1000–1200 CE    │ Ochre, rust red, deep green, dark blue, cream           │
│                   │                 │ Manuscript and stone: earthy, muted, mineral-derived     │
├───────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Gothic            │ 1150–1500 CE    │ Ultramarine blue, ruby red, emerald green, gold, white  │
│                   │                 │ Stained glass + illumination: saturated, luminous        │
├───────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Renaissance       │ 1400–1600 CE    │ Rich earth tones, azure blue, gold leaf, warm greens    │
│                   │                 │ Oil and fresco: naturalistic, modulated, subtle          │
├───────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Baroque/Rococo    │ 1600–1780 CE    │ Pastel pink, powder blue, cream, gold, soft green       │
│                   │                 │ (Rococo) vs deep burgundy, gold, forest green (Baroque) │
├───────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Art Nouveau       │ 1890–1910 CE    │ Sage green, dusty rose, amber/gold, muted purple,      │
│                   │                 │ teal. Organic, muted, nature-derived palette             │
└───────────────────┴─────────────────┴────────────────────────────────────────────────────────┘
```

1. User specified → confirm + note palette
2. "Surprise me" → random, weight rich-color periods (Islamic, Byzantine, Gothic, Art Nouveau)
3. Note material (fresco, mosaic, tile, stained glass, print) → affects rendering

→ Period IDed w/ palette + material context.

If err: period not in table → WebSearch "[period] ornament color palette pigments", construct entry. Pigment avail = reliable guide.

### Step 2: Define palette

Translate to specific 3-5 color set w/ roles.

**Color Role Framework:**
```
Color Distribution (60/30/10 Rule):
┌──────────────┬────────────┬──────────────────────────────────────────┐
│ Role         │ Proportion │ Function                                  │
├──────────────┼────────────┼──────────────────────────────────────────┤
│ Dominant     │ ~60%       │ Ground color or primary structural color  │
│ Secondary    │ ~30%       │ Motif fill or supporting structural color │
│ Accent       │ ~10%       │ Highlights, details, focal points         │
│ (Optional)   │ —          │ Additional accent or metallic (gold)      │
│ (Optional)   │ —          │ Background / ground if different from     │
│              │            │ dominant                                   │
└──────────────┴────────────┴──────────────────────────────────────────┘
```

**Harmony Approaches:**
- **Period-Authentic**: only colors of period's pigments + materials
- **Complementary**: opposing wheel colors (blue + gold/orange) — high contrast
- **Analogous**: adjacent (sage, teal, muted blue) — harmonious, subtle
- **Triadic**: 3 equally spaced (red, blue, gold) — vibrant, balanced

1. Pick 3-5 colors w/ named roles
2. Choose harmony
3. Assign approx hex / descriptive names
4. Note mood: muted/balanced/vivid

**Example Palettes:**
- **Islamic Tilework**: turquoise (dom), white (sec), cobalt (accent), gold (detail) — analogous + metallic — vivid
- **Art Nouveau**: sage green (dom), dusty rose (sec), amber gold (accent) — analogous — muted
- **Byzantine Mosaic**: gold (dom), deep blue (sec), crimson (accent), white (detail) — complementary — vivid

→ 3-5 named colors w/ roles, proportions, harmony, mood.

If err: arbitrary feel → anchor to material context. Ask "what pigments avail?" + "ground material?" (gold leaf on vellum, glaze on ceramic, paint on plaster). Material constrains + authenticates.

### Step 3: Analyze motif structure

Same as `ornament-style-mono` Step 2, plus color-to-structure mapping.

1. Structural analysis (mono Step 2):
   - Symmetry (bilateral, radial, translational, point)
   - Scaffold (circle, rectangle, triangle, band)
   - Fill (solid, line, open, mixed)
   - Edge (clean, organic, interlocking)

2. **Color-to-structure mapping**:
   - Which structural elements get which colors?
   - Color follows form (each shape one color) or flows (gradients cross structure)?
   - Where does accent appear? (focal points, intersections, small details)
   - Ground/background color?

**Example:**
```
Islamic Star Pattern:
- Star forms: turquoise (dominant)
- Interlocking geometric ground: white (secondary)
- Star center details: cobalt blue (accent)
- Outline/border: gold (detail)
→ Color follows form strictly — each geometric shape is one flat color
```

→ Structural desc w/ explicit color assignments per element.

If err: mapping unclear → study examples via WebSearch "[period] [motif] ornament color". Historical color clarifies structure, doesn't obscure.

### Step 4: Construct color prompt

Build Z-Image prompt w/ palette + style.

**Template:**
```
[Rendering style] of [motif name] ornament in the [period] style,
[composition type], [color palette description],
[color mood], [structural details from Step 3],
[application context], [additional qualifiers]
```

**Color-Appropriate Rendering Styles:**
- `painted ornament` — brushwork, opaque, fresco/oil quality
- `illuminated manuscript` — gold leaf, jewel tones, vellum
- `glazed ceramic tile` — glossy, flat color, precise edges
- `stained glass` — translucent, dark leading
- `watercolor illustration` — transparent washes, soft, paper visible
- `enamel on metal` — hard glossy, metallic ground
- `mosaic` — small tesserae, visible gaps, luminous
- `printed poster` — flat areas, Art Nouveau / Arts & Crafts

**Color Description:**
- Specific names: "turquoise blue and gold on white ground"
- Mood: "muted antique tones" / "vivid saturated jewel"
- Distribution: "blue dominant w/ gold accents" / "warm earth tones w/ red details"

**Example Prompts:**
- `glazed ceramic tile ornament in the Islamic style, geometric star pattern, turquoise blue and white with cobalt blue accents and gold outlines, vivid saturated colors, repeating tessellation, Iznik tilework quality`
- `illuminated manuscript border in the Gothic style, vine and trefoil ornament, ultramarine blue and ruby red with gold leaf details on cream vellum, rich jewel tones, vertical panel, medieval book of hours quality`
- `watercolor illustration of Art Nouveau floral ornament, whiplash curves with lily motif, sage green and dusty rose with amber gold accents, muted organic tones, vertical panel, Alphonse Mucha influence`

→ Prompt 25-50 words: rendering, motif, period, composition, explicit color.

If err: color wrong in output → front-load color desc (before motif). Z-Image weights earlier tokens more. Try hex / known pigment names (ultramarine, vermillion, ochre).

### Step 5: Configure params

Color often needs more steps than mono.

```
Resolution by Application (same as ornament-style-mono):
┌────────────────────┬─────────────────────┬────────────────────────────────┐
│ Application        │ Recommended         │ Rationale                      │
├────────────────────┼─────────────────────┼────────────────────────────────┤
│ Medallion / Roundel│ 1024x1024 (1:1)     │ Radial symmetry needs square   │
│ Tile / Repeat Unit │ 1024x1024 (1:1)     │ Square for seamless tiling     │
│ Horizontal Frieze  │ 1280x720 (16:9)     │ Wide format for running border │
│ Vertical Panel     │ 720x1280 (9:16)     │ Portrait format for columns    │
│ Wide Border        │ 1344x576 (21:9)     │ Ultrawide for architectural    │
│ General / Flexible │ 1152x896 (9:7)      │ Balanced landscape format      │
│ Large Detail       │ 1536x1536 (1:1)     │ Higher res for fine color work │
└────────────────────┴─────────────────────┴────────────────────────────────┘
```

1. Resolution per context
2. `steps` 10-12 for color (palette accuracy benefits)
3. `shift` 3 (default)
4. `random_seed: true` for explore or `false` w/ specific seed for reproducibility
5. Record params

→ Complete param set. Color usually needs 10+ steps for fidelity.

If err: unsure → 1024x1024 @ 10 steps. Reliable default.

### Step 6: Generate

Z-Image MCP call.

1. `mcp__hf-mcp-server__gr1_z_image_turbo_generate` w/:
   - `prompt`: from Step 4
   - `resolution`: from Step 5
   - `steps`: from Step 5 (rec 10-12)
   - `shift`: from Step 5
   - `random_seed`: from Step 5
   - `seed`: specific if `random_seed` false
2. Record returned seed
3. Note gen time

→ Image w/ recognizable forms + visible color. May not perfectly match palette — addressed in eval.

If err: MCP unavail → verify hf-mcp-server (`configure-mcp-server` / `troubleshoot-mcp-connection`). Fully abstract → prompt needs structural lang → Step 4. Colors completely wrong → front-load color names.

### Step 7: Evaluate color fidelity

5 criteria.

```
Polychromatic Ornament Evaluation Rubric:
┌─────────────────────┬───────────────────────────────────────────────────────┐
│ Criterion           │ Evaluation Questions                                  │
├─────────────────────┼───────────────────────────────────────────────────────┤
│ 1. Palette Match    │ Do the colors in the image approximate the specified  │
│                     │ palette? Are the named colors present? Are there      │
│                     │ unwanted colors that break the palette?               │
├─────────────────────┼───────────────────────────────────────────────────────┤
│ 2. Color            │ Does the color distribution roughly follow the        │
│    Distribution     │ 60/30/10 allocation? Is the dominant color actually   │
│                     │ dominant? Does the accent appear sparingly?           │
├─────────────────────┼───────────────────────────────────────────────────────┤
│ 3. Rendering Style  │ Does the image look like the specified rendering      │
│                     │ style? Does a "glazed tile" look glossy and flat?     │
│                     │ Does "illuminated manuscript" show gold and vellum?   │
├─────────────────────┼───────────────────────────────────────────────────────┤
│ 4. Period Accuracy  │ Would this design be recognizable as belonging to     │
│                     │ the specified period? Are motifs period-appropriate?   │
│                     │ Does the color usage match period conventions?        │
├─────────────────────┼───────────────────────────────────────────────────────┤
│ 5. Form-Color       │ Does color clarify the ornamental structure or        │
│    Balance          │ obscure it? Can you "read" the motifs through the     │
│                     │ color? Does color follow form as intended?            │
└─────────────────────┴───────────────────────────────────────────────────────┘
```

1. Score each: **Strong** / **Adequate** / **Weak**
2. Note specific obs
3. ≥4 Strong → success
4. ≥2 Weak → back to Step 4

→ Scored eval w/ specific obs. Color harder than mono → expect Adequate first gen.

If err: most Weak → fundamental restructure. Common: move colors to start, fewer colors, ground explicit, steps to 12.

### Step 8: Iterate or finalize

**Color-Specific Strategies:**
1. **Palette correction**: colors at start: "turquoise blue and gold: [rest of prompt]"
2. **Distribution correction**: "mostly turquoise blue with small gold accents"
3. **Rendering correction**: "in the style of Iznik ceramic tiles, glossy glaze surface"
4. **Seed-locked tuning**: keep seed, change only color desc
5. **Mood shift**: "vivid saturated" ↔ "muted antique"

**Iteration Budget:** ≤3 per concept. Color often needs more prompt adjustment than mono.

1. Apply correction per Step 7 weakness
2. Regen via Step 6
3. Re-eval Step 7
4. Accept when ≥4 Strong or budget exhausted

→ Improved fidelity after 1-2 iter. Perfect match unlikely — aim "right color family."

If err: not converging → palette too specific. Simplify (3 not 5), broader desc ("warm earth tones" not hex), accept closest.

### Step 9: Document

Reproducibility record.

1. Record:
   - **Period**: name + dates
   - **Motif**: primary
   - **Rendering**: painted/illuminated/glazed/etc.
   - **Palette**: each color w/ role + approx hex
     - Dominant: [name] (~hex) — 60%
     - Secondary: [name] (~hex) — 30%
     - Accent: [name] (~hex) — 10%
     - Additional: [name] (~hex) — detail/metallic
   - **Harmony**: period-authentic / complementary / analogous / triadic
   - **Mood**: muted / balanced / vivid
   - **Final Prompt**: exact accepted
   - **Seed**: for reproduction
   - **Resolution**: used
   - **Steps/Shift**: gen params
   - **Evaluation**: brief criteria scores
   - **Iterations**: count + key changes
2. Compare gen palette vs historical reference
3. Note color-specific obs (well/poorly handled)
4. Suggest applications + adaptation notes ("adapts well to screen" / "needs adjustment for CMYK print")

→ Reproducible record w/ full color docs incl hex + palette analysis.

If err: full doc excessive → at min: final prompt, seed, intended vs actual colors. Allows reproduction + adjustment.

## Check

- [ ] Period + palette IDed
- [ ] 3-5 color palette w/ roles + proportions
- [ ] Harmony chosen consciously
- [ ] Motif structure analyzed w/ color-to-structure
- [ ] Prompt has explicit colors + mood
- [ ] Prompt specifies rendering (painted/glazed/illuminated)
- [ ] Resolution matches application
- [ ] Steps ≥10 for color fidelity
- [ ] Image evaluated 5-point rubric
- [ ] Seed recorded
- [ ] Final design documented w/ prompt, seed, palette (w/ hex), params

## Traps

- **Color names alone**: "blue" ambiguous → "turquoise / cobalt / ultramarine". Different blues = different periods + moods
- **Too many colors**: >5 confuses model → muddy. Historical ornament = 3-4 + ground. Restraint authentic
- **Ignore ground**: as important as motif colors. Cream vellum, white ceramic, gold leaf, dark stone fundamentally changes how others read. Specify
- **Color w/o structure**: poor structure + color ≠ improvement. Mono fails first → fix structure via `ornament-style-mono`
- **Anachronistic palettes**: bright magenta, neon, candy pastels = no historical place. Pigment avail constrains — respect for authenticity
- **Insufficient steps**: color needs more than mono. 8 steps for color → washed-out / imprecise. Use 10-12

## →

- `ornament-style-mono` — mono foundation; fallback when color uncooperative; first step for understanding structure
- `review-web-design` — color theory (contrast, harmony, rhythm) applies directly
- `meditate` — focused attention + visualization can inform palette dev
