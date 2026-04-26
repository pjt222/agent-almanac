---
name: prove-geometric-theorem
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Prove geometric theorems via Euclidean axiomatic, coordinate, or vector
  methods w/ rigorous step-by-step logical structure. Direct proof, by
  contradiction, coordinate, vector, special cases + degenerate configs.
  Use → geometric statement to prove, verify conjecture, establish lemma,
  convert intuition to rigorous proof, compare proof method effectiveness.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: geometry
  complexity: advanced
  language: multi
  tags: geometry, proof, theorem, euclidean, axiomatic, coordinate
---

# Prove a Geometric Theorem

Prove geometric theorem rigorously: pick proof method, construct logical chain of justified steps from hypotheses → conclusion, handle special cases, produce complete proof doc.

## Use When

- Geometric statement → prove true
- Verify conjecture about figures/relationships
- Establish lemma w/in larger argument
- Convert geometric insight → rigorous proof
- Compare proof method effectiveness for same theorem

## In

- **Required**: Theorem statement (claim to prove)
- **Required**: Given info (hypotheses, defs, diagram desc)
- **Optional**: Preferred method (direct, contradiction, coordinate, vector, transformation)
- **Optional**: Rigor level (informal, semi-formal, formal w/ axiom citations)
- **Optional**: Known results citable w/o proof (e.g., "may assume Pythagorean")
- **Optional**: Address all degenerate + special cases explicitly?

## Do

### Step 1: State Theorem Precisely

Rewrite in standard form w/ explicit Given + Prove clauses.

1. **Extract hypotheses.** List every condition in "Given". Be explicit about geometric type (point, line, segment, ray, circle, polygon), incidence (lies on, passes through), metric (congruent, equal, perpendicular, parallel), ordering.

2. **State conclusion.** Exactly what must be proved in "Prove". Distinguish:
   - Equality/congruence: AB = CD, angle A = angle B, triangle ABC congruent to DEF
   - Incidence: P lies on L, three lines concurrent
   - Inequality: AB > CD, angle A < 90°
   - Existence: there exists P such that...
   - Uniqueness: such P is unique

3. **Implicit assumptions.** Many problems assume Euclidean (parallel postulate), non-degeneracy (points not coincident, lines not concurrent unless stated), positive orientation. Make explicit.

4. **Draw or describe configuration.** Diagram provided → transcribe key features. None → construct:

```
Given: Triangle ABC with D the midpoint of BC, E the midpoint of AC.
       Line segment DE.
Prove: DE is parallel to AB and DE = AB/2.

Configuration:
  A is at the apex; B and C form the base.
  D is the midpoint of BC; E is the midpoint of AC.
  DE connects the two midpoints.

Implicit assumptions: Euclidean plane, A is not on line BC (non-degenerate triangle).
```

→ Precise unambiguous statement w/ Given + Prove, all implicit assumptions surfaced, clear configuration desc.

If err: vague statement ("medial triangle similar to original") → rewrite w/ explicit defs + quantifiers. Statement appears false → test specific example before proceeding. False theorem unprovable; instead find + state counterexample.

### Step 2: Select Proof Method

Pick technique best suited to theorem's structure.

**Available methods + when to use:**

1. **Direct (synthetic)**: Forward from hypotheses via Euclidean propositions + established theorems.
   - Best for: congruence/similarity, angle chasing, incidence theorems.
   - Tools: triangle congruence (SSS, SAS, ASA, AAS, HL), parallels (alternate interior, corresponding angles), circle theorems (inscribed angle, tangent-radius, power of point).

2. **By contradiction**: Assume negation of conclusion, derive contradiction.
   - Best for: uniqueness, impossibility, inequality where direct unclear.
   - Structure: "Assume, for contradiction, [negation]. Then... But contradicts [known fact]. Therefore conclusion holds."

3. **Coordinate**: Place figure in coordinates + use algebra.
   - Best for: midpoint/distance/slope, collinearity, parallelism, perpendicularity.
   - Setup: choose coords to min computation (vertex at origin, side along axis).

4. **Vector**: Geometric relationships as vector ops.
   - Best for: centroid/barycenter, parallelism (parallel vectors), perpendicularity (dot product = 0), area ratios.
   - Notation: position vectors relative to origin, or free vectors for translation-invariant.

5. **Transformation**: Apply geometric transformation (reflection, rotation, translation, dilation) mapping part to part.
   - Best for: symmetry-based, congruence via isometry, similarity via dilation.

Document choice:

