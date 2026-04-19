---
name: create-skill
description: >
  按照 Agent Skills 开放标准（agentskills.io）创建新的 SKILL.md 文件。
  涵盖前置元数据模式、章节结构、编写包含预期/失败处理对的有效步骤、
  验证清单、交叉引用和注册表集成。适用于为智能体固化可重复流程、
  向技能库添加新能力、将指南或操作手册转换为智能体可消费格式，
  或在项目和团队间标准化工作流。
locale: zh-CN
source_locale: en
source_commit: b4dd42cd
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: general
  complexity: intermediate
  language: multi
  tags: meta, skill, agentskills, standard, authoring
---

# 创建新技能

编写供智能体系统执行特定流程的 SKILL.md 文件。

## 适用场景

- 固化智能体应遵循的可重复流程
- 向技能库添加新能力
- 将指南、操作手册或检查表转换为智能体可消费格式
- 在项目或团队间标准化工作流

## 输入

- **必需**：技能需完成的任务
- **必需**：领域分类——`skills/_registry.yml` 中 48 个领域之一：
  `r-packages`、`jigsawr`、`containerization`、`reporting`、`compliance`、`mcp-integration`、
  `web-dev`、`git`、`general`、`citations`、`data-serialization`、`review`、`bushcraft`、
  `esoteric`、`design`、`defensive`、`project-management`、`devops`、`observability`、`mlops`、
  `workflow-visualization`、`swarm`、`morphic`、`alchemy`、`tcg`、`intellectual-property`、
  `gardening`、`shiny`、`animal-training`、`mycology`、`prospecting`、`crafting`、
  `library-science`、`travel`、`relocation`、`a2a-protocol`、`geometry`、`number-theory`、
  `stochastic-processes`、`theoretical-science`、`diffusion`、`hildegard`、`maintenance`、
  `blender`、`visualization`、`3d-printing`、`lapidary`、`versioning`
- **必需**：复杂度级别（basic、intermediate、advanced）
- **可选**：源材料（现有指南、操作手册或可用示例）
- **可选**：需要交叉引用的相关技能

## 步骤

### 第 1 步：创建目录

每个技能存放在独立目录中：

```bash
mkdir -p skills/<skill-name>/
```

命名规范：
- 使用小写连字符格式：`submit-to-cran`，而非 `SubmitToCRAN`
- 以动词开头：`create-`、`setup-`、`write-`、`deploy-`、`configure-`
- 要具体：`create-r-dockerfile` 而非 `create-dockerfile`

**预期结果：** 目录 `skills/<skill-name>/` 存在，名称遵循以动词开头的小写连字符格式。

**失败处理：** 若名称不以动词开头，重命名目录。检查命名冲突：`ls skills/ | grep <keyword>` 确保没有现有技能有重叠名称。

### 第 2 步：编写 YAML 前置元数据

```yaml
---
name: skill-name-here
description: >
  One to three sentences plus key activation triggers. Must be clear
  enough for an agent to decide whether to activate this skill from
  the description alone. Max 1024 characters. Start with a verb.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob  # optional, experimental
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: R | TypeScript | Python | Docker | Rust | multi
  tags: comma, separated, lowercase, tags
---
```

**必需字段**：`name`、`description`

**可选字段**：`license`、`allowed-tools`（实验性）、`metadata`、`compatibility`

**元数据规范**：
- `complexity`：basic（< 5 步，无边界情况）、intermediate（5-10 步，需要一定判断）、advanced（10+ 步，需要大量领域知识）
- `language`：主要语言；跨语言技能使用 `multi`
- `tags`：3-6 个用于发现的标签；包含领域名称

**预期结果：** YAML 前置元数据解析无误，`name` 与目录名匹配，`description` 在 1024 字符以内且有清晰的激活触发条件。

**失败处理：** 通过检查以下内容验证 YAML：匹配的 `---` 分隔符、版本字符串的正确引用（例如 `"1.0"` 而非 `1.0`），以及 description 字段的正确 `>` 多行折叠语法。

### 第 3 步：编写标题和简介

```markdown
# Skill Title (Imperative Verb Form)

One paragraph: what this skill accomplishes and the value it provides.
```

标题应与 `name` 对应但为人类可读形式。"Submit to CRAN" 而非 "submit-to-cran"。

