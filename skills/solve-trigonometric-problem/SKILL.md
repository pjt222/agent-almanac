---
name: solve-trigonometric-problem
description: >
  Solve trigonometric equations and triangle problems systematically using
  identities, law of sines/cosines, inverse functions, and unit circle
  analysis. Covers equation solving, triangle resolution, identity
  verification, and applied trigonometric modeling. Use when solving
  trigonometric equations for unknown angles, resolving triangles from
  partial information (SSS, SAS, ASA), verifying identities, or applying
  trigonometry to real-world problems in surveying, physics, or engineering.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: geometry
  complexity: intermediate
  language: multi
  tags: geometry, trigonometry, identities, triangle, sines, cosines
---

# Solve a Trigonometric Problem

Systematically solve trigonometric equations, triangle problems, and identity verifications by classifying the problem type, selecting the appropriate strategy, applying identities and laws, and verifying solutions against domain and range constraints.

## When to Use

- Solving trigonometric equations for unknown angles or values
- Resolving triangles given partial information (SSS, SAS, ASA, AAS, SSA)
- Verifying or proving trigonometric identities
- Applying trigonometry to real-world problems (surveying, physics, engineering)
- Simplifying complex trigonometric expressions

## Inputs

- **Required**: Problem statement (equation, triangle data, identity to verify, or application scenario)
- **Required**: Desired output form (exact values, decimal approximations, general solution, specific interval)
- **Optional**: Angle unit convention (radians or degrees; default: radians)
- **Optional**: Domain restriction (e.g., [0, 2*pi), [0, 360), all reals)
- **Optional**: Required precision for numerical answers (e.g., 4 decimal places)

## Procedure

### Step 1: Classify Problem Type

Determine which category the problem falls into, as each requires a different strategy.

1. **Trigonometric equation**: Solve for unknown angle(s) in an equation involving trigonometric functions.
   - Sub-types: linear in one trig function, quadratic in one trig function, multiple-angle, mixed functions, parametric.

2. **Triangle resolution**: Given partial information about a triangle, find all remaining sides and angles.
   - Sub-types by given data: SSS, SAS, ASA, AAS, SSA (ambiguous case).

3. **Identity verification**: Prove that a trigonometric equation holds for all values in its domain.
   - Sub-types: algebraic manipulation, sum-to-product, product-to-sum, half-angle, double-angle.

4. **Application problem**: Extract a trigonometric model from a real-world scenario.
   - Sub-types: periodic modeling, angle of elevation/depression, bearing/navigation, harmonic motion.

Document the classification:

```
Problem: Solve 2*sin^2(x) - sin(x) - 1 = 0 for x in [0, 2*pi).
Classification: Trigonometric equation, quadratic in sin(x).
```

**Expected:** A clear classification with the problem sub-type identified, which directly determines the solution strategy in Step 2.

**On failure:** If the problem does not fit neatly into one category, it may be a compound problem. Decompose it into sub-problems, classify each, and solve sequentially. For example, "find the area of triangle ABC given two sides and the included angle" combines triangle resolution (SAS) with an area formula application.

### Step 2: Select Solution Strategy

Choose the appropriate method based on the classification from Step 1.

**For trigonometric equations:**

| Equation Type | Strategy |
|---|---|
| Linear in sin(x) or cos(x) | Isolate the trig function, apply inverse |
| Quadratic in sin(x) or cos(x) | Substitute u = sin(x), solve quadratic, back-substitute |
| Multiple angle (sin(2x), cos(3x)) | Solve for the inner argument, then divide |
| Mixed functions (sin and cos) | Convert to single function using identities |
| Factorable | Factor and solve each factor = 0 |

**For triangle resolution:**

| Given Data | Primary Tool |
|---|---|
| SSS | Law of cosines (find largest angle first) |
| SAS | Law of cosines (find opposite side), then law of sines |
| ASA | Angle sum = pi, then law of sines |
| AAS | Angle sum = pi, then law of sines |
| SSA | Law of sines (check ambiguous case: 0, 1, or 2 solutions) |

**For identity verification:**

- Work on one side only (typically the more complex side)
- Convert everything to sin and cos
- Apply fundamental identities: Pythagorean, reciprocal, quotient
- Apply sum/difference, double-angle, half-angle formulas as needed
- Factor and simplify until both sides match

**For application problems:**

- Draw a diagram and label all known and unknown quantities
- Identify the trigonometric relationship (right triangle, oblique triangle, periodic function)
- Set up the equation and solve using the appropriate method above

Document the chosen strategy:

```
Strategy: Substitute u = sin(x), solve 2u^2 - u - 1 = 0,
back-substitute, and find x in [0, 2*pi).
```

