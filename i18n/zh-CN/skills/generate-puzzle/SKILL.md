---
name: generate-puzzle
description: >
  通过 generate_puzzle() 或 geom_puzzle_*() 生成拼图，并根据 inst/config.yml
  进行参数验证。支持矩形、六边形、同心圆、Voronoi 和 SNIC 拼图类型，可配置
  网格、尺寸、种子、偏移和布局参数。适用于为特定类型和配置创建拼图 SVG 文件、
  使用不同参数测试生成效果、为文档或演示生成样例输出，以及创建 ggplot2 拼图
  可视化。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: jigsawr
  complexity: basic
  language: R
  tags: jigsawr, puzzle, svg, generation, ggplot2
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# 生成拼图

使用 jigsawR 包的统一 API 生成拼图。

## 适用场景

- 为特定类型和配置创建拼图 SVG 文件
- 使用不同参数测试拼图生成
- 为文档或演示生成样例输出
- 使用 geom_puzzle_*() 创建 ggplot2 拼图可视化

## 输入

- **必需**：拼图类型（`"rectangular"`、`"hexagonal"`、`"concentric"`、`"voronoi"`、`"random"`、`"snic"`）
- **必需**：网格尺寸（取决于类型：`c(cols, rows)` 或 `c(rings)`）
- **可选**：尺寸（毫米，默认值因类型而异）
- **可选**：随机种子（默认：42）
- **可选**：偏移量（0 = 拼合状态，>0 = 分离碎片）
- **可选**：布局（`"grid"` 或 `"repel"`，适用于矩形）
- **可选**：融合组（PILES 表示法字符串）

## 步骤

### 第 1 步：读取配置约束

```bash
R_EXE="/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe"
"$R_EXE" -e "cat(yaml::yaml.load_file('inst/config.yml')[['{TYPE}']]$grid$max)"
```

或直接读取 `inst/config.yml` 检查所选类型的有效范围。

**预期结果：** 已知所选拼图类型的 grid、size、tabsize 等参数的最小/最大值。

**失败处理：** 如果 `config.yml` 缺失或类型键不存在，请检查是否在 jigsawR 项目根目录中，以及包是否已至少构建过一次。

### 第 2 步：确定类型和参数

将用户请求映射到有效的 `generate_puzzle()` 参数：

| 类型 | grid | size | 额外参数 |
|------|------|------|---------|
| rectangular | `c(cols, rows)` | `c(width, height)` mm | `offset`、`layout`、`tabsize` |
| hexagonal | `c(rings)` | `c(diameter)` mm | `do_warp`、`do_trunc`、`tabsize` |
| concentric | `c(rings)` | `c(diameter)` mm | `center_shape`、`tabsize` |
| voronoi | `c(cols, rows)` | `c(width, height)` mm | `n_interior`、`tabsize` |
| random | `c(cols, rows)` | `c(width, height)` mm | `n_interior`、`tabsize` |
| snic | `c(cols, rows)` | `c(width, height)` mm | `n_interior`、`compactness`、`tabsize` |

**预期结果：** 用户请求已映射为有效的 `generate_puzzle()` 参数，类型、网格维度和尺寸值均在 config.yml 的范围内。

**失败处理：** 如果不确定使用哪种参数格式，请参考上表。矩形和 voronoi 类型使用 `c(cols, rows)` 作为 grid；六边形和同心圆类型使用 `c(rings)`。

### 第 3 步：创建 R 脚本

编写脚本文件（对于复杂命令优于 `-e`）：

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

保存到临时脚本文件。

**预期结果：** R 脚本文件已保存到临时位置，包含 `library(jigsawR)`、`generate_puzzle()` 调用（含所有参数）和诊断输出行。

**失败处理：** 如果脚本有语法错误，请验证所有字符串参数是否加引号，数值向量是否使用 `c()`。始终使用脚本文件以避免复杂的 shell 转义。

### 第 4 步：通过 WSL R 执行

```bash
R_EXE="/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe"
"$R_EXE" /path/to/script.R
```

**预期结果：** 脚本无错误完成。SVG 文件已写入 `output/`。

**失败处理：** 检查 renv 是否已恢复（`renv::restore()`）。验证包是否已加载（`devtools::load_all()`）。不要使用 `--vanilla` 标志（renv 需要 .Rprofile）。

### 第 5 步：验证输出

- SVG 文件存在于 `output/` 目录中
- SVG 内容以 `<?xml` 或 `<svg` 开头
- 碎片数量与预期一致：cols * rows（矩形）、环形公式（六边形/同心圆）
- 对于 ggplot2 方式，验证绘图对象渲染无错误

**预期结果：** SVG 文件存在于 `output/` 中，内容以 `<?xml` 或 `<svg` 开头，碎片数量与网格规格一致（矩形为 cols * rows，六边形/同心圆为环形公式）。

**失败处理：** 如果 SVG 文件缺失，检查 `output/` 目录是否存在。如果碎片数量不对，验证网格维度是否符合拼图类型的预期公式。对于 ggplot2 输出，使用 `tryCatch()` 包裹检查渲染是否出错。

### 第 6 步：保存输出

生成的文件默认保存到 `output/`。`result` 对象包含：
- `$svg_content` — 原始 SVG 字符串
- `$pieces` — 碎片数据列表
- `$canvas_size` — 尺寸
- `$files` — 已写入文件的路径

**预期结果：** `result` 对象包含 `$svg_content`、`$pieces`、`$canvas_size` 和 `$files` 字段。`$files` 中列出的文件存在于磁盘上。

**失败处理：** 如果 `$files` 为空，拼图可能仅在内存中生成。使用 `writeLines(result$svg_content, "output/puzzle.svg")` 显式保存。

## 验证清单

- [ ] 脚本执行无错误
- [ ] SVG 文件是格式良好的 XML
- [ ] 碎片数量与网格规格一致
- [ ] 相同种子产生相同输出（可重现性）
- [ ] 参数在 config.yml 约束范围内

## 常见问题

- **使用 `--vanilla` 标志**：会破坏 renv 激活。绝对不要使用。
- **复杂的 `-e` 命令**：使用脚本文件替代；shell 转义会导致退出码 5。
- **Grid 与 size 混淆**：Grid 是碎片数量，size 是物理尺寸（毫米）。
- **偏移量语义**：0 = 组装好的拼图，正值 = 爆炸/分离的碎片。
- **SNIC 缺少包**：snic 类型需要安装 `snic` 包。

## 相关技能

- `add-puzzle-type` — 端到端搭建新拼图类型
- `validate-piles-notation` — 在传递给 generate_puzzle() 之前验证融合组字符串
- `run-puzzle-tests` — 在修改生成逻辑后运行测试套件
- `write-testthat-tests` — 为新生成场景添加测试
