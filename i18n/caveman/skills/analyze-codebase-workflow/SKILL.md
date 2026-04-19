---
name: analyze-codebase-workflow
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Analyze an arbitrary codebase to auto-detect workflows, data pipelines,
  and file dependencies using putior's put_auto() engine. Produces an
  annotation plan that maps detected I/O patterns to source files across
  30+ supported languages with 902 auto-detection patterns. Use when
  onboarding onto an unfamiliar codebase to understand data flow, starting
  putior integration in a project without existing annotations, auditing a
  project's data pipeline before documentation, or preparing an annotation
  plan before running annotate-source-files.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: workflow-visualization
  complexity: intermediate
  language: multi
  tags: putior, workflow, analysis, auto-detect, polyglot, data-pipeline
---

# Analyze Codebase Workflow

Survey arbitrary repository. Auto-detect data flows, file I/O, script dependencies. Produce structured annotation plan for manual refinement.

## When Use

- Onboarding onto unfamiliar codebase, need to understand data flow
- Starting putior integration in project with no PUT annotations yet
- Auditing existing project's data pipeline before documentation
- Preparing annotation plan before running `annotate-source-files`

## Inputs

- **Required**: Path to repository or source directory to analyze
- **Optional**: Specific subdirectories to focus on (default: entire repo)
- **Optional**: Languages to include or exclude (default: all detected)
- **Optional**: Detection scope: inputs only, outputs only, or both (default: both + dependencies)

## Steps

### Step 1: Survey Repository Structure

Identify source files and their languages. Understand what putior can analyze.

```r
library(putior)

# List all supported languages and their extensions
list_supported_languages()
list_supported_languages(detection_only = TRUE)  # Only languages with auto-detection

# Get supported extensions
exts <- get_supported_extensions()
```

Use file listing to understand repo composition:

```bash
# Count files by extension in the target directory
find /path/to/repo -type f | sed 's/.*\.//' | sort | uniq -c | sort -rn | head -20
```

**Got:** List of file extensions present in repo, with counts. Map against `get_supported_extensions()` to know coverage.

**If fail:** Repo has no files matching supported extensions? Putior cannot auto-detect workflows. Consider whether language is supported but files use non-standard extensions.

### Step 2: Check Language Detection Coverage

For each detected language, verify auto-detection pattern availability.

```r
# Check which languages have auto-detection patterns (18 languages, 902 patterns)
detection_langs <- list_supported_languages(detection_only = TRUE)
cat("Languages with auto-detection:\n")
print(detection_langs)

# Get pattern counts for specific languages found in the repo
for (lang in c("r", "python", "javascript", "sql", "dockerfile", "makefile")) {
  patterns <- get_detection_patterns(lang)
  cat(sprintf("%s: %d input, %d output, %d dependency patterns\n",
    lang,
    length(patterns$input),
    length(patterns$output),
    length(patterns$dependency)
  ))
}
```

**Got:** Pattern counts printed for each language. R has 124 patterns, Python 159, JavaScript 71, etc.

**If fail:** Language returns no patterns? Supports manual annotations but not auto-detection. Plan to annotate those files manually.

### Step 3: Run Auto-Detection

Execute `put_auto()` on target directory to discover workflow elements.

```r
# Full auto-detection
workflow <- put_auto("./src/",
  detect_inputs = TRUE,
  detect_outputs = TRUE,
  detect_dependencies = TRUE
)

# Exclude build scripts and test helpers from scanning
workflow <- put_auto("./src/",
  detect_inputs = TRUE,
  detect_outputs = TRUE,
  detect_dependencies = TRUE,
  exclude = c("build-", "test_helper")
)

# View detected workflow nodes
print(workflow)

# Check node count
cat(sprintf("Detected %d workflow nodes\n", nrow(workflow)))
```

For large repos, analyze subdirectories incrementally:

