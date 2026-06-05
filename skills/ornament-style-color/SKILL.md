---
name: ornament-style-color
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

Design polychromatic ornamental patterns by combining art historical color knowledge with AI-assisted image generation. Builds on the structural foundation of `ornament-style-mono` by adding period-authentic color palettes, color harmony principles, and rendering styles suited to painted, illuminated, and glazed ornament.

## When to Use

- Creating decorative designs where color is integral to the ornamental tradition (e.g., Islamic tilework, illuminated manuscripts, Art Nouveau posters)
- Exploring how historical periods used color in ornament — palette, distribution, and symbolic meaning
- Producing colored reference imagery for design, illustration, or educational materials
- Generating painted, illuminated, glazed, or stained glass renderings of classical motifs
- Studying the relationship between color and form in ornamental traditions

## Inputs

- **Required**: Desired historical period or style (or "surprise me" for random selection)
- **Required**: Application context (border, medallion, frieze, panel, tile, standalone motif)
- **Optional**: Color palette preference (period-authentic, custom, or specific colors)
- **Optional**: Specific motif preference (acanthus, arabesque, rosette, etc.)
- **Optional**: Rendering style preference (painted, illuminated, glazed tile, stained glass, watercolor)
- **Optional**: Color mood (muted/antique, balanced/natural, vivid/saturated)
- **Optional**: Target resolution and aspect ratio
- **Optional**: Seed value for reproducible generation

## Procedure

### Step 1: Select Historical Period and Color Palette

Choose a period and identify its characteristic color language. Color in ornament is never arbitrary — each period has a palette rooted in available pigments, cultural symbolism, and material context.

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

1. If the user specified a period, confirm and note its characteristic palette
2. If "surprise me," select randomly — weight toward periods with rich color traditions (Islamic, Byzantine, Gothic, Art Nouveau)
3. Note the material context (fresco, mosaic, tile, stained glass, print) as this affects how color renders

**Expected:** A clearly identified period with its characteristic palette and material context understood.

**On failure:** If the user requests a period not in the table, research its color language using WebSearch for "[period] ornament color palette pigments" and construct an equivalent entry. Historical pigment availability is a reliable guide to period-authentic color.

### Step 2: Define Color Palette

Translate the historical palette into a specific 3-5 color set with defined roles.

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

**Color Harmony Approaches:**
- **Period-Authentic**: Use only colors available to the historical period's pigments and materials
- **Complementary**: Opposing colors on the color wheel (e.g., blue and gold/orange) — high contrast
- **Analogous**: Adjacent colors (e.g., sage green, teal, muted blue) — harmonious, subtle
- **Triadic**: Three equally spaced colors (e.g., red, blue, gold) — vibrant, balanced

1. Select 3-5 colors with named roles (dominant, secondary, accent, optional)
2. Choose the harmony approach
3. Assign approximate hex values or descriptive color names
4. Note the color mood: muted/antique, balanced/natural, or vivid/saturated

**Example Palette Definitions:**
- **Islamic Tilework**: turquoise (dominant), white (secondary), cobalt blue (accent), gold (detail) — analogous + metallic — vivid
- **Art Nouveau Poster**: sage green (dominant), dusty rose (secondary), amber gold (accent) — analogous — muted
- **Byzantine Mosaic**: gold (dominant), deep blue (secondary), crimson (accent), white (detail) — complementary — vivid

**Expected:** A palette of 3-5 named colors with roles, proportions, harmony approach, and mood defined.

**On failure:** If color selection feels arbitrary, anchor to the period's material context. Ask: "What pigments were physically available?" and "What was the ground material?" (gold leaf on vellum, glaze on ceramic, paint on plaster). The material constrains and authenticates the palette.

### Step 3: Analyze Motif Structure

Understand the structural grammar of the chosen motif, extending the monochrome analysis with color-to-structure mapping.

1. Perform the same structural analysis as `ornament-style-mono` Step 2:
   - Symmetry type (bilateral, radial, translational, point)
   - Geometric scaffold (circle, rectangle, triangle, band)
   - Fill pattern (solid, line-filled, open, mixed)
   - Edge treatment (clean, organic, interlocking)

2. Add **color-to-structure mapping**:
   - Which structural elements receive which colors?
   - Does color follow form (each shape gets one color) or flow (color gradients cross structural boundaries)?
   - Where does the accent color appear? (Typically at focal points, intersections, or small detail elements)
   - What color is the ground/background?

**Example Mapping:**
```
Islamic Star Pattern:
- Star forms: turquoise (dominant)
- Interlocking geometric ground: white (secondary)
- Star center details: cobalt blue (accent)
- Outline/border: gold (detail)
→ Color follows form strictly — each geometric shape is one flat color
```

**Expected:** A structural description with explicit color assignments for each structural element.