**预期结果：** 以祈使动词形式的顶级 `#` 标题，后跟说明技能完成内容的简洁段落。

**失败处理：** 若标题读起来像名词短语而非动词短语，重新编写。"Package Submission" 变为 "Submit to CRAN"。

### 第 4 步：编写"适用场景"

列出 3-5 个触发条件——智能体应激活此技能的具体场景：

```markdown
## When to Use

- Starting a new R package from scratch
- Converting loose R scripts into a package
- Setting up a package skeleton for collaborative development
```

从智能体的视角编写。这些是智能体检查以决定是否激活的条件。

> **注意**：最重要的触发条件也应出现在 `description` 前置元数据字段中，因为在加载完整正文之前的发现阶段就会读取该字段。`## When to Use` 章节提供额外的细节和上下文。

**预期结果：** 3-5 个要点，描述智能体应激活此技能的具体、可观察的条件。

**失败处理：** 若触发条件感觉模糊（"当需要完成某事时"），从智能体的视角重写：什么可观察的状态或用户请求会触发激活？

### 第 5 步：编写"输入"

将必需项与可选项分开。具体说明类型和默认值：

```markdown
## Inputs

- **Required**: Package name (lowercase, no special characters except `.`)
- **Required**: One-line description of the package purpose
- **Optional**: License type (default: MIT)
- **Optional**: Whether to initialize renv (default: yes)
```

**预期结果：** 输入章节清晰区分必需和可选参数，每项都有类型提示和适用的默认值。

**失败处理：** 若参数类型模糊，在括号中添加具体示例："Package name (lowercase, no special characters except `.`)"。

### 第 6 步：编写"步骤"

这是技能的核心。每个步骤遵循以下模式：

```markdown
### Step N: Action Title

Context sentence explaining what this step accomplishes.

\```language
concrete_code("that the agent can execute")
\```

**Expected:** What success looks like. Be specific — file created, output matches pattern, command exits 0.

**On failure:** Recovery steps. Don't just say "fix it" — provide the most common failure cause and its resolution.
```

**编写有效步骤**：
- 每个步骤应独立可验证
- 包含实际代码，而非伪代码
- 最常见路径放在前面，边界情况放在"失败处理"中
- 5-10 步是最佳数量。不足 5 步可能太模糊；超过 12 步应拆分为多个技能
- 引用真实工具和真实命令，而非抽象描述

**预期结果：** 步骤章节包含 5-12 个编号步骤，每步有具体代码、`**Expected:**` 预期结果和 `**On failure:**` 恢复操作。

**失败处理：** 若步骤缺少代码，添加实际命令或配置。若缺少 Expected/On failure，立即编写——每个可能失败的步骤都需要两者。

### 第 7 步：编写"验证清单"

智能体完成流程后运行的检查清单：

```markdown
## Validation

- [ ] Criterion 1 (testable, binary pass/fail)
- [ ] Criterion 2
- [ ] No errors or warnings in output
```

每项必须客观可验证。"代码是干净的"不好。"`devtools::check()` 返回 0 个错误"才好。

**预期结果：** 一个 markdown 检查清单（`- [ ]`），包含 3-8 个智能体可以通过程序或检查验证的二元通过/失败标准。

**失败处理：** 将主观标准替换为可量化标准。"文档完善"变为"所有导出函数都有 `@param`、`@return` 和 `@examples` roxygen 标签"。

### 第 8 步：编写"常见问题"

3-6 个问题及其原因和规避方法：

```markdown
## Common Pitfalls

- **Pitfall name**: What goes wrong and how to avoid it. Be specific about the symptom and the fix.
```

从真实经验中提炼。最好的问题是那些浪费大量时间且不明显的问题。

**预期结果：** 3-6 个问题，每个都有粗体名称、出错情况描述和规避方法。

**失败处理：** 若问题感觉泛泛（"使用 X 时要小心"），使其具体化：说明症状、原因和解决方法。从开发或测试中实际遇到的失败场景中提取。

### 第 9 步：编写"相关技能"

交叉引用 2-5 个通常在此之前、之后或同时使用的技能：

```markdown
## Related Skills

- `prerequisite-skill` - must be done before this skill
- `follow-up-skill` - commonly done after this skill
- `alternative-skill` - alternative approach to the same goal
```

使用技能的 `name` 字段（连字符格式），而非标题。

