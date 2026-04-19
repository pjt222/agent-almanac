---
name: annotate-source-files
locale: wenyan
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

# 注源檔

添 PUT 工作流注於源檔，使 putior 可取結構化工作流數而生 Mermaid 圖。

## 用時

- 以 `analyze-codebase-workflow` 析畢且有注計後乃用
- 添工作流文於新或既源檔乃用
- 以手標與連豐自察工作流乃用
- 書數管、ETL、多步計算乃用

## 入

- **必要**：待注之源檔
- **必要**：注計或工作流諸步之知
- **可選**：風格：單行或多行（默：單行）
- **可選**：用 `put_generate()` 生骨乎（默：是）

## 法

### 第一步：定注之前綴

各語有特注前綴。以 `get_comment_prefix()` 得之。

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

**得：** 一串如 `"#"`、`"--"`、`"//"`、或 `"%"`。

> **行注與塊注**：putior 察行注（`//`、`#`、`--`）及 C 式塊注（`/* */`、`/** */`）中之注。JS/TS 行注與塊注皆掃。Python 三引號串（`''' '''`）*不*察——Python 注用 `#`。

**敗則：** 若擴未識，檔語或不支。以 `get_supported_extensions()` 察全列。不支之語用 `#` 為約默。

### 第二步：生注骨

用 `put_generate()` 以自察 I/O 建注樣。

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

R 檔之例：
```r
# put id:'extract_data', label:'Extract Customer Data', input:'customers.csv', output:'raw_data.internal'
```

SQL 之例：
```sql
-- put id:'load_data', label:'Load Customer Table', output:'customers'
```

**得：** 每源檔一或多注行，預填察函名與 I/O。

**敗則：** 若無薦生，檔或無可識 I/O 式。依碼解手書注。

### 第三步：精注

編骨以添正標、連、元。

**注語法參：**

```
<prefix> put id:'unique_id', label:'Human Readable Label', input:'file1.csv, file2.rds', output:'result.parquet, summary.internal'
```

欄：
- `id`（必）：獨識，連節用
- `label`（必）：圖顯之人讀述
- `input`：入檔或量逗列
- `output`：出檔或量逗列
- `.internal` 擴：標記憶量（腳本間未存）
- `node_type`：控 Mermaid 節形與類：
  - `"input"` — 體育場形 `([...])` 為數源與設
  - `"output"` — 子程形 `[[...]]` 為生物
  - `"process"` — 矩 `[...]` 為處理步（默）
  - `"decision"` — 菱 `{...}` 為條件邏輯
  - `"start"` / `"end"` — 體育場形 `([...])` 為入/終節

附 `node_type` 之例：
```r
# put id:'config', label:'Load Config', node_type:'input', output:'config.internal'
# put id:'transform', label:'Apply Rules', node_type:'process', input:'config.internal', output:'result.rds'
# put id:'report', label:'Generate Report', node_type:'output', input:'result.rds'
```

**多行語法**（為繁注）：
```r
# put id:'complex_step', \
#   label:'Multi-line Label', \
#   input:'data.csv, config.yaml', \
#   output:'result.parquet'
```

**塊注語法**（唯 `//` 前綴之語：JS、TS、Go、Rust、C、C++、Java 等）：

用 `//` 行注之語亦支 `/* */` 與 `/** */` 塊注中之 PUT 注。塊內用 `* put` 為行前：

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

JSDoc 式注尤宜於書工作流步附 API 文：

```typescript
/**
 * Transform raw sensor data into normalized readings.
 * put id:'normalize', label:'Normalize Sensor Data', input:'raw_readings.json', output:'normalized.parquet'
 */
export function normalizeSensorData(readings: SensorReading[]): NormalizedData {
  // ...
}
```

> **注**：塊注注*不*支 `#` 前綴之語（R、Python、Shell）或 `--` 前綴之語（SQL、Lua）。彼語唯用行注。塊起注不支跨行反斜續。

**跨檔數流**（以檔 I/O 連本）：
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

**得：** 注精附正 ID、標、I/O 欄映實數流。

**敗則：** 若 I/O 不定，用 `.internal` 擴於記憶中間，用明檔名於持數。

### 第四步：插注於檔

置注於檔首或相關塊之上。

**位之例**：
1. **檔級注**：置檔首（shebang 或檔頭注後）
2. **塊級注**：置所述塊之上
3. **每檔多注**：於有別工作流段之檔用

R 檔位例：
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

用 Edit 工具插注於既檔而不擾周圍碼。

**得：** 注插於每源檔之宜位。

**敗則：** 若注亂編之語法高亮，確注前綴合語。PUT 注為標注，當不影碼執行。

### 第五步：驗注

行 putior 驗以察注語法與連。

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

**得：** 諸注皆析無訛。圖示連之工作流。`put_merge()` 補自察之隙。

**敗則：** 常驗患：
- 閉引闕：`id:'name` → `id:'name'`
- 內用雙引：`id:"name"` → `id:'name'`
- 跨檔重 ID：每 `id` 於掃目內必獨
- 反斜續於誤行：`\` 必為換行前末字

## 驗

- [ ] 每注檔有語法有效 PUT 注
- [ ] `put("./src/")` 返期節數之數框
- [ ] 掃目無重 `id`
- [ ] `put_diagram()` 生連之流圖（非諸離節）
- [ ] 多行注（若用）正析附反斜續
- [ ] `.internal` 量只為出，勿為跨檔入
- [ ] 經 `exclude` 排之檔不現於工作流（如 `put("./src/", exclude = "test_")` 跳試助）

## 陷

- **引套誤**：PUT 注用單引：`id:'name'`。雙引於串境致析患
- **重 ID**：每 `id` 於掃範內必全獨。用如 `<script>_<step>` 之命約（如 `extract_read`、`transform_clean`）
- **`.internal` 為跨檔入**：`.internal` 量只於本執行時存。本間傳數用持檔式（`.rds`、`.csv`、`.parquet`）為一本之出、他本之入
- **連闕**：若圖示離節，察一注之出檔名與他注之入檔名全合（含擴）
- **誤注前綴**：SQL 檔用 `#` 或 Python 用 `//` 致注被視為碼。恆以 `get_comment_prefix()` 驗
- **忘多行續**：多行注每續行必以 `\` 終，下行必以注前綴始
- **Python 三引號串**：putior 不掃 Python 三引號串（`''' '''`、`""" """`）。Python PUT 注恆用 `#`
- **元管道注**：若注亦掃注之建本（如呼 `put()` 與 `put_diagram()` 之本），本自之注現於所生圖。或從掃排此檔（見 `generate-workflow-diagram` 常陷），或勿於建本置 PUT 注

## 參

- `analyze-codebase-workflow` — 前置：生此技所循之注計
- `generate-workflow-diagram` — 下步：自注生終圖
- `install-putior` — 注前 putior 必裝
- `configure-putior-mcp` — MCP 工具供互注助
