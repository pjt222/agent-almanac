---
name: annotate-source-files
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Add PUT workflow annotations to source files using the correct
  language-specific comment prefix. Covers annotation syntax, skeleton
  generation via put_generate(), multiline annotations, .internal
  variables, and validation. Supports 30+ languages with automatic
  comment prefix detection. Use after analyzing a codebase and having an
  annotation plan, when adding workflow documentation to new or existing
  source files, or when documenting data pipelines, ETL processes, or
  multi-step computations.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: workflow-visualization
  complexity: intermediate
  language: multi
  tags: putior, annotation, workflow, comment-syntax, polyglot, documentation
---

# Annotate Source Files

Add PUT workflow annotations to source files. Putior can extract structured workflow data and generate Mermaid diagrams.

## When Use

- After analyzing codebase with `analyze-codebase-workflow` and having annotation plan
- Adding workflow documentation to new or existing source files
- Enriching auto-detected workflows with manual labels and connections
- Documenting data pipelines, ETL processes, or multi-step computations

## Inputs

- **Required**: Source files to annotate
- **Required**: Annotation plan or knowledge of workflow steps
- **Optional**: Style preference: single-line or multiline (default: single-line)
- **Optional**: Whether to use `put_generate()` for skeleton generation (default: yes)

## Steps

### Step 1: Determine Comment Prefix

Each language has specific comment prefix for PUT annotations. Use `get_comment_prefix()` to find correct one.

```r
library(putior)

# Common prefixes
get_comment_prefix("R")    # "#"
get_comment_prefix("py")   # "#"
get_comment_prefix("sql")  # "--"
get_comment_prefix("js")   # "//"
get_comment_prefix("ts")   # "//"
get_comment_prefix("go")   # "//"
get_comment_prefix("rs")   # "//"
get_comment_prefix("m")    # "%"
get_comment_prefix("lua")  # "--"
```

**Got:** String like `"#"`, `"--"`, `"//"`, or `"%"`.

> **Line and block comments:** putior detects annotations in both line comments (`//`, `#`, `--`) and C-style block comments (`/* */`, `/** */`). For JS/TS, both `//` and `/* */` blocks scanned. Python triple-quote strings (`''' '''`) **not** detected — use `#` for Python annotations.

**If fail:** Extension not recognized? File language may not be supported. Check `get_supported_extensions()` for full list. For unsupported languages, use `#` as conventional default.

### Step 2: Generate Annotation Skeletons

Use `put_generate()` to create annotation templates based on auto-detected I/O.

```r
# Print suggestions to console
put_generate("./src/etl/")

# Single-line style (default)
put_generate("./src/etl/", style = "single")

# Multiline style for complex annotations
put_generate("./src/etl/", style = "multiline")

# Copy to clipboard for pasting
put_generate("./src/etl/", output = "clipboard")
```

Example output for R file:
```r
# put id:'extract_data', label:'Extract Customer Data', input:'customers.csv', output:'raw_data.internal'
```

Example output for SQL:
```sql
-- put id:'load_data', label:'Load Customer Table', output:'customers'
```

**Got:** One or more annotation comment lines per source file, pre-filled with detected function names and I/O.

**If fail:** No suggestions generated? File may not contain recognizable I/O patterns. Write annotations manually based on understanding of code.

### Step 3: Refine Annotations

Edit generated skeletons to add accurate labels, connections, metadata.

**Annotation syntax reference:**

```
<prefix> put id:'unique_id', label:'Human Readable Label', input:'file1.csv, file2.rds', output:'result.parquet, summary.internal'
```

Fields:
- `id` (required): Unique identifier, used for node connections
- `label` (required): Human-readable description shown in diagram
- `input`: Comma-separated list of input files or variables
- `output`: Comma-separated list of output files or variables
- `.internal` extension: Marks in-memory variables (not persisted between scripts)
- `node_type`: Controls Mermaid node shape and class styling. Values:
  - `"input"` — stadium shape `([...])` for data sources and configuration
  - `"output"` — subroutine shape `[[...]]` for generated artifacts
  - `"process"` — rectangle `[...]` for processing steps (default)
  - `"decision"` — diamond `{...}` for conditional logic
  - `"start"` / `"end"` — stadium shape `([...])` for entry/terminal nodes

Example with `node_type`:
```r
# put id:'config', label:'Load Config', node_type:'input', output:'config.internal'
# put id:'transform', label:'Apply Rules', node_type:'process', input:'config.internal', output:'result.rds'
# put id:'report', label:'Generate Report', node_type:'output', input:'result.rds'
```

**Multiline syntax** (for complex annotations):
```r
# put id:'complex_step', \
#   label:'Multi-line Label', \
#   input:'data.csv, config.yaml', \
#   output:'result.parquet'
```

**Block comment syntax** (for `//`-prefix languages only: JS, TS, Go, Rust, C, C++, Java, etc.):

Languages that use `//` for line comments also support PUT annotations inside `/* */` and `/** */` block comments. Use `* put` as line prefix inside block body:

```javascript
/* put id:'init', label:'Initialize Config', output:'config.internal' */

/**
 * put id:'process', \
 *   label:'Process Records', \
 *   input:'config.internal, records.json', \
 *   output:'results.json'
 */
function processRecords(config, records) {
  // ...
}
```

JSDoc-style annotations particularly useful when documenting workflow steps alongside API documentation:

```typescript
/**
 * Transform raw sensor data into normalized readings.
 * put id:'normalize', label:'Normalize Sensor Data', input:'raw_readings.json', output:'normalized.parquet'
 */
export function normalizeSensorData(readings: SensorReading[]): NormalizedData {
  // ...
}
```

