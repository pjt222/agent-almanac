---
name: add-puzzle-type
description: >
  在 jigsawR 中跨所有 10+ 个管线集成点搭建新拼图类型。创建核心拼图模块，
  将其接入统一管线（生成、定位、渲染、邻接），添加 ggpuzzle geom/stat 层，
  更新 DESCRIPTION 和 config.yml，扩展 Shiny 应用，并创建全面的测试套件。
  适用于向包中添加全新拼图类型或按照 10 点集成检查清单确保端到端无遗漏。
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
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# 添加拼图类型

在 jigsawR 中跨所有管线集成点搭建新拼图类型。

## 适用场景

- 向包中添加全新的拼图类型
- 按照既定的集成检查清单（CLAUDE.md 10 点管线）
- 确保端到端接入新类型时不遗漏任何环节

## 输入

- **必需**：新类型名称（小写，如 `"triangular"`）
- **必需**：几何描述（碎片的形状/排列方式）
- **必需**：该类型是否需要外部包（添加到 Suggests）
- **可选**：标准参数（grid、size、seed、tabsize、offset）之外的参数列表
- **可选**：参考实现或算法来源

## 步骤

### 第 1 步：创建核心拼图模块

创建 `R/<type>_puzzle.R`，包含内部生成函数：

```r
#' Generate <type> puzzle pieces (internal)
#' @noRd
generate_<type>_pieces_internal <- function(params, seed) {
  # 1. 初始化随机数状态
  # 2. 生成碎片几何
  # 3. 构建边路径（SVG path data）
  # 4. 计算邻接关系
  # 5. 返回列表：pieces、edges、adjacency、metadata
}
```

参考 `R/voronoi_puzzle.R` 或 `R/snic_puzzle.R` 的结构。

**预期结果：** 函数返回包含 `$pieces`、`$edges`、`$adjacency`、`$metadata` 的列表。

**失败处理：** 将返回结构与 `generate_voronoi_pieces_internal()` 对比，找出缺失的列表元素或不正确的类型。

### 第 2 步：接入 jigsawR_clean.R

编辑 `R/jigsawR_clean.R`：

1. 将 `"<type>"` 添加到 `valid_types` 向量
2. 在参数段添加类型特定参数提取
3. 添加类型特定约束的验证逻辑
4. 添加文件名前缀映射（如 `"<type>"` -> `"<type>_"`）

```r
# 在 valid_types 中
valid_types <- c("rectangular", "hexagonal", "concentric", "voronoi", "snic", "<type>")
```

**预期结果：** `generate_puzzle(type = "<type>")` 被接受，不出现"unknown type"错误。

**失败处理：** 验证类型字符串是否按正确拼写添加到 `valid_types`，且参数提取覆盖了所有必需的类型特定参数。

### 第 3 步：接入 unified_piece_generation.R

编辑 `R/unified_piece_generation.R`：

1. 在 `generate_pieces_internal()` 中添加分发 case
2. 如果类型支持 PILES 表示法，添加融合处理

```r
# 在 switch/dispatch 中
"<type>" = generate_<type>_pieces_internal(params, seed)
```

**预期结果：** 当类型被分发时，碎片被正确生成。

**失败处理：** 确认分发 case 的字符串与类型名称完全匹配，且 `generate_<type>_pieces_internal` 已定义并从拼图模块导出。

### 第 4 步：接入 piece_positioning.R

编辑 `R/piece_positioning.R`：

为新类型添加定位分发。大多数类型使用共享定位逻辑，但某些类型需要自定义处理。

**预期结果：** `apply_piece_positioning()` 处理新类型无错误，碎片放置在正确坐标。

**失败处理：** 检查新类型是否需要自定义定位逻辑或可以复用共享定位路径。如果默认路径不适用，添加分发 case。

### 第 5 步：接入 unified_renderer.R

编辑 `R/unified_renderer.R`：

1. 在 `render_puzzle_svg()` 中添加渲染 case
2. 添加边路径函数：`get_<type>_edge_paths()`
3. 添加碎片名称函数：`get_<type>_piece_name()`

**预期结果：** 为新类型生成 SVG 输出，碎片轮廓和边路径正确。

**失败处理：** 验证 `get_<type>_edge_paths()` 返回有效的 SVG path data，`get_<type>_piece_name()` 为每个碎片生成唯一标识符。

### 第 6 步：接入 adjacency_api.R

编辑 `R/adjacency_api.R`：

添加邻居分发，使 `get_neighbors()` 和 `get_adjacency()` 能处理新类型。

**预期结果：** `get_neighbors(result, piece_id)` 返回拼图中任意碎片的正确邻居。