```
Theorem: Midline theorem (DE || AB and DE = AB/2).
Method evaluation:
  - Direct: requires parallel line theory and similar triangles. Moderate.
  - Coordinate: place B at origin, C on x-axis. Short computation. Good.
  - Vector: express D, E as midpoints, compute DE vector. Elegant.
Selected method: Coordinate proof (for explicit computation).
Alternative: Vector proof (for elegance).
```

→ Named method w/ justification, optionally alternative approaches noted.

If err: chosen method impasse after Step 3 → switch to alt. Coordinate proofs always settle metric questions mechanically → reliable fallback. Contradiction's negation doesn't lead to useful intermediate → try direct.

### Step 3: Construct Proof w/ Justified Steps

Build proof as sequence of logical steps, each justified by axiom, def, or established result.

**Direct/synthetic:**

Chain of implications, each step cites justification:

```
Proof:
1. Let M be the midpoint of AB.                    [Given]
2. Then AM = MB = AB/2.                            [Definition of midpoint]
3. In triangle ABC, since CM is a median,
   CM connects vertex C to midpoint M of AB.       [Definition of median]
4. Triangles ACM and BCM share side CM.            [Common side]
5. AM = MB.                                         [Step 2]
6. AC may or may not equal BC.                      [No assumption of isosceles]
...
```

**Coordinate:**

Set up coords, compute, interpret:

```
Proof (coordinate):
1. Place B at the origin (0, 0) and C at (2c, 0).  [Choice of coordinates]
2. Let A = (2a, 2b) for some a, b with b != 0.     [Non-degeneracy; factor of 2
                                                      simplifies midpoint computation]
3. D = midpoint of BC = ((0 + 2c)/2, 0) = (c, 0).  [Midpoint formula]
4. E = midpoint of AC = ((2a + 2c)/2, (2b + 0)/2)
     = (a + c, b).                                   [Midpoint formula]
5. Vector DE = E - D = (a + c - c, b - 0) = (a, b). [Vector subtraction]
6. Vector AB = B - A = (0 - 2a, 0 - 2b) = (-2a, -2b).
   So vector BA = (2a, 2b) = 2 * (a, b) = 2 * DE.  [Vector subtraction]
7. Since BA = 2 * DE, vectors DE and BA are parallel
   (scalar multiple) and |DE| = |BA|/2.             [Parallel vectors; magnitude]
8. Therefore DE || AB and DE = AB/2.                 [QED]
```

**Vector:**

Position vectors relative to origin:

```
Proof (vector):
Let position vectors of A, B, C be a, b, c respectively.
1. D = (b + c)/2.                                   [Midpoint of BC]
2. E = (a + c)/2.                                   [Midpoint of AC]
3. DE = E - D = (a + c)/2 - (b + c)/2 = (a - b)/2. [Vector subtraction]
4. AB = B - A = b - a.                               [Vector subtraction]
5. DE = -(1/2)(b - a) = (1/2)(a - b).
   So DE = -(1/2) * AB, meaning DE = (1/2) AB
   in magnitude with opposite direction
   (equivalently, DE || AB).                         [Scalar multiple => parallel]
6. |DE| = (1/2)|AB|, i.e., DE = AB/2.               [Magnitude of scalar multiple]
QED.
```

**Proof structure reqs:**

- Number every step
- Cite justification in brackets after each
- "Therefore" or "Hence" → mark logical conclusions
- Avoid gaps: step needs intermediate result → prove it or cite it

→ Complete proof, every step follows from prev + cited results, no unjustified claims.

If err: step unjustifiable → may be false. Test specific example. Holds numerically but no justification → may need intermediate lemma. State + prove separately, resume main. Approach stuck → return Step 2, pick different method.

### Step 4: Handle Special Cases + Edge Conditions

Configurations where general argument might fail.

1. **Degenerate cases.** Proof holds when:
   - Triangle → line (collinear vertices)
   - Circle → point (radius zero) or line (radius infinity)
   - Two points coincide
   - Angle = 0 or π (straight angle)
   - Polygon non-convex or self-intersecting

2. **Boundary cases.** Extreme values:
   - Right angles in angle-dependent
   - Isosceles or equilateral specializations in triangle theorems
   - Tangent vs secant in circle theorems

3. **Coordinate proofs** → verify coord assignment doesn't lose generality:
   - Did placing point at origin exclude valid config?
   - Did assuming side on axis force special orientation?
   - Implicit sign assumptions (b > 0) excluding valid cases?

4. **Document each special case** w/ resolution:

```
Special cases:
- If A lies on BC (degenerate triangle): D = E = midpoint of BC,
  and DE has length 0 while AB/2 > 0 in general. But the theorem
  assumes a non-degenerate triangle (b != 0 in our coordinates), so
  this case is excluded by hypothesis.
- If triangle is isosceles with AB = AC: the proof applies without
  modification (no special property of isosceles triangles was excluded).
- Coordinate generality: A = (2a, 2b) with b != 0 covers all non-degenerate
  triangles up to rotation and reflection, which preserves parallelism and
  length ratios. No generality lost.
```

