---
name: construct-geometric-figure
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

Produce a ruler-and-compass construction for a specified geometric figure, documenting every step with its Euclidean justification and verifying the result against the original specification.

## When to Use

- Given specific geometric elements (points, segments, angles) and asked to construct a figure
- Tasked with producing a classical Euclidean construction (bisectors, perpendiculars, tangents)
- Verifying whether a figure is constructible with straightedge and compass alone
- Generating construction instructions for educational or documentation purposes
- Converting a geometric specification into an ordered sequence of primitive operations

## Inputs

- **Required**: Description of the target figure (e.g., "equilateral triangle with side length AB")
- **Required**: Given elements (points, segments, circles, angles provided as starting data)
- **Optional**: Output format (narrative prose, numbered steps, pseudocode, SVG coordinates)
- **Optional**: Level of justification detail (terse, standard, rigorous with theorem citations)
- **Optional**: Whether to include impossibility analysis if figure is not constructible

## Procedure

### Step 1: Identify Given Elements and Target Figure

Parse the problem statement to extract:

1. **Given elements** -- list every point, segment, angle, circle, or length provided.
2. **Target figure** -- state precisely what must be constructed.
3. **Constraints** -- note any additional conditions (congruence, parallelism, tangency, collinearity).

Express the problem in standard form:

```
Given: Points A, B; segment AB; circle C1 centered at A with radius r.
Construct: Equilateral triangle ABC with AB as one side.
Constraints: C must lie on the same side of AB as point P (if specified).
```

Verify that all referenced elements are well-defined and consistent.

**Expected:** A clear, unambiguous restatement of the construction problem with every given element cataloged and the target figure precisely described.

**On failure:** If the problem statement is ambiguous, list the possible interpretations and request clarification. If given elements are contradictory (e.g., a triangle with side lengths 1, 1, 5), state the contradiction and halt.

### Step 2: Verify Constructibility

Determine whether the target figure can be constructed using straightedge and compass alone.

1. **Check algebraic constraints.** A length is constructible if and only if it lies in a field extension of the rationals obtained by successive square roots. If the construction requires cube roots or transcendental operations, it is impossible.

2. **Known impossible constructions:**
   - Trisecting a general angle
   - Doubling the cube (constructing cube root of 2)
   - Squaring the circle (constructing sqrt(pi))
   - Constructing a regular n-gon when n is not a product of a power of 2 and distinct Fermat primes

3. **Known constructible operations:**
   - Bisecting any angle or segment
   - Constructing perpendiculars and parallels
   - Transferring a given length
   - Regular n-gons for n in {3, 4, 5, 6, 8, 10, 12, 15, 16, 17, 20, ...}
   - Any length expressible using +, -, *, /, and sqrt over the given lengths

4. **Document the verdict** with justification.

```
Constructibility analysis:
- Target: equilateral triangle on segment AB
- Required operations: circle-circle intersection (two arcs of radius AB)
- Algebraic degree: 2 (quadratic extension)
- Verdict: CONSTRUCTIBLE
```

**Expected:** A definitive yes/no verdict on constructibility, with a brief justification citing the relevant algebraic or classical result.

**On failure:** If constructibility is uncertain, attempt to reduce the problem to known constructible primitives. If the figure is provably non-constructible, document the impossibility proof and suggest the closest constructible approximation or an alternative method (e.g., neusis construction, origami).

### Step 3: Plan Construction Sequence

Decompose the target figure into a sequence of primitive construction operations.

1. **Identify primitives needed.** Every ruler-and-compass construction reduces to these atomic operations:
   - Draw a line through two points
   - Draw a circle with a given center and radius (center + point on circumference)
   - Mark the intersection of two lines
   - Mark the intersection(s) of a line and a circle
   - Mark the intersection(s) of two circles

2. **Order the operations.** Each operation must reference only points that already exist (given or previously constructed). Build a dependency graph:

```
Step 1: Draw circle C1 centered at A through B.       [uses: A, B]
Step 2: Draw circle C2 centered at B through A.       [uses: A, B]
Step 3: Mark intersections of C1 and C2 as P, Q.      [uses: C1, C2]
Step 4: Draw line through P and Q.                     [uses: P, Q]
```

3. **Minimize step count.** Look for opportunities to combine operations or reuse previously constructed elements.

4. **Annotate each step** with its geometric purpose (e.g., "This constructs the perpendicular bisector of AB").

**Expected:** An ordered list of primitive operations where each step depends only on previously established elements, covering all parts of the target figure.

