---
name: add-puzzle-type
locale: caveman-ultra
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

Scaffold new puzzle type across pipeline integration points jigsawR.

## Use When

- Add new puzzle type to pkg
- Follow 10-point pipeline checklist (CLAUDE.md)
- Nothing missed wiring new type end-to-end

## In

- **Required**: New type name (lowercase, e.g. `"triangular"`)
- **Required**: Geometry desc (piece shape/arrangement)
- **Required**: Needs external pkgs? (Suggests)
- **Optional**: Params beyond standard (grid, size, seed, tabsize, offset)
- **Optional**: Ref impl or algo source

## Do

### Step 1: Core Puzzle Module

Create `R/<type>_puzzle.R`:

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

Follow pattern `R/voronoi_puzzle.R` or `R/snic_puzzle.R`.

**→** Fn returns list: `$pieces`, `$edges`, `$adjacency`, `$metadata`.

**If err:** Compare return structure against `generate_voronoi_pieces_internal()` → missing elements or wrong types.

### Step 2: Wire jigsawR_clean.R

Edit `R/jigsawR_clean.R`:

1. Add `"<type>"` to `valid_types`
2. Type-specific param extraction
3. Valid. logic type-specific constraints
4. Filename prefix mapping (e.g., `"<type>"` -> `"<type>_"`)

```r
# In valid_types
valid_types <- c("rectangular", "hexagonal", "concentric", "voronoi", "snic", "<type>")
```

**→** `generate_puzzle(type = "<type>")` accepted, no "unknown type" err.

**If err:** Verify type string in `valid_types` exact, param extraction covers required type-specific args.

### Step 3: Wire unified_piece_generation.R

Edit `R/unified_piece_generation.R`:

1. Dispatch case `generate_pieces_internal()`
2. Fusion handling if PILES notation

```r
# In the switch/dispatch
"<type>" = generate_<type>_pieces_internal(params, seed)
```

**→** Pieces generated on dispatch.

**If err:** Confirm dispatch string exact, `generate_<type>_pieces_internal` defined + exported.

### Step 4: Wire piece_positioning.R

Edit `R/piece_positioning.R`:

Add positioning dispatch. Most use shared, some need custom.

**→** `apply_piece_positioning()` handles new type no err, pieces at correct coords.

**If err:** Check if needs custom or reuse shared path. Add dispatch if default no apply.

### Step 5: Wire unified_renderer.R

Edit `R/unified_renderer.R`:

1. Render case `render_puzzle_svg()`
2. Edge path fn: `get_<type>_edge_paths()`
3. Piece name fn: `get_<type>_piece_name()`

**→** SVG out generated new type, correct outlines + edge paths.

**If err:** Verify `get_<type>_edge_paths()` returns valid SVG path, `get_<type>_piece_name()` unique IDs.

### Step 6: Wire adjacency_api.R

Edit `R/adjacency_api.R`:

Neighbor dispatch → `get_neighbors()` + `get_adjacency()` work.

**→** `get_neighbors(result, piece_id)` returns correct neighbors.

**If err:** Check dispatch returns correct structure. Test small grid, manually verify against geometry.

### Step 7: ggpuzzle Geom Layer

Edit `R/geom_puzzle.R`:

`geom_puzzle_<type>()` using `make_puzzle_layer()`:

```r
#' @export
geom_puzzle_<type> <- function(mapping = NULL, data = NULL, ...) {
  make_puzzle_layer(type = "<type>", mapping = mapping, data = data, ...)
}
```

**→** `ggplot() + geom_puzzle_<type>(aes(...))` renders no err.

**If err:** Verify `make_puzzle_layer()` correct type, geom exported via `@export`.

### Step 8: Stat Dispatch

Edit `R/stat_puzzle.R`:

1. Type-specific default params
2. Dispatch case `compute_panel()`

**→** Stat layer computes geometry, produces expected polygons.

**If err:** `compute_panel()` dispatch returns df w/ `x`, `y`, `group`, `piece_id`, defaults sensible.

### Step 9: DESCRIPTION

Edit `DESCRIPTION`:

1. New type in Description text
2. New pkgs → `Suggests:`
3. `Collate:` include new R file (alphabetical)

**→** `devtools::document()` succeeds. No NOTE unlisted files.

**If err:** New R file in `Collate:` alphabetical, new Suggests pkgs spelled correct w/ ver constraints.

### Step 10: config.yml

Edit `inst/config.yml`:

Defaults + constraints:

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

**→** Config valid YAML. Defaults → working puzzle via `generate_puzzle()`.

**If err:** Validate `yaml::yaml.load_file("inst/config.yml")`. Defaults sensible (not too small/large).

### Step 11: Shiny App

Edit `inst/shiny-app/app.R`:

1. Add type → UI selector
2. Conditional UI panels type-specific params
3. Server-side generation

**→** Shiny shows new type, generates on select.

**If err:** Type in `choices` of selector, conditional panel `conditionalPanel(condition = "input.type == '<type>'")`, server passes correct params.

### Step 12: Test Suite

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

External dep → `skip_if_not_installed()`.

**→** All pass. No skips unless dep missing.

**If err:** Check each point individually. Common: missing dispatch → `grep -rn "switch\|valid_types" R/`.

## Check

- [ ] `generate_puzzle(type = "<type>")` produces valid out
- [ ] All 10 points wired
- [ ] `devtools::test()` passes new tests
- [ ] `devtools::check()` → 0 err, 0 warn
- [ ] Shiny renders new type
- [ ] Config constraints enforced (min/max valid.)
- [ ] Adjacency + fusion work
- [ ] ggpuzzle geom renders no err
- [ ] `devtools::document()` succeeds (NAMESPACE updated)

## Traps

- **Missing dispatch**: One of 10+ files forgotten → silent fail or "unknown type"
- **strsplit neg nums**: `paste(a, b, sep = "-")` → `"1--1"`. Use `"|"` + split `"\\|"`.
- **`cat()` for out**: Always `cli` logging wrappers (`log_info`, `log_warn`, etc.)
- **Collate order**: alphabetical or dep-ordered
- **config.yml format**: Valid YAML; test `yaml::yaml.load_file("inst/config.yml")`

## →

- `generate-puzzle` — test new type after scaffold
- `run-puzzle-tests` — full suite verify integration
- `validate-piles-notation` — test fusion w/ new type
- `write-testthat-tests` — general test patterns
- `write-roxygen-docs` — document new geom fn
