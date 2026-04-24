---
name: generate-puzzle
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
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

Make jigsaw puzzles with jigsawR package unified API.

## When Use

- Make puzzle SVG files for specific type + config
- Test puzzle generation with different parameters
- Make sample output for docs or demos
- Make ggplot2 puzzle visualizations with geom_puzzle_*()

## Inputs

- **Required**: Puzzle type (`"rectangular"`, `"hexagonal"`, `"concentric"`, `"voronoi"`, `"random"`, `"snic"`)
- **Required**: Grid dimensions (type-dependent: `c(cols, rows)` or `c(rings)`)
- **Optional**: Size in mm (default varies by type)
- **Optional**: Seed for reproducibility (default: 42)
- **Optional**: Offset (0 = interlocked, >0 = separated pieces)
- **Optional**: Layout (`"grid"` or `"repel"` for rectangular)
- **Optional**: Fusion groups (PILES notation string)

## Steps

### Step 1: Read Config Constraints

```bash
R_EXE="/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe"
"$R_EXE" -e "cat(yaml::yaml.load_file('inst/config.yml')[['{TYPE}']]$grid$max)"
```

Or read `inst/config.yml` direct to check valid ranges for chosen type.

**Got:** Min/max values for grid, size, tabsize, other parameters known for chosen puzzle type.

**If fail:** `config.yml` missing or type key absent? Check in jigsawR project root + package built at least once.

### Step 2: Pick Type + Parameters

Map user request to valid `generate_puzzle()` args:

| Type | grid | size | Extra params |
|------|------|------|-------------|
| rectangular | `c(cols, rows)` | `c(width, height)` mm | `offset`, `layout`, `tabsize` |
| hexagonal | `c(rings)` | `c(diameter)` mm | `do_warp`, `do_trunc`, `tabsize` |
| concentric | `c(rings)` | `c(diameter)` mm | `center_shape`, `tabsize` |
| voronoi | `c(cols, rows)` | `c(width, height)` mm | `n_interior`, `tabsize` |
| random | `c(cols, rows)` | `c(width, height)` mm | `n_interior`, `tabsize` |
| snic | `c(cols, rows)` | `c(width, height)` mm | `n_interior`, `compactness`, `tabsize` |

**Got:** User request mapped to valid `generate_puzzle()` args with correct `type`, `grid` dimensions, `size` in config.yml ranges.

**If fail:** Unsure of parameter format? See table. Rectangular + voronoi use `c(cols, rows)`; hexagonal + concentric use `c(rings)`.

### Step 3: Make R Script

Write script file (preferred over `-e` for complex commands):

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

Save to temporary script file.

**Got:** R script file at temporary location, contains `library(jigsawR)`, `generate_puzzle()` call with all parameters, diagnostic output lines.

**If fail:** Script syntax errors? Verify string args quoted + numeric vectors use `c()`. Skip complex shell escaping — always use script files.

### Step 4: Execute via WSL R

```bash
R_EXE="/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe"
"$R_EXE" /path/to/script.R
```

**Got:** Script done no errors. SVG file(s) written to `output/`.

**If fail:** Check renv restored (`renv::restore()`). Verify package loaded (`devtools::load_all()`). NO `--vanilla` flag (renv needs .Rprofile).

### Step 5: Verify Output

- SVG file exists in `output/` directory
- SVG content starts with `<?xml` or `<svg`
- Piece count matches expected: cols * rows (rectangular), ring formula (hex/concentric)
- ggplot2 approach: plot object renders no error

**Got:** SVG file exists in `output/`, starts with `<?xml` or `<svg`, piece count matches grid (cols * rows rectangular, ring formula hex/concentric).

**If fail:** SVG file missing? Check `output/` directory exists. Piece count wrong? Verify grid matches puzzle type formula. ggplot2 output → check plot renders by wrap in `tryCatch()`.

### Step 6: Save Output

Generated files saved to `output/` default. `result` object contains:
- `$svg_content` — raw SVG string
- `$pieces` — list of piece data
- `$canvas_size` — dimensions
- `$files` — paths to written files

**Got:** `result` object has `$svg_content`, `$pieces`, `$canvas_size`, `$files` fields. Files listed in `$files` exist on disk.

**If fail:** `$files` empty? Puzzle may have generated in-memory only. Save explicit with `writeLines(result$svg_content, "output/puzzle.svg")`.

## Checks

- [ ] Script executes no errors
- [ ] SVG file well-formed XML
- [ ] Piece count matches grid
- [ ] Same seed → identical output (reproducibility)
- [ ] Parameters in config.yml constraints

## Pitfalls

- **`--vanilla` flag**: Breaks renv activation. Never use.
- **Complex `-e` commands**: Use script files; shell escaping → Exit code 5.
- **Grid vs size confusion**: Grid = piece count, size = physical dimensions in mm.
- **Offset semantics**: 0 = assembled puzzle, positive = exploded/separated pieces.
- **SNIC without package**: snic type needs `snic` package installed.

## See Also

- `add-puzzle-type` — scaffold new puzzle type end-to-end
- `validate-piles-notation` — validate fusion group strings before generate_puzzle()
- `run-puzzle-tests` — run test suite after generation changes
- `write-testthat-tests` — add tests for new generation scenarios
