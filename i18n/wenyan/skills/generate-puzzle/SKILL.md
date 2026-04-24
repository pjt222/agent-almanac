---
name: generate-puzzle
locale: wenyan
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

# 拼圖之生

用 jigsawR 之統一 API 生拼圖。

## 用時

- 為特定類型與配置生拼圖 SVG 檔
- 以異參數測拼圖生成
- 為文檔或演示生樣出
- 以 geom_puzzle_*() 創 ggplot2 拼圖圖

## 入

- **必要**：拼圖類型（`"rectangular"`、`"hexagonal"`、`"concentric"`、`"voronoi"`、`"random"`、`"snic"`）
- **必要**：格尺（依類：`c(cols, rows)` 或 `c(rings)`）
- **可選**：尺寸 mm（依類有默）
- **可選**：可重現之種子（默：42）
- **可選**：偏移（0 = 嵌合，>0 = 分離）
- **可選**：佈局（`"grid"` 或 `"repel"`，矩形用）
- **可選**：融合組（PILES 記法串）

## 法

### 第一步：讀配置約束

```bash
R_EXE="/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe"
"$R_EXE" -e "cat(yaml::yaml.load_file('inst/config.yml')[['{TYPE}']]$grid$max)"
```

或直讀 `inst/config.yml` 察所擇類型之有效範圍。

**得：** 所擇類型之 grid、size、tabsize 等參數之最小最大值已知。

**敗則：** 若 `config.yml` 缺或類型鍵不存，察是否於 jigsawR 項目根，且包已至少建一次。

### 第二步：定類型與參數

將用者請求映至有效 `generate_puzzle()` 參數：

| Type | grid | size | Extra params |
|------|------|------|-------------|
| rectangular | `c(cols, rows)` | `c(width, height)` mm | `offset`, `layout`, `tabsize` |
| hexagonal | `c(rings)` | `c(diameter)` mm | `do_warp`, `do_trunc`, `tabsize` |
| concentric | `c(rings)` | `c(diameter)` mm | `center_shape`, `tabsize` |
| voronoi | `c(cols, rows)` | `c(width, height)` mm | `n_interior`, `tabsize` |
| random | `c(cols, rows)` | `c(width, height)` mm | `n_interior`, `tabsize` |
| snic | `c(cols, rows)` | `c(width, height)` mm | `n_interior`, `compactness`, `tabsize` |

**得：** 用者請求映至正 `generate_puzzle()` 參數，`type`、`grid` 維、`size` 值皆於 config.yml 範圍內。

**敗則：** 若不知參數格式，參上表。矩形與 voronoi 用 `c(cols, rows)`；六邊與同心用 `c(rings)`。

### 第三步：創 R 腳本

書腳本檔（複雜命令優於 `-e`）：

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

存於臨時腳本檔。

**得：** R 腳本檔存於臨時處，含 `library(jigsawR)`、`generate_puzzle()` 調用全參數、診斷輸出行。

**敗則：** 若腳本有語法誤，驗所有字串參數有引號，數值向量用 `c()`。避複雜 shell 轉義，始用腳本檔。

### 第四步：以 WSL R 執行

```bash
R_EXE="/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe"
"$R_EXE" /path/to/script.R
```

**得：** 腳本無誤完。SVG 檔寫於 `output/`。

**敗則：** 察 renv 已還原（`renv::restore()`）。驗包已載（`devtools::load_all()`）。勿用 `--vanilla` 旗（renv 需 .Rprofile）。

### 第五步：驗出

- SVG 檔存於 `output/`
- SVG 內容始以 `<?xml` 或 `<svg`
- 塊數合預期：cols * rows（矩形）、環式（六邊/同心）
- ggplot2 法者驗圖對象無誤渲染

**得：** SVG 檔存於 `output/`，內容始以 `<?xml` 或 `<svg`，塊數合格規格（矩形 cols * rows、六邊/同心環式）。

**敗則：** 若 SVG 缺，察 `output/` 目錄存。若塊數誤，驗格尺合該拼圖類型之預期式。ggplot2 出，以 `tryCatch()` 包驗圖渲染無誤。

### 第六步：存出

生檔默存於 `output/`。`result` 對象含：
- `$svg_content` — 原 SVG 串
- `$pieces` — 塊資料之列
- `$canvas_size` — 維度
- `$files` — 已寫檔路徑

**得：** `result` 對象含 `$svg_content`、`$pieces`、`$canvas_size`、`$files` 欄。`$files` 所列檔存於盤。

**敗則：** 若 `$files` 空，拼圖或只生於內存。顯存之以 `writeLines(result$svg_content, "output/puzzle.svg")`。

## 驗

- [ ] 腳本無誤執行
- [ ] SVG 檔為良形 XML
- [ ] 塊數合格規格
- [ ] 同種子生同出（可重現）
- [ ] 參數於 config.yml 約束內

## 陷

- **用 `--vanilla` 旗**：破 renv 激活。勿用
- **複雜 `-e` 命令**：改用腳本檔；shell 轉義致退出碼 5
- **格與尺混**：格乃塊數，尺乃物理維 mm
- **偏移義**：0 = 組裝，正 = 爆開/分離
- **snic 無包**：snic 類型需 `snic` 包已裝

## 參

- `add-puzzle-type` — 端到端搭新拼圖類型
- `validate-piles-notation` — 傳入 generate_puzzle() 前驗融合組串
- `run-puzzle-tests` — 生成更動後跑測試集
- `write-testthat-tests` — 為新生成場景加測試
