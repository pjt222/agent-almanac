---
title: "Content Styleguide"
description: "Canonical markdown formatting conventions for skills, agents, teams, and guides — tables, code fences, headings, lists, and links"
category: reference
agents: [skill-reviewer]
teams: []
skills: [create-skill, review-skill-format]
locale: zh-CN
source_locale: en
source_commit: d82938a4
translator: "Claude + human review"
translation_date: "2026-06-04"
---

# 内容风格指南

本指南定义了仓库中每个内容文件的规范 **markdown 格式** 约定——技能（`skills/*/SKILL.md`）、智能体（`agents/*.md`）、团队（`teams/*.md`）和指南（`guides/*.md`）。四个 `_template.md` 文件涵盖 *结构*（必需章节、frontmatter 字段）；本指南涵盖 *格式*（这些章节内部的 markdown 如何书写）。

下面的规则将 **现有的主流风格** 编纂成文，使整个语料库读起来一致，并在所有被消费的地方都能干净地呈现——GitHub、静态站点以及 CLI 页面渲染器。它们并非理想化的目标：当某个约定已经近乎普遍采用时（带前导竖线的表格、`-` 项目符号），本指南记录它，而不是另造一个新约定。

## 何时使用本指南

- 编写新的技能、智能体、团队或指南，并希望第一次就把格式写对
- 审查内容 PR，需要一份客观的格式参考
- 编辑现有文件，不确定该用哪种表格或代码围栏风格
- 编写或扩展用于验证内容格式的 CI 检查
- 解决关于"哪种风格才正确"的分歧

## 前置条件

