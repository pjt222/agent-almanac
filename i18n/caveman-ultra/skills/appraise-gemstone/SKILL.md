---
name: appraise-gemstone
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
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

Value via 4 Cs (colour, clarity, cut, carat) + treatment detection + origin + market factors. Educational advisory only — NOT certified gemological appraisal.

> **DISCLAIMER**: Educational guidance on valuation methodology. NOT certified appraisal. Insurance, estate, sale, legal → always formal appraisal from certified gemologist (GIA Graduate Gemologist, FGA, or equivalent). Gemstone values vary enormously via factors requiring hands-on professional assessment.

## Use When

- Understand factors determining value
- Pre-screen before paying professional appraisal
- Eval seller asking price reasonable range
- Learning grading methodology educational
- Understand treatment status → value

## In

- **Required**: Identified gemstone (species confirmed — see `identify-gemstone`)
- **Required**: Access to stone (loose preferred; mounted limits assessment)
- **Optional**: Carat scale (0.01 ct)
- **Optional**: 10x loupe or gemological microscope
- **Optional**: Daylight-equivalent light (5500-6500K)
- **Optional**: Colour grading master stones or ref images (GIA)
- **Optional**: Refractometer + Chelsea filter (treatment detection)

## Do

### Step 1: Colour Grading

Assess via 3 components: hue, saturation, tone.

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

1. View face-up under daylight-equivalent
2. ID primary hue + secondary modifiers
3. Assess saturation — vivid + strong command highest premiums
4. Assess tone — medium generally optimal; too dark/light reduces value
5. Compare to ref images or master stones
6. Note any colour zoning face-up (reduces value)

**→** 3-component colour grade ("medium vivid blue w/ slight violetish modifier") positioning stone on quality spectrum for species.

**If err:** Lighting not ideal (yellowish indoor) → note limitation. Grading under incorrect lighting unreliable. Colour-change suspected (alexandrite, some sapphires, garnets) → assess both daylight + incandescent.

### Step 2: Clarity Grading

Evaluate internal chars under 10x mag.

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

1. Face-up first — unaided eye sees inclusions?
2. Under 10x mag, focus through table
3. Note inclusion type (crystal, feather, fingerprint, silk, needle), size, location, num
4. Assess transparency, brilliance, durability impact
5. Assign grade per visibility + impact
6. Consider species expectations — SI1 emerald excellent; SI1 aquamarine average

**→** Clarity grade + key inclusions desc + location + impact. Calibrated to species expectations.

**If err:** Mag insufficient (no loupe) → eye-clean/not-eye-clean only. Note limitation. Mounted + pavilion inclusions hidden → note inaccessible areas.

### Step 3: Cut Quality

Evaluate proportions, symmetry, light performance.

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

1. Face-up + rock gently — observe brilliance, windowing, extinction
2. Check proportions: table, crown, pavilion depth
3. Assess symmetry: outline, facet alignment, meet precision
4. Eval polish: scratches, polish lines, orange peel under 10x
5. Check girdle: even thickness, not too thin (chipping risk) or too thick (dead weight)
6. Rate Excellent → Poor

**→** Cut quality covering proportions, light performance, symmetry, finish. Significantly affects value — well-cut moderate quality > poorly-cut higher colour/clarity.

**If err:** Mounted + proportions can't be fully measured → assess visible (face-up light perf, symmetry, polish) + note proportions unverified. Mounted always has limitations.

### Step 4: Carat + Measurements

Record weight + dims.

1. Weigh on carat scale (1 carat = 0.2 g)
2. Record 2 decimals (2.37 ct)
3. Measure L x W x depth in mm
4. Mounted → estimate weight from dims via species formulas:
   - Round: diameter^2 x depth x SG factor
   - Oval: L x W x depth x SG factor x 0.0020
5. Per-carat value increases at commercially significant thresholds:
   - 0.50 ct, 1.00 ct, 2.00 ct, 3.00 ct, 5.00 ct, 10.00 ct
   - 1.02 ct commands premium over 0.98 ct equal quality

**→** Accurate carat (0.01 ct) + mm dims. Mounted → estimate + stated margin.

**If err:** No scale → measure dims + estimate via std formulas. Note estimated. Valuable stones → verify on calibrated scale.

### Step 5: Treatment Detection

Stone treated to enhance appearance?

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

1. Examine inclusions for heat treatment (dissolved silk, stress halos)
2. Fibre-optic light → check fracture filling (flash)
3. Surface coatings → examine edges + scratches
4. High-value stones → lab cert essential for treatment
5. Record: untreated, heated, filled, coated, diffused, unknown

**→** Treatment assessment + supporting observations. Stones >$500 → recommend lab cert (GIA, GRS, SSEF, Gubelin) authoritative determination.

**If err:** Many treatments (mild heat, some irradiation) undetectable w/o lab instruments (FTIR, UV-Vis, Raman). Uncertain → "unknown — lab testing recommended" not guessing.

### Step 6: Market Factors

External factors beyond 4 Cs.

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

1. Research origin if known/certifiable
2. Current market position (trending, stable, declining)
3. Lab cert add value? (generally yes stones >1 ct + >$500)
4. Provenance or historical significance
5. Complete assessment → value range (not single price)

**→** Contextualised value range w/ 4 Cs + treatment + origin + market factors. Range w/ stated assumptions.

**If err:** Pricing reqs market expertise evolving. Data unavail → quality assessment (4 Cs + treatment) no price estimate + recommend dealer or certified appraiser.

## Check

- [ ] Species positively ID'd pre-appraisal
- [ ] Colour under daylight-equivalent w/ hue, saturation, tone
- [ ] Clarity graded 10x mag w/ inclusion inventory
- [ ] Cut quality eval'd proportions, light perf, symmetry, finish
- [ ] Carat measured (or estimated + stated margin)
- [ ] Treatment status w/ supporting obs
- [ ] Market factors considered (origin, rarity, cert value)
- [ ] Value = range, not single num
- [ ] Disclaimer included: educational not certified

## Traps

- **Omit disclaimer**: Educational only. Formal appraisals for insurance/sale/legal → certified gemologist. State clearly.
- **Colour under incorrect lighting**: Fluorescent, incandescent, LED all shift perception. Daylight-equivalent (5500-6500K) or natural north-facing.
- **Ignore species clarity expectations**: SI1 emerald fine; SI1 aquamarine below average. Graded rel to species normal.
- **Overvalue carat**: Large + poorly-cut + included worth less/ct than smaller + well-cut + clean. 4 Cs interact — weight alone no determine value.
- **Assume untreated no evidence**: Majority of rubies + sapphires heat-treated. Assume treatment unless lab cert confirms otherwise.

## →

- `identify-gemstone` — positive species ID prereq; misidentification invalidates entire assessment
- `grade-tcg-card` — observation-first, bias-prevention methodology parallels discipline to avoid "wishful grading"
