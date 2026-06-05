---
name: validate-piles-notation
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

Parse and validate PILES notation strings for puzzle piece fusion groups.

## When to Use

- Validating user-supplied PILES strings before passing to `generate_puzzle()`
- Debugging fusion group issues (wrong pieces merged, unexpected results)
- Explaining PILES notation to users in plain language
- Testing round-trip fidelity: parse -> groups -> serialize -> parse

## Inputs

- **Required**: PILES notation string (e.g., `"1-2-3,4-5"`)
- **Optional**: Puzzle result object (for adjacency validation and keyword resolution)
- **Optional**: Puzzle type (for keyword support like `"center"`, `"ring1"`, `"R1"`)

## Procedure

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

**Expected:** `TRUE` for valid syntax, descriptive error for invalid.

**On failure:** Print the exact PILES string and the validation error message.

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

**Expected:** List of integer vectors, one per fusion group, with correct piece IDs and group boundaries.

**On failure:** Check that the PILES string passed syntax validation in Step 1 first. If parsing returns unexpected groups, verify that `-` separates pieces within a group and `,` separates groups, and that range notation (`:`) expands to inclusive endpoints.

### Step 3: Explain in Plain Language

Describe each group for the user:

- `"1-2-3,4-5"` -> "Group 1: fuse pieces 1, 2, and 3. Group 2: fuse pieces 4 and 5."
- `"1:6"` -> "Group 1: fuse pieces 1 through 6 (6 pieces)."
- `"center,ring1"` -> "Group 1: center piece. Group 2: all pieces in ring 1."

**Expected:** Each fusion group is described in plain language with piece counts and identifiers, making the notation understandable to non-technical users.

**On failure:** If keywords cannot be explained (e.g., `"ring1"` has no clear meaning), the notation may require a puzzle result object for context. Advise the user to provide the puzzle type or use numeric piece IDs instead.

### Step 4: Validate Against Puzzle Result (Optional)

If a puzzle result object is available, verify:

```r
# Generate the puzzle first
puzzle <- generate_puzzle(type = "hexagonal", grid = c(3), size = c(200))

# Parse with puzzle context (resolves keywords)
groups <- parse_fusion("center,ring1", puzzle)
```

Check:
- All piece IDs exist in the puzzle
- Keywords resolve to valid piece sets
- Fused pieces are actually adjacent (warning if not)

**Expected:** All piece IDs valid. Adjacent pieces fuse cleanly.

**On failure:** List invalid piece IDs or non-adjacent pairs.

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

**Expected:** Round-trip produces identical group lists, confirming that `parse_piles()` and `to_piles()` are inverses.

**On failure:** If round-trip differs, check whether the serializer normalizes the notation (e.g., sorting piece IDs or converting ranges to explicit lists). Canonical differences are acceptable as long as `identical(groups, groups2)` returns `TRUE`.

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

## Validation

- [ ] `validate_piles_syntax()` returns TRUE for valid strings
- [ ] `parse_piles()` returns correct group lists
- [ ] Round-trip serialization preserves groups
- [ ] Keywords resolve correctly with puzzle context
- [ ] Invalid syntax produces clear error messages

## Common Pitfalls

- **Keyword without puzzle context**: Keywords like `"center"` require a puzzle result object. Pass it to `parse_fusion()`, not `parse_piles()`.
- **1-indexed pieces**: Piece IDs start at 1, not 0.
- **Adjacent vs non-adjacent fusion**: Fusing non-adjacent pieces works but may produce unexpected visual results. Validate adjacency when possible.
- **Range notation**: `"1:6"` includes both endpoints (1, 2, 3, 4, 5, 6).

## Related Skills

- `generate-puzzle` — generate puzzles with fusion groups
- `add-puzzle-type` — new types need PILES/fusion support
- `run-puzzle-tests` — test PILES parsing with the full suite