**On failure:** If the color-to-structure mapping is unclear, study historical examples using WebSearch for "[period] [motif] ornament color" and observe how color was actually used. Historical ornament almost always uses color to clarify structure, not obscure it.

### Step 4: Construct Color Prompt

Build the text prompt for Z-Image generation, incorporating color palette and rendering style.

**Prompt Template:**
```
[Rendering style] of [motif name] ornament in the [period] style,
[composition type], [color palette description],
[color mood], [structural details from Step 3],
[application context], [additional qualifiers]
```

**Color-Appropriate Rendering Styles:**
- `painted ornament` — brushwork visible, opaque colors, fresco or oil quality
- `illuminated manuscript` — gold leaf, rich jewel tones, vellum ground
- `glazed ceramic tile` — glossy surface, flat color, precise edges
- `stained glass` — translucent color, dark leading lines between shapes
- `watercolor illustration` — transparent washes, soft edges, paper visible
- `enamel on metal` — hard glossy color, metallic ground
- `mosaic` — small tesserae, visible gaps between pieces, luminous
- `printed poster` — flat color areas, Art Nouveau or Arts & Crafts quality

**Color Description in Prompts:**
- Name specific colors: "turquoise blue and gold on white ground"
- Describe the mood: "muted antique tones" or "vivid saturated jewel colors"
- Specify distribution: "blue dominant with gold accents" or "warm earth tones with red details"

**Example Prompts:**
- `glazed ceramic tile ornament in the Islamic style, geometric star pattern, turquoise blue and white with cobalt blue accents and gold outlines, vivid saturated colors, repeating tessellation, Iznik tilework quality`
- `illuminated manuscript border in the Gothic style, vine and trefoil ornament, ultramarine blue and ruby red with gold leaf details on cream vellum, rich jewel tones, vertical panel, medieval book of hours quality`
- `watercolor illustration of Art Nouveau floral ornament, whiplash curves with lily motif, sage green and dusty rose with amber gold accents, muted organic tones, vertical panel, Alphonse Mucha influence`

**Expected:** A prompt of 25-50 words that specifies rendering style, motif, period, composition, and explicit color information.

**On failure:** If the prompt produces color that does not match the palette, front-load the color description in the prompt (put it before the motif description). Z-Image weights earlier prompt tokens more heavily. Also try naming specific hex colors or well-known pigment names (ultramarine, vermillion, ochre).

### Step 5: Configure Generation Parameters

Select resolution and generation parameters. Color ornament often benefits from slightly more inference steps than monochrome.

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

1. Select resolution based on application context
2. Set `steps` to 10-12 for color work (color detail and palette accuracy benefit from more steps)
3. Set `shift` to 3 (default)
4. Choose `random_seed: true` for exploration or `random_seed: false` with a specific seed for reproducibility
5. Record all parameters for documentation

**Expected:** A complete parameter set. Note that color ornament generally needs 10+ steps for good palette fidelity.

**On failure:** If unsure, use 1024x1024 at 10 steps. This is a reliable default for most color ornament contexts.

### Step 6: Generate Image

Invoke the Z-Image MCP tool to produce the ornament.

1. Call `mcp__hf-mcp-server__gr1_z_image_turbo_generate` with:
   - `prompt`: the constructed prompt from Step 4
   - `resolution`: from Step 5
   - `steps`: from Step 5 (recommend 10-12)
   - `shift`: from Step 5
   - `random_seed`: from Step 5
   - `seed`: specific seed if `random_seed` is false
2. Record the returned seed value for reproducibility
3. Note the generation time

**Expected:** A generated image with recognizable ornamental forms and visible color. The color may not perfectly match the specified palette — this is addressed in evaluation.

**On failure:** If the MCP tool is unavailable, verify that hf-mcp-server is configured (see `configure-mcp-server` or `troubleshoot-mcp-connection`). If the generated image is entirely abstract, the prompt needs more specific structural language — return to Step 4. If colors are completely wrong, front-load the color names in the prompt.

### Step 7: Evaluate Color Fidelity

Assess the generated image against five criteria, extending the monochrome rubric with color-specific evaluation.

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

1. Score each criterion: **Strong** (clearly meets), **Adequate** (partially meets), **Weak** (does not meet)
2. Note specific observations for each criterion
3. If 4+ criteria score Strong, the design is successful
4. If 2+ criteria score Weak, return to Step 4 for prompt refinement

**Expected:** A scored evaluation with specific observations. Color ornament is harder to control than monochrome — expect Adequate scores on first generation for palette match and distribution.

**On failure:** If most criteria score Weak, the prompt may need fundamental restructuring. Common fixes: move color names to the very beginning of the prompt, use fewer colors, specify the ground color explicitly, increase steps to 12.

### Step 8: Iterate or Finalize

Refine the design through targeted iteration or accept the result.

