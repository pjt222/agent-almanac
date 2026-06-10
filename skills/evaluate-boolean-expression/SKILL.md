---
name: evaluate-boolean-expression
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

Reduce a Boolean expression to its minimal form by parsing it into canonical notation, constructing a truth table, applying algebraic simplification laws, performing Karnaugh map minimization (up to six variables), and verifying that the simplified expression is logically equivalent to the original.

## When to Use

- Simplifying a Boolean expression before mapping it to logic gates
- Verifying that two Boolean expressions are logically equivalent
- Generating a minimal sum-of-products (SOP) or product-of-sums (POS) form
- Teaching or reviewing Boolean algebra identities and reduction techniques
- Preparing input for the design-logic-circuit skill

## Inputs

- **Required**: Boolean expression in any common notation (e.g., `A AND (B OR NOT C)`, `A * (B + C')`, `A & (B | ~C)`)
- **Required**: Target form -- minimal SOP, minimal POS, or both
- **Optional**: Variable ordering preference for the Karnaugh map
- **Optional**: Don't-care conditions (minterms or maxterms that are unspecified)
- **Optional**: A second expression to check equivalence against

## Procedure

### Step 1: Parse and Normalize to Canonical Form

Convert the input expression into a standard internal representation:

1. **Tokenize**: Identify variables (single letters or short names), operators (AND, OR, NOT, XOR, NAND, NOR), and grouping (parentheses).
2. **Establish operator notation**: Adopt a consistent notation throughout -- `*` for AND, `+` for OR, `'` for NOT (complement), `^` for XOR.
3. **Determine variable count**: List all unique variables. Assign each a bit position (A = MSB, ... Z = LSB by default, or use the provided ordering).
4. **Expand to canonical SOP**: Expand the expression into a sum of all minterms by introducing missing variables via the identity `X = X*(Y + Y')`.
5. **Expand to canonical POS**: Alternatively, expand into a product of all maxterms via `X = X + Y*Y'`.

```markdown
## Normalized Expression
- **Variables**: [A, B, C, ...]
- **Variable count**: [n]
- **Original expression**: [as given]
- **Canonical SOP (minterms)**: Sigma m(i, j, k, ...)
- **Canonical POS (maxterms)**: Pi M(i, j, k, ...)
- **Don't-care set**: d(i, j, ...) [if any]
```

**Expected:** The expression is converted to canonical SOP and/or POS with all minterms/maxterms explicitly listed and don't-care conditions separated.

**On failure:** If the expression contains syntax errors or ambiguous operator precedence, request clarification. Standard precedence is: NOT (highest) > AND > XOR > OR (lowest). If the variable count exceeds 6, note that the K-map step will require the Quine-McCluskey algorithm instead.

### Step 2: Construct Truth Table

Build the complete truth table to establish the function's behavior over all input combinations:

1. **Enumerate rows**: Generate all 2^n input combinations in binary counting order (000, 001, 010, ...).
2. **Evaluate output**: For each row, substitute values into the original expression and compute the output (0 or 1).
3. **Mark don't-cares**: If don't-care conditions were provided, mark those rows with `X` instead of 0 or 1.
4. **Cross-check with minterms**: Verify that the rows producing output 1 match the minterm list from Step 1.

```markdown
## Truth Table
| A | B | C | F |
|---|---|---|---|
| 0 | 0 | 0 | _ |
| 0 | 0 | 1 | _ |
| ... | ... | ... | ... |
```

**Expected:** A complete truth table with 2^n rows, outputs matching the canonical form, and don't-cares properly marked.

**On failure:** If the truth table disagrees with the canonical form, recheck the expansion in Step 1. A common error is misapplying De Morgan's law during the canonical expansion -- verify each expansion step individually.

### Step 3: Apply Algebraic Simplification

Reduce the expression using Boolean algebra identities:

1. **Identity and null laws**: `A + 0 = A`, `A * 1 = A`, `A + 1 = 1`, `A * 0 = 0`.
2. **Idempotent law**: `A + A = A`, `A * A = A`.
3. **Complement law**: `A + A' = 1`, `A * A' = 0`.
4. **Absorption law**: `A + A*B = A`, `A * (A + B) = A`.
5. **De Morgan's theorems**: `(A * B)' = A' + B'`, `(A + B)' = A' * B'`.
6. **Distributive law**: `A * (B + C) = A*B + A*C`, `A + B*C = (A + B) * (A + C)`.
7. **Consensus theorem**: `A*B + A'*C + B*C = A*B + A'*C` (the B*C term is redundant).
8. **XOR simplification**: Recognize patterns like `A*B' + A'*B = A ^ B`.
9. **Document each step**: Write out the expression after each law application, citing the law used.

```markdown
## Algebraic Simplification Trace
1. Original: [expression]
2. Apply [law name]: [result]
3. Apply [law name]: [result]
...
n. Final algebraic form: [simplified expression]
```

**Expected:** A step-by-step reduction with each law application cited, converging on a simpler expression. The trace provides a verifiable proof of equivalence.

**On failure:** If the expression does not simplify further but appears non-minimal, proceed to Step 4 (K-map). Algebraic methods are not guaranteed to find the global minimum -- they depend on the order in which laws are applied.

