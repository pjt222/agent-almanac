---
name: derive-theoretical-result
description: >
  Derive a theoretical result step-by-step from first principles or established
  theorems, with every step explicitly justified and special cases checked.
  Verwenden wenn deriving a formula or theorem from first principles, proving a
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
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Theoretisches Ergebnis ableiten

Erzeugen a rigorous, step-by-step derivation of a theoretical result starting from stated axioms, first principles, or established theorems. Every algebraic or logical step is explicitly justified, limiting cases are verified, and the final result is presented with a complete notation glossary.

## Wann verwenden

- Deriving a formula, relation, or theorem from first principles (e.g., deriving the Euler-Lagrange equation from the action principle)
- Proving a mathematical statement by logical deduction from axioms
- Re-deriving a textbook result to verify it or adapt it to a modified context
- Extending a known result to a more general setting (e.g., from flat spacetime to curved spacetime)
- Producing a self-contained derivation for a paper, thesis, or technical report

## Eingaben

- **Erforderlich**: Target result to derive (equation, inequality, theorem statement, or relation)
- **Erforderlich**: Starting point (axioms, postulates, zuvor established results, or Lagrangian/Hamiltonian)
- **Optional**: Preferred proof technique (direct, by contradiction, by induction, variational, constructive)
- **Optional**: Notation conventions to follow (if matching a specific textbook or collaborator's conventions)
- **Optional**: Known intermediate results that kann cited ohne re-derivation

## Vorgehensweise

### Schritt 1: State Starting Assumptions and Target Result

Schreiben the derivation's contract explicitly vor any calculation:

1. **Axioms and postulates**: Auflisten every assumption the derivation rests on. For physics, this includes the symmetry group, the action principle, or the postulates of quantum mechanics. For mathematics, this includes the axiom system and any zuvor proven lemmas.
2. **Target result**: State das Ergebnis to be derived in precise mathematical notation. If das Ergebnis is an equation, write both sides. If it is an inequality, state the direction and the conditions for equality.
3. **Scope and restrictions**: State the domain of validity (e.g., "valid for non-relativistic, spinless particles in three dimensions"). Identifizieren what the derivation nicht cover.
4. **Notation declaration**: Definieren every symbol that will appear. This prevents ambiguity and makes the derivation self-contained.

```markdown
## Derivation Contract
- **Starting from**: [axioms, postulates, or established results]
- **Target**: [precise mathematical statement]
- **Domain of validity**: [restrictions and assumptions]
- **Notation**:
  - [symbol]: [meaning and units]
  - ...
```

**Erwartet:** A complete, unambiguous statement of what is being derived from what, with all notation defined upfront.

**Bei Fehler:** If das Ziel result is ambiguous or the starting assumptions are incomplete, clarify vor proceeding. A derivation with hidden assumptions is unreliable.

### Schritt 2: Identifizieren Required Mathematical Machinery

Survey the tools needed and verify their applicability:

1. **Algebraic techniques**: Identifizieren required manipulations (tensor algebra, commutator algebra, matrix operations, series expansions). Sicherstellen, dass the structures involved satisfy the prerequisites (e.g., convergence conditions for series, invertibility for matrix operations).
2. **Calculus and analysis**: Identifizieren whether the derivation requires ordinary or partial differentiation, integration (and over what domain), functional derivatives, contour integration, or distribution theory. Verifizieren regularity conditions (differentiability, integrability, analyticity).
3. **Symmetry and group theory**: Identifizieren representation-theoretic tools needed (irreducible representations, Clebsch-Gordan coefficients, character orthogonality, Wigner-Eckart theorem).
4. **Topology and geometry** (if applicable): Identifizieren geometric structures (manifolds, fiber bundles, connections) and topological constraints (boundary terms, winding numbers, index theorems).
5. **Known identities and lemmas**: Sammeln the specific identities that wird invoked (e.g., Jacobi identity, Bianchi identity, integration by parts, Stokes' theorem). State each one explicitly so the derivation can cite them by name.

```markdown
## Mathematical Toolkit
- **Algebra**: [techniques and prerequisites]
- **Analysis**: [calculus tools and regularity conditions]
- **Symmetry**: [group theory tools]
- **Identities to invoke**: [list with precise statements]
```

**Erwartet:** A checklist of mathematical tools with their applicability conditions verified for the specific problem at hand.

**Bei Fehler:** If a required tool has unverified prerequisites (e.g., term-by-term differentiation of a series whose uniform convergence is unknown), flag it as a gap. Either prove the prerequisite or state it as an additional assumption.

### Schritt 3: Ausfuehren Derivation with Step-by-Step Justification

Carry out the derivation with every step labeled and justified:

1. **One operation per step**: Each numbered step performs exactly one algebraic or logical operation. Do not combine multiple manipulations into a single step.
2. **Justification labels**: Tag each step with its justification. Common labels:
   - `[by assumption]` -- invoking a stated axiom or assumption
   - `[by definition]` -- using a zuvor declared definition
   - `[by {identity name}]` -- applying a named identity (e.g., "by Jacobi identity")
   - `[by Step N]` -- citing a previous step in this derivation
   - `[by {theorem name}]` -- invoking an external theorem (stated in Step 2)
3. **Intermediate checkpoints**: After every 5-10 steps, pause and verify:
   - Units/dimensions are consistent on both sides
   - Known symmetries are preserved
   - The expression has the correct transformation properties
4. **Branch points**: If the derivation branches (e.g., case analysis for degenerate vs. non-degenerate eigenvalues), treat each branch as a labeled sub-derivation and merge das Ergebniss.

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

**Erwartet:** A linear sequence of steps from the starting point to das Ziel result, with no gaps in logic. Every step is independently verifiable.

**Bei Fehler:** If a step nicht follow from the previous one, the derivation has a gap. Either insert the missing intermediate steps or identify the additional assumption needed. Never skip a step with "it kann shown that" unless the omitted result is a well-known identity listed in Step 2.

### Schritt 4: Check Limiting Cases and Special Values

Validieren the derived result gegen known physics or mathematics:

1. **Limiting cases**: Identifizieren mindestens three limiting cases where das Ergebnis should reduce to something known:
   - A simpler, zuvor derived formula (e.g., non-relativistic limit of a relativistic result)
   - A trivial case (e.g., setting a coupling constant to zero)
   - An extreme parameter regime (e.g., high-temperature or low-temperature limit)

2. **Special values**: Substitute specific values of parameters where the answer is known independently (e.g., n=1 for the hydrogen atom, d=3 for three-dimensional results).

3. **Symmetry checks**: Sicherstellen, dass das Ergebnis transforms korrekt under the symmetry group. If das Ergebnis sollte a scalar, check that it is invariant. If it sollte a vector, check its transformation law.

4. **Consistency with related results**: Pruefen, dass the derived result is consistent with other known results in the same theory (e.g., Ward identities, sum rules, reciprocity relations).

```markdown
## Limiting Case Verification
| Case | Condition | Expected Result | Derived Result | Match |
|------|-----------|----------------|----------------|-------|
| [name] | [parameter limit] | [known result] | [substitution] | [Yes/No] |
| ... | ... | ... | ... | ... |
```

**Erwartet:** All limiting cases and special values produce the expected results. The derivation is internally consistent.

**Bei Fehler:** A failed limiting case indicates an error in the derivation. Trace the failure back by checking which step first produces an expression that fails the limit. Common causes: incorrect sign, missing factor of 2 or pi, wrong combinatorial coefficient, or a step where an order of limits matters.

### Schritt 5: Present Abschliessen Derivation with Notation Glossary

Assemble the final, polished derivation:

1. **Narrative structure**: Schreiben a brief introductory paragraph stating the physical or mathematical motivation, der Ansatz, and the main result.
2. **Derivation body**: Present the steps from Step 3, cleaned up for readability. Group related steps into logical blocks with descriptive headings (e.g., "Expanding the action to second order", "Applying the stationary phase condition").
3. **Result box**: State the final result in a highlighted block, clearly separated from the derivation.
4. **Notation glossary**: Compile every symbol used in the derivation with its meaning, units (if physical), and first occurrence.
5. **Assumptions summary**: Auflisten all assumptions in a single place, distinguishing fundamental postulates from technical assumptions (e.g., smoothness, convergence).

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

**Erwartet:** A self-contained document that a reader can follow from start to finish ohne consulting external references, except for the explicitly cited identities and theorems.

**Bei Fehler:** If the derivation is too long for a single document (more than ~50 steps), break it into lemmas. Derive each lemma separately, then assemble the main result by citing the lemmas.

## Validierung

- [ ] All starting assumptions are explicitly stated vor the first calculation step
- [ ] Every derivation step has a labeled justification (no unjustified leaps)
- [ ] Units and dimensions are consistent at every intermediate checkpoint
- [ ] At least three limiting cases are checked and produce expected results
- [ ] Special values match independently known answers
- [ ] The result transforms korrekt under der Zustandd symmetry group
- [ ] A notation glossary defines every symbol used
- [ ] The derivation is complete: no steps are deferred with "it kann shown"
- [ ] The domain of validity is explicitly stated with the final result

## Haeufige Stolperfallen

- **Hidden assumptions**: Assuming a function is analytic, a series converges, or an integral exists ohne stating it. Every regularity condition is an assumption and muss declared.
- **Sign errors**: The most common mechanical error. Verifizieren signs at every step by tracking them durch substitutions. Cross-check gegen dimensional analysis (a sign error often produces a dimensionally inconsistent expression).
- **Dropped boundary terms**: When integrating by parts or applying Stokes' theorem, boundary terms vanish only if specific conditions are met. State why they vanish (e.g., "because das Feld decays faster than 1/r at infinity").
- **Order of limits**: Taking limits in the wrong order can give different results (e.g., thermodynamic limit vor zero-temperature limit). State the order explicitly and justify it.
- **Circular reasoning**: Using das Ergebnis to be derived as an intermediate step. This is besonders subtle when das Ergebnis is a well-known formula that "seems obvious." Every step must follow from der Zustandd starting point, not from familiarity with the answer.
- **Notation collisions**: Using the same symbol for different quantities (e.g., 'E' for energy and for electric field). The notation glossary prevents this, but only if it is written vor the derivation anstatt nach.

## Verwandte Skills

- `formulate-quantum-problem` -- formulate the quantum mechanical framework vor deriving results from it
- `survey-theoretical-literature` -- find prior derivations of the same or related results for comparison
