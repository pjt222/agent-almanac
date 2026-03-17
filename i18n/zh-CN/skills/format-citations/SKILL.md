---
name: format-citations
description: >
  使用 CSL（引文样式语言）和 citeproc 处理器将参考文献格式化为引文：选择
  引文样式，解析 CSL 文件以理解格式规则，在文档中应用行内引文，生成格式化的
  参考文献列表，并处理特殊情况如多作者缩写和同年作者消歧。
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: citations
  complexity: intermediate
  language: natural
  tags: citations, csl, citeproc, formatting, reference-lists
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# 格式化引文

使用引文样式语言（CSL）和 citeproc 处理器选择引文样式、将行内引文应用于文档并生成格式化的参考文献列表。

## 适用场景

- 为期刊投稿按特定引文样式格式化参考文献
- 在不同引文样式之间转换（例如从 APA 到 IEEE）
- 理解和自定义 CSL 样式文件
- 排查引文格式问题（消歧、排序、标点）
- 在 R Markdown 或 Quarto 文档中配置引文处理

## 输入

- **必需**：包含参考文献的参考文献数据源（`.bib` 文件、CSL JSON 或 YAML）
- **必需**：目标引文样式（期刊名称、样式系列或 `.csl` 文件）
- **可选**：需要格式化的行内引文（引用键列表）
- **可选**：区域设置（用于日期格式和本地化术语如"等"/"et al."）
- **可选**：文档格式（R Markdown、Quarto、LaTeX、纯文本）

## 步骤

### 第 1 步：选择和获取 CSL 样式

确定正确的引文样式文件：

