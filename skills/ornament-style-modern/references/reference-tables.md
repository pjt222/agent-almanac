# Reference Tables — ornament-style-modern

Detailed genre, colorblind-scale, CVD, resolution, and evaluation tables extracted from `SKILL.md`.

## Modern and Speculative Aesthetics

| Genre | Visual Character | Motif Language | Color Tendency |
|---|---|---|---|
| Cyberpunk | Neon-on-dark, circuit, tech, glitch | Circuit traces, kanji, hexagons, fractured glass, data streams | Neon cyan/magenta on black |
| Hard Sci-Fi | Clean, technical, precise | Engineering diagrams, orbital paths, crystalline lattice | Cool metallics, deep space blue |
| Solarpunk | Organic-tech fusion, verdant | Leaf/vine + solar panel, living architecture, moss on circuit | Greens, warm amber, sunlight |
| Biopunk | Organic, visceral, grown | DNA helix, cell structure, mycelium, coral, nerve networks | Deep organics, bioluminescent |
| Brutalist | Raw, monumental, geometric | Concrete texture, massive geometry, exposed grid, slab | Grays, concrete, industrial |
| Art Deco Revival | Geometric elegance, luxury | Sunburst, chevron, ziggurat, fan, stepped forms | Gold, black, cream, emerald |
| Vaporwave | Retro-digital, surreal | Classical busts (glitched), grid, gradient, marble | Pink/teal/purple gradients |
| Retrofuturism | 1950s–60s future vision | Atomic/Space Age, streamline, ray gun, fin, orbit | Chrome, turquoise, coral |
| Generative / Algorithmic | Mathematical, procedural | Voronoi, reaction-diffusion, L-system, noise field, fractal | Any scale — often viridis family |
| Afrofuturism | Ancestral + futuristic | Adinkra, kente geometry, cosmic, mask, constellation | Rich earth + metallic + electric |

## Colorblind-Accessible Color Scales

| Scale | Type | CVD Safe | Character | Best For |
|---|---|---|---|---|
| Viridis | Sequential | All 3 types | Blue-green-yellow, balanced | Default recommendation |
| Cividis | Sequential | Deutan + Protan optimized | Blue-to-yellow, muted | Maximum CVD safety |
| Inferno | Sequential | All 3 types | Black-red-yellow-white, hot | Dramatic, high contrast |
| Magma | Sequential | All 3 types | Black-purple-orange-yellow | Moody, volcanic |
| Plasma | Sequential | All 3 types | Purple-pink-orange-yellow | Vivid, energetic |
| Turbo | Rainbow-like | Moderate | Full spectrum, perceptual | Many distinct colors |
| Mako | Sequential | All 3 types | Dark blue to light teal | Cool, oceanic |
| Rocket | Sequential | All 3 types | Dark to light via warm tones | Warm, ember-like |
| Okabe-Ito | Categorical | All 3 types | 8 distinct colors | Discrete elements, max distinction |

## CVD Types and Impact

| CVD Type | Affects | Confuses | Safe Scales |
|---|---|---|---|
| Protanopia (red-blind) | ~1% male | Red/green | viridis, cividis, inferno |
| Deuteranopia (green-blind) | ~5% male | Red/green | viridis, cividis, inferno |
| Tritanopia (blue-yellow) | ~0.01% | Blue/yellow | inferno, magma (with care) |

## Resolution by Application

| Application | Recommended | Rationale |
|---|---|---|
| Medallion / Roundel | 1024x1024 (1:1) | Radial symmetry needs square |
| Tile / Repeat Unit | 1024x1024 (1:1) | Square for seamless tiling |
| Horizontal Frieze | 1280x720 (16:9) | Wide format for running border |
| Vertical Panel | 720x1280 (9:16) | Portrait format for columns |
| Wide Border | 1344x576 (21:9) | Ultrawide for architectural |
| UI Element | 1152x896 (9:7) | Balanced landscape for screen use |
| Large Detail | 1536x1536 (1:1) | Higher res for fine gradient work |

## Modern Ornament Evaluation Rubric

| Criterion | Replaces (from color) | Evaluation Questions |
|---|---|---|
| 1. Genre Coherence | Period Accuracy | Does it feel like the specified genre? Would someone familiar with the genre recognize the aesthetic? |
| 2. Color Scale Fidelity | Palette Match | Does the color gradient/palette approximate the chosen scale? Are the key colors from the scale present? |
| 3. Accessibility | (new criterion) | Would this be distinguishable under the target CVD type? Do elements rely solely on color or also on shape/texture? |
| 4. Composition Quality | Form-Color Balance | Does the ornamental structure read clearly? Does color clarify or obscure the motif? |
| 5. Rendering Style | Rendering Style | Does it match the specified rendering technique? Does a "neon sign" glow? Does "glitch art" show artifacts? |
