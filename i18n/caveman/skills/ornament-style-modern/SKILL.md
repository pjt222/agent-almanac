---
name: ornament-style-modern
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Design ornamental patterns using modern and speculative aesthetics with colorblind-accessible
  color scales. Breaks free from historical period constraints to explore cyberpunk, solarpunk,
  biopunk, brutalist, vaporwave, and other contemporary genres. Includes CVD (Color Vision
  Deficiency) awareness and perceptually uniform scales (viridis, cividis, inferno). Use when
  creating ornamental designs in modern or genre-specific aesthetics, designing patterns that
  must be colorblind-accessible, or exploring hybrid motifs combining historical ornament with
  contemporary visual language.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: design
  complexity: intermediate
  language: natural
  tags: design, ornament, modern, colorblind, accessibility, cyberpunk, sci-fi, generative-ai, z-image
---

# Ornament Style — Modern

Design ornamental patterns using modern and speculative aesthetics with colorblind-accessible color scales. This skill breaks free from historical period constraints — anachronism encouraged, hybrid motifs welcome, palette system built on perceptually uniform color scales designed for universal accessibility.

This is "unleashed" companion to `ornament-style-mono` and `ornament-style-color`. Where those skills ground every decision in art historical fidelity, this skill grounds decisions in genre coherence, color accessibility, artistic freedom.

## When Use

- Creating ornamental designs in modern, speculative, or genre-specific aesthetics (cyberpunk, solarpunk, brutalist, etc.)
- Designing patterns that must be colorblind-accessible using scientifically validated color scales
- Exploring hybrid motifs combining historical ornament with contemporary visual language
- Producing ornament for digital contexts (UI decoration, game assets, screen-based media) where historical authenticity not the goal
- Generating decorative imagery where CVD (Color Vision Deficiency) safety is requirement
- Creating purely abstract or algorithmic ornament with no historical reference
- Combining motif traditions across cultures and periods without concern for anachronism

## Inputs

- **Required**: Genre / aesthetic direction (or "surprise me" for random selection, or "no genre" for pure abstract)
- **Required**: Application context (border, medallion, frieze, panel, tile, standalone motif, UI element)
- **Optional**: Color scale preference (viridis, cividis, inferno, magma, plasma, etc.) or custom palette
- **Optional**: CVD type to optimize for (protanopia, deuteranopia, tritanopia, or "all")
- **Optional**: Specific motif elements (circuit traces, organic growth, geometric lattice, etc.)
- **Optional**: Rendering style (digital art, holographic, neon sign, 3D render, glitch art, etc.)
- **Optional**: Historical hybrid elements (e.g., "Gothic tracery + circuit board")
- **Optional**: Target resolution and aspect ratio
- **Optional**: Seed value for reproducible generation

## Steps

### Step 1: Select Genre / Aesthetic

Choose modern or speculative aesthetic as visual foundation. Unlike historical periods, genres are fluid — mixing and hybridization encouraged.

