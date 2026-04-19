---
name: analyze-codebase-workflow
locale: wenyan
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

# 析碼庫工作流

察庫以自察數流、檔 I/O、本依，生結構化之注計備人改。

## 用時

- 入生疏之碼庫而需識數流乃用
- 項未有 PUT 注而始 putior 整合乃用
- 既項之數管於書文前審乃用
- 行 `annotate-source-files` 前備注計乃用

## 入

- **必要**：待析庫或源目之徑
- **可選**：特焦之子目（默：全庫）
- **可選**：納或排之語（默：諸察）
- **可選**：察之範：只入、只出、或兼（默：兼加依）

## 法

### 第一步：察庫之構

識源檔與其語，以知 putior 可析者。

```r
library(putior)

# List all supported languages and their extensions
list_supported_languages()
list_supported_languages(detection_only = TRUE)  # Only languages with auto-detection

# Get supported extensions
exts <- get_supported_extensions()
```

以檔列解庫之組：

```bash
# Count files by extension in the target directory
find /path/to/repo -type f | sed 's/.*\.//' | sort | uniq -c | sort -rn | head -20
```

**得：** 庫中擴名之列附計。對於 `get_supported_extensions()` 以知覆蓋。

**敗則：** 若庫無合擴之檔，putior 不可自察工作流。察語雖支而檔用非標擴乎。

### 第二步：察語自察之覆蓋

每察之語，驗自察式之備。

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

**得：** 每語之式計已印。R 有 124 式，Python 159，JavaScript 71，等。

**敗則：** 若某語返無式，其支手注而非自察。計以手注之。

### 第三步：行自察

於目目行 `put_auto()` 以察工作流之元。

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

大庫則按子目漸析：

```r
# Analyze specific subdirectories
etl_workflow <- put_auto("./src/etl/")
api_workflow <- put_auto("./src/api/")
```

**得：** 一數框，含 `id`、`label`、`input`、`output`、`source_file` 等列。每行一察工作步。

**敗則：** 若空，源或無可識 I/O 式。啟調試日誌：`workflow <- put_auto("./src/", log_level = "DEBUG")` 以察何檔被掃、何式匹。

### 第四步：生初圖

視自察之工作流以估覆與識隙。

```r
# Generate diagram from auto-detected workflow
cat(put_diagram(workflow, theme = "github"))

# With source file info for traceability
cat(put_diagram(workflow, show_source_info = TRUE))

# Save to file for review
writeLines(put_diagram(workflow, theme = "github"), "workflow-auto.md")
```

**得：** Mermaid 流圖，顯察之節以數流之緣相連。節以有義之函/檔名標之。

**敗則：** 若圖顯離節，自察得 I/O 式而不能推連。此常——連由匹輸出名於輸入名而出。下步之注計補隙。

### 第五步：生注計

生結構化之計，書所察與所需手注者。

```r
# Generate annotation suggestions
put_generate("./src/", style = "single")

# For multiline style (more readable for complex workflows)
put_generate("./src/", style = "multiline")

# Copy suggestions to clipboard for easy pasting
put_generate("./src/", output = "clipboard")
```

書計附覆評：

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

**得：** 清計分自察檔與需手注者，各有具體薦。

**敗則：** 若 `put_generate()` 無出，確目徑正且含支語之源檔。

## 驗

- [ ] `put_auto()` 於目目行而無訛
- [ ] 察工作流至少一節（除非庫無可識 I/O）
- [ ] `put_diagram()` 自自察工作流生有效 Mermaid 碼
- [ ] `put_generate()` 為察式之檔生注薦
- [ ] 注計文已立附覆評

## 陷

- **掃過廣**：於庫根行 `put_auto(".")` 或納 `node_modules/`、`.git/`、`venv/` 等。指定源目
- **期全覆**：自察得檔 I/O 與庫呼，非業邏。四至六成覆為常；餘需手注
- **忽依**：`detect_dependencies = TRUE` 捕 `source()`、`import`、`require()` 連本。禁之失跨檔連
- **語不合**：非標擴（如 `.R` 對 `.r`、`.jsx` 對 `.js`）或不可察。以 `get_comment_prefix()` 察擴被識乎。無擴之檔如 `Dockerfile`、`Makefile` 經全名匹支
- **大庫**：百以上源檔之庫，按模/目析以保圖可讀

## 參

- `install-putior` — 前置：putior 必先裝
- `annotate-source-files` — 下步：按計添手注
- `generate-workflow-diagram` — 注畢生終圖
- `configure-putior-mcp` — 以 MCP 工具行互析會
