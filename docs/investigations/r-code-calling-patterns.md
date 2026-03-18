# Investigation: How agent-almanac Handles Calling R Code

**Date**: 2026-03-18
**Investigator**: Claude Opus 4.6 (1M context)
**Scope**: Full review of R code execution, configuration, documentation, and MCP integration across the agent-almanac repository
**Status**: Complete

---

## Executive Summary

The agent-almanac project uses R as its second runtime (after Node.js), primarily for the viz/ icon generation pipeline. This investigation cataloged 40 R files, 48 skills documenting R procedures, 5 agents with MCP server integration, and the full R configuration stack. Ten findings were verified with file:line evidence across four severity levels.

**Overall health**: The active R pipeline is well-engineered with robust error handling and a clever renv workaround for the drvfs deadlock. However, documentation has drifted significantly from the actual R version (4.5.0 vs 4.5.2) across 38 files, one build script bypasses the renv workaround, and there is zero CI coverage for R code.

---

## 1. R Code Calling Taxonomy

### Category A: Active Execution (viz/ pipeline)

| File | Role | Invoked By |
|------|------|------------|
| `viz/generate-palette-colors.R` | Palette JSON/JS generation | build.sh step 1, docker-entrypoint.sh step 1 |
| `viz/build-all-icons.R` | Orchestrator (skill/agent/team) | build.sh step 4, docker-entrypoint.sh step 4 |
| `viz/build-icons.R` | Skill domain icon generation | build-all-icons.R via system() |
| `viz/build-agent-icons.R` | Agent persona icon generation | build-all-icons.R via system() |
| `viz/build-team-icons.R` | Team composition icon generation | build-all-icons.R via system() |
| `viz/build-favicon.R` | Favicon + logo suite | package.json ("build-favicon") |
| `viz/build-wordmark.R` | Text wordmark SVGs | Manual (Rscript build-wordmark.R) |
| `viz/build-workflow.R` | Mermaid diagram from PUT annotations | package.json ("build-workflow") |
| `viz/profile-render.R` | Pipeline benchmarking | Manual |

**29 R modules** in `viz/R/` provide the shared library:
- Core: `utils.R`, `primitives.R` (+ `primitives_2.R` through `primitives_19.R`), `palettes.R`, `render.R`, `glyphs.R`
- Agent pipeline: `agent_primitives.R`, `agent_glyphs.R`, `agent_render.R`, `agent_colors.R`
- Team pipeline: `team_primitives.R`, `team_glyphs.R`, `team_render.R`, `team_colors.R`

**2 test files** in `viz/tests/`: `run-tests.R`, `testthat/test-utils.R`

**Health**: HEALTHY (pipeline works, renv workaround is robust, parallel rendering is performant)

### Category B: MCP Integration

| Agent | MCP Servers | Status |
|-------|-------------|--------|
| r-developer | r-mcptools, r-mcp-server | r-mcptools: configured; r-mcp-server: NOT configured |
| shiny-developer | r-mcptools | Configured |
| jigsawr-developer | r-mcptools | Configured |
| designer | hf-mcp-server | Configured (not R) |
| nlp-specialist | hf-mcp-server | Configured (not R) |

**Health**: STALE (r-mcp-server listed but not configured; rcon server documented but not assigned)

### Category C: Documented R Examples (skills + guides)

- **48 skills** contain R code blocks across 17 domains (r-packages, shiny, compliance, reporting, mcp-integration, containerization, workflow-visualization, jigsawr, data-serialization, citations, general, review, diffusion, hildegard, entomology, spectroscopy, chromatography)
- **4 guides** contain R content: r-package-development.md, setting-up-your-environment.md, quick-reference.md, visualizing-workflows-with-putior.md
- **53 `library()` calls** in skills — all legitimate (interactive scripts, vignettes, standalone tools, documentation references; zero violations of the `::` rule)

**Health**: STALE (14+ stale R version references in English sources, 31 in translations)

### Category D: Configuration

