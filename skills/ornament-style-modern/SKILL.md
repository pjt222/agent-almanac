---
name: ornament-style-modern
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

Design ornamental patterns using modern and speculative aesthetics with colorblind-accessible color scales. This skill breaks free from historical period constraints — anachronism is encouraged, hybrid motifs are welcome, and the palette system is built on perceptually uniform color scales designed for universal accessibility.

This is the "unleashed" companion to `ornament-style-mono` and `ornament-style-color`. Where those skills ground every decision in art historical fidelity, this skill grounds decisions in genre coherence, color accessibility, and artistic freedom.

## When to Use

- Creating ornamental designs in modern, speculative, or genre-specific aesthetics (cyberpunk, solarpunk, brutalist, etc.)
- Designing patterns that must be colorblind-accessible using scientifically validated color scales
- Exploring hybrid motifs that combine historical ornament with contemporary visual language
- Producing ornament for digital contexts (UI decoration, game assets, screen-based media) where historical authenticity is not the goal
- Generating decorative imagery where CVD (Color Vision Deficiency) safety is a requirement
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

## Procedure

### Step 1: Select Genre / Aesthetic

Choose a modern or speculative aesthetic as the visual foundation. Unlike historical periods, genres are fluid — mixing and hybridization are encouraged.

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
- **Freeform user-defined aesthetic**: describe any visual direction not in the table
- **Historical hybrid**: combine a historical period with a modern genre (e.g., "Byzantine cyberpunk," "Islamic generative")
- **No genre / pure abstract**: ornament driven entirely by structure, color scale, and composition with no genre narrative

1. If the user specified a genre, confirm and note its visual character, motif language, and color tendency
2. If "surprise me," select randomly — weight toward genres with strong ornamental potential (cyberpunk, solarpunk, generative, Art Deco Revival)
3. If a historical hybrid is requested, identify the historical motif vocabulary and the modern rendering/mood overlay
4. Note the application context (digital screen, print, physical object) as this affects rendering choices

**Expected:** A clearly identified genre (or hybrid) with its characteristic visual language understood. For hybrids, both source traditions should be articulated.

**On failure:** If the user requests a genre not in the table, research its visual conventions using WebSearch for "[genre] aesthetic visual design motifs" and construct an equivalent entry. The key elements to identify are: visual character, typical motifs, and color tendency.

### Step 2: Select Color Strategy

Choose between a colorblind-accessible scale or a custom palette. Colorblind scales are the recommended default.

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