**预期结果：** 列出 2-5 个相关技能，包含连字符格式 ID 和关系简述（前置、后续、替代）。

**失败处理：** 验证每个引用的技能是否存在：`ls skills/<skill-name>/SKILL.md`。删除任何对已重命名或删除技能的引用。

### 第 10 步：添加到注册表

编辑 `skills/_registry.yml`，在适当领域下添加新技能：

```yaml
- id: skill-name-here
  path: skill-name-here/SKILL.md
  complexity: intermediate
  language: multi
  description: One-line description matching the frontmatter
```

更新注册表顶部的 `total_skills` 数量。

**预期结果：** 新条目出现在 `skills/_registry.yml` 正确领域下，`total_skills` 数量与磁盘上的实际技能目录数匹配。

**失败处理：** 使用 `find skills -name SKILL.md | wc -l` 统计磁盘上的技能数量，与注册表中的 `total_skills` 对比。验证 `id` 字段与目录名完全匹配。

### 第 11 步：添加引用（可选）

若技能基于已有方法论、研究论文、软件包或标准，在 `references/` 目录添加引用子文件：

```bash
mkdir -p skills/<skill-name>/references/
```

创建两个文件：

- **`references/CITATIONS.bib`** — 机器可读的 BibTeX（事实来源）
- **`references/CITATIONS.md`** — 供 GitHub 浏览的人类可读渲染引用

```bibtex
% references/CITATIONS.bib
@article{author2024title,
  author  = {Author, First and Other, Second},
  title   = {Paper Title},
  journal = {Journal Name},
  year    = {2024},
  doi     = {10.xxxx/xxxxx}
}
```

```markdown
<!-- references/CITATIONS.md -->
# Citations

References underpinning the **skill-name** skill.

1. Author, F., & Other, S. (2024). *Paper Title*. Journal Name. https://doi.org/10.xxxx/xxxxx
```

引用是可选的——当来源追踪很重要时（学术方法、已发布标准、监管框架）添加。

**预期结果：** 两个文件存在，`.bib` 可解析为有效 BibTeX。

**失败处理：** 使用 `bibtool -d references/CITATIONS.bib` 或在线验证器验证 BibTeX 语法。

### 第 12 步：验证技能

提交前运行本地验证检查：

```bash
# 检查行数（必须 ≤500）
lines=$(wc -l < skills/<skill-name>/SKILL.md)
[ "$lines" -le 500 ] && echo "OK ($lines lines)" || echo "FAIL: $lines lines > 500"

# 检查必需的前置元数据字段
head -20 skills/<skill-name>/SKILL.md | grep -q '^name:' && echo "name: OK"
head -20 skills/<skill-name>/SKILL.md | grep -q '^description:' && echo "description: OK"
```

**预期结果：** 行数 ≤500，所有必需字段存在。

**失败处理：** 若超过 500 行，应用渐进式披露——将大型代码块（>15 行）提取到 `references/EXAMPLES.md`：

```bash
mkdir -p skills/<skill-name>/references/
```

将扩展代码示例、完整配置文件和多变体示例移至 `references/EXAMPLES.md`。在 SKILL.md 中添加交叉引用：`See [EXAMPLES.md](references/EXAMPLES.md) for complete configuration examples.` 在主 SKILL.md 中保留简短内联片段（3-10 行）。`.github/workflows/validate-skills.yml` 中的 CI 工作流在所有 PR 上强制执行这些限制。

### 第 13 步：创建斜杠命令符号链接

创建符号链接，使 Claude Code 将技能发现为 `/slash-command`：

```bash
# 项目级（在此项目中可用）
ln -s ../../skills/<skill-name> .claude/skills/<skill-name>

# 全局（在所有项目中可用）
ln -s /mnt/d/dev/p/agent-almanac/skills/<skill-name> ~/.claude/skills/<skill-name>
```

**预期结果：** `ls -la .claude/skills/<skill-name>/SKILL.md` 解析到技能文件。

**失败处理：** 验证相对路径正确。从 `.claude/skills/` 出发，路径 `../../skills/<skill-name>` 应到达技能目录。使用 `readlink -f` 调试符号链接解析。Claude Code 期望在 `.claude/skills/<name>/SKILL.md` 的平铺结构。

### 第 14 步：生成翻译文件

> **所有技能必须执行。** 本步骤同时适用于人类作者和遵循此流程的 AI 智能体。不要跳过——遗漏的翻译会累积为过期的待办积压。

