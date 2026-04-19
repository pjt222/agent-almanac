---
name: add-puzzle-type
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Scaffold a new puzzle type across all 10+ pipeline integration points
  in jigsawR. Creates the core puzzle module, wires it into the unified
  pipeline (generation, positioning, rendering, adjacency), adds ggpuzzle
  geom/stat layers, updates DESCRIPTION and config.yml, extends the Shiny
  app, and creates a comprehensive test suite. Use when adding a completely
  new puzzle type to the package or following the 10-point integration
  checklist to ensure nothing is missed end-to-end.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: jigsawr
  complexity: advanced
  language: R
  tags: jigsawr, puzzle-type, pipeline, integration, scaffold
---

# 增拼圖類型

於 jigsawR 跨所有管線整合點為新拼圖類型搭建鷹架。

## 適用時機

- 為套件新增一全新拼圖類型
- 遵既定整合清單（CLAUDE.md 之 10 點管線）
- 確保新類型自端至端布線時無有遺漏

## 輸入

- **必要**：新類型名（小寫，如 `"triangular"`）
- **必要**：幾何描述（拼塊形與排列）
- **必要**：類型是否需外部套件（加至 Suggests）
- **選擇性**：標準之外（grid、size、seed、tabsize、offset）之參數列
- **選擇性**：參考實作或演算法來源

## 步驟

### 步驟一：建立核心拼圖模組

建立 `R/<type>_puzzle.R`，含內部生成函式：

```r
#' Generate <type> puzzle pieces (internal)
#' @noRd
generate_<type>_pieces_internal <- function(params, seed) {
  # 1. Initialize RNG state
  # 2. Generate piece geometries
  # 3. Build edge paths (SVG path data)
  # 4. Compute adjacency
  # 5. Return list: pieces, edges, adjacency, metadata
}
```

依 `R/voronoi_puzzle.R` 或 `R/snic_puzzle.R` 之結構為範。

**預期：** 函式回傳含 `$pieces`、`$edges`、`$adjacency`、`$metadata` 之 list。

**失敗時：** 與 `generate_voronoi_pieces_internal()` 比對回傳結構，以辨缺失之 list 元素或型別錯誤。

### 步驟二：布線至 jigsawR_clean.R

編輯 `R/jigsawR_clean.R`：

1. 將 `"<type>"` 加入 `valid_types` 向量
2. 於 params 段加入類型特有之參數提取
3. 加入類型特有約束之驗證邏輯
4. 加入檔名前綴對應（如 `"<type>"` -> `"<type>_"`）

```r
# In valid_types
valid_types <- c("rectangular", "hexagonal", "concentric", "voronoi", "snic", "<type>")
```

**預期：** `generate_puzzle(type = "<type>")` 受納而無 "unknown type" 之誤。

**失敗時：** 驗證類型字串拼寫無誤地加入 `valid_types`，且參數提取涵蓋一切類型特有之必要引數。

### 步驟三：布線至 unified_piece_generation.R

編輯 `R/unified_piece_generation.R`：

1. 於 `generate_pieces_internal()` 加入分派 case
2. 若類型支援 PILES 記法，加入融合處理

```r
# In the switch/dispatch
"<type>" = generate_<type>_pieces_internal(params, seed)
```

**預期：** 分派類型時，拼塊得以生成。

**失敗時：** 確認分派 case 字串與類型名完全相符，且 `generate_<type>_pieces_internal` 已於拼圖模組定義並輸出。

### 步驟四：布線至 piece_positioning.R

編輯 `R/piece_positioning.R`：

為新類型加入定位分派。多數類型用共用之定位邏輯，然有些須自訂。

**預期：** `apply_piece_positioning()` 處理新類型而無誤，且拼塊置於正確座標。

**失敗時：** 查新類型是否需自訂定位邏輯或可重用共用定位路徑。預設路徑不適用時加分派 case。

### 步驟五：布線至 unified_renderer.R

編輯 `R/unified_renderer.R`：

1. 於 `render_puzzle_svg()` 加入渲染 case
2. 加入邊路徑函式：`get_<type>_edge_paths()`
3. 加入拼塊名函式：`get_<type>_piece_name()`

**預期：** 為新類型生成 SVG 輸出，附正確之拼塊輪廓與邊路徑。

**失敗時：** 驗證 `get_<type>_edge_paths()` 回傳有效之 SVG 路徑資料，且 `get_<type>_piece_name()` 為各拼塊產唯一識別。

### 步驟六：布線至 adjacency_api.R

編輯 `R/adjacency_api.R`：

加入鄰接分派，使 `get_neighbors()` 與 `get_adjacency()` 對新類型有效。

**預期：** `get_neighbors(result, piece_id)` 為拼圖中任一塊回傳正確鄰居。

**失敗時：** 查鄰接分派是否回傳正確資料結構。以小格網測試並依幾何手動驗證鄰接關係。

### 步驟七：增 ggpuzzle Geom 層

編輯 `R/geom_puzzle.R`：

以 `make_puzzle_layer()` 工廠建立 `geom_puzzle_<type>()`：

