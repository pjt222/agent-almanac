---
name: derive-theoretical-result
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Derive a theoretical result step-by-step from first principles or established
  theorems, with every step explicitly justified and special cases checked.
  Use when deriving a formula or theorem from first principles, proving a
  mathematical statement by logical deduction, re-deriving a textbook result
  for verification or adaptation, extending a known result to a more general
  setting, or producing a self-contained derivation for a paper or thesis.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: theoretical-science
  complexity: advanced
  language: natural
  tags: theoretical, derivation, proof, first-principles, mathematics, physics
---

# Derive Theoretical Result

Produce rigorous, step-by-step derivation of theoretical result starting from stated axioms, first principles, or established theorems. Every algebraic or logical step explicitly justified. Limiting cases verified. Final result presented with complete notation glossary.

## When Use

- Derive formula, relation, or theorem from first principles (e.g., derive Euler-Lagrange equation from action principle)
- Prove mathematical statement by logical deduction from axioms
- Re-derive textbook result to verify or adapt to modified context
- Extend known result to more general setting (e.g., from flat spacetime to curved spacetime)
- Produce self-contained derivation for paper, thesis, or technical report

## Inputs

- **Required**: Target result to derive (equation, inequality, theorem statement, or relation)
- **Required**: Starting point (axioms, postulates, previously established results, or Lagrangian/Hamiltonian)
- **Optional**: Preferred proof technique (direct, by contradiction, by induction, variational, constructive)
- **Optional**: Notation conventions to follow (if matching specific textbook or collaborator's conventions)
- **Optional**: Known intermediate results that may be cited without re-derivation

## Steps

### Step 1: State Starting Assumptions and Target Result

Write derivation's contract explicitly before any calculation:

1. **Axioms and postulates**: List every assumption derivation rests on. For physics, includes symmetry group, action principle, or postulates of quantum mechanics. For math, includes axiom system and any previously proven lemmas.
2. **Target result**: State result to be derived in precise mathematical notation. If result is equation, write both sides. If inequality, state direction and conditions for equality.
3. **Scope and restrictions**: State domain of validity (e.g., "valid for non-relativistic, spinless particles in three dimensions"). Identify what derivation does not cover.
4. **Notation declaration**: Define every symbol that will appear. Prevents ambiguity. Makes derivation self-contained.

```markdown
## Derivation Contract
- **Starting from**: [axioms, postulates, or established results]
- **Target**: [precise mathematical statement]
- **Domain of validity**: [restrictions and assumptions]
- **Notation**:
  - [symbol]: [meaning and units]
  - ...
```

**Got:** Complete, unambiguous statement of what is being derived from what. All notation defined upfront.

**If fail:** If target result ambiguous or starting assumptions incomplete, clarify before proceeding. Derivation with hidden assumptions unreliable.

### Step 2: Identify Required Mathematical Machinery

Survey tools needed and verify applicability:

1. **Algebraic techniques**: Identify required manipulations (tensor algebra, commutator algebra, matrix operations, series expansions). Verify structures satisfy prerequisites (e.g., convergence conditions for series, invertibility for matrix operations).
2. **Calculus and analysis**: Identify whether derivation requires ordinary or partial differentiation, integration (and over what domain), functional derivatives, contour integration, or distribution theory. Verify regularity conditions (differentiability, integrability, analyticity).
3. **Symmetry and group theory**: Identify representation-theoretic tools needed (irreducible representations, Clebsch-Gordan coefficients, character orthogonality, Wigner-Eckart theorem).
4. **Topology and geometry** (if applicable): Identify geometric structures (manifolds, fiber bundles, connections) and topological constraints (boundary terms, winding numbers, index theorems).
5. **Known identities and lemmas**: Collect specific identities to invoke (e.g., Jacobi identity, Bianchi identity, integration by parts, Stokes' theorem). State each explicitly so derivation cites by name.

```markdown
## Mathematical Toolkit
- **Algebra**: [techniques and prerequisites]
- **Analysis**: [calculus tools and regularity conditions]
- **Symmetry**: [group theory tools]
- **Identities to invoke**: [list with precise statements]
```

**Got:** Checklist of mathematical tools with applicability conditions verified for specific problem at hand.

**If fail:** If required tool has unverified prerequisites (e.g., term-by-term differentiation of series whose uniform convergence is unknown), flag as gap. Either prove prerequisite or state as additional assumption.

### Step 3: Execute Derivation with Step-by-Step Justification

Carry out derivation with every step labeled and justified:

1. **One operation per step**: Each numbered step performs exactly one algebraic or logical operation. Do not combine multiple manipulations into single step.
2. **Justification labels**: Tag each step with justification. Common labels:
   - `[by assumption]` -- invoking stated axiom or assumption
   - `[by definition]` -- using previously declared definition
   - `[by {identity name}]` -- applying named identity (e.g., "by Jacobi identity")
   - `[by Step N]` -- citing previous step in this derivation
   - `[by {theorem name}]` -- invoking external theorem (stated in Step 2)
3. **Intermediate checkpoints**: After every 5-10 steps, pause and verify:
   - Units/dimensions consistent on both sides
   - Known symmetries preserved
   - Expression has correct transformation properties
4. **Branch points**: If derivation branches (e.g., case analysis for degenerate vs. non-degenerate eigenvalues), treat each branch as labeled sub-derivation and merge results.

```markdown
## Derivation

**Step 1.** [Starting expression]
*Justification*: [by assumption / definition]

**Step 2.** [Result of operation on Step 1]
*Justification*: [specific reason]

...

**Checkpoint (after Step N).** Verify:
- Dimensions: [check]
- Symmetry: [check]

...

**Step M.** [Final expression = Target result]
*Justification*: [final operation]  QED
```

**Got:** Linear sequence of steps from starting point to target result. No gaps in logic. Every step independently verifiable.

**If fail:** If step does not follow from previous, derivation has gap. Either insert missing intermediate steps or identify additional assumption needed. Never skip step with "it can be shown that" unless omitted result is well-known identity listed in Step 2.

### Step 4: Check Limiting Cases and Special Values

Validate derived result against known physics or mathematics:

1. **Limiting cases**: Identify at least three limiting cases where result should reduce to something known:
   - Simpler, previously derived formula (e.g., non-relativistic limit of relativistic result)
   - Trivial case (e.g., setting coupling constant to zero)
   - Extreme parameter regime (e.g., high-temperature or low-temperature limit)

2. **Special values**: Substitute specific values of parameters where answer known independently (e.g., n=1 for hydrogen atom, d=3 for three-dimensional results).

3. **Symmetry checks**: Verify result transforms correctly under symmetry group. If result should be scalar, check invariant. If vector, check transformation law.

4. **Consistency with related results**: Check derived result consistent with other known results in same theory (e.g., Ward identities, sum rules, reciprocity relations).

```markdown
## Limiting Case Verification
| Case | Condition | Expected Result | Derived Result | Match |
|------|-----------|----------------|----------------|-------|
| [name] | [parameter limit] | [known result] | [substitution] | [Yes/No] |
| ... | ... | ... | ... | ... |
```

**Got:** All limiting cases and special values produce expected results. Derivation internally consistent.

**If fail:** Failed limiting case indicates error in derivation. Trace failure back by checking which step first produces expression failing limit. Common causes: incorrect sign, missing factor of 2 or pi, wrong combinatorial coefficient, or step where order of limits matters.

### Step 5: Present Complete Derivation with Notation Glossary

Assemble final, polished derivation:

1. **Narrative structure**: Write brief introductory paragraph stating physical or mathematical motivation, approach, main result.
2. **Derivation body**: Present steps from Step 3, cleaned up for readability. Group related steps into logical blocks with descriptive headings (e.g., "Expanding action to second order", "Applying stationary phase condition").
3. **Result box**: State final result in highlighted block, clearly separated from derivation.
4. **Notation glossary**: Compile every symbol used in derivation with meaning, units (if physical), first occurrence.
5. **Assumptions summary**: List all assumptions in single place, distinguishing fundamental postulates from technical assumptions (e.g., smoothness, convergence).

```markdown
## Final Result

> **Theorem/Result**: [precise statement with equation number]

## Notation Glossary
| Symbol | Meaning | Units | First appears |
|--------|---------|-------|---------------|
| [sym] | [meaning] | [units or dimensionless] | [Step N] |
| ... | ... | ... | ... |

## Assumptions
1. [Fundamental postulate 1]
2. [Technical assumption 1]
3. ...
```

**Got:** Self-contained document reader follows from start to finish without consulting external references, except for explicitly cited identities and theorems.

**If fail:** If derivation too long for single document (more than ~50 steps), break into lemmas. Derive each lemma separately, then assemble main result by citing lemmas.

## Checks

- [ ] All starting assumptions explicitly stated before first calculation step
- [ ] Every derivation step has labeled justification (no unjustified leaps)
- [ ] Units and dimensions consistent at every intermediate checkpoint
- [ ] At least three limiting cases checked and produce expected results
- [ ] Special values match independently known answers
- [ ] Result transforms correctly under stated symmetry group
- [ ] Notation glossary defines every symbol used
- [ ] Derivation complete: no steps deferred with "it can be shown"
- [ ] Domain of validity explicitly stated with final result

## Pitfalls

- **Hidden assumptions**: Assuming function analytic, series converges, or integral exists without stating. Every regularity condition is assumption and must be declared.
- **Sign errors**: Most common mechanical error. Verify signs at every step by tracking through substitutions. Cross-check against dimensional analysis (sign error often produces dimensionally inconsistent expression).
- **Dropped boundary terms**: When integrating by parts or applying Stokes' theorem, boundary terms vanish only if specific conditions met. State why they vanish (e.g., "because field decays faster than 1/r at infinity").
- **Order of limits**: Taking limits in wrong order gives different results (e.g., thermodynamic limit before zero-temperature limit). State order explicitly. Justify.
- **Circular reasoning**: Using result to be derived as intermediate step. Especially subtle when result is well-known formula that "seems obvious." Every step must follow from stated starting point, not from familiarity with answer.
- **Notation collisions**: Using same symbol for different quantities (e.g., 'E' for energy and for electric field). Notation glossary prevents this, but only if written before derivation rather than after.

## See Also

- `formulate-quantum-problem` -- formulate quantum mechanical framework before deriving results from it
- `survey-theoretical-literature` -- find prior derivations of same or related results for comparison
