---
name: generate-puzzle
description: >
  Generate jigsaw puzzles via generate_puzzle() or geom_puzzle_*() with
  parameter validation against inst/config.yml. Supports rectangular,
  hexagonal, concentric, voronoi, and snic puzzle types with configurable
  grid, size, seed, offset, and layout parameters. Use when creating puzzle
  SVG files for a specific type and configuration, testing generation with
  different parameters, generating sample output for documentation or demos,
  or creating ggplot2 puzzle visualizations.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: jigsawr
  complexity: basic
  language: R
  tags: jigsawr, puzzle, svg, generation, ggplot2
---

# Generate Puzzle

Generate jigsaw puzzles using the jigsawR package's unified API.

## When to Use

- Creating puzzle SVG files for a specific type and configuration
- Testing puzzle generation with different parameters
- Generating sample output for documentation or demos
- Creating ggplot2 puzzle visualizations with geom_puzzle_*()

## Inputs

- **Required**: Puzzle type (`"rectangular"`, `"hexagonal"`, `"concentric"`, `"voronoi"`, `"random"`, `"snic"`)
- **Required**: Grid dimensions (type-dependent: `c(cols, rows)` or `c(rings)`)
- **Optional**: Size in mm (default varies by type)
- **Optional**: Seed for reproducibility (default: 42)
- **Optional**: Offset (0 = interlocked, >0 = separated pieces)
- **Optional**: Layout (`"grid"` or `"repel"` for rectangular)
- **Optional**: Fusion groups (PILES notation string)

## Procedure

### Step 1: Read Config Constraints

```bash
R_EXE="/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe"
"$R_EXE" -e "cat(yaml::yaml.load_file('inst/config.yml')[['{TYPE}']]$grid$max)"
```

Or read `inst/config.yml` directly to check valid ranges for the chosen type.

**Expected:** The min/max values for grid, size, tabsize, and other parameters are known for the chosen puzzle type.

**On failure:** If `config.yml` is missing or the type key doesn't exist, check that you are in the jigsawR project root and the package has been built at least once.

### Step 2: Determine Type and Parameters

Map the user's request to valid `generate_puzzle()` arguments:

| Type | grid | size | Extra params |
|------|------|------|-------------|
| rectangular | `c(cols, rows)` | `c(width, height)` mm | `offset`, `layout`, `tabsize` |
| hexagonal | `c(rings)` | `c(diameter)` mm | `do_warp`, `do_trunc`, `tabsize` |
| concentric | `c(rings)` | `c(diameter)` mm | `center_shape`, `tabsize` |
| voronoi | `c(cols, rows)` | `c(width, height)` mm | `n_interior`, `tabsize` |
| random | `c(cols, rows)` | `c(width, height)` mm | `n_interior`, `tabsize` |
| snic | `c(cols, rows)` | `c(width, height)` mm | `n_interior`, `compactness`, `tabsize` |

**Expected:** User request mapped to valid `generate_puzzle()` arguments with correct `type`, `grid` dimensions, and `size` values within the ranges from config.yml.

**On failure:** If unsure which parameter format to use, refer to the table above. Rectangular and voronoi types use `c(cols, rows)` for grid; hexagonal and concentric use `c(rings)`.

### Step 3: Create R Script

Write a script file (preferred over `-e` for complex commands):

```r
library(jigsawR)

result <- generate_puzzle(
  type = "rectangular",
  seed = 42,
  grid = c(3, 4),
  size = c(400, 300),
  offset = 0,
  layout = "grid"
)

cat("Pieces:", length(result$pieces), "\n")
cat("SVG length:", nchar(result$svg_content), "\n")
cat("Files:", paste(result$files, collapse = ", "), "\n")
```

Save to a temporary script file.

**Expected:** An R script file saved to a temporary location containing `library(jigsawR)`, a `generate_puzzle()` call with all parameters, and diagnostic output lines.

**On failure:** If the script has syntax errors, verify that all string arguments are quoted and numeric vectors use `c()`. Avoid complex shell escaping by always using script files.

### Step 4: Execute via WSL R

```bash
R_EXE="/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe"
"$R_EXE" /path/to/script.R
```

**Expected:** Script completes without errors. SVG file(s) written to `output/`.

**On failure:** Check that renv is restored (`renv::restore()`). Verify package is loaded (`devtools::load_all()`). Do NOT use `--vanilla` flag (renv needs .Rprofile).

### Step 5: Verify Output

- SVG file exists in `output/` directory
- SVG content starts with `<?xml` or `<svg`
- Piece count matches expected: cols * rows (rectangular), ring formula (hex/concentric)
- For ggplot2 approach, verify the plot object renders without error

**Expected:** SVG file exists in `output/`, content starts with `<?xml` or `<svg`, and piece count matches the grid specification (cols * rows for rectangular, ring formula for hex/concentric).

**On failure:** If SVG file is missing, check the `output/` directory exists. If piece count is wrong, verify grid dimensions match the puzzle type's expected formula. For ggplot2 output, check that the plot renders without error by wrapping in `tryCatch()`.

### Step 6: Save Output

Generated files are saved to `output/` by default. The `result` object contains:
- `$svg_content` — raw SVG string
- `$pieces` — list of piece data
- `$canvas_size` — dimensions
- `$files` — paths to written files

**Expected:** The `result` object contains `$svg_content`, `$pieces`, `$canvas_size`, and `$files` fields. Files listed in `$files` exist on disk.

**On failure:** If `$files` is empty, the puzzle may have generated in-memory only. Explicitly save with `writeLines(result$svg_content, "output/puzzle.svg")`.

## Validation

- [ ] Script executes without errors
- [ ] SVG file is well-formed XML
- [ ] Piece count matches grid specification
- [ ] Same seed produces identical output (reproducibility)
- [ ] Parameters are within config.yml constraints

## Common Pitfalls

- **Using `--vanilla` flag**: Breaks renv activation. Never use it.
- **Complex `-e` commands**: Use script files instead; shell escaping causes Exit code 5.
- **Grid vs size confusion**: Grid is piece count, size is physical dimensions in mm.
- **Offset semantics**: 0 = assembled puzzle, positive = exploded/separated pieces.
- **SNIC without package**: snic type requires the `snic` package installed.

## Related Skills

- `add-puzzle-type` — scaffold a new puzzle type end-to-end
- `validate-piles-notation` — validate fusion group strings before passing to generate_puzzle()
- `run-puzzle-tests` — run the test suite after generation changes
- `write-testthat-tests` — add tests for new generation scenarios
