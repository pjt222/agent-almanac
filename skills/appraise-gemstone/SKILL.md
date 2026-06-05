---
name: appraise-gemstone
description: >
  Appraise gemstone value using the four Cs (color, clarity, cut, carat),
  origin assessment, treatment detection, and market factor analysis.
  Advisory educational guidance only — not a certified appraisal. Use when
  understanding factors that determine a gemstone's value, pre-screening
  stones before a professional appraisal, evaluating whether a seller's asking
  price is reasonable, learning gemstone grading methodology, or understanding
  how treatment status affects value.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: lapidary
  complexity: advanced
  language: natural
  tags: lapidary, appraisal, valuation, gemstones, grading
---

# Appraise Gemstone

Appraise gemstone value using the four Cs (colour, clarity, cut, carat weight), treatment detection, origin assessment, and market factor analysis. This is educational advisory guidance only and does not constitute a certified gemological appraisal.

> **DISCLAIMER**: This procedure provides educational guidance on gemstone valuation methodology. It is NOT a certified appraisal. For insurance, estate, sale, or legal purposes, always obtain a formal appraisal from a certified gemologist (GIA Graduate Gemologist, FGA, or equivalent). Gemstone values can vary enormously based on factors that require hands-on professional assessment.

## When to Use

- You want to understand the factors that determine a gemstone's value
- You are pre-screening stones before paying for a professional appraisal
- You need to evaluate whether a seller's asking price is within a reasonable range
- You are learning gemstone grading methodology for educational purposes
- You want to understand how treatment status affects value

## Inputs

- **Required**: Identified gemstone (species confirmed — see `identify-gemstone`)
- **Required**: Access to the stone (loose preferred; mounted stones limit assessment)
- **Optional**: Carat scale (accurate to 0.01 ct)
- **Optional**: 10x loupe or gemological microscope
- **Optional**: Daylight-equivalent light source (5500-6500K)
- **Optional**: Colour grading master stones or reference images (GIA system)
- **Optional**: Refractometer and Chelsea filter (for treatment detection)

## Procedure

### Step 1: Colour Grading

Assess the stone's colour using the three components: hue, saturation, and tone.

```
Colour Assessment Framework:

HUE: The dominant spectral colour
+------------------+------------------------------------------+
| Primary Hue      | Examples                                 |
+------------------+------------------------------------------+
| Red              | Ruby, red spinel, pyrope garnet          |
| Orange           | Spessartine garnet, fire opal            |
| Yellow           | Yellow sapphire, citrine, chrysoberyl    |
| Green            | Emerald, tsavorite, peridot, tourmaline  |
| Blue             | Sapphire, aquamarine, tanzanite          |
| Violet/Purple    | Amethyst, purple sapphire                |
| Pink             | Pink sapphire, morganite, kunzite        |
+------------------+------------------------------------------+
Secondary modifiers: yellowish-green, purplish-red, orangy-pink, etc.

SATURATION: Intensity of the colour
+------------------+------------------------------------------+
| Level            | Description                              |
+------------------+------------------------------------------+
| Vivid            | Pure, intense colour (most valuable)     |
| Strong           | Rich colour, slight modifier             |
| Moderate         | Noticeable colour, some grey/brown       |
| Weak             | Faint colour, significant grey/brown     |
| Greyish/Brownish | Colour masked by grey or brown modifiers |
+------------------+------------------------------------------+

TONE: Lightness or darkness
+------------------+------------------------------------------+
| Level            | Description                              |
+------------------+------------------------------------------+
| Very light       | Pastel, may lack presence                |
| Light            | Attractive in some species (aquamarine)  |
| Medium-light     | Often ideal for many species             |
| Medium           | Classic "fine" tone for most coloured    |
|                  | gemstones                                |
| Medium-dark      | Rich, but watch for over-darkening       |
| Dark             | Colour may appear black face-up          |
| Very dark        | Loses transparency, appears opaque       |
+------------------+------------------------------------------+

IDEAL COLOUR RANGES (highest value):
- Ruby: medium-dark, vivid red ("pigeon blood")
- Sapphire: medium, vivid blue (not too dark, not violetish)
- Emerald: medium, vivid green (not yellowish, not bluish)
- Tanzanite: medium-dark, vivid violetish-blue
- Aquamarine: medium, strong blue (not greenish)
```

