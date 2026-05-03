---
name: solve-trigonometric-problem
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Solve trig eqns + triangle probs systematically: identities, law of
  sines/cosines, inverse fns, unit circle. Eqn solving, triangle resolution,
  identity verify, applied modeling. Use → trig eqns for unknown angles,
  triangles from partial info (SSS, SAS, ASA), verify identities, real-world
  trig (surveying, physics, eng).
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

# Solve Trig Problem

Classify type → select strategy → apply identities + laws → verify vs domain/range.

## Use When

- Solve trig eqns for unknown angles/values
- Resolve triangles given partial info (SSS, SAS, ASA, AAS, SSA)
- Verify | prove trig identities
- Real-world (surveying, physics, eng)
- Simplify complex trig expressions

## In

- **Required**: Problem statement (eqn, triangle data, identity, applied scenario)
- **Required**: Output form (exact, decimal, general, interval)
- **Optional**: Angle unit (rad | deg; default rad)
- **Optional**: Domain restriction ([0, 2π), [0, 360), reals)
- **Optional**: Precision for numerics (e.g. 4 decimals)

## Do

### Step 1: Classify

Each cat needs diff strategy.

1. **Trig eqn**: solve for unknown angle(s).
   - Sub: linear in 1 fn, quadratic in 1 fn, multi-angle, mixed fns, parametric.

2. **Triangle resolution**: partial info → all sides + angles.
   - Sub by data: SSS, SAS, ASA, AAS, SSA (ambiguous).

3. **Identity verify**: prove eqn holds for all values in domain.
   - Sub: alg manip, sum-to-product, product-to-sum, half-angle, double-angle.

4. **Applied**: extract trig model from real-world.
   - Sub: periodic modeling, elevation/depression, bearing/nav, harmonic motion.

Doc classification:

```
Problem: Solve 2*sin^2(x) - sin(x) - 1 = 0 for x in [0, 2*pi).
Classification: Trigonometric equation, quadratic in sin(x).
```

**Got:** Clear classification w/ sub-type → determines Step 2 strategy.

**If err:** Doesn't fit cleanly → compound problem. Decompose, classify each, solve sequential. e.g. "area of triangle ABC given 2 sides + included angle" = SAS resolution + area formula.

### Step 2: Strategy

Based on Step 1 classification.

**For trig eqns:**

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

**For identity verify:**

- Work one side only (typically more complex)
- Convert all → sin + cos
- Apply fundamental: Pythagorean, reciprocal, quotient
- Apply sum/diff, double-angle, half-angle as needed
- Factor + simplify until both sides match

**For applied:**

- Diagram, label all known + unknown
- ID trig relationship (right tri, oblique, periodic)
- Setup eqn + solve via above

Doc chosen strategy:

```
Strategy: Substitute u = sin(x), solve 2u^2 - u - 1 = 0,
back-substitute, and find x in [0, 2*pi).
```

**Got:** Specific named strategy matching classification, w/ key formula/identity ID'd.

**If err:** No single strategy → combine. For mixed sin+cos: (a) Pythagorean sub, (b) tangent half-angle t = tan(x/2), (c) auxiliary angle (a·sin(x) + b·cos(x) = R·sin(x + phi)). Stuck identity → work both sides toward common middle.

### Step 3: Apply Identities + Laws

Execute strategy step by step.

**Key identity families:**

1. **Pythagorean**: sin²(x) + cos²(x) = 1, 1 + tan²(x) = sec²(x), 1 + cot²(x) = csc²(x)

2. **Double-angle**: sin(2x) = 2·sin(x)·cos(x), cos(2x) = cos²(x) - sin²(x) = 2·cos²(x) - 1 = 1 - 2·sin²(x)

3. **Sum/diff**: sin(A ± B) = sin(A)·cos(B) ± cos(A)·sin(B), cos(A ± B) = cos(A)·cos(B) ∓ sin(A)·sin(B)

4. **Law of sines**: a/sin(A) = b/sin(B) = c/sin(C) = 2R

5. **Law of cosines**: c² = a² + b² - 2·a·b·cos(C)

6. **Half-angle**: sin(x/2) = ±√((1 - cos(x))/2), cos(x/2) = ±√((1 + cos(x))/2)

Show each step explicit:

```
2*sin^2(x) - sin(x) - 1 = 0
Let u = sin(x):
  2u^2 - u - 1 = 0
  (2u + 1)(u - 1) = 0
  u = -1/2  or  u = 1
Back-substitute:
  sin(x) = -1/2  or  sin(x) = 1
```

For triangle, intermediate values w/ sufficient precision:

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

**Got:** Complete chain from initial → intermediate, every identity labeled.

**If err:** Identity → more complex (not simpler) → reconsider strategy. Recovery: (a) exponential form via Euler's formula for complex identity proofs, (b) multiply both sides by conjugate, (c) substitution to reduce degree. Numerical unexpected → verify w/ independent path.

