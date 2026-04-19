---
name: construct-geometric-figure
locale: caveman
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

Produce ruler-and-compass construction for specified geometric figure. Document every step with Euclidean justification. Verify result vs original specification.

## When Use

- Given specific geometric elements (points, segments, angles) and asked to construct figure
- Tasked with producing classical Euclidean construction (bisectors, perpendiculars, tangents)
- Verifying whether figure is constructible with straightedge and compass alone
- Generating construction instructions for educational or doc purposes
- Converting geometric specification into ordered sequence of primitive operations

## Inputs

- **Required**: Description of target figure (e.g., "equilateral triangle with side length AB")
- **Required**: Given elements (points, segments, circles, angles as starting data)
- **Optional**: Output format (narrative prose, numbered steps, pseudocode, SVG coordinates)
- **Optional**: Level of justification detail (terse, standard, rigorous with theorem citations)
- **Optional**: Whether to include impossibility analysis if figure not constructible

## Steps

### Step 1: Identify Given Elements and Target Figure

Parse problem statement to extract:

1. **Given elements** -- list every point, segment, angle, circle, or length provided.
2. **Target figure** -- state precisely what must be constructed.
3. **Constraints** -- note additional conditions (congruence, parallelism, tangency, collinearity).

Express problem in standard form:

```
Given: Points A, B; segment AB; circle C1 centered at A with radius r.
Construct: Equilateral triangle ABC with AB as one side.
Constraints: C must lie on the same side of AB as point P (if specified).
```

Verify all referenced elements well-defined and consistent.

**Got:** Clear, unambiguous restatement of construction problem with every given element cataloged, target figure precisely described.

**If fail:** Problem statement ambiguous? List possible interpretations, request clarification. Given elements contradictory (e.g., triangle with side lengths 1, 1, 5)? State contradiction and halt.

### Step 2: Verify Constructibility

Determine whether target figure can be constructed using straightedge and compass alone.

1. **Check algebraic constraints.** Length is constructible if and only if it lies in field extension of rationals obtained by successive square roots. Construction requires cube roots or transcendental operations? Impossible.

2. **Known impossible constructions:**
   - Trisecting general angle
   - Doubling cube (constructing cube root of 2)
   - Squaring circle (constructing sqrt(pi))
   - Constructing regular n-gon when n not product of power of 2 and distinct Fermat primes

3. **Known constructible operations:**
   - Bisecting any angle or segment
   - Constructing perpendiculars, parallels
   - Transferring given length
   - Regular n-gons for n in {3, 4, 5, 6, 8, 10, 12, 15, 16, 17, 20, ...}
   - Any length expressible using +, -, *, /, and sqrt over given lengths

4. **Document verdict** with justification.

```
Constructibility analysis:
- Target: equilateral triangle on segment AB
- Required operations: circle-circle intersection (two arcs of radius AB)
- Algebraic degree: 2 (quadratic extension)
- Verdict: CONSTRUCTIBLE
```

**Got:** Definitive yes/no verdict on constructibility, with brief justification citing relevant algebraic or classical result.

**If fail:** Constructibility uncertain? Attempt to reduce problem to known constructible primitives. Figure provably non-constructible? Document impossibility proof, suggest closest constructible approximation or alternative method (e.g., neusis construction, origami).

### Step 3: Plan Construction Sequence

Decompose target figure into sequence of primitive construction operations.

1. **Identify primitives needed.** Every ruler-and-compass construction reduces to these atomic operations:
   - Draw line through two points
   - Draw circle with given center and radius (center + point on circumference)
   - Mark intersection of two lines
   - Mark intersection(s) of line and circle
   - Mark intersection(s) of two circles

2. **Order operations.** Each operation must reference only points that already exist (given or previously constructed). Build dependency graph:

```
Step 1: Draw circle C1 centered at A through B.       [uses: A, B]
Step 2: Draw circle C2 centered at B through A.       [uses: A, B]
Step 3: Mark intersections of C1 and C2 as P, Q.      [uses: C1, C2]
Step 4: Draw line through P and Q.                     [uses: P, Q]
```

3. **Minimize step count.** Look for opportunities to combine operations or reuse previously constructed elements.

4. **Annotate each step** with geometric purpose (e.g., "This constructs perpendicular bisector of AB").

**Got:** Ordered list of primitive operations where each step depends only on previously established elements, covering all parts of target figure.

**If fail:** Decomposition stalls? Identify which part of figure cannot be reached from current set of constructed points. Revisit Step 2 to confirm constructibility, or introduce auxiliary constructions (helper circles, midpoints, reflections) to bridge gap.

### Step 4: Execute Construction Steps with Justification