1. View the stone face-up under daylight-equivalent lighting
2. Identify the primary hue and any secondary modifiers
3. Assess saturation — vivid and strong command the highest premiums
4. Assess tone — medium is generally optimal; too dark or too light reduces value
5. Compare to reference images or master stones if available
6. Note any colour zoning visible face-up (reduces value)

**Expected:** A three-component colour grade (e.g., "medium vivid blue with slight violetish modifier") that positions the stone on the colour quality spectrum for its species.

**On failure:** If lighting conditions are not ideal (yellowish indoor light), note the limitation. Colour grading under incorrect lighting produces unreliable results. If colour-change is suspected (alexandrite, some sapphires, some garnets), assess under both daylight and incandescent light.

### Step 2: Clarity Grading

Evaluate the stone's internal characteristics under 10x magnification.

```
Coloured Gemstone Clarity Scale (GIA-based):

+-------------------+------------------------------------------+
| Grade             | Description                              |
+-------------------+------------------------------------------+
| VVS               | Very Very Slightly Included: minute      |
| (eye-clean)       | inclusions, difficult to see at 10x      |
+-------------------+------------------------------------------+
| VS                | Very Slightly Included: minor            |
| (eye-clean)       | inclusions, noticeable at 10x            |
+-------------------+------------------------------------------+
| SI1               | Slightly Included: noticeable at 10x,    |
| (usually eye-     | may be visible to the eye                |
| clean)            |                                          |
+-------------------+------------------------------------------+
| SI2               | Slightly Included: easily seen at 10x,   |
| (eye-visible)     | visible to the unaided eye               |
+-------------------+------------------------------------------+
| I1                | Included: obvious inclusions that may    |
|                   | affect transparency or durability        |
+-------------------+------------------------------------------+
| I2-I3             | Heavily Included: prominent inclusions   |
|                   | that affect beauty and/or durability     |
+-------------------+------------------------------------------+

SPECIES-SPECIFIC EXPECTATIONS:
Different species have different "normal" clarity levels:
- Type I (usually eye-clean): aquamarine, topaz, chrysoberyl
  → Inclusions are penalized more heavily
- Type II (usually included): ruby, sapphire, tourmaline
  → Eye-clean examples command significant premiums
- Type III (almost always included): emerald, red tourmaline
  → Eye-clean examples are extremely rare and valuable
```

1. Examine the stone face-up first — does the unaided eye see any inclusions?
2. Examine under 10x magnification, focusing through the table
3. Note inclusion type (crystal, feather, fingerprint, silk, needle), size, location, and number
4. Assess whether inclusions affect transparency, brilliance, or durability
5. Assign a clarity grade based on the visibility and impact of inclusions
6. Consider species expectations — an SI1 emerald is excellent; an SI1 aquamarine is average

**Expected:** A clarity grade with description of key inclusions, their location, and their impact on beauty and durability. Grade is calibrated to species-specific expectations.

**On failure:** If magnification is insufficient (no loupe available), perform an eye-clean/not-eye-clean assessment only. Note the limitation. If the stone is mounted and pavilion inclusions are hidden, note which areas could not be assessed.

### Step 3: Cut Quality Assessment

Evaluate the quality of the cut based on proportions, symmetry, and light performance.

```
Cut Quality Factors:

PROPORTIONS:
+------------------+------------------------------------------+
| Factor           | Ideal                                    |
+------------------+------------------------------------------+
| Table size       | 55-65% of girdle diameter (round)        |
| Crown height     | 12-17% of girdle diameter                |
| Pavilion depth   | 40-45% of girdle diameter                |
| Girdle thickness | Medium (not too thin, not too thick)     |
| Total depth      | 58-65% of girdle diameter                |
+------------------+------------------------------------------+

LIGHT PERFORMANCE:
+------------------+------------------------------------------+
| Factor           | Description                              |
+------------------+------------------------------------------+
| Brilliance       | White light return — pavillion angles     |
|                  | determine total internal reflection      |
+------------------+------------------------------------------+
| Windowing        | "See-through" area (pavilion too shallow)|
|                  | Any visible window reduces value         |
+------------------+------------------------------------------+
| Extinction       | Dark areas that do not return light      |
|                  | (pavilion too steep, or inherent to deep |
|                  | colour stones at steep viewing angles)   |
+------------------+------------------------------------------+
| Scintillation    | Flashes of light as stone moves          |
|                  | (pattern and intensity)                  |
+------------------+------------------------------------------+

SYMMETRY AND FINISH:
- Facet alignment and meet precision
- Outline symmetry (roundness, oval evenness)
- Surface polish quality (scratches, orange peel)
- Girdle consistency (even thickness)
```

