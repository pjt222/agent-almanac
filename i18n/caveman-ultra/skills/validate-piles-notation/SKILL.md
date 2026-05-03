---
name: validate-piles-notation
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Parse and validate PILES (Puzzle Input Line Entry System) notation for
  specifying piece fusion groups in jigsawR. Covers syntax validation,
  parsing into group lists, plain-language explanation, adjacency
  verification against puzzle results, and round-trip serialization. Use
  when validating user-supplied PILES strings before passing to
  generate_puzzle(), debugging fusion group issues, explaining the notation
  to users, or testing round-trip parse/serialize fidelity.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: jigsawr
  complexity: intermediate
  language: R
  tags: jigsawr, piles, notation, fusion, parsing, dsl
---

# Validate PILES Notation

Parse + validate PILES strings → puzzle piece fusion groups.

## Use When

- Validate user PILES → before `generate_puzzle()`
- Debug fusion issues (wrong pieces merged, unexpected results)
- Explain PILES → user plain language
- Test round-trip: parse → groups → serialize → parse

## In

- **Required**: PILES string (e.g., `"1-2-3,4-5"`)
- **Optional**: Puzzle result obj (adjacency valid + keyword resolution)
- **Optional**: Puzzle type (keyword support `"center"`, `"ring1"`, `"R1"`)

## Do

### Step 1: Syntax Valid

```r
library(jigsawR)
result <- validate_piles_syntax("1-2-3,4-5")
# Returns TRUE if valid, error message if invalid
```

Common syntax errs:
- Unmatched parens: `"1-2(-3)-4"` w/ mismatched `()`
- Invalid chars: only digits, `-`, `,`, `:`, `(`, `)` + keywords
- Empty groups: `"1-2,,3-4"` (double comma)

**Got:** `TRUE` for valid syntax, descriptive err for invalid.

**If err:** Print exact PILES string + valid err msg.

### Step 2: Parse → Groups

```r
groups <- parse_piles("1-2-3,4-5")
# Returns: list(c(1, 2, 3), c(4, 5))
```

W/ ranges:
```r
groups <- parse_piles("1:6,7-8")
# Returns: list(c(1, 2, 3, 4, 5, 6), c(7, 8))
```

**Got:** List of int vectors, one per fusion group, correct piece IDs + boundaries.

**If err:** Check syntax valid passed Step 1. Unexpected groups → verify `-` separates pieces in group, `,` separates groups, `:` expands inclusive endpoints.

### Step 3: Explain Plain Language

Per group:

- `"1-2-3,4-5"` → "Group 1: fuse pieces 1, 2, 3. Group 2: fuse 4, 5."
- `"1:6"` → "Group 1: fuse pieces 1 through 6 (6 pieces)."
- `"center,ring1"` → "Group 1: center piece. Group 2: all pieces ring 1."

**Got:** Each group described plain w/ piece counts + IDs → understandable to non-tech.

**If err:** Keywords can't be explained (`"ring1"` no clear meaning) → notation needs puzzle result for ctx. Advise user provide puzzle type or numeric IDs.

### Step 4: Validate vs Puzzle Result (Optional)

If puzzle result available, verify:

```r
# Generate the puzzle first
puzzle <- generate_puzzle(type = "hexagonal", grid = c(3), size = c(200))

# Parse with puzzle context (resolves keywords)
groups <- parse_fusion("center,ring1", puzzle)
```

Check:
- All piece IDs exist in puzzle
- Keywords resolve to valid piece sets
- Fused pieces actually adjacent (warn if not)

**Got:** All piece IDs valid. Adjacent pieces fuse cleanly.

**If err:** List invalid piece IDs or non-adjacent pairs.

### Step 5: Round-Trip

Verify parse/serialize fidelity:

```r
original <- "1-2-3,4-5"
groups <- parse_piles(original)
roundtrip <- to_piles(groups)
# roundtrip should equal original (or canonical equivalent)

groups2 <- parse_piles(roundtrip)
identical(groups, groups2)  # Must be TRUE
```

**Got:** Round-trip → identical group lists, confirming `parse_piles()` + `to_piles()` are inverses.

**If err:** Round-trip differs → check serializer normalization (sorting IDs, ranges → explicit lists). Canonical diffs OK if `identical(groups, groups2)` returns `TRUE`.

## PILES Quick Reference

```
# Basic syntax
"1-2"           # Fuse pieces 1 and 2
"1-2-3,4-5"     # Two groups: (1,2,3) and (4,5)
"1:6"           # Range: pieces 1 through 6

# Keywords (require puzzle_result)
"center"        # Center piece (hex/concentric)
"ring1"         # All pieces in ring 1
"R1"            # Row 1 (rectangular)
"boundary"      # All boundary pieces

# Functions
parse_piles("1-2-3,4-5")                    # Parse PILES string
parse_fusion("1-2-3", puzzle)               # Auto-detect format
to_piles(list(c(1,2), c(3,4)))              # Convert to PILES
validate_piles_syntax("1-2(-3)-4")          # Validate syntax
```

## Check

- [ ] `validate_piles_syntax()` returns TRUE for valid strings
- [ ] `parse_piles()` returns correct group lists
- [ ] Round-trip serialization preserves groups
- [ ] Keywords resolve correctly w/ puzzle ctx
- [ ] Invalid syntax → clear err msgs

## Traps

- **Keyword w/o puzzle ctx**: `"center"` requires puzzle result. Pass to `parse_fusion()`, not `parse_piles()`.
- **1-indexed pieces**: Piece IDs start at 1, not 0.
- **Adjacent vs non-adjacent fusion**: Non-adjacent fusion works but may produce unexpected visuals. Validate adjacency when possible.
- **Range notation**: `"1:6"` includes both endpoints (1, 2, 3, 4, 5, 6).

## →

- `generate-puzzle` — generate puzzles w/ fusion groups
- `add-puzzle-type` — new types need PILES/fusion support
- `run-puzzle-tests` — test PILES parsing w/ full suite
