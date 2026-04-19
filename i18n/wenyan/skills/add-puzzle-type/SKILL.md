---
name: add-puzzle-type
locale: wenyan
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

# 增謎類

於 jigsawR 全管道諸接點建新謎類之架。

## 用時

- 包中增全新之謎類乃用
- 遵既立之整合檢單（CLAUDE.md 十點管道）乃用
- 新類首尾接線無遺乃用

## 入

- **必要**：新類之名（小寫，如 `"triangular"`）
- **必要**：幾何之述（片之形與排）
- **必要**：類需外包乎（入 Suggests）
- **可選**：標參（grid, size, seed, tabsize, offset）外之參
- **可選**：參照實現或算法源

## 法

### 第一步：建核心謎模

建 `R/<type>_puzzle.R`，含內部生成函：

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

循 `R/voronoi_puzzle.R` 或 `R/snic_puzzle.R` 之結構。

**得：** 函返一列，含 `$pieces`、`$edges`、`$adjacency`、`$metadata`。

**敗則：** 以 `generate_voronoi_pieces_internal()` 之返式對之，識缺列或誤型。

### 第二步：接 jigsawR_clean.R

編 `R/jigsawR_clean.R`：

1. 添 `"<type>"` 於 `valid_types` 量
2. 於參段添類特參提取
3. 添類特約束之驗
4. 添檔前綴（如 `"<type>"` → `"<type>_"`）

```r
# In valid_types
valid_types <- c("rectangular", "hexagonal", "concentric", "voronoi", "snic", "<type>")
```

**得：** `generate_puzzle(type = "<type>")` 受而無「未知類」之訛。

**敗則：** 驗類名入 `valid_types` 拼寫無誤，參提取涵所需之類特參。

### 第三步：接 unified_piece_generation.R

編 `R/unified_piece_generation.R`：

1. 於 `generate_pieces_internal()` 添分派例
2. 類支 PILES 記法則添融合處理

```r
# In the switch/dispatch
"<type>" = generate_<type>_pieces_internal(params, seed)
```

**得：** 類分派時片得生。

**敗則：** 驗分派例之串與類名全同，`generate_<type>_pieces_internal` 已定且自謎模導出。

### 第四步：接 piece_positioning.R

編 `R/piece_positioning.R`：

添新類之定位分派。多類共用位法，然某類需定制。

**得：** `apply_piece_positioning()` 處新類無訛，片置於正位。

**敗則：** 察新類需定制位法乎，或可用共位。默路不適則添分派例。

### 第五步：接 unified_renderer.R

編 `R/unified_renderer.R`：

1. 於 `render_puzzle_svg()` 添渲例
2. 添邊路函：`get_<type>_edge_paths()`
3. 添片名函：`get_<type>_piece_name()`

**得：** SVG 出現新類，片廓與邊路正。

**敗則：** 驗 `get_<type>_edge_paths()` 返有效 SVG 路，`get_<type>_piece_name()` 生各片之獨識。

### 第六步：接 adjacency_api.R

編 `R/adjacency_api.R`：

添鄰之分派，使 `get_neighbors()` 與 `get_adjacency()` 行於新類。

**得：** `get_neighbors(result, piece_id)` 返正確之鄰。

**敗則：** 驗鄰分派返正數結。以小格試，手驗鄰關於幾何。

### 第七步：添 ggpuzzle geom 層

編 `R/geom_puzzle.R`：

以 `make_puzzle_layer()` 工建 `geom_puzzle_<type>()`：

```r
#' @export
geom_puzzle_<type> <- function(mapping = NULL, data = NULL, ...) {
  make_puzzle_layer(type = "<type>", mapping = mapping, data = data, ...)
}
```

**得：** `ggplot() + geom_puzzle_<type>(aes(...))` 渲而不訛。

**敗則：** 驗 `make_puzzle_layer()` 受正類串，geom 函經 `@export` 於 NAMESPACE 導出。

### 第八步：添 Stat 分派

編 `R/stat_puzzle.R`：

1. 添類特默參
2. 於 `compute_panel()` 添分派例

**得：** stat 層算謎幾何正，生預期之多邊。

**敗則：** 驗 `compute_panel()` 分派例返所需列（`x`、`y`、`group`、`piece_id`）之數框，默參合理。

### 第九步：更 DESCRIPTION

編 `DESCRIPTION`：

1. 添新類於 Description 段之文
2. 添新包於 `Suggests:`（若有外依）
3. 更 `Collate:` 納新 R 檔（按字序）

**得：** `devtools::document()` 成。無未列檔之 NOTE。

**敗則：** 驗新 R 檔按字序入 `Collate:`，新 Suggests 包名與版約無誤。

### 第十步：更 config.yml

編 `inst/config.yml`：

添新類之默與約：

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

**得：** 設為有效 YAML。默生可行之謎。

**敗則：** 以 `yaml::yaml.load_file("inst/config.yml")` 驗 YAML。確默格與默徑生合宜之謎。

### 第十一步：擴 Shiny 應用

編 `inst/shiny-app/app.R`：

1. 添新類於 UI 類選
2. 添條件 UI 面板於類特參
3. 添服端生成邏輯

**得：** Shiny 應用下拉見新類，擇之則生謎。

**敗則：** 驗類入 UI 選之 `choices`，類特參條件面板用 `conditionalPanel(condition = "input.type == '<type>'")`，服端傳正參。

### 第十二步：建試套

建 `tests/testthat/test-<type>-puzzles.R`：

```r
test_that("<type> puzzle generates correct piece count", { ... })
test_that("<type> puzzle respects seed reproducibility", { ... })
test_that("<type> adjacency returns valid neighbors", { ... })
test_that("<type> fusion merges pieces correctly", { ... })
test_that("<type> geom layer renders without error", { ... })
test_that("<type> SVG output is well-formed", { ... })
test_that("<type> config constraints are enforced", { ... })
```

類需外包則裹試以 `skip_if_not_installed()`。

**得：** 諸試皆過。無跳除非外依缺。

**敗則：** 各接點逐察。最常者分派例闕——行 `grep -rn "switch\|valid_types" R/` 察所有分派處。

## 驗

- [ ] `generate_puzzle(type = "<type>")` 生有效之出
- [ ] 十接點皆正接
- [ ] `devtools::test()` 過新試
- [ ] `devtools::check()` 返 0 訛、0 警
- [ ] Shiny 應用渲新類
- [ ] 設之約強制（min/max 驗）
- [ ] 鄰與融合正行
- [ ] ggpuzzle geom 層渲無訛
- [ ] `devtools::document()` 成（NAMESPACE 更）

## 陷

- **分派例闕**：遺一檔致默敗或「未知類」訛
- **strsplit 遇負數**：以 `paste(a, b, sep = "-")` 建鄰鍵，負片標生如 `"1--1"` 之鍵。改用 `"|"` 分，以 `"\\|"` 析
- **用 `cat()` 出文**：必用 `cli` 包之日誌裹（`log_info`、`log_warn` 等）
- **Collate 之序**：DESCRIPTION Collate 必按字序或依賴序
- **Config.yml 之式**：確 YAML 有效；以 `yaml::yaml.load_file("inst/config.yml")` 試

## 參

- `generate-puzzle` — 架立後試新類
- `run-puzzle-tests` — 行全試套驗整合
- `validate-piles-notation` — 試新類之融合
- `write-testthat-tests` — 通用試之式
- `write-roxygen-docs` — 書新 geom 函之文