→ Every degenerate/boundary case ID'd, each: proof applies unchanged, excluded by hypothesis, or separate argument provided.

If err: special case breaks proof → theorem may need additional hypothesis ("non-degenerate triangles"). Revise statement Step 1 or provide separate proof.

### Step 5: Write Complete Proof w/ QED

Assemble final doc combining all elements.

1. **Header**: State theorem in Given/Prove form.

2. **Proof body**: Complete chain of justified steps from Step 3.

3. **Special cases**: From Step 4 either inline (brief) or remark after main.

4. **Termination**: Clear marker:
   - "QED" (quod erat demonstrandum)
   - Halmos tombstone (filled or open square)
   - "This completes the proof."

5. **Review proof** for logical completeness:
   - Every step from prev or cited results?
   - All hypotheses used? (unused → theorem holds under weaker conditions, or gap)
   - Conclusion reached explicitly in final step?

Format:

```
THEOREM (Midline Theorem):
Given: Triangle ABC; D is the midpoint of BC; E is the midpoint of AC.
Prove: DE || AB and DE = AB/2.

PROOF:
Place B = (0, 0), C = (2c, 0), A = (2a, 2b) with b != 0
(ensuring non-degeneracy).

(1) D = midpoint(B, C) = (c, 0).                 [Midpoint formula]
(2) E = midpoint(A, C) = (a + c, b).             [Midpoint formula]
(3) Vector DE = (a, b).                           [Subtraction: (2) - (1)]
(4) Vector BA = (2a, 2b) = 2 * DE.               [Subtraction: A - B]
(5) Since BA = 2 * DE, the vectors are parallel,
    so DE || AB.                                  [Parallel criterion]
(6) |DE| = sqrt(a^2 + b^2);
    |AB| = sqrt(4a^2 + 4b^2) = 2*sqrt(a^2 + b^2)
         = 2|DE|.
    Therefore DE = AB/2.                          [Magnitude computation]

QED.
```

6. **Optional: state converse** or note generalizations.

→ Self-contained proof doc readable hypothesis → conclusion w/o external refs, ending w/ explicit QED.

If err: review finds gap → return Step 3. Correct but excessively long (>30 steps) → restructure w/ lemmas: extract reusable intermediates, cite in main.

## Check

- [ ] Theorem in precise Given/Prove form, all implicit assumptions explicit
- [ ] Proof method named + justified
- [ ] Every step numbered + cites justification
- [ ] No unjustified claims or logical gaps
- [ ] All hypotheses used ≥1 (or noted potentially removable)
- [ ] Conclusion explicit as final logical step
- [ ] Degenerate + boundary cases ID'd + addressed
- [ ] Coordinate proofs show choice loses no generality
- [ ] Proof ends w/ QED or equivalent
- [ ] Proof tested vs ≥1 specific numerical example

## Traps

- **Assume what you want to prove (circular reasoning)**: Most insidious error. Proving 2 triangles congruent → using consequence as step. Always trace each step back to hypotheses or established results, never to conclusion.

- **Unjustified diagram assumptions**: Diagram may suggest 2 lines intersect, point inside triangle, angle acute. Visual impressions must be proved, not assumed. Diagrams illustrate; not proof.

- **Loss of generality in coord placement**: Placing A at origin, B on positive x-axis, C in upper half-plane excludes clockwise vertex ordering. May not matter for distance/parallelism, but matters for orientation-dependent (signed area, cross product). Always verify.

- **Overlook degenerate cases**: Proof about triangles inscribed in circle may fail when triangle degenerates to diameter + point. Always check coincident points, parallel lines, degenerate figures.

- **Cite more powerful result than needed**: Law of cosines to prove what follows from basic angle-chasing → obscures logic + may add unnecessary assumptions (cosine well-defined). Use simplest sufficient tool.

- **Miss the converse trap**: "If quadrilateral is parallelogram, diagonals bisect each other" true, but converse = separate theorem needing separate proof. Don't prove converse when forward requested, or vice versa.

- **Incomplete case analysis**: Proof splits into cases (angle A acute, right, obtuse) → all cases addressed. Proving acute + claiming "others similar" w/o verification hides genuine differences.

## →

- `construct-geometric-figure` — constructions + proofs complementary: constructions demonstrate existence, proofs establish properties
- `solve-trigonometric-problem` — trig computations often appear as sub-tasks in geometric proofs
- `create-skill` — packaging new proof technique as reusable skill