| File | Role | R Version |
|------|------|-----------|
| `viz/renv.lock` | Dependency lockfile | 4.5.2 (canonical) |
| `viz/Dockerfile:8` | Container base image | 4.5.2 (correct) |
| `viz/.Rprofile` | renv workaround (reference impl) | N/A (version-agnostic) |
| `tests/results/.Rprofile` | renv workaround (test copy) | N/A (missing arch walk-down) |
| `.claude/settings.local.json:14` | Bash permission for Rscript | 4.5.2 (correct) |
| `viz/build.sh` | Pipeline entry point | Bare `Rscript` (PATH-dependent) |
| `viz/docker-entrypoint.sh` | Docker pipeline entry | Bare `Rscript` (container-local, correct) |

**Health**: MOSTLY HEALTHY (one .Rprofile copy is stale)

---

## 2. Source Dependency Graph

```
build-all-icons.R (orchestrator)
├── system("Rscript build-icons.R ...")
│   └── R/utils.R, R/primitives.R–19.R, R/glyphs.R, R/render.R, R/palettes.R
├── system("Rscript build-agent-icons.R ...")
│   └── R/utils.R, R/primitives.R, R/render.R, R/palettes.R, R/agent_*.R
└── system("Rscript build-team-icons.R ...")
    └── R/utils.R, R/primitives.R, R/render.R, R/palettes.R, R/team_*.R

build-wordmark.R
├── renv/activate.R ← CRITICAL: direct source (deadlock risk)
└── R/utils.R, R/primitives.R, R/palettes.R

build-favicon.R
└── R/utils.R, R/primitives.R, R/palettes.R

generate-palette-colors.R
└── R/utils.R, R/palettes.R
```

No circular dependencies. All builds root through `R/utils.R` for logging and CLI parsing.

---

## 3. Verified Findings

### Finding 1: build-wordmark.R sources renv/activate.R directly [CRITICAL]

**File**: `viz/build-wordmark.R:24-26`
```r
activate_path <- file.path(script_dir, "renv", "activate.R")
if (file.exists(activate_path)) source(activate_path)
```

**Impact**: This call will deadlock on NTFS/drvfs mounts due to the p9_client_rpc issue documented in `viz/.Rprofile:1-5` and `memory/patterns.md:79`. Every other build script relies on the `.Rprofile` workaround. This script is the sole exception.

**Evidence**: The `.Rprofile` comment explicitly states: "renv activation via source('renv/activate.R') hangs on this project — both WSL-native R and Windows R/Rscript."

**Likelihood**: Certain (will hang every time on `/mnt/d/`)
**Severity**: CRITICAL (script cannot complete)

**Recommendation**: Replace lines 24-26 with the `get_script_dir()` + `.Rprofile`-based approach used by all other build scripts, or remove the explicit activate.R source entirely (the `.Rprofile` in CWD already handles renv activation).

---

### Finding 2: R version drift — 40 files reference stale R-4.5.0 [CRITICAL]

**Canonical version**: R 4.5.2 (per `viz/renv.lock:3` and `viz/Dockerfile:8`)
**Correct references**: `viz/Dockerfile`, `viz/renv.lock`, `.claude/settings.local.json`

**Stale English files (11)** — 29 occurrences:

| File | Occurrences | Context |
|------|-------------|---------|
| `guides/setting-up-your-environment.md` | 9 | Path examples, wrapper scripts |
| `guides/quick-reference.md` | 3 | Path examples |
| `guides/visualizing-workflows-with-putior.md` | 2 | R path examples |
| `skills/create-r-dockerfile/SKILL.md` | 4 | Dockerfile examples (rocker/r-ver:4.5.0) |
| `skills/optimize-docker-build-cache/SKILL.md` | 3 | Dockerfile examples (rocker/r-ver:4.5.0) |
| `skills/configure-mcp-server/SKILL.md` | 2 | Rscript path examples |
| `skills/generate-puzzle/SKILL.md` | 2 | Rscript path examples |
| `skills/containerize-mcp-server/SKILL.md` | 1 | Dockerfile example (rocker/r-ver:4.5.0) |
| `skills/troubleshoot-mcp-connection/SKILL.md` | 1 | Verification command |
| `skills/run-puzzle-tests/SKILL.md` | 1 | Rscript path example |
| `agents/jigsawr-developer.md` | 1 | Rscript path |

