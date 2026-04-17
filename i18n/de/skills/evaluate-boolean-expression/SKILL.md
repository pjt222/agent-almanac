---
name: evaluate-boolean-expression
description: >
  Bewerten and simplify Boolean expressions using truth tables, algebraic laws
  (De Morgan, distributive, absorption, idempotent, consensus), and Karnaugh maps
  for up to six variables. Verwenden wenn you need to reduce a Boolean expression to its
  minimal sum-of-products or product-of-sums form, verify logical equivalence
  zwischen two expressions, or prepare a minimized function for gate-level
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
  locale: de
  source_locale: en
  source_commit: f3953462
  translator: claude
  translation_date: "2026-03-17"
---

# Booleschen Ausdruck auswerten

Reduzieren a Boolean expression to its minimal form by parsing it into canonical notation, constructing a truth table, applying algebraic simplification laws, performing Karnaugh map minimization (up to six variables), and verifying that the simplified expression is logically equivalent to the original.

## Wann verwenden

- Simplifying a Boolean expression vor mapping it to logic gates
- Verifying that two Boolean expressions are logically equivalent
- Generating a minimal sum-of-products (SOP) or product-of-sums (POS) form
- Teaching or reviewing Boolean algebra identities and reduction techniques
- Preparing input for the design-logic-circuit skill

## Eingaben

- **Erforderlich**: Boolean expression in any common notation (e.g., `A AND (B OR NOT C)`, `A * (B + C')`, `A & (B | ~C)`)
- **Erforderlich**: Target form -- minimal SOP, minimal POS, or both
- **Optional**: Variable ordering preference for the Karnaugh map
- **Optional**: Don't-care conditions (minterms or maxterms that are unspecified)
- **Optional**: A second expression to check equivalence gegen

## Vorgehensweise

### Schritt 1: Parsen and Normalize to Canonical Form

Konvertieren die Eingabe expression into a standard internal representation:

1. **Tokenize**: Identifizieren variables (single letters or short names), operators (AND, OR, NOT, XOR, NAND, NOR), and grouping (parentheses).
2. **Establish operator notation**: Adopt a consistent notation durchout -- `*` for AND, `+` for OR, `'` for NOT (complement), `^` for XOR.
3. **Bestimmen variable count**: Auflisten all unique variables. Zuweisen each a bit position (A = MSB, ... Z = LSB by default, or use the provided ordering).
4. **Erweitern to canonical SOP**: Erweitern the expression into a sum of all minterms by introducing missing variables via the identity `X = X*(Y + Y')`.
5. **Erweitern to canonical POS**: Alternatively, expand into a product of all maxterms via `X = X + Y*Y'`.

```markdown
## Normalized Expression
- **Variables**: [A, B, C, ...]
- **Variable count**: [n]
- **Original expression**: [as given]
- **Canonical SOP (minterms)**: Sigma m(i, j, k, ...)
- **Canonical POS (maxterms)**: Pi M(i, j, k, ...)
- **Don't-care set**: d(i, j, ...) [if any]
```

**Erwartet:** The expression is converted to canonical SOP and/or POS with all minterms/maxterms explicitly listed and don't-care conditions separated.

**Bei Fehler:** If the expression contains syntax errors or ambiguous operator precedence, request clarification. Standard precedence is: NOT (highest) > AND > XOR > OR (lowest). If the variable count exceeds 6, note that the K-map step will require the Quine-McCluskey algorithm stattdessen.

### Schritt 2: Construct Truth Table

Erstellen the complete truth table to establish die Funktion's behavior over all input combinations:

1. **Enumerate rows**: Generieren all 2^n input combinations in binary counting order (000, 001, 010, ...).
2. **Bewerten output**: Fuer jede row, substitute values into the original expression and compute die Ausgabe (0 or 1).
3. **Mark don't-cares**: If don't-care conditions were provided, mark those rows with `X` stattdessen of 0 or 1.
4. **Cross-check with minterms**: Sicherstellen, dass the rows producing output 1 match the minterm list from Step 1.

```markdown
## Truth Table
| A | B | C | F |
|---|---|---|---|
| 0 | 0 | 0 | _ |
| 0 | 0 | 1 | _ |
| ... | ... | ... | ... |
```

**Erwartet:** A complete truth table with 2^n rows, outputs matching the canonical form, and don't-cares ordnungsgemaess marked.

**Bei Fehler:** If the truth table disagrees with the canonical form, recheck the expansion in Step 1. A common error is misapplying De Morgan's law waehrend the canonical expansion -- verify each expansion step individually.

### Schritt 3: Anwenden Algebraic Simplification

Reduzieren the expression using Boolean algebra identities:

1. **Identity and null laws**: `A + 0 = A`, `A * 1 = A`, `A + 1 = 1`, `A * 0 = 0`.
2. **Idempotent law**: `A + A = A`, `A * A = A`.
3. **Complement law**: `A + A' = 1`, `A * A' = 0`.
4. **Absorption law**: `A + A*B = A`, `A * (A + B) = A`.
5. **De Morgan's theorems**: `(A * B)' = A' + B'`, `(A + B)' = A' * B'`.
6. **Distributive law**: `A * (B + C) = A*B + A*C`, `A + B*C = (A + B) * (A + C)`.
7. **Consensus theorem**: `A*B + A'*C + B*C = A*B + A'*C` (the B*C term is redundant).
8. **XOR simplification**: Recognize patterns like `A*B' + A'*B = A ^ B`.
9. **Dokumentieren each step**: Schreiben out the expression nach each law application, citing the law used.

```markdown
## Algebraic Simplification Trace
1. Original: [expression]
2. Apply [law name]: [result]
3. Apply [law name]: [result]
...
n. Final algebraic form: [simplified expression]
```

