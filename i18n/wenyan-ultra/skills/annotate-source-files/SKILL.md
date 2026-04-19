---
name: annotate-source-files
locale: wenyan-ultra
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

# 註源檔

加 PUT 流註於源使 putior 取構流數而生 Mermaid 圖。

## 用

- 以 `analyze-codebase-workflow` 析後有註計→用
- 加流文於新或既源→用
- 以手標與接富自察流→用
- 文數管、ETL、多步算→用

## 入

- **必**：欲註之源
- **必**：註計或流步知
- **可**：式偏：單行或多行（默單行）
- **可**：用 `put_generate()` 生骨否（默是）

## 行

### 一：定註前綴

各言有 PUT 註前綴。用 `get_comment_prefix()` 求正者。

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

得：串如 `"#"`、`"--"`、`"//"`、`"%"`。

> **行與塊註**：putior 察行註（`//`、`#`、`--`）與 C 式塊註（`/* */`、`/** */`）之註。JS/TS 兩 `//` 與 `/* */` 塊皆掃。Python 三引號（`''' '''`）**不**察——Python 註用 `#`。

敗：延不識→檔言或不支。察 `get_supported_extensions()` 得全列。不支言用 `#` 為慣默。

### 二：生註骨

用 `put_generate()` 由自察 I/O 建註模。

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

R 例出：
```r
# put id:'extract_data', label:'Extract Customer Data', input:'customers.csv', output:'raw_data.internal'
```

SQL 例出：
```sql
-- put id:'load_data', label:'Load Customer Table', output:'customers'
```

得：各源一或多註行，預填察函名與 I/O。

敗：無薦→檔或無可識 I/O 紋。按碼解手書註。

### 三：精註

改生骨加正標、接、元。

**註語參：**

```
<prefix> put id:'unique_id', label:'Human Readable Label', input:'file1.csv, file2.rds', output:'result.parquet, summary.internal'
```

欄：

- `id`（必）：獨識，為節接用
- `label`（必）：圖中可讀述
- `input`：分號分入檔或變列
- `output`：分號分出檔或變列
- `.internal` 延：示內存變（腳本間不存）
- `node_type`：控 Mermaid 節形與類樣。值：
  - `"input"` —— 體育場形 `([...])` 為數源與設
  - `"output"` —— 子程形 `[[...]]` 為生產
  - `"process"` —— 矩 `[...]` 為處步（默）
  - `"decision"` —— 菱 `{...}` 為條邏
  - `"start"` / `"end"` —— 體育場形 `([...])` 為入/終節

`node_type` 例：
```r
# put id:'config', label:'Load Config', node_type:'input', output:'config.internal'
# put id:'transform', label:'Apply Rules', node_type:'process', input:'config.internal', output:'result.rds'
# put id:'report', label:'Generate Report', node_type:'output', input:'result.rds'
```

**多行語**（複雜註）：
```r
# put id:'complex_step', \
#   label:'Multi-line Label', \
#   input:'data.csv, config.yaml', \
#   output:'result.parquet'
```

**塊註語**（唯 `//` 前綴言：JS、TS、Go、Rust、C、C++、Java 等）：

`//` 行註之言亦支 `/* */` 與 `/** */` 塊註內 PUT 註。塊體內以 `* put` 為行前綴：

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

JSDoc 式註尤益於文流步附 API 文：

```typescript
/**
 * Transform raw sensor data into normalized readings.
 * put id:'normalize', label:'Normalize Sensor Data', input:'raw_readings.json', output:'normalized.parquet'
 */
export function normalizeSensorData(readings: SensorReading[]): NormalizedData {
  // ...
}
```

> **註**：塊註註**不**支 `#` 前綴言（R、Python、Shell）或 `--` 前綴言（SQL、Lua）。彼諸言唯用行註。塊出註不支跨行反斜續。

**跨檔數流**（接腳以檔 I/O）：
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

得：註精以正 ID、標、I/O 反實數流。

敗：I/O 不確→內存中間用 `.internal` 延、存數用明檔名。

### 四：插註入檔

置註於檔頂或關碼上。

**置例**：

1. **檔級註**：置於檔頂、shebang 或檔頭註後
2. **塊級註**：置於所述碼上
3. **每檔多註**：用於有獨流階之檔

R 例置：
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

用 Edit 工於既檔插註而不擾周碼。

得：註插於各源適位。

敗：註破編輯器語法亮→確言註前綴正。PUT 註乃標註不應影碼行。

### 五：驗註

行 putior 驗以察註語與接。

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

得：諸註析無誤。圖示接流。`put_merge()` 補自察缺。

敗：常驗症：

- 缺閉引：`id:'name` → `id:'name'`
- 內用雙引：`id:"name"` → `id:'name'`
- 跨檔重 ID：各 `id` 須於全掃處獨
- 反斜續於誤行：`\` 須為換行前末字

## 驗

- [ ] 諸註檔有語有效 PUT 註
- [ ] `put("./src/")` 返預期節數之數框
- [ ] 掃處無重 `id`
- [ ] `put_diagram()` 出接流圖（非孤節）
- [ ] 多行註（若用）以反斜續正析
- [ ] `.internal` 變唯為出，不為跨檔入
- [ ] 經 `exclude` 排之檔不於流（如 `put("./src/", exclude = "test_")` 跳測助）

## 忌

- **引嵌誤**：PUT 註用單引：`id:'name'`。雙引致註於串脈時析誤
- **重 ID**：各 `id` 於掃域須全獨。用 `<script>_<step>` 例（如 `extract_read`、`transform_clean`）
- **`.internal` 為跨檔入**：`.internal` 變唯腳本行時存。腳本間傳數用存式（`.rds`、`.csv`、`.parquet`）為一腳本之出與次之入
- **缺接**：圖示斷節→察一註之出檔名與他註之入檔名字字相符（含延）
- **註前綴誤**：SQL 用 `#` 或 Python 用 `//` 致註為碼非註。恆以 `get_comment_prefix()` 驗
- **忘多行續**：多行註各續行須以 `\` 終、次行須以註前綴始
- **Python 三引號**：putior 不掃 Python 三引號（`''' '''`、`""" """`）。Python PUT 註恆用 `#`
- **元管線註**：註亦掃註之建腳（如腳呼 `put()` 與 `put_diagram()`），其註現於生圖。或自掃排檔（見 `generate-workflow-diagram` 忌）或建腳本內勿置 PUT 註

## 參

- `analyze-codebase-workflow` —— 前置：出此技循之註計
- `generate-workflow-diagram` —— 次步：自註生末圖
- `install-putior` —— 註前須裝 putior
- `configure-putior-mcp` —— MCP 工供互註助
