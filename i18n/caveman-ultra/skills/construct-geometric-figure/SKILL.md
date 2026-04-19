---
name: construct-geometric-figure
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Perform a ruler-and-compass construction with step-by-step justification
  for each operation, producing a constructible geometric figure from given
  elements. Covers classical Euclidean constructions including perpendicular
  bisectors, angle bisectors, parallel lines, regular polygons, and
  tangent lines. Use when given geometric elements (points, segments, angles)
  and asked to produce a Euclidean construction, verify constructibility,
  or generate ordered construction steps for educational or documentation
  purposes.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: geometry
  complexity: intermediate
  language: multi
  tags: geometry, construction, ruler-compass, euclidean, straightedge
---

# Construct a Geometric Figure

Produce ruler-and-compass construction for specified figure → doc every step w/ Euclidean justification + valid. result vs. original spec.

## Use When

- Given specific geometric elements (points, segments, angles) + asked to construct figure
- Tasked w/ producing classical Euclidean construction (bisectors, perpendiculars, tangents)
- Valid. whether figure constructible w/ straightedge + compass alone
- Gen construction instructions for ed / docs
- Convert geometric spec → ordered seq of primitive ops

## In

- **Required**: Desc of target figure (e.g., "equilateral triangle w/ side length AB")
- **Required**: Given elements (points, segments, circles, angles as starting data)
- **Optional**: Out format (narrative prose, numbered steps, pseudocode, SVG coords)
- **Optional**: Justification detail level (terse, standard, rigorous w/ theorem citations)
- **Optional**: Include impossibility analysis if not constructible

## Do

### Step 1: Identify Given Elements + Target Figure

Parse problem statement → extract:

1. **Given elements** -- list every point, segment, angle, circle, length provided.
2. **Target figure** -- state precisely what must be constructed.
3. **Constraints** -- note additional conditions (congruence, parallelism, tangency, collinearity).

Express problem in standard form:

```
Given: Points A, B; segment AB; circle C1 centered at A with radius r.
Construct: Equilateral triangle ABC with AB as one side.
Constraints: C must lie on the same side of AB as point P (if specified).
```

Valid. all ref'd elements well-defined + consistent.

**→** Clear, unambiguous restatement of construction problem w/ every given element cataloged + target figure precisely described.

**If err:** Problem statement ambiguous → list possible interpretations + req clarification. Given elements contradictory (e.g., triangle w/ side lengths 1, 1, 5) → state contradiction + halt.

### Step 2: Verify Constructibility

Determine whether target can be constructed w/ straightedge + compass alone.

1. **Check algebraic constraints.** Length constructible iff lies in field extension of rationals obtained by successive sqrt. Requires cube roots / transcendental ops → impossible.

2. **Known impossible constructions:**
   - Trisecting general angle
   - Doubling cube (constructing cube root of 2)
   - Squaring circle (constructing sqrt(pi))
   - Regular n-gon when n ≠ product of power of 2 + distinct Fermat primes

3. **Known constructible ops:**
   - Bisecting any angle / segment
   - Constructing perpendiculars + parallels
   - Transferring given length
   - Regular n-gons for n in {3, 4, 5, 6, 8, 10, 12, 15, 16, 17, 20, ...}
   - Any length expressible using +, -, *, /, sqrt over given lengths

4. **Doc verdict** w/ justification.

```
Constructibility analysis:
- Target: equilateral triangle on segment AB
- Required operations: circle-circle intersection (two arcs of radius AB)
- Algebraic degree: 2 (quadratic extension)
- Verdict: CONSTRUCTIBLE
```

**→** Definitive yes/no verdict on constructibility, w/ brief justification citing relevant algebraic / classical result.

**If err:** Constructibility uncertain → reduce problem to known constructible primitives. Provably non-constructible → doc impossibility proof + suggest closest constructible approximation or alt method (e.g., neusis construction, origami).

### Step 3: Plan Construction Sequence

Decompose target figure → seq of primitive ops.

1. **Identify primitives needed.** Every ruler-and-compass reduces to these atomic ops:
   - Draw line through two points
   - Draw circle w/ given center + radius (center + point on circumference)
   - Mark intersection of two lines
   - Mark intersection(s) of line + circle
   - Mark intersection(s) of two circles

2. **Order ops.** Each op must ref only points already existing (given or prev constructed). Build dep graph:

```
Step 1: Draw circle C1 centered at A through B.       [uses: A, B]
Step 2: Draw circle C2 centered at B through A.       [uses: A, B]
Step 3: Mark intersections of C1 and C2 as P, Q.      [uses: C1, C2]
Step 4: Draw line through P and Q.                     [uses: P, Q]
```

3. **Minimize step count.** Look for opportunities to combine ops or reuse prev constructed elements.

4. **Annotate each step** w/ geometric purpose (e.g., "This constructs perpendicular bisector of AB").