**On failure:** If the decomposition stalls, identify which part of the figure cannot be reached from the current set of constructed points. Revisit Step 2 to confirm constructibility, or introduce auxiliary constructions (helper circles, midpoints, reflections) to bridge the gap.

### Step 4: Execute Construction Steps with Justification

Write out each construction step in full, providing the Euclidean justification.

For each primitive operation, document:

1. **The operation**: what is drawn or marked.
2. **The inputs**: which existing elements are used.
3. **The justification**: which Euclidean proposition, theorem, or property guarantees the operation produces the claimed result.
4. **The output**: what new elements are created.

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

Continue until the target figure is fully constructed. For complex figures, group related steps into phases (e.g., "Phase 1: Construct auxiliary perpendicular bisector", "Phase 2: Locate incenter").

**Expected:** A complete sequence of justified construction steps that, when executed in order, produce the target figure. Every new point, line, or circle is accounted for.

**On failure:** If a justification cannot be provided for a step, the step may be invalid. Verify the geometric claim independently. Common errors include assuming two circles intersect when they do not (check distance between centers vs. sum/difference of radii), or assuming a point lies on a line without proof.

### Step 5: Verify Construction Meets Specification

Confirm that the constructed figure satisfies all original requirements.

1. **Check each constraint** from Step 1 against the constructed figure:
   - Congruence: verify equal lengths or angles using the construction.
   - Parallelism/perpendicularity: confirm using the construction method (e.g., perpendicular bisector guarantees 90 degrees).
   - Incidence: verify that required points lie on required lines or circles.

2. **Count degrees of freedom.** The constructed figure should have exactly the number of free parameters implied by the specification. If there are extra degrees of freedom, the specification was under-determined. If there are none and the construction fails, the specification was over-determined or contradictory.

3. **Test with specific coordinates** (optional but recommended for complex constructions):

```
Verification with coordinates:
Let A = (0, 0), B = (1, 0).
C1: x^2 + y^2 = 1
C2: (x-1)^2 + y^2 = 1
Intersection: x = 1/2, y = sqrt(3)/2
Triangle ABC: sides AB = BC = CA = 1. VERIFIED.
```

4. **Document the verification result** with a clear pass/fail for each constraint.

**Expected:** Every constraint from the original specification is verified, and the construction is confirmed correct. A coordinate check (when performed) matches the geometric argument.

**On failure:** If a constraint fails, trace back through the construction to find the erroneous step. Common causes: incorrect intersection choice (wrong branch of a circle-line intersection), sign error in coordinate verification, or a missing auxiliary construction.

## Validation

- [ ] Problem statement is restated in standard Given/Construct/Constraints form
- [ ] Constructibility analysis is present with a clear verdict and justification
- [ ] Every construction step uses only previously established elements
- [ ] Every step includes operation, inputs, justification, and output
- [ ] The justification cites a relevant geometric principle (Euclid, theorem name, or property)
- [ ] The target figure is fully constructed (no missing components)
- [ ] All original constraints are verified against the completed construction
- [ ] No step relies on measurement, approximation, or non-constructible operations
- [ ] Step count is reasonable for the complexity of the figure

## Common Pitfalls

- **Assuming intersection exists**: Two circles only intersect if the distance between centers is between |r1 - r2| and r1 + r2. Always verify this condition before marking intersection points. Forgetting this check leads to constructions that work on paper but fail geometrically.

- **Wrong intersection branch**: Circle-circle and line-circle intersections yield two points. The construction must specify which one to use (e.g., "the intersection on the same side of AB as point P"). Ambiguous intersection choices produce two valid but different figures.

- **Conflating construction with measurement**: Ruler-and-compass construction does not allow measuring lengths or angles. You cannot "measure segment AB, then mark off the same length." Instead, use the compass to transfer the radius by drawing a circle centered at the new point through the old endpoint.

- **Skipping constructibility check**: Attempting to trisect a general angle or construct a regular heptagon wastes effort. Always verify constructibility before beginning the construction sequence.

- **Over-complicated sequences**: Many constructions have elegant short solutions. If your construction exceeds 15 primitive steps for a standard figure, look for a simpler approach. Classic sources (Euclid, Hartshorne) often provide minimal constructions.

- **Implicit auxiliary elements**: Failing to document helper constructions (e.g., "extend line AB to point D") makes the sequence impossible to follow. Every element used must be explicitly constructed.

## Related Skills

- `solve-trigonometric-problem` - trigonometric analysis often motivates or verifies constructions
- `prove-geometric-theorem` - constructions frequently appear as steps within geometric proofs
- `create-skill` - follow when packaging a new construction as a reusable skill
