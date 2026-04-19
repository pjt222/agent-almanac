---
name: analyze-codebase-workflow
locale: wenyan-lite
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

調查任一倉庫以自動偵測資料流、檔案 I/O 與腳本依賴，並產出結構化標註計畫供人工精修。

## 適用時機

- 初涉陌生碼庫，須解資料流
- 於尚無 PUT 標註之專案啟動 putior 整合
- 文件化前審計既有專案之資料管線
- 於行 `annotate-source-files` 前備標註計畫

## 輸入

- **必要**：欲分析之倉庫或源目錄之路徑
- **選擇性**：欲聚焦之特定子目錄（預設：整倉庫）
- **選擇性**：欲納入或排除之語言（預設：一切已偵測者）
- **選擇性**：偵測範圍：僅輸入、僅輸出、或二者（預設：二者 + 依賴）

## 步驟

### 步驟一：調查倉庫結構

辨源檔及其語言以解 putior 可析者。

```r
library(putior)

# List all supported languages and their extensions
list_supported_languages()
list_supported_languages(detection_only = TRUE)  # Only languages with auto-detection

# Get supported extensions
exts <- get_supported_extensions()
```

以列檔解倉庫構成：

```bash
# Count files by extension in the target directory
find /path/to/repo -type f | sed 's/.*\.//' | sort | uniq -c | sort -rn | head -20
```

**預期：** 倉庫所現副檔名清單，附計數。將此對 `get_supported_extensions()` 比，以知覆蓋。

**失敗時：** 若倉庫無檔合於支援之副檔名，putior 不能自動偵測工作流。考量語言雖支援然檔用非標準副檔名。

### 步驟二：查語言偵測之覆蓋

對每偵測之語言，驗自動偵測模式之可用性。

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

**預期：** 各語言之模式計數已印。R 有 124 模式，Python 159，JavaScript 71 等。

**失敗時：** 若語言回無模式，則支援人工標註而非自動偵測。計畫人工標註該等檔。

### 步驟三：執行自動偵測

於目標目錄行 `put_auto()` 以發現工作流元素。

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

對大型倉庫，逐次分析子目錄：

```r
# Analyze specific subdirectories
etl_workflow <- put_auto("./src/etl/")
api_workflow <- put_auto("./src/api/")
```

**預期：** data frame 含 `id`、`label`、`input`、`output`、`source_file` 等欄。每行表一偵測之工作流步驟。

**失敗時：** 若結果為空，源檔或不含可識之 I/O 模式。試啟除錯記錄：`workflow <- put_auto("./src/", log_level = "DEBUG")`，以見何檔被掃、何模式相符。

### 步驟四：生初圖

視覺化自動偵測之工作流以評覆蓋並辨缺。

```r
# Generate diagram from auto-detected workflow
cat(put_diagram(workflow, theme = "github"))

# With source file info for traceability
cat(put_diagram(workflow, show_source_info = TRUE))

# Save to file for review
writeLines(put_diagram(workflow, theme = "github"), "workflow-auto.md")
```

**預期：** Mermaid 流程圖呈現偵測之節點，以資料流邊相連。節點應以有意義之函式／檔案名標。

**失敗時：** 若圖呈分離節點，自動偵測尋得 I/O 模式然不能推連結。此為常——連結由比對輸出檔名與輸入檔名而得。標註計畫（下一步）將彌缺。

### 步驟五：產標註計畫

生結構化計畫，記所尋得者與所需人工標註者。

```r
# Generate annotation suggestions
put_generate("./src/", style = "single")

# For multiline style (more readable for complex workflows)
put_generate("./src/", style = "multiline")

# Copy suggestions to clipboard for easy pasting
put_generate("./src/", output = "clipboard")
```

附覆蓋評估之計畫文件：

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

**預期：** 清晰之計畫，分自動偵測之檔與需人工標註者，附各檔具體建議。

**失敗時：** 若 `put_generate()` 無輸出，確保目錄路徑正確且含支援語言之源檔。

## 驗證

- [ ] `put_auto()` 於目標目錄執行而無誤
- [ ] 偵測之工作流至少一節點（除非倉庫無可識之 I/O）
- [ ] `put_diagram()` 自自動偵測之工作流產有效 Mermaid 碼
- [ ] `put_generate()` 為偵測模式之檔產標註建議
- [ ] 標註計畫文件已建，附覆蓋評估

## 常見陷阱

- **掃過廣**：於倉庫根行 `put_auto(".")` 恐含 `node_modules/`、`.git/`、`venv/` 等。鎖定特定源目錄
- **期全覆蓋**：自動偵測尋得檔案 I/O 與函式庫呼叫，非業務邏輯。40-60% 覆蓋為常；其餘需人工標註
- **忽依賴**：`detect_dependencies = TRUE` 旗標捕 `source()`、`import`、`require()` 呼叫以連腳本。停之則失跨檔連結
- **語言不符**：副檔名非標準之檔（如 `.R` vs `.r`、`.jsx` vs `.js`）恐不被偵測。用 `get_comment_prefix()` 查副檔名是否識。注：無副檔名之檔如 `Dockerfile`、`Makefile` 透過精確檔名比對而支援
- **大型倉庫**：對 100+ 源檔之倉庫，按模組／目錄分析以保圖可讀

## 相關技能

- `install-putior` — 先決：putior 須先安裝
- `annotate-source-files` — 下步：依計畫加人工標註
- `generate-workflow-diagram` — 標註完後生最終圖
- `configure-putior-mcp` — 用 MCP 工具行互動分析會話
