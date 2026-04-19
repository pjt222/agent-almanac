---
name: add-puzzle-type
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
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

Scaffold new puzzle type across all pipeline integration points in jigsawR.

## When Use

- Adding completely new puzzle type to package
- Following established integration checklist (CLAUDE.md 10-point pipeline)
- Ensuring nothing missed when wiring new type end-to-end

## Inputs

- **Required**: New type name (lowercase, e.g. `"triangular"`)
- **Required**: Geometry description (how pieces shaped/arranged)
- **Required**: Whether type needs external packages (add to Suggests)
- **Optional**: Parameter list beyond standard (grid, size, seed, tabsize, offset)
- **Optional**: Reference implementation or algorithm source

## Steps

### Step 1: Create Core Puzzle Module

Create `R/<type>_puzzle.R` with internal generation function:

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

Follow pattern in `R/voronoi_puzzle.R` or `R/snic_puzzle.R` for structure.

**Got:** Function returns list with `$pieces`, `$edges`, `$adjacency`, `$metadata`.

**If fail:** Compare return structure against `generate_voronoi_pieces_internal()` to identify missing list elements or incorrect types.

### Step 2: Wire into jigsawR_clean.R

Edit `R/jigsawR_clean.R`:

1. Add `"<type>"` to `valid_types` vector
2. Add type-specific parameter extraction in params section
3. Add validation logic for type-specific constraints
4. Add filename prefix mapping (e.g., `"<type>"` -> `"<type>_"`)

```r
# In valid_types
valid_types <- c("rectangular", "hexagonal", "concentric", "voronoi", "snic", "<type>")
```

**Got:** `generate_puzzle(type = "<type>")` accepted without "unknown type" error.

**If fail:** Verify type string added to `valid_types` exactly as spelled, parameter extraction covers all required type-specific arguments.

### Step 3: Wire into unified_piece_generation.R

Edit `R/unified_piece_generation.R`:

1. Add dispatch case in `generate_pieces_internal()`
2. Add fusion handling if type supports PILES notation

```r
# In the switch/dispatch
"<type>" = generate_<type>_pieces_internal(params, seed)
```

**Got:** Pieces generated when type dispatched.

**If fail:** Confirm dispatch case string matches type name exactly. `generate_<type>_pieces_internal` defined and exported from puzzle module.

### Step 4: Wire into piece_positioning.R

Edit `R/piece_positioning.R`:

Add positioning dispatch for new type. Most types use shared positioning logic. Some need custom handling.

**Got:** `apply_piece_positioning()` handles new type without errors. Pieces placed at correct coordinates.

**If fail:** Check whether new type needs custom positioning logic or can reuse shared positioning path. Add dispatch case if default path does not apply.

### Step 5: Wire into unified_renderer.R

Edit `R/unified_renderer.R`:

1. Add rendering case in `render_puzzle_svg()`
2. Add edge path function: `get_<type>_edge_paths()`
3. Add piece name function: `get_<type>_piece_name()`

**Got:** SVG output generated for new type with correct piece outlines and edge paths.

**If fail:** Verify `get_<type>_edge_paths()` returns valid SVG path data. `get_<type>_piece_name()` produces unique identifiers for each piece.

### Step 6: Wire into adjacency_api.R

Edit `R/adjacency_api.R`:

Add neighbor dispatch so `get_neighbors()` and `get_adjacency()` work for new type.

**Got:** `get_neighbors(result, piece_id)` returns correct neighbors for any piece in puzzle.

**If fail:** Check adjacency dispatch returns correct data structure. Test with small grid and manually verify neighbor relationships against geometry.

### Step 7: Add ggpuzzle Geom Layer

Edit `R/geom_puzzle.R`:

Create `geom_puzzle_<type>()` using `make_puzzle_layer()` factory:

```r
#' @export
geom_puzzle_<type> <- function(mapping = NULL, data = NULL, ...) {
  make_puzzle_layer(type = "<type>", mapping = mapping, data = data, ...)
}
```

**Got:** `ggplot() + geom_puzzle_<type>(aes(...))` renders without error.

**If fail:** Verify `make_puzzle_layer()` receives correct type string. Geom function exported in NAMESPACE via `@export`.

### Step 8: Add Stat Dispatch

Edit `R/stat_puzzle.R`:

1. Add type-specific default parameters
2. Add dispatch case in `compute_panel()`

**Got:** Stat layer computes puzzle geometry correctly. Produces expected number of polygons.

**If fail:** Check `compute_panel()` dispatch case returns data frame with required columns (`x`, `y`, `group`, `piece_id`). Default parameters sensible for new type.

### Step 9: Update DESCRIPTION

Edit `DESCRIPTION`:

1. Add new type to Description field text
2. Add any new packages to `Suggests:` (if external dependency)
3. Update `Collate:` to include new R file (alphabetical order)

**Got:** `devtools::document()` succeeds. No NOTE about unlisted files.

**If fail:** Check new R file listed in `Collate:` field in alphabetical order. Any new Suggests packages spelled correctly with version constraints.

### Step 10: Update config.yml

Edit `inst/config.yml`:

Add defaults and constraints for new type:

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

**Got:** Config valid YAML. Defaults produce working puzzle when used by `generate_puzzle()`.

**If fail:** Validate YAML with `yaml::yaml.load_file("inst/config.yml")`. Ensure default grid and size values produce sensible puzzle (not too small or too large).

### Step 11: Extend Shiny App

Edit `inst/shiny-app/app.R`:

1. Add new type to UI type selector
2. Add conditional UI panels for type-specific parameters
3. Add server-side generation logic

**Got:** Shiny app shows new type in dropdown. Generates puzzles when selected.

**If fail:** Check type added to `choices` argument of UI selector. Conditional panel for type-specific parameters uses `conditionalPanel(condition = "input.type == '<type>'")`. Server-side handler passes correct parameters.

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

Type requires external package? Wrap tests with `skip_if_not_installed()`.

**Got:** All tests pass. No skips unless external dependency missing.

**If fail:** Check each integration point individually. Most common issue: missing dispatch cases — run `grep -rn "switch\|valid_types" R/` to find all dispatch locations.

## Checks

- [ ] `generate_puzzle(type = "<type>")` produces valid output
- [ ] All 10 integration points wired correctly
- [ ] `devtools::test()` passes with new tests
- [ ] `devtools::check()` returns 0 errors, 0 warnings
- [ ] Shiny app renders new type
- [ ] Config constraints enforced (min/max validation)
- [ ] Adjacency and fusion work correctly
- [ ] ggpuzzle geom layer renders without error
- [ ] `devtools::document()` succeeds (NAMESPACE updated)

## Pitfalls

- **Missing dispatch case**: Forgetting one of 10+ files causes silent failure or "unknown type" errors
- **strsplit with negative numbers**: Creating adjacency keys with `paste(a, b, sep = "-")`? Negative piece labels produce keys like `"1--1"`. Use `"|"` separator instead. Split with `"\\|"`.
- **Using `cat()` for output**: Always use `cli` package logging wrappers (`log_info`, `log_warn`, etc.)
- **Collate order**: DESCRIPTION Collate field must be alphabetical or dependency-ordered
- **Config.yml format**: Ensure YAML valid; test with `yaml::yaml.load_file("inst/config.yml")`

## See Also

- `generate-puzzle` — test new type after scaffolding
- `run-puzzle-tests` — run full test suite to verify integration
- `validate-piles-notation` — test fusion with new type
- `write-testthat-tests` — general test-writing patterns
- `write-roxygen-docs` — document new geom function
