---
name: identify-gemstone
locale: caveman-ultra
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

Systematic physical + optical + inclusion analysis → species ID via elimination.

## Use When

- Unknown gemstone → ID species
- Verify seller claim
- Distinguish natural from simulant/synthetic
- Build gemological literacy
- ID rough pre-cut for safe handling

## In

- **Required**: specimen (loose preferred; mounted limits testing)
- **Optional**: refractometer + RI fluid (1.81 std)
- **Optional**: dichroscope (pleochroism)
- **Optional**: Chelsea colour filter
- **Optional**: SG balance / heavy liquids
- **Optional**: 10× loupe / gem microscope
- **Optional**: UV lamp (LW 365nm + SW 254nm)
- **Optional**: polariscope (optic character)

## Do

### Step 1: Visual inspection

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

1. Body colour under daylight-eq (5500-6500K)
2. Colour zoning → view from angles
3. Transparency + luster → narrow candidates fast
4. Phenomena (star, cat's eye, play of colour)
5. Visible inclusions (no mag)

→ Complete visual profile: colour + transparency + luster + phenomena. Narrows to shortlist.

**If err:** poor lighting (yellow indoor) → note limitation. Daylight-eq strongly preferred. Incandescent shifts colour → can misID colour-change stones.

### Step 2: Physical property testing

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

1. Rough → Mohs scale
2. Cut → hydrostatic SG
3. Heft → experienced can distinguish CZ vs diamond by weight
4. Note cleavage planes

→ Hardness range (rough) or SG (cut) differentiates. SG = most powerful single diagnostic for cut.

**If err:** no balance → heft as rough guide. "Too heavy" → high SG (>3.5). Hardness would damage cut → skip to optical.

### Step 3: Optical tests

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

1. RI → both high + low for birefringence
2. Pleochroism via dichroscope → rotate + note colour changes
3. Polariscope → SR vs DR vs AGG
4. UV LW + SW
5. Chelsea filter for Cr-coloured suspects

→ RI (to 0.001) + birefringence + optic character + pleochroism + UV. Combined w/ Step 2 → definitive for most species.

**If err:** RI OTL (>1.81) → likely diamond, CZ, zircon (high), high-RI synthetic. Use SG + thermal conductivity. No refractometer → SG + visual + inclusions.

### Step 4: Inclusion analysis

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

1. Darkfield illumination (microscope) or oblique light (10× loupe)
2. Species-diagnostic inclusions first
3. Synthetic indicators — curved striae + gas bubbles definitive for flame-fusion
4. Note type + location + frequency
5. Photograph for records

→ Species-confirming inclusion pattern + natural/synthetic. Some species ID'd more by inclusions than optics (emerald jardin).

**If err:** eye-clean + no 10× inclusions → very clean natural or synthetic. No inclusions → raises synthetic probability. Refer optical + physical. Lab (FTIR, Raman) may be needed.

### Step 5: ID by elimination

1. Compile profile:
   - Colour + transparency + luster
   - Hardness or SG
   - RI + birefringence + optic character
   - Pleochroism + UV
   - Inclusion pattern
2. Compare reference tables
3. Eliminate conflicts
4. 2+ candidates remain → distinguishing test:
   - Blue topaz vs aquamarine → SG definitive (3.53 vs 2.70)
5. Final w/ confidence:
   - **Definitive**: multiple properties confirm single species
   - **Probable**: consistent but one test missing
   - **Uncertain**: conflicting data / insufficient → lab referral

→ Final species (e.g., "Natural sapphire, blue, heat-treated") w/ evidence from each category. Or lab analysis recommendation.

**If err:** can't ID w/ available → document all properties + refer to gem lab. Provide measured data → accelerates lab analysis.

## Check

- [ ] Visual under daylight-eq
- [ ] ≥2 physical properties measured (hardness/SG + 1 other)
- [ ] RI + birefringence (if refractometer)
- [ ] Pleochroism tested (if dichroscope)
- [ ] Inclusions under ≥10× mag
- [ ] ID by systematic elimination
- [ ] Common simulants ruled out
- [ ] Natural vs synthetic (or uncertain flagged)

## Traps

- **Trust colour alone**: least reliable. Blue stones: sapphire, topaz, aquamarine, tanzanite, iolite, spinel, glass, CZ. Confirm w/ measurable.
- **Skip SG on mounted**: mounted limits but can check RI, pleochroism, inclusions, UV. Document not guess.
- **High-RI synthetic vs natural confusion**: flame-fusion ruby/sapphire = identical RI + SG. Only inclusions (curved striae vs straight) differentiate.
- **Expensive = natural**: commercial jewelry often treated/synthetic/simulant. Test every stone regardless of claim.
- **Damage specimen**: never hardness-test faceted (visible scratches). Non-destructive (RI, SG, inclusions) for cut.

## →

- `cut-gemstone` — ID determines safe cutting + orientation
- `appraise-gemstone` — ID prereq for valuation
- `mineral-identification` — field mineral ID (prospecting) shares systematic elimination approach