**Erwartet:** A step-by-step reduction with each law application cited, converging on a simpler expression. The trace provides a verifiable proof of equivalence.

**Bei Fehler:** If the expression nicht simplify further but appears non-minimal, proceed to Step 4 (K-map). Algebraic methods sind nicht guaranteed to find the global minimum -- they depend on the order in which laws are applied.

### Schritt 4: Minimieren via Karnaugh Map

Use a K-map to find the provably minimal SOP or POS form (for up to 6 variables):

1. **Draw the K-map**: Arrange the map using Gray code ordering on axes.
   - 2 variables: 2x2 grid
   - 3 variables: 2x4 grid
   - 4 variables: 4x4 grid
   - 5 variables: two 4x4 grids (stacked)
   - 6 variables: four 4x4 grids (stacked)
2. **Fill cells**: Place 1s (minterms), 0s (maxterms), and Xs (don't-cares) in the corresponding cells.
3. **Group adjacent 1s**: Form rectangular groups of 1, 2, 4, 8, 16, or 32 adjacent cells (powers of 2 only). Groups may wrap around edges. Einschliessen don't-cares in groups if they enlarge the group.
4. **Extrahieren prime implicants**: Each group yields a product term. Variables that are constant across the group appear in the term; variables that change are eliminated.
5. **Auswaehlen essential prime implicants**: Identifizieren minterms covered by only one prime implicant -- those implicants are essential.
6. **Cover remaining minterms**: Use the fewest additional prime implicants to cover any uncovered minterms (Petrick's method if needed).
7. **Schreiben minimal expression**: Kombinieren selected prime implicants into the minimal SOP. For minimal POS, group the 0s stattdessen.

```markdown
## K-map Result
- **Prime implicants**: [list with covered minterms]
- **Essential prime implicants**: [list]
- **Minimal SOP**: [expression]
- **Minimal POS**: [expression, if requested]
- **Literal count**: [number of literals in minimal form]
```

**Erwartet:** A minimal SOP (and/or POS) with the fewest literals possible, with all prime implicants and essential prime implicants documented.

**Bei Fehler:** If groupings are ambiguous (multiple minimal covers exist), list all equivalent minimal forms. If the variable count exceeds 6, switch to the Quine-McCluskey tabular method or Espresso heuristic and note the change in approach.

### Schritt 5: Verifizieren Simplified Expression Matches Original

Bestaetigen logical equivalence zwischen the simplified and original expressions:

1. **Truth table comparison**: Bewerten the simplified expression for all 2^n input combinations and compare gegen the truth table from Step 2. Every non-don't-care row must match.
2. **Algebraic proof** (optional): Derive the original from the simplified form (or vice versa) using the laws from Step 3.
3. **Spot-check critical cases**: Verifizieren the all-zeros input, all-ones input, and any input that was involved in a tricky simplification step.
4. **Dokumentieren result**: State whether equivalence holds and record the final minimal form.

```markdown
## Equivalence Verification
- **Method**: [truth table comparison / algebraic proof / both]
- **Mismatched rows**: [none, or list row numbers]
- **Verdict**: [Equivalent / Not equivalent]
- **Final minimal expression**: [the verified result]
```

**Erwartet:** The simplified expression matches the original on all non-don't-care inputs. The final minimal form is stated clearly.

**Bei Fehler:** If any row mismatches, trace der Fehler back durch Steps 3-4. Common causes: incorrect K-map grouping (non-rectangular or non-power-of-2 group), forgetting wrap-around adjacency, or accidentally grouping a 0 cell.

## Validierung

- [ ] All variables in the original expression are accounted for
- [ ] Canonical SOP/POS lists the correct minterms/maxterms
- [ ] Truth table has exactly 2^n rows with correct outputs
- [ ] Don't-care conditions are handled korrekt (included in groups but not in coverage requirements)
- [ ] Algebraic steps each cite a specific law and are individually verifiable
- [ ] K-map uses Gray code ordering on both axes
- [ ] All groups in the K-map are rectangular and have power-of-2 size
- [ ] Essential prime implicants are korrekt identified
- [ ] Simplified expression matches the original on all non-don't-care inputs
- [ ] The final form has the minimum number of literals

## Haeufige Stolperfallen

- **Incorrect K-map adjacency**: Forgetting that the leftmost and rightmost columns (and top and bottom rows) are adjacent in a K-map. This wrap-around is essential for finding the largest possible groups.
- **Non-power-of-2 groups**: Grouping 3 or 5 cells together. Every K-map group must contain exactly 1, 2, 4, 8, 16, or 32 cells. An irregular group nicht correspond to a valid product term.
- **Ignoring don't-cares**: Treating don't-care conditions as 0s stattdessen of using them to enlarge groups. Don't-cares sollte included in groups when doing so reduces the expression, but they must not be required for coverage.
- **Operator precedence errors**: Assuming AND and OR have equal precedence. Standard Boolean precedence is NOT > AND > OR. Misreading `A + B * C` as `(A + B) * C` stattdessen of `A + (B * C)` changes die Funktion entirely.
- **Stopping at algebraic simplification**: Algebraic methods may find a local minimum, not the global minimum. Always cross-check with a K-map (or Quine-McCluskey for >6 variables) to confirm minimality.
- **Confusing minterms and maxterms**: Minterms are AND terms (product terms) that appear in SOP; maxterms are OR terms (sum terms) that appear in POS. Minterm m3 for 3 variables is A'BC; maxterm M3 is A+B'+C'.

## Verwandte Skills

- `design-logic-circuit` -- map the minimized expression to a gate-level circuit
- `argumentation` -- structured logical reasoning that shares formal logic foundations
