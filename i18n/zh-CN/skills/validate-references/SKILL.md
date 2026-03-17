---
name: validate-references
description: >
  验证学术参考文献的准确性和可访问性：检查 BibTeX 条目必填字段的完整性，
  通过 CrossRef 和 DOI 解析验证 DOI，测试 URL 可访问性，交叉检查元数据
  一致性，并生成包含错误分类和修复建议的验证报告。
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: citations
  complexity: intermediate
  language: natural
  tags: citations, validation, doi, bibtex, reference-checking
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# 验证参考文献

验证学术参考文献的完整性、准确性和可访问性，包括 BibTeX 字段验证、DOI 解析、URL 检查和元数据交叉验证。

## 适用场景

- 投稿前验证参考文献列表
- 审计继承的或协作编辑的参考文献库
- 识别断开的 DOI 或不可访问的 URL
- 交叉检查参考文献元数据与外部数据库的一致性
- 生成参考文献质量报告供团队审查

## 输入

- **必需**：包含待验证参考文献的 `.bib` 文件或 BibEntry 对象
- **可选**：验证级别（基本=仅字段检查，标准=字段+DOI，完整=字段+DOI+URL+元数据）
- **可选**：目标引文样式（影响哪些字段被视为必需）
- **可选**：自定义验证规则（例如"所有条目必须有 DOI"）
- **可选**：报告格式（控制台、markdown、CSV）

## 步骤

### 第 1 步：加载和解析参考文献

将参考文献数据读入结构化格式：

1. **解析 BibTeX**：使用 `RefManageR::ReadBib()` 并设置 `check = FALSE` 以加载包含错误的文件。
2. **记录解析警告**：解析过程中发出的任何警告都表示语法问题（不匹配的花括号、无效的字段名、编码错误）。
3. **条目计数**：记录加载的条目总数及各类型的分布（article、book、inproceedings 等）。
4. **引用键检查**：验证所有引用键唯一且不包含特殊字符（空格、逗号、#）。

```r
library(RefManageR)
bib <- ReadBib("references.bib", check = FALSE)
message(paste("已加载", length(bib), "个条目"))
table(sapply(bib, function(x) x$bibtype))
```

**预期结果：** 所有条目成功加载，解析警告已记录，条目类型分布已确认。

**失败处理：** 如果解析完全失败，`.bib` 文件存在严重语法错误。使用文本编辑器检查不匹配的花括号或无效的 `@type` 声明。使用 `biber --validate-control references.bib` 获取详细的语法错误定位。

### 第 2 步：验证必填字段

检查每个条目是否包含其 BibTeX 类型要求的所有字段：

1. **类型特定的必填字段**：

| 条目类型 | 必填字段 |
|---------|---------|
| article | author, title, journal, year, volume |
| book | author/editor, title, publisher, year |
| inproceedings | author, title, booktitle, year |
| incollection | author, title, booktitle, publisher, year |
| phdthesis | author, title, school, year |
| techreport | author, title, institution, year |
| misc | author, title, year (最低限度) |

2. **字段质量检查**：
   - `author`：不为空，格式合理（包含逗号或 "and"）
   - `year`：4 位数字，合理范围（1800-当前年份+1）
   - `title`：不为空，不全是大写（可能表示 BibTeX 大小写未受保护）
   - `doi`：如存在，匹配模式 `10.XXXX/...`
   - `url`：如存在，以 `http://` 或 `https://` 开头
3. **分类错误**：将每个问题分类为 ERROR（必填字段缺失）、WARNING（推荐字段缺失或格式可疑）或 INFO（可选字段建议）。

**预期结果：** 完整的逐条目验证报告，每个问题带有严重级别。

**失败处理：** 如果大量条目存在系统性问题（例如所有条目缺少 volume），可能是源数据或导入过程的问题，而非个别条目错误。

### 第 3 步：验证 DOI 和 URL

检查数字标识符和链接的可访问性：

1. **DOI 解析**：对每个 DOI，向 `https://doi.org/<DOI>` 发送 HEAD 请求。HTTP 200/302 表示有效；404 表示无效或格式错误的 DOI。
2. **DOI 元数据检索**：使用 CrossRef API (`https://api.crossref.org/works/<DOI>`) 获取规范元数据，与 `.bib` 条目比较。
3. **URL 可访问性**：对每个 URL 发送 HEAD 请求。记录 HTTP 状态码。标记 404（未找到）、403（禁止访问）和超时。
4. **速率限制**：在 API 请求之间添加延迟（CrossRef 建议每秒不超过 50 个请求，无身份认证时更少）。对大型参考文献库使用批处理。