> **Note:** Block comment annotations **not** supported for `#`-prefix languages (R, Python, Shell) or `--`-prefix languages (SQL, Lua). Use only line comments for those languages. Block-originated annotations do not support backslash continuation across lines.

**Cross-file data flow** (connecting scripts via file-based I/O):
```r
# Script 1: extract.R
# put id:'extract', label:'Extract Data', output:'raw_data.internal, raw_data.rds'
data <- read.csv("source.csv")
saveRDS(data, "raw_data.rds")

# Script 2: transform.R
# put id:'transform', label:'Transform Data', input:'raw_data.rds', output:'clean_data.parquet'
data <- readRDS("raw_data.rds")
arrow::write_parquet(clean, "clean_data.parquet")
```

**Got:** Annotations refined with accurate IDs, labels, and I/O fields that reflect actual data flow.

**If fail:** Unsure about I/O? Use `.internal` extension for in-memory intermediates and explicit file names for persisted data.

### Step 4: Insert Annotations into Files

Place annotations at top of each file or immediately above relevant code block.

**Placement conventions:**
1. **File-level annotation**: Place at top of file, after any shebang line or file header comment
2. **Block-level annotation**: Place immediately above code block it describes
3. **Multiple annotations per file**: Use for files with distinct workflow phases

Example placement in R file:
```r
#!/usr/bin/env Rscript
# ETL Extract Script
#
# put id:'read_source', label:'Read Source Data', input:'raw_data.csv', output:'df.internal'

df <- read.csv("raw_data.csv")

# put id:'clean_data', label:'Clean and Validate', input:'df.internal', output:'clean.rds'

df_clean <- df[complete.cases(df), ]
saveRDS(df_clean, "clean.rds")
```

Use Edit tool to insert annotations into existing files without disturbing surrounding code.

**Got:** Annotations inserted at appropriate locations in each source file.

**If fail:** Annotations break syntax highlighting in editor? Ensure comment prefix correct for language. PUT annotations are standard comments and should not affect code execution.

### Step 5: Validate Annotations

Run putior's validation to check annotation syntax and connectivity.

```r
# Scan annotated files
workflow <- put("./src/", validate = TRUE)

# Check for validation issues
print(workflow)
cat(sprintf("Total nodes: %d\n", nrow(workflow)))

# Verify connections by checking input/output overlap
inputs <- unlist(strsplit(workflow$input, ",\\s*"))
outputs <- unlist(strsplit(workflow$output, ",\\s*"))
connected <- intersect(inputs, outputs)
cat(sprintf("Connected data flows: %d\n", length(connected)))

# Generate diagram to visually inspect
cat(put_diagram(workflow, theme = "github", show_source_info = TRUE))

# Merge with auto-detected for maximum coverage
merged <- put_merge("./src/", merge_strategy = "supplement")
cat(put_diagram(merged, theme = "github"))
```

**Got:** All annotations parse without errors. Diagram shows connected workflow. `put_merge()` fills in any gaps from auto-detection.

**If fail:** Common validation issues:
- Missing closing quote: `id:'name` → `id:'name'`
- Using double quotes inside: `id:"name"` → `id:'name'`
- Duplicate IDs across files: each `id` must be unique across entire scanned directory
- Backslash continuation on wrong line: `\` must be last character before newline

## Checks

- [ ] Every annotated file has syntactically valid PUT annotations
- [ ] `put("./src/")` returns data frame with expected number of nodes
- [ ] No duplicate `id` values across scanned directory
- [ ] `put_diagram()` produces connected flowchart (not all isolated nodes)
- [ ] Multiline annotations (if used) parse correctly with backslash continuation
- [ ] `.internal` variables appear only as outputs, never as cross-file inputs
- [ ] Files excluded via `exclude` parameter do not appear in workflow (e.g., `put("./src/", exclude = "test_")` skips test helpers)

## Pitfalls

- **Quote nesting errors**: PUT annotations use single quotes: `id:'name'`. Double quotes cause parsing issues when annotation inside string context.
- **Duplicate IDs**: Every `id` must be globally unique within scanned scope. Use naming convention like `<script>_<step>` (e.g., `extract_read`, `transform_clean`).
- **.internal as cross-file input**: `.internal` variables exist only during script execution. To pass data between scripts, use persisted file format (`.rds`, `.csv`, `.parquet`) as output of one script and input of next.
- **Missing connections**: Diagram shows disconnected nodes? Check output filenames in one annotation exactly match input filenames in another (including extensions).
- **Wrong comment prefix**: Using `#` in SQL file or `//` in Python causes annotation to be treated as code, not comment. Always verify with `get_comment_prefix()`.
- **Forgetting multiline continuation**: When using multiline annotations, every continued line must end with `\` and next line must start with comment prefix.
- **Python triple-quote strings**: putior does not scan Python triple-quote strings (`''' '''`, `""" """`). Always use `#` for Python PUT annotations.
- **Meta-pipeline annotations**: Annotate build script that also scans for annotations (e.g., script that calls `put()` and `put_diagram()`)? Script's own annotations will appear in generated diagram. Either exclude file from scanning (see `generate-workflow-diagram` Common Pitfalls) or avoid placing PUT annotations in build script itself.

## See Also

- `analyze-codebase-workflow` — prerequisite: produces annotation plan this skill follows
- `generate-workflow-diagram` — next step: generate final diagram from annotations
- `install-putior` — putior must be installed before annotating
- `configure-putior-mcp` — MCP tools provide interactive annotation assistance
