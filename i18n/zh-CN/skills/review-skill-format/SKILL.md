---
name: review-skill-format
description: >
  审查 SKILL.md 文件是否符合 agentskills.io 标准。检查 YAML 前置元数据字段、
  必需章节、行数限制、步骤格式和注册表同步情况。适用于新技能在合并前需要格式
  验证、现有技能被修改后需要重新验证、对某领域所有技能进行批量审计，或在拉取
  请求中审查贡献者提交的技能。
locale: zh-CN
source_locale: en
source_commit: c7ff09ca
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: review
  complexity: intermediate
  language: multi
  tags: review, skills, format, validation, agentskills, quality
---

# 审查技能格式

对照 agentskills.io 开放标准验证 SKILL.md 文件。此技能检查 YAML 前置元数据完整性、必需章节存在性、步骤格式（预期结果/失败处理块）、行数限制和注册表同步情况。在合并任何新增或修改的技能前使用此技能。

## 适用场景

- 新技能已编写，需要在合并前进行格式验证
- 现有技能已修改，需要重新验证
- 对某领域的所有技能进行批量审计
- 验证由 `create-skill` 元技能创建的技能
- 在拉取请求中审查贡献者提交的技能

## 输入

- **必填**：SKILL.md 文件的路径（如 `skills/setup-vault/SKILL.md`）
- **可选**：严格程度（`lenient` 或 `strict`，默认值：`strict`）
- **可选**：是否检查注册表同步（默认值：是）

## 步骤

### 第 1 步：验证文件存在并读取内容

确认 SKILL.md 文件存在于预期路径，并读取其完整内容。

```bash
# 验证文件存在
test -f skills/<skill-name>/SKILL.md && echo "EXISTS" || echo "MISSING"

# 计算行数
wc -l < skills/<skill-name>/SKILL.md
```

**预期结果：** 文件存在且内容可读。行数已显示。

**失败处理：** 若文件不存在，检查路径是否有拼写错误。用 `ls skills/<skill-name>/` 验证技能目录是否存在。若目录不存在，说明技能尚未创建——先使用 `create-skill`。

### 第 2 步：检查 YAML 前置元数据字段

解析 YAML 前置元数据块（`---` 分隔符之间）并验证所有必需和推荐字段是否存在。

必需字段：
- `name` — 与目录名匹配（kebab-case）
- `description` — 少于 1024 个字符，以动词开头
- `license` — 通常为 `MIT`
- `allowed-tools` — 逗号分隔或空格分隔的工具列表

推荐的元数据字段：
- `metadata.author` — 作者姓名
- `metadata.version` — 语义化版本字符串
- `metadata.domain` — `skills/_registry.yml` 中列出的领域之一
- `metadata.complexity` — 以下之一：`basic`、`intermediate`、`advanced`
- `metadata.language` — 主要语言或 `multi`
- `metadata.tags` — 逗号分隔，3-6 个标签，包含领域名称

```bash
# 检查必需的前置元数据字段是否存在
head -30 skills/<skill-name>/SKILL.md | grep -q '^name:' && echo "name: OK" || echo "name: MISSING"
head -30 skills/<skill-name>/SKILL.md | grep -q '^description:' && echo "description: OK" || echo "description: MISSING"
head -30 skills/<skill-name>/SKILL.md | grep -q '^license:' && echo "license: OK" || echo "license: MISSING"
head -30 skills/<skill-name>/SKILL.md | grep -q '^allowed-tools:' && echo "allowed-tools: OK" || echo "allowed-tools: MISSING"
```

**预期结果：** 全部四个必需字段存在。全部六个元数据字段存在。`name` 与目录名匹配。`description` 少于 1024 个字符。

**失败处理：** 将每个缺失字段报告为阻塞（BLOCKING）。若 `name` 与目录名不匹配，报告为阻塞并附预期值。若 `description` 超过 1024 个字符，报告为建议（SUGGEST）并附当前长度。

### Step 3: Locale-Specific Validation (Translations Only)

If the frontmatter contains a `locale` field, the file is a translated SKILL.md. Perform these additional checks. If no `locale` field is present, skip this step.

1. **Translation frontmatter fields** — Verify these five fields are present:
   - `locale` — target locale code (e.g., `de`, `ja`, `zh-CN`, `es`)
   - `source_locale` — origin locale (typically `en`)
   - `source_commit` — commit hash of the English source used for translation
   - `translator` — who or what produced the translation
   - `translation_date` — ISO 8601 date of translation

2. **Prose language scan** — Sample 3-5 body paragraphs (outside code blocks, frontmatter, and headings). Verify the prose is written in the target locale, not English.

3. **Code block identity check** — Compare code blocks in the translated file against the English source. Code blocks must be identical (code is never translated).

**Expected:** All five translation fields present. Body paragraphs are in the target locale. Code blocks match the English source exactly.

**On failure:** Report missing translation fields as BLOCKING. If body paragraphs are in English despite a non-English `locale`, report as BLOCKING.

### 第 3 步：检查必需章节

验证技能正文（前置元数据之后）中是否存在全部六个必需章节。

必需章节：
1. `## When to Use`
2. `## Inputs`
3. `## Procedure`（含 `### Step N:` 子章节）
4. `## Validation`（也可以是 `## Validation Checklist`）
5. `## Common Pitfalls`
6. `## Related Skills`

