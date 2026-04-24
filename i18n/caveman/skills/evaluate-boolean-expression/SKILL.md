---
name: evaluate-boolean-expression
locale: caveman
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

Shrink Boolean expression to smallest form: parse into canonical shape, build truth table, apply algebra laws, do Karnaugh map min (up to six vars), check new expression same logic as old.

## When Use

- Shrink Boolean expression before map to logic gates
- Check two Boolean expressions are same logic
- Make smallest sum-of-products (SOP) or product-of-sums (POS) form
- Teach or review Boolean algebra rules and shrink moves
- Prep input for design-logic-circuit skill

## Inputs

- **Required**: Boolean expression in any common form (e.g., `A AND (B OR NOT C)`, `A * (B + C')`, `A & (B | ~C)`)
- **Required**: Target form -- min SOP, min POS, or both
- **Optional**: Var order pick for Karnaugh map
- **Optional**: Don't-care cases (minterms or maxterms left undefined)
- **Optional**: Second expression to check same-logic against

## Steps

### Step 1: Parse and Normalize to Canonical Form

Turn input expression into standard inner shape:

1. **Tokenize**: Spot vars (single letters or short names), ops (AND, OR, NOT, XOR, NAND, NOR), and grouping (parens).
2. **Set op notation**: Pick one notation all through -- `*` for AND, `+` for OR, `'` for NOT (complement), `^` for XOR.
3. **Count vars**: List all unique vars. Give each bit position (A = MSB, ... Z = LSB by default, or use given order).
4. **Expand to canonical SOP**: Expand expression to sum of all minterms by adding missing vars via rule `X = X*(Y + Y')`.
5. **Expand to canonical POS**: Or expand to product of all maxterms via `X = X + Y*Y'`.

```markdown
## Normalized Expression
- **Variables**: [A, B, C, ...]
- **Variable count**: [n]
- **Original expression**: [as given]
- **Canonical SOP (minterms)**: Sigma m(i, j, k, ...)
- **Canonical POS (maxterms)**: Pi M(i, j, k, ...)
- **Don't-care set**: d(i, j, ...) [if any]
```

**Got:** Expression turned to canonical SOP and/or POS with all minterms/maxterms listed clear and don't-care cases kept apart.

**If fail:** Expression has syntax errors or vague op precedence? Ask for clarity. Standard precedence: NOT (highest) > AND > XOR > OR (lowest). Var count over 6? Note K-map step will need Quine-McCluskey algorithm instead.

### Step 2: Construct Truth Table

Build full truth table to pin function behavior over all input combos:

1. **List rows**: Make all 2^n input combos in binary count order (000, 001, 010, ...).
2. **Evaluate output**: For each row, plug values into old expression and compute output (0 or 1).
3. **Mark don't-cares**: If don't-care cases given, mark those rows with `X` not 0 or 1.
4. **Cross-check with minterms**: Confirm rows giving output 1 match minterm list from Step 1.

```markdown
## Truth Table
| A | B | C | F |
|---|---|---|---|
| 0 | 0 | 0 | _ |
| 0 | 0 | 1 | _ |
| ... | ... | ... | ... |
```

**Got:** Full truth table with 2^n rows, outputs matching canonical form, don't-cares marked right.

**If fail:** Truth table clash with canonical form? Recheck expand in Step 1. Common slip: De Morgan's law mis-applied during canonical expand -- check each expand step one by one.

### Step 3: Apply Algebraic Simplification

Shrink expression with Boolean algebra rules:

1. **Identity and null laws**: `A + 0 = A`, `A * 1 = A`, `A + 1 = 1`, `A * 0 = 0`.
2. **Idempotent law**: `A + A = A`, `A * A = A`.
3. **Complement law**: `A + A' = 1`, `A * A' = 0`.
4. **Absorption law**: `A + A*B = A`, `A * (A + B) = A`.
5. **De Morgan's theorems**: `(A * B)' = A' + B'`, `(A + B)' = A' * B'`.
6. **Distributive law**: `A * (B + C) = A*B + A*C`, `A + B*C = (A + B) * (A + C)`.
7. **Consensus theorem**: `A*B + A'*C + B*C = A*B + A'*C` (the B*C term is extra).
8. **XOR shrink**: Spot patterns like `A*B' + A'*B = A ^ B`.
9. **Log each step**: Write expression after each law apply, name law used.

```markdown
## Algebraic Simplification Trace
1. Original: [expression]
2. Apply [law name]: [result]
3. Apply [law name]: [result]
...
n. Final algebraic form: [simplified expression]
```

**Got:** Step-by-step shrink with each law apply named, going to simpler expression. Trace is checkable proof of same-logic.

**If fail:** Expression won't shrink more but still feels not-min? Go to Step 4 (K-map). Algebra moves not guaranteed to find global min -- depend on order of law apply.