**→** Ordered list of primitive ops where each step depends only on prev est'd elements, covering all parts of target.

**If err:** Decomp stalls → ID which part of figure can't be reached from current set of constructed points. Revisit Step 2 to confirm constructibility, or introduce auxiliary constructions (helper circles, midpoints, reflections) to bridge gap.

### Step 4: Execute Construction Steps w/ Justification

Write each construction step in full, providing Euclidean justification.

Each primitive op → doc:

1. **Op**: what is drawn / marked.
2. **Ins**: which existing elements used.
3. **Justification**: which Euclidean proposition / theorem / property guarantees op produces claimed result.
4. **Out**: what new elements created.

Format each step consistent:

```
Step 3: Mark intersections of C1 and C2 as P and Q.
  - Operation: Circle-circle intersection
  - Inputs: C1 (center A, radius AB), C2 (center B, radius BA)
  - Justification: Two circles with equal radii whose centers are separated
    by less than the sum of their radii intersect in exactly two points,
    symmetric about the line of centers (Euclid I.1).
  - Output: Points P and Q, where AP = BP = AB (equilateral property).
```

Continue until target fully constructed. Complex figures → group related steps into phases (e.g., "Phase 1: Construct auxiliary perpendicular bisector", "Phase 2: Locate incenter").

**→** Complete seq of justified construction steps that, executed in order, produce target. Every new point, line, circle accounted for.

**If err:** Can't provide justification for step → step may be invalid. Valid. geometric claim independently. Common errs: assuming two circles intersect when they don't (check distance between centers vs. sum/diff of radii), or assuming point lies on line w/o proof.

### Step 5: Verify Construction Meets Specification

Confirm constructed figure satisfies all original reqs.

1. **Check each constraint** from Step 1 vs. constructed figure:
   - Congruence: verify equal lengths / angles via construction.
   - Parallelism/perpendicularity: confirm via construction method (e.g., perpendicular bisector guarantees 90 deg).
   - Incidence: verify req'd points lie on req'd lines / circles.

2. **Count degrees of freedom.** Constructed figure should have exactly number of free params implied by spec. Extra dof → spec under-determined. None + construction fails → spec over-determined / contradictory.

3. **Test w/ specific coords** (optional but rec'd for complex constructions):

```
Verification with coordinates:
Let A = (0, 0), B = (1, 0).
C1: x^2 + y^2 = 1
C2: (x-1)^2 + y^2 = 1
Intersection: x = 1/2, y = sqrt(3)/2
Triangle ABC: sides AB = BC = CA = 1. VERIFIED.
```

4. **Doc verification result** w/ clear pass/fail each constraint.

**→** Every constraint from original spec verified, construction confirmed correct. Coord check (when done) matches geometric argument.

**If err:** Constraint fails → trace back through construction → find erroneous step. Common causes: incorrect intersection choice (wrong branch of circle-line intersection), sign err in coord verification, or missing auxiliary construction.

## Check

- [ ] Problem restated in standard Given/Construct/Constraints form
- [ ] Constructibility analysis w/ clear verdict + justification
- [ ] Every construction step uses only prev est'd elements
- [ ] Every step includes op, ins, justification, out
- [ ] Justification cites relevant geometric principle (Euclid, theorem name, property)
- [ ] Target fully constructed (no missing components)
- [ ] All original constraints verified vs. completed construction
- [ ] No step relies on measurement, approximation, or non-constructible ops
- [ ] Step count reasonable for figure complexity

## Traps

- **Assume intersection exists**: Two circles only intersect if distance between centers between |r1 - r2| + r1 + r2. Always valid. this before marking intersection points. Forgetting → constructions work on paper but fail geometrically.

- **Wrong intersection branch**: Circle-circle + line-circle intersections yield two points. Construction must specify which to use (e.g., "intersection on same side of AB as point P"). Ambiguous intersection choices → two valid but diff figures.

- **Conflate construction w/ measurement**: Ruler-and-compass doesn't allow measuring lengths / angles. Can't "measure segment AB, mark off same length." Use compass to transfer radius by drawing circle centered at new point through old endpoint.

- **Skip constructibility check**: Attempting to trisect general angle or construct regular heptagon wastes effort. Always valid. constructibility before beginning construction seq.

- **Over-complicated seqs**: Many constructions have elegant short solutions. Construction exceeds 15 primitive steps for standard figure → look for simpler approach. Classic sources (Euclid, Hartshorne) often provide minimal constructions.

- **Implicit auxiliary elements**: Failing to doc helper constructions (e.g., "extend line AB to point D") makes seq impossible to follow. Every element used must be explicit constructed.

## →

- `solve-trigonometric-problem` - trig analysis often motivates / verifies constructions
- `prove-geometric-theorem` - constructions frequently appear as steps in geometric proofs
- `create-skill` - follow when packaging new construction as reusable skill