在提交新技能后，立即为全部 4 种受支持的语言环境生成翻译文件：

```bash
for locale in de zh-CN ja es; do
  npm run translate:scaffold -- skills <skill-name> "$locale"
done
```

然后翻译每个文件中生成的散文内容（代码块和 ID 保持英文）。最后重新生成状态文件：

```bash
npm run translation:status
```

**预期结果：** 在 `i18n/{de,zh-CN,ja,es}/skills/<skill-name>/SKILL.md` 创建 4 个文件，全部的 `source_commit` 与当前 HEAD 匹配。`npm run validate:translations` 针对新技能显示 0 条过期警告。

**失败处理：** 若脚手架失败，在生成前先确认该技能存在于 `skills/_registry.yml` 中——脚本会读取注册表。若 `translation:status` 将新文件显示为过期，请检查 `source_commit` 是否与英文源最后修改的提交哈希匹配。

## 验证清单

- [ ] SKILL.md 存在于 `skills/<skill-name>/SKILL.md`
- [ ] YAML 前置元数据解析无误
- [ ] `name` 字段与目录名匹配
- [ ] `description` 在 1024 字符以内
- [ ] 所有必需章节存在：When to Use、Inputs、Procedure、Validation、Common Pitfalls、Related Skills
- [ ] 每个步骤都有具体代码和 Expected/On failure 对
- [ ] Related Skills 引用有效的技能名称
- [ ] 技能已列入 `_registry.yml`，路径正确
- [ ] 注册表中的 `total_skills` 数量已更新
- [ ] SKILL.md ≤500 行（若超出则提取到 `references/EXAMPLES.md`）
- [ ] 若技能基于已发布方法，引用已添加到 `references/CITATIONS.bib` + `CITATIONS.md`
- [ ] 符号链接存在于 `.claude/skills/<skill-name>` 指向技能目录
- [ ] 全局符号链接存在于 `~/.claude/skills/<skill-name>`（若全局可用）

## 常见问题

- **步骤模糊**：对智能体而言，"适当配置系统"毫无用处。提供确切命令、文件路径和配置值。
- **缺少失败处理**：每个可能失败的步骤都需要恢复指导。智能体无法即兴应对——需要明确说明备选方案。
- **范围过宽**：试图涵盖"设置整个开发环境"的技能应拆分为 3-5 个聚焦技能。一个技能 = 一个流程。
- **无法验证的检查项**："代码质量良好"无法验证。"Linter 通过，0 个警告"可以。
- **过期的交叉引用**：重命名或删除技能时，在所有 Related Skills 章节中搜索旧名称。
- **描述太长**：description 字段是智能体决定激活时读取的内容。保持在 1024 字符以内，前置关键信息。
- **避免在 NTFS 挂载路径上使用 `git mv`（WSL）**：在 `/mnt/` 路径上，目录的 `git mv` 可能创建权限损坏（`d?????????`）。改用 `mkdir -p` + 复制文件 + `git rm` 旧路径。参见[环境指南](../../guides/setting-up-your-environment.md)故障排除章节。

## 示例

结构良好的技能遵循以下质量检查清单：
1. 智能体仅凭描述就能决定是否使用
2. 流程可以无歧义地机械执行
3. 每个步骤都有可验证的结果
4. 失败模式有具体的恢复路径
5. 技能可以与相关技能组合使用

本库中的规模参考：
- 基础技能：约 80-120 行（例如 `write-vignette`、`configure-git-repository`）
- 中级技能：约 120-180 行（例如 `write-testthat-tests`、`manage-renv-dependencies`）
- 高级技能：约 180-250 行（例如 `submit-to-cran`、`setup-gxp-r-project`）
- 含扩展示例的技能：SKILL.md ≤500 行 + 大型配置的 `references/EXAMPLES.md`

## 相关技能

- `evolve-skill` - 演进和完善用此流程创建的技能
- `create-agent` - 创建智能体定义的并行流程
- `create-team` - 创建团队组合的并行流程
- `write-claude-md` - CLAUDE.md 可引用项目专属工作流的技能
- `configure-git-repository` - 技能应进行版本控制
- `commit-changes` - 提交新技能及其符号链接
- `security-audit-codebase` - 审查技能中是否意外包含密钥或凭据
