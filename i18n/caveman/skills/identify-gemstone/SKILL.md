---
name: identify-gemstone
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Identify gemstones using optical properties, physical tests, and
  inclusion analysis. Covers refractive index, specific gravity,
  pleochroism, spectroscopy indicators, and common simulant detection.
  Use when identifying an unknown gemstone, verifying a seller's claim about
  species identity, distinguishing natural stones from simulants or synthetics,
  building gemological literacy through structured observation, or identifying
  rough material before cutting to ensure safe handling.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: lapidary
  complexity: intermediate
  language: natural
  tags: lapidary, gemstones, identification, mineralogy, optics
---

# Identify Gemstone

ID gemstones using systematic physical + optical property testing, inclusion analysis, elimination vs known species profiles.

## When Use

- Unknown gemstone or suspect gemstone, want to ID species
- Verify seller's claim about gemstone identity
- Tell natural gemstone from common simulant or synthetic
- Build gemological literacy through structured observation + testing
- ID rough material before cutting for safe handling

## Inputs

- **Required**: Gemstone specimen (loose stone preferred; mounted limit testing)
- **Optional**: Refractometer with contact liquid (RI fluid, 1.81 standard)
- **Optional**: Dichroscope (pleochroism testing)
- **Optional**: Chelsea colour filter
- **Optional**: Specific gravity balance or heavy liquids
- **Optional**: 10x loupe or gemological microscope
- **Optional**: UV lamp (long-wave 365nm + short-wave 254nm)
- **Optional**: Polariscope (optic character determination)

## Steps

### Step 1: Visual Inspection

Examine specimen with unaided eye then under 10x magnification.

```
Visual Inspection Checklist:
+--------------------+------------------------------------------+
| Observation        | Record                                   |
+--------------------+------------------------------------------+
| Colour             | Hue (red, blue, green...), saturation    |
|                    | (vivid, moderate, weak), tone            |
|                    | (light, medium, dark)                    |
+--------------------+------------------------------------------+
| Transparency       | Transparent, translucent, opaque         |
+--------------------+------------------------------------------+
| Luster             | Adamantine, vitreous, waxy, pearly,      |
|                    | silky, resinous                          |
+--------------------+------------------------------------------+
| Cut style          | Faceted, cabochon, carved, rough         |
+--------------------+------------------------------------------+
| Estimated size     | Approximate dimensions (mm) and weight   |
+--------------------+------------------------------------------+
| Surface condition  | Scratches, chips, abrasion, wear pattern |
+--------------------+------------------------------------------+
| Phenomena          | Star (asterism), cat's eye               |
|                    | (chatoyancy), play of colour, colour     |
|                    | change, adularescence                    |
+--------------------+------------------------------------------+
```