```
Modern and Speculative Aesthetics:
+-----------------------+--------------------------+-----------------------------------+-----------------------------+
| Genre                 | Visual Character         | Motif Language                    | Color Tendency              |
+-----------------------+--------------------------+-----------------------------------+-----------------------------+
| Cyberpunk             | Neon-on-dark, circuit,   | Circuit traces, kanji, hexagons,  | Neon cyan/magenta on black  |
|                       | tech, glitch             | fractured glass, data streams     |                             |
+-----------------------+--------------------------+-----------------------------------+-----------------------------+
| Hard Sci-Fi           | Clean, technical,        | Engineering diagrams, orbital     | Cool metallics, deep space  |
|                       | precise                  | paths, crystalline lattice        | blue                        |
+-----------------------+--------------------------+-----------------------------------+-----------------------------+
| Solarpunk             | Organic-tech fusion,     | Leaf/vine + solar panel, living   | Greens, warm amber,         |
|                       | verdant                  | architecture, moss on circuit     | sunlight                    |
+-----------------------+--------------------------+-----------------------------------+-----------------------------+
| Biopunk               | Organic, visceral,       | DNA helix, cell structure,        | Deep organics,              |
|                       | grown                    | mycelium, coral, nerve networks   | bioluminescent              |
+-----------------------+--------------------------+-----------------------------------+-----------------------------+
| Brutalist             | Raw, monumental,         | Concrete texture, massive         | Grays, concrete,            |
|                       | geometric                | geometry, exposed grid, slab      | industrial                  |
+-----------------------+--------------------------+-----------------------------------+-----------------------------+
| Art Deco Revival      | Geometric elegance,      | Sunburst, chevron, ziggurat, fan, | Gold, black, cream,         |
|                       | luxury                   | stepped forms                     | emerald                     |
+-----------------------+--------------------------+-----------------------------------+-----------------------------+
| Vaporwave             | Retro-digital, surreal   | Classical busts (glitched), grid, | Pink/teal/purple gradients  |
|                       |                          | gradient, marble                  |                             |
+-----------------------+--------------------------+-----------------------------------+-----------------------------+
| Retrofuturism         | 1950s-60s future vision  | Atomic/Space Age, streamline, ray | Chrome, turquoise, coral    |
|                       |                          | gun, fin, orbit                   |                             |
+-----------------------+--------------------------+-----------------------------------+-----------------------------+
| Generative /          | Mathematical,            | Voronoi, reaction-diffusion,      | Any scale -- often viridis  |
| Algorithmic           | procedural               | L-system, noise field, fractal    | family                      |
+-----------------------+--------------------------+-----------------------------------+-----------------------------+
| Afrofuturism          | Ancestral + futuristic   | Adinkra, kente geometry, cosmic,  | Rich earth + metallic +     |
|                       |                          | mask, constellation               | electric                    |
+-----------------------+--------------------------+-----------------------------------+-----------------------------+
```

**Additional supported modes:**
- **Freeform user-defined aesthetic**: describe any visual direction not in table
- **Historical hybrid**: combine historical period with modern genre (e.g., "Byzantine cyberpunk," "Islamic generative")
- **No genre / pure abstract**: ornament driven entirely by structure, color scale, composition with no genre narrative

1. User specified genre? Confirm and note its visual character, motif language, color tendency
2. "Surprise me"? Select randomly — weight toward genres with strong ornamental potential (cyberpunk, solarpunk, generative, Art Deco Revival)
3. Historical hybrid requested? Identify historical motif vocabulary and modern rendering/mood overlay
4. Note application context (digital screen, print, physical object) — affects rendering choices

**Got:** Clearly identified genre (or hybrid) with characteristic visual language understood. For hybrids, both source traditions articulated.

**If fail:** User requests genre not in table? Research its visual conventions using WebSearch for "[genre] aesthetic visual design motifs" and construct equivalent entry. Key elements to identify: visual character, typical motifs, color tendency.

### Step 2: Select Color Strategy

Choose between colorblind-accessible scale or custom palette. Colorblind scales are recommended default.

**Path A: Colorblind-Accessible Scale (Recommended)**

Select from perceptually uniform color scales designed for universal readability:

```
Colorblind-Accessible Color Scales:
+------------+---------------+--------------------+-----------------------------+-------------------------+
| Scale      | Type          | CVD Safe           | Character                   | Best For                |
+------------+---------------+--------------------+-----------------------------+-------------------------+
| Viridis    | Sequential    | All 3 types        | Blue-green-yellow, balanced | Default recommendation  |
+------------+---------------+--------------------+-----------------------------+-------------------------+
| Cividis    | Sequential    | Deutan + Protan    | Blue-to-yellow, muted       | Maximum CVD safety      |
|            |               | optimized          |                             |                         |
+------------+---------------+--------------------+-----------------------------+-------------------------+
| Inferno    | Sequential    | All 3 types        | Black-red-yellow-white, hot | Dramatic, high contrast |
+------------+---------------+--------------------+-----------------------------+-------------------------+
| Magma      | Sequential    | All 3 types        | Black-purple-orange-yellow  | Moody, volcanic         |
+------------+---------------+--------------------+-----------------------------+-------------------------+
| Plasma     | Sequential    | All 3 types        | Purple-pink-orange-yellow   | Vivid, energetic        |
+------------+---------------+--------------------+-----------------------------+-------------------------+
| Turbo      | Rainbow-like  | Moderate           | Full spectrum, perceptual   | Many distinct colors    |
+------------+---------------+--------------------+-----------------------------+-------------------------+
| Mako       | Sequential    | All 3 types        | Dark blue to light teal     | Cool, oceanic           |
+------------+---------------+--------------------+-----------------------------+-------------------------+
| Rocket     | Sequential    | All 3 types        | Dark to light via warm      | Warm, ember-like        |
|            |               |                    | tones                       |                         |
+------------+---------------+--------------------+-----------------------------+-------------------------+
| Okabe-Ito  | Categorical   | All 3 types        | 8 distinct colors           | Discrete elements, max  |
|            |               |                    |                             | distinction             |
+------------+---------------+--------------------+-----------------------------+-------------------------+
```

