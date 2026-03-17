---
name: add-puzzle-type
description: >
  在 jigsawR 中跨所有 10+ 个流水线集成点搭建新拼图类型的脚手架。创建核心拼图模块，
  将其连接到统一流水线（生成、定位、渲染、邻接），添加 ggpuzzle 的 geom/stat 图层，
  更新 DESCRIPTION 和 config.yml，扩展 Shiny 应用，并创建综合测试套件。适用于
  向包中添加全新的拼图类型，或按照 10 点集成检查清单确保端到端无遗漏。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: jigsawr
  complexity: advanced
  language: R
  tags: jigsawr, puzzle-type, pipeline, integration, scaffold
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# 添加拼图类型

在 jigsawR 中跨所有流水线集成点搭建新拼图类型的脚手架。

## 适用场景

- 向包中添加全新的拼图类型
- 按照已建立的集成检查清单（CLAUDE.md 10 点流水线）
- 确保在端到端连接新类型时不遗漏任何环节

## 输入

- **必需**：新类型名称（小写，例如 `"triangular"`）
- **必需**：几何描述（拼块如何形状和排列）
- **必需**：该类型是否需要外部包（添加到 Suggests）
- **可选**：标准参数之外的参数列表（grid、size、seed、tabsize、offset）
- **可选**：参考实现或算法来源

## 步骤

### 第 1 步：创建核心拼图模块

创建 `R/<type>_puzzle.R`，包含内部生成函数：

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

参照 `R/voronoi_puzzle.R` 或 `R/snic_puzzle.R` 的结构模式。

**预期结果：** 函数返回包含 `$pieces`、`$edges`、`$adjacency`、`$metadata` 的列表。

**失败处理：** 将返回结构与 `generate_voronoi_pieces_internal()` 进行比较，找出缺失的列表元素或不正确的类型。

### 第 2 步：连接到 jigsawR_clean.R

编辑 `R/jigsawR_clean.R`：

1. 将 `"<type>"` 添加到 `valid_types` 向量
2. 在参数部分添加类型特定的参数提取
3. 添加类型特定约束的验证逻辑
4. 添加文件名前缀映射（例如 `"<type>"` -> `"<type>_"`）

```r
# In valid_types
valid_types <- c("rectangular", "hexagonal", "concentric", "voronoi", "snic", "<type>")
```

**预期结果：** `generate_puzzle(type = "<type>")` 被接受，不出现"unknown type"错误。

**失败处理：** 确认类型字符串已完全按拼写添加到 `valid_types`，并且参数提取覆盖了所有必需的类型特定参数。

### 第 3 步：连接到 unified_piece_generation.R

编辑 `R/unified_piece_generation.R`：

1. 在 `generate_pieces_internal()` 中添加分发情况
2. 如果该类型支持 PILES 记法，添加融合处理

```r
# In the switch/dispatch
"<type>" = generate_<type>_pieces_internal(params, seed)
```

**预期结果：** 当类型被分发时，拼块成功生成。

**失败处理：** 确认分发情况的字符串与类型名称完全匹配，且 `generate_<type>_pieces_internal` 已在拼图模块中定义并导出。

### 第 4 步：连接到 piece_positioning.R

编辑 `R/piece_positioning.R`：

为新类型添加定位分发。大多数类型使用共享定位逻辑，但某些类型需要自定义处理。

**预期结果：** `apply_piece_positioning()` 无错误地处理新类型，拼块被放置在正确的坐标上。

**失败处理：** 检查新类型是否需要自定义定位逻辑，还是可以复用共享定位路径。如果默认路径不适用，添加分发情况。

### 第 5 步：连接到 unified_renderer.R

编辑 `R/unified_renderer.R`：

1. 在 `render_puzzle_svg()` 中添加渲染情况
2. 添加边缘路径函数：`get_<type>_edge_paths()`
3. 添加拼块名称函数：`get_<type>_piece_name()`

**预期结果：** 为新类型生成 SVG 输出，包含正确的拼块轮廓和边缘路径。

**失败处理：** 验证 `get_<type>_edge_paths()` 返回有效的 SVG 路径数据，`get_<type>_piece_name()` 为每个拼块生成唯一标识符。

### 第 6 步：连接到 adjacency_api.R

编辑 `R/adjacency_api.R`：

添加邻居分发，使 `get_neighbors()` 和 `get_adjacency()` 适用于新类型。

**预期结果：** `get_neighbors(result, piece_id)` 为拼图中任意拼块返回正确的邻居。

**失败处理：** 检查邻接分发是否返回正确的数据结构。使用小网格测试，并根据几何形状手动验证邻居关系。

### 第 7 步：添加 ggpuzzle Geom 图层

编辑 `R/geom_puzzle.R`：

使用 `make_puzzle_layer()` 工厂创建 `geom_puzzle_<type>()`：

