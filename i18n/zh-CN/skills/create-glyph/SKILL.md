---
name: create-glyph
locale: zh-CN
source_locale: en
source_commit: acc252e6
translator: claude
translation_date: "2026-03-18"
description: >
  创建基于R的象形符号（glyph），用于可视化层中的技能、代理或团队图标。涵盖概念
  草图设计、使用基元库进行ggplot2图层组合、配色策略、在相应的符号映射文件和清单
  中注册、通过构建流水线渲染，以及对霓虹发光输出的视觉验证。适用于新增实体需要
  力导向图可视化图标、现有符号需要替换、或批量创建新领域符号的场景。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "2.0"
  domain: design
  complexity: intermediate
  language: R
  tags: design, glyph, pictogram, icon, ggplot2, visualization, neon
---

# 创建符号

为 `viz/` 可视化层创建基于R的象形符号。每个符号都是一个纯 ggplot2 函数，在 100x100 画布上绘制可辨识的图形，以霓虹发光效果渲染为透明背景的 WebP 格式。

## 适用场景

- 新增了技能、代理或团队，需要创建视觉图标
- 现有符号需要替换或重新设计
- 为新的技能领域批量创建符号
- 为实体概念设计视觉隐喻的原型

## 输入

- **必需**：实体类型 — `skill`、`agent` 或 `team`
- **必需**：实体 ID（例如 `create-glyph`、`mystic`、`r-package-review`）及领域（技能适用）
- **必需**：视觉概念 — 符号应呈现的内容
- **可选**：参考符号，用于评估复杂度级别
- **可选**：自定义 `--glow-sigma` 值（默认：4）

## 流程

### 步骤 1：概念 — 设计视觉隐喻

确定需要图标化的实体，并选择合适的视觉隐喻。

1. 阅读实体的源文件以理解其核心概念：
   - 技能：`skills/<id>/SKILL.md`
   - 代理：`agents/<id>.md`
   - 团队：`teams/<id>.md`
2. 选择隐喻类型：
   - **具象物体**：烧瓶代表实验，盾牌代表安全
   - **抽象符号**：箭头代表合并，螺旋代表迭代
   - **组合图形**：结合 2-3 个简单形状（例如文档 + 钢笔）
3. 参考现有符号进行复杂度校准：

```
Complexity Tiers:
+----------+--------+-------------------------------------------+
| Tier     | Layers | Examples                                  |
+----------+--------+-------------------------------------------+
| Simple   | 2      | glyph_flame, glyph_heartbeat              |
| Moderate | 3-5    | glyph_document, glyph_experiment_flask    |
| Complex  | 6+     | glyph_ship_wheel, glyph_bridge_cpp        |
+----------+--------+-------------------------------------------+
```

4. 确定函数名称：`glyph_<描述性名称>`（snake_case，唯一）

**预期结果：** 清晰的图形草案，规划了 2-6 个图层。

**失败时：** 如果概念过于抽象，可回退为相关的具象物体。查看同领域的现有符号获取灵感。

### 步骤 2：组合 — 编写符号函数

编写生成 ggplot2 图层的 R 函数。

1. 函数签名（不可变的契约）：
   ```r
   glyph_<name> <- function(cx, cy, s, col, bright) {
     # cx, cy = center coordinates (50, 50 on 100x100 canvas)
     # s = scale factor (1.0 = fill ~70% of canvas)
     # col = domain color hex (e.g., "#ff88dd" for design)
     # bright = brightened variant of col (auto-computed by renderer)
     # Returns: list() of ggplot2 layers
   }
   ```

2. 对所有尺寸应用缩放因子 `* s` 以保证一致的缩放：
   ```r
   r <- 20 * s        # radius
   hw <- 15 * s       # half-width
   lw <- .lw(s)       # line width (default base 2.5)
   lw_thin <- .lw(s, 1.2)  # thinner line width
   ```

3. 使用可用的基元构建几何图形：

   | 几何图形 | 用途 |
   |----------|------|
   | `ggplot2::geom_polygon(data, .aes(x, y), ...)` | 填充形状 |
   | `ggplot2::geom_path(data, .aes(x, y), ...)` | 开放线条/曲线 |
   | `ggplot2::geom_segment(data, .aes(x, xend, y, yend), ...)` | 线段、箭头 |
   | `ggplot2::geom_rect(data, .aes(xmin, xmax, ymin, ymax), ...)` | 矩形 |
   | `ggforce::geom_circle(data, .aes(x0, y0, r), ...)` | 圆形 |