**Expected:** A specific, named strategy that matches the problem classification, with the key formula or identity identified.

**On failure:** If no single strategy applies, try combining approaches. For equations mixing sin and cos, try: (a) Pythagorean substitution, (b) tangent half-angle substitution t = tan(x/2), or (c) auxiliary angle method (a*sin(x) + b*cos(x) = R*sin(x + phi)). If stuck on an identity, try working from both sides toward a common middle expression.

### Step 3: Apply Identities and Laws Systematically

Execute the chosen strategy step by step.

**Key identity families to draw from:**

1. **Pythagorean**: sin^2(x) + cos^2(x) = 1, 1 + tan^2(x) = sec^2(x), 1 + cot^2(x) = csc^2(x)

2. **Double-angle**: sin(2x) = 2*sin(x)*cos(x), cos(2x) = cos^2(x) - sin^2(x) = 2*cos^2(x) - 1 = 1 - 2*sin^2(x)

3. **Sum/difference**: sin(A +/- B) = sin(A)*cos(B) +/- cos(A)*sin(B), cos(A +/- B) = cos(A)*cos(B) -/+ sin(A)*sin(B)

4. **Law of sines**: a/sin(A) = b/sin(B) = c/sin(C) = 2R

5. **Law of cosines**: c^2 = a^2 + b^2 - 2*a*b*cos(C)

6. **Half-angle**: sin(x/2) = +/-sqrt((1 - cos(x))/2), cos(x/2) = +/-sqrt((1 + cos(x))/2)

Show each algebraic step explicitly:

```
2*sin^2(x) - sin(x) - 1 = 0
Let u = sin(x):
  2u^2 - u - 1 = 0
  (2u + 1)(u - 1) = 0
  u = -1/2  or  u = 1
Back-substitute:
  sin(x) = -1/2  or  sin(x) = 1
```

For triangle resolution, compute intermediate values and carry sufficient precision:

```
Given: a = 7, b = 10, C = 38 degrees (SAS)
Law of cosines: c^2 = 49 + 100 - 2(7)(10)*cos(38)
  c^2 = 149 - 140*cos(38) = 149 - 110.312 = 38.688
  c = 6.220
Law of sines: sin(A)/7 = sin(38)/6.220
  sin(A) = 7*sin(38)/6.220 = 0.6930
  A = 43.78 degrees
  B = 180 - 38 - 43.78 = 98.22 degrees
```

**Expected:** A complete chain of algebraic steps from the initial equation or data to the intermediate result, with every identity application labeled.

**On failure:** If an identity application leads to a more complex expression rather than a simpler one, reconsider the strategy. Common recovery moves: (a) try converting to exponential form using Euler's formula for complex identity proofs, (b) multiply both sides by a conjugate, (c) use a substitution to reduce degree. If numerical computation produces unexpected values, verify using an independent calculation path.

### Step 4: Solve and Check Domain/Range Constraints

Extract all solutions and filter them against the problem's domain.

1. **Find the reference angle.** For each value of the trigonometric function, determine the reference angle using inverse functions:

```
sin(x) = -1/2  =>  reference angle = pi/6
sin(x) = 1     =>  reference angle = pi/2
```

2. **Enumerate all solutions in the fundamental period.** Use the sign and quadrant rules:

```
sin(x) = -1/2:
  x is in Q3 or Q4 (sin negative)
  x = pi + pi/6 = 7*pi/6
  x = 2*pi - pi/6 = 11*pi/6

sin(x) = 1:
  x = pi/2
```

3. **Apply domain restriction.** Keep only solutions in the specified interval:

```
Domain: [0, 2*pi)
Solutions: x = pi/2, 7*pi/6, 11*pi/6
```

4. **Write the general solution** (if requested):

```
General solution:
  x = pi/2 + 2*k*pi,  k in Z
  x = 7*pi/6 + 2*k*pi,  k in Z
  x = 11*pi/6 + 2*k*pi,  k in Z
```

5. **Check range constraints.** For inverse function problems, verify the output is in the principal value range. For triangle problems, verify all angles are positive and sum to pi (or 180 degrees), and all sides are positive.

6. **Handle the ambiguous case (SSA).** When using law of sines with SSA data:
   - If sin(B) > 1: no solution.
   - If sin(B) = 1: one solution (right angle).
   - If sin(B) < 1 and the given angle is acute: two possible solutions (check if both yield valid triangles).
   - If the given angle is obtuse or right: at most one solution.

**Expected:** A complete, explicitly enumerated solution set that respects all domain and range constraints, with the ambiguous case handled if applicable.

