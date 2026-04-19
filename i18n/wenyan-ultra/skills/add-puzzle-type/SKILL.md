---
name: add-puzzle-type
locale: wenyan-ultra
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

# 增拼類

於 jigsawR 諸接點建新拼類。

## 用

- 增全新拼類於包→用
- 循 CLAUDE.md 十點清單→用
- 端至端勿漏→用

## 入

- **必**：類名（小寫，例 `"triangular"`）
- **必**：幾何述（片如何形如何排）
- **必**：是否需外包（入 Suggests）
- **可**：標參外之參（grid、size、seed、tabsize、offset）
- **可**：實或算之參考

## 行

### 一：建核拼模

建 `R/<type>_puzzle.R` 內生函：

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

循 `R/voronoi_puzzle.R` 或 `R/snic_puzzle.R` 之構。

得：函返列含 `$pieces`、`$edges`、`$adjacency`、`$metadata`。

敗：比 `generate_voronoi_pieces_internal()` 之返構以識缺元或型誤。

### 二：接 jigsawR_clean.R

改 `R/jigsawR_clean.R`：

1. 入 `"<type>"` 於 `valid_types`
2. 增類專參析於 params 區
3. 增類專限驗
4. 增檔名前綴映（例 `"<type>"` → `"<type>_"`）

```r
# In valid_types
valid_types <- c("rectangular", "hexagonal", "concentric", "voronoi", "snic", "<type>")
```

得：`generate_puzzle(type = "<type>")` 受而無「unknown type」誤。

敗：驗類串入 `valid_types` 字字相符，且參析涵諸類專參。

### 三：接 unified_piece_generation.R

改 `R/unified_piece_generation.R`：

1. 增分派於 `generate_pieces_internal()`
2. 若類支 PILES 記法則增融處

```r
# In the switch/dispatch
"<type>" = generate_<type>_pieces_internal(params, seed)
```

得：類分派時片得生。

敗：驗分派串字字相符且 `generate_<type>_pieces_internal` 已定且自拼模出。

### 四：接 piece_positioning.R

改 `R/piece_positioning.R`：

增類定位分派。多類用共定位邏輯，少數需專處。

得：`apply_piece_positioning()` 處新類無誤、片置正座。

敗：察新類需專定位邏輯否或可重用共路。如默路不適則增分派。

### 五：接 unified_renderer.R

改 `R/unified_renderer.R`：

1. 增繪於 `render_puzzle_svg()`
2. 增邊路函：`get_<type>_edge_paths()`
3. 增片名函：`get_<type>_piece_name()`

得：新類 SVG 出，片廓、邊路皆正。

敗：驗 `get_<type>_edge_paths()` 返有效 SVG 路且 `get_<type>_piece_name()` 出各片獨識。

### 六：接 adjacency_api.R

改 `R/adjacency_api.R`：

增鄰分派使 `get_neighbors()`、`get_adjacency()` 用於新類。

得：`get_neighbors(result, piece_id)` 返任片之正鄰。

敗：察鄰分派返正構。以小格驗、手核鄰係對幾何。

### 七：增 ggpuzzle 幾層

改 `R/geom_puzzle.R`：

以 `make_puzzle_layer()` 廠建 `geom_puzzle_<type>()`：

```r
#' @export
geom_puzzle_<type> <- function(mapping = NULL, data = NULL, ...) {
  make_puzzle_layer(type = "<type>", mapping = mapping, data = data, ...)
}
```

得：`ggplot() + geom_puzzle_<type>(aes(...))` 繪而無誤。

敗：驗 `make_puzzle_layer()` 受正類串且 geom 函於 NAMESPACE 經 `@export` 出。

### 八：增 stat 分派

改 `R/stat_puzzle.R`：

1. 增類專默參
2. 增分派於 `compute_panel()`

得：stat 層算幾正、出預期多角。

敗：察 `compute_panel()` 分派返必欄之數框（`x`、`y`、`group`、`piece_id`）且默參合新類。

### 九：更 DESCRIPTION

改 `DESCRIPTION`：

1. 增新類於 Description 文
2. 新包入 `Suggests:`（若外依）
3. 更 `Collate:` 含新 R 檔（字序）

得：`devtools::document()` 成。無未列檔之 NOTE。

敗：察新 R 檔列於 `Collate:` 字序且新 Suggests 包字字相符附版限。

### 十：更 config.yml

改 `inst/config.yml`：

增新類默與限：

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

得：配為有效 YAML。默生可用拼於 `generate_puzzle()`。

敗：以 `yaml::yaml.load_file("inst/config.yml")` 驗 YAML。確默 grid 與 size 出合理拼。

### 十一：擴 Shiny 應

改 `inst/shiny-app/app.R`：

1. 增新類於 UI 類選
2. 增類專參之條件 UI 板
3. 增伺端生邏

得：Shiny 應於下拉示新類、選則生拼。

敗：察類入 UI 選之 `choices`，類專條件板用 `conditionalPanel(condition = "input.type == '<type>'")`，伺端傳正參。

### 十二：建測套

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

若類需外包則以 `skip_if_not_installed()` 包之。

得：諸測皆過。除外依缺則無跳。

敗：分察各接。常缺分派——行 `grep -rn "switch\|valid_types" R/` 尋諸分派處。

## 驗

- [ ] `generate_puzzle(type = "<type>")` 出有效
- [ ] 十接點皆正接
- [ ] `devtools::test()` 含新測過
- [ ] `devtools::check()` 零誤零警
- [ ] Shiny 應繪新類
- [ ] 配限獲行（min/max 驗）
- [ ] 鄰、融皆正
- [ ] ggpuzzle geom 繪而無誤
- [ ] `devtools::document()` 成（NAMESPACE 更）

## 忌

- **缺分派**：忘十餘檔之一致默敗或「unknown type」誤
- **負數 strsplit**：以 `paste(a, b, sep = "-")` 建鄰鍵時負片標出 `"1--1"`。用 `"|"` 分、以 `"\\|"` 析
- **用 `cat()` 出**：恆用 `cli` 包記裝（`log_info`、`log_warn` 等）
- **Collate 序**：DESCRIPTION Collate 須字序或依序
- **Config.yml 式**：確 YAML 有效；以 `yaml::yaml.load_file("inst/config.yml")` 驗

## 參

- `generate-puzzle` — 建後測新類
- `run-puzzle-tests` — 行全測套驗接
- `validate-piles-notation` — 以新類測融
- `write-testthat-tests` — 通測寫紋
- `write-roxygen-docs` — 文新 geom 函
