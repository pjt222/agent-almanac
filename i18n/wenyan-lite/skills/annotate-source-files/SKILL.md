---
name: annotate-source-files
locale: wenyan-lite
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

# 標註源檔

於源檔加入 PUT 工作流標註，使 putior 可提取結構化工作流資料並生成 Mermaid 圖。

## 適用時機

- 以 `analyze-codebase-workflow` 析碼庫並具標註計畫後
- 為新或既有源檔加入工作流文件
- 以人工標籤與連結補自動偵測之工作流
- 文件化資料管線、ETL 流程或多步計算

## 輸入

- **必要**：欲標註之源檔
- **必要**：標註計畫或工作流步驟之知
- **選擇性**：風格偏好：單行或多行（預設：單行）
- **選擇性**：是否用 `put_generate()` 生鷹架（預設：是）

## 步驟

### 步驟一：判註解前綴

各語言有特定之 PUT 標註註解前綴。用 `get_comment_prefix()` 尋正確者。

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

**預期：** 字串如 `"#"`、`"--"`、`"//"` 或 `"%"`。

> **行與區塊註解**：putior 偵測行註解（`//`、`#`、`--`）與 C 風區塊註解（`/* */`、`/** */`）中之標註。對 JS/TS，`//` 與 `/* */` 區塊皆掃。Python 三引號字串（`''' '''`）**不**被偵測——Python 標註用 `#`。

**失敗時：** 若副檔名未識，檔案語言或不支援。查 `get_supported_extensions()` 之全列。對不支援之語言，按慣例用 `#` 為預設。

### 步驟二：生標註鷹架

用 `put_generate()` 依自動偵測之 I/O 建標註模板。

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

R 檔之輸出例：
```r
# put id:'extract_data', label:'Extract Customer Data', input:'customers.csv', output:'raw_data.internal'
```

SQL 之輸出例：
```sql
-- put id:'load_data', label:'Load Customer Table', output:'customers'
```

**預期：** 每源檔一或多行標註註解，預填偵測之函式名與 I/O。

**失敗時：** 若無建議生，檔案或不含可識之 I/O 模式。依碼之解人工撰標註。

### 步驟三：精修標註

編生成之鷹架以加準之標籤、連結與元資料。

**標註語法參考：**

```
<prefix> put id:'unique_id', label:'Human Readable Label', input:'file1.csv, file2.rds', output:'result.parquet, summary.internal'
```

欄：
- `id`（必要）：唯一識別，用於節點連結
- `label`（必要）：圖中顯示之人讀描述
- `input`：輸入檔或變數之逗號分隔列
- `output`：輸出檔或變數之逗號分隔列
- `.internal` 副檔名：標記記憶體變數（不於腳本間持久）
- `node_type`：控 Mermaid 節點形與類別樣式。值：
  - `"input"` — 體育場形 `([...])`，為資料源與配置
  - `"output"` — 子例程形 `[[...]]`，為生成之產物
  - `"process"` — 矩形 `[...]`，為處理步驟（預設）
  - `"decision"` — 菱形 `{...}`，為條件邏輯
  - `"start"` / `"end"` — 體育場形 `([...])`，為入口／終點節點

附 `node_type` 之例：
```r
# put id:'config', label:'Load Config', node_type:'input', output:'config.internal'
# put id:'transform', label:'Apply Rules', node_type:'process', input:'config.internal', output:'result.rds'
# put id:'report', label:'Generate Report', node_type:'output', input:'result.rds'
```

**多行語法**（為繁標註）：
```r
# put id:'complex_step', \
#   label:'Multi-line Label', \
#   input:'data.csv, config.yaml', \
#   output:'result.parquet'
```

**區塊註解語法**（僅於 `//` 前綴語言：JS、TS、Go、Rust、C、C++、Java 等）：

行註解用 `//` 之語言亦支援於 `/* */` 與 `/** */` 區塊註解內之 PUT 標註。於區塊本內以 `* put` 為行前綴：

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

JSDoc 風標註於與 API 文件同記工作流步驟時尤有用：