1. View the stone face-up and rock it gently — observe brilliance, windowing, and extinction
2. Check proportions: table size, crown height, pavilion depth
3. Assess symmetry: outline shape, facet alignment, meet precision
4. Evaluate surface polish: scratches, polish lines, orange peel under 10x
5. Check girdle: even thickness, not too thin (chipping risk) or too thick (dead weight)
6. Rate the cut from Excellent to Poor

**Expected:** A cut quality assessment covering proportions, light performance, symmetry, and surface finish. The cut grade significantly affects value — a well-cut stone of moderate quality can outperform a poorly-cut stone of higher colour and clarity.

**On failure:** If the stone is mounted and proportions cannot be fully measured, assess what is visible (face-up light performance, symmetry, polish) and note that proportions could not be verified. Mounted stones always have assessment limitations.

### Step 4: Carat Weight and Measurements

Record the stone's weight and dimensions.

1. Weigh the stone on a carat scale (1 carat = 0.2 grams)
2. Record weight to two decimal places (e.g., 2.37 ct)
3. Measure dimensions: length x width x depth in millimetres
4. For mounted stones, estimate weight from dimensions using species-specific formulas:
   - Round: diameter^2 x depth x SG factor
   - Oval: length x width x depth x SG factor x 0.0020
5. Note that per-carat value increases at commercially significant weight thresholds:
   - 0.50 ct, 1.00 ct, 2.00 ct, 3.00 ct, 5.00 ct, 10.00 ct
   - A 1.02 ct stone commands a premium over a 0.98 ct stone of equal quality

**Expected:** Accurate carat weight (to 0.01 ct) and millimetre dimensions. For mounted stones, a weight estimate with stated margin of error.

**On failure:** If no carat scale is available, measure dimensions and estimate weight using standard formulas. Note that the weight is estimated. For valuable stones, always verify weight on a calibrated scale.

### Step 5: Treatment Detection

Assess whether the stone has been treated to enhance its appearance.

```
Common Gemstone Treatments:
+-------------------+------------------------------------------+
| Treatment         | Detection Indicators                     |
+-------------------+------------------------------------------+
| Heat treatment    | Dissolved silk (rutile needles melted),  |
| (ruby, sapphire)  | stress fractures around inclusions,     |
|                   | altered colour zoning                    |
|                   | NOTE: Heat treatment is standard and     |
|                   | widely accepted for corundum             |
+-------------------+------------------------------------------+
| Fracture filling  | Flash effect under fibre-optic light     |
| (emerald, ruby)   | (blue/orange flash in fractures),       |
|                   | bubbles in filler material               |
|                   | Reduces value significantly              |
+-------------------+------------------------------------------+
| Surface coating   | Colour concentrated at surface,          |
| (topaz "mystic")  | scratches reveal different colour       |
|                   | underneath, uneven colour               |
+-------------------+------------------------------------------+
| Diffusion         | Colour concentrated at surface or along  |
| (sapphire)        | fractures. Immerse in methylene iodide  |
|                   | — colour pattern visible                 |
+-------------------+------------------------------------------+
| Irradiation       | Unstable colours may fade in sunlight    |
| (topaz, diamond)  | Some irradiation is undetectable without |
|                   | lab testing                              |
+-------------------+------------------------------------------+
| Glass filling     | Gas bubbles in glass, flash effect,      |
| (ruby)            | different lustre in filled areas         |
|                   | Severely reduces value and durability    |
+-------------------+------------------------------------------+

TREATMENT IMPACT ON VALUE:
- Untreated (with certification): highest premium
- Standard accepted treatment (heat): moderate reduction
- Enhancement treatment (filling, coating): significant reduction
- Requires disclosure at point of sale in all jurisdictions
```

