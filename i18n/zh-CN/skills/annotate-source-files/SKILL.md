---
name: annotate-source-files
description: >
  使用正确的语言特定注释前缀向源文件添加 PUT 工作流注解。涵盖注解语法、
  通过 put_generate() 生成骨架、多行注解、.internal 变量和验证。支持 30+
  种语言的自动注释前缀检测。适用于分析代码库并有注解计划后、向新的或现有
  源文件添加工作流文档时，或记录数据管道、ETL 流程或多步骤计算时。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: workflow-visualization
  complexity: intermediate
  language: multi
  tags: putior, annotation, workflow, comment-syntax, polyglot, documentation
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# 注解源文件

向源文件添加 PUT 工作流注解，使 putior 能够提取结构化工作流数据并生成 Mermaid 图表。

## 适用场景

- 使用 `analyze-codebase-workflow` 分析代码库并有注解计划后
- 向新的或现有源文件添加工作流文档
- 用手动标签和连接丰富自动检测的工作流
- 记录数据管道、ETL 流程或多步骤计算

## 输入

- **必需**：需要注解的源文件
- **必需**：注解计划或对工作流步骤的了解
- **可选**：样式偏好：单行或多行（默认：单行）
- **可选**：是否使用 `put_generate()` 生成骨架（默认：是）

## 步骤

### 第 1 步：确定注释前缀

每种语言有特定的 PUT 注解注释前缀。使用 `get_comment_prefix()` 找到正确的前缀。

```r
library(putior)

# Common prefixes
get_comment_prefix("R")    # "#"
get_comment_prefix("py")   # "#"
get_comment_prefix("sql")  # "--"
get_comment_prefix("js")   # "//"
get_comment_prefix("ts")   # "//"
get_comment_prefix("go")   # "//"
get_comment_prefix("rs")   # "//"
get_comment_prefix("m")    # "%"
get_comment_prefix("lua")  # "--"
```

**预期结果：** 一个字符串如 `"#"`、`"--"`、`"//"`或 `"%"`。

> **行注释和块注释：** putior 检测行注释（`//`、`#`、`--`）和 C 风格块注释（`/* */`、`/** */`）中的注解。对于 JS/TS，`//` 和 `/* */` 块都会被扫描。Python 三引号字符串（`''' '''`）**不会**被检测——Python 注解请使用 `#`。

**失败处理：** 如果扩展名未被识别，文件语言可能不受支持。检查 `get_supported_extensions()` 获取完整列表。对于不支持的语言，使用 `#` 作为常规默认值。

### 第 2 步：生成注解骨架

使用 `put_generate()` 基于自动检测的 I/O 创建注解模板。

```r
# Print suggestions to console
put_generate("./src/etl/")

# Single-line style (default)
put_generate("./src/etl/", style = "single")

# Multiline style for complex annotations
put_generate("./src/etl/", style = "multiline")

# Copy to clipboard for pasting
put_generate("./src/etl/", output = "clipboard")
```

R 文件的示例输出：
```r
# put id:'extract_data', label:'Extract Customer Data', input:'customers.csv', output:'raw_data.internal'
```

SQL 的示例输出：
```sql
-- put id:'load_data', label:'Load Customer Table', output:'customers'
```

**预期结果：** 每个源文件一行或多行注解注释，预填了检测到的函数名和 I/O。

**失败处理：** 如果未生成建议，文件可能不包含可识别的 I/O 模式。根据你对代码的理解手动编写注解。

### 第 3 步：完善注解

编辑生成的骨架以添加准确的标签、连接和元数据。

**注解语法参考：**

```
<prefix> put id:'unique_id', label:'Human Readable Label', input:'file1.csv, file2.rds', output:'result.parquet, summary.internal'
```

字段：
- `id`（必需）：唯一标识符，用于节点连接
- `label`（必需）：图表中显示的人类可读描述
- `input`：逗号分隔的输入文件或变量列表
- `output`：逗号分隔的输出文件或变量列表
- `.internal` 扩展名：标记内存中的变量（不在脚本间持久化）
- `node_type`：控制 Mermaid 节点形状和类样式。值：
  - `"input"` — 体育场形状 `([...])` 用于数据源和配置
  - `"output"` — 子程序形状 `[[...]]` 用于生成的工件
  - `"process"` — 矩形 `[...]` 用于处理步骤（默认）
  - `"decision"` — 菱形 `{...}` 用于条件逻辑
  - `"start"` / `"end"` — 体育场形状 `([...])` 用于入口/终端节点

带 `node_type` 的示例：
```r
# put id:'config', label:'Load Config', node_type:'input', output:'config.internal'
# put id:'transform', label:'Apply Rules', node_type:'process', input:'config.internal', output:'result.rds'
# put id:'report', label:'Generate Report', node_type:'output', input:'result.rds'
```

**多行语法**（用于复杂注解）：
```r
# put id:'complex_step', \
#   label:'Multi-line Label', \
#   input:'data.csv, config.yaml', \
#   output:'result.parquet'
```