```r
# Analyze specific subdirectories
etl_workflow <- put_auto("./src/etl/")
api_workflow <- put_auto("./src/api/")
```

**Got:** Data frame with columns including `id`, `label`, `input`, `output`, `source_file`. Each row represents detected workflow step.

**If fail:** Result empty? Source files may not contain recognizable I/O patterns. Try enabling debug logging: `workflow <- put_auto("./src/", log_level = "DEBUG")` to see which files scanned and which patterns match.

### Step 4: Generate Initial Diagram

Visualize auto-detected workflow. Assess coverage and identify gaps.

```r
# Generate diagram from auto-detected workflow
cat(put_diagram(workflow, theme = "github"))

# With source file info for traceability
cat(put_diagram(workflow, show_source_info = TRUE))

# Save to file for review
writeLines(put_diagram(workflow, theme = "github"), "workflow-auto.md")
```

**Got:** Mermaid flowchart showing detected nodes connected by data flow edges. Nodes labeled with meaningful function/file names.

**If fail:** Diagram shows disconnected nodes? Auto-detection found I/O patterns but couldn't infer connections. Normal — connections derived from matching output filenames to input filenames. Annotation plan (next step) addresses gaps.

### Step 5: Produce Annotation Plan

Generate structured plan documenting what found and what needs manual annotation.

```r
# Generate annotation suggestions
put_generate("./src/", style = "single")

# For multiline style (more readable for complex workflows)
put_generate("./src/", style = "multiline")

# Copy suggestions to clipboard for easy pasting
put_generate("./src/", output = "clipboard")
```

Document plan with coverage assessment:

```markdown
## Annotation Plan

### Auto-Detected (no manual work needed)
- `src/etl/extract.R` — 3 inputs, 2 outputs detected
- `src/etl/transform.py` — 1 input, 1 output detected

### Needs Manual Annotation
- `src/api/handler.js` — Language supported but no I/O patterns matched
- `src/config/setup.sh` — Only 12 shell patterns; complex logic missed

### Not Supported
- `src/legacy/process.f90` — Fortran not in detection languages

### Recommended Connections
- extract.R output `data.csv` → transform.py input `data.csv` (auto-linked)
- transform.py output `clean.parquet` → load.R input (needs annotation)
```

**Got:** Clear plan separating auto-detected files from those needing manual annotation. Specific recommendations for each file.

**If fail:** `put_generate()` produces no output? Ensure directory path correct and contains source files in supported languages.

## Checks

- [ ] `put_auto()` executes without errors on target directory
- [ ] Detected workflow has at least one node (unless repo has no recognizable I/O)
- [ ] `put_diagram()` produces valid Mermaid code from auto-detected workflow
- [ ] `put_generate()` produces annotation suggestions for files with detected patterns
- [ ] Annotation plan document created with coverage assessment

## Pitfalls

- **Scanning too broadly**: Running `put_auto(".")` on repo root may include `node_modules/`, `.git/`, `venv/`, etc. Target specific source directories.
- **Expecting full coverage**: Auto-detection finds file I/O and library calls, not business logic. 40-60% coverage rate typical; rest needs manual annotation.
- **Ignoring dependencies**: `detect_dependencies = TRUE` flag catches `source()`, `import`, `require()` calls that link scripts together. Disabling it loses cross-file connections.
- **Language mismatch**: Files with non-standard extensions (e.g., `.R` vs `.r`, `.jsx` vs `.js`) may not be detected. Use `get_comment_prefix()` to check if extension recognized. Note extensionless files like `Dockerfile` and `Makefile` supported via exact filename matching.
- **Large repos**: For repos with 100+ source files, analyze by module/directory to keep diagrams readable.

## See Also

- `install-putior` — prerequisite: putior must be installed first
- `annotate-source-files` — next step: add manual annotations based on plan
- `generate-workflow-diagram` — generate final diagram after annotation complete
- `configure-putior-mcp` — use MCP tools for interactive analysis sessions
