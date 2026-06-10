---
name: add-puzzle-type
description: >
  Scaffold a new puzzle type across all 10+ pipeline integration points
  in jigsawR. Creates the core puzzle module, wires it into the unified
  pipeline (generation, positioning, rendering, adjacency), adds ggpuzzle
  geom/stat layers, updates DESCRIPTION and config.yml, extends the Shiny
  app, and creates a comprehensive test suite. Use when adding a completely
  new puzzle type to the package or following the 10-point integration
  checklist to ensure nothing is missed end-to-end.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: jigsawr
  complexity: advanced
  language: R
  tags: jigsawr, puzzle-type, pipeline, integration, scaffold
---

# Add Puzzle Type

Scaffold a new puzzle type across all pipeline integration points in jigsawR.

## When to Use

- Adding a completely new puzzle type to the package
- Following the established integration checklist (CLAUDE.md 10-point pipeline)
- Ensuring nothing is missed when wiring a new type end-to-end

## Inputs

- **Required**: New type name (lowercase, e.g. `"triangular"`)
- **Required**: Geometry description (how pieces are shaped/arranged)
- **Required**: Whether the type needs external packages (add to Suggests)
- **Optional**: Parameter list beyond the standard (grid, size, seed, tabsize, offset)
- **Optional**: Reference implementation or algorithm source

## Procedure

### Step 1: Create Core Puzzle Module

Create `R/<type>_puzzle.R` with the internal generation function:

```r
#' Generate <type> puzzle pieces (internal)
#' @noRd
generate_<type>_pieces_internal <- function(params, seed) {
  # 1. Initialize RNG state
  # 2. Generate piece geometries
  # 3. Build edge paths (SVG path data)
  # 4. Compute adjacency
  # 5. Return list: pieces, edges, adjacency, metadata
}
```

Follow the pattern in `R/voronoi_puzzle.R` or `R/snic_puzzle.R` for structure.

**Expected:** Function returns a list with `$pieces`, `$edges`, `$adjacency`, `$metadata`.

**On failure:** Compare the return structure against `generate_voronoi_pieces_internal()` to identify missing list elements or incorrect types.

### Step 2: Wire into jigsawR_clean.R

Edit `R/jigsawR_clean.R`:

1. Add `"<type>"` to the `valid_types` vector
2. Add type-specific parameter extraction in the params section
3. Add validation logic for type-specific constraints
4. Add filename prefix mapping (e.g., `"<type>"` -> `"<type>_"`)

```r
# In valid_types
valid_types <- c("rectangular", "hexagonal", "concentric", "voronoi", "snic", "<type>")
```

**Expected:** `generate_puzzle(type = "<type>")` is accepted without "unknown type" error.

**On failure:** Verify the type string is added to `valid_types` exactly as spelled, and that parameter extraction covers all required type-specific arguments.

### Step 3: Wire into unified_piece_generation.R

Edit `R/unified_piece_generation.R`:

1. Add dispatch case in `generate_pieces_internal()`
2. Add fusion handling if the type supports PILES notation

```r
# In the switch/dispatch
"<type>" = generate_<type>_pieces_internal(params, seed)
```

**Expected:** Pieces are generated when the type is dispatched.

**On failure:** Confirm the dispatch case string matches the type name exactly and that `generate_<type>_pieces_internal` is defined and exported from the puzzle module.

### Step 4: Wire into piece_positioning.R

Edit `R/piece_positioning.R`:

Add positioning dispatch for the new type. Most types use shared positioning logic, but some need custom handling.

**Expected:** `apply_piece_positioning()` handles the new type without errors and pieces are placed at correct coordinates.

**On failure:** Check whether the new type needs custom positioning logic or can reuse the shared positioning path. Add a dispatch case if the default path does not apply.

### Step 5: Wire into unified_renderer.R

Edit `R/unified_renderer.R`:

1. Add rendering case in `render_puzzle_svg()`
2. Add edge path function: `get_<type>_edge_paths()`
3. Add piece name function: `get_<type>_piece_name()`

**Expected:** SVG output is generated for the new type with correct piece outlines and edge paths.

**On failure:** Verify `get_<type>_edge_paths()` returns valid SVG path data and `get_<type>_piece_name()` produces unique identifiers for each piece.

### Step 6: Wire into adjacency_api.R

Edit `R/adjacency_api.R`:

Add neighbor dispatch so `get_neighbors()` and `get_adjacency()` work for the new type.

**Expected:** `get_neighbors(result, piece_id)` returns correct neighbors for any piece in the puzzle.

**On failure:** Check that the adjacency dispatch returns the correct data structure. Test with a small grid and manually verify neighbor relationships against the geometry.

### Step 7: Add ggpuzzle Geom Layer

Edit `R/geom_puzzle.R`:

Create `geom_puzzle_<type>()` using the `make_puzzle_layer()` factory:

