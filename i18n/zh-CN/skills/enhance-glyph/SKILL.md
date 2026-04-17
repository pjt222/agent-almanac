---
name: enhance-glyph
locale: zh-CN
source_locale: en
source_commit: acc252e6
translator: claude
translation_date: "2026-03-18"
description: >
  改善可视化层中现有的基于R的象形符号。涵盖当前符号的视觉审计、具体问题诊断
  （比例、可读性、发光平衡）、对符号函数的针对性修改、重新渲染以及修改前后对比。
  适用于技能、代理和团队符号。当符号在小尺寸下渲染不佳、视觉隐喻不清晰、存在
  比例问题、霓虹发光效果不平衡，或在添加新调色板或更改渲染流水线后使用。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "2.0"
  domain: design
  complexity: intermediate
  language: R
  tags: design, glyph, enhancement, icon, ggplot2, visualization, refinement
---

# 增强符号

改善 `viz/` 可视化层中现有的象形符号 — 审计其当前渲染效果、诊断视觉问题、应用针对性修改、重新渲染并进行修改前后对比。适用于技能、代理和团队符号。

## 适用场景

- 符号在小尺寸下渲染不佳（细节丢失、形状融合）
- 符号的视觉隐喻不清晰或与其代表的实体不匹配
- 符号存在比例问题（过大、过小、偏心）
- 霓虹发光效果过强或不足
- 符号在某个调色板中效果好但在其他调色板中表现差
- 添加新调色板或更改渲染流水线后的批量改善

## 输入

- **必需**：实体类型 — `skill`、`agent` 或 `team`
- **必需**：需要增强的符号的实体 ID（例如 `commit-changes`、`mystic`、`tending`）
- **必需**：需要解决的具体问题（可读性、比例、发光、调色板兼容性）
- **可选**：展示期望质量水平的参考符号
- **可选**：要优化的目标调色板（默认：所有调色板）

## 流程

### 步骤 1：审计 — 评估当前状态

检查当前符号并识别具体问题。

1. 根据实体类型定位符号函数：
   - **技能**：`viz/R/primitives*.R`（19 个按领域分组的文件），映射在 `viz/R/glyphs.R` 中
   - **代理**：`viz/R/agent_primitives.R`，映射在 `viz/R/agent_glyphs.R` 中
   - **团队**：`viz/R/team_primitives.R`，映射在 `viz/R/team_glyphs.R` 中
2. 阅读符号函数以理解其结构：
   - 使用了多少个图层？
   - 调用了哪些基元？
   - 缩放因子和定位参数是什么？
3. 查看渲染输出：
   - 技能：`viz/public/icons/cyberpunk/<domain>/<skillId>.webp`
   - 代理：`viz/public/icons/cyberpunk/agents/<agentId>.webp`
   - 团队：`viz/public/icons/cyberpunk/teams/<teamId>.webp`
   - 如果可用，检查 2-3 个其他调色板的跨调色板渲染效果
   - 在图标尺寸（图中约 48px）和面板尺寸（详情面板中约 160px）下查看
4. 按照**质量维度**对符号评分：

```
Glyph Quality Dimensions:
+----------------+------+-----------------------------------------------+
| Dimension      | 1-5  | Assessment Criteria                           |
+----------------+------+-----------------------------------------------+
| Readability    |      | Recognizable at 48px? Clear at 160px?         |
| Proportions    |      | Well-centered? Good use of the 100x100 canvas?|
| Metaphor       |      | Does the shape clearly represent the entity?   |
| Glow balance   |      | Glow enhances without overwhelming?            |
| Palette compat |      | Looks good across cyberpunk + viridis palettes?|
| Complexity     |      | Appropriate layer count (not too busy/sparse)? |
+----------------+------+-----------------------------------------------+
```

5. 找出得分最低的 1-2 个维度 — 这些是增强目标

**预期结果：** 对符号问题的明确诊断以及需要改善的维度。审计应具体化："比例：符号仅使用了画布的 40%"，而不是"看起来不好"。

**失败时：** 如果符号函数缺失或实体不在其 `*_glyphs.R` 映射中，该符号可能尚未创建 — 请改用 `create-glyph`。

### 步骤 2：诊断 — 根因分析

确定已识别问题的成因。

1. 对于**可读性**问题：
   - 过多细节在小尺寸下融合？
   - 符号元素之间对比度不足？
   - 线条太细（s=1.0 时 `size` < 1.5）？
   - 元素之间距离太近？
2. 对于**比例**问题：
   - 缩放因子 `s` 过小或过大？
   - 中心偏离 (50, 50)？
   - 元素超出安全区域（10-90 范围）？
3. 对于**发光**问题：
   - 符号笔画宽度与 `ggfx::with_outer_glow()` 的交互：
     - 细线条：发光使其模糊
     - 粗填充：发光产生过度光晕
   - 多个重叠元素：复合发光产生热点
4. 对于**调色板兼容性**问题：
   - 符号使用了硬编码颜色而非 `col`/`bright` 参数？
   - 低对比度调色板（cividis, mako）使符号不可见？
   - 符号依赖某些调色板无法提供的颜色变化？
5. 记录每个问题的具体根因

**预期结果：** 直接指向代码修改的根因。"符号太小" -> "缩放因子为 0.6，应为 0.8。""发光过强" -> "三个重叠的填充多边形各自产生发光。"

**失败时：** 如果通过代码检查根因不明显，使用不同参数单独渲染符号以隔离问题。使用 `render_glyph()` 对单个符号进行测试。

