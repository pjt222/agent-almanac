---
name: manage-bibliography
description: >
  使用 BibTeX 和 R 的 RefManageR 包管理学术参考文献库：创建、验证和去重
  文献条目，按自定义规则排序，并以多种引用格式导出。
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: citations
  complexity: basic
  language: natural
  tags: citations, bibliography, bibtex, refmanager, reference-management
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# 管理参考文献库

使用 BibTeX 格式和 R 的 RefManageR 包创建、验证、去重和导出学术参考文献条目。

## 适用场景

- 为研究论文或书籍建立新的参考文献库
- 将多个 `.bib` 文件合并为单一规范化数据库
- 验证现有条目中缺失或格式不正确的字段
- 对参考文献按作者、年份或自定义方案排序后导出
- 从 DOI 或标题搜索中检索文献元数据

## 输入

- **必需**：`.bib` 文件路径或要添加的参考文献列表（DOI、标题或手动条目）
- **可选**：输出格式（BibTeX、BibLaTeX、YAML、data.frame）
- **可选**：排序方案（按年份、作者、引用键）
- **可选**：去重规则（精确匹配与模糊匹配阈值）
- **可选**：必填字段的验证规则

## 步骤

### 第 1 步：加载或创建参考文献库

建立工作中的参考文献集合：

1. **从文件加载**：使用 `RefManageR::ReadBib("references.bib")` 读取现有 `.bib` 文件。
2. **从 DOI 创建**：使用 `RefManageR::GetBibEntryWithDOI("10.xxxx/yyyy")` 从 DOI 获取元数据。
3. **从标题搜索**：使用 `RefManageR::ReadCrossRef(query = "论文标题")` 查询 CrossRef。
4. **手动条目**：使用 `RefManageR::BibEntry()` 以正确的条目类型（article、book、inproceedings 等）构造条目。
5. **合并多个来源**：使用 `c(bib1, bib2)` 将来自不同来源的 BibEntry 对象合并。

```r
library(RefManageR)
bib <- ReadBib("references.bib")
new_entry <- GetBibEntryWithDOI("10.1234/example.2024")
bib <- c(bib, new_entry)
```

**预期结果：** 一个包含所有目标参考文献的 BibEntry 对象，可供验证和操作。

**失败处理：** 如果 DOI 查找失败，请验证 DOI 格式并检查网络连接。如果 `.bib` 文件有解析错误，使用 `ReadBib(file, check = FALSE)` 识别有问题的条目。

### 第 2 步：验证和清理条目

确保每个条目包含其类型所需的所有字段：

1. **必填字段检查**：每种条目类型都有 BibTeX 规定的必填字段（例如 article 需要 author、title、journal、year、volume）。
2. **字段标准化**：确保一致的格式——作者姓名使用 `姓, 名` 格式，月份使用三字母缩写，页码使用 `--` 表示范围。
3. **引用键生成**：如果缺少引用键，按 `AuthorYear` 模式生成（例如 `Smith2024`），并用字母后缀处理重复。
4. **编码修正**：将 LaTeX 特殊字符（`{\"u}` 等）转换为 UTF-8 或保持一致性。

```r
# 检查缺失字段
for (i in seq_along(bib)) {
  entry <- bib[[i]]
  if (is.na(entry$author)) warning(paste("缺少 author:", entry$key))
  if (is.na(entry$year)) warning(paste("缺少 year:", entry$key))
}
```

**预期结果：** 所有条目通过其类型必填字段的验证，格式统一。

**失败处理：** 对于有无法自动解决的缺失字段的条目，生成需要手动补充的条目报告。

### 第 3 步：去重

移除重复条目，保留信息最完整的版本：

1. **精确匹配**：比较 DOI（如有）——共享 DOI 的条目是确定的重复项。
2. **模糊匹配**：比较标题（不区分大小写，去除标点）和作者/年份组合。
3. **合并策略**：保留字段更完整的条目。如果两个重复项有互补字段，合并它们。
4. **记录移除**：报告哪些条目被识别为重复项以及保留了哪个。

```r
# 基于标题的简单去重
titles <- tolower(gsub("[[:punct:]]", "", sapply(bib, `[[`, "title")))
dups <- duplicated(titles)
if (any(dups)) {
  message(paste("找到", sum(dups), "个重复项"))
  bib <- bib[!dups]
}
```

**预期结果：** 参考文献库不含重复条目，所有合并和移除操作都有记录。

**失败处理：** 如果模糊匹配产生误报（不同论文标题相似），提高相似度阈值或切换为仅精确 DOI 匹配。

### 第 4 步：排序和导出

按所需方案排列条目并写入输出文件：

1. **排序**：使用 `sort(bib, sorting = "nyt")` 按姓名-年份-标题排序，或使用 `"ynt"` 按年份优先排序。
2. **导出为 BibTeX**：使用 `WriteBib(bib, file = "output.bib")` 写入标准 `.bib` 文件。
3. **导出为数据框**：使用 `as.data.frame(bib)` 在 R 中进行表格操作。
4. **导出为格式化文本**：使用 `print(bib, .opts = list(style = "text"))` 输出可读的参考文献列表。

```r
bib_sorted <- sort(bib, sorting = "nyt")
WriteBib(bib_sorted, file = "references_clean.bib")
```

**预期结果：** 一个排序后、经过验证和去重的参考文献文件，可直接用于 LaTeX 或 R Markdown。

**失败处理：** 如果导出文件中出现编码问题，在写入前使用 `Encoding()` 和 `iconv()` 强制统一 UTF-8 编码。

## 验证清单

- [ ] 所有条目包含其 BibTeX 类型所需的必填字段
- [ ] 引用键在整个库中唯一
- [ ] 不存在重复条目（通过 DOI 或模糊标题匹配验证）
- [ ] 条目按请求的方案排序
- [ ] 输出文件可在 LaTeX 或 R Markdown 中无错误解析

## 常见问题

- **忽略条目类型差异**：`article` 和 `inproceedings` 的必填字段不同。验证前务必根据正确的类型检查字段。
- **过度激进的模糊去重**：标题相似但不同的论文可能被误标为重复项。始终在移除前人工审查模糊匹配结果。
- **混合编码**：`.bib` 文件可能混合使用 LaTeX 编码和 UTF-8，导致作者姓名中出现乱码。在合并之前先统一编码。
- **忽视 CrossRef 速率限制**：大量使用 `ReadCrossRef()` 进行批量查询可能触发速率限制。使用 `Sys.sleep()` 在请求之间添加延迟。

## 相关技能

- `format-citations` -- 使用 CSL 样式将参考文献格式化为引用
- `validate-references` -- 深入验证参考文献的准确性和可访问性
