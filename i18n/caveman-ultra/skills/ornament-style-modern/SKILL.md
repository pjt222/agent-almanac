---
name: ornament-style-modern
locale: caveman-ultra
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

Modern + speculative ornament w/ CVD-accessible scales. Anachronism encouraged, hybrids welcome, palette = perceptually uniform scales.

"Unleashed" companion to `ornament-style-mono` + `ornament-style-color`. Those = art historical fidelity. This = genre coherence + accessibility + freedom.

## Use When

- Modern/speculative/genre aesthetics (cyberpunk, solarpunk, brutalist, etc.)
- Patterns must be CVD-accessible w/ scientific scales
- Hybrid motifs (historical + contemporary)
- Digital ornament (UI, game assets, screen) — historical authenticity not goal
- CVD safety = req
- Pure abstract / algorithmic ornament
- Mix motif traditions across cultures + periods, no anachronism concern

## In

- **Required**: Genre/aesthetic (or "surprise me" / "no genre")
- **Required**: Application (border, medallion, frieze, panel, tile, standalone, UI element)
- **Optional**: Color scale (viridis, cividis, inferno, magma, plasma, etc.) or custom palette
- **Optional**: CVD type (protanopia, deuteranopia, tritanopia, "all")
- **Optional**: Specific motif (circuit traces, organic growth, geometric lattice)
- **Optional**: Rendering (digital art, holographic, neon, 3D, glitch)
- **Optional**: Historical hybrid ("Gothic tracery + circuit board")
- **Optional**: Resolution + aspect
- **Optional**: Seed

## Do

### Step 1: Pick genre/aesthetic

Genres fluid — mix + hybridize encouraged.

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

**Additional modes:**
- **Freeform**: any visual direction not in table
- **Historical hybrid**: period + modern genre ("Byzantine cyberpunk", "Islamic generative")
- **No genre**: pure abstract — structure, scale, composition only

1. User specified → confirm + note character/motifs/colors
2. "Surprise me" → random, weight strong-ornament genres (cyberpunk, solarpunk, generative, Art Deco Revival)
3. Hybrid → ID historical motifs + modern overlay
4. Note app context (digital screen, print, physical) → affects rendering

→ Genre IDed (or hybrid) w/ visual lang understood. For hybrids, both traditions articulated.

If err: not in table → WebSearch "[genre] aesthetic visual design motifs", construct entry. Key: visual char, motifs, color tendency.

### Step 2: Pick color strategy

CVD-accessible scale OR custom. Scales = recommended default.

**Path A: CVD-Accessible Scale (Recommended)**

Perceptually uniform scales:

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