**On failure:** If no solutions exist in the specified domain, verify the equation was set up correctly. If too many solutions appear, check whether extraneous solutions were introduced (e.g., by squaring both sides of an equation). Always substitute each candidate solution back into the original equation.

### Step 5: Verify Solution Numerically

Confirm each solution by substitution into the original equation or by independent computation.

1. **Substitute each solution** into the original equation and verify equality:

```
Check x = 7*pi/6:
  sin(7*pi/6) = -1/2
  2*(-1/2)^2 - (-1/2) - 1 = 2*(1/4) + 1/2 - 1 = 1/2 + 1/2 - 1 = 0. VERIFIED.

Check x = 11*pi/6:
  sin(11*pi/6) = -1/2
  2*(1/4) + 1/2 - 1 = 0. VERIFIED.

Check x = pi/2:
  sin(pi/2) = 1
  2*(1) - 1 - 1 = 0. VERIFIED.
```

2. **For triangle problems**, verify using an independent law:

```
Verify triangle: a=7, b=10, c=6.220, A=43.78, B=98.22, C=38
Check law of sines: a/sin(A) = 7/sin(43.78) = 7/0.6913 = 10.126
                    b/sin(B) = 10/sin(98.22) = 10/0.9897 = 10.104
                    c/sin(C) = 6.220/sin(38) = 6.220/0.6157 = 10.102
Ratios approximately equal (within rounding). VERIFIED.
Check angle sum: 43.78 + 98.22 + 38 = 180. VERIFIED.
```

3. **For identity proofs**, verify with a specific numerical value:

```
Verify identity: sin(2x) = 2*sin(x)*cos(x)
Let x = pi/3:
  LHS: sin(2*pi/3) = sin(120) = sqrt(3)/2
  RHS: 2*sin(pi/3)*cos(pi/3) = 2*(sqrt(3)/2)*(1/2) = sqrt(3)/2
  LHS = RHS. VERIFIED.
```

4. **Document the final answer** in the requested format:

```
Solution: x in {pi/2, 7*pi/6, 11*pi/6} for x in [0, 2*pi).
```

**Expected:** Every solution passes substitution verification. Triangle solutions satisfy both law of sines and law of cosines. Identity proofs are confirmed by at least one numerical test.

**On failure:** If a solution fails verification, it is extraneous. Remove it from the solution set and re-examine the step where it was introduced. Common sources of extraneous solutions: squaring both sides (introduces sign ambiguity), multiplying by an expression that could be zero, or selecting the wrong quadrant for the reference angle.

## Validation

- [ ] Problem is classified into a specific type and sub-type
- [ ] Solution strategy is explicitly named and matches the problem type
- [ ] Every identity or law application is labeled with its name
- [ ] All algebraic steps are shown (no jumps in logic)
- [ ] Domain and range constraints are explicitly applied
- [ ] The ambiguous case is addressed for SSA triangle problems
- [ ] Every solution is verified by substitution into the original equation
- [ ] Triangle solutions are cross-checked with an independent law
- [ ] Final answer is stated in the requested format (exact, decimal, general, interval-specific)
- [ ] Angle units are consistent throughout (no mixing radians and degrees)

## Common Pitfalls

- **Losing solutions by dividing by a trig function**: Dividing both sides by sin(x) discards all solutions where sin(x) = 0. Always factor instead of dividing: write sin(x) * f(x) = 0 and solve each factor separately.

- **Extraneous solutions from squaring**: Squaring both sides of sin(x) = cos(x) gives sin^2(x) = cos^2(x), which has twice as many solutions. Always verify candidates against the original (unsquared) equation.

- **Ignoring the ambiguous case (SSA)**: When solving a triangle with two sides and a non-included angle, the law of sines can produce 0, 1, or 2 valid triangles. Failing to check for the second solution misses valid answers.

- **Mixing angle units**: Using sin(30) when the calculator or language is in radian mode gives sin(30 radians), not sin(30 degrees). State the unit convention at the start and enforce it throughout.

- **Wrong quadrant for reference angle**: sin(x) = -1/2 yields x in Q3 and Q4, not Q1 and Q2. Always check the sign of the trig function against the quadrant before placing the angle.

- **Forgetting periodicity**: Trigonometric equations on the real line have infinitely many solutions. If the problem asks for the general solution, include the "+ 2*k*pi" (or "+ k*pi" for tangent) term. If it asks for solutions in [0, 2*pi), enumerate all solutions in that interval.

## Related Skills

- `construct-geometric-figure` - constructions often require trigonometric analysis to determine angles and lengths
- `prove-geometric-theorem` - trigonometric identities frequently appear as lemmas within geometric proofs
- `create-skill` - follow when packaging a new trigonometric method as a reusable skill
