---
title: "Visualizing Workflows with putior"
description: "End-to-end putior workflow visualization from annotation to themed Mermaid diagrams"
category: workflow
agents: [putior-integrator]
teams: []
skills: [install-putior, annotate-source-files, generate-workflow-diagram, analyze-codebase-workflow, configure-putior-mcp, setup-putior-ci]
---

# Visualizing Workflows with putior

putior is an R package that turns source code annotations into Mermaid flowchart diagrams. Rather than maintaining diagrams by hand, putior extracts structured workflow data directly from comments in your source files. The [putior-integrator](../agents/putior-integrator.md) agent handles the full lifecycle: installing the package, surveying a repository, annotating source files, generating themed diagrams, and optionally wiring up CI/CD and MCP tooling.

This guide walks you from raw code to visual workflow documentation, covering every skill in the workflow-visualization domain.

## When to Use This Guide

- Documenting a codebase's data flow so new contributors can understand how scripts and data products connect.
- Generating visual workflow diagrams for a README, pkgdown site, or Quarto report.
- Setting up CI/CD to auto-regenerate diagrams whenever source files change.
- Using putior interactively through Claude Code's MCP tools.
- Working in a multi-language repository (R, Python, SQL, JavaScript, Go, Rust, and others) and needing a single visualization tool.

## Prerequisites

- **R** >= 4.1.0 installed and accessible. On WSL: `"/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe" -e "cat(R.version.string)"`.
- **putior-integrator agent** available in your agents directory.
- **A codebase** with source files in one or more of putior's 30+ supported languages.
- For CI/CD: a GitHub repository with Actions enabled.
- For MCP: Claude Code or Claude Desktop configured (see [Setting Up Your Environment](setting-up-your-environment.md)).

## Workflow Overview

The six workflow-visualization skills chain together linearly, with two optional branches:

```
install-putior --> analyze-codebase-workflow --> annotate-source-files --> generate-workflow-diagram
                                                                              +--> setup-putior-ci       (optional)
                                                                              +--> configure-putior-mcp  (optional)
```