**Translating a continuous scale to an ornamental palette:**
Sample 3-5 colors at evenly spaced intervals along the scale. For a 5-color palette from viridis:
- Position 0.0: deep purple (#440154)
- Position 0.25: blue-violet (#31688e)
- Position 0.5: teal green (#35b779)
- Position 0.75: yellow-green (#90d743)
- Position 1.0: bright yellow (#fde725)

Assign roles using the 60/30/10 framework from `ornament-style-color`: dominant (largest area), secondary (supporting), accent (focal points).

**Path B: Custom Palette**

Freeform palette selection with optional CVD simulation check:
1. Define 3-5 colors with named roles
2. Optionally validate against CVD types using WebSearch for "CVD color simulator [colors]"
3. Note any CVD risk and mitigations (e.g., using texture or pattern in addition to color)

**Expected:** A palette of 3-5 named colors with roles, either sampled from a named scale or custom-defined, with CVD compatibility noted.

**On failure:** If unsure, use viridis with 3-color sampling (deep purple, teal, yellow). This is the most universally accessible and visually balanced default.

### Step 3: Analyze Motif Structure

Understand the structural grammar of the chosen motif, using the same framework as the historical skills but with explicit permission for modern compositional techniques.

1. Perform structural analysis:
   - **Symmetry type**: bilateral, radial, translational, point, *or* glitch-broken, procedural asymmetry, pseudo-random
   - **Geometric scaffold**: circle, rectangle, triangle, band, *or* voronoi cell, fractal, reaction-diffusion field
   - **Fill pattern**: solid, line-filled, open, mixed, *or* gradient, noise texture, data-driven
   - **Edge treatment**: clean, organic, interlocking, *or* glitched, dissolving, pixel-stepped

2. Add **color-to-structure mapping**:
   - Which structural elements receive which colors from the selected scale?
   - Does color follow form (each shape gets one color) or flow (gradient across structural boundaries)?
   - Where does the scale's brightest/lightest color appear? (Typically focal points)
   - What color is the ground/background?

3. **Modern composition techniques** (unique to this skill):
   - **Hybrid motifs**: historical ornament structure + modern rendering (e.g., Gothic tracery rendered as circuit board)
   - **Non-traditional symmetry**: deliberate symmetry breaks, glitch artifacts, procedural variation within a repeating pattern
   - **Layered compositions**: ornament over texture, transparency effects, depth-of-field blur
   - **Meta-ornament**: ornamental patterns composed of smaller ornamental patterns (fractal nesting)

**Expected:** A structural description with explicit color assignments and any modern composition techniques identified.

**On failure:** If the motif structure is unclear for a modern genre, anchor to the genre's real-world visual precedents. Cyberpunk circuit traces follow band scaffold with translational symmetry. Generative/algorithmic uses radial or field-based scaffold. The motif language may be novel but the structural grammar is universal.

### Step 4: Construct Modern Prompt

Build the text prompt for Z-Image generation, using the modern prompt template.

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
Translate the scale name into descriptive color language that the model can interpret:
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

**Expected:** A prompt of 25-50 words that specifies rendering style, genre, motif, color scale/palette, composition, and mood.

**On failure:** If the prompt produces colors that do not match the intended scale, front-load the color description. Instead of mentioning the scale name, describe the actual colors at the start: "deep purple, teal green, and bright yellow ornamental design..." Z-Image weights earlier prompt tokens more heavily.

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
3. Set `shift` to 3 (default) or 4 for neon-on-dark styles that benefit from higher contrast
4. Choose `random_seed: true` for exploration or `random_seed: false` with a specific seed for reproducibility
5. Record all parameters for documentation

**Expected:** A complete parameter set. Gradient-based scales need 10+ steps for smooth color transitions.

**On failure:** If unsure, use 1024x1024 at 10 steps with shift 3. Increase to shift 4 only for neon/glowing/high-contrast styles.

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

**Expected:** A generated image with recognizable ornamental structure and visible color gradient/palette. The color may not perfectly match the specified scale — this is addressed in evaluation.

**On failure:** If the MCP tool is unavailable, verify that hf-mcp-server is configured (see `configure-mcp-server` or `troubleshoot-mcp-connection`). If the generated image is entirely abstract with no ornamental structure, the prompt needs more specific structural language — return to Step 4. If colors are completely wrong, front-load the color names in the prompt.

### Step 7: Evaluate Design

Assess the generated image against five criteria adapted for modern ornament.

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
3. If 4+ criteria score Strong, the design is successful
4. If 2+ criteria score Weak, return to Step 4 for prompt refinement

**Expected:** A scored evaluation with specific observations. Modern styles with gradient color scales are harder to control than flat historical palettes — expect Adequate on first generation for color scale fidelity.

**On failure:** If most criteria score Weak, the prompt may need fundamental restructuring. Common fixes: move color descriptions to the very beginning of the prompt, simplify to fewer colors (3 instead of 5), strengthen the genre-specific language, increase steps to 12.

### Step 8: Iterate or Finalize

Refine the design through targeted iteration or accept the result.

**Modern-Specific Iteration Strategies:**
1. **Scale sampling shift**: If the viridis-derived palette is too compressed, sample from different positions on the scale (e.g., skip the middle, use endpoints + one off-center point)
2. **Genre amplification**: If the genre is not coming through, add genre-specific keywords: "cyberpunk neon circuitry" instead of just "cyberpunk"
3. **Color front-loading**: Put specific color descriptions at the very start of the prompt
4. **Seed-locked color tuning**: Keep the seed, change only the color description to adjust palette while maintaining composition
5. **Rendering correction**: Strengthen the rendering style with material-specific language: "glowing neon tubes on matte black surface" instead of just "neon sign"
6. **Accessibility enhancement**: If CVD evaluation is weak, increase contrast between adjacent elements and add structural differentiation (texture, pattern, size) alongside color

**Iteration Budget:** Limit to 3 iterations per design concept.

1. If the evaluation in Step 7 indicates specific weaknesses, apply the corresponding correction strategy
2. Regenerate using Step 6
3. Re-evaluate using Step 7
4. Accept when 4+ criteria score Strong or iteration budget is exhausted

**Expected:** Improved genre coherence and color fidelity after 1-2 iterations. Perfect scale reproduction is unlikely — aim for "recognizably in the right color family with correct progression direction."

**On failure:** If iteration is not converging, the color scale may be too subtle for the model to reproduce as a gradient. Simplify by sampling fewer colors from the scale (3 instead of 5) and naming them explicitly. Alternatively, accept the closest approximation and note the deviation in documentation.

### Step 9: Document the Design

Create a complete record of the final design for reproducibility and reference.

1. Record the following:
   - **Genre**: Genre/aesthetic name and any hybrid elements
   - **Motif**: Primary motif(s) used and their structural grammar
   - **Rendering Style**: Digital art, neon sign, glitch art, 3D render, etc.
   - **Color Scale**: Scale name and sample points, or custom palette
     - If scale: [scale name], sampled at positions [0.0, 0.25, 0.5, 0.75, 1.0]
     - If custom: each color with role and approximate hex value
   - **CVD Compatibility**: Target CVD type(s) and assessment
   - **Color Roles** (60/30/10):
     - Dominant: [color name from scale] (~hex) — 60%
     - Secondary: [color name from scale] (~hex) — 30%
     - Accent: [color name from scale] (~hex) — 10%
   - **Final Prompt**: The exact prompt that produced the accepted image
   - **Seed**: The seed value for reproduction
   - **Resolution**: The resolution used
   - **Steps/Shift**: Generation parameters
   - **Evaluation**: Brief notes on the five rubric criteria scores
   - **Iterations**: Number of iterations and key changes made
2. Note genre coherence observations (what worked, what the model interpreted differently)
3. Note CVD-specific observations (elements that rely on color alone vs. color + structure)
4. Suggest potential applications and adaptation notes

**Expected:** A reproducible record with full color scale documentation and CVD compatibility assessment.

**On failure:** If full documentation feels excessive, at minimum record the final prompt, seed, color scale name, and CVD compatibility status. These allow reproduction and accessibility verification.

## Validation

- [ ] A genre or aesthetic direction was selected (or explicit "no genre" for pure abstract)
- [ ] Color strategy was chosen: named colorblind scale or custom palette with CVD check
- [ ] If using a colorblind scale, sample points were identified and roles assigned
- [ ] CVD compatibility was assessed for the target audience
- [ ] Motif structure was analyzed with color-to-structure mapping
- [ ] Prompt includes explicit color descriptions (not just scale name) and genre-specific language
- [ ] Prompt specifies a modern rendering style appropriate to the genre
- [ ] Resolution matches the application context
- [ ] Steps set to 10+ for gradient/color fidelity
- [ ] Generated image was evaluated against the 5-point modern rubric (including accessibility criterion)
- [ ] Seed value was recorded for reproducibility
- [ ] Final design is documented with prompt, seed, scale/palette, CVD notes, and parameters

## Common Pitfalls

- **Using scale names in prompts**: Z-Image does not know "viridis" — translate to descriptive colors: "deep purple through teal green to bright yellow." The scale name is for your documentation, the color words are for the prompt
- **Ignoring CVD beyond scale selection**: Choosing a CVD-safe scale is necessary but not sufficient. If the ornament relies on distinguishing adjacent colors in the scale without structural differentiation (shape, texture, size), it may still be inaccessible. Use redundant visual coding
- **Genre without structure**: "Cyberpunk ornament" is too vague. Specify the motifs: "cyberpunk circuit trace border with hexagonal nodes." Genre is atmosphere; motifs are structure. You need both
- **Too many scale samples**: Sampling 7+ points from a continuous scale creates a muddy gradient in generation. 3-5 sample points produce cleaner results with better scale fidelity
- **Neglecting the dark ground**: Many modern genres (cyberpunk, neon, vaporwave) assume a dark background. Failing to specify "on dark background" or "on black ground" produces washed-out results with bright scales
- **Insufficient steps for gradients**: Gradient-based color scales need more inference steps than flat historical palettes. Using 8 steps for scale-based color work produces banded or imprecise transitions. Use 10-12
- **Forcing historical fidelity in a modern skill**: This skill is not `ornament-style-color`. If you find yourself policing anachronism or insisting on period-authentic pigments, switch to the historical skills. Here, a Byzantine motif rendered as a cyberpunk neon sign is not an error — it is the point

## Related Skills

- `ornament-style-mono` — the monochrome foundation skill; useful for establishing motif structure before adding modern color treatment
- `ornament-style-color` — the historical color companion; use when period-authentic palettes and art historical fidelity are required instead of modern aesthetics
- `review-web-design` — color theory and accessibility principles apply to ornamental color composition
- `review-ux-ui` — WCAG color contrast guidelines are relevant when ornament is used in UI contexts
- `meditate` — focused attention and visualization practices can inform abstract pattern development