```typescript
/**
 * Transform raw sensor data into normalized readings.
 * put id:'normalize', label:'Normalize Sensor Data', input:'raw_readings.json', output:'normalized.parquet'
 */
export function normalizeSensorData(readings: SensorReading[]): NormalizedData {
  // ...
}
```

> **註**：區塊註解標註**不**支援於 `#` 前綴語言（R、Python、Shell）或 `--` 前綴語言（SQL、Lua）。彼等語言僅用行註解。區塊起源之標註不支援跨行之反斜線續行。

**跨檔資料流**（藉檔案 I/O 連腳本）：
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

**預期：** 標註已精修，附準之 ID、標籤、I/O 欄，反映實際資料流。

**失敗時：** 若不確 I/O，記憶體中間用 `.internal` 副檔名，持久資料用明確檔名。

### 步驟四：將標註插入檔中

將標註置於每檔之頂或緊於相關碼塊之上。

**置放慣例**：
1. **檔層級標註**：置於檔頂，於任 shebang 行或檔頭註解之後
2. **塊層級標註**：置於所述碼塊之緊上方
3. **每檔多標註**：用於有不同工作流階段之檔

R 檔之置放例：
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

用 Edit 工具於既有檔中插標註而不擾周碼。

**預期：** 標註已插於每源檔之宜處。

**失敗時：** 若標註斷編輯器之語法高亮，確註解前綴於該語言正確。PUT 標註為標準註解，不應影響碼之執行。

### 步驟五：驗證標註

行 putior 之驗證以查標註語法與連結。

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

**預期：** 一切標註解析而無誤。圖呈相連之工作流。`put_merge()` 補自自動偵測之缺。

**失敗時：** 常見驗證問題：
- 缺收引號：`id:'name` → `id:'name'`
- 內用雙引號：`id:"name"` → `id:'name'`
- 跨檔重複 ID：每 `id` 須於整掃描目錄內唯一
- 反斜線續行於誤行：`\` 須為換行前之最末字元

## 驗證

- [ ] 每標註檔之 PUT 標註語法有效
- [ ] `put("./src/")` 回預期節點數之 data frame
- [ ] 掃描目錄內無重複 `id` 值
- [ ] `put_diagram()` 產相連流程圖（非全孤立節點）
- [ ] 多行標註（若用）以反斜線續行正確解析
- [ ] `.internal` 變數僅作輸出，從不作跨檔輸入
- [ ] 經 `exclude` 參數排除之檔不現於工作流（如 `put("./src/", exclude = "test_")` 跳測試輔助）

## 常見陷阱

- **引號嵌套錯**：PUT 標註用單引號：`id:'name'`。雙引號於字串情境中致解析問題
- **重複 ID**：每 `id` 須於掃範圍內全域唯一。用如 `<script>_<step>` 之命名慣例（如 `extract_read`、`transform_clean`）
- **.internal 作跨檔輸入**：`.internal` 變數僅於腳本執行期間存。於腳本間傳資料用持久檔格式（`.rds`、`.csv`、`.parquet`）為一腳本之輸出與下一之輸入
- **缺連結**：若圖呈分離節點，查一標註之輸出檔名是否精合另一之輸入檔名（含副檔名）
- **註解前綴錯**：於 SQL 檔用 `#` 或於 Python 用 `//` 致標註被視為碼非註解。恆以 `get_comment_prefix()` 驗
- **遺多行續行**：用多行標註時，每續行須以 `\` 結，且下行須以註解前綴始
- **Python 三引號字串**：putior 不掃 Python 三引號字串（`''' '''`、`""" """`）。Python PUT 標註恆用 `#`
- **後設管線標註**：若標註亦掃標註之建構腳本（如呼 `put()` 與 `put_diagram()` 之腳本），腳本之標註將現於生成圖。或自掃排除該檔（見 `generate-workflow-diagram` 之常見陷阱），或避於建構腳本中置 PUT 標註

## 相關技能

- `analyze-codebase-workflow` — 先決：產出此技能所循之標註計畫
- `generate-workflow-diagram` — 下步：自標註生最終圖
- `install-putior` — 標註前 putior 須安裝
- `configure-putior-mcp` — MCP 工具供互動標註輔助
