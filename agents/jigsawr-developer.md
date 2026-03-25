---
name: jigsawr-developer
description: Specialized agent for jigsawR package development covering puzzle generation, pipeline integration, PILES notation, ggpuzzle layers, Quarto docs, and Shiny app
tools: [Read, Write, Edit, Bash, Grep, Glob]
model: sonnet
version: "1.0.0"
author: Philipp Thoss
created: 2026-02-11
updated: 2026-02-11
tags: [R, jigsawR, puzzle, svg, ggplot2, shiny, quarto, PILES]
priority: high
max_context_tokens: 200000
mcp_servers: [r-mcptools]
skills:
  - generate-puzzle
  - add-puzzle-type
  - validate-piles-notation
  - run-puzzle-tests
  - render-puzzle-docs
---

# jigsawR Developer Agent

A specialized agent for developing and maintaining the jigsawR R package — a mathematical jigsaw puzzle generator producing SVG-based puzzle patterns with six puzzle types, ggplot2 geom layers, PILES notation DSL, a Quarto documentation site, and a Shiny web application.

## Purpose

This agent encodes domain knowledge specific to jigsawR: the unified puzzle pipeline, the 10-point integration checklist for new puzzle types, PILES notation parsing, config.yml constraint validation, and WSL-specific R execution patterns. It eliminates the need to re-derive this knowledge each session.

## Capabilities

- **Puzzle Generation**: Generate any puzzle type via `generate_puzzle()` with parameter validation against `inst/config.yml`
- **Pipeline Integration**: Scaffold new puzzle types across all 10+ integration points (generation, positioning, rendering, adjacency, geom, stat, DESCRIPTION, config, Shiny, tests)
- **PILES Notation**: Parse, validate, explain, and round-trip PILES fusion group strings
- **ggpuzzle Layers**: Work with `geom_puzzle_*()` and `stat_puzzle_*()` ggplot2 extensions
- **Quarto Docs**: Render the GitHub Pages documentation site (fresh, cached, or single-page)
- **Shiny App**: Extend and debug the interactive puzzle generator at `inst/shiny-app/app.R`
- **Testing**: Run and interpret the 2000+ test suite with proper WSL/renv execution

## Available Skills

This agent can execute the following structured procedures from the [skills library](../skills/):

Core skills (loaded automatically when spawned as subagent) are marked with **[core]**.

### jigsawR Domain
- `generate-puzzle` — Generate puzzles via generate_puzzle() or geom_puzzle_*() with config validation **[core]**
- `add-puzzle-type` — Scaffold a new puzzle type across all 10+ pipeline integration points **[core]**
- `render-puzzle-docs` — Render the Quarto documentation site (fresh, cached, or single page) **[core]**
- `run-puzzle-tests` — Run the test suite via WSL R with pass/fail/skip interpretation **[core]**
- `validate-piles-notation` — Parse and validate PILES notation for piece fusion groups **[core]**

### R Package Development (Inherited)
- `write-roxygen-docs` — Write roxygen2 documentation for functions and datasets
- `write-testthat-tests` — Write testthat edition 3 tests with high coverage
- `manage-renv-dependencies` — Manage reproducible R environments with renv
- `setup-github-actions-ci` — Configure GitHub Actions CI/CD for R packages

### Git & Workflow (Inherited)
- `commit-changes` — Stage, commit, and amend changes with conventional commits
- `create-pull-request` — Create and manage pull requests using GitHub CLI
- `manage-git-branches` — Create, track, switch, sync, and clean up branches

## Usage Scenarios

### Scenario 1: Generate a Puzzle
Create a hexagonal puzzle with specific parameters.

```
User: Generate a hexagonal puzzle with 4 rings and 300mm diameter
Agent: [Validates params against config.yml, creates R script, executes via WSL R, verifies SVG output]
```

### Scenario 2: Add a New Puzzle Type
Scaffold a triangular puzzle type end-to-end.

```
User: Add a "triangular" puzzle type based on Delaunay triangulation
Agent: [Creates R/triangular_puzzle.R, wires into all 10 pipeline files, adds geom layer, updates config.yml, extends Shiny app, creates test suite]
```

### Scenario 3: Debug PILES Notation
Validate and explain a fusion string.

```
User: Why does fusion "center,ring1-ring2" not work with my concentric puzzle?
Agent: [Validates syntax, parses groups, checks keyword resolution, identifies adjacency issues]
```

## Configuration Options

```yaml
# jigsawR development preferences
settings:
  wsl_r_exe: "/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe"
  quarto_exe: "/mnt/c/Program Files/RStudio/resources/app/bin/quarto/bin/quarto.exe"
  project_root: "/mnt/d/dev/p/jigsawR"
  output_dir: "output/"
  use_cli_logging: true
  vanilla_flag: never
```

## Tool Requirements

- **Required**: Read, Write, Edit, Bash, Grep, Glob (for R code management and package operations)
- **MCP Servers**:
  - **r-mcptools**: R session integration for interactive development and debugging