```r
# DOI 验证示例
check_doi <- function(doi) {
  url <- paste0("https://doi.org/", doi)
  tryCatch({
    response <- httr::HEAD(url, httr::timeout(10))
    list(valid = httr::status_code(response) %in% c(200, 301, 302),
         status = httr::status_code(response))
  }, error = function(e) list(valid = FALSE, status = "timeout"))
}
```

**预期结果：** 每个 DOI 和 URL 经过可访问性验证。无效标识符被标记并附有具体的 HTTP 状态码。

**失败处理：** 如果 DOI 解析因网络问题失败，使用退避策略重试。某些 DOI 可能因出版商服务器临时不可用而暂时无法解析——标记这些为"未确认"而非"无效"。

### 第 4 步：元数据交叉验证

将本地元数据与权威外部数据源比较：

1. **标题匹配**：将 `.bib` 条目标题与 CrossRef 返回的标题比较（标准化后的模糊匹配）。
2. **作者匹配**：比较作者列表（考虑姓名变体、名首字母 vs 全名）。
3. **年份匹配**：验证出版年份一致。
4. **期刊名称**：将 `.bib` 中的期刊名称与 CrossRef 的规范名称比较。标记缩写与全称不一致。
5. **不匹配分类**：
   - CRITICAL：DOI 指向的论文标题完全不同（可能是错误的 DOI）
   - WARNING：元数据存在细微差异（拼写变体、年份差一年）
   - INFO：格式差异（大小写、标点）

**预期结果：** 每个有 DOI 的条目与其权威元数据进行了交叉验证。不匹配项被分类并报告。

**失败处理：** 如果 CrossRef 元数据本身有错误（偶有发生），以出版商网站上的条目为准进行人工验证。

### 第 5 步：生成验证报告

编制所有发现的综合报告：

1. **摘要统计**：
   - 验证的条目总数
   - 各严重级别的问题数（ERROR、WARNING、INFO）
   - DOI 验证率（通过/失败/缺失）
   - URL 可访问率
2. **逐条目详情**：列出每个条目的所有问题及引用键、严重级别和建议修复。
3. **系统性问题**：识别影响多个条目的模式（例如"15 个条目缺少 DOI"——建议通过标题搜索批量补充）。
4. **修复建议**：对每类问题提供可操作的建议。
5. **输出格式**：生成报告为 markdown（人工审阅）、CSV（程序化处理）或控制台输出（快速检查）。

```r
# 报告输出示例
report <- data.frame(
  key = character(),
  severity = character(),
  field = character(),
  message = character(),
  stringsAsFactors = FALSE
)
# ... 填充结果 ...
write.csv(report, "validation_report.csv", row.names = FALSE)
```

**预期结果：** 一份完整的验证报告，包含可操作的发现和修复建议，便于审查和后续处理。

**失败处理：** 如果报告过于庞大（数百个问题），按严重级别优先排序：先修复所有 ERROR，再处理 WARNING。INFO 级别的问题可以推迟。

## 验证清单

- [ ] 所有条目成功解析，解析警告已记录
- [ ] 每种 BibTeX 类型的必填字段均已检查
- [ ] DOI 已通过解析验证（如存在）
- [ ] URL 已通过可访问性测试（如存在）
- [ ] 元数据已与 CrossRef 交叉验证（如 DOI 可用）
- [ ] 问题按严重级别分类（ERROR/WARNING/INFO）
- [ ] 验证报告已生成并包含修复建议
- [ ] 系统性问题已识别并突出显示

## 常见问题

- **信任 DOI 存在即正确**：DOI 可能存在但指向错误的论文（复制粘贴错误）。务必将 DOI 解析出的标题与 `.bib` 条目中的标题进行比较。
- **忽略 CrossRef 速率限制**：不加限制地发送 API 请求会导致 IP 被封禁。始终添加 `Sys.sleep()` 延迟并使用 CrossRef 的 `mailto` 参数获取更高速率限制的"礼貌池"。
- **将所有问题等同视之**：缺少 DOI（INFO）与错误的 DOI（ERROR）完全不同。严重级别分类对于优先处理至关重要。
- **对 URL 验证过于严格**：某些合法 URL 会因为需要认证、地理限制或服务器负载而返回 403 或超时。将这些标记为"未确认"而非"无效"。
- **不检查年份合理性**：年份 `0024` 或 `2204` 是明显的录入错误，但纯字段存在性检查不会捕获它们。始终进行范围验证。

## 相关技能

- `manage-bibliography` -- 在验证前创建和清理参考文献库
- `format-citations` -- 将经过验证的参考文献格式化为引文