**Stale translation files (29)**: All 4 locales (de: 7 files, ja: 7 files, zh-CN: 7 files, es: 5 files + 1 guide each where translated) mirror the English stale references.

**Total**: 89 occurrences across 40 files (11 English + 29 translations).

**Likelihood**: Certain (version is factually wrong)
**Severity**: CRITICAL (users following these examples will reference a stale R installation)

**Recommendation**: Global find-and-replace `R-4.5.0` → `R-4.5.2` and `r-ver:4.5.0` → `r-ver:4.5.2` across all 40 files. The `guides/setting-up-your-environment.md` "version 4.5.x recommended" phrasing (line 25) is acceptable as-is since it's a general recommendation.

---

### Finding 3: tests/results/.Rprofile missing arch walk-down [IMPORTANT]

**File**: `tests/results/.Rprofile:15-16`
```r
r_dirs <- list.files(lib_dir, full.names = TRUE)
if (length(r_dirs) > 0) {
  .libPaths(c(r_dirs[1], .libPaths()))
```

**Reference implementation** (`viz/.Rprofile:18-26`):
```r
r_dirs <- list.files(lib_dir, full.names = TRUE)
if (length(r_dirs) > 0) {
  # Walk into arch subdirectory (e.g. x86_64-pc-linux-gnu/)
  arch_dirs <- list.files(r_dirs[1], full.names = TRUE)
  if (length(arch_dirs) > 0) {
    .libPaths(c(arch_dirs[1], .libPaths()))
  } else {
    .libPaths(c(r_dirs[1], .libPaths()))
  }
```

**Impact**: The tests/results/.Rprofile stops at the R-version directory without descending into the architecture subdirectory (e.g., `x86_64-pc-linux-gnu/`). R won't find packages because they live one level deeper. This was fixed in `viz/.Rprofile` on 2026-03-16 but the fix was not propagated.

**Likelihood**: Certain (structural path mismatch)
**Severity**: IMPORTANT (test R environment may fail to load packages)

**Recommendation**: Copy the arch walk-down logic from `viz/.Rprofile:20-26` into `tests/results/.Rprofile:15-16`.

---

### Finding 4: viz-architecture.md has stale counts [IMPORTANT]

**File**: `memory/viz-architecture.md:71`
```
Current: 297 skills, 62 agents, 12 teams, 52 domains
```

**Actual counts** (from registries):
- Skills: 326 (was 297)
- Agents: 66 (was 62)
- Teams: 15 (was 12)
- Domains: 58 (was 52)

**Lines 19-20** also reference "60 agent persona icons" and "60+ unique glyphs" — actual is 66.
**Line 31** references "11 teams" — actual is 15.

**Likelihood**: Certain
**Severity**: IMPORTANT (memory file provides incorrect counts to future conversations)

**Recommendation**: Update all count references in `memory/viz-architecture.md` to match current registry totals.

---

### Finding 5: No R code tests or CI [IMPORTANT]

**Evidence**: All 6 GitHub Actions workflows are JS/YAML-only:
- `validate-skills.yml` — frontmatter/structure checks
- `validate-tests.yml` — test scenario validation
- `validate-integrity.yml` — structural integrity
- `validate-translations.yml` — translation freshness
- `update-readmes.yml` — README regeneration
- `deploy-pages.yml` — GitHub Pages deployment

Zero workflows reference `Rscript`, `r-lib/actions`, or `setup-r`. The 40 R files in viz/ have only 2 test files (`viz/tests/run-tests.R`, `viz/tests/testthat/test-utils.R`), and `vitest` in `viz/package.json` tests only JavaScript.

**Likelihood**: N/A (gap, not a bug)
**Severity**: IMPORTANT (R regression detection relies entirely on manual runs)