```
CVD Types and Impact:
+-----------------------------+----------+-----------------+------------------------------+
| CVD Type                    | Affects  | Confuses        | Safe Scales                  |
+-----------------------------+----------+-----------------+------------------------------+
| Protanopia (red-blind)      | ~1% male | Red/green       | viridis, cividis, inferno    |
+-----------------------------+----------+-----------------+------------------------------+
| Deuteranopia (green-blind)  | ~5% male | Red/green       | viridis, cividis, inferno    |
+-----------------------------+----------+-----------------+------------------------------+
| Tritanopia (blue-yellow)    | ~0.01%   | Blue/yellow     | inferno, magma (with care)   |
+-----------------------------+----------+-----------------+------------------------------+
```

**Translating continuous scale to ornamental palette:**
Sample 3-5 colors at evenly spaced intervals along scale. For 5-color palette from viridis:
- Position 0.0: deep purple (#440154)
- Position 0.25: blue-violet (#31688e)
- Position 0.5: teal green (#35b779)
- Position 0.75: yellow-green (#90d743)
- Position 1.0: bright yellow (#fde725)

Assign roles using 60/30/10 framework from `ornament-style-color`: dominant (largest area), secondary (supporting), accent (focal points).

**Path B: Custom Palette**

Freeform palette selection with optional CVD simulation check:
1. Define 3-5 colors with named roles
2. Optionally validate against CVD types using WebSearch for "CVD color simulator [colors]"
3. Note CVD risk and mitigations (e.g., using texture or pattern in addition to color)

**Got:** Palette of 3-5 named colors with roles, either sampled from named scale or custom-defined, with CVD compatibility noted.

**If fail:** Unsure? Use viridis with 3-color sampling (deep purple, teal, yellow). Most universally accessible and visually balanced default.

### Step 3: Analyze Motif Structure

Understand structural grammar of chosen motif, using same framework as historical skills but with explicit permission for modern compositional techniques.

1. Perform structural analysis:
   - **Symmetry type**: bilateral, radial, translational, point, *or* glitch-broken, procedural asymmetry, pseudo-random
   - **Geometric scaffold**: circle, rectangle, triangle, band, *or* voronoi cell, fractal, reaction-diffusion field
   - **Fill pattern**: solid, line-filled, open, mixed, *or* gradient, noise texture, data-driven
   - **Edge treatment**: clean, organic, interlocking, *or* glitched, dissolving, pixel-stepped

2. Add **color-to-structure mapping**:
   - Which structural elements receive which colors from selected scale?
   - Color follows form (each shape gets one color) or flows (gradient across structural boundaries)?
   - Where does scale's brightest/lightest color appear? (Typically focal points)
   - What color is ground/background?

3. **Modern composition techniques** (unique to this skill):
   - **Hybrid motifs**: historical ornament structure + modern rendering (e.g., Gothic tracery rendered as circuit board)
   - **Non-traditional symmetry**: deliberate symmetry breaks, glitch artifacts, procedural variation within repeating pattern
   - **Layered compositions**: ornament over texture, transparency effects, depth-of-field blur
   - **Meta-ornament**: ornamental patterns composed of smaller ornamental patterns (fractal nesting)

**Got:** Structural description with explicit color assignments and any modern composition techniques identified.

**If fail:** Motif structure unclear for modern genre? Anchor to genre's real-world visual precedents. Cyberpunk circuit traces follow band scaffold with translational symmetry. Generative/algorithmic uses radial or field-based scaffold. Motif language may be novel but structural grammar universal.

### Step 4: Construct Modern Prompt

Build text prompt for Z-Image generation, using modern prompt template.

**Prompt Template:**
```
[Rendering style] of [genre]-inspired ornamental design,
[motif description], [color scale or palette],
[composition type], [mood/atmosphere],
[application context], [additional qualifiers]
```

**Modern Rendering Styles:**
- `digital art` — clean digital rendering, screen-ready, smooth gradients
- `holographic` — iridescent, light-diffracting, multi-angle color shift
- `neon sign` — glowing lines on dark ground, light bloom, hot edges
- `3D render` — volumetric, lit, material quality, depth
- `glitch art` — digitally corrupted, scan-line artifacts, color channel split
- `vector graphic` — flat, clean edges, scalable feel, geometric precision
- `screen print` — limited color, registration marks, ink quality, tactile
- `laser etched` — precise, metallic surface, ablation marks, technical
- `generative art` — procedural, algorithmic, mathematical precision
- `concept art` — painterly, atmospheric, narrative, cinematic lighting

**Color Scale in Prompts:**
Translate scale name into descriptive color language model can interpret:
- **Viridis**: "deep purple transitioning through teal green to bright yellow"
- **Cividis**: "steel blue transitioning to golden yellow"
- **Inferno**: "black through deep red and orange to bright yellow-white"
- **Magma**: "black through dark purple and burnt orange to pale yellow"
- **Plasma**: "deep indigo through magenta and orange to bright yellow"
- **Mako**: "deep navy blue transitioning to light aqua teal"
- **Rocket**: "dark brown-black through brick red to pale cream"

**Example Prompts:**
- `neon sign ornamental design inspired by cyberpunk aesthetic, circuit trace patterns and hexagonal grid, deep purple and teal green and bright yellow colors (viridis palette), repeating border frieze, electric and atmospheric, dark background with glowing elements`
- `digital art of solarpunk-inspired ornamental panel, vine and leaf motifs intertwined with solar cell geometry, steel blue to golden yellow gradient (cividis palette), vertical panel composition, warm and hopeful atmosphere, organic-technology fusion`
- `generative art ornamental tile, algorithmic reaction-diffusion pattern, dark purple through burnt orange to pale yellow (magma palette), square repeating unit, mathematical and volcanic, procedural organic quality`
- `3D render of Art Deco Revival ornamental medallion with brutalist influence, sunburst and ziggurat geometry in raw concrete and gold, deep indigo through magenta to bright yellow (plasma palette), radial symmetry, monumental elegance`

**Got:** Prompt of 25-50 words specifying rendering style, genre, motif, color scale/palette, composition, mood.

**If fail:** Prompt produces colors not matching intended scale? Front-load color description. Instead of mentioning scale name, describe actual colors at start: "deep purple, teal green, and bright yellow ornamental design..." Z-Image weights earlier prompt tokens more heavily.

### Step 5: Configure Generation Parameters

Select resolution and generation parameters.

```
Resolution by Application:
+--------------------+---------------------+----------------------------------------+
| Application        | Recommended         | Rationale                              |
+--------------------+---------------------+----------------------------------------+
| Medallion / Roundel| 1024x1024 (1:1)     | Radial symmetry needs square           |
+--------------------+---------------------+----------------------------------------+
| Tile / Repeat Unit | 1024x1024 (1:1)     | Square for seamless tiling             |
+--------------------+---------------------+----------------------------------------+
| Horizontal Frieze  | 1280x720 (16:9)     | Wide format for running border         |
+--------------------+---------------------+----------------------------------------+
| Vertical Panel     | 720x1280 (9:16)     | Portrait format for columns            |
+--------------------+---------------------+----------------------------------------+
| Wide Border        | 1344x576 (21:9)     | Ultrawide for architectural            |
+--------------------+---------------------+----------------------------------------+
| UI Element         | 1152x896 (9:7)      | Balanced landscape for screen use      |
+--------------------+---------------------+----------------------------------------+
| Large Detail       | 1536x1536 (1:1)     | Higher res for fine gradient work      |
+--------------------+---------------------+----------------------------------------+
```

1. Select resolution based on application context
2. Set `steps` to 10-12 (color gradient detail and scale fidelity benefit from more steps)
3. Set `shift` to 3 (default) or 4 for neon-on-dark styles benefiting from higher contrast
4. Choose `random_seed: true` for exploration or `random_seed: false` with specific seed for reproducibility
5. Record all parameters for documentation

**Got:** Complete parameter set. Gradient-based scales need 10+ steps for smooth color transitions.

**If fail:** Unsure? Use 1024x1024 at 10 steps with shift 3. Increase to shift 4 only for neon/glowing/high-contrast styles.

### Step 6: Generate Image

Invoke Z-Image MCP tool to produce ornament.

1. Call `mcp__hf-mcp-server__gr1_z_image_turbo_generate` with:
   - `prompt`: constructed prompt from Step 4
   - `resolution`: from Step 5
   - `steps`: from Step 5 (recommend 10-12)
   - `shift`: from Step 5
   - `random_seed`: from Step 5
   - `seed`: specific seed if `random_seed` is false
2. Record returned seed value for reproducibility
3. Note generation time

**Got:** Generated image with recognizable ornamental structure and visible color gradient/palette. Color may not perfectly match specified scale — addressed in evaluation.

**If fail:** MCP tool unavailable? Verify hf-mcp-server configured (see `configure-mcp-server` or `troubleshoot-mcp-connection`). Generated image entirely abstract with no ornamental structure? Prompt needs more specific structural language — return to Step 4. Colors completely wrong? Front-load color names in prompt.

### Step 7: Evaluate Design

Assess generated image against five criteria adapted for modern ornament.

```
Modern Ornament Evaluation Rubric:
+---------------------+------------------------+-------------------------------------------+
| Criterion           | Replaces (from color)  | Evaluation Questions                      |
+---------------------+------------------------+-------------------------------------------+
| 1. Genre Coherence  | Period Accuracy        | Does it feel like the specified genre?    |
|                     |                        | Would someone familiar with the genre     |
|                     |                        | recognize the aesthetic?                  |
+---------------------+------------------------+-------------------------------------------+
| 2. Color Scale      | Palette Match          | Does the color gradient/palette           |
|    Fidelity         |                        | approximate the chosen scale? Are the     |
|                     |                        | key colors from the scale present?        |
+---------------------+------------------------+-------------------------------------------+
| 3. Accessibility    | (new criterion)        | Would this be distinguishable under the   |
|                     |                        | target CVD type? Do elements rely solely  |
|                     |                        | on color or also on shape/texture?        |
+---------------------+------------------------+-------------------------------------------+
| 4. Composition      | Form-Color Balance     | Does the ornamental structure read        |
|    Quality          |                        | clearly? Does color clarify or obscure    |
|                     |                        | the motif?                                |
+---------------------+------------------------+-------------------------------------------+
| 5. Rendering Style  | Rendering Style        | Does it match the specified rendering     |
|                     |                        | technique? Does a "neon sign" glow?       |
|                     |                        | Does "glitch art" show artifacts?         |
+---------------------+------------------------+-------------------------------------------+
```

1. Score each criterion: **Strong** (clearly meets), **Adequate** (partially meets), **Weak** (does not meet)
2. Note specific observations for each criterion
3. 4+ criteria score Strong? Design successful
4. 2+ criteria score Weak? Return to Step 4 for prompt refinement

**Got:** Scored evaluation with specific observations. Modern styles with gradient color scales harder to control than flat historical palettes — expect Adequate on first generation for color scale fidelity.

**If fail:** Most criteria score Weak? Prompt may need fundamental restructuring. Common fixes: move color descriptions to very beginning of prompt, simplify to fewer colors (3 instead of 5), strengthen genre-specific language, increase steps to 12.

### Step 8: Iterate or Finalize

Refine design through targeted iteration or accept result.

**Modern-Specific Iteration Strategies:**
1. **Scale sampling shift**: Viridis-derived palette too compressed? Sample from different positions on scale (e.g., skip middle, use endpoints + one off-center point)
2. **Genre amplification**: Genre not coming through? Add genre-specific keywords: "cyberpunk neon circuitry" instead of just "cyberpunk"
3. **Color front-loading**: Put specific color descriptions at very start of prompt
4. **Seed-locked color tuning**: Keep seed, change only color description to adjust palette while maintaining composition
5. **Rendering correction**: Strengthen rendering style with material-specific language: "glowing neon tubes on matte black surface" instead of just "neon sign"
6. **Accessibility enhancement**: CVD evaluation weak? Increase contrast between adjacent elements, add structural differentiation (texture, pattern, size) alongside color

**Iteration Budget:** Limit to 3 iterations per design concept.

1. Evaluation in Step 7 indicates specific weaknesses? Apply corresponding correction strategy
2. Regenerate using Step 6
3. Re-evaluate using Step 7
4. Accept when 4+ criteria score Strong or iteration budget exhausted

**Got:** Improved genre coherence and color fidelity after 1-2 iterations. Perfect scale reproduction unlikely — aim for "recognizably in right color family with correct progression direction."

**If fail:** Iteration not converging? Color scale may be too subtle for model to reproduce as gradient. Simplify by sampling fewer colors from scale (3 instead of 5), naming them explicitly. Alternatively, accept closest approximation, note deviation in documentation.

### Step 9: Document the Design

Create complete record of final design for reproducibility and reference.

1. Record:
   - **Genre**: Genre/aesthetic name and any hybrid elements
   - **Motif**: Primary motif(s) used and structural grammar
   - **Rendering Style**: Digital art, neon sign, glitch art, 3D render, etc.
   - **Color Scale**: Scale name and sample points, or custom palette
     - If scale: [scale name], sampled at positions [0.0, 0.25, 0.5, 0.75, 1.0]
     - If custom: each color with role and approximate hex value
   - **CVD Compatibility**: Target CVD type(s) and assessment
   - **Color Roles** (60/30/10):
     - Dominant: [color name from scale] (~hex) — 60%
     - Secondary: [color name from scale] (~hex) — 30%
     - Accent: [color name from scale] (~hex) — 10%
   - **Final Prompt**: Exact prompt that produced accepted image
   - **Seed**: Seed value for reproduction
   - **Resolution**: Resolution used
   - **Steps/Shift**: Generation parameters
   - **Evaluation**: Brief notes on five rubric criteria scores
   - **Iterations**: Number of iterations and key changes made
2. Note genre coherence observations (what worked, what model interpreted differently)
3. Note CVD-specific observations (elements relying on color alone vs. color + structure)
4. Suggest potential applications and adaptation notes

**Got:** Reproducible record with full color scale documentation and CVD compatibility assessment.

**If fail:** Full documentation feels excessive? Minimum: record final prompt, seed, color scale name, CVD compatibility status. Allows reproduction and accessibility verification.

## Checks

- [ ] Genre or aesthetic direction selected (or explicit "no genre" for pure abstract)
- [ ] Color strategy chosen: named colorblind scale or custom palette with CVD check
- [ ] Using colorblind scale? Sample points identified and roles assigned
- [ ] CVD compatibility assessed for target audience
- [ ] Motif structure analyzed with color-to-structure mapping
- [ ] Prompt includes explicit color descriptions (not just scale name) and genre-specific language
- [ ] Prompt specifies modern rendering style appropriate to genre
- [ ] Resolution matches application context
- [ ] Steps set to 10+ for gradient/color fidelity
- [ ] Generated image evaluated against 5-point modern rubric (including accessibility criterion)
- [ ] Seed value recorded for reproducibility
- [ ] Final design documented with prompt, seed, scale/palette, CVD notes, parameters

## Pitfalls

- **Using scale names in prompts**: Z-Image does not know "viridis" — translate to descriptive colors: "deep purple through teal green to bright yellow." Scale name for documentation, color words for prompt
- **Ignoring CVD beyond scale selection**: Choosing CVD-safe scale necessary but not sufficient. If ornament relies on distinguishing adjacent colors in scale without structural differentiation (shape, texture, size), may still be inaccessible. Use redundant visual coding
- **Genre without structure**: "Cyberpunk ornament" too vague. Specify motifs: "cyberpunk circuit trace border with hexagonal nodes." Genre is atmosphere; motifs are structure. Need both
- **Too many scale samples**: Sampling 7+ points from continuous scale creates muddy gradient in generation. 3-5 sample points produce cleaner results with better scale fidelity
- **Neglecting dark ground**: Many modern genres (cyberpunk, neon, vaporwave) assume dark background. Failing to specify "on dark background" or "on black ground" produces washed-out results with bright scales
- **Insufficient steps for gradients**: Gradient-based color scales need more inference steps than flat historical palettes. Using 8 steps for scale-based color work produces banded or imprecise transitions. Use 10-12
- **Forcing historical fidelity in modern skill**: This skill is not `ornament-style-color`. Find yourself policing anachronism or insisting on period-authentic pigments? Switch to historical skills. Here, Byzantine motif rendered as cyberpunk neon sign not error — it is the point

## See Also

- `ornament-style-mono` — monochrome foundation skill; useful for establishing motif structure before adding modern color treatment
- `ornament-style-color` — historical color companion; use when period-authentic palettes and art historical fidelity required instead of modern aesthetics
- `review-web-design` — color theory and accessibility principles apply to ornamental color composition
- `review-ux-ui` — WCAG color contrast guidelines relevant when ornament used in UI contexts
- `meditate` — focused attention and visualization practices can inform abstract pattern development