4. 应用配色策略：

   ```
   Alpha Guide:
   +----------------------+------------+--------------------------+
   | Purpose              | Alpha      | Example                  |
   +----------------------+------------+--------------------------+
   | Large fill (body)    | 0.08-0.15  | hex_with_alpha(col, 0.1) |
   | Medium fill (accent) | 0.15-0.25  | hex_with_alpha(col, 0.2) |
   | Small fill (detail)  | 0.25-0.35  | hex_with_alpha(bright, 0.3) |
   | Outline stroke       | 1.0        | color = bright           |
   | Secondary stroke     | 1.0        | color = col              |
   | No fill              | ---        | fill = NA                |
   +----------------------+------------+--------------------------+
   ```

5. 返回一个扁平的 `list()` 图层列表（渲染器逐一迭代并为每个图层包裹发光效果）

6. 根据实体类型将函数放置在相应的基元文件中：
   - **技能**：按领域分组于 19 个基元文件中：
     - `primitives.R` — bushcraft, compliance, containerization, data-serialization, defensive
     - `primitives_2.R` — devops, general, git, mcp-integration
     - `primitives_3.R` — mlops, observability, PM, r-packages, reporting, review, web-dev, esoteric, design
     - 其他 `primitives_4.R` 至 `primitives_19.R` 用于较新的领域
   - **代理**：`viz/R/agent_primitives.R`
   - **团队**：`viz/R/team_primitives.R`

**预期结果：** 一个可运行的 R 函数，返回包含 2-6 个 ggplot2 图层的列表。

**失败时：** 如果 `ggforce::geom_circle` 报错，请确保已安装 ggforce。如果坐标有偏差，请记住画布为 100x100，(0,0) 位于左下角。交互式测试函数：
```r
source("viz/R/utils.R"); source("viz/R/primitives.R")  # etc.
layers <- glyph_<name>(50, 50, 1.0, "#ff88dd", "#ffa8f0")
p <- ggplot2::ggplot() + ggplot2::coord_fixed(xlim=c(0,100), ylim=c(0,100)) +
     ggplot2::theme_void()
for (l in layers) p <- p + l
print(p)
```

### 步骤 3：注册 — 将实体映射到符号

在相应的符号映射文件中添加实体到符号的映射。

**技能：**
1. 打开 `viz/R/glyphs.R`
2. 找到目标领域的注释段落（例如 `# -- design (3)`）
3. 在领域区块内按字母顺序添加条目：
   ```r
   "skill-id" = "glyph_function_name",
   ```
4. 如有需要，更新注释中的领域计数

**代理：**
1. 打开 `viz/R/agent_glyphs.R`
2. 在 `AGENT_GLYPHS` 中找到按字母排列的正确位置
3. 添加条目：
   ```r
   "agent-id" = "glyph_function_name",
   ```

**团队：**
1. 打开 `viz/R/team_glyphs.R`
2. 在 `TEAM_GLYPHS` 中找到按字母排列的正确位置
3. 添加条目：
   ```r
   "team-id" = "glyph_function_name",
   ```

5. 验证目标列表中没有重复的 ID

**预期结果：** 相应的 `*_GLYPHS` 列表包含新的映射条目。

**失败时：** 如果构建时报告 "No glyph mapped"，请仔细检查实体 ID 是否与清单和注册表中的完全一致。

### 步骤 4：清单 — 添加图标条目

在相应的清单文件中注册图标。

**技能：** `viz/data/icon-manifest.json`
```json
{
  "skillId": "skill-id",
  "domain": "domain-name",
  "prompt": "<domain basePrompt>, <descriptors>, dark background, vector art",
  "seed": <next_seed>,
  "path": "public/icons/cyberpunk/<domain>/<skill-id>.webp",
  "status": "pending"
}
```

**代理：** `viz/data/agent-icon-manifest.json`
```json
{
  "agentId": "agent-id",
  "prompt": "<agent-specific descriptors>, dark background, vector art",
  "seed": <next_seed>,
  "path": "public/icons/cyberpunk/agents/<agent-id>.webp",
  "status": "pending"
}
```

**团队：** `viz/data/team-icon-manifest.json`
```json
{
  "teamId": "team-id",
  "prompt": "<team-specific descriptors>, dark background, vector art",
  "seed": <next_seed>,
  "path": "public/icons/cyberpunk/teams/<team-id>.webp",
  "status": "pending"
}
```