**Recommendation**: Add a minimal R smoke test to CI — at minimum, `Rscript -e "source('viz/R/utils.R'); source('viz/R/palettes.R'); cat('OK\n')"` to catch syntax errors and missing dependencies. Full icon rendering is too heavy for CI but a "can R load the modules?" check is lightweight.

---

### Finding 6: `library()` vs `::` rule needs scoping [IMPORTANT]

**CLAUDE.md states**: "All R examples use `::` for package-qualified calls (e.g., `devtools::check()`) rather than `library()` calls"

**Actual**: 53 `library()` calls across 23 skills. All are legitimate:
- 14 in interactive scripts (Quarto, analysis, Shiny)
- 10 in standalone tool scripts (putior, jigsawR, RefManageR)
- 2 in vignette examples
- 1 in MCP server startup code
- 1 in test infrastructure (standard testthat.R pattern)
- 15 in documentation/reference contexts

**Impact**: The rule as written implies `library()` should never appear, but it correctly applies only to R *package source code* (files in `R/` directories). Skills teaching scripts, Quarto documents, vignettes, and standalone tools legitimately use `library()`.

**Likelihood**: N/A (documentation clarity issue)
**Severity**: IMPORTANT (could cause incorrect "corrections" to valid skill content)

**Recommendation**: Scope the rule in CLAUDE.md: "R *package* source code uses `::` for package-qualified calls. Scripts, Quarto documents, vignettes, and interactive examples may use `library()`."

---

### Finding 7: r-developer agent lists unconfigured r-mcp-server [MINOR]

**File**: `agents/r-developer.md:13`
```yaml
mcp_servers: [r-mcptools, r-mcp-server]
```

Also in `agents/_registry.yml:24`.

**Context**: `guides/setting-up-your-environment.md` documents r-mcp-server as "not currently configured (see README for setup)". The r-mcp-server is a custom project in `/mnt/d/dev/p/r-mcp-server/` that isn't actively deployed.