1. Note body colour under daylight-equivalent lighting (5500-6500K)
2. Check colour zoning by viewing through stone from different angles
3. Assess transparency + luster — narrows candidates immediate
4. Look for optical phenomena (star, cat's eye, play of colour)
5. Record any visible inclusions without magnification

**Got:** Complete visual profile — colour, transparency, luster, phenomena. Alone narrows candidates to manageable shortlist.

**If fail:** Lighting poor (yellowish indoor)? Note limitation. Daylight or daylight-equivalent bulbs strongly preferred. Incandescent shifts colour perception → misidentification of colour-change stones.

### Step 2: Physical Property Testing

Test measurable physical properties to narrow ID.

```
Key Physical Properties:
+--------------------+------------------------------------------+
| Property           | Method                                   |
+--------------------+------------------------------------------+
| Hardness (Mohs)    | Scratch test against reference minerals  |
|                    | or hardness pencils. CAUTION: Do NOT     |
|                    | scratch faceted gemstones — use other    |
|                    | tests instead for cut stones             |
+--------------------+------------------------------------------+
| Specific gravity   | Hydrostatic weighing:                    |
| (SG)               | SG = weight in air / (weight in air -    |
|                    | weight in water)                         |
|                    |                                          |
|                    | Common SG values:                        |
|                    | Quartz: 2.65                             |
|                    | Beryl: 2.68-2.74                         |
|                    | Tourmaline: 3.02-3.26                    |
|                    | Topaz: 3.53                              |
|                    | Corundum: 3.99-4.01                      |
|                    | Zircon: 4.60-4.73                        |
|                    | CZ: 5.65-5.95                            |
+--------------------+------------------------------------------+
| Heft               | Does the stone feel heavier or lighter   |
|                    | than expected for its size?              |
|                    | CZ and zircon feel noticeably heavy      |
|                    | Quartz and glass feel average            |
+--------------------+------------------------------------------+
```

1. Rough material: test hardness using Mohs scale reference points
2. Cut stones: measure specific gravity using hydrostatic method
3. Assess heft — experienced handlers can tell CZ from diamond by weight alone
4. Note any cleavage planes visible on surface

**Got:** Hardness range (rough) or SG value (cut stones) differentiates between candidate species. SG often most powerful single diagnostic for cut stones.

**If fail:** Hydrostatic balance unavailable? Use heft test as rough guide. Stones "too heavy for size" likely have high SG (>3.5). Hardness testing would damage cut stone? Skip to optical tests.

### Step 3: Optical Tests

Apply gemological optical instruments for definitive properties.

```
Optical Property Tests:
+--------------------+------------------------------------------+
| Test               | What It Reveals                          |
+--------------------+------------------------------------------+
| Refractive Index   | Measured on refractometer with RI fluid  |
| (RI)               | Diagnostic for most species:             |
|                    | Quartz: 1.544-1.553                      |
|                    | Beryl: 1.577-1.583                       |
|                    | Tourmaline: 1.624-1.644                  |
|                    | Topaz: 1.609-1.617                       |
|                    | Corundum: 1.762-1.770                    |
|                    | Spinel: 1.718                            |
|                    | Diamond: 2.417 (OTL on refractometer)    |
|                    | CZ: 2.15 (OTL on refractometer)          |
+--------------------+------------------------------------------+
| Birefringence      | Difference between high and low RI       |
| (BR)               | Quartz: 0.009                            |
|                    | Corundum: 0.008                          |
|                    | Tourmaline: 0.018-0.020                  |
|                    | Singly refractive: 0 (spinel, garnet,    |
|                    | diamond)                                 |
+--------------------+------------------------------------------+
| Pleochroism        | Colour variation with crystal direction  |
| (dichroscope)      | Strong: tourmaline, tanzanite, iolite    |
|                    | Moderate: corundum, topaz                |
|                    | None: singly refractive stones           |
+--------------------+------------------------------------------+
| Optic character    | Singly refractive (SR), doubly           |
| (polariscope)      | refractive (DR), aggregate (AGG)         |
+--------------------+------------------------------------------+
| UV fluorescence    | Long-wave and short-wave UV response     |
|                    | Diamond: often blue (LWUV)               |
|                    | Ruby: strong red (LWUV)                  |
|                    | Emerald: usually inert                   |
+--------------------+------------------------------------------+
| Chelsea filter     | Transmits deep red and yellow-green      |
|                    | Emerald (Cr): appears red/pink           |
|                    | Aquamarine: appears green                |
|                    | Blue synthetic spinel: appears red       |
+--------------------+------------------------------------------+
```

1. Measure RI on refractometer — take both high + low readings for birefringence
2. Test pleochroism with dichroscope — rotate slow + note colour changes
3. Check optic character on polariscope (SR vs DR vs AGG)
4. Test UV fluorescence under both long-wave + short-wave
5. Use Chelsea filter if chromium-coloured stones suspected

**Got:** RI value (to 0.001), birefringence, optic character, pleochroism description, UV response. Combined with Step 2, IDs most gemstone species definitive.

**If fail:** RI over-the-limit (OTL, >1.81)? Stone likely diamond, CZ, zircon (high-type), or high-RI synthetic. Use SG + thermal conductivity to differentiate. No refractometer? Rely on SG + visual properties + inclusions.

### Step 4: Inclusion Analysis

Examine internal features under magnification for species confirmation + natural vs synthetic determination.

```
Diagnostic Inclusions by Species:
+------------------+------------------------------------------+
| Species          | Characteristic Inclusions                |
+------------------+------------------------------------------+
| Diamond          | Crystals (garnet, diopside), feathers,   |
|                  | cloud, graining, pinpoints               |
+------------------+------------------------------------------+
| Ruby/Sapphire    | Silk (rutile needles), fingerprints,     |
|                  | colour zoning (straight angular),        |
|                  | crystal inclusions                       |
+------------------+------------------------------------------+
| Emerald          | Three-phase inclusions (solid + liquid + |
|                  | gas), jardin (garden-like fractures),    |
|                  | pyrite crystals                          |
+------------------+------------------------------------------+
| Tourmaline       | Growth tubes, liquid-filled fractures    |
+------------------+------------------------------------------+
| Quartz/Amethyst  | Tiger stripes, phantoms, two-phase       |
|                  | inclusions, negative crystals            |
+------------------+------------------------------------------+

Synthetic Indicators:
+------------------+------------------------------------------+
| Synthetic Type   | Telltale Inclusions                      |
+------------------+------------------------------------------+
| Flame fusion     | Curved growth lines (striae),            |
| (Verneuil)       | gas bubbles (spherical)                  |
+------------------+------------------------------------------+
| Flux grown       | Flux fingerprints (wispy veils),         |
|                  | platinum platelets                       |
+------------------+------------------------------------------+
| Hydrothermal     | Chevron or zigzag growth patterns,       |
|                  | seed plate remnant                       |
+------------------+------------------------------------------+
| Glass simulants  | Round gas bubbles, swirl marks,          |
|                  | conchoidal fracture chips                |
+------------------+------------------------------------------+
```

1. Examine stone under darkfield illumination (gemological microscope) or oblique lighting through 10x loupe
2. Look for species-diagnostic inclusions first
3. Check synthetic indicators — curved striae + gas bubbles definitive for flame-fusion synthetics
4. Note inclusion type, location, frequency
5. Photograph inclusions if possible for records

**Got:** Species-confirming inclusion pattern + natural/synthetic determination. Some species IDed more by inclusions than optical properties (emerald's jardin).

**If fail:** Stone eye-clean + no inclusions visible at 10x? May be very clean natural stone or synthetic. Lack of inclusions raises synthetic probability — refer to optical + physical tests for confirmation. Laboratory analysis (FTIR, Raman) may be needed.

### Step 5: ID by Elimination

Cross-reference all collected data to reach final ID.

1. Compile property profile:
   - Colour + transparency + luster
   - Hardness or SG
   - RI + birefringence + optic character
   - Pleochroism + UV fluorescence
   - Inclusion pattern
2. Compare vs reference tables for candidate species
3. Eliminate species that conflict with any measured property
4. Two or more candidates remain? ID distinguishing test:
   - Blue topaz vs aquamarine — SG definitive (3.53 vs 2.70)
5. State ID with confidence level:
   - **Definitive**: Multiple properties confirm single species
   - **Probable**: Properties consistent with one species, one test missing
   - **Uncertain**: Conflicting data or insufficient testing — lab referral recommended

**Got:** Final species ID ("Natural sapphire, blue, heat-treated") with supporting evidence from each test category. Or clear recommendation for lab analysis if field tests insufficient.

**If fail:** Stone can't be IDed with available equipment? Document all measured properties + refer to gemological laboratory. Provide measured data to lab — accelerates analysis.

## Checks

- [ ] Visual inspection done under daylight-equivalent lighting
- [ ] At least two physical properties measured (hardness/SG + one other)
- [ ] RI measured + birefringence computed (if refractometer available)
- [ ] Pleochroism tested (if dichroscope available)
- [ ] Inclusions examined under at least 10x magnification
- [ ] ID reached by systematic elimination, not assumption
- [ ] Common simulants explicit considered + ruled out
- [ ] Natural vs synthetic determination made (or flagged as uncertain)

## Pitfalls

- **Trusting colour alone**: Colour least reliable ID property. Blue stones include sapphire, topaz, aquamarine, tanzanite, iolite, spinel, glass, CZ. Always confirm with measurable properties
- **Skipping SG on mounted stones**: Mounted stones limit testing, but can still check RI, pleochroism, inclusions, UV. Document limitation not guess
- **Confusing high-RI synthetics with naturals**: Flame-fusion rubies + sapphires have identical RI + SG to natural stones. Only inclusions (curved striae vs straight growth) differentiate
- **Assuming expensive = natural**: Commercial jewellery frequently has treated, synthetic, simulant stones. Test every stone regardless of provenance claims
- **Damaging specimen**: Never hardness-test faceted gemstone — leaves visible scratches. Use non-destructive tests (RI, SG, inclusions) for cut stones

## See Also

- `cut-gemstone` — ID determines safe cutting parameters + orientation requirements for species
- `appraise-gemstone` — Positive ID prerequisite for meaningful valuation
- `mineral-identification` — Field mineral ID methodology using physical properties (prospecting domain) shares systematic elimination approach
