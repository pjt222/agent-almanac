---
name: annotate-source-files
locale: caveman-ultra
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

Add PUT workflow annotations → putior extracts structured workflow data + generates Mermaid diagrams.

## Use When

- After `analyze-codebase-workflow` + annotation plan
- Add workflow docs new/existing src
- Enrich auto-detected w/ manual labels + connections
- Doc data pipelines, ETL, multi-step computations

## In

- **Required**: Src files to annotate
- **Required**: Annotation plan or workflow steps knowledge
- **Optional**: Style — single-line or multiline (default: single-line)
- **Optional**: Use `put_generate()` skeletons? (default: yes)

## Do

### Step 1: Determine Comment Prefix

Each lang has specific prefix. `get_comment_prefix()` → correct one.

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

**→** String like `"#"`, `"--"`, `"//"`, or `"%"`.

> **Line + block comments:** putior detects annotations in both line comments (`//`, `#`, `--`) + C-style block comments (`/* */`, `/** */`). JS/TS both `//` + `/* */` scanned. Python triple-quote strings (`''' '''`) **not** detected — use `#` for Python.

**If err:** Ext not recognized → lang may not be supported. Check `get_supported_extensions()`. Unsupported langs → use `#` conventional default.

### Step 2: Generate Skeletons

`put_generate()` → annotation templates based on auto-detected I/O.

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

Example out for R file:
```r
# put id:'extract_data', label:'Extract Customer Data', input:'customers.csv', output:'raw_data.internal'
```

Example out for SQL:
```sql
-- put id:'load_data', label:'Load Customer Table', output:'customers'
```

**→** 1+ annotation comment lines per file, pre-filled w/ detected fn names + I/O.

**If err:** No suggestions → file may not have recognizable I/O patterns. Write annotations manually.

### Step 3: Refine Annotations

Edit generated skeletons → accurate labels, connections, metadata.

**Annotation syntax:**

```
<prefix> put id:'unique_id', label:'Human Readable Label', input:'file1.csv, file2.rds', output:'result.parquet, summary.internal'
```

Fields:
- `id` (required): Unique ID, for node connections
- `label` (required): Human-readable desc shown diagram
- `input`: Comma-separated ins
- `output`: Comma-separated outs
- `.internal` ext: Marks in-memory vars (not persisted between scripts)
- `node_type`: Mermaid shape + class styling. Values:
  - `"input"` — stadium shape `([...])` data srcs + config
  - `"output"` — subroutine shape `[[...]]` generated artifacts
  - `"process"` — rectangle `[...]` processing steps (default)
  - `"decision"` — diamond `{...}` conditional logic
  - `"start"` / `"end"` — stadium shape `([...])` entry/terminal

Example w/ `node_type`:
```r
# put id:'config', label:'Load Config', node_type:'input', output:'config.internal'
# put id:'transform', label:'Apply Rules', node_type:'process', input:'config.internal', output:'result.rds'
# put id:'report', label:'Generate Report', node_type:'output', input:'result.rds'
```

**Multiline syntax** (complex):
```r
# put id:'complex_step', \
#   label:'Multi-line Label', \
#   input:'data.csv, config.yaml', \
#   output:'result.parquet'
```

**Block comment syntax** (`//`-prefix langs only: JS, TS, Go, Rust, C, C++, Java, etc.):

Langs w/ `//` line comments also support PUT in `/* */` + `/** */` blocks. Use `* put` as line prefix inside block body:

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

JSDoc annotations useful documenting workflow + API docs:

```typescript
/**
 * Transform raw sensor data into normalized readings.
 * put id:'normalize', label:'Normalize Sensor Data', input:'raw_readings.json', output:'normalized.parquet'
 */
export function normalizeSensorData(readings: SensorReading[]): NormalizedData {
  // ...
}
```

> **Note:** Block comment annotations **not** supported for `#`-prefix (R, Python, Shell) or `--`-prefix (SQL, Lua). Line comments only those. Block-originated no backslash continuation across lines.

**Cross-file data flow** (connect scripts via file-based I/O):
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

**→** Annotations refined w/ accurate IDs, labels, I/O reflecting actual data flow.

**If err:** Unsure I/O → `.internal` ext for in-memory intermediates + explicit file names for persisted.

### Step 4: Insert Annotations

Place at top of file or immediately above relevant code block.

**Placement conventions:**
1. **File-level**: Top after shebang or header comment
2. **Block-level**: Immediately above code block it describes
3. **Multi per file**: Distinct workflow phases

Example in R:
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

Edit tool → insert into existing files no disturb surrounding.

**→** Annotations inserted at appropriate locations per file.

**If err:** Break syntax highlighting → verify prefix correct for lang. PUT = std comments + should not affect exec.

### Step 5: Validate

Run putior validation → syntax + connectivity.

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

**→** All annotations parse no err. Diagram shows connected workflow. `put_merge()` fills gaps from auto-detection.

**If err:** Common issues:
- Missing close quote: `id:'name` → `id:'name'`
- Double quotes inside: `id:"name"` → `id:'name'`
- Duplicate IDs across files: each `id` must be unique across entire scanned dir
- Backslash continuation wrong line: `\` must be last char before newline

## Check

- [ ] Every annotated file has syntactically valid PUT annotations
- [ ] `put("./src/")` returns df w/ expected node count
- [ ] No duplicate `id` values across scanned dir
- [ ] `put_diagram()` produces connected flowchart (not all isolated)
- [ ] Multiline annotations (if used) parse correct w/ backslash continuation
- [ ] `.internal` vars appear only outputs, never cross-file ins
- [ ] Files excluded via `exclude` no appear in workflow (e.g., `put("./src/", exclude = "test_")` skips test helpers)

## Traps

- **Quote nesting**: PUT uses single quotes: `id:'name'`. Double quotes → parsing issues when annotation in string ctx.
- **Duplicate IDs**: Every `id` must be globally unique within scanned scope. Naming: `<script>_<step>` (e.g., `extract_read`, `transform_clean`).
- **.internal as cross-file in**: `.internal` exists only during script exec. Pass data between scripts → persisted file format (`.rds`, `.csv`, `.parquet`) as out of one + in of next.
- **Missing connections**: Disconnected nodes → check out filenames in 1 annotation exactly match in filenames in another (including exts).
- **Wrong prefix**: `#` in SQL or `//` in Python → annotation treated as code not comment. Always verify `get_comment_prefix()`.
- **Forget multiline continuation**: Every continued line must end `\` + next line must start w/ comment prefix.
- **Python triple-quote strings**: putior no scan (`''' '''`, `""" """`). Always `#` for Python PUT.
- **Meta-pipeline annotations**: Annotate build script that also scans for annotations (e.g., script calling `put()` + `put_diagram()`) → script's own annotations appear in generated diagram. Exclude file from scanning (see `generate-workflow-diagram` Traps) or no PUT in build script itself.

## →

- `analyze-codebase-workflow` — prereq: produces annotation plan this follows
- `generate-workflow-diagram` — next: generate final from annotations
- `install-putior` — putior installed before annotating
- `configure-putior-mcp` — MCP tools interactive annotation assistance