**跨文件数据流**（通过基于文件的 I/O 连接脚本）：
```r
# Script 1: extract.R
# put id:'extract', label:'Extract Data', output:'raw_data.internal, raw_data.rds'
data <- read.csv("source.csv")
saveRDS(data, "raw_data.rds")

# Script 2: transform.R
# put id:'transform', label:'Transform Data', input:'raw_data.rds', output:'clean_data.parquet'
data <- readRDS("raw_data.rds")
arrow::write_parquet(clean, "clean_data.parquet")
```

**预期结果：** 注解已完善，具有准确的 ID、标签和反映实际数据流的 I/O 字段。

**失败处理：** 如果不确定 I/O，对内存中间值使用 `.internal` 扩展名，对持久化数据使用显式文件名。

### 第 4 步：将注解插入文件

将注解放在每个文件的顶部或相关代码块的正上方。

**放置约定：**
1. **文件级注解**：放在文件顶部，任何 shebang 行或文件头注释之后
2. **块级注解**：放在它描述的代码块正上方
3. **每个文件多个注解**：用于具有不同工作流阶段的文件

R 文件中的放置示例：
```r
#!/usr/bin/env Rscript
# ETL Extract Script
#
# put id:'read_source', label:'Read Source Data', input:'raw_data.csv', output:'df.internal'

df <- read.csv("raw_data.csv")

# put id:'clean_data', label:'Clean and Validate', input:'df.internal', output:'clean.rds'

df_clean <- df[complete.cases(df), ]
saveRDS(df_clean, "clean.rds")
```

使用 Edit 工具将注解插入现有文件而不干扰周围代码。

**预期结果：** 注解插入到每个源文件的适当位置。

**失败处理：** 如果注解破坏了编辑器中的语法高亮，确保注释前缀对该语言正确。PUT 注解是标准注释，不应影响代码执行。

### 第 5 步：验证注解

运行 putior 的验证来检查注解语法和连通性。

```r
# Scan annotated files
workflow <- put("./src/", validate = TRUE)

# Check for validation issues
print(workflow)
cat(sprintf("Total nodes: %d\n", nrow(workflow)))

# Verify connections by checking input/output overlap
inputs <- unlist(strsplit(workflow$input, ",\\s*"))
outputs <- unlist(strsplit(workflow$output, ",\\s*"))
connected <- intersect(inputs, outputs)
cat(sprintf("Connected data flows: %d\n", length(connected)))

# Generate diagram to visually inspect
cat(put_diagram(workflow, theme = "github", show_source_info = TRUE))

# Merge with auto-detected for maximum coverage
merged <- put_merge("./src/", merge_strategy = "supplement")
cat(put_diagram(merged, theme = "github"))
```

**预期结果：** 所有注解无错误解析。图表显示连通的工作流。`put_merge()` 从自动检测中填补空白。

**失败处理：** 常见验证问题：
- 缺少闭合引号：`id:'name` -> `id:'name'`
- 内部使用双引号：`id:"name"` -> `id:'name'`
- 跨文件的重复 ID：每个 `id` 在整个扫描目录中必须唯一
- 续行符在错误行上：`\` 必须是换行前的最后一个字符

## 验证清单

- [ ] 每个注解文件有语法有效的 PUT 注解
- [ ] `put("./src/")` 返回预期节点数的数据框
- [ ] 扫描目录中无重复 `id` 值
- [ ] `put_diagram()` 产生连通的流程图（不是全部孤立节点）
- [ ] 多行注解（如使用）使用反斜杠续行正确解析
- [ ] `.internal` 变量仅作为输出出现，不作为跨文件输入

## 常见问题

- **引号嵌套错误**：PUT 注解使用单引号：`id:'name'`。当注解在字符串上下文中时双引号会导致解析问题
- **重复 ID**：每个 `id` 在扫描范围内必须全局唯一。使用命名约定如 `<script>_<step>`（例如 `extract_read`、`transform_clean`）
- **.internal 作为跨文件输入**：`.internal` 变量仅在脚本执行期间存在。要在脚本间传递数据，使用持久化文件格式（`.rds`、`.csv`、`.parquet`）作为一个脚本的输出和下一个脚本的输入
- **缺失连接**：如果图表显示断开的节点，检查一个注解中的输出文件名是否与另一个注解中的输入文件名完全匹配（包括扩展名）
- **错误的注释前缀**：在 SQL 文件中使用 `#` 或在 Python 中使用 `//` 会导致注解被当作代码而非注释处理。始终使用 `get_comment_prefix()` 验证
- **忘记多行续行**：使用多行注解时，每个续行必须以 `\` 结尾，下一行必须以注释前缀开头
- **Python 三引号字符串**：putior 不扫描 Python 三引号字符串（`''' '''`、`""" """`）。Python PUT 注解始终使用 `#`
- **元管道注解**：如果你注解了一个也扫描注解的构建脚本（例如调用 `put()` 和 `put_diagram()` 的脚本），脚本自身的注解将出现在生成的图表中。要么将文件从扫描中排除（见 `generate-workflow-diagram` 常见问题），要么避免在构建脚本本身中放置 PUT 注解

## 相关技能

- `analyze-codebase-workflow` — 前置条件：生成本技能遵循的注解计划
- `generate-workflow-diagram` — 下一步：从注解生成最终图表
- `install-putior` — 注解前必须安装 putior
- `configure-putior-mcp` — MCP 工具提供交互式注解辅助
