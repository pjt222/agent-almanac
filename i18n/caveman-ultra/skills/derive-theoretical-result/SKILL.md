---
name: derive-theoretical-result
locale: caveman-ultra
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

Rigorous step-by-step derivation from axioms/first principles/theorems. Every step justified. Limiting cases checked. Final result + notation glossary.

## Use When

- Formula/theorem from first principles (e.g., Euler-Lagrange from action)
- Math proof by logic from axioms
- Re-derive textbook → verify/adapt
- Extend known → more general (flat → curved spacetime)
- Self-contained → paper/thesis/report

## In

- **Required**: Target result (equation, inequality, theorem, relation)
- **Required**: Starting point (axioms, postulates, prior results, Lagrangian/Hamiltonian)
- **Optional**: Proof technique (direct, contradiction, induction, variational, constructive)
- **Optional**: Notation conventions
- **Optional**: Known intermediate results citable w/o re-deriving

## Do

### Step 1: State assumptions + target

Contract before calc:

1. **Axioms + postulates**: Every assumption listed. Physics: symmetry group, action principle, QM postulates. Math: axiom sys + prior lemmas.
2. **Target**: Precise notation. Equation → both sides. Inequality → direction + equality conds.
3. **Scope**: Domain of validity (e.g., "non-relativistic, spinless, 3D"). State what not covered.
4. **Notation**: Define every symbol. Self-contained.

```markdown
## Derivation Contract
- **Starting from**: [axioms, postulates, or established results]
- **Target**: [precise mathematical statement]
- **Domain of validity**: [restrictions and assumptions]
- **Notation**:
  - [symbol]: [meaning and units]
  - ...
```

→ Complete unambiguous statement. Notation up front.

If err: Target ambiguous/assumptions incomplete → clarify before proceed. Hidden assumptions → unreliable.

### Step 2: Math toolkit

Tools + applicability:

1. **Algebra**: Tensor, commutator, matrix, series. Verify prereqs (convergence, invertibility).
2. **Calc/analysis**: ODE/PDE, integration + domain, functional derivs, contour, distributions. Verify regularity (differentiability, integrability, analyticity).
3. **Symmetry/group theory**: Irreps, Clebsch-Gordan, character orthogonality, Wigner-Eckart.
4. **Topology/geometry** (if applicable): Manifolds, bundles, connections + topo constraints (boundary terms, winding, index).
5. **Identities/lemmas**: Specific ones invoked (Jacobi, Bianchi, integration by parts, Stokes). State explicitly, cite by name.

```markdown
## Mathematical Toolkit
- **Algebra**: [techniques and prerequisites]
- **Analysis**: [calculus tools and regularity conditions]
- **Symmetry**: [group theory tools]
- **Identities to invoke**: [list with precise statements]
```

→ Checklist w/ applicability verified.

If err: Unverified prereqs (e.g., term-by-term diff w/o uniform convergence) → flag gap. Prove or state as additional assumption.

### Step 3: Execute w/ justification

Every step labeled + justified:

1. **One op per step**: No combining.
2. **Justification labels**:
   - `[by assumption]` — stated axiom/assumption
   - `[by definition]` — prior definition
   - `[by {identity name}]` — named identity (e.g., "by Jacobi identity")
   - `[by Step N]` — prior step
   - `[by {theorem name}]` — external theorem (Step 2)
3. **Checkpoints** (every 5-10 steps):
   - Units/dimensions consistent
   - Symmetries preserved
   - Correct transformation props
4. **Branches**: Case analysis → each branch labeled sub-derivation, merge.

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

→ Linear sequence, no logic gaps. Every step verifiable.

If err: Step doesn't follow → gap. Insert intermediates or identify new assumption. No "it can be shown" unless well-known identity listed Step 2.

### Step 4: Limiting cases + special values

Validate vs known:

1. **Limits** (≥3): Simpler prior formula (non-rel limit), trivial case (coupling=0), extreme regime (high/low T).

2. **Special values**: Known independent (n=1 hydrogen, d=3).

3. **Symmetry**: Correct under group. Scalar → invariant. Vector → transforms right.

4. **Consistency**: Ward identities, sum rules, reciprocity.

```markdown
## Limiting Case Verification
| Case | Condition | Expected Result | Derived Result | Match |
|------|-----------|----------------|----------------|-------|
| [name] | [parameter limit] | [known result] | [substitution] | [Yes/No] |
| ... | ... | ... | ... | ... |
```

→ All limits + special values match. Internally consistent.

If err: Failed limit → err in derivation. Trace to first step producing fail. Common: sign, missing 2/π, wrong combinatorial coeff, wrong order of limits.

### Step 5: Final w/ notation glossary

Polished:

1. **Narrative**: Intro para → motivation, approach, main result.
2. **Body**: Steps from Step 3 cleaned. Group → logical blocks w/ headings.
3. **Result box**: Highlighted, separated.
4. **Glossary**: Every symbol + meaning + units + first occurrence.
5. **Assumptions summary**: All in one place, postulates vs technical (smoothness, convergence).

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

→ Self-contained doc, followable start to finish w/o external refs (except cited identities + theorems).

If err: Too long (>~50 steps) → break into lemmas. Derive each, assemble main result citing lemmas.

## Check

- [ ] All starting assumptions stated before first calc
- [ ] Every step labeled justification (no unjustified leaps)
- [ ] Units/dimensions consistent at every checkpoint
- [ ] ≥3 limiting cases checked + match
- [ ] Special values match known
- [ ] Result transforms correctly under stated symmetry
- [ ] Glossary defines every symbol
- [ ] No deferred "it can be shown"
- [ ] Domain of validity stated w/ result

## Traps

- **Hidden assumptions**: Analyticity, convergence, integral existence w/o stating. Every regularity cond = assumption, declare.
- **Sign errs**: Most common mech err. Track at every step. Cross-check dim analysis (sign err → dim inconsistent).
- **Dropped boundary terms**: Integration by parts / Stokes → boundary terms vanish only under conds. State why (e.g., "field decays > 1/r at infinity").
- **Order of limits**: Wrong order → diff results (thermodynamic before zero-T). State order explicit + justify.
- **Circular reasoning**: Using result as intermediate. Subtle for "obvious" formulas. Every step from stated start, not answer familiarity.
- **Notation collisions**: Same symbol for diff quantities (E = energy + E-field). Glossary prevents — IF written before derivation.

## →

- `formulate-quantum-problem` — formulate QM framework before deriving
- `survey-theoretical-literature` — find prior derivations for comparison