```r
#' @export
geom_puzzle_<type> <- function(mapping = NULL, data = NULL, ...) {
  make_puzzle_layer(type = "<type>", mapping = mapping, data = data, ...)
}
```

**預期：** `ggplot() + geom_puzzle_<type>(aes(...))` 渲染而無誤。

**失敗時：** 驗證 `make_puzzle_layer()` 收到正確之類型字串，且 geom 函式已透過 `@export` 於 NAMESPACE 輸出。

### 步驟八：增 Stat 分派

編輯 `R/stat_puzzle.R`：

1. 加入類型特有之預設參數
2. 於 `compute_panel()` 加入分派 case

**預期：** stat 層正確計算拼圖幾何，並產出預期數量之多邊形。

**失敗時：** 查 `compute_panel()` 分派 case 是否回傳含必要欄（`x`、`y`、`group`、`piece_id`）之 data frame，且預設參數對新類型合宜。

### 步驟九：更新 DESCRIPTION

編輯 `DESCRIPTION`：

1. 將新類型加入 Description 欄之文字
2. 將任何新套件加入 `Suggests:`（若為外部依賴）
3. 更新 `Collate:` 以納入新 R 檔（按字母順序）

**預期：** `devtools::document()` 成功。無關於未列檔案之 NOTE。

**失敗時：** 查新 R 檔是否按字母順序列於 `Collate:` 欄，且任何新 Suggests 套件之拼寫與版本約束皆正確。

### 步驟十：更新 config.yml

編輯 `inst/config.yml`：

為新類型加入預設與約束：

```yaml
<type>:
  grid:
    default: [3, 3]
    min: [2, 2]
    max: [20, 20]
  size:
    default: [300, 300]
    min: [100, 100]
    max: [2000, 2000]
  tabsize:
    default: 20
    min: 5
    max: 50
  # Add type-specific params here
```

**預期：** 配置為有效之 YAML。預設於 `generate_puzzle()` 用之時產出可用拼圖。

**失敗時：** 以 `yaml::yaml.load_file("inst/config.yml")` 驗證 YAML。確保預設之 grid 與 size 值產合宜拼圖（不過小亦不過大）。

### 步驟十一：擴展 Shiny App

編輯 `inst/shiny-app/app.R`：

1. 將新類型加入 UI 類型選擇器
2. 為類型特有參數加入條件式 UI 面板
3. 加入伺服端生成邏輯

**預期：** Shiny app 於下拉選單中顯示新類型，並於選定時生成拼圖。

**失敗時：** 查類型是否加入 UI 選擇器之 `choices` 引數，類型特有參數之條件式面板是否用 `conditionalPanel(condition = "input.type == '<type>'")`，且伺服端處理器是否傳遞正確參數。

### 步驟十二：建立測試套件

建立 `tests/testthat/test-<type>-puzzles.R`：

```r
test_that("<type> puzzle generates correct piece count", { ... })
test_that("<type> puzzle respects seed reproducibility", { ... })
test_that("<type> adjacency returns valid neighbors", { ... })
test_that("<type> fusion merges pieces correctly", { ... })
test_that("<type> geom layer renders without error", { ... })
test_that("<type> SVG output is well-formed", { ... })
test_that("<type> config constraints are enforced", { ... })
```

若類型需外部套件，以 `skip_if_not_installed()` 包裝測試。

**預期：** 一切測試通過。除非外部依賴缺失，否則無 skip。

**失敗時：** 個別檢查各整合點。最常見之問題乃缺失之分派 case——行 `grep -rn "switch\|valid_types" R/` 以尋一切分派位置。

## 驗證

- [ ] `generate_puzzle(type = "<type>")` 產有效輸出
- [ ] 一切 10 整合點正確布線
- [ ] `devtools::test()` 連同新測試通過
- [ ] `devtools::check()` 回傳 0 errors、0 warnings
- [ ] Shiny app 渲染新類型
- [ ] 配置約束受執行（min/max 驗證）
- [ ] 鄰接與融合正確運作
- [ ] ggpuzzle geom 層渲染而無誤
- [ ] `devtools::document()` 成功（NAMESPACE 已更新）

## 常見陷阱

- **缺失分派 case**：遺一 10+ 檔之一致默默失敗或「unknown type」之誤
- **strsplit 與負數**：以 `paste(a, b, sep = "-")` 建鄰接鍵時，負拼塊標籤產如 `"1--1"` 之鍵。改用 `"|"` 分隔符並以 `"\\|"` 切分
- **以 `cat()` 輸出**：務用 `cli` 套件之記錄包裝（`log_info`、`log_warn` 等）
- **Collate 順序**：DESCRIPTION 之 Collate 欄須按字母或依賴順序
- **Config.yml 格式**：確保 YAML 有效；以 `yaml::yaml.load_file("inst/config.yml")` 測試

## 相關技能

- `generate-puzzle` — 鷹架後測試新類型
- `run-puzzle-tests` — 執行完整測試套件以驗證整合
- `validate-piles-notation` — 以新類型測試融合
- `write-testthat-tests` — 通用測試撰寫模式
- `write-roxygen-docs` — 為新 geom 函式撰寫文件