### Step 4: Minimize via Karnaugh Map

Use K-map to find provably min SOP or POS form (for up to 6 vars):

1. **Draw K-map**: Set map using Gray code order on axes.
   - 2 variables: 2x2 grid
   - 3 variables: 2x4 grid
   - 4 variables: 4x4 grid
   - 5 variables: two 4x4 grids (stacked)
   - 6 variables: four 4x4 grids (stacked)
2. **Fill cells**: Place 1s (minterms), 0s (maxterms), Xs (don't-cares) in matching cells.
3. **Group adjacent 1s**: Form rectangular groups of 1, 2, 4, 8, 16, or 32 adjacent cells (powers of 2 only). Groups can wrap around edges. Add don't-cares to groups if they make group bigger.
4. **Pull prime implicants**: Each group gives product term. Vars constant across group stay in term; vars that change drop out.
5. **Pick essential prime implicants**: Spot minterms covered by only one prime implicant -- those implicants are essential.
6. **Cover remaining minterms**: Use fewest extra prime implicants to cover any uncovered minterms (Petrick's method if need).
7. **Write min expression**: Mix picked prime implicants into min SOP. For min POS, group 0s instead.

```markdown
## K-map Result
- **Prime implicants**: [list with covered minterms]
- **Essential prime implicants**: [list]
- **Minimal SOP**: [expression]
- **Minimal POS**: [expression, if requested]
- **Literal count**: [number of literals in minimal form]
```

**Got:** Min SOP (and/or POS) with fewest literals, all prime implicants and essential prime implicants logged.

**If fail:** Groupings vague (many min covers exist)? List all same-value min forms. Var count over 6? Switch to Quine-McCluskey tabular method or Espresso heuristic; note the swap.

### Step 5: Verify Simplified Expression Matches Original

Check same logic between shrunk and original expressions:

1. **Truth table compare**: Eval shrunk expression for all 2^n input combos and compare vs truth table from Step 2. Every non-don't-care row must match.
2. **Algebraic proof** (optional): Pull original from shrunk form (or reverse) using laws from Step 3.
3. **Spot-check key cases**: Check all-zeros input, all-ones input, and any input tied to tricky shrink step.
4. **Log result**: State whether same-logic holds and write final min form.

```markdown
## Equivalence Verification
- **Method**: [truth table comparison / algebraic proof / both]
- **Mismatched rows**: [none, or list row numbers]
- **Verdict**: [Equivalent / Not equivalent]
- **Final minimal expression**: [the verified result]
```

**Got:** Shrunk expression matches original on all non-don't-care inputs. Final min form stated clear.

**If fail:** Any row mismatch? Trace error back through Steps 3-4. Common causes: wrong K-map grouping (non-rectangular or non-power-of-2 group), forget wrap-around adjacency, or slip grouping a 0 cell.

## Validation

- [ ] All vars in original expression counted
- [ ] Canonical SOP/POS lists right minterms/maxterms
- [ ] Truth table has exactly 2^n rows with right outputs
- [ ] Don't-care cases handled right (added to groups but not in cover rule)
- [ ] Algebraic steps each name a specific law and can be checked one by one
- [ ] K-map uses Gray code order on both axes
- [ ] All groups in K-map are rectangular and power-of-2 size
- [ ] Essential prime implicants picked right
- [ ] Shrunk expression matches original on all non-don't-care inputs
- [ ] Final form has smallest number of literals

## Pitfalls

- **Wrong K-map adjacency**: Forget leftmost and rightmost columns (and top and bottom rows) are adjacent in K-map. This wrap-around is key for finding biggest groups.
- **Non-power-of-2 groups**: Grouping 3 or 5 cells together. Every K-map group must have exactly 1, 2, 4, 8, 16, or 32 cells. Odd group not match any product term.
- **Ignore don't-cares**: Treat don't-care as 0s, not use them to grow groups. Don't-cares should join groups when doing so shrinks expression, but must not be needed for cover.
- **Op precedence slip**: Assume AND and OR have same precedence. Standard Boolean precedence is NOT > AND > OR. Misread `A + B * C` as `(A + B) * C` not `A + (B * C)` changes function full.
- **Stop at algebra shrink**: Algebra moves may find local min, not global min. Always cross-check with K-map (or Quine-McCluskey for >6 vars) to confirm smallest.
- **Mix minterms and maxterms**: Minterms are AND terms (product terms) in SOP; maxterms are OR terms (sum terms) in POS. Minterm m3 for 3 vars is A'BC; maxterm M3 is A+B'+C'.

## See Also

- `design-logic-circuit` -- map shrunk expression to gate-level circuit
- `argumentation` -- structured logic reason that shares formal logic base