**失败处理：** 检查邻接分发返回正确的数据结构。使用小网格测试并手动验证邻居关系是否符合几何形状。

### 第 7 步：添加 ggpuzzle Geom 层

编辑 `R/geom_puzzle.R`：

使用 `make_puzzle_layer()` 工厂创建 `geom_puzzle_<type>()`：

```r
#' @export
geom_puzzle_<type> <- function(mapping = NULL, data = NULL, ...) {
  make_puzzle_layer(type = "<type>", mapping = mapping, data = data, ...)
}
```

**预期结果：** `ggplot() + geom_puzzle_<type>(aes(...))` 渲染无错误。

**失败处理：** 验证 `make_puzzle_layer()` 接收正确的类型字符串，且 geom 函数通过 `@export` 在 NAMESPACE 中导出。

### 第 8 步：添加 Stat 分发

编辑 `R/stat_puzzle.R`：

1. 添加类型特定默认参数
2. 在 `compute_panel()` 中添加分发 case

**预期结果：** stat 层正确计算拼图几何，产生预期数量的多边形。

**失败处理：** 检查 `compute_panel()` 分发 case 返回包含必需列（`x`、`y`、`group`、`piece_id`）的数据框，且默认参数对新类型合理。

### 第 9 步：更新 DESCRIPTION

编辑 `DESCRIPTION`：

1. 在 Description 字段文本中添加新类型
2. 将任何新包添加到 `Suggests:`（如有外部依赖）
3. 更新 `Collate:` 以包含新 R 文件（按字母顺序）

**预期结果：** `devtools::document()` 成功。没有关于未列出文件的 NOTE。

**失败处理：** 检查新 R 文件是否按字母顺序列在 `Collate:` 字段中，任何新的 Suggests 包是否拼写正确并带版本约束。

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
  # 在此添加类型特定参数
```

**预期结果：** 配置是有效的 YAML。使用 `generate_puzzle()` 时默认值能生成可用的拼图。

**失败处理：** 使用 `yaml::yaml.load_file("inst/config.yml")` 验证 YAML。确保默认 grid 和 size 值能生成合理的拼图（不太小也不太大）。

### 第 11 步：扩展 Shiny 应用

编辑 `inst/shiny-app/app.R`：

1. 在 UI 类型选择器中添加新类型
2. 为类型特定参数添加条件 UI 面板
3. 添加服务端生成逻辑

**预期结果：** Shiny 应用在下拉菜单中显示新类型，选择后能生成拼图。

**失败处理：** 检查类型是否已添加到 UI 选择器的 `choices` 参数，类型特定参数的条件面板是否使用 `conditionalPanel(condition = "input.type == '<type>'")`，服务端处理器是否传递正确参数。

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

如果类型需要外部包，使用 `skip_if_not_installed()` 包裹测试。

**预期结果：** 所有测试通过。除非缺少外部依赖，否则不应跳过。

**失败处理：** 逐个检查每个集成点。最常见的问题是缺少分发 case——运行 `grep -rn "switch\|valid_types" R/` 查找所有分发位置。

## 验证清单

- [ ] `generate_puzzle(type = "<type>")` 生成有效输出
- [ ] 所有 10 个集成点已正确接入
- [ ] `devtools::test()` 通过新测试
- [ ] `devtools::check()` 返回 0 错误、0 警告
- [ ] Shiny 应用能渲染新类型
- [ ] 配置约束被强制执行（最小/最大验证）
- [ ] 邻接关系和融合功能正常
- [ ] ggpuzzle geom 层渲染无错误
- [ ] `devtools::document()` 成功（NAMESPACE 已更新）

## 常见问题

- **遗漏分发 case**：忘记 10+ 个文件中的任何一个都会导致静默失败或"unknown type"错误
- **负数的 strsplit**：使用 `paste(a, b, sep = "-")` 创建邻接键时，负数碎片标签会产生类似 `"1--1"` 的键。改用 `"|"` 分隔符并用 `"\\|"` 分割。
- **使用 `cat()` 输出**：始终使用 `cli` 包的日志封装器（`log_info`、`log_warn` 等）
- **Collate 顺序**：DESCRIPTION 的 Collate 字段必须按字母或依赖顺序排列
- **Config.yml 格式**：确保 YAML 有效；使用 `yaml::yaml.load_file("inst/config.yml")` 测试

## 相关技能

- `generate-puzzle` — 搭建后测试新类型
- `run-puzzle-tests` — 运行完整测试套件以验证集成
- `validate-piles-notation` — 测试新类型的融合功能
- `write-testthat-tests` — 通用测试编写模式
- `write-roxygen-docs` — 为新 geom 函数编写文档
