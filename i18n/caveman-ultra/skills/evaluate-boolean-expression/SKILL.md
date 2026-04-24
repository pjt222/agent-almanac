---
name: evaluate-boolean-expression
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Evaluate and simplify Boolean expressions using truth tables, algebraic laws
  (De Morgan, distributive, absorption, idempotent, consensus), and Karnaugh maps
  for up to six variables. Use when you need to reduce a Boolean expression to its
  minimal sum-of-products or product-of-sums form, verify logical equivalence
  between two expressions, or prepare a minimized function for gate-level
  implementation.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: digital-logic
  complexity: basic
  language: multi
  tags: digital-logic, boolean-algebra, truth-tables, karnaugh-maps, simplification
---

# Evaluate Boolean Expression

Reduce Boolean expr → minimal form. Parse → canonical, truth table, algebraic laws, K-map (≤6 vars), verify equivalent to original.

## Use When

- Simplify before map to gates
- Verify 2 exprs equivalent
- Generate minimal SOP or POS
- Teach/review Boolean algebra
- Prep for design-logic-circuit

## In

- **Required**: Boolean expr any common notation (e.g., `A AND (B OR NOT C)`, `A * (B + C')`, `A & (B | ~C)`)
- **Required**: Target form — minimal SOP, POS, or both
- **Optional**: Variable ordering preference for K-map
- **Optional**: Don't-care conditions (minterms/maxterms unspecified)
- **Optional**: Second expr for equivalence check

## Do

### Step 1: Parse + Canonical

Convert to standard internal rep.

1. **Tokenize**: Vars (letters/short names), ops (AND, OR, NOT, XOR, NAND, NOR), parens.
2. **Op notation**: Consistent — `*` AND, `+` OR, `'` NOT, `^` XOR.
3. **Var count**: Unique vars. Assign bit (A=MSB, ... Z=LSB default or provided).
4. **Canonical SOP**: Expand → sum of all minterms via `X = X*(Y + Y')`.
5. **Canonical POS**: Alt → product of all maxterms via `X = X + Y*Y'`.

```markdown
## Normalized Expression
- **Variables**: [A, B, C, ...]
- **Variable count**: [n]
- **Original expression**: [as given]
- **Canonical SOP (minterms)**: Sigma m(i, j, k, ...)
- **Canonical POS (maxterms)**: Pi M(i, j, k, ...)
- **Don't-care set**: d(i, j, ...) [if any]
```

→ Expr converted canonical SOP/POS w/ all min/maxterms listed, don't-cares separated.

If err: syntax/precedence ambiguous → clarify. Standard: NOT (highest) > AND > XOR > OR (lowest). >6 vars → K-map needs Quine-McCluskey.

### Step 2: Truth Table

Build complete table for behavior over all inputs.

1. **Rows**: All 2^n combos binary order (000, 001, 010, ...).
2. **Eval**: Sub values → compute output (0/1).
3. **Don't-cares**: Mark `X` instead of 0/1.
4. **Cross-check minterms**: Rows w/ output 1 match minterm list Step 1.

```markdown
## Truth Table
| A | B | C | F |
|---|---|---|---|
| 0 | 0 | 0 | _ |
| 0 | 0 | 1 | _ |
| ... | ... | ... | ... |
```

→ Complete 2^n rows, outputs match canonical, don't-cares marked.

If err: table disagrees w/ canonical → recheck Step 1 expansion. Common: misapply De Morgan during canonical → verify each step.

### Step 3: Algebraic Simplify

Reduce via Boolean identities.

1. **Identity/null**: `A + 0 = A`, `A * 1 = A`, `A + 1 = 1`, `A * 0 = 0`.
2. **Idempotent**: `A + A = A`, `A * A = A`.
3. **Complement**: `A + A' = 1`, `A * A' = 0`.
4. **Absorption**: `A + A*B = A`, `A * (A + B) = A`.
5. **De Morgan**: `(A * B)' = A' + B'`, `(A + B)' = A' * B'`.
6. **Distributive**: `A * (B + C) = A*B + A*C`, `A + B*C = (A + B) * (A + C)`.
7. **Consensus**: `A*B + A'*C + B*C = A*B + A'*C` (B*C redundant).
8. **XOR**: `A*B' + A'*B = A ^ B`.
9. **Document each step**: Expr after each law, cite law.

