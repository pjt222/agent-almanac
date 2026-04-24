---
name: generate-puzzle
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Generate jigsaw puzzles via generate_puzzle() or geom_puzzle_*() with
  parameter validation against inst/config.yml. Supports rectangular,
  hexagonal, concentric, voronoi, and snic puzzle types with configurable
  grid, size, seed, offset, and layout parameters. Use when creating puzzle
  SVG files for a specific type and configuration, testing generation with
  different parameters, generating sample output for documentation or demos,
  or creating ggplot2 puzzle visualizations.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: jigsawr
  complexity: basic
  language: R
  tags: jigsawr, puzzle, svg, generation, ggplot2
---

# 生拼圖

以 jigsawR 套件統一之 API 生拼圖。

## 適用時機

- 為特定類型與配置建拼圖 SVG 檔
- 以不同參數試拼圖生成
- 為文件或示範生樣本輸出
- 以 geom_puzzle_*() 建 ggplot2 拼圖視覺化

## 輸入

- **必要**：拼圖類型（`"rectangular"`、`"hexagonal"`、`"concentric"`、`"voronoi"`、`"random"`、`"snic"`）
- **必要**：格尺寸（依類型：`c(cols, rows)` 或 `c(rings)`）
- **選擇性**：大小（毫米，依類型之預設）
- **選擇性**：種子以利重現（預設：42）
- **選擇性**：偏移（0 = 互鎖、>0 = 塊分離）
- **選擇性**：佈局（`"grid"` 或 `"repel"`，限矩形）
- **選擇性**：融合群（PILES 表示字串）

## 步驟

### 步驟一：讀配置約束

```bash
R_EXE="/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe"
"$R_EXE" -e "cat(yaml::yaml.load_file('inst/config.yml')[['{TYPE}']]$grid$max)"
```

或直讀 `inst/config.yml` 以核所擇類型之有效範圍。

**預期：** 所擇拼圖類型之 grid、size、tabsize 等參數之最小/最大值已知。

**失敗時：** 若 `config.yml` 缺或類型鍵不存，核是否於 jigsawR 專案根目錄且套件至少已建一次。

### 步驟二：定類型與參數

將用戶請求映射至 `generate_puzzle()` 之有效參數：

| 類型 | grid | size | 附加參數 |
|------|------|------|-------------|
| rectangular | `c(cols, rows)` | `c(width, height)` mm | `offset`、`layout`、`tabsize` |
| hexagonal | `c(rings)` | `c(diameter)` mm | `do_warp`、`do_trunc`、`tabsize` |
| concentric | `c(rings)` | `c(diameter)` mm | `center_shape`、`tabsize` |
| voronoi | `c(cols, rows)` | `c(width, height)` mm | `n_interior`、`tabsize` |
| random | `c(cols, rows)` | `c(width, height)` mm | `n_interior`、`tabsize` |
| snic | `c(cols, rows)` | `c(width, height)` mm | `n_interior`、`compactness`、`tabsize` |

**預期：** 用戶請求映射至有效之 `generate_puzzle()` 參數，`type` 正確、`grid` 尺寸與 `size` 值於 config.yml 範圍內。

**失敗時：** 若不確用何參數格式，參上表。Rectangular 與 voronoi 類型之 grid 用 `c(cols, rows)`；hexagonal 與 concentric 用 `c(rings)`。

### 步驟三：建 R 腳本

書腳本檔（較複雜指令優於 `-e`）：

```r
library(jigsawR)

result <- generate_puzzle(
  type = "rectangular",
  seed = 42,
  grid = c(3, 4),
  size = c(400, 300),
  offset = 0,
  layout = "grid"
)

cat("Pieces:", length(result$pieces), "\n")
cat("SVG length:", nchar(result$svg_content), "\n")
cat("Files:", paste(result$files, collapse = ", "), "\n")
```

存於暫存腳本檔。

**預期：** R 腳本檔存於暫存位置，含 `library(jigsawR)`、帶完整參數之 `generate_puzzle()` 呼叫與診斷輸出行。

**失敗時：** 若腳本有語法錯，驗所有字串參數加引號，數值向量用 `c()`。永以腳本檔避複雜 shell 轉義。

### 步驟四：以 WSL R 執行

```bash
R_EXE="/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe"
"$R_EXE" /path/to/script.R
```

**預期：** 腳本無錯完成。SVG 檔寫至 `output/`。

**失敗時：** 核 renv 已恢復（`renv::restore()`）。驗套件已載（`devtools::load_all()`）。勿用 `--vanilla` 旗標（renv 需 .Rprofile）。

### 步驟五：驗輸出

- SVG 檔存於 `output/` 目錄
- SVG 內容以 `<?xml` 或 `<svg` 始
- 塊數配預期：cols * rows（矩形）、環公式（六角/同心）
- ggplot2 路徑則驗繪圖物件無錯渲染

**預期：** SVG 檔存於 `output/`，內容以 `<?xml` 或 `<svg` 始，塊數配格規範（矩形為 cols * rows，六角/同心為環公式）。

**失敗時：** 若 SVG 檔缺，核 `output/` 目錄存。若塊數錯，驗 grid 尺寸配拼圖類型之預期公式。ggplot2 輸出，以 `tryCatch()` 包核繪圖無錯渲染。

### 步驟六：存輸出

生成檔預設存於 `output/`。`result` 物件含：
- `$svg_content` — 原始 SVG 字串
- `$pieces` — 塊資料之列表
- `$canvas_size` — 尺寸
- `$files` — 所寫檔之路徑

**預期：** `result` 物件含 `$svg_content`、`$pieces`、`$canvas_size`、`$files` 欄位。`$files` 所列檔存於磁碟。

**失敗時：** 若 `$files` 空，拼圖或僅於記憶體中生。明以 `writeLines(result$svg_content, "output/puzzle.svg")` 存之。

## 驗證

- [ ] 腳本無錯執行
- [ ] SVG 檔為良構 XML
- [ ] 塊數配格規範
- [ ] 同種子產相同輸出（可重現）
- [ ] 參數於 config.yml 約束之內

## 常見陷阱

- **用 `--vanilla` 旗標**：破 renv 啟動。永勿用之。
- **複雜 `-e` 指令**：改用腳本檔；shell 轉義致 Exit code 5。
- **Grid 與 size 混淆**：Grid 為塊數，size 為毫米之實體尺寸。
- **偏移之義**：0 = 組裝拼圖、正值 = 爆開/分離塊。
- **無套件之 SNIC**：snic 類型需 `snic` 套件已裝。

## 相關技能

- `add-puzzle-type` — 端到端建新拼圖類型之骨架
- `validate-piles-notation` — 傳入 generate_puzzle() 前驗融合群字串
- `run-puzzle-tests` — 生成變更後執行測試套件
- `write-testthat-tests` — 為新生成情境增測試
