---
name: prove-geometric-theorem
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

Prove a geometric theorem rigorously by selecting an appropriate proof method, constructing a logical chain of justified steps from hypotheses to conclusion, handling all special cases, and producing a complete proof document.

## When to Use

- Given a geometric statement and asked to prove it is true
- Verifying a conjecture about geometric figures or relationships
- Establishing a lemma needed within a larger geometric argument
- Converting an intuitive geometric insight into a rigorous proof
- Comparing the effectiveness of different proof methods for the same theorem

## Inputs

- **Required**: Theorem statement (the geometric claim to be proved)
- **Required**: Given information (hypotheses, definitions, and any provided diagram description)
- **Optional**: Preferred proof method (direct, contradiction, coordinate, vector, transformation)
- **Optional**: Level of rigor (informal, semi-formal, formal with axiom citations)
- **Optional**: Known results that may be cited without proof (e.g., "you may assume the Pythagorean theorem")
- **Optional**: Whether to address all degenerate and special cases explicitly

## Procedure

### Step 1: State the Theorem Precisely

Rewrite the theorem in standard mathematical form with explicit Given and Prove clauses.

1. **Extract hypotheses.** List every condition in the "Given" clause. Be explicit about geometric type (point, line, segment, ray, circle, polygon), incidence relations (lies on, passes through), metric conditions (congruent, equal, perpendicular, parallel), and ordering assumptions.

2. **State the conclusion.** Write exactly what must be proved in the "Prove" clause. Distinguish between:
   - Equality/congruence: AB = CD, angle A = angle B, triangle ABC is congruent to triangle DEF
   - Incidence: point P lies on line L, three lines are concurrent
   - Inequality: AB > CD, angle A < 90 degrees
   - Existence: there exists a point P such that...
   - Uniqueness: such a point is unique

3. **Identify implicit assumptions.** Many geometry problems assume Euclidean geometry (parallel postulate), non-degeneracy (points not coincident, lines not concurrent unless stated), and positive orientation. Make these explicit.

4. **Draw or describe the configuration.** If a diagram is provided, transcribe its key features. If not, construct one:

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

**Expected:** A precise, unambiguous statement with Given and Prove clauses, all implicit assumptions surfaced, and a clear description of the geometric configuration.

**On failure:** If the theorem statement is vague (e.g., "the medial triangle is similar to the original"), rewrite it with explicit definitions and quantifiers. If the statement appears false, test it with a specific example before proceeding. A false theorem cannot be proved; instead, find and state a counterexample.

### Step 2: Select Proof Method

Choose the proof technique best suited to the theorem's structure.

**Available methods and when to use them:**

1. **Direct (synthetic) proof**: Work forward from the hypotheses using Euclidean propositions and previously established theorems.
   - Best for: congruence/similarity proofs, angle chasing, incidence theorems.
   - Tools: triangle congruence criteria (SSS, SAS, ASA, AAS, HL), properties of parallels (alternate interior angles, corresponding angles), circle theorems (inscribed angle, tangent-radius, power of a point).

2. **Proof by contradiction**: Assume the negation of the conclusion and derive a contradiction.
   - Best for: uniqueness proofs, impossibility results, inequality proofs where the direct approach is unclear.
   - Structure: "Assume, for contradiction, that [negation]. Then... [logical chain]... But this contradicts [known fact]. Therefore, the original conclusion holds."

3. **Coordinate proof**: Place the figure in a coordinate system and use algebra.
   - Best for: midpoint/distance/slope relationships, collinearity, parallelism, perpendicularity.
   - Setup: choose coordinates to minimize computation (e.g., place one vertex at the origin, one side along an axis).

4. **Vector proof**: Express geometric relationships using vector operations.
   - Best for: centroid/barycenter properties, parallelism (parallel vectors), perpendicularity (dot product = 0), area ratios.
   - Notation: position vectors relative to a chosen origin, or free vectors for translation-invariant properties.

5. **Transformation proof**: Apply a geometric transformation (reflection, rotation, translation, dilation) that maps part of the figure to another part.
   - Best for: symmetry-based results, congruence via isometry, similarity via dilation.

Evaluate and document the choice:

```
Theorem: Midline theorem (DE || AB and DE = AB/2).
Method evaluation:
  - Direct: requires parallel line theory and similar triangles. Moderate.
  - Coordinate: place B at origin, C on x-axis. Short computation. Good.
  - Vector: express D, E as midpoints, compute DE vector. Elegant.
Selected method: Coordinate proof (for explicit computation).
Alternative: Vector proof (for elegance).
```

**Expected:** A named proof method with justification for why it suits this theorem, and optionally a note on alternative approaches.

**On failure:** If the first chosen method leads to an impasse after Step 3, switch to an alternative. Coordinate proofs can always settle metric questions mechanically, so they serve as a reliable fallback. If contradiction is chosen but the negation does not lead to a useful intermediate statement, try the direct approach instead.

### Step 3: Construct Proof with Justified Steps

Build the proof as a sequence of logical steps, each justified by an axiom, definition, or previously established result.

**For direct/synthetic proofs:**

Organize as a chain of implications. Each step must cite its justification:

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

Set up coordinates, compute, and interpret:

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

Use position vectors relative to a chosen origin:

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
- Cite the justification in brackets after each step.
- Use "Therefore" or "Hence" to mark logical conclusions.
- Avoid gaps: if a step requires an intermediate result, prove it or cite it.

