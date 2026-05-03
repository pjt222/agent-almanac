---
name: validate-piles-notation
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Parse, validate PILES (Puzzle Input Line Entry System) notation for
  specifying piece fusion groups in jigsawR. Covers syntax validation,
  parsing into group lists, plain-language explanation, adjacency
  verification against puzzle results, round-trip serialization. Use
  when validating user-supplied PILES strings before passing to
  generate_puzzle(), debugging fusion group issues, explaining notation
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

Parse, validate PILES notation strings for puzzle piece fusion groups.

## When Use

- Validate user-supplied PILES strings before passing to `generate_puzzle()`
- Debug fusion group issues (wrong pieces merged, unexpected results)
- Explain PILES notation to users in plain language
- Test round-trip fidelity: parse -> groups -> serialize -> parse

## Inputs

- **Required**: PILES notation string (e.g., `"1-2-3,4-5"`)
- **Optional**: Puzzle result object (for adjacency validation, keyword resolution)
- **Optional**: Puzzle type (for keyword support like `"center"`, `"ring1"`, `"R1"`)

## Steps

### Step 1: Syntax Validation

```r
library(jigsawR)
result <- validate_piles_syntax("1-2-3,4-5")
# Returns TRUE if valid, error message if invalid
```

Check for common syntax errors:
- Unmatched parentheses: `"1-2(-3)-4"` with mismatched `()`
- Invalid characters: only digits, `-`, `,`, `:`, `(`, `)` and keywords allowed
- Empty groups: `"1-2,,3-4"` (double comma)

**Got:** `TRUE` for valid syntax. Descriptive error for invalid.

**If err:** Print exact PILES string and validation error message.

### Step 2: Parse into Groups

```r
groups <- parse_piles("1-2-3,4-5")
# Returns: list(c(1, 2, 3), c(4, 5))
```

For strings with ranges:
```r
groups <- parse_piles("1:6,7-8")
# Returns: list(c(1, 2, 3, 4, 5, 6), c(7, 8))
```

**Got:** List of integer vectors, one per fusion group, with correct piece IDs and group boundaries.

**If err:** Check PILES string passed syntax validation in Step 1 first. Parsing returns unexpected groups? Verify `-` separates pieces within group, `,` separates groups, range notation (`:`) expands to inclusive endpoints.

### Step 3: Explain in Plain Language

Describe each group for user:

- `"1-2-3,4-5"` -> "Group 1: fuse pieces 1, 2, and 3. Group 2: fuse pieces 4 and 5."
- `"1:6"` -> "Group 1: fuse pieces 1 through 6 (6 pieces)."
- `"center,ring1"` -> "Group 1: center piece. Group 2: all pieces in ring 1."

**Got:** Each fusion group described in plain language with piece counts, identifiers. Notation understandable to non-technical users.

**If err:** Keywords cannot be explained (e.g., `"ring1"` has no clear meaning)? Notation may need puzzle result object for context. Advise user to provide puzzle type or use numeric piece IDs instead.

### Step 4: Validate Against Puzzle Result (Optional)

Puzzle result object available? Verify:

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

**Got:** All piece IDs valid. Adjacent pieces fuse clean.

**If err:** List invalid piece IDs or non-adjacent pairs.

### Step 5: Round-Trip Serialization

Verify parse/serialize fidelity:

```r
original <- "1-2-3,4-5"
groups <- parse_piles(original)
roundtrip <- to_piles(groups)
# roundtrip should equal original (or canonical equivalent)

groups2 <- parse_piles(roundtrip)
identical(groups, groups2)  # Must be TRUE
```

**Got:** Round-trip produces identical group lists. Confirms `parse_piles()` and `to_piles()` are inverses.

**If err:** Round-trip differs? Check whether serializer normalizes notation (e.g., sorting piece IDs or converting ranges to explicit lists). Canonical differences acceptable as long as `identical(groups, groups2)` returns `TRUE`.

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
- [ ] Keywords resolve correct with puzzle context
- [ ] Invalid syntax produces clear error messages

## Pitfalls

- **Keyword without puzzle context**: Keywords like `"center"` need puzzle result object. Pass to `parse_fusion()`, not `parse_piles()`.
- **1-indexed pieces**: Piece IDs start at 1, not 0.
- **Adjacent vs non-adjacent fusion**: Fusing non-adjacent pieces works but may produce unexpected visual results. Validate adjacency when possible.
- **Range notation**: `"1:6"` includes both endpoints (1, 2, 3, 4, 5, 6).

## See Also

- `generate-puzzle` — generate puzzles with fusion groups
- `add-puzzle-type` — new types need PILES/fusion support
- `run-puzzle-tests` — test PILES parsing with full suite
