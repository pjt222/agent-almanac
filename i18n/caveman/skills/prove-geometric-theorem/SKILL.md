---
name: prove-geometric-theorem
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Prove geometric theorems using Euclidean axiomatic methods, coordinate
  geometry, or vector methods with rigorous step-by-step logical structure.
  Covers direct proof, proof by contradiction, coordinate proofs, vector
  proofs, and handling of special cases and degenerate configurations.
  Use when given a geometric statement to prove, verifying a conjecture,
  establishing a lemma, converting geometric intuition into a rigorous proof,
  or comparing the effectiveness of different proof methods.
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

Prove geometric theorem rigorously. Pick appropriate proof method. Build logical chain of justified steps from hypotheses to conclusion. Handle all special cases. Produce complete proof document.

## When Use

- Given geometric statement and asked to prove it true
- Verifying conjecture about geometric figures or relationships
- Establishing lemma needed within larger geometric argument
- Converting intuitive geometric insight into rigorous proof
- Comparing effectiveness of different proof methods for same theorem

## Inputs

- **Required**: Theorem statement (geometric claim to be proved)
- **Required**: Given information (hypotheses, definitions, any provided diagram description)
- **Optional**: Preferred proof method (direct, contradiction, coordinate, vector, transformation)
- **Optional**: Level of rigor (informal, semi-formal, formal with axiom citations)
- **Optional**: Known results that may be cited without proof (e.g. "you may assume the Pythagorean theorem")
- **Optional**: Whether to address all degenerate and special cases explicitly

## Steps

### Step 1: State Theorem Precisely

Rewrite theorem in standard mathematical form with explicit Given and Prove clauses.

1. **Extract hypotheses.** List every condition in "Given" clause. Be explicit about geometric type (point, line, segment, ray, circle, polygon), incidence relations (lies on, passes through), metric conditions (congruent, equal, perpendicular, parallel), ordering assumptions.

2. **State conclusion.** Write exactly what must be proved in "Prove" clause. Distinguish between:
   - Equality/congruence: AB = CD, angle A = angle B, triangle ABC is congruent to triangle DEF
   - Incidence: point P lies on line L, three lines are concurrent
   - Inequality: AB > CD, angle A < 90 degrees
   - Existence: there exists a point P such that...
   - Uniqueness: such a point is unique

3. **Identify implicit assumptions.** Many geometry problems assume Euclidean geometry (parallel postulate), non-degeneracy (points not coincident, lines not concurrent unless stated), positive orientation. Make these explicit.

4. **Draw or describe configuration.** Diagram provided? Transcribe key features. If not, construct one:

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

**Got:** Precise, unambiguous statement with Given and Prove clauses. All implicit assumptions surfaced. Clear description of geometric configuration.

**If fail:** Theorem statement vague (e.g. "the medial triangle is similar to the original")? Rewrite with explicit definitions and quantifiers. Statement appears false? Test with specific example before proceeding. False theorem can't be proved — instead, find and state counterexample.

### Step 2: Select Proof Method

Pick proof technique best suited to theorem's structure.

**Available methods and when to use them:**

1. **Direct (synthetic) proof**: Work forward from hypotheses using Euclidean propositions and previously established theorems.
   - Best for: congruence/similarity proofs, angle chasing, incidence theorems.
   - Tools: triangle congruence criteria (SSS, SAS, ASA, AAS, HL), properties of parallels (alternate interior angles, corresponding angles), circle theorems (inscribed angle, tangent-radius, power of a point).

2. **Proof by contradiction**: Assume negation of conclusion. Derive contradiction.
   - Best for: uniqueness proofs, impossibility results, inequality proofs where direct approach unclear.
   - Structure: "Assume, for contradiction, that [negation]. Then... [logical chain]... But this contradicts [known fact]. Therefore, original conclusion holds."

3. **Coordinate proof**: Place figure in coordinate system. Use algebra.
   - Best for: midpoint/distance/slope relationships, collinearity, parallelism, perpendicularity.
   - Setup: pick coordinates to minimize computation (e.g. place one vertex at origin, one side along axis).

4. **Vector proof**: Express geometric relationships using vector operations.
   - Best for: centroid/barycenter properties, parallelism (parallel vectors), perpendicularity (dot product = 0), area ratios.
   - Notation: position vectors relative to chosen origin, or free vectors for translation-invariant properties.

5. **Transformation proof**: Apply geometric transformation (reflection, rotation, translation, dilation) that maps part of figure to another part.
   - Best for: symmetry-based results, congruence via isometry, similarity via dilation.

Evaluate and document choice:

```
Theorem: Midline theorem (DE || AB and DE = AB/2).
Method evaluation:
  - Direct: requires parallel line theory and similar triangles. Moderate.
  - Coordinate: place B at origin, C on x-axis. Short computation. Good.
  - Vector: express D, E as midpoints, compute DE vector. Elegant.
Selected method: Coordinate proof (for explicit computation).
Alternative: Vector proof (for elegance).
```

**Got:** Named proof method with reason for why it suits this theorem. Optionally a note on alternative approaches.

**If fail:** First chosen method leads to impasse after Step 3? Switch to alternative. Coordinate proofs can always settle metric questions mechanically — serve as reliable fallback. Contradiction chosen but negation doesn't lead to useful intermediate statement? Try direct approach instead.

### Step 3: Construct Proof with Justified Steps

Build proof as sequence of logical steps. Each justified by axiom, definition, or previously established result.

**For direct/synthetic proofs:**