**预期结果：** 有效的 JSON，新条目放置在同类实体之间。

**失败时：** 验证 JSON 语法。常见错误：数组最后一个元素后有尾随逗号、缺少引号。

### 步骤 5：渲染 — 生成图标

运行构建流水线渲染 WebP 文件。

1. 切换到 `viz/` 目录
2. 根据实体类型进行渲染：

**技能：**
```bash
cd viz && Rscript build-icons.R --only <domain>
# Or skip existing: Rscript build-icons.R --only <domain> --skip-existing
```

**代理：**
```bash
cd viz && Rscript build-agent-icons.R --only <agent-id>
# Or skip existing: Rscript build-agent-icons.R --only <agent-id> --skip-existing
```

**团队：**
```bash
cd viz && Rscript build-team-icons.R --only <team-id>
# Or skip existing: Rscript build-team-icons.R --only <team-id> --skip-existing
```

3. 如需先进行试运行，在任何命令后添加 `--dry-run`
4. 输出位置：
   - 技能：`viz/public/icons/<palette>/<domain>/<skill-id>.webp`
   - 代理：`viz/public/icons/<palette>/agents/<agent-id>.webp`
   - 团队：`viz/public/icons/<palette>/teams/<team-id>.webp`

**预期结果：** 日志显示 `OK: <entity> (seed=XXXXX, XX.XKB)`，WebP 文件存在。

**失败时：**
- `"No glyph mapped"` — 步骤 3 的映射缺失或存在拼写错误
- `"Unknown domain"` — 领域不在 `palettes.R` 的 `get_palette_colors()` 中
- R 包错误 — 先运行 `install.packages(c("ggplot2", "ggforce", "ggfx", "ragg", "magick"))`
- 如果渲染崩溃，交互式测试符号函数（参见步骤 2 的回退方案）

### 步骤 6：验证 — 视觉检查

检查渲染输出是否符合质量标准。

1. 验证文件存在且大小合理：
   ```bash
   ls -la viz/public/icons/cyberpunk/<type-path>/<entity-id>.webp
   # Expected: 15-80 KB typical range
   ```

2. 在图像查看器中打开 WebP 检查：
   - 在全尺寸（1024x1024）下形状清晰可辨
   - 霓虹发光效果存在但不过于强烈
   - 背景透明（没有黑色/白色矩形）
   - 画布边缘无裁切

3. 在小尺寸下检查（图标在力导向图中以约 40-160px 渲染）：
   - 形状仍可辨识
   - 细节不会变为噪点
   - 发光效果不会淹没形状

**预期结果：** 在透明背景上呈现清晰、可辨识的象形图，霓虹发光均匀。

**失败时：**
- 发光过强：使用 `--glow-sigma 2` 重新渲染（默认为 4）
- 发光过弱：使用 `--glow-sigma 8` 重新渲染
- 小尺寸下形状不可辨：简化符号（减少图层、加粗笔画、增大 `.lw(s, base)` 基础值）
- 边缘裁切：减小形状尺寸或移动中心点

### 步骤 7：迭代 — 按需优化

进行调整并重新渲染。

1. 常见调整：
   - **加粗笔画**：增大 `.lw(s, base)` — 尝试 `base = 3.0` 或 `3.5`
   - **更明显的填充**：将 alpha 从 0.10 增加到 0.15-0.20
   - **形状比例**：调整 `s` 的乘数（例如 `20 * s` -> `24 * s`）
   - **增减细节图层**：保持总图层数在 2-6 之间以获得最佳效果

2. 修改后重新渲染：
   ```bash
   # Delete the existing icon first, then re-render
   rm viz/public/icons/cyberpunk/<type-path>/<entity-id>.webp
   # Use the appropriate build command from Step 5
   ```

3. 满意后，验证清单状态显示 `"done"`（构建脚本在成功时会自动更新）

**预期结果：** 最终图标通过步骤 6 的所有验证检查。

**失败时：** 如果经过 3 次以上迭代符号仍然不理想，考虑使用完全不同的视觉隐喻（回到步骤 1）。

## 参考资料

### 领域与实体调色板

所有 58 个领域颜色（技能用）定义在 `viz/R/palettes.R` 中（唯一的真实数据来源）。代理和团队颜色也在 `palettes.R` 中管理。cyberpunk 调色板（手动调整的霓虹色）在 `get_cyberpunk_colors()` 中。Viridis 系列调色板通过 `viridisLite` 自动生成。