### Step 4: Minimize via Karnaugh Map

Use a K-map to find the provably minimal SOP or POS form (for up to 6 variables):

1. **Draw the K-map**: Arrange the map using Gray code ordering on axes.
   - 2 variables: 2x2 grid
   - 3 variables: 2x4 grid
   - 4 variables: 4x4 grid
   - 5 variables: two 4x4 grids (stacked)
   - 6 variables: four 4x4 grids (stacked)
2. **Fill cells**: Place 1s (minterms), 0s (maxterms), and Xs (don't-cares) in the corresponding cells.
3. **Group adjacent 1s**: Form rectangular groups of 1, 2, 4, 8, 16, or 32 adjacent cells (powers of 2 only). Groups may wrap around edges. Include don't-cares in groups if they enlarge the group.
4. **Extract prime implicants**: Each group yields a product term. Variables that are constant across the group appear in the term; variables that change are eliminated.
5. **Select essential prime implicants**: Identify minterms covered by only one prime implicant -- those implicants are essential.
6. **Cover remaining minterms**: Use the fewest additional prime implicants to cover any uncovered minterms (Petrick's method if needed).
7. **Write minimal expression**: Combine selected prime implicants into the minimal SOP. For minimal POS, group the 0s instead.

```markdown
## K-map Result
- **Prime implicants**: [list with covered minterms]
- **Essential prime implicants**: [list]
- **Minimal SOP**: [expression]
- **Minimal POS**: [expression, if requested]
- **Literal count**: [number of literals in minimal form]
```

**Expected:** A minimal SOP (and/or POS) with the fewest literals possible, with all prime implicants and essential prime implicants documented.

**On failure:** If groupings are ambiguous (multiple minimal covers exist), list all equivalent minimal forms. If the variable count exceeds 6, switch to the Quine-McCluskey tabular method or Espresso heuristic and note the change in approach.

### Step 5: Verify Simplified Expression Matches Original

Confirm logical equivalence between the simplified and original expressions:

1. **Truth table comparison**: Evaluate the simplified expression for all 2^n input combinations and compare against the truth table from Step 2. Every non-don't-care row must match.
2. **Algebraic proof** (optional): Derive the original from the simplified form (or vice versa) using the laws from Step 3.
3. **Spot-check critical cases**: Verify the all-zeros input, all-ones input, and any input that was involved in a tricky simplification step.
4. **Document result**: State whether equivalence holds and record the final minimal form.

```markdown
## Equivalence Verification
- **Method**: [truth table comparison / algebraic proof / both]
- **Mismatched rows**: [none, or list row numbers]
- **Verdict**: [Equivalent / Not equivalent]
- **Final minimal expression**: [the verified result]
```

**Expected:** The simplified expression matches the original on all non-don't-care inputs. The final minimal form is stated clearly.

**On failure:** If any row mismatches, trace the error back through Steps 3-4. Common causes: incorrect K-map grouping (non-rectangular or non-power-of-2 group), forgetting wrap-around adjacency, or accidentally grouping a 0 cell.

## Validation

- [ ] All variables in the original expression are accounted for
- [ ] Canonical SOP/POS lists the correct minterms/maxterms
- [ ] Truth table has exactly 2^n rows with correct outputs
- [ ] Don't-care conditions are handled correctly (included in groups but not in coverage requirements)
- [ ] Algebraic steps each cite a specific law and are individually verifiable
- [ ] K-map uses Gray code ordering on both axes
- [ ] All groups in the K-map are rectangular and have power-of-2 size
- [ ] Essential prime implicants are correctly identified
- [ ] Simplified expression matches the original on all non-don't-care inputs
- [ ] The final form has the minimum number of literals

## Common Pitfalls

- **Incorrect K-map adjacency**: Forgetting that the leftmost and rightmost columns (and top and bottom rows) are adjacent in a K-map. This wrap-around is essential for finding the largest possible groups.
- **Non-power-of-2 groups**: Grouping 3 or 5 cells together. Every K-map group must contain exactly 1, 2, 4, 8, 16, or 32 cells. An irregular group does not correspond to a valid product term.
- **Ignoring don't-cares**: Treating don't-care conditions as 0s instead of using them to enlarge groups. Don't-cares should be included in groups when doing so reduces the expression, but they must not be required for coverage.
- **Operator precedence errors**: Assuming AND and OR have equal precedence. Standard Boolean precedence is NOT > AND > OR. Misreading `A + B * C` as `(A + B) * C` instead of `A + (B * C)` changes the function entirely.
- **Stopping at algebraic simplification**: Algebraic methods may find a local minimum, not the global minimum. Always cross-check with a K-map (or Quine-McCluskey for >6 variables) to confirm minimality.
- **Confusing minterms and maxterms**: Minterms are AND terms (product terms) that appear in SOP; maxterms are OR terms (sum terms) that appear in POS. Minterm m3 for 3 variables is A'BC; maxterm M3 is A+B'+C'.

## Related Skills

- `design-logic-circuit` -- map the minimized expression to a gate-level circuit
- `argumentation` -- structured logical reasoning that shares formal logic foundations
