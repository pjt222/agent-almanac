---
name: grade-tcg-card
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

Assess and grade a trading card following professional grading standards (PSA, BGS, CGC). Uses an observation-first protocol adapted from the `meditate` skill to prevent grade anchoring — the most common grading bias.

## When to Use

- Evaluating a card before submission to a professional grading service
- Pre-screening a collection to identify high-grade candidates worth submitting
- Settling disputes about card condition between buyers and sellers
- Learning to grade consistently by following a structured assessment protocol
- Estimating the grade-dependent value spread for a specific card

## Inputs

- **Required**: Card identification (set, number, name, variant/edition)
- **Required**: Card images or physical description (front and back)
- **Required**: Grading standard to apply (PSA 1-10, BGS 1-10 with subgrades, CGC 1-10)
- **Optional**: Known market value at different grades (for grade-value analysis)
- **Optional**: Card game (Pokemon, Magic: The Gathering, Flesh and Blood, Kayou)

## Procedure

### Step 1: Clear Bias — Observation Without Prejudgment

Adapted from `meditate` Step 2-3: observe the card without anchoring to expected grade or market value.

1. Set aside any knowledge of the card's market value
2. Do NOT look up recent sales or population reports before grading
3. If you know the card is "valuable," acknowledge that bias explicitly:
   - "I know this card is worth $X in PSA 10. I am setting that aside."
4. Examine the card as a physical object first, not as a collectible
5. Note your initial gut impression but do NOT let it anchor the assessment
6. Label any premature grade thoughts as "anchoring" and return to observation

**Expected:** A neutral starting state where the card is assessed purely on physical condition, not market expectations. Grade anchoring (knowing the value before grading) is the #1 source of grading inconsistency.

**On failure:** If bias feels sticky (a high-value card makes you want to see a 10), write down the bias explicitly. Externalizing it reduces its influence. Proceed only when you can examine the card as a physical object.

### Step 2: Centering Assessment

Measure the card's print centering on both faces.

1. Measure the border width on all four sides of the front face:
   - Left vs. right border (horizontal centering)
   - Top vs. bottom border (vertical centering)
   - Express as ratio: e.g., 55/45 left-right, 60/40 top-bottom
2. Repeat for the back face
3. Apply the grading standard's centering thresholds:

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

4. Record the centering score for each axis and the applicable subgrade

**Expected:** Numeric centering ratios for both faces with the corresponding grade/subgrade identified. This is the most objective measurement in the grading process.

**On failure:** If borders are too narrow to measure accurately (full-art cards, borderless prints), note "centering N/A — borderless" and skip to Step 3. Some grading services apply different standards for borderless cards.

### Step 3: Surface Analysis

Examine the card's surface for defects.

1. Examine the front surface under good lighting:
   - **Print defects**: ink spots, missing ink, print lines, color inconsistency
   - **Surface scratches**: visible under direct and angled light
   - **Whitening on surface**: haze or clouding of the surface layer
   - **Indentations or impressions**: dents visible under raking light
   - **Staining or discoloration**: yellowing, water marks, chemical damage
2. Examine the back surface with the same criteria
3. Check for factory defects vs. handling damage:
   - Factory: print lines, miscut, crimping — may be less penalized
   - Handling: scratches, dents, stains — always penalized
4. Rate surface condition:
   - Pristine (10): flawless under magnification
   - Near-pristine (9-9.5): minor imperfections visible only under magnification
   - Excellent (8-8.5): minor wear visible to naked eye
   - Good (6-7): moderate wear, multiple minor defects
   - Fair or below (1-5): significant damage visible

**Expected:** A detailed surface inventory with each defect located, described, and severity-rated. Factory vs. handling defects distinguished.

**On failure:** If images are too low-resolution for surface analysis, note the limitation and provide a grade range rather than a point grade. Recommend physical inspection.

### Step 4: Edge and Corner Evaluation

Assess the card's edges and corners for wear.

1. Examine all four edges:
   - **Whitening**: white spots or lines along colored edges (the most common defect)
   - **Chipping**: small pieces of the edge layer missing
   - **Roughness**: edge feels uneven or has micro-tears
   - **Foil separation**: on holofoil cards, check for delamination at edges
2. Examine all four corners:
   - **Sharpness**: corner tip is crisp and pointed
   - **Rounding**: corner tip is worn to a curve (slight, moderate, heavy)
   - **Splitting**: layer separation visible at corner (dings)
   - **Bending**: corner turned or creased
3. Rate edge and corner condition using the same scale as surface
4. Note which specific corners/edges have the worst condition

**Expected:** Per-edge and per-corner condition assessment. The worst individual corner/edge typically limits the overall grade.

**On failure:** If the card is in a sleeve or toploader that obscures edges, note which areas couldn't be fully assessed.

### Step 5: Assign Final Grade

Combine sub-assessments into the final grade.

1. For **PSA grading** (single number 1-10):
   - The final grade is limited by the weakest sub-assessment
   - A card with perfect surface but 65/35 centering caps at PSA 8
   - Apply the "lowest limits" principle, then adjust up if other areas are exceptional
2. For **BGS grading** (four subgrades → overall):
   - Assign subgrades: Centering, Edges, Corners, Surface (each 1-10 in 0.5 steps)
   - Overall = weighted average, but the lowest subgrade limits the overall
   - BGS 10 Pristine requires all four subgrades at 10
   - BGS 9.5 Gem Mint requires average of 9.5+ with no subgrade below 9
3. For **CGC grading** (similar to PSA with subgrades on label):
   - Assign Centering, Surface, Edges, Corners
   - Overall follows CGC's proprietary weighting
4. State the final grade with confidence:
   - "PSA 8 (confident)" — clear grade, unlikely to be higher or lower
   - "PSA 8-9 (borderline)" — could go either way at the grading service
   - "PSA 7-8 (uncertain)" — limited assessment data

**Expected:** A final grade with confidence level. For BGS, all four subgrades reported. The grade is supported by evidence from Steps 2-4.

**On failure:** If the assessment is inconclusive (e.g., can't tell if a surface mark is a scratch or dirt), provide a grade range and recommend professional grading. Never assign a confident grade with insufficient data.

## Validation Checklist

- [ ] Bias check completed before grading (no grade anchoring)
- [ ] Centering measured on both faces with ratios recorded
- [ ] Surface examined for scratches, print defects, staining, indentations
- [ ] All four edges and corners individually assessed
- [ ] Factory vs. handling defects distinguished
- [ ] Final grade supported by evidence from each sub-assessment
- [ ] Confidence level stated (confident, borderline, uncertain)
- [ ] Grading standard correctly applied (PSA/BGS/CGC thresholds)

## Common Pitfalls

- **Grade anchoring**: Knowing a card's value before grading biases the assessment toward the "hoped-for" grade. Always assess physically first
- **Ignoring the back**: The back surface and back centering count. Many graders over-focus on the front
- **Confusing factory with handling defects**: A factory print line is different from a scratch, but both affect the grade
- **Over-grading holofoils**: Holographic and foil cards hide surface scratches until viewed at the right angle. Use multiple light angles
- **Centering optical illusions**: Art placement can make centering appear better or worse than it is. Measure the borders, not the art

## Related Skills

- `build-tcg-deck` — Deck building where card condition affects tournament legality
- `manage-tcg-collection` — Collection management with grade-based valuation
- `meditate` — Source of the observation-without-prejudgment technique adapted for grading bias prevention