If the codebase already has PUT annotations, skip directly to [Step 4](#step-4-generate-diagrams).

## Step 1: Install putior

**Skill**: [install-putior](../skills/install-putior/SKILL.md)

```r
install.packages("putior")   # CRAN stable
# remotes::install_github("pjt222/putior")  # Dev version
```

Verify the pipeline works end-to-end:

```r
library(putior)
cat(put_diagram(put(text = "# put id:'test', label:'Hello putior'")))
```

You should see Mermaid code containing `test["Hello putior"]`.

**Optional dependencies** by feature group:

| Group | Packages | Purpose |
|-------|----------|---------|
| MCP | `mcptools`, `ellmer` | 16 AI assistant tools |
| Interactive | `shiny`, `shinyAce` | Browser annotation sandbox |
| Logging | `logger` | Structured debug output |
| ACP | `plumber2` | Agent-to-agent REST server |

If the project uses renv, install with `renv::install("putior")` instead.

## Step 2: Analyze the Codebase

**Skill**: [analyze-codebase-workflow](../skills/analyze-codebase-workflow/SKILL.md)

Before writing annotations by hand, let putior survey the repository. `put_auto()` uses 862 detection patterns across 15 languages to find file I/O, library calls, and script dependencies.

```r
workflow <- put_auto("./src/",
  detect_inputs = TRUE, detect_outputs = TRUE, detect_dependencies = TRUE)
print(workflow)   # Data frame: id, label, input, output, source_file

# Exclude build scripts or test helpers from scanning
workflow <- put_auto("./src/",
  detect_inputs = TRUE, detect_outputs = TRUE, detect_dependencies = TRUE,
  exclude = c("build-", "test_helper"))
```

Check which languages have auto-detection and generate skeleton annotations:

```r
list_supported_languages(detection_only = TRUE)  # 15 languages
put_generate("./src/", style = "single")         # Print annotation suggestions
```

Auto-detection typically covers 40-60% of the workflow. The rest requires manual annotation (Step 3). For large repos, analyze subdirectories individually to keep diagrams readable:

```r
etl_workflow <- put_auto("./src/etl/")
api_workflow <- put_auto("./src/api/")
```

### Reading the coverage report

The annotation plan produced by `put_generate()` splits files into three categories:

- **Auto-detected** (no manual work needed): files where putior matched clear I/O patterns. Example: `src/etl/extract.R` with 3 inputs and 2 outputs detected.
- **Needs manual annotation**: files in supported languages but with patterns that did not match. Example: `src/api/handler.js` where custom wrapper functions hide file operations.
- **Not auto-detectable**: files in languages beyond the 15 with detection patterns. These still support manual PUT annotations (30+ languages total), but `put_auto()` cannot pre-fill them.

Generate an initial diagram from auto-detected data to visualize coverage before investing in manual annotation:

```r
cat(put_diagram(workflow, theme = "github", show_source_info = TRUE))
```

Disconnected nodes at this stage are normal. They indicate files where auto-detection found I/O but could not infer connections between scripts. The annotation step addresses these gaps.

## Step 3: Annotate Source Files

**Skill**: [annotate-source-files](../skills/annotate-source-files/SKILL.md)

PUT annotations are standard source comments with a specific syntax:

```
<prefix> put id:'unique_id', label:'Human Label', input:'file1.csv', output:'result.parquet'
```

**Fields**: `id` (required, globally unique), `label` (required, shown in diagram), `input` (comma-separated files/variables), `output` (comma-separated files/variables). Use `.internal` extension for in-memory variables that do not persist between scripts.

### Comment prefixes by language

| Language | Prefix | Example |
|----------|--------|---------|
| R, Python, Shell | `#` | `# put id:'step1', label:'Load'` |
| JS, TS, Go, Rust, C, Java | `//` | `// put id:'step1', label:'Load'` |
| SQL, Lua | `--` | `-- put id:'step1', label:'Load'` |
| MATLAB | `%` | `% put id:'step1', label:'Load'` |

Use `get_comment_prefix("ext")` to look up any extension programmatically.

### Block comment annotations

Languages in the `//` group (JS, TS, Go, Rust, C, C++, Java, C#, PHP, Scala, WGSL) also support PUT annotations inside `/* */` and `/** */` block comments. Use `* put` as the line prefix inside the block body:

```javascript
/* put id:'init', label:'Initialize', output:'config.internal' */

/**
 * put id:'transform', label:'Transform Data', input:'raw.json', output:'clean.json'
 */
function transformData(raw) { /* ... */ }
```

Block comment annotations are **only** supported for `//`-prefix languages. They are **not** available for `#`-prefix languages (R, Python, Shell), `--`-prefix languages (SQL, Lua), or `%`-prefix languages (MATLAB). Backslash continuation is not supported inside block comments.

### Example: cross-file data flow

```r
# extract.R
# put id:'extract', label:'Extract Data', output:'clean.rds'
saveRDS(df_clean, "clean.rds")
```

```python
# transform.py
# put id:'transform', label:'Transform', input:'clean.rds', output:'features.parquet'
df = pd.read_parquet("clean.rds")
```

putior connects these nodes automatically because the output `clean.rds` matches the input `clean.rds`.

### Multiline annotations

For steps with many inputs or outputs, use backslash continuation. Every continued line must end with `\` and the next line must begin with the comment prefix:

```r
# put id:'aggregate', \
#   label:'Aggregate Monthly Totals', \
#   input:'transactions.parquet, accounts.csv', \
#   output:'monthly_totals.rds, summary_report.internal'
```

### Naming conventions

Keep annotation IDs globally unique within the scanned scope. The recommended convention is `<script>_<step>`:

- `extract_read` -- the read step in extract.R
- `transform_clean` -- the clean step in transform.py
- `load_write` -- the write step in load.sql

This avoids collisions when putior scans an entire directory tree.

### Validate and merge

```r
workflow <- put("./src/", validate = TRUE)
merged <- put_merge("./src/", merge_strategy = "supplement")
cat(put_diagram(merged, theme = "github"))
```

The `"supplement"` strategy lets auto-detection fill I/O fields that manual annotations omit, maximizing coverage with minimal effort. Other merge strategies are `"manual_priority"` (ignore auto for fields already annotated) and `"union"` (combine all fields from both sources).

## Step 4: Generate Diagrams

**Skill**: [generate-workflow-diagram](../skills/generate-workflow-diagram/SKILL.md)

### 9 available themes

| Theme | Best for | Colorblind-safe |
|-------|----------|-----------------|
| `light` | Default bright | No |
| `dark` | Dark mode | No |
| `auto` | GitHub-adaptive | No |
| `minimal` | Print | No |
| `github` | README files | No |
| `viridis` | General accessibility | Yes |
| `magma` | High-contrast print | Yes |
| `plasma` | Presentations | Yes |
| `cividis` | Maximum accessibility | Yes |

### Generate and embed

```r
workflow <- put_merge("./src/", merge_strategy = "supplement")
cat(put_diagram(workflow, theme = "github"))                          # Console
writeLines(put_diagram(workflow, theme = "github"), "docs/workflow.md") # File
cat(put_diagram(workflow, theme = "viridis", show_source_info = TRUE))  # Traceability
```

### Custom palettes with `put_theme()`

For project-specific color schemes beyond the 9 built-in themes, use `put_theme()`:

```r
cyberpunk <- put_theme(
  base = "dark",
  input    = c(fill = "#1a1a2e", stroke = "#00ff88", color = "#00ff88"),
  process  = c(fill = "#16213e", stroke = "#44ddff", color = "#44ddff"),
  output   = c(fill = "#0f3460", stroke = "#ff3366", color = "#ff3366"),
  decision = c(fill = "#1a1a2e", stroke = "#ffaa33", color = "#ffaa33")
)
cat(put_diagram(workflow, palette = cyberpunk))
```

Unspecified node types inherit from the `base` theme. The `palette` parameter overrides `theme` when both are provided.

**GitHub README**: wrap the output in a ` ```mermaid ` code fence. GitHub renders it natively.

**Quarto**: use `knit_child()` to inject the Mermaid block dynamically, since `{mermaid}` chunks do not support R variables directly.

**R Markdown**: `DiagrammeR::mermaid(put_diagram(workflow, output = "raw"))`.

Clickable nodes (`enable_clicks = TRUE`) work in local renderers but not in GitHub's static Mermaid renderer.

## Optional: CI/CD Integration

**Skill**: [setup-putior-ci](../skills/setup-putior-ci/SKILL.md)

Automate diagram regeneration so documentation never drifts from code.

**1. Add sentinel markers** in README.md where the diagram should appear:

```markdown
<!-- PUTIOR-WORKFLOW-START -->
<!-- PUTIOR-WORKFLOW-END -->
```

**2. Create `scripts/generate-workflow-diagram.R`** that reads annotations, generates Mermaid code, and replaces content between the sentinels. See the [setup-putior-ci skill](../skills/setup-putior-ci/SKILL.md) for the complete script.

**3. Create `.github/workflows/update-workflow-diagram.yml`**:

```yaml
name: Update Workflow Diagram
on:
  push:
    branches: [main]
    paths: ['R/**', 'src/**', 'scripts/**']
permissions:
  contents: write
jobs:
  update-diagram:
    if: github.actor != 'github-actions[bot]'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: r-lib/actions/setup-r@v2
        with:
          use-public-rspm: true
      - name: Install putior
        run: install.packages("putior")
        shell: Rscript {0}
      - name: Generate diagram
        run: Rscript scripts/generate-workflow-diagram.R
      - name: Commit if changed
        run: |
          git config --local user.name "github-actions[bot]"
          git config --local user.email "github-actions[bot]@users.noreply.github.com"
          git add README.md
          git diff --staged --quiet || git commit -m "docs: update workflow diagram [skip ci]"
          git push
```

Key safeguards: the `if:` guard prevents infinite loops from bot commits, `git diff --staged --quiet` skips empty commits, and `permissions: contents: write` grants push access. Adjust the `paths` filter to match where your annotated source files live.

## Optional: MCP Integration

**Skill**: [configure-putior-mcp](../skills/configure-putior-mcp/SKILL.md)

The putior MCP server exposes 16 tools organized into four categories: core workflow (5), reference/discovery (7), utilities (3), and configuration (1).

**Claude Code setup**:

```bash
claude mcp add putior -- Rscript -e "putior::putior_mcp_server()"
# WSL with Windows R:
claude mcp add putior -- "/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe" -e "putior::putior_mcp_server()"
```

**Claude Desktop setup**: add to `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "putior": {
      "command": "C:\\PROGRA~1\\R\\R-45~1.0\\bin\\x64\\Rscript.exe",
      "args": ["-e", "putior::putior_mcp_server()"]
    }
  }
}
```

Restart Claude Desktop after saving. Verify tools with `putior::putior_mcp_tools()` (should return 16 tools).

### The 16 MCP tools

| Category | Tools | Description |
|----------|-------|-------------|
| Core workflow (5) | `put`, `put_diagram`, `put_auto`, `put_generate`, `put_merge` | Scan, detect, generate, merge |
| Reference (7) | `get_comment_prefix`, `get_supported_extensions`, `list_supported_languages`, `get_detection_patterns`, `get_diagram_themes`, `putior_guide`, `putior_help` | Look up language support and themes |
| Utilities (3) | `is_valid_put_annotation`, `split_file_list`, `ext_to_language` | Validate and convert |
| Configuration (1) | `set_putior_log_level` | Control logging verbosity |

Once configured, you can ask Claude to scan a directory, suggest annotations, validate syntax, and generate diagrams -- all within a conversation, without switching to an R console.

## Optional: Interactive Sandbox

If `shiny` is installed, putior provides a browser-based sandbox for experimenting with PUT annotations:

```r
putior::run_sandbox()
```

The sandbox lets you paste or type annotated code, simulate multiple files using `# ===== File: name.R =====` markers, customize diagram settings (theme, direction, artifacts), and copy generated Mermaid code to the clipboard. If `shinyAce` is also installed, the editor gains syntax highlighting.

## Optional: ACP Server

**Skill**: [configure-putior-mcp](../skills/configure-putior-mcp/SKILL.md) (Step 5)

The ACP (Agent Communication Protocol) server complements MCP by exposing putior as a REST API for agent-to-agent communication. While MCP provides model-to-tool integration (Claude directly calling putior functions), ACP enables other AI agents or automation scripts to discover and invoke putior over HTTP.

```r
# Requires plumber2
install.packages("plumber2")

# Start ACP server (blocking — run in a separate R session)
putior::putior_acp_server()                        # Default: localhost:8080
putior::putior_acp_server(host = "0.0.0.0", port = 9000)  # Custom
```

ACP endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/agents` | GET | Discover the putior agent manifest |
| `/runs` | POST | Execute a putior operation via natural language |
| `/runs/:run_id` | GET | Retrieve results of a previous run |

The ACP server understands natural language requests like "scan ./R/ for PUT annotations", "generate a diagram", and "help with annotation syntax". Results are returned as JSON.

## Troubleshooting

**Annotations not detected**: Verify the comment prefix matches the language (`get_comment_prefix("ext")`). Annotations must use single quotes internally (`id:'name'`, not `id:"name"`) and the `put` keyword is case-sensitive. Both line comments (`//`, `#`, `--`) and block comments (`/* */`, `/** */`) are supported. Python triple-quote strings are not scanned.

**Disconnected nodes**: Connections require exact filename matches between outputs and inputs, including extension. `.internal` variables only connect within the same script. Use `put_merge(merge_strategy = "supplement")` to fill gaps.

**Theme not rendering on GitHub**: GitHub's renderer may ignore the `%%{init:...}%%` block. Use the `"github"` theme for the most reliable GitHub rendering.

**CI not triggering**: Check that `paths` in the workflow YAML match your source directories, the branch name is correct, and repository workflow permissions allow write access.

**MCP tools missing**: Ensure `mcptools` and `ellmer` are both installed. For Claude Code, verify with `claude mcp list`. For Claude Desktop, restart after config changes. With renv, confirm the packages are in the library the MCP server command uses.

**Wrong quote nesting**: PUT annotations require single quotes inside: `id:'name'`. Using double quotes (`id:"name"`) causes parsing failures because the annotation string itself may be delimited by double quotes in some contexts. If annotations silently produce no output, check quote style first.

**Scanning too broadly**: Running `put_auto(".")` on a repository root may scan `node_modules/`, `.git/`, `venv/`, and other directories full of third-party code. Target specific source directories like `./R/`, `./src/`, or `./scripts/`, or use the `exclude` parameter: `put_auto(".", exclude = c("node_modules/", "\\.git/", "venv/"))`.

**Package not found in CI**: If the project uses renv, the CI workflow needs `renv::restore()` before putior is available. Alternatively, install putior explicitly in the workflow step (as shown in the CI YAML above) to bypass renv entirely.

## Related Resources

- [putior-integrator agent](../agents/putior-integrator.md) -- capabilities, configuration, and usage scenarios.
- [Skills Library](../skills/) -- browse all skills, including the six workflow-visualization skills referenced in this guide.
- [Understanding the System](understanding-the-system.md) -- how skills, agents, and teams compose.
- [Setting Up Your Environment](setting-up-your-environment.md) -- WSL, MCP, and Claude Code configuration.
- [putior package documentation](https://pjt222.github.io/putior/) -- full API reference and vignettes.
