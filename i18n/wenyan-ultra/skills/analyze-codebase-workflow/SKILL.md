---
name: analyze-codebase-workflow
locale: wenyan-ultra
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

# 析庫流

掃庫自察數流、檔 I/O、依，出註計可手精。

## 用

- 入新庫須知數流→用
- 項無 PUT 註而起 putior→用
- 文前審項數流→用
- `annotate-source-files` 前備註計→用

## 入

- **必**：庫或源處之路
- **可**：注定子處（默全庫）
- **可**：含/排之言（默諸察）
- **可**：察範：唯入、唯出、或兩（默兩+依）

## 行

### 一：掃庫構

識源檔與其言以知 putior 可析者。

```r
library(putior)

# List all supported languages and their extensions
list_supported_languages()
list_supported_languages(detection_only = TRUE)  # Only languages with auto-detection

# Get supported extensions
exts <- get_supported_extensions()
```

以列檔知庫成：

```bash
# Count files by extension in the target directory
find /path/to/repo -type f | sed 's/.*\.//' | sort | uniq -c | sort -rn | head -20
```

得：庫中諸延附數。映於 `get_supported_extensions()` 知覆。

敗：庫無檔合支延→putior 不能自察。或言支但檔用非標延。

### 二：察言覆

各察言驗自察紋有否。

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

得：各言紋數印。R 124、Python 159、JavaScript 71 等。

敗：言返無紋→支手註而非自察。計手註此檔。

### 三：行自察

於標處行 `put_auto()` 以發流元。

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

大庫漸析子處：

```r
# Analyze specific subdirectories
etl_workflow <- put_auto("./src/etl/")
api_workflow <- put_auto("./src/api/")
```

得：數框含 `id`、`label`、`input`、`output`、`source_file` 等欄。各行為一察流步。

敗：果空→源或無可識 I/O 紋。試開除錯：`workflow <- put_auto("./src/", log_level = "DEBUG")` 察掃檔與配紋。

### 四：生初圖

繪自察流以評覆與識缺。

```r
# Generate diagram from auto-detected workflow
cat(put_diagram(workflow, theme = "github"))

# With source file info for traceability
cat(put_diagram(workflow, show_source_info = TRUE))

# Save to file for review
writeLines(put_diagram(workflow, theme = "github"), "workflow-auto.md")
```

得：Mermaid 流圖示察點以數流邊接。點標當有意函/檔名。

敗：圖示斷點→自察找 I/O 紋而不能推接。常事——接由出檔名配入檔名而生。註計（次步）解缺。

### 五：出註計

生構文示所發及待手註者。

```r
# Generate annotation suggestions
put_generate("./src/", style = "single")

# For multiline style (more readable for complex workflows)
put_generate("./src/", style = "multiline")

# Copy suggestions to clipboard for easy pasting
put_generate("./src/", output = "clipboard")
```

文以覆評：

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

得：清計分自察檔與待手註者，附各檔具體薦。

敗：`put_generate()` 無出→確路正且含支言之源檔。

## 驗

- [ ] `put_auto()` 於標處行而無誤
- [ ] 察流至少一點（除非庫無可識 I/O）
- [ ] `put_diagram()` 自察流出有效 Mermaid
- [ ] `put_generate()` 為察紋之檔出註薦
- [ ] 註計文已建附覆評

## 忌

- **掃過廣**：庫根行 `put_auto(".")` 或含 `node_modules/`、`.git/`、`venv/` 等。標定源處
- **盼全覆**：自察找檔 I/O 與庫呼非商邏。常 40-60% 覆；餘待手註
- **忽依**：`detect_dependencies = TRUE` 旗捕 `source()`、`import`、`require()` 連腳。停則失跨檔接
- **言不配**：非標延（如 `.R` 對 `.r`、`.jsx` 對 `.js`）或不察。用 `get_comment_prefix()` 察延識否。`Dockerfile`、`Makefile` 等無延檔以全名配支
- **大庫**：百源檔以上→按模/處析以保圖可讀

## 參

- `install-putior` — 前置：先裝 putior
- `annotate-source-files` — 次步：按計加手註
- `generate-workflow-diagram` — 註畢生末圖
- `configure-putior-mcp` — 用 MCP 工為互析