1. **按期刊名称查找**：在 CSL 样式仓库 (https://github.com/citation-style-language/styles) 中按期刊名称搜索。大多数主要期刊都有可用的 CSL 文件。
2. **样式系列**：识别所使用的通用样式系列：
   - **作者-日期**：(Smith, 2024) — APA、Chicago 作者-日期、Harvard
   - **数字编号**：[1] — IEEE、Vancouver、Nature
   - **脚注**：上标或括号编号带脚注 — Chicago 注释
   - **标签**：[Smi24] — 自定义标签，在学术出版中较少见
3. **下载 CSL 文件**：从仓库获取 `.csl` 文件或使用区域变体（例如用于脚注样式的 `locale-zh-CN.xml`）。
4. **验证样式**：检查 CSL 文件头部的 `<info>` 块中的标题、ISSN 和类别字段以确认是正确的样式。

```yaml
# R Markdown/Quarto 的 YAML 头部示例
bibliography: references.bib
csl: apa-7th-edition.csl
lang: zh-CN
```

**预期结果：** 与目标期刊或样式系列匹配的已验证 CSL 文件。

**失败处理：** 如果仓库中没有现成的 CSL 文件，找到最接近的样式（通常是同一出版商的另一期刊）并按第 2 步中的说明进行修改。

### 第 2 步：理解 CSL 样式结构

解析 CSL 文件以理解格式规则：

1. **引文元素**（`<citation>`）：控制行内引文的外观。关键属性：
   - `collapse`：多引文如何合并（例如 `[1-3]` 与 `[1, 2, 3]`）
   - `disambiguate-add-year-suffix`：在同一作者同年的情况下添加 a/b 后缀
   - `et-al-min` / `et-al-use-first`：何时缩写作者列表
2. **参考文献列表元素**（`<bibliography>`）：控制参考文献列表格式。关键属性：
   - `sort`：条目排序依据（作者、日期、引用顺序）
   - `layout`：每个条目中元素的排列方式
   - `second-field-align`：编号与文本的对齐方式
3. **宏**（`<macro>`）：可复用的格式块（例如"author"宏定义作者姓名在所有位置的格式化方式）。
4. **区域设置术语**：特定语言的词汇（"et al."、"编辑"/"editors"、"取自"/"retrieved from"），由 CSL locale 文件控制。

**预期结果：** 理解所选样式如何格式化行内引文和参考文献列表条目。

**失败处理：** 如果样式行为出乎意料，在 CSL 可视化编辑器 (https://editor.citationstyles.org/) 中用示例引文测试，诊断哪个宏或属性需要调整。

### 第 3 步：应用行内引文

在文档中插入正确格式化的引文：

1. **基本引文语法**（R Markdown/Quarto）：
   - 括号引文：`[@smith2024]` → (Smith, 2024)
   - 叙述性引文：`@smith2024` → Smith (2024)
   - 多作者：`[@smith2024; @jones2023]` → (Jones, 2023; Smith, 2024)
   - 带页码：`[@smith2024, p. 42]` → (Smith, 2024, p. 42)
   - 抑制作者：`[-@smith2024]` → (2024)
2. **特殊情况**：
   - 同一作者同年的多篇文章使用年份后缀消歧：(Smith, 2024a) vs. (Smith, 2024b)
   - 第一次引用使用完整作者列表（如果样式要求），后续引用缩写
   - 组织作者名称不应被缩写
3. **LaTeX/BibTeX 语法**：`\cite{smith2024}`、`\citep{smith2024}`、`\citet{smith2024}`，由 natbib 或 biblatex 处理。

**预期结果：** 所有行内引文格式正确，消歧后缀正确应用，多引文组正确排序。

**失败处理：** 如果引文显示为 `???` 或 `[?]`，引用键与 `.bib` 文件中的条目不匹配。验证引用键拼写和文件路径。

### 第 4 步：生成参考文献列表

在文档末尾生成格式化的参考文献列表：

1. **自动生成**：在 R Markdown/Quarto 中，参考文献列表在文档末尾自动生成。在 LaTeX 中使用 `\bibliography{references}` 和 `\bibliographystyle{style}`。
2. **排序**：验证条目排序是否与样式要求匹配（作者-日期样式按字母顺序，数字编号样式按引用顺序）。
3. **格式检查**：核实：
   - 作者姓名格式（名, 姓 vs 姓, 名首字母）
   - 标题大小写（句首大写 vs 标题大写）
   - 期刊名称（斜体 vs 正体，全称 vs 缩写）
   - 卷号/期号格式（加粗卷号、括号中的期号）
   - DOI/URL 格式和超链接
4. **引用位置标记**：如果参考文献列表需要出现在特定位置（不在文档末尾），在 Quarto/R Markdown 中使用 `<div id="refs"></div>`。

**预期结果：** 格式完整的参考文献列表，每个条目的所有元素符合目标样式。

**失败处理：** 如果格式偏离目标样式，将实际输出与样式指南逐项比较。常见问题：缺少 DOI（更新 `.bib` 条目）、标题大小写不正确（在 `.bib` 中用 `{}` 保护专有名词）、期刊缩写不正确（使用期刊缩写列表）。

### 第 5 步：处理特殊格式化场景

解决常见的引文格式化难题：

1. **同名同年消歧**：当两个条目有相同的作者和年份时，CSL 自动添加后缀（2024a、2024b）。验证后缀分配与参考文献列表排序一致。
2. **组织作者**：使用 `{{国家统计局}}` 在 BibTeX 中（双花括号）防止缩写。
3. **标题中的特殊字符**：在 BibTeX 中用 `{}` 保护大写字母和特殊字符：`{DNA}` 而非 `DNA`。
4. **多语言参考文献**：为非英语来源使用 `langid` 字段触发正确的区域设置术语。
5. **交叉引用**：使用 `crossref` 字段从合集/论文集条目继承字段到章节/论文条目。

**预期结果：** 所有特殊情况正确处理，无格式异常。

**失败处理：** 如果 citeproc 产生非预期输出，隔离问题条目，在 CSL 编辑器中测试，然后修改条目数据或 CSL 文件。

## 验证清单

- [ ] 选择的 CSL 样式与目标期刊/格式要求匹配
- [ ] 所有行内引文解析正确（无 `???` 或缺失引文）
- [ ] 同名同年的条目有正确的消歧后缀
- [ ] 参考文献列表按样式要求排序
- [ ] 作者姓名、标题大小写和期刊格式均符合样式规范
- [ ] DOI/URL 正确显示并可点击（如适用）
- [ ] 非英语参考文献使用正确的区域设置术语

## 常见问题

- **选择了错误的 CSL 变体**：许多样式有多个变体（例如 APA 第 6 版 vs 第 7 版、Chicago 作者-日期 vs 注释）。选错变体会导致整个参考文献列表格式不正确。务必验证特定的变体。
- **BibTeX 中的大小写保护**：BibTeX 在格式化时会将标题转为小写。如果标题包含必须保持大写的词（专有名词、首字母缩略词），请用 `{}` 保护：`{Bayesian}` 而非 `Bayesian`。
- **旧式 BibTeX vs. BibLaTeX**：它们的字段名不同（BibTeX 用 `journal`，BibLaTeX 用 `journaltitle`）。混用格式会导致字段缺失。
- **忽略区域设置设置**：法语引文需要法语术语（"et" 代替 "and"、"dans" 代替 "in"）。如果不设置正确的区域设置，所有术语都会使用英语。

## 相关技能

- `manage-bibliography` -- 创建和维护引文格式化使用的参考文献库
- `validate-references` -- 验证参考文献的准确性后再格式化