Write out each construction step in full, providing Euclidean justification.

For each primitive operation, document:

1. **Operation**: what drawn or marked.
2. **Inputs**: which existing elements used.
3. **Justification**: which Euclidean proposition, theorem, or property guarantees operation produces claimed result.
4. **Output**: what new elements created.

Format each step consistently:

```
Step 3: Mark intersections of C1 and C2 as P and Q.
  - Operation: Circle-circle intersection
  - Inputs: C1 (center A, radius AB), C2 (center B, radius BA)
  - Justification: Two circles with equal radii whose centers are separated
    by less than the sum of their radii intersect in exactly two points,
    symmetric about the line of centers (Euclid I.1).
  - Output: Points P and Q, where AP = BP = AB (equilateral property).
```

Continue until target figure fully constructed. For complex figures, group related steps into phases (e.g., "Phase 1: Construct auxiliary perpendicular bisector", "Phase 2: Locate incenter").

**Got:** Complete sequence of justified construction steps that, when executed in order, produce target figure. Every new point, line, circle accounted for.

**If fail:** Justification cannot be provided for step? Step may be invalid. Verify geometric claim independently. Common errors: assuming two circles intersect when they do not (check distance between centers vs. sum/difference of radii), or assuming point lies on line without proof.

### Step 5: Verify Construction Meets Specification

Confirm constructed figure satisfies all original requirements.

1. **Check each constraint** from Step 1 vs constructed figure:
   - Congruence: verify equal lengths or angles using construction.
   - Parallelism/perpendicularity: confirm using construction method (e.g., perpendicular bisector guarantees 90 degrees).
   - Incidence: verify required points lie on required lines or circles.

2. **Count degrees of freedom.** Constructed figure should have exactly number of free parameters implied by specification. Extra degrees of freedom? Specification under-determined. None and construction fails? Specification over-determined or contradictory.

3. **Test with specific coordinates** (optional but recommended for complex constructions):

```
Verification with coordinates:
Let A = (0, 0), B = (1, 0).
C1: x^2 + y^2 = 1
C2: (x-1)^2 + y^2 = 1
Intersection: x = 1/2, y = sqrt(3)/2
Triangle ABC: sides AB = BC = CA = 1. VERIFIED.
```

4. **Document verification result** with clear pass/fail for each constraint.

**Got:** Every constraint from original specification verified, construction confirmed correct. Coordinate check (when performed) matches geometric argument.

**If fail:** Constraint fails? Trace back through construction to find erroneous step. Common causes: incorrect intersection choice (wrong branch of circle-line intersection), sign error in coordinate verification, or missing auxiliary construction.

## Checks

- [ ] Problem statement restated in standard Given/Construct/Constraints form
- [ ] Constructibility analysis present with clear verdict, justification
- [ ] Every construction step uses only previously established elements
- [ ] Every step includes operation, inputs, justification, output
- [ ] Justification cites relevant geometric principle (Euclid, theorem name, or property)
- [ ] Target figure fully constructed (no missing components)
- [ ] All original constraints verified vs completed construction
- [ ] No step relies on measurement, approximation, or non-constructible operations
- [ ] Step count reasonable for complexity of figure

## Pitfalls

- **Assuming intersection exists**: Two circles only intersect if distance between centers between |r1 - r2| and r1 + r2. Always verify condition before marking intersection points. Forgetting check leads to constructions that work on paper but fail geometrically.

- **Wrong intersection branch**: Circle-circle and line-circle intersections yield two points. Construction must specify which one to use (e.g., "intersection on same side of AB as point P"). Ambiguous intersection choices produce two valid but different figures.

- **Conflating construction with measurement**: Ruler-and-compass construction does not allow measuring lengths or angles. Cannot "measure segment AB, then mark off same length." Instead, use compass to transfer radius by drawing circle centered at new point through old endpoint.

- **Skipping constructibility check**: Attempting to trisect general angle or construct regular heptagon wastes effort. Always verify constructibility before beginning construction sequence.

- **Over-complicated sequences**: Many constructions have elegant short solutions. Construction exceeds 15 primitive steps for standard figure? Look for simpler approach. Classic sources (Euclid, Hartshorne) often provide minimal constructions.

- **Implicit auxiliary elements**: Failing to document helper constructions (e.g., "extend line AB to point D") makes sequence impossible to follow. Every element used must be explicitly constructed.

## See Also

- `solve-trigonometric-problem` - trigonometric analysis often motivates or verifies constructions
- `prove-geometric-theorem` - constructions frequently appear as steps within geometric proofs
- `create-skill` - follow when packaging new construction as reusable skill