### Step 4: Solve + Check Domain/Range

Extract all solutions, filter vs problem domain.

1. **Reference angle.** Per fn value, determine via inverse:

```
sin(x) = -1/2  =>  reference angle = pi/6
sin(x) = 1     =>  reference angle = pi/2
```

2. **Enumerate all in fundamental period.** Use sign + quadrant rules:

```
sin(x) = -1/2:
  x is in Q3 or Q4 (sin negative)
  x = pi + pi/6 = 7*pi/6
  x = 2*pi - pi/6 = 11*pi/6

sin(x) = 1:
  x = pi/2
```

3. **Apply domain restriction.** Keep only in interval:

```
Domain: [0, 2*pi)
Solutions: x = pi/2, 7*pi/6, 11*pi/6
```

4. **General solution** (if requested):

```
General solution:
  x = pi/2 + 2*k*pi,  k in Z
  x = 7*pi/6 + 2*k*pi,  k in Z
  x = 11*pi/6 + 2*k*pi,  k in Z
```

5. **Range constraints.** Inverse fn → verify principal value range. Triangle → all angles positive + sum to π (180°), all sides positive.

6. **Ambiguous case (SSA).** Law of sines w/ SSA:
   - sin(B) > 1 → no solution
   - sin(B) = 1 → 1 solution (right angle)
   - sin(B) < 1, given angle acute → 2 possible (check both yield valid triangles)
   - Given angle obtuse | right → at most 1 solution

**Got:** Complete enumerated solution set respecting all constraints, ambiguous case handled.

**If err:** No solutions in domain → verify eqn setup. Too many → check extraneous (e.g. squaring both sides). Always sub each candidate back into original.

### Step 5: Verify Numerically

Confirm by sub into original | independent computation.

1. **Sub each** into original + verify equality:

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

2. **Triangle**: verify w/ independent law:

```
Verify triangle: a=7, b=10, c=6.220, A=43.78, B=98.22, C=38
Check law of sines: a/sin(A) = 7/sin(43.78) = 7/0.6913 = 10.126
                    b/sin(B) = 10/sin(98.22) = 10/0.9897 = 10.104
                    c/sin(C) = 6.220/sin(38) = 6.220/0.6157 = 10.102
Ratios approximately equal (within rounding). VERIFIED.
Check angle sum: 43.78 + 98.22 + 38 = 180. VERIFIED.
```

3. **Identity proofs**: verify w/ specific value:

```
Verify identity: sin(2x) = 2*sin(x)*cos(x)
Let x = pi/3:
  LHS: sin(2*pi/3) = sin(120) = sqrt(3)/2
  RHS: 2*sin(pi/3)*cos(pi/3) = 2*(sqrt(3)/2)*(1/2) = sqrt(3)/2
  LHS = RHS. VERIFIED.
```

4. **Doc final** in requested format:

```
Solution: x in {pi/2, 7*pi/6, 11*pi/6} for x in [0, 2*pi).
```

**Got:** Every solution passes sub. Triangle passes both laws. Identity confirmed by ≥1 numerical test.

**If err:** Solution fails verify → extraneous. Remove + re-examine introducing step. Common: squaring (sign ambiguity), mult by potentially-zero expression, wrong quadrant for ref angle.

## Check

- [ ] Type + sub-type classified
- [ ] Strategy explicit named, matches type
- [ ] Each identity/law application labeled
- [ ] All algebraic steps shown (no logic jumps)
- [ ] Domain + range applied explicit
- [ ] Ambiguous case addressed (SSA)
- [ ] Every solution sub-verified
- [ ] Triangle cross-checked w/ independent law
- [ ] Final answer in requested format
- [ ] Angle units consistent (no mixing rad+deg)

## Traps

- **Lose solutions by dividing by trig fn**: Dividing both sides by sin(x) discards all sin(x)=0 solutions. Factor instead: sin(x)·f(x)=0, solve each factor.
- **Extraneous from squaring**: sin(x)=cos(x) → sin²=cos² has 2× solutions. Verify candidates vs original (unsquared).
- **Ignore ambiguous SSA**: 2 sides + non-included angle via law of sines → 0, 1, 2 valid triangles. Missing 2nd solution misses valid answers.
- **Mix angle units**: sin(30) in radian mode = sin(30 rad), not 30°. State unit at start, enforce throughout.
- **Wrong quadrant for ref angle**: sin(x)=-1/2 → Q3+Q4, NOT Q1+Q2. Check sign of fn vs quadrant before placing.
- **Forget periodicity**: Real-line has ∞ solutions. General sol → include "+2kπ" (or "+kπ" for tan). [0, 2π) → enumerate all in interval.

## →

- `construct-geometric-figure` — constructions need trig for angles + lengths
- `prove-geometric-theorem` — trig identities frequently as lemmas in geometric proofs
- `create-skill` — package new trig method as reusable skill
