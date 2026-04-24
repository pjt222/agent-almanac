---
name: grade-tcg-card
locale: caveman
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

Assess + grade trading card, professional grading standards (PSA, BGS, CGC). Observation-first protocol from `meditate` skill prevents grade anchoring — most common grading bias.

## When Use

- Evaluate card before professional grading service submission
- Pre-screen collection for high-grade candidates worth submitting
- Settle disputes about card condition between buyers + sellers
- Learn to grade consistent with structured assessment protocol
- Estimate grade-dependent value spread for specific card

## Inputs

- **Required**: Card identification (set, number, name, variant/edition)
- **Required**: Card images or physical description (front + back)
- **Required**: Grading standard to apply (PSA 1-10, BGS 1-10 with subgrades, CGC 1-10)
- **Optional**: Known market value at different grades (grade-value analysis)
- **Optional**: Card game (Pokemon, Magic: The Gathering, Flesh and Blood, Kayou)

## Steps

### Step 1: Clear Bias — Observation Without Prejudgment

From `meditate` Step 2-3: observe card without anchoring to expected grade or market value.

1. Set aside any knowledge of card market value
2. Do NOT look up recent sales or population reports before grading
3. Know card is "valuable"? Acknowledge bias explicit:
   - "I know this card is worth $X in PSA 10. I am setting that aside."
4. Examine card as physical object first, not collectible
5. Note initial gut impression but do NOT let it anchor assessment
6. Label premature grade thoughts as "anchoring", return to observation

**Got:** Neutral starting state. Card assessed purely on physical condition, not market expectations. Grade anchoring (knowing value before grading) = #1 source of grading inconsistency.

**If fail:** Bias sticky (high-value card makes you want to see 10)? Write bias down explicit. Externalizing reduces influence. Proceed only when can examine card as physical object.

### Step 2: Centering Assessment

Measure card print centering on both faces.

1. Measure border width all four sides of front face:
   - Left vs right border (horizontal centering)
   - Top vs bottom border (vertical centering)
   - Express as ratio: 55/45 left-right, 60/40 top-bottom
2. Repeat for back face
3. Apply grading standard centering thresholds:

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

4. Record centering score each axis + applicable subgrade

**Got:** Numeric centering ratios for both faces with corresponding grade/subgrade identified. Most objective measurement in grading process.

**If fail:** Borders too narrow to measure (full-art, borderless prints)? Note "centering N/A — borderless", skip to Step 3. Some grading services apply different standards for borderless cards.

### Step 3: Surface Analysis

Examine card surface for defects.

1. Examine front surface under good lighting:
   - **Print defects**: ink spots, missing ink, print lines, color inconsistency
   - **Surface scratches**: visible under direct + angled light
   - **Whitening on surface**: haze or clouding of surface layer
   - **Indentations or impressions**: dents visible under raking light
   - **Staining or discoloration**: yellowing, water marks, chemical damage
2. Examine back surface same criteria
3. Check factory defects vs handling damage:
   - Factory: print lines, miscut, crimping — may be less penalized
   - Handling: scratches, dents, stains — always penalized
4. Rate surface condition:
   - Pristine (10): flawless under magnification
   - Near-pristine (9-9.5): minor imperfections only under magnification
   - Excellent (8-8.5): minor wear visible to naked eye
   - Good (6-7): moderate wear, multiple minor defects
   - Fair or below (1-5): significant damage visible

**Got:** Detailed surface inventory with each defect located, described, severity-rated. Factory vs handling defects distinguished.

**If fail:** Images too low-resolution for surface analysis? Note limitation, provide grade range not point grade. Recommend physical inspection.

### Step 4: Edge + Corner Evaluation

Assess card edges + corners for wear.

1. Examine all four edges:
   - **Whitening**: white spots or lines along colored edges (most common defect)
   - **Chipping**: small pieces of edge layer missing
   - **Roughness**: edge feels uneven or has micro-tears
   - **Foil separation**: on holofoil cards, check delamination at edges
2. Examine all four corners:
   - **Sharpness**: corner tip crisp + pointed
   - **Rounding**: corner tip worn to curve (slight, moderate, heavy)
   - **Splitting**: layer separation visible at corner (dings)
   - **Bending**: corner turned or creased
3. Rate edge + corner condition same scale as surface
4. Note which specific corners/edges have worst condition

**Got:** Per-edge + per-corner condition assessment. Worst individual corner/edge typically limits overall grade.

**If fail:** Card in sleeve or toploader obscures edges? Note which areas couldn't be fully assessed.

### Step 5: Assign Final Grade

Combine sub-assessments into final grade.

1. For **PSA grading** (single number 1-10):
   - Final grade limited by weakest sub-assessment
   - Card with perfect surface but 65/35 centering caps at PSA 8
   - Apply "lowest limits" principle, adjust up if other areas exceptional
2. For **BGS grading** (four subgrades → overall):
   - Assign subgrades: Centering, Edges, Corners, Surface (each 1-10 in 0.5 steps)
   - Overall = weighted average, but lowest subgrade limits overall
   - BGS 10 Pristine needs all four subgrades at 10
   - BGS 9.5 Gem Mint needs average 9.5+ with no subgrade below 9
3. For **CGC grading** (similar to PSA with subgrades on label):
   - Assign Centering, Surface, Edges, Corners
   - Overall follows CGC proprietary weighting
4. State final grade with confidence:
   - "PSA 8 (confident)" — clear grade, unlikely higher or lower
   - "PSA 8-9 (borderline)" — could go either way at grading service
   - "PSA 7-8 (uncertain)" — limited assessment data

**Got:** Final grade with confidence level. BGS → all four subgrades reported. Grade supported by evidence from Steps 2-4.

**If fail:** Assessment inconclusive (can't tell if surface mark scratch or dirt)? Provide grade range, recommend professional grading. Never assign confident grade with insufficient data.

## Checks

- [ ] Bias check completed before grading (no grade anchoring)
- [ ] Centering measured on both faces with ratios recorded
- [ ] Surface examined for scratches, print defects, staining, indentations
- [ ] All four edges + corners individually assessed
- [ ] Factory vs handling defects distinguished
- [ ] Final grade supported by evidence from each sub-assessment
- [ ] Confidence level stated (confident, borderline, uncertain)
- [ ] Grading standard correctly applied (PSA/BGS/CGC thresholds)

## Pitfalls

- **Grade anchoring**: Knowing card value before grading biases toward "hoped-for" grade. Always assess physically first
- **Ignoring the back**: Back surface + back centering count. Many graders over-focus on front
- **Confusing factory with handling defects**: Factory print line different from scratch, but both affect grade
- **Over-grading holofoils**: Holographic + foil cards hide surface scratches until viewed at right angle. Use multiple light angles
- **Centering optical illusions**: Art placement can make centering appear better or worse than is. Measure borders, not art

## See Also

- `build-tcg-deck` — Deck building where card condition affects tournament legality
- `manage-tcg-collection` — Collection management with grade-based valuation
- `meditate` — Source of observation-without-prejudgment technique adapted for grading bias prevention