**Translate continuous scale → ornamental palette:**
Sample 3-5 colors evenly. Viridis 5-color:
- Position 0.0: deep purple (#440154)
- Position 0.25: blue-violet (#31688e)
- Position 0.5: teal green (#35b779)
- Position 0.75: yellow-green (#90d743)
- Position 1.0: bright yellow (#fde725)

Roles via 60/30/10: dominant (largest), secondary (supporting), accent (focal).

**Path B: Custom Palette**

Freeform w/ optional CVD sim check:
1. 3-5 colors w/ named roles
2. Validate vs CVD via WebSearch "CVD color simulator [colors]"
3. Note CVD risk + mitigations (texture, pattern alongside color)

→ 3-5 named colors w/ roles, sampled or custom-defined, w/ CVD compat noted.

If err: unsure → viridis 3-color sample (deep purple, teal, yellow). Most universally accessible.

### Step 3: Analyze motif structure

Same framework as historical, w/ explicit permission for modern techniques.

1. Structural analysis:
   - **Symmetry**: bilateral / radial / translational / point, *or* glitch-broken / procedural asymmetry / pseudo-random
   - **Scaffold**: circle / rectangle / triangle / band, *or* voronoi cell / fractal / reaction-diffusion field
   - **Fill**: solid / line / open / mixed, *or* gradient / noise / data-driven
   - **Edge**: clean / organic / interlocking, *or* glitched / dissolving / pixel-stepped

2. **Color-to-structure mapping**:
   - Which elements get which colors from scale?
   - Color follows form or flows (gradient across)?
   - Where does brightest/lightest scale color appear? (focal points)
   - Ground/background color?

3. **Modern composition** (unique to this skill):
   - **Hybrid motifs**: historical structure + modern rendering (Gothic tracery as circuit board)
   - **Non-traditional symmetry**: deliberate breaks, glitch artifacts, procedural variation
   - **Layered**: ornament over texture, transparency, depth-of-field
   - **Meta-ornament**: patterns of patterns (fractal nesting)

→ Structural desc w/ explicit color assignments + modern techniques IDed.

If err: structure unclear for genre → anchor to real-world precedents. Cyberpunk circuits = band scaffold + translational symmetry. Generative = radial / field. Motif language novel but structural grammar universal.

### Step 4: Construct modern prompt

**Template:**
```
[Rendering style] of [genre]-inspired ornamental design,
[motif description], [color scale or palette],
[composition type], [mood/atmosphere],
[application context], [additional qualifiers]
```

**Modern Rendering Styles:**
- `digital art` — clean digital, screen-ready, smooth gradients
- `holographic` — iridescent, light-diffracting, multi-angle shift
- `neon sign` — glowing lines on dark, bloom, hot edges
- `3D render` — volumetric, lit, material quality, depth
- `glitch art` — corrupted, scan-lines, channel split
- `vector graphic` — flat, clean edges, scalable, geometric
- `screen print` — limited color, registration marks, ink quality
- `laser etched` — precise, metallic, ablation marks
- `generative art` — procedural, algorithmic, mathematical
- `concept art` — painterly, atmospheric, narrative, cinematic

**Color Scale → descriptive lang:**
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

→ Prompt 25-50 words: rendering, genre, motif, scale/palette, composition, mood.

If err: colors don't match scale → front-load. Don't mention scale name; describe colors at start: "deep purple, teal green, and bright yellow ornamental design...". Z-Image weights earlier tokens.

### Step 5: Configure params

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

1. Resolution per context
2. `steps` 10-12 (gradient detail + scale fidelity)
3. `shift` 3 (default) or 4 for neon-on-dark high-contrast
4. `random_seed: true` for explore or `false` w/ seed for reproducibility
5. Record params

→ Complete param set. Gradient scales need 10+ steps for smooth transitions.

If err: unsure → 1024x1024 @ 10 steps, shift 3. Increase to shift 4 only for neon/glow/high-contrast.

### Step 6: Generate

Z-Image MCP call.

1. `mcp__hf-mcp-server__gr1_z_image_turbo_generate` w/:
   - `prompt`: from Step 4
   - `resolution`: from Step 5
   - `steps`: from Step 5 (rec 10-12)
   - `shift`: from Step 5
   - `random_seed`: from Step 5
   - `seed`: if `random_seed` false
2. Record returned seed
3. Note gen time

→ Image w/ recognizable structure + gradient/palette. May not perfectly match — addressed in eval.

If err: MCP unavail → verify hf-mcp-server. Fully abstract → prompt needs structural lang → Step 4. Colors wrong → front-load names.

### Step 7: Evaluate

5 criteria adapted for modern.

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

1. Score each: **Strong** / **Adequate** / **Weak**
2. Note specific obs
3. ≥4 Strong → success
4. ≥2 Weak → back to Step 4

→ Scored eval w/ specific obs. Modern w/ gradient scales harder than flat historical → expect Adequate first gen.

If err: most Weak → fundamental restructure. Common: front-load colors, simplify (3 not 5), strengthen genre-specific lang, steps to 12.

### Step 8: Iterate or finalize

**Modern-Specific Strategies:**
1. **Scale sampling shift**: viridis-derived too compressed → sample different positions (skip middle, endpoints + off-center)
2. **Genre amplification**: not coming through → genre-specific keywords: "cyberpunk neon circuitry" not just "cyberpunk"
3. **Color front-loading**: specific colors at very start
4. **Seed-locked tuning**: keep seed, change only color desc
5. **Rendering correction**: material-specific: "glowing neon tubes on matte black surface" not just "neon sign"
6. **Accessibility enhancement**: weak CVD eval → increase contrast adjacent + structural diff (texture, pattern, size) alongside color

**Iteration Budget:** ≤3 per concept.

1. Apply correction per Step 7 weakness
2. Regen via Step 6
3. Re-eval Step 7
4. Accept when ≥4 Strong or budget exhausted

→ Improved coherence + fidelity after 1-2 iter. Perfect scale unlikely — aim "right color family + correct progression direction."

If err: not converging → scale too subtle. Simplify (3 not 5), name explicitly. Or accept closest + note deviation.

### Step 9: Document

1. Record:
   - **Genre**: name + hybrid elements
   - **Motif**: primary + structural grammar
   - **Rendering**: digital art / neon / glitch / 3D render
   - **Color Scale**: scale + sample points, or custom
     - Scale: [name], sampled @ [0.0, 0.25, 0.5, 0.75, 1.0]
     - Custom: each color w/ role + approx hex
   - **CVD Compatibility**: target type(s) + assessment
   - **Color Roles** (60/30/10):
     - Dominant: [scale color] (~hex) — 60%
     - Secondary: [scale color] (~hex) — 30%
     - Accent: [scale color] (~hex) — 10%
   - **Final Prompt**: exact accepted
   - **Seed**: for reproduction
   - **Resolution**: used
   - **Steps/Shift**: gen params
   - **Evaluation**: brief criteria scores
   - **Iterations**: count + key changes
2. Genre coherence obs (worked, model interpreted differently)
3. CVD-specific obs (color-only vs color+structure)
4. Suggest applications + adaptation

→ Reproducible record w/ full scale docs + CVD assessment.

If err: full doc excessive → at min: prompt, seed, scale name, CVD status. Allows reproduction + verification.

## Check

- [ ] Genre/aesthetic picked (or "no genre" for pure abstract)
- [ ] Color strategy: named CVD scale OR custom palette w/ CVD check
- [ ] If scale: sample points IDed + roles assigned
- [ ] CVD compat assessed for target audience
- [ ] Motif structure analyzed w/ color-to-structure
- [ ] Prompt: explicit colors (not just scale name) + genre lang
- [ ] Prompt: modern rendering style for genre
- [ ] Resolution matches application
- [ ] Steps ≥10 for gradient/color fidelity
- [ ] Image evaluated 5-point modern rubric (incl accessibility)
- [ ] Seed recorded
- [ ] Final design documented w/ prompt, seed, scale/palette, CVD notes, params

## Traps

- **Scale names in prompts**: Z-Image doesn't know "viridis" → translate: "deep purple through teal green to bright yellow". Scale name = your docs, color words = prompt
- **Ignore CVD beyond scale**: CVD-safe scale = necessary, not sufficient. Adjacent colors w/o structural diff (shape, texture, size) → still inaccessible. Use redundant visual coding
- **Genre w/o structure**: "cyberpunk ornament" too vague. Specify motifs: "cyberpunk circuit trace border w/ hexagonal nodes". Genre = atmosphere; motifs = structure. Need both
- **Too many scale samples**: 7+ points → muddy gradient. 3-5 = cleaner, better fidelity
- **Neglect dark ground**: many modern (cyberpunk, neon, vaporwave) assume dark bg. No "on dark background" → washed out w/ bright scales
- **Insufficient steps for gradients**: gradient scales need more than flat. 8 steps for scale color → banded / imprecise. Use 10-12
- **Force historical fidelity in modern skill**: this ≠ `ornament-style-color`. Policing anachronism / period-authentic pigments → switch to historical. Here, Byzantine motif as cyberpunk neon = the point

## →

- `ornament-style-mono` — mono foundation; useful before adding modern color
- `ornament-style-color` — historical color companion; use when period-authentic required
- `review-web-design` — color theory + accessibility apply
- `review-ux-ui` — WCAG contrast for UI ornament
- `meditate` — focused attention + visualization for abstract pattern dev