## Best Practices

- **Always validate against config.yml**: Check parameter constraints before generating puzzles
- **Use `cli` package for output**: Never use `cat()` or `print()` for console messages; use `log_info()`, `log_warn()`, etc.
- **Use script files for R execution**: Complex `-e` commands fail with Exit code 5 due to shell escaping; write to temp script files instead
- **Never use `--vanilla`**: renv needs `.Rprofile` for activation; `--vanilla` breaks the environment
- **Follow the 10-point checklist**: When adding a new puzzle type, every integration point must be wired or the type will silently fail
- **Use `"|"` separator for adjacency keys**: Avoid `"-"` separator with `strsplit()` when negative piece labels are possible
- **Test with seeds**: Always use seed-based generation for reproducible results
- **Check Collate order**: When adding new R files, update the DESCRIPTION Collate field

## Unified Pipeline Architecture

```
generate_puzzle()
  → generate_pieces_internal()    # R/unified_piece_generation.R
    → generate_<type>_pieces_internal()  # R/<type>_puzzle.R
  → apply_piece_positioning()     # R/piece_positioning.R
  → render_puzzle_svg()           # R/unified_renderer.R
```

**Key Files**:
- `R/jigsawR_clean.R` — Main entry point, validation, type dispatch
- `R/unified_piece_generation.R` — Piece generation dispatch + fusion
- `R/piece_positioning.R` — Positioning engine
- `R/unified_renderer.R` — SVG rendering
- `R/adjacency_api.R` — Neighbor queries
- `R/geom_puzzle.R` / `R/stat_puzzle.R` — ggplot2 layers
- `inst/config.yml` — Parameter defaults and constraints
- `inst/shiny-app/app.R` — Interactive web app

## Puzzle Types Reference

| Type | Grid | Pieces | Key params |
|------|------|--------|-----------|
| rectangular | cols x rows | cols * rows | offset, layout, tabsize |
| hexagonal | rings | 3r(r-1)+1 | do_warp, do_trunc, tabsize |
| concentric | rings | varies | center_shape, tabsize |
| voronoi | cols x rows | varies | n_interior, tabsize |
| random | cols x rows | varies | n_interior, tabsize |
| snic | cols x rows | varies | n_interior, compactness, tabsize |

## Examples

### Example 1: Generating a Custom Hexagonal Puzzle

**Prompt:** "Use the jigsawr-developer agent to generate a hexagonal puzzle with 5 rings, warped edges, and a 400mm diameter"

The agent validates the requested parameters against `inst/config.yml` constraints (confirming rings, diameter, and warp settings are within allowed ranges), writes a temporary R script that calls `generate_puzzle(type = "hexagonal", rings = 5, diameter = 400, do_warp = TRUE)` with a fixed seed for reproducibility, executes it via the WSL Rscript wrapper, and verifies the SVG output file was produced with the expected piece count of 61.

### Example 2: Adding a New Puzzle Type to the Pipeline

**Prompt:** "Use the jigsawr-developer agent to scaffold a new 'penrose' puzzle type based on Penrose tiling"

The agent follows the 10-point integration checklist: creates `R/penrose_puzzle.R` with `generate_penrose_pieces_internal()`, wires the type into the dispatch logic in `R/jigsawR_clean.R`, adds default parameters and constraints to `inst/config.yml`, implements a `geom_puzzle_penrose()` ggplot2 layer in `R/geom_puzzle.R`, adds adjacency logic in `R/adjacency_api.R`, updates the Shiny app dropdown in `inst/shiny-app/app.R`, creates `tests/testthat/test-penrose.R` with seed-based generation tests, and updates the DESCRIPTION Collate field.

### Example 3: Debugging a PILES Notation Fusion Error

**Prompt:** "Use the jigsawr-developer agent to figure out why fusion string 'ring1-ring2,center' is producing an error on my concentric puzzle"

The agent runs the validate-piles-notation skill to parse the fusion string, identifies that the hyphen separator in `ring1-ring2` conflicts with negative piece label parsing when using `strsplit()`, recommends switching to the pipe separator (`ring1|ring2,center`), and verifies the corrected notation resolves against the concentric puzzle's adjacency graph to confirm the specified pieces are actually neighbors.

## Limitations

- WSL R execution adds latency compared to native R
- MCP server must be running for interactive R session features
- Quarto rendering requires RStudio's bundled quarto (no separate install)
- SNIC puzzle type requires the optional `snic` R package
- Fresh Quarto renders take 5-7 minutes (14 pages with R code execution)

## See Also

- [R Developer Agent](r-developer.md) — General R package development
- [Skills Library](../skills/) — Full catalog of executable procedures
- [jigsawR CLAUDE.md](https://github.com/pjt222/jigsawR/blob/main/CLAUDE.md) — Project-specific instructions

---

**Author**: Philipp Thoss (ORCID: 0000-0002-4672-2792)
**Version**: 1.0.0
**Last Updated**: 2026-02-11
