---
name: generate-puzzle
locale: wenyan-ultra
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

用 jigsawR 包之統一 API 生拼圖。

## 用

- 某型與配置造拼圖 SVG
- 不同參數試生
- 生樣品供文檔或示
- 用 geom_puzzle_*() 造 ggplot2 拼圖視覺

## 入

- **必**：拼圖型（`"rectangular"`、`"hexagonal"`、`"concentric"`、`"voronoi"`、`"random"`、`"snic"`）
- **必**：格維（依型：`c(cols, rows)` 或 `c(rings)`）
- **可**：尺寸 mm（默依型異）
- **可**：種（可復性，默 42）
- **可**：偏移（0=互扣，>0=分離）
- **可**：布局（`"grid"` 或 `"repel"`，rect）
- **可**：融組（PILES 符號串）

## 行

### 一：讀配約束

```bash
R_EXE="/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe"
"$R_EXE" -e "cat(yaml::yaml.load_file('inst/config.yml')[['{TYPE}']]$grid$max)"
```

或直讀 `inst/config.yml` 察所擇型之有效範圍。

得：所擇型之 grid、size、tabsize 諸參之最小最大已知。

敗：`config.yml` 缺或型鍵不存→查於 jigsawR 根且包至少建過一次。

### 二：定型與參

用戶請求映為有效 `generate_puzzle()` 引數：

| Type | grid | size | Extra params |
|------|------|------|-------------|
| rectangular | `c(cols, rows)` | `c(width, height)` mm | `offset`, `layout`, `tabsize` |
| hexagonal | `c(rings)` | `c(diameter)` mm | `do_warp`, `do_trunc`, `tabsize` |
| concentric | `c(rings)` | `c(diameter)` mm | `center_shape`, `tabsize` |
| voronoi | `c(cols, rows)` | `c(width, height)` mm | `n_interior`, `tabsize` |
| random | `c(cols, rows)` | `c(width, height)` mm | `n_interior`, `tabsize` |
| snic | `c(cols, rows)` | `c(width, height)` mm | `n_interior`, `compactness`, `tabsize` |

得：請求映為 `generate_puzzle()` 有效引數，型、grid、size 皆於 config.yml 範圍內。

敗：參形式不明→參表。矩形與 voronoi 用 `c(cols, rows)`；六與同心用 `c(rings)`。

### 三：造 R 腳本

書腳本檔（複雜命令勝於 `-e`）：

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

存於臨時腳本。

得：R 腳本檔存於臨時位，含 `library(jigsawR)`、`generate_puzzle()` 全參調用、診斷輸出。

敗：語法誤→查字串皆引、數值向量用 `c()`。複雜殼轉義→必用腳本檔。

### 四：經 WSL R 行

```bash
R_EXE="/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe"
"$R_EXE" /path/to/script.R
```

得：腳本無誤完成。SVG 寫於 `output/`。

敗：察 renv 已復（`renv::restore()`）。驗包已載（`devtools::load_all()`）。勿用 `--vanilla` 旗（renv 需 .Rprofile）。

### 五：驗出

- SVG 檔存於 `output/`
- SVG 內容以 `<?xml` 或 `<svg` 開
- 片數符：cols * rows（矩）、環式（六/同心）
- ggplot2 法→驗圖對象無誤繪

得：SVG 檔存於 `output/`，內容以 `<?xml` 或 `<svg` 開，片數符格規格（矩用 cols*rows，六/同心用環式）。

敗：SVG 檔缺→察 `output/` 存。片數誤→驗格維合型式。ggplot2 出→以 `tryCatch()` 包察繪無誤。

### 六：存出

生成檔默存 `output/`。`result` 對象含：
- `$svg_content`：生 SVG 串
- `$pieces`：片數據列
- `$canvas_size`：維
- `$files`：寫檔之徑

得：`result` 對象含 `$svg_content`、`$pieces`、`$canvas_size`、`$files`。`$files` 列之檔存於磁。

敗：`$files` 空→拼圖或僅生於內存。顯存以 `writeLines(result$svg_content, "output/puzzle.svg")`。

## 驗

- [ ] 腳本無誤行
- [ ] SVG 檔乃良構 XML
- [ ] 片數符格規格
- [ ] 同種生同出（可復）
- [ ] 參於 config.yml 約束內

## 忌

- **用 `--vanilla` 旗**：破 renv 啟動。絕勿用
- **複雜 `-e` 命令**：用腳本檔；殼轉義致 Exit 5
- **Grid 與 size 混**：格乃片數，size 乃物理 mm 維
- **偏移語義**：0=組裝，正=散裂片
- **SNIC 無包**：snic 型需 `snic` 包已裝

## 參

- `add-puzzle-type`
- `validate-piles-notation`
- `run-puzzle-tests`
- `write-testthat-tests`