**Color-Specific Iteration Strategies:**
1. **Palette correction**: If colors are wrong, put specific color names at the start of the prompt: "turquoise blue and gold: [rest of prompt]"
2. **Distribution correction**: Explicitly state proportions: "mostly turquoise blue with small gold accents"
3. **Rendering correction**: Strengthen the rendering style description: "in the style of Iznik ceramic tiles, glossy glaze surface"
4. **Seed-locked color tuning**: Keep the seed, change only the color description to adjust palette while maintaining composition
5. **Mood shift**: Change "vivid saturated" to "muted antique" or vice versa to adjust overall color intensity

**Iteration Budget:** Limit to 3 iterations per design concept. Color iteration often requires more prompt adjustment than monochrome.

1. If the evaluation in Step 7 indicates specific weaknesses, apply the corresponding correction strategy
2. Regenerate using Step 6
3. Re-evaluate using Step 7
4. Accept when 4+ criteria score Strong or iteration budget is exhausted

**Expected:** Improved color fidelity after 1-2 iterations. Perfect palette match is unlikely — aim for "recognizably in the right color family."

**On failure:** If iteration is not converging, the color palette may be too specific for the model to reproduce reliably. Simplify to fewer colors (3 instead of 5), use broader color descriptions ("warm earth tones" instead of specific hex values), or accept the closest approximation.

### Step 9: Document the Design

Create a complete record of the final design for reproducibility and reference.

1. Record the following:
   - **Period**: Historical period name and date range
   - **Motif**: Primary motif(s) used
   - **Rendering Style**: Painted, illuminated, glazed tile, etc.
   - **Color Palette**: Each color with its role and approximate hex value
     - Dominant: [color name] (~hex) — 60%
     - Secondary: [color name] (~hex) — 30%
     - Accent: [color name] (~hex) — 10%
     - Additional: [color name] (~hex) — detail/metallic
   - **Color Harmony**: Approach used (period-authentic, complementary, analogous, triadic)
   - **Color Mood**: Muted, balanced, or vivid
   - **Final Prompt**: The exact prompt that produced the accepted image
   - **Seed**: The seed value for reproduction
   - **Resolution**: The resolution used
   - **Steps/Shift**: Generation parameters
   - **Evaluation**: Brief notes on the five criteria scores
   - **Iterations**: Number of iterations and key changes made
2. Note how the generated palette compares to the historical reference palette
3. Note any color-specific observations (colors that the model handled well or poorly)
4. Suggest potential applications and color adaptation notes (e.g., "palette would adapt well to screen display" or "would need adjustment for CMYK print")

**Expected:** A reproducible record with full color documentation including hex approximations and palette analysis.

**On failure:** If full documentation feels excessive, at minimum record the final prompt, seed, and a list of intended vs. actual colors. These allow reproduction and palette adjustment in future iterations.

## Validation

- [ ] A specific historical period was selected with its characteristic color palette identified
- [ ] A 3-5 color palette was defined with roles (dominant/secondary/accent) and proportions
- [ ] Color harmony approach was consciously chosen (period-authentic, complementary, analogous, triadic)
- [ ] Motif structure was analyzed with color-to-structure mapping
- [ ] Prompt includes explicit color names and color mood description
- [ ] Prompt specifies a color-appropriate rendering style (painted, glazed, illuminated, etc.)
- [ ] Resolution matches the application context
- [ ] Steps set to 10+ for color fidelity
- [ ] Generated image was evaluated against the 5-point rubric
- [ ] Seed value was recorded for reproducibility
- [ ] Final design is documented with prompt, seed, palette (with hex approximations), and parameters

## Common Pitfalls

- **Relying on color names alone**: "Blue" is ambiguous — specify "turquoise blue," "cobalt blue," or "ultramarine blue." Different blues evoke entirely different periods and moods
- **Too many colors**: More than 5 colors in a prompt confuses the model and produces muddy results. Historical ornament typically uses 3-4 colors plus a ground. Restraint is authentic
- **Ignoring the ground color**: The background/ground color is as important as the motif colors. Cream vellum, white ceramic, gold leaf, or dark stone ground fundamentally changes how all other colors read. Specify it explicitly
- **Color without structural basis**: Adding color to poorly structured ornament does not improve it. If the monochrome version does not work, adding color will not help — fix the structure first using `ornament-style-mono`
- **Anachronistic palettes**: Bright magenta, neon colors, or candy pastels do not belong in historical ornament. Pigment availability constrains period palettes — respect the constraint for authentic results
- **Insufficient steps**: Color detail needs more inference steps than monochrome. Using 8 steps for color work often produces washed-out or imprecise palette rendering. Use 10-12

## Related Skills

- `ornament-style-mono` — the monochrome foundation skill; always available as a fallback when color is not cooperating, and recommended as a first step for understanding motif structure before adding color
- `review-web-design` — color theory principles (contrast, harmony, rhythm) apply directly to ornamental color composition
- `meditate` — focused attention and color visualization practices can inform palette development