**Likelihood**: Low (server won't be found, connection silently skipped)
**Severity**: MINOR (cosmetic; may confuse users inspecting the agent definition)

**Recommendation**: Either remove `r-mcp-server` from the agent's `mcp_servers` list, or add a comment explaining it's optional/future.

---

### Finding 8: rcon MCP server undocumented in agents [MINOR]

**File**: `/mnt/d/dev/p/CLAUDE.md:86-90` documents `rcon` as an available MCP server for "Direct R code execution through MCP tools".

No agent in `agents/` references `rcon` in its `mcp_servers` field. It exists as an alternative to `r-mcptools` but has no agent integration.

**Likelihood**: Low
**Severity**: MINOR (missed integration opportunity)

**Recommendation**: Consider adding `rcon` to the r-developer agent's `mcp_servers` as an alternative, or document why it's excluded.

---

### Finding 9: Docker skill examples use stale rocker base image [MINOR]

**Files** (8 occurrences across 3 skills):
- `skills/create-r-dockerfile/SKILL.md` — lines 45, 57, 147, 153
- `skills/containerize-mcp-server/SKILL.md` — line 44
- `skills/optimize-docker-build-cache/SKILL.md` — lines 46, 104, 111

All use `rocker/r-ver:4.5.0` instead of `rocker/r-ver:4.5.2`.

**Likelihood**: Certain
**Severity**: MINOR (examples work with either version; the actual Dockerfile uses 4.5.2)

**Recommendation**: Update to `r-ver:4.5.2` as part of the Finding 2 version update sweep.

---

### Finding 10: get_script_dir() duplication with two variant patterns [MINOR]

**Variant A** (file-existence based) — used in `build-icons.R`, `build-agent-icons.R`, `build-team-icons.R`, `generate-palette-colors.R`, `profile-render.R`:
```r
get_script_dir <- function() {
  args <- commandArgs(trailingOnly = FALSE)
  file_arg <- grep("--file=", args, value = TRUE)
  if (length(file_arg) > 0) return(normalizePath(dirname(sub("--file=", "", file_arg[1]))))
  if (file.exists("R/utils.R")) return(normalizePath("."))
  if (file.exists("viz/R/utils.R")) return(normalizePath("viz"))
  stop("Cannot determine script directory.", call. = FALSE)
}
```

**Variant B** (env var + sys.frame) — used in `build-wordmark.R`, `build-favicon.R`, `build-workflow.R`:
```r
script_dir <- if (nzchar(Sys.getenv("RSCRIPT_DIR"))) {
  Sys.getenv("RSCRIPT_DIR")
} else {
  tryCatch(dirname(normalizePath(sys.frame(1)$ofile)), error = function(e) ".")
}
```

**Impact**: Both variants work but have different failure modes. Variant A is more robust (falls back to checking for known files). Variant B uses `sys.frame(1)$ofile` which only works when the script is sourced via `Rscript`, not when sourced interactively.

**Likelihood**: Low (both work in their intended contexts)
**Severity**: MINOR (code duplication; divergence risk over time)

**Recommendation**: Extract a single `get_script_dir()` into `R/utils.R` and have all build scripts call it. The Variant A pattern is more robust and should be the canonical implementation.

---

## 4. Risk Matrix

| # | Finding | Likelihood | Impact | Severity | Category |
|---|---------|-----------|--------|----------|----------|
| 1 | build-wordmark.R deadlock | Certain | High (script hangs) | **CRITICAL** | Active execution |
| 2 | R version drift (40 files, 89 occurrences) | Certain | Medium (wrong examples) | **CRITICAL** | Documentation |
| 3 | .Rprofile missing arch walk-down | Certain | Medium (test env broken) | **IMPORTANT** | Configuration |
| 4 | viz-architecture.md stale counts | Certain | Low (misleading memory) | **IMPORTANT** | Memory |
| 5 | No R CI coverage | N/A | High (silent regression) | **IMPORTANT** | Infrastructure |
| 6 | library() vs :: rule too broad | N/A | Medium (incorrect edits) | **IMPORTANT** | Documentation |
| 7 | r-mcp-server listed but unconfigured | Low | Low (cosmetic) | **MINOR** | MCP integration |
| 8 | rcon undocumented in agents | Low | Low (missed opportunity) | **MINOR** | MCP integration |
| 9 | Docker examples use stale base image | Certain | Low (still functional) | **MINOR** | Documentation |
| 10 | get_script_dir() duplication | Low | Low (divergence risk) | **MINOR** | Code quality |

---

## 5. Prioritized Recommendations

### Priority 1: Fix Critical Issues

1. **Fix `build-wordmark.R:24-26`**: Remove the direct `source(activate_path)` call. Replace with the `.Rprofile`-based approach. The simplest fix is deleting lines 24-26 entirely — the `.Rprofile` in CWD already activates renv when `Rscript` is run from `viz/`.

2. **Update R version references**: Global replace `R-4.5.0` → `R-4.5.2` and `r-ver:4.5.0` → `r-ver:4.5.2` across all 40 files (11 English + 29 translations).

### Priority 2: Fix Important Issues

3. **Propagate arch walk-down to `tests/results/.Rprofile`**: Copy `viz/.Rprofile:18-26` logic into the test copy.

4. **Update `memory/viz-architecture.md`**: Change counts to 326 skills, 66 agents, 15 teams, 58 domains.

5. **Add minimal R CI**: A lightweight "can R modules load?" smoke test in GitHub Actions.

6. **Scope the `library()` rule**: Clarify in CLAUDE.md that the `::` requirement applies to R package source code only.

### Priority 3: Address Minor Issues

7. **Clean up r-developer MCP servers**: Remove `r-mcp-server` or add explanatory comment.
8. **Document rcon status**: Either integrate into relevant agents or explicitly note "not configured" in agent definitions.
9. **Docker examples**: Updated as part of item 2.
10. **Consolidate get_script_dir()**: Extract canonical implementation to `R/utils.R`.

---

## 6. Docker & Infrastructure Notes

### Dockerfile correctness
The Dockerfile correctly:
- Uses `rocker/r-ver:4.5.2` (line 8)
- Copies `.Rprofile` (line 22) — harmless on ext4; the workaround checks for renv/activate.R existence
- Runs `source('renv/activate.R')` directly (line 28) — works on ext4, no drvfs deadlock
- Uses non-root user (lines 72-74)
- No baked secrets

### .dockerignore coverage
The `.dockerignore` excludes:
- `.git`, `.github`
- `viz/node_modules`
- `viz/renv/library`, `viz/renv/cache`, `viz/renv/staging`
- `viz/icons`, `viz/data` (note: actual output dirs are `viz/public/icons` and `viz/public/data` — the listed paths are stale but harmless since the wrong paths don't exist)

Missing from `.dockerignore`:
- `i18n/` (20MB, not needed in container)
- `tests/` (test scenarios, not needed)
- `docs/` (investigations, logos)

These are minor — the total size is small and doesn't affect build correctness.

### Dual R installation
Two R 4.5.2 installations exist:
1. WSL-native: `/opt/R/4.5.2/bin/R` (ELF binary)
2. Windows via mount: `/mnt/c/Program Files/R/R-4.5.2/bin/R.exe` (PE executable)

`~/bin/Rscript` wrapper → Windows R is the default. `build.sh` and all scripts use bare `Rscript` → resolves to Windows R. The `.Rprofile` workaround handles both platforms via platform detection (`grep(pattern, basename(platform_dirs))` with "^linux" or "^windows").

---

## 7. Investigation Methodology

### Agents & Teams Used

| Phase | Agent/Team | Role |
|-------|------------|------|
| Phase 1 | Explore agent (r-inventory) | R file inventory, source graph, get_script_dir() variants |
| Phase 1 | Explore agent (version-audit) | R-4.5.0 stale reference search across all files |
| Phase 1 | Explore agent (library-audit) | library() vs :: compliance analysis |
| Phase 2 | Direct investigation | build-wordmark.R deadlock, .Rprofile comparison, Docker review |
| Phase 3 | Direct investigation | CI workflow audit, .dockerignore coverage |
| Phase 4 | Direct investigation | Registry counts, MCP agent audit, memory file verification |

### Files Read (32)
`viz/build-wordmark.R`, `viz/.Rprofile`, `tests/results/.Rprofile`, `viz/Dockerfile`, `agents/r-developer.md`, `.claude/settings.local.json`, `.dockerignore`, `memory/viz-architecture.md`, `memory/patterns.md`, `viz/build.sh`, `viz/docker-entrypoint.sh`, `viz/renv.lock`, `viz/package.json`, `agents/shiny-developer.md`, `skills/_registry.yml`, plus all R files inventoried by the background agent.

### Searches Performed
- `r-mcp-server|rcon` in agents/ → 10 matches
- `mcp_servers` in agents/ → 10 matches (5 agents with MCP)
- `total_agents|total_skills|total_teams` in registries → 66/326/15
- `rocker/r-ver:4.5.0` in skills/ → 8 stale references
- `Rscript|r-lib|setup-r` in .github/ → 0 matches (no R CI)
- `rcon` in parent CLAUDE.md → 1 match (line 86)
- Domain count in skills/_registry.yml → 58 domains

---

## Appendix: R Package Dependencies (from viz/renv.lock)

Core packages used by the viz pipeline (R 4.5.2):

| Package | Purpose |
|---------|---------|
| ggplot2 | Plot construction |
| ggforce | Extended geoms (circles, arcs) |
| ggfx | Glow/blur effects |
| ragg | High-quality PNG rendering |
| svglite | SVG output |
| magick | Image processing (recolor, WebP) |
| jsonlite | JSON I/O |
| viridisLite | Color palette generation |
| future + furrr | Parallel rendering |
| digest | Content-hash caching |
| string2path | Text-to-polygon (wordmark) |
| systemfonts | Font resolution |
| putior | Workflow diagrams |