查找颜色：
```r
source("viz/R/palettes.R")
get_palette_colors("cyberpunk")$domains[["design"]]   # skill domain
get_palette_colors("cyberpunk")$agents[["mystic"]]     # agent
get_palette_colors("cyberpunk")$teams[["tending"]]     # team
```

添加新领域时，需在 `palettes.R` 的三个位置添加：
1. `PALETTE_DOMAIN_ORDER`（按字母排序）
2. `get_cyberpunk_colors()` 领域列表
3. 运行 `Rscript generate-palette-colors.R` 重新生成 JSON + JS

### 符号函数目录

可用符号函数的完整目录见基元源文件：
- **技能**：`viz/R/primitives.R` 至 `viz/R/primitives_19.R`（按领域分组）
- **代理**：`viz/R/agent_primitives.R`
- **团队**：`viz/R/team_primitives.R`

### 辅助函数

| 函数 | 签名 | 用途 |
|------|------|------|
| `.lw(s, base)` | `(scale, base=2.5)` | 缩放感知的线宽 |
| `.aes(...)` | `ggplot2::aes` 的别名 | 简写美学映射 |
| `hex_with_alpha(hex, alpha)` | `(string, 0-1)` | 为十六进制颜色添加透明度 |
| `brighten_hex(hex, factor)` | `(string, factor=1.3)` | 提亮十六进制颜色 |
| `dim_hex(hex, factor)` | `(string, factor=0.4)` | 调暗十六进制颜色 |

## 验证清单

- [ ] 符号函数遵循 `glyph_<name>(cx, cy, s, col, bright) -> list()` 签名
- [ ] 所有尺寸使用 `* s` 缩放因子
- [ ] 配色策略使用 `col` 填充、`bright` 描边、`hex_with_alpha()` 控制透明度
- [ ] 函数放置在正确的基元文件中（按实体类型和领域）
- [ ] 在相应的 `*_glyphs.R` 文件中添加了符号映射条目
- [ ] 在清单中添加了正确的实体 ID、路径和 `"status": "pending"`
- [ ] 构建命令无错运行（先进行试运行）
- [ ] 渲染的 WebP 文件存在于预期路径
- [ ] 文件大小在预期范围内（15-80 KB）
- [ ] 图标在 1024px 和约 40px 显示尺寸下均清晰可辨
- [ ] 背景透明（符号后面没有实心矩形）
- [ ] 成功渲染后清单状态更新为 `"done"`

## 常见陷阱

- **忘记 `* s`**：硬编码的像素值在缩放改变时会失效。始终乘以 `s`。
- **画布原点混淆**：(0,0) 在左下角，不是左上角。`y` 值越大越往上。
- **双重发光**：渲染器已对每个图层应用 `ggfx::with_outer_glow()`。不要在符号函数内部再添加发光效果。
- **图层过多**：每个图层单独包裹发光效果。超过 8 个图层会导致渲染变慢且视觉上杂乱。
- **ID 不匹配**：符号映射、清单和注册表中的实体 ID 必须完全一致。
- **JSON 尾随逗号**：清单为严格的 JSON 格式。数组最后一个元素后不能有尾随逗号。
- **缺失领域颜色**：如果领域不在 `palettes.R` 的 `get_cyberpunk_colors()` 中，渲染会报错。先添加颜色，再重新生成。
- **基元文件放置错误**：技能放在按领域分组的 `primitives*.R` 中，代理放在 `agent_primitives.R` 中，团队放在 `team_primitives.R` 中。

## 相关技能

- [enhance-glyph](../enhance-glyph/SKILL.md) — 改善现有符号的视觉质量、修复渲染问题或添加细节图层
- [audit-icon-pipeline](../audit-icon-pipeline/SKILL.md) — 检测缺失的符号和图标，了解哪些需要创建
- [render-icon-pipeline](../render-icon-pipeline/SKILL.md) — 端到端运行完整的渲染流水线
- [ornament-style-mono](../ornament-style-mono/SKILL.md) — 互补的基于AI的图像生成（Z-Image 与 R 编码符号的对比）
- [ornament-style-color](../ornament-style-color/SKILL.md) — 适用于符号强调填充决策的色彩理论
- [create-skill](../create-skill/SKILL.md) — 添加新技能时触发符号创建的父级工作流