### 步骤 3：修改 — 应用针对性修复

编辑符号函数以解决诊断出的问题。

1. 打开包含符号函数的文件
2. 根据诊断结果应用修改：
   - **缩放/比例**：调整 `s` 乘数或元素偏移量
   - **可读性**：简化复杂元素、增加笔画宽度、添加间距
   - **发光平衡**：减少重叠的填充区域，在填充产生光晕的地方使用轮廓线
   - **调色板兼容性**：确保所有颜色均来自 `col`/`bright` 参数，添加 alpha 增加层次感
3. 遵循**符号函数契约**：
   ```r
   glyph_name <- function(cx, cy, s, col, bright) {
     # cx, cy = center (50, 50)
     # s = scale (1.0 = ~70% of canvas)
     # col = domain color, bright = brightened variant
     # Returns: list() of ggplot2 layers
   }
   ```
4. 保持函数签名不变 — 不要更改参数
5. 保持修改最小化：修复诊断出的问题，不要重新设计整个符号

**预期结果：** 修改后的符号函数解决了步骤 1-2 中识别的具体问题。修改是针对性且最小化的 — 增强，而非重新设计。

**失败时：** 如果修改导致其他维度变差（例如修复比例破坏了可读性），请还原并尝试不同的方法。如果符号需要完全重新设计，请改用 `create-glyph`。

### 步骤 4：重新渲染 — 生成更新后的图标

渲染修改后的符号并验证修复效果。

1. 根据实体类型重新渲染：

   **技能：**
   ```bash
   cd /mnt/d/dev/p/agent-almanac/viz
   Rscript build-icons.R --only <domain> --no-cache
   ```

   **代理：**
   ```bash
   cd /mnt/d/dev/p/agent-almanac/viz
   Rscript build-agent-icons.R --only <agent-id> --no-cache
   ```

   **团队：**
   ```bash
   cd /mnt/d/dev/p/agent-almanac/viz
   Rscript build-team-icons.R --only <team-id> --no-cache
   ```

2. 验证每个调色板的输出文件存在于预期路径
3. 检查文件大小 — 图标应为 2-15 KB（WebP）：
   - 低于 2 KB：符号可能过于简单或渲染失败
   - 超过 15 KB：符号可能过于复杂（图层过多）

**预期结果：** 为所有调色板生成了新的图标文件。文件大小在预期范围内。

**失败时：** 如果构建脚本报错，检查 R 控制台输出中的具体错误。常见原因：符号函数中缺少右括号、引用了未定义的基元，或函数返回了非列表类型。如果渲染成功但输出为空白，符号图层可能超出了画布边界。

### 步骤 5：对比 — 修改前后验证

验证增强是否改善了目标维度。

1. 对比新旧渲染效果：
   - 在图标（48px）和面板（160px）尺寸下查看 cyberpunk 调色板版本
   - 至少查看另外 2 个调色板（一个浅色如 turbo，一个深色如 mako）
2. 重新对步骤 1 的质量维度评分：
   - 目标维度应提高至少 1 分
   - 非目标维度不应下降
3. 如果符号在力导向图中使用，在那里测试：
   - 启动 HTTP 服务器：从 `viz/` 运行 `python3 -m http.server 8080`
   - 加载图形并找到实体节点
   - 验证图标在默认缩放和放大时正确渲染
4. 记录所做的更改和实现的改善

**预期结果：** 目标维度有可衡量的改善，其他维度无退化。符号在两种尺寸和各调色板下均效果更佳。

**失败时：** 如果改善微乎其微或发生退化，还原更改并重新考虑诊断。有时原始符号的局限性源于隐喻本身而非实现方式 — 在这种情况下，可能需要更改隐喻本身（升级为 `create-glyph`）。

## 验证清单

- [ ] 对当前符号进行了审计并给出具体问题诊断
- [ ] 为每个问题识别了根因
- [ ] 修改针对诊断出的问题（未过度编辑）
- [ ] 保持了符号函数契约（签名不变）
- [ ] 为所有调色板重新渲染了图标
- [ ] 修改前后对比显示目标维度有所改善
- [ ] 非目标维度无退化
- [ ] 文件大小在预期范围内（2-15 KB WebP）
- [ ] 符号在力导向图上下文中正确渲染（如适用）

## 常见陷阱

- **过度增强**：修复一个问题后又调整其他所有内容。应专注于诊断出的问题
- **破坏契约**：更改函数签名会破坏渲染流水线。5 参数契约是不可变的
- **针对特定调色板优化**：为 cyberpunk 做到完美但在 viridis 下表现差。始终检查 3 个以上调色板
- **忽略小尺寸渲染**：160px 下美观但 48px 下变成色块的图标是失败的增强
- **忘记重新渲染**：编辑函数但未运行构建命令意味着更改不可见
- **构建命令错误**：技能使用 `build-icons.R`，代理使用 `build-agent-icons.R`，团队使用 `build-team-icons.R`

## 相关技能

- [create-glyph](../create-glyph/SKILL.md) — 从头创建新符号（当增强不够时使用）
- [audit-icon-pipeline](../audit-icon-pipeline/SKILL.md) — 检测流水线中哪些符号需要增强
- [render-icon-pipeline](../render-icon-pipeline/SKILL.md) — 增强后运行完整的渲染流水线
- [ornament-style-mono](../ornament-style-mono/SKILL.md) — 适用于符号组合的视觉设计原则
- [chrysopoeia](../chrysopoeia/SKILL.md) — 价值提取方法论与符号优化相似（放大精华、去除杂质）