Organize as chain of implications. Each step must cite its justification:

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

**For coordinate proofs:**

Set up coordinates. Compute. Interpret:

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

**For vector proofs:**

Use position vectors relative to chosen origin:

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

**Proof structure requirements:**

- Number every step.
- Cite justification in brackets after each step.
- Use "Therefore" or "Hence" to mark logical conclusions.
- Avoid gaps: step requires intermediate result? Prove it or cite it.

**Got:** Complete proof where every step follows logically from previous steps and cited results. No unjustified claims.

**If fail:** Step can't be justified? May be false. Test with specific example. Holds numerically but you can't find justification? May require intermediate lemma. State lemma. Prove it separately. Resume main proof. Entire approach stuck? Return to Step 2 and pick different method.

### Step 4: Handle Special Cases and Edge Conditions

Identify and address configurations where general argument might fail.

1. **Degenerate cases.** Check if proof holds when:
   - Triangle degenerates to line (collinear vertices)
   - Circle degenerates to point (radius zero) or line (radius infinity)
   - Two points coincide
   - Angle equals 0 or pi (straight angle)
   - Polygon becomes non-convex or self-intersecting

2. **Boundary cases.** Check extreme values:
   - Right angles in angle-dependent theorems
   - Isosceles or equilateral specializations in triangle theorems
   - Tangent vs secant configurations in circle theorems

3. **For coordinate proofs**, verify coordinate assignment doesn't lose generality:
   - Did placing point at origin exclude any valid configuration?
   - Did assuming side lies on axis force special orientation?
   - Were there implicit sign assumptions (b > 0) that exclude valid cases?

4. **Document each special case** with its resolution:

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

**Got:** Every degenerate or boundary case identified. For each: proof shown to apply unchanged, case shown to be excluded by hypothesis, or separate argument provided.

**If fail:** Special case breaks proof? Theorem may need additional hypothesis (e.g. "for non-degenerate triangles"). Revise theorem statement in Step 1 to include necessary condition. Or provide separate proof for special case.

### Step 5: Write Complete Proof with QED

Assemble final proof document combining all elements from previous steps.

1. **Header**: State theorem in Given/Prove form.

2. **Proof body**: Present complete chain of justified steps from Step 3.

3. **Special cases**: Include analysis from Step 4 either inline (if brief) or as remark after main proof.

4. **Termination**: End with clear marker:
   - "QED" (quod erat demonstrandum)
   - Halmos tombstone symbol (filled or open square)
   - "This completes the proof."

5. **Review proof** for logical completeness:
   - Does every step follow from previous steps or cited results?
   - Are all hypotheses used? (Hypothesis unused? Theorem may hold under weaker conditions, or there may be a gap.)
   - Is conclusion reached explicitly in final step?

Format final proof:

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

**Got:** Self-contained proof document a reader (or verifying agent) can follow from hypothesis to conclusion without external references. Ends with explicit QED.

**If fail:** During final review gap found? Return to Step 3 to fill it. Proof correct but excessively long (over 30 steps)? Restructure with lemmas: extract reusable intermediate results as named lemmas proved separately, then cite them in main proof.

## Checks

- [ ] Theorem stated in precise Given/Prove form with all implicit assumptions explicit
- [ ] Proof method named and justified
- [ ] Every proof step numbered and cites its justification
- [ ] No unjustified claims or logical gaps in chain
- [ ] All hypotheses used at least once (or noted as potentially removable)
- [ ] Conclusion stated explicitly as final logical step
- [ ] Degenerate and boundary cases identified and addressed
- [ ] Coordinate proofs demonstrate coordinate choice loses no generality
- [ ] Proof ends with QED or equivalent termination marker
- [ ] Proof tested against at least one specific numerical example

## Pitfalls

- **Assume what you want to prove (circular reasoning)**: Most insidious error. Example: in proving two triangles congruent, using consequence of that congruence as step. Always trace each step back to hypotheses or previously established results — never to conclusion.

- **Unjustified diagram assumptions**: Diagram may suggest two lines intersect, point lies inside triangle, angle is acute. These visual impressions must be proved, not assumed. Diagrams illustrate. Don't constitute proof.

- **Loss of generality in coordinate placement**: Placing triangle with A at origin, B on positive x-axis, C in upper half-plane excludes configurations where vertices ordered clockwise. May not matter for distance/parallelism proofs. Can matter for orientation-dependent results (signed area, cross product direction). Always verify.

- **Overlook degenerate cases**: Proof about triangles inscribed in circle may fail when triangle degenerates to diameter plus point on circle. Always check what happens when points coincide, lines become parallel, figures degenerate.

- **Cite more powerful result than needed**: Using law of cosines to prove result that follows from basic angle-chasing obscures proof's logic. May introduce unnecessary assumptions (like cosine function being well-defined). Use simplest sufficient tool.

- **Miss the converse trap**: "If quadrilateral is parallelogram, then its diagonals bisect each other" is true. But its converse is separate theorem requiring separate proof. Don't prove converse when forward direction requested, or vice versa.

- **Incomplete case analysis**: Proof splits into cases (e.g. angle A is acute, right, or obtuse)? All cases must be addressed. Proving acute case and claiming "other cases similar" without verification can hide genuine differences.

## See Also

- `construct-geometric-figure` - constructions and proofs are complementary: constructions demonstrate existence, proofs establish properties
- `solve-trigonometric-problem` - trigonometric computations often appear as sub-tasks within geometric proofs
- `create-skill` - follow when packaging new proof technique as reusable skill