```r
#' @export
geom_puzzle_<type> <- function(mapping = NULL, data = NULL, ...) {
  make_puzzle_layer(type = "<type>", mapping = mapping, data = data, ...)
}
```

**预期结果：** `ggplot() + geom_puzzle_<type>(aes(...))` 无错误渲染。

**失败处理：** 验证 `make_puzzle_layer()` 接收到正确的类型字符串，且 geom 函数通过 `@export` 在 NAMESPACE 中导出。

### 第 8 步：添加 Stat 分发

编辑 `R/stat_puzzle.R`：

1. 添加类型特定的默认参数
2. 在 `compute_panel()` 中添加分发情况

**预期结果：** stat 图层正确计算拼图几何，并生成预期数量的多边形。

**失败处理：** 检查 `compute_panel()` 分发情况是否返回包含必需列（`x`、`y`、`group`、`piece_id`）的数据框，且默认参数对新类型是合理的。

### 第 9 步：更新 DESCRIPTION

编辑 `DESCRIPTION`：

1. 在 Description 字段文本中添加新类型
2. 将任何新包添加到 `Suggests:`（如有外部依赖）
3. 更新 `Collate:` 以包含新 R 文件（按字母顺序）

**预期结果：** `devtools::document()` 成功。没有关于未列出文件的 NOTE。

**失败处理：** 检查新 R 文件是否按字母顺序列在 `Collate:` 字段中，以及任何新的 Suggests 包是否拼写正确并附有版本约束。

### 第 10 步：更新 config.yml

编辑 `inst/config.yml`：

为新类型添加默认值和约束：

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

**预期结果：** 配置是有效的 YAML。默认值在 `generate_puzzle()` 使用时能生成可用的拼图。

**失败处理：** 使用 `yaml::yaml.load_file("inst/config.yml")` 验证 YAML。确保默认 grid 和 size 值能生成合理的拼图（不会太小或太大）。

### 第 11 步：扩展 Shiny 应用

编辑 `inst/shiny-app/app.R`：

1. 将新类型添加到 UI 类型选择器
2. 为类型特定参数添加条件 UI 面板
3. 添加服务器端生成逻辑

**预期结果：** Shiny 应用在下拉菜单中显示新类型，并在选择时生成拼图。

**失败处理：** 检查类型是否已添加到 UI 选择器的 `choices` 参数中，类型特定参数的条件面板是否使用 `conditionalPanel(condition = "input.type == '<type>'")`，以及服务器端处理程序是否传递了正确的参数。

### 第 12 步：创建测试套件

创建 `tests/testthat/test-<type>-puzzles.R`：

```r
test_that("<type> puzzle generates correct piece count", { ... })
test_that("<type> puzzle respects seed reproducibility", { ... })
test_that("<type> adjacency returns valid neighbors", { ... })
test_that("<type> fusion merges pieces correctly", { ... })
test_that("<type> geom layer renders without error", { ... })
test_that("<type> SVG output is well-formed", { ... })
test_that("<type> config constraints are enforced", { ... })
```

如果该类型需要外部包，用 `skip_if_not_installed()` 包装测试。

**预期结果：** 所有测试通过。除非缺少外部依赖，否则不应有跳过。

**失败处理：** 逐个检查每个集成点。最常见的问题是遗漏分发情况——运行 `grep -rn "switch\|valid_types" R/` 查找所有分发位置。

## 验证清单

- [ ] `generate_puzzle(type = "<type>")` 产生有效输出
- [ ] 所有 10 个集成点已正确连接
- [ ] `devtools::test()` 通过新测试
- [ ] `devtools::check()` 返回 0 错误、0 警告
- [ ] Shiny 应用渲染新类型
- [ ] 配置约束被强制执行（最小/最大验证）
- [ ] 邻接和融合正确工作
- [ ] ggpuzzle geom 图层无错误渲染
- [ ] `devtools::document()` 成功（NAMESPACE 已更新）

## 常见问题

- **遗漏分发情况**：忘记 10+ 个文件中的任何一个都会导致静默失败或"unknown type"错误
- **含负数的 strsplit**：用 `paste(a, b, sep = "-")` 创建邻接键时，负拼块标签会产生 `"1--1"` 这样的键。改用 `"|"` 分隔符并用 `"\\|"` 分割
- **使用 `cat()` 输出**：始终使用 `cli` 包的日志包装器（`log_info`、`log_warn` 等）
- **Collate 顺序**：DESCRIPTION 的 Collate 字段必须按字母顺序或依赖顺序排列
- **Config.yml 格式**：确保 YAML 有效；用 `yaml::yaml.load_file("inst/config.yml")` 测试

## 相关技能

- `generate-puzzle` — 搭建脚手架后测试新类型
- `run-puzzle-tests` — 运行完整测试套件验证集成
- `validate-piles-notation` — 测试新类型的融合
- `write-testthat-tests` — 通用测试编写模式
- `write-roxygen-docs` — 为新 geom 函数编写文档
