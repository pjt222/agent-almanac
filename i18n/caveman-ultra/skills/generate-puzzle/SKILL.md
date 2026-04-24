---
name: generate-puzzle
locale: caveman-ultra
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

jigsawR unified API → generate puzzle.

## Use When

- Create puzzle SVG w/ type + config
- Test generation w/ diff params
- Sample out for docs/demos
- ggplot2 puzzle viz w/ geom_puzzle_*()

## In

- **Required**: type (`"rectangular"`, `"hexagonal"`, `"concentric"`, `"voronoi"`, `"random"`, `"snic"`)
- **Required**: grid (type-dep: `c(cols, rows)` or `c(rings)`)
- **Optional**: size mm (default varies)
- **Optional**: seed (default 42)
- **Optional**: offset (0=interlocked, >0=separated)
- **Optional**: layout (`"grid"` or `"repel"` rect)
- **Optional**: fusion groups (PILES string)

## Do

### Step 1: Read config constraints

```bash
R_EXE="/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe"
"$R_EXE" -e "cat(yaml::yaml.load_file('inst/config.yml')[['{TYPE}']]$grid$max)"
```

Or read `inst/config.yml` direct → valid ranges for type.

→ min/max for grid, size, tabsize known for type.

**If err:** `config.yml` missing or type key missing → in jigsawR root? pkg built once?

### Step 2: Determine type + params

| Type | grid | size | Extra params |
|------|------|------|-------------|
| rectangular | `c(cols, rows)` | `c(width, height)` mm | `offset`, `layout`, `tabsize` |
| hexagonal | `c(rings)` | `c(diameter)` mm | `do_warp`, `do_trunc`, `tabsize` |
| concentric | `c(rings)` | `c(diameter)` mm | `center_shape`, `tabsize` |
| voronoi | `c(cols, rows)` | `c(width, height)` mm | `n_interior`, `tabsize` |
| random | `c(cols, rows)` | `c(width, height)` mm | `n_interior`, `tabsize` |
| snic | `c(cols, rows)` | `c(width, height)` mm | `n_interior`, `compactness`, `tabsize` |

→ Req mapped to `generate_puzzle()` args, values in config.yml range.

**If err:** unsure format → see table. Rect + voronoi → `c(cols, rows)`; hex + concentric → `c(rings)`.

### Step 3: Create R script

Script file preferred over `-e` for complex cmds.

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

Save to tmp script file.

→ R script saved w/ `library(jigsawR)` + call + diag output.

**If err:** syntax → verify string quoting + `c()` for num vectors. Use script files, avoid shell escape.

### Step 4: Execute via WSL R

```bash
R_EXE="/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe"
"$R_EXE" /path/to/script.R
```

→ Completes no errors. SVG → `output/`.

**If err:** check renv restored (`renv::restore()`). Pkg loaded (`devtools::load_all()`). NO `--vanilla` (renv needs .Rprofile).

### Step 5: Verify out

- SVG in `output/`
- Starts `<?xml` or `<svg`
- Piece count matches: cols × rows (rect), ring formula (hex/concentric)
- ggplot2 → plot renders no err

→ SVG exists, content valid, piece count matches.

**If err:** SVG missing → check `output/` exists. Count wrong → verify grid for type. ggplot2 → wrap `tryCatch()`.

### Step 6: Save out

Default → `output/`. `result` contains:
- `$svg_content` — raw SVG string
- `$pieces` — piece data list
- `$canvas_size` — dims
- `$files` — paths

→ `result` has `$svg_content`, `$pieces`, `$canvas_size`, `$files`. Files on disk.

**If err:** `$files` empty → in-memory only. Explicitly: `writeLines(result$svg_content, "output/puzzle.svg")`.

## Check

- [ ] Script no err
- [ ] SVG well-formed XML
- [ ] Piece count matches grid
- [ ] Same seed → identical out
- [ ] Params in config.yml range

## Traps

- **`--vanilla`**: breaks renv. Never.
- **Complex `-e`**: script files → shell escape → Exit 5.
- **Grid vs size**: grid=piece count, size=physical mm.
- **Offset**: 0=assembled, >0=exploded.
- **SNIC**: needs `snic` pkg installed.

## →

- `add-puzzle-type` — scaffold new type E2E
- `validate-piles-notation` — validate fusion strings pre-call
- `run-puzzle-tests` — test suite after gen changes
- `write-testthat-tests` — tests for new scenarios