```markdown
## Algebraic Simplification Trace
1. Original: [expression]
2. Apply [law name]: [result]
3. Apply [law name]: [result]
...
n. Final algebraic form: [simplified expression]
```

→ Step-by-step reduction w/ law citations, converging simpler. Trace = verifiable proof.

If err: no further simplify but non-minimal → Step 4 (K-map). Algebraic ≠ guaranteed global min — depends on order.

### Step 4: K-map Minimize

Provably minimal SOP/POS (≤6 vars).

1. **Draw**: Gray code on axes.
   - 2 vars: 2x2
   - 3 vars: 2x4
   - 4 vars: 4x4
   - 5 vars: two 4x4 stacked
   - 6 vars: four 4x4 stacked
2. **Fill**: 1s (minterms), 0s (maxterms), Xs (don't-cares).
3. **Group adj 1s**: Rectangular groups of 1, 2, 4, 8, 16, 32 (powers of 2). Wrap edges. Include don't-cares if enlarge.
4. **Prime implicants**: Each group → product term. Constant vars appear, changing eliminated.
5. **Essential prime implicants**: Minterms covered by only 1 PI → essential.
6. **Cover remaining**: Fewest additional PIs (Petrick's if needed).
7. **Minimal expr**: Combine selected PIs → minimal SOP. For POS group 0s.

```markdown
## K-map Result
- **Prime implicants**: [list with covered minterms]
- **Essential prime implicants**: [list]
- **Minimal SOP**: [expression]
- **Minimal POS**: [expression, if requested]
- **Literal count**: [number of literals in minimal form]
```

→ Minimal SOP/POS fewest literals, all PIs documented.

If err: ambiguous (multiple minimal covers) → list all equivalent. >6 vars → Quine-McCluskey tabular or Espresso heuristic, note change.

### Step 5: Verify

Confirm logical equivalence simplified vs original.

1. **Truth table compare**: Eval simplified all 2^n → compare Step 2. Every non-don't-care row must match.
2. **Algebraic proof** (optional): Derive original from simplified (vice versa) via Step 3 laws.
3. **Spot-check**: All-zeros, all-ones, tricky simplification inputs.
4. **Document**: Equivalence holds? Final minimal form.

```markdown
## Equivalence Verification
- **Method**: [truth table comparison / algebraic proof / both]
- **Mismatched rows**: [none, or list row numbers]
- **Verdict**: [Equivalent / Not equivalent]
- **Final minimal expression**: [the verified result]
```

→ Simplified matches original all non-don't-care. Final min form clear.

If err: mismatch → trace Steps 3-4. Common: incorrect K-map grouping (non-rect / non-power-of-2), forget wrap, group 0 cell.

## Check

- [ ] All vars accounted for
- [ ] Canonical SOP/POS lists correct min/maxterms
- [ ] Truth table 2^n rows correct outputs
- [ ] Don't-cares handled (in groups, not coverage req)
- [ ] Algebraic steps cite law + verifiable
- [ ] K-map Gray code both axes
- [ ] All groups rect + power-of-2
- [ ] Essential PIs identified
- [ ] Simplified matches on non-don't-care
- [ ] Final = min literals

## Traps

- **K-map adjacency**: Leftmost/rightmost cols + top/bottom rows adjacent (wrap). Essential for largest groups.
- **Non-power-of-2 groups**: 3 or 5 cells. Must be 1, 2, 4, 8, 16, 32. Irregular ≠ valid product.
- **Ignore don't-cares**: Treating as 0s not using to enlarge. Include when reduces, but not required for coverage.
- **Precedence err**: Assuming AND/OR equal. Standard: NOT > AND > OR. `A + B * C` ≠ `(A + B) * C`.
- **Stop at algebraic**: Local min not global. Cross-check K-map (Quine-McCluskey >6 vars) to confirm.
- **Min vs maxterm**: Minterms = AND (products) in SOP. Maxterms = OR (sums) in POS. m3 3 vars = A'BC; M3 = A+B'+C'.

## →

- `design-logic-circuit` — map minimized expr → gate-level
- `argumentation` — structured logical reasoning, shares formal logic