```r
#' @export
geom_puzzle_<type> <- function(mapping = NULL, data = NULL, ...) {
  make_puzzle_layer(type = "<type>", mapping = mapping, data = data, ...)
}
```

**Expected:** `ggplot() + geom_puzzle_<type>(aes(...))` renders without error.

**On failure:** Verify `make_puzzle_layer()` receives the correct type string and that the geom function is exported in the NAMESPACE via `@export`.

### Step 8: Add Stat Dispatch

Edit `R/stat_puzzle.R`:

1. Add type-specific default parameters
2. Add dispatch case in `compute_panel()`

**Expected:** The stat layer computes puzzle geometry correctly and produces the expected number of polygons.

**On failure:** Check that the `compute_panel()` dispatch case returns a data frame with the required columns (`x`, `y`, `group`, `piece_id`) and that default parameters are sensible for the new type.

### Step 9: Update DESCRIPTION

Edit `DESCRIPTION`:

1. Add new type to the Description field text
2. Add any new packages to `Suggests:` (if external dependency)
3. Update `Collate:` to include the new R file (alphabetical order)

**Expected:** `devtools::document()` succeeds. No NOTE about unlisted files.

**On failure:** Check that the new R file is listed in the `Collate:` field in alphabetical order and that any new Suggests packages are spelled correctly with version constraints.

### Step 10: Update config.yml

Edit `inst/config.yml`:

Add defaults and constraints for the new type:

```yaml
<type>:
  grid:
    default: [3, 3]
    min: [2, 2]
    max: [20, 20]
  size:
    default: [300, 300]
    min: [100, 100]
    max: [2000, 2000]
  tabsize:
    default: 20
    min: 5
    max: 50
  # Add type-specific params here
```

**Expected:** Config is valid YAML. Defaults produce a working puzzle when used by `generate_puzzle()`.

**On failure:** Validate YAML with `yaml::yaml.load_file("inst/config.yml")`. Ensure default grid and size values produce a sensible puzzle (not too small or too large).

### Step 11: Extend Shiny App

Edit `inst/shiny-app/app.R`:

1. Add the new type to the UI type selector
2. Add conditional UI panels for type-specific parameters
3. Add server-side generation logic

**Expected:** Shiny app shows the new type in the dropdown and generates puzzles when selected.

**On failure:** Check that the type is added to the `choices` argument of the UI selector, that the conditional panel for type-specific parameters uses `conditionalPanel(condition = "input.type == '<type>'")`, and that the server-side handler passes the correct parameters.

### Step 12: Create Test Suite

Create `tests/testthat/test-<type>-puzzles.R`:

```r
test_that("<type> puzzle generates correct piece count", { ... })
test_that("<type> puzzle respects seed reproducibility", { ... })
test_that("<type> adjacency returns valid neighbors", { ... })
test_that("<type> fusion merges pieces correctly", { ... })
test_that("<type> geom layer renders without error", { ... })
test_that("<type> SVG output is well-formed", { ... })
test_that("<type> config constraints are enforced", { ... })
```

If the type requires an external package, wrap tests with `skip_if_not_installed()`.

**Expected:** All tests pass. No skips unless external dependency is missing.

**On failure:** Check each integration point individually. The most common issue is missing dispatch cases — run `grep -rn "switch\|valid_types" R/` to find all dispatch locations.

## Validation

- [ ] `generate_puzzle(type = "<type>")` produces valid output
- [ ] All 10 integration points are wired correctly
- [ ] `devtools::test()` passes with new tests
- [ ] `devtools::check()` returns 0 errors, 0 warnings
- [ ] Shiny app renders the new type
- [ ] Config constraints are enforced (min/max validation)
- [ ] Adjacency and fusion work correctly
- [ ] ggpuzzle geom layer renders without error
- [ ] `devtools::document()` succeeds (NAMESPACE updated)

## Common Pitfalls

- **Missing dispatch case**: Forgetting one of the 10+ files causes silent failure or "unknown type" errors
- **strsplit with negative numbers**: When creating adjacency keys with `paste(a, b, sep = "-")`, negative piece labels produce keys like `"1--1"`. Use `"|"` separator instead and split with `"\\|"`.
- **Using `cat()` for output**: Always use `cli` package logging wrappers (`log_info`, `log_warn`, etc.)
- **Collate order**: DESCRIPTION Collate field must be alphabetical or dependency-ordered
- **Config.yml format**: Ensure YAML is valid; test with `yaml::yaml.load_file("inst/config.yml")`

## Related Skills

- `generate-puzzle` — test the new type after scaffolding
- `run-puzzle-tests` — run the full test suite to verify integration
- `validate-piles-notation` — test fusion with the new type
- `write-testthat-tests` — general test-writing patterns
- `write-roxygen-docs` — document the new geom function
