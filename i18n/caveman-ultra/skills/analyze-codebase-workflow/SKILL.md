---
name: analyze-codebase-workflow
locale: caveman-ultra
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

Survey repo → auto-detect data flows, file I/O, script deps → structured annotation plan for manual refinement.

## Use When

- Onboard unfamiliar codebase → understand data flow
- Start putior integration, no PUT annotations
- Audit existing data pipeline pre-doc
- Prep annotation plan before `annotate-source-files`

## In

- **Required**: Path to repo/src dir
- **Optional**: Subdirs focus (default: entire repo)
- **Optional**: Langs include/exclude (default: all detected)
- **Optional**: Scope: inputs only, outputs only, both (default: both + deps)

## Do

### Step 1: Survey Repo Structure

Identify src files + langs → what putior can analyze.

```r
library(putior)

# List all supported languages and their extensions
list_supported_languages()
list_supported_languages(detection_only = TRUE)  # Only languages with auto-detection

# Get supported extensions
exts <- get_supported_extensions()
```

File listing → repo composition:

```bash
# Count files by extension in the target directory
find /path/to/repo -type f | sed 's/.*\.//' | sort | uniq -c | sort -rn | head -20
```

**→** File extensions in repo + counts. Map against `get_supported_extensions()` → coverage.

**If err:** No files match supported → putior can't auto-detect. Check if lang supported but non-standard ext.

### Step 2: Check Detection Coverage

Per detected lang → verify auto-detect pattern available.

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

**→** Pattern counts printed. R 124, Python 159, JS 71, etc.

**If err:** No patterns → supports manual only, not auto. Plan manual annotations.

### Step 3: Run Auto-Detection

Execute `put_auto()` → discover workflow elements.

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

Large repos → analyze subdirs incrementally:

```r
# Analyze specific subdirectories
etl_workflow <- put_auto("./src/etl/")
api_workflow <- put_auto("./src/api/")
```

**→** Df w/ `id`, `label`, `input`, `output`, `source_file` cols. Row = detected step.

**If err:** Empty → src may lack recognizable I/O patterns. Try `workflow <- put_auto("./src/", log_level = "DEBUG")` → see scanned + matched.

### Step 4: Initial Diagram

Visualize auto-detected → assess coverage + gaps.

```r
# Generate diagram from auto-detected workflow
cat(put_diagram(workflow, theme = "github"))

# With source file info for traceability
cat(put_diagram(workflow, show_source_info = TRUE))

# Save to file for review
writeLines(put_diagram(workflow, theme = "github"), "workflow-auto.md")
```

**→** Mermaid flowchart, detected nodes + data flow edges. Meaningful fn/file labels.

**If err:** Disconnected nodes → auto-detect found I/O but couldn't infer connections. Normal — matching output → input filenames. Annotation plan next step fills.

### Step 5: Annotation Plan

Generate plan → what found + what needs manual.

```r
# Generate annotation suggestions
put_generate("./src/", style = "single")

# For multiline style (more readable for complex workflows)
put_generate("./src/", style = "multiline")

# Copy suggestions to clipboard for easy pasting
put_generate("./src/", output = "clipboard")
```

Doc plan w/ coverage assessment:

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

**→** Clear plan: auto-detected vs manual, specific recs per file.

**If err:** `put_generate()` no out → verify path correct + has supported src files.

## Check

- [ ] `put_auto()` no err on target
- [ ] Detected workflow has ≥1 node (unless no recognizable I/O)
- [ ] `put_diagram()` produces valid Mermaid
- [ ] `put_generate()` produces suggestions for detected files
- [ ] Annotation plan doc created w/ coverage assessment

## Traps

- **Scan too broad**: `put_auto(".")` → includes `node_modules/`, `.git/`, `venv/`. Target specific src dirs.
- **Expect full coverage**: Auto-detect finds I/O + lib calls, not business logic. 40-60% typical; rest manual.
- **Ignore deps**: `detect_dependencies = TRUE` catches `source()`, `import`, `require()` → links scripts. Disable → lose cross-file connections.
- **Lang mismatch**: Non-standard ext (`.R` vs `.r`, `.jsx` vs `.js`) may not detect. Use `get_comment_prefix()`. Extensionless `Dockerfile`, `Makefile` supported via filename match.
- **Large repos**: 100+ src files → analyze by module/dir → diagrams readable.

## →

- `install-putior` — prereq
- `annotate-source-files` — next: add manual
- `generate-workflow-diagram` — final after annotation
- `configure-putior-mcp` — MCP tools for interactive
