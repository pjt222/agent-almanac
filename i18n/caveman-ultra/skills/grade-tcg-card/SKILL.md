---
name: grade-tcg-card
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Grade a trading card using PSA, BGS, or CGC standards. Covers observation-first
  assessment (adapted from meditate's unbiased observation), centering measurement,
  surface analysis, edge and corner evaluation, and final grade assignment with
  confidence interval. Supports Pokemon, MTG, Flesh and Blood, and Kayou cards.
  Use when evaluating a card before professional grading submission, pre-screening
  a collection for high-grade candidates, settling condition disputes between
  buyers and sellers, or estimating the grade-dependent value spread for a card.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: tcg
  complexity: intermediate
  language: natural
  tags: tcg, grading, psa, bgs, cgc, pokemon, mtg, fab, kayou, cards, collecting
---

# Grade TCG Card

Grade card per PSA/BGS/CGC. Observation-first (from `meditate`) → no grade anchoring.

## Use When

- Pre-submission evaluation
- Pre-screen collection → high-grade candidates
- Settle buyer/seller disputes
- Learn consistent grading
- Estimate grade-value spread

## In

- **Required**: card ID (set, #, name, variant)
- **Required**: images or physical desc (front + back)
- **Required**: standard (PSA 1-10, BGS 1-10 w/ subgrades, CGC 1-10)
- **Optional**: known market value at grades
- **Optional**: game (Pokemon, MTG, FaB, Kayou)

## Do

### Step 1: Clear bias → observe w/o prejudgment

From `meditate` Step 2-3: observe w/o anchor to expected grade/value.

1. Set aside market value
2. DO NOT look up sales/population reports pre-grade
3. Known valuable → explicit: "Worth $X PSA 10. Set aside."
4. Examine as physical object
5. Gut impression noted but NOT anchored
6. Premature grade thoughts → "anchoring" → return to observation

→ Neutral start. Grade anchoring = #1 source of inconsistency.

**If err:** bias sticky (high-value wants 10) → write bias explicit. Externalize → reduce influence. Proceed only as physical object.

### Step 2: Centering

1. Measure border all 4 sides front:
   - L vs R (horizontal)
   - T vs B (vertical)
   - Ratio: 55/45 L-R, 60/40 T-B
2. Repeat back
3. Apply thresholds:

```
PSA Centering Thresholds:
+-------+-------------------+-------------------+
| Grade | Front (max)       | Back (max)        |
+-------+-------------------+-------------------+
| 10    | 55/45 or better   | 75/25 or better   |
| 9     | 60/40 or better   | 90/10 or better   |
| 8     | 65/35 or better   | 90/10 or better   |
| 7     | 70/30 or better   | 90/10 or better   |
+-------+-------------------+-------------------+

BGS Centering Subgrade:
+------+-------------------+-------------------+
| Sub  | Front (max)       | Back (max)        |
+------+-------------------+-------------------+
| 10   | 50/50 perfect     | 50/50 perfect     |
| 9.5  | 55/45 or better   | 60/40 or better   |
| 9    | 60/40 or better   | 65/35 or better   |
| 8.5  | 65/35 or better   | 70/30 or better   |
+------+-------------------+-------------------+
```

4. Record ratio per axis + subgrade.

→ Numeric ratios both faces + grade/subgrade. Most objective measurement.

**If err:** borders too narrow (full-art, borderless) → "centering N/A — borderless", skip Step 3. Services differ for borderless.

### Step 3: Surface

1. Front under good light:
   - **Print defects**: ink spots, missing ink, print lines, color inconsistency
   - **Scratches**: direct + angled light
   - **Whitening**: haze/clouding
   - **Indentations**: raking light
   - **Stain/discoloration**: yellowing, water marks, chemical
2. Back same criteria
3. Factory vs handling:
   - Factory: print lines, miscut, crimping → may be less penalized
   - Handling: scratches, dents, stains → always penalized
4. Rate:
   - Pristine (10): flawless under mag
   - Near-pristine (9-9.5): minor only under mag
   - Excellent (8-8.5): minor naked eye
   - Good (6-7): moderate, multiple
   - Fair+ (1-5): significant

→ Defect inventory located + described + severity. Factory vs handling distinguished.

**If err:** low-res images → provide range not point grade. Recommend physical.

### Step 4: Edge + corner

1. 4 edges:
   - **Whitening**: spots/lines along colored (most common)
   - **Chipping**: edge layer missing
   - **Roughness**: uneven / micro-tears
   - **Foil separation**: holofoil delamination
2. 4 corners:
   - **Sharpness**: tip crisp
   - **Rounding**: worn curve (slight/moderate/heavy)
   - **Splitting**: layer separation (dings)
   - **Bending**: turned/creased
3. Rate same scale
4. Note worst edge/corner

→ Per-edge + per-corner. Worst limits overall grade.

**If err:** in sleeve/toploader obscures → note which areas not fully assessed.

### Step 5: Final grade

1. **PSA** (1-10):
   - Weakest sub limits final
   - Perfect surface + 65/35 centering → cap PSA 8
   - "Lowest limits" + adjust up if exceptional
2. **BGS** (4 subgrades → overall):
   - Centering, Edges, Corners, Surface each 1-10 in 0.5
   - Overall = weighted avg, lowest subgrade limits
   - BGS 10 Pristine → all 4 = 10
   - BGS 9.5 Gem Mint → avg 9.5+ no sub <9
3. **CGC** (similar to PSA w/ subgrades on label):
   - Centering, Surface, Edges, Corners
   - Overall = proprietary weighting
4. Confidence:
   - "PSA 8 (confident)" — clear, unlikely higher/lower
   - "PSA 8-9 (borderline)" — either way
   - "PSA 7-8 (uncertain)" — limited data

→ Final grade + confidence. BGS all 4 reported. Evidence from Steps 2-4.

**If err:** inconclusive (scratch vs dirt) → range + recommend pro grading. Never confident w/ insufficient data.

## Check

- [ ] Bias check pre-grading (no anchoring)
- [ ] Centering both faces w/ ratios
- [ ] Surface examined (scratches, print, stain, indent)
- [ ] All 4 edges + corners individually
- [ ] Factory vs handling distinguished
- [ ] Grade evidence-backed from each sub
- [ ] Confidence stated
- [ ] Standard applied correctly

## Traps

- **Grade anchoring**: value knowledge → bias toward hoped-for grade. Physical first.
- **Ignore back**: back surface + centering count. Many over-focus front.
- **Factory vs handling confusion**: both affect grade differently.
- **Holofoil over-grade**: hides scratches until angled. Multiple light angles.
- **Centering illusion**: art placement can mislead. Measure borders not art.

## →

- `build-tcg-deck` — condition affects tournament legality
- `manage-tcg-collection` — grade-based valuation
- `meditate` — source of observation-without-prejudgment