```bash
# 检查每个必需章节
for section in "## When to Use" "## Inputs" "## Procedure" "## Common Pitfalls" "## Related Skills"; do
  grep -q "$section" skills/<skill-name>/SKILL.md && echo "$section: OK" || echo "$section: MISSING"
done

# 验证章节可以使用任一标题
grep -qE "## Validation( Checklist)?" skills/<skill-name>/SKILL.md && echo "Validation: OK" || echo "Validation: MISSING"
```

**预期结果：** 全部六个章节存在。步骤章节包含至少一个 `### Step` 子标题。

**失败处理：** 将每个缺失章节报告为阻塞。没有全部六个章节的技能不符合 agentskills.io 标准。提供来自 `create-skill` 元技能的章节模板。

### 第 4 步：检查步骤格式

验证每个步骤是否遵循所需格式：编号步骤标题、上下文、代码块，以及 **Expected:**/**On failure:** 块。

对每个 `### Step N:` 子章节检查：
1. 步骤有描述性标题（不仅仅是"第 N 步"）
2. 至少存在一个代码块或具体指令
3. 存在 `**Expected:**` 块
4. 存在 `**On failure:**` 块

**预期结果：** 每个步骤都有 **Expected:** 和 **On failure:** 块。步骤包含具体代码或指令，而非模糊描述。

**失败处理：** 将每个缺少 Expected/On failure 的步骤报告为阻塞。若步骤只包含模糊指令（"适当地配置系统"），报告为建议，并附添加具体命令的说明。

### 第 5 步：验证行数

检查 SKILL.md 是否在 500 行限制内。

```bash
lines=$(wc -l < skills/<skill-name>/SKILL.md)
[ "$lines" -le 500 ] && echo "OK ($lines lines)" || echo "OVER LIMIT ($lines lines > 500)"
```

**预期结果：** 行数为 500 行或更少。

**失败处理：** 若超过 500 行，报告为阻塞。建议使用 `refactor-skill-structure` 技能将超过 15 行的代码块提取到 `references/EXAMPLES.md`。典型减少幅度：通过提取扩展示例减少 20-40%。

### 第 6 步：检查注册表同步

验证技能已在正确领域下列入 `skills/_registry.yml`，元数据匹配。

检查：
1. 技能 `id` 存在于正确的领域章节下
2. `path` 匹配 `<skill-name>/SKILL.md`
3. `complexity` 与前置元数据匹配
4. `description` 存在（可以缩写）
5. 注册表顶部的 `total_skills` 计数与实际技能数量匹配

```bash
# 检查技能是否在注册表中
grep -q "id: <skill-name>" skills/_registry.yml && echo "Registry: FOUND" || echo "Registry: NOT FOUND"

# 检查路径
grep -A1 "id: <skill-name>" skills/_registry.yml | grep -q "path: <skill-name>/SKILL.md" && echo "Path: OK" || echo "Path: MISMATCH"
```

**预期结果：** 技能已在注册表中列出，位于正确领域下，路径和元数据匹配。总计数准确。

**失败处理：** 若在注册表中未找到，报告为阻塞。提供注册表条目模板：
```yaml
- id: skill-name
  path: skill-name/SKILL.md
  complexity: intermediate
  language: multi
  description: One-line description
```

## 验证清单

- [ ] SKILL.md 文件存在于预期路径
- [ ] YAML 前置元数据无错误解析
- [ ] 全部四个必需前置元数据字段存在（`name`、`description`、`license`、`allowed-tools`）
- [ ] 全部六个元数据字段存在（`author`、`version`、`domain`、`complexity`、`language`、`tags`）
- [ ] `name` 字段与目录名匹配
- [ ] `description` 少于 1024 个字符
- [ ] 全部六个必需章节存在（When to Use、Inputs、Procedure、Validation、Common Pitfalls、Related Skills）
- [ ] 每个步骤都有 **Expected:** 和 **On failure:** 块
- [ ] 行数为 500 行或更少
- [ ] 技能已在 `_registry.yml` 中列出，附正确的领域、路径和元数据
- [ ] 注册表中的 `total_skills` 计数准确

## 常见问题

- **仅用正则表达式检查前置元数据**：YAML 解析可能很微妙。`description: >` 多行块与 `description: "inline"` 看起来不同。搜索字段时检查两种模式。
- **遗漏验证章节变体**：某些技能使用 `## Validation Checklist` 而非 `## Validation`。两者均可接受；检查任一标题。
- **忘记注册表总计数**：将技能添加到注册表后，顶部的 `total_skills` 数字也必须递增。这是 PR 中常见的遗漏。
- **名称与标题混淆**：`name` 字段必须是与目录名匹配的 kebab-case。`# 标题` 标题是人类可读的，可以不同（如 name: `review-skill-format`，标题: `# Review Skill Format`）。
- **宽松模式跳过阻塞项**：即使在宽松模式下，缺失的必需章节和前置元数据字段仍应标记。宽松模式只放宽风格和元数据建议。

## 相关技能

- `create-skill` — 规范格式规范；用作有效 SKILL.md 应如何的权威参考
- `update-skill-content` — 格式验证通过后，用此改进内容质量
- `refactor-skill-structure` — 当技能未通过行数检查时，用此提取和重组
- `review-pull-request` — 在审查添加或修改技能的 PR 时，将 PR 审查与格式验证结合
- [ ] (Translations only) All five translation frontmatter fields present (`locale`, `source_locale`, `source_commit`, `translator`, `translation_date`)
- [ ] (Translations only) Body paragraphs are in the target locale, not English
- [ ] (Translations only) Code blocks are identical to the English source
