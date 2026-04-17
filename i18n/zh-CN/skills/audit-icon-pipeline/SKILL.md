---
name: audit-icon-pipeline
locale: zh-CN
source_locale: en
source_commit: e4ffbae4
translator: claude
translation_date: "2026-03-18"
description: >
  通过将注册表与符号映射文件、图标目录和清单进行比较，检测缺失的符号、图标
  和高清变体。报告技能、代理和团队在所有调色板中的差异。
license: MIT
allowed-tools: Read Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: visualization
  complexity: basic
  language: R
  tags: visualization, audit, icons, glyphs, pipeline, gap-analysis
---

# 审计图标流水线

通过将注册表与符号映射文件、图标目录和清单进行比较，检测缺失的符号、缺失的图标和过时的清单。生成涵盖技能、代理和团队的结构化差异报告。

## 适用场景

- 添加新的技能、代理或团队后，检查是否需要创建图标
- 在完整的流水线渲染之前，识别缺失的内容
- 注册表更新后，确保清单保持同步
- 图标流水线的定期健康检查

## 输入

- **可选**：实体类型过滤 — `skill`、`agent`、`team` 或 `all`（默认：`all`）
- **可选**：要检查的调色板（默认：`cyberpunk` — 参考调色板）

## 流程

### 步骤 1：读取注册表

从权威数据源注册表中收集所有实体 ID。

1. 读取 `skills/_registry.yml` — 提取所有领域中的全部技能 ID
2. 读取 `agents/_registry.yml` — 提取所有代理 ID
3. 读取 `teams/_registry.yml` — 提取所有团队 ID
4. 记录计数：技能总数、代理总数、团队总数

**预期结果：** 三个实体 ID 列表，计数与 `total_skills`、`total_agents`、`total_teams` 匹配。

**失败时：** 如果注册表文件缺失，报告路径并跳过该实体类型。

### 步骤 2：读取符号映射

从符号映射文件中收集所有已映射的实体 ID。

1. 读取 `viz/R/glyphs.R` — 提取 `SKILL_GLYPHS` 列表中的所有键
2. 读取 `viz/R/agent_glyphs.R` — 提取 `AGENT_GLYPHS` 列表中的所有键
3. 读取 `viz/R/team_glyphs.R` — 提取 `TEAM_GLYPHS` 列表中的所有键

**预期结果：** 三个已映射 ID 列表。

**失败时：** 如果符号文件缺失，报告并将该类型的所有实体标记为未映射。

### 步骤 3：计算缺失的符号

将注册表 ID 与已映射 ID 进行差异比较。

1. 缺失的技能符号：`registry_skill_ids - mapped_skill_ids`
2. 缺失的代理符号：`registry_agent_ids - mapped_agent_ids`
3. 缺失的团队符号：`registry_team_ids - mapped_team_ids`

**预期结果：** 存在于注册表中但没有映射符号函数的实体 ID 列表。

**失败时：** 如果差异计算失败，验证注册表和符号文件之间的 ID 格式是否匹配（例如下划线与连字符）。

### 步骤 4：检查已渲染的图标

验证已映射的符号是否有对应的已渲染图标文件。

1. 对于每个已映射的技能 ID，检查 `viz/public/icons/<palette>/<domain>/<skillId>.webp`
2. 对于每个已映射的代理 ID，检查 `viz/public/icons/<palette>/agents/<agentId>.webp`
3. 对于每个已映射的团队 ID，检查 `viz/public/icons/<palette>/teams/<teamId>.webp`
4. 检查 `viz/public/icons-hd/` 中相同结构的高清变体

**预期结果：** 有符号但缺失已渲染图标（标准和/或高清）的实体列表。

**失败时：** 如果图标目录不存在，说明流水线尚未运行 — 将所有标记为缺失。

### 步骤 5：检查清单时效性

将清单计数与注册表计数进行比较。

1. 读取 `viz/public/data/icon-manifest.json` — 统计条目数
2. 读取 `viz/public/data/agent-icon-manifest.json` — 统计条目数
3. 读取 `viz/public/data/team-icon-manifest.json` — 统计条目数
4. 与注册表总数进行比较

**预期结果：** 清单计数与注册表计数匹配。差异表明清单已过时。

**失败时：** 如果清单文件不存在，需要先运行数据流水线（`node build-data.js && node build-icon-manifest.js`）。

### 步骤 6：生成差异报告

生成结构化的汇总报告。

1. 将输出格式化为清晰的表格或列表：
   ```
   === Icon Pipeline Audit ===

   MISSING GLYPHS (no glyph function):
     Skills: 5 missing — [list]
     Agents: 2 missing — [list]
     Teams: 0 missing

   MISSING ICONS (glyph exists, no rendered WebP):
     Standard (512px): 3 skills, 1 agent
     HD (1024px): 8 skills, 3 agents, 1 team

   STALE MANIFESTS:
     icon-manifest.json: 320 entries vs 326 registry (stale)
     agent-icon-manifest.json: 66 entries vs 66 registry (OK)
     team-icon-manifest.json: 15 entries vs 15 registry (OK)
   ```
2. 根据发现提出后续操作建议

**预期结果：** 包含可操作后续步骤的完整差异报告。

**失败时：** 如果所有检查通过且无差异，报告"流水线完全同步"作为正面结果。

## 验证清单

- [ ] 成功读取了所有三个注册表
- [ ] 检查了所有三个符号映射文件
- [ ] 扫描了标准和高清图标目录
- [ ] 验证了清单时效性
- [ ] 生成了包含计数和实体列表的差异报告
- [ ] 提供了可操作的后续步骤

## 常见陷阱

- **ID 格式不匹配**：注册表使用 kebab-case（`create-skill`），符号映射可能使用 snake_case 键 — 确保比较时进行格式规范化
- **调色板假设**：仅检查 cyberpunk 调色板会遗漏特定调色板的渲染差异
- **空目录**：领域目录存在但为空时，通配符搜索会认为"图标已存在" — 应检查文件是否存在，而非目录是否存在
- **高清未渲染**：高清图标位于单独的目录树（`icons-hd/`）中 — 不要与标准图标混淆

## 相关技能

- [create-glyph](../create-glyph/SKILL.md) — 创建本审计中识别出的缺失符号
- [enhance-glyph](../enhance-glyph/SKILL.md) — 改善现有符号的质量
- [render-icon-pipeline](../render-icon-pipeline/SKILL.md) — 运行完整的流水线以生成缺失的图标
- [ ] Orphan icons checked (disk paths vs manifest)
- **Orphans after re-homing**: When a skill's domain changes, `build.sh` creates icons at the new path but does NOT delete the old path — always run Step 6 orphan check after any domain migration