- 熟悉 [GitHub-Flavored Markdown](https://github.github.com/gfm/)（GFM）
- 你正在编写的内容类型所对应的 `_template.md`（结构优先；本指南细化格式）
- 对于技能：[create-skill](../skills/create-skill/SKILL.md) 和 [creating-skills](creating-skills.md)
- 对于智能体和团队：[agent-best-practices](agent-best-practices.md) 和 [creating-agents-and-teams](creating-agents-and-teams.md)

## 工作流概览

在编写过程中就应用这些约定，而不是事后再清理。CI 检查（`validate-content-style.yml`）会在内容 PR 上强制执行那些可机械检测的规则——参见 [强制执行](#强制执行)。结构（frontmatter、必需章节）由模板和类型专属的验证器负责；本指南负责的是处于该结构内部的 markdown 格式。

## 表格

使用 GFM 竖线表格。三条规则，语料库中的大多数文件都已遵循：

1. **紧凑的分隔行**——每列恰好三个连字符：`|---|---|---|`。**不要** 把连字符补齐到与列宽相匹配。渲染输出会忽略连字符的数量，所以与列宽匹配的"装饰性"分隔行只会让源文件臃肿并制造嘈杂的 diff。
2. **始终使用前导和尾随竖线**——`| a | b |`，绝不写成 `a | b`。两者在 GFM 中都合法；带前导竖线的形式是语料库标准。
3. **仅在有意义时使用对齐标记**——只有当对齐承载含义时（例如对数值列右对齐）才添加 `:---`（左对齐）、`---:`（右对齐）或 `:---:`（居中）。否则省略它们。

正确做法：

```markdown
| Input | Type | Description |
|---|---|---|
| Layout spec | Configuration | Canvas dimensions and margins |
| Style params | CSS | Colors, fonts, stroke widths |
```

错误做法：

```markdown
| Input        | Type          | Description                    |
|--------------|---------------|--------------------------------|
| Layout spec  | Configuration | Canvas dimensions and margins  |
Style params | CSS | Colors, fonts, stroke widths
```

"错误做法"示例展示了两种反模式：与列宽匹配的装饰性连字符（第 2 行）以及缺失的前导竖线（第 4 行）。

## 代码围栏

- **始终在起始围栏上标注语言**：`bash`、`r`、`yaml`、`json`、`python`、`markdown`、`text`、`console`、`diff`。当没有合适的语言时使用 `text`（对于带提示符/输出的 shell 会话则用 `console`）——绝不要让标记为空。
- **使用围栏代码块**（` ``` `），而非缩进式（4 个空格）代码块。围栏代码块带有语言标记且无歧义。
- **R 代码** 使用包限定调用——`devtools::check()`，而非 `library(devtools); check()`——遵循全仓库统一的 R 约定。本指南不重述 R 规则；参见 [creating-skills](creating-skills.md)。
- 若要在示例 *内部* 展示一个围栏代码块，请用四个反引号的围栏包裹该示例，使内部的三反引号按字面渲染。

正确做法：

```bash
npm run update-readmes
```

错误做法（未标注语言——会失去语法高亮且更难浏览）：

````markdown
```
npm run update-readmes
```
````

## 标题

- **ATX 风格**（`#`），井号后跟单个空格：`## Section`，绝不写成 `##Section` 或 Setext 下划线式。
- **每个文件一个 `#`（H1）**，保留给文档标题。其余所有标题都是 H2 或更深层级。
- **不跳级**——H2 之后是 H2 或 H3，绝不直接跳到 H4。
- **结尾不带井号**——`## Section`，而非 `## Section ##`。
- 与相关 `_template.md` 规定的章节名保持一致；本指南管辖其 *形式*，而非其 *名称*。

## 列表、强调与行内代码

- **无序列表使用 `-`**（连字符），而非 `*` 或 `+`。连字符以巨大优势成为语料库标准。
- **有序列表使用 `1.`** 并带句点。对于流程步骤，遵循模板的编号步骤模式。
- **嵌套列表项在父项下缩进两个空格。**
- **粗体** 为 `**text**`；*斜体* 为 `*text*`。不要用 `__` 或 `_` 来强调。
- **行内代码** 对文件路径、命令、标识符和字段名使用单反引号：`skills/_registry.yml`、`total_skills`、`devtools::check()`。
- 技能流程步骤保留由技能模板定义的 `**Expected:**` / `**On failure:**` 块约定——本指南不更改它。

## 链接

- **行内链接** 是默认形式：`[label](path)`。只有当同一目标在一个文档中被多次复用时，参考式链接才可接受。
- **使用相对路径** 进行仓库内链接，以文件自身所在位置为锚点：
  - 技能 → 技能：`[name](../other-skill/SKILL.md)`
  - 指南 → 智能体：`[name](../agents/name.md)`
  - 指南 → 技能：`[name](../skills/name/SKILL.md)`
  - 指南 → 指南：`[name](other-guide.md)`
- **链接前先验证目标存在**。失效的相对链接是一种内容缺陷。
- 使用描述性的链接文本，而非裸 URL 或"点击这里"。

## 引用块与提示框

- 谨慎使用 `>` 引用块——仅用于真正的引文或简短的旁注。
- 优先使用 **粗体行内标签** 来强调（`**Note:**`、`**Warning:**`），而非繁重的提示框语法，以与现有用法保持一致。

## 行与文件约定

- **行结束符为 LF**（`\n`）。仓库的 `.gitattributes` 强制规定 `*.md text eol=lf`；git 的 clean 过滤器会在每次 `git add` 时将 CRLF 规范化为 LF。以 CRLF 编写会在首次提交时产生近乎整个文件的 diff（即"CRLF→LF 规范化"diff）——请以 LF 编写以避免它。
- **每个文件以单个尾随换行符结束。**
- **Frontmatter** 是由 `---` 界定的 YAML，按模板规定的顺序保持。不要重新排序或删除必需字段。
- markdown 正文中 **不使用硬制表符**；请使用空格。
- 在自然的句子边界处软换行。**没有固定的列数限制，也没有每行一句的规则**——不要仅仅为了行长而重新折行已有的段落。

## 强制执行

`validate-content-style.yml` 工作流会在触及 `skills/`、`agents/`、`teams/`、`guides/` 或 `i18n/` 的 PR 上运行。它有意按每条规则能从 diff 中被可靠检测的程度进行划分：

| Rule | Mode | Why |
|---|---|---|
| 装饰性连字符分隔行 | **阻断**（针对新增行） | 分隔行具有自我标识性且与上下文无关——按行局部检测是可靠的 |
| 未标注语言的代码围栏 | **警告** | 仅凭单行 diff 无法区分起始围栏与结束围栏；可靠的检测需要整个文件的围栏状态 |
| 缺失前导竖线 | 已记录，不强制执行 | 整个语料库已 100% 遵循 |

阻断检查仅评估 **新增行**，因此编辑遗留文件并不会强迫你规范化其既有的违规之处。整个语料库的规范化——重写所有现有表格并为约 280 个文件添加语言标记——单独追踪；当它落地时，未标注围栏检查将从警告升级为阻断，并配以整个文件的围栏状态解析。

## 故障排除

| Problem | Cause | Solution |
|---|---|---|
| 一行编辑却产生巨大 diff | CRLF blob 在 `git add` 时被规范化为 LF | 属预期；在 PR 中加脚注说明。请以 LF 编写 |
| CI 标记了你并未改动的表格 | 新增行恰好是一个装饰性分隔行 | 将该分隔行转换为 `\|---\|---\|`；只有新增行会被检查 |
| 围栏示例被渲染成单个代码块 | 内部的 ` ``` ` 未转义 | 用四个反引号的围栏包裹该示例 |
| 失效的相对链接 | `../` 段数不对 | 从文件自身所在目录开始数段数 |

## 相关资源

- [create-skill](../skills/create-skill/SKILL.md) -- 编写技能（结构 + 流程）
- [review-skill-format](../skills/review-skill-format/SKILL.md) -- 验证技能格式
- [creating-skills](creating-skills.md) -- 技能编写工作流与 R 约定
- [creating-agents-and-teams](creating-agents-and-teams.md) -- 智能体和团队编写工作流
- [agent-best-practices](agent-best-practices.md) -- 智能体设计与质量指南
- [skill-reviewer](../agents/skill-reviewer.md) -- 审查内容格式的智能体