**Expected:** A complete proof where every step follows logically from previous steps and cited results, with no unjustified claims.

**On failure:** If a step cannot be justified, it may be false. Test it with a specific example. If it holds numerically but you cannot find the justification, it may require an intermediate lemma. State the lemma, prove it separately, then resume the main proof. If the entire approach is stuck, return to Step 2 and select a different method.

### Step 4: Handle Special Cases and Edge Conditions

Identify and address configurations where the general argument might fail.

1. **Degenerate cases.** Check whether the proof holds when:
   - A triangle degenerates to a line (collinear vertices)
   - A circle degenerates to a point (radius zero) or a line (radius infinity)
   - Two points coincide
   - An angle equals 0 or pi (straight angle)
   - A polygon becomes non-convex or self-intersecting

2. **Boundary cases.** Check extreme values:
   - Right angles in angle-dependent theorems
   - Isosceles or equilateral specializations in triangle theorems
   - Tangent vs. secant configurations in circle theorems

3. **For coordinate proofs**, verify that the coordinate assignment does not lose generality:
   - Did placing a point at the origin exclude any valid configuration?
   - Did assuming a side lies on an axis force a special orientation?
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

**Expected:** Every degenerate or boundary case is identified, and for each one, either the proof is shown to apply unchanged, the case is shown to be excluded by hypothesis, or a separate argument is provided.

**On failure:** If a special case breaks the proof, the theorem may need an additional hypothesis (e.g., "for non-degenerate triangles"). Revise the theorem statement in Step 1 to include the necessary condition, or provide a separate proof for the special case.

### Step 5: Write Complete Proof with QED

Assemble the final proof document combining all elements from the previous steps.

1. **Header**: State the theorem in Given/Prove form.

2. **Proof body**: Present the complete chain of justified steps from Step 3.

3. **Special cases**: Include the analysis from Step 4 either inline (if brief) or as a remark after the main proof.

4. **Termination**: End with a clear marker:
   - "QED" (quod erat demonstrandum)
   - A Halmos tombstone symbol (a filled or open square)
   - "This completes the proof."

5. **Review the proof** for logical completeness:
   - Does every step follow from previous steps or cited results?
   - Are all hypotheses used? (If a hypothesis is unused, the theorem may hold under weaker conditions, or there may be a gap.)
   - Is the conclusion reached explicitly in the final step?

Format the final proof:

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

6. **Optional: state the converse** or note generalizations.

**Expected:** A self-contained proof document that a reader (or verifying agent) can follow from hypothesis to conclusion without external references, ending with an explicit QED.

**On failure:** If during the final review a gap is found, return to Step 3 to fill it. If the proof is correct but excessively long (over 30 steps), consider restructuring with lemmas: extract reusable intermediate results as named lemmas proved separately, then cite them in the main proof.

## Validation

- [ ] Theorem is stated in precise Given/Prove form with all implicit assumptions explicit
- [ ] Proof method is named and justified
- [ ] Every proof step is numbered and cites its justification
- [ ] No unjustified claims or logical gaps exist in the chain
- [ ] All hypotheses are used at least once (or noted as potentially removable)
- [ ] The conclusion is stated explicitly as the final logical step
- [ ] Degenerate and boundary cases are identified and addressed
- [ ] Coordinate proofs demonstrate that the coordinate choice loses no generality
- [ ] The proof ends with QED or equivalent termination marker
- [ ] The proof has been tested against at least one specific numerical example

## Common Pitfalls

- **Assuming what you want to prove (circular reasoning)**: The most insidious error. For example, in proving two triangles congruent, using a consequence of that congruence as a step. Always trace each step back to hypotheses or previously established results, never to the conclusion.

- **Unjustified diagram assumptions**: A diagram may suggest that two lines intersect, a point lies inside a triangle, or an angle is acute. These visual impressions must be proved, not assumed. Diagrams illustrate; they do not constitute proof.

- **Loss of generality in coordinate placement**: Placing a triangle with A at the origin, B on the positive x-axis, and C in the upper half-plane excludes configurations where the vertices are ordered clockwise. This may not matter for distance/parallelism proofs, but can matter for orientation-dependent results (signed area, cross product direction). Always verify.

- **Overlooking degenerate cases**: A proof about triangles inscribed in a circle may fail when the triangle degenerates to a diameter plus a point on the circle. Always check what happens when points coincide, lines become parallel, or figures degenerate.

- **Citing a more powerful result than needed**: Using the law of cosines to prove a result that follows from basic angle-chasing obscures the proof's logic and may introduce unnecessary assumptions (like the cosine function being well-defined). Use the simplest sufficient tool.

- **Missing the converse trap**: "If a quadrilateral is a parallelogram, then its diagonals bisect each other" is true, but its converse is a separate theorem requiring a separate proof. Do not prove the converse when the forward direction is requested, or vice versa.

- **Incomplete case analysis**: When a proof splits into cases (e.g., angle A is acute, right, or obtuse), all cases must be addressed. Proving the acute case and claiming "the other cases are similar" without verification can hide genuine differences.

## Related Skills

- `construct-geometric-figure` - constructions and proofs are complementary: constructions demonstrate existence, proofs establish properties
- `solve-trigonometric-problem` - trigonometric computations often appear as sub-tasks within geometric proofs
- `create-skill` - follow when packaging a new proof technique as a reusable skill