1. Examine inclusions for signs of heat treatment (dissolved silk, stress halos)
2. Use fibre-optic light to check for fracture filling (flash effect)
3. Check for surface coatings by examining edges and scratches
4. For high-value stones, note that laboratory certification is essential for treatment status
5. Record treatment assessment: untreated, heated, filled, coated, diffused, or unknown

**Expected:** A treatment assessment with supporting observations. For stones above $500, recommend laboratory certification (GIA, GRS, SSEF, Gubelin) for authoritative treatment determination.

**On failure:** Many treatments (especially mild heat treatment and some irradiation) cannot be detected without laboratory instruments (FTIR spectroscopy, UV-Vis, Raman). If treatment status is uncertain, record "unknown — laboratory testing recommended" rather than guessing.

### Step 6: Market Factor Analysis

Consider external factors that affect market value beyond the four Cs.

```
Market Factors:
+-------------------+------------------------------------------+
| Factor            | Impact                                   |
+-------------------+------------------------------------------+
| Origin            | Kashmir sapphire, Burmese ruby, and      |
|                   | Colombian emerald command significant     |
|                   | premiums (2-10x) over identical quality  |
|                   | from other sources                       |
+-------------------+------------------------------------------+
| Rarity            | Paraiba tourmaline, alexandrite,          |
|                   | padparadscha sapphire — scarcity drives  |
|                   | premium pricing                          |
+-------------------+------------------------------------------+
| Certification     | GIA, GRS, SSEF, Gubelin reports add      |
|                   | confidence and liquidity to high-value   |
|                   | stones                                   |
+-------------------+------------------------------------------+
| Fashion/trends    | Tanzanite, morganite, and coloured       |
|                   | diamonds have experienced trend-driven   |
|                   | price increases                          |
+-------------------+------------------------------------------+
| Setting/mounting  | A well-made setting from a recognised    |
|                   | maker can add value. Generic mounts do   |
|                   | not                                      |
+-------------------+------------------------------------------+
| Provenance        | Royal, historical, or celebrity provenance|
|                   | adds auction premium                     |
+-------------------+------------------------------------------+
```

1. Research the stone's likely origin if known or certifiable
2. Consider the species' current market position (trending up, stable, declining)
3. Assess whether laboratory certification would add value (generally yes for stones >1 ct and >$500)
4. Note any provenance or historical significance
5. Compile the complete assessment into a value range (not a single price point)

**Expected:** A contextualised value range that accounts for the four Cs, treatment status, origin, and market factors. Expressed as a range with stated assumptions.

**On failure:** Gemstone pricing requires market expertise that evolves continuously. If market data is unavailable, provide the quality assessment (four Cs + treatment) without a price estimate and recommend consultation with a dealer or certified appraiser.

## Validation

- [ ] Species positively identified before appraisal began
- [ ] Colour assessed under daylight-equivalent lighting with hue, saturation, and tone
- [ ] Clarity graded under 10x magnification with inclusion inventory
- [ ] Cut quality evaluated for proportions, light performance, symmetry, and finish
- [ ] Carat weight measured (or estimated with stated margin)
- [ ] Treatment status assessed with supporting observations
- [ ] Market factors considered (origin, rarity, certification value)
- [ ] Value expressed as a range, not a single number
- [ ] Disclaimer included: this is educational guidance, not a certified appraisal

## Common Pitfalls

- **Omitting the disclaimer**: This procedure provides educational guidance only. Formal appraisals for insurance, sale, or legal purposes require a certified gemologist. Always state this clearly
- **Grading colour under incorrect lighting**: Fluorescent, incandescent, and LED lights all shift colour perception. Use daylight-equivalent (5500-6500K) or natural north-facing daylight
- **Ignoring species-specific clarity expectations**: An SI1 emerald is a fine stone; an SI1 aquamarine is below average. Clarity must be graded relative to what is normal for the species
- **Overvaluing carat weight**: A large, poorly-cut, included stone is worth less per carat than a smaller, well-cut, clean stone. The four Cs interact — weight alone does not determine value
- **Assuming untreated without evidence**: The majority of rubies and sapphires on the market are heat-treated. Assume treatment unless laboratory certification confirms otherwise

## Related Skills

- `identify-gemstone` — Positive species identification is the prerequisite for appraisal; misidentification invalidates the entire assessment
- `grade-tcg-card` — The observation-first, bias-prevention methodology parallels the discipline needed to avoid "wishful grading" in gemstone appraisal
