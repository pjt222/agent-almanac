---
name: analyze-codebase-workflow
description: >
  使用 putior 的 put_auto() 引擎分析任意代码库以自动检测工作流、数据管道
  和文件依赖。生成将检测到的 I/O 模式映射到源文件的注解计划，支持 30+ 种
  语言和 902 种自动检测模式。适用于加入陌生代码库以了解数据流时、在没有
  现有注解的项目中开始 putior 集成时、在文档化之前审计项目数据管道时，或
  在运行 annotate-source-files 之前准备注解计划时。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: workflow-visualization
  complexity: intermediate
  language: multi
  tags: putior, workflow, analysis, auto-detect, polyglot, data-pipeline
  locale: zh-CN
  source_locale: en
  source_commit: 30b85b90
  translator: claude
  translation_date: "2026-03-17"
---

# 分析代码库工作流

调查任意仓库以自动检测数据流、文件 I/O 和脚本依赖，然后生成结构化的注解计划供手动完善。

## 适用场景

- 加入陌生代码库，需要了解数据流
- 在没有 PUT 注解的项目中开始 putior 集成
- 在文档化之前审计现有项目的数据管道
- 在运行 `annotate-source-files` 之前准备注解计划

## 输入

- **必需**：要分析的仓库或源代码目录路径
- **可选**：要聚焦的特定子目录（默认：整个仓库）
- **可选**：要包含或排除的语言（默认：所有检测到的）
- **可选**：检测范围：仅输入、仅输出或两者（默认：两者 + 依赖）

## 步骤

### 第 1 步：调查仓库结构

识别源文件及其语言，以了解 putior 可以分析什么。

```r
library(putior)

# List all supported languages and their extensions
list_supported_languages()
list_supported_languages(detection_only = TRUE)  # Only languages with auto-detection

# Get supported extensions
exts <- get_supported_extensions()
```

使用文件列表了解仓库组成：

```bash
# Count files by extension in the target directory
find /path/to/repo -type f | sed 's/.*\.//' | sort | uniq -c | sort -rn | head -20
```

**预期结果：** 仓库中存在的文件扩展名列表及计数。将这些与 `get_supported_extensions()` 对照以了解覆盖率。

**失败处理：** 如果仓库中没有匹配支持扩展名的文件，putior 无法自动检测工作流。考虑该语言是否受支持但文件使用了非标准扩展名。

### 第 2 步：检查语言检测覆盖率

对每种检测到的语言，验证自动检测模式的可用性。

```r
# Check which languages have auto-detection patterns (18 languages, 902 patterns)
detection_langs <- list_supported_languages(detection_only = TRUE)
cat("Languages with auto-detection:\n")
print(detection_langs)

# Get pattern counts for specific languages found in the repo
for (lang in c("r", "python", "javascript", "sql", "dockerfile", "makefile")) {
  patterns <- get_detection_patterns(lang)
  cat(sprintf("%s: %d input, %d output, %d dependency patterns\n",
    lang,
    length(patterns$input),
    length(patterns$output),
    length(patterns$dependency)
  ))
}
```

**预期结果：** 打印每种语言的模式计数。R 有 124 个模式，Python 159 个，JavaScript 71 个等。

**失败处理：** 如果某语言返回零模式，它支持手动注解但不支持自动检测。计划手动注解这些文件。

### 第 3 步：运行自动检测

在目标目录上执行 `put_auto()` 以发现工作流元素。

```r
# Full auto-detection
workflow <- put_auto("./src/",
  detect_inputs = TRUE,
  detect_outputs = TRUE,
  detect_dependencies = TRUE
)

# Exclude build scripts and test helpers from scanning
workflow <- put_auto("./src/",
  detect_inputs = TRUE,
  detect_outputs = TRUE,
  detect_dependencies = TRUE,
  exclude = c("build-", "test_helper")
)

# View detected workflow nodes
print(workflow)

# Check node count
cat(sprintf("Detected %d workflow nodes\n", nrow(workflow)))
```

对大型仓库，增量分析子目录：

```r
# Analyze specific subdirectories
etl_workflow <- put_auto("./src/etl/")
api_workflow <- put_auto("./src/api/")
```

**预期结果：** 一个数据框，包含 `id`、`label`、`input`、`output`、`source_file` 等列。每行代表一个检测到的工作流步骤。

**失败处理：** 如果结果为空，源文件可能不包含可识别的 I/O 模式。尝试启用调试日志：`workflow <- put_auto("./src/", log_level = "DEBUG")` 以查看哪些文件被扫描以及哪些模式匹配。

### 第 4 步：生成初始图表

可视化自动检测的工作流以评估覆盖率并识别差距。

```r
# Generate diagram from auto-detected workflow
cat(put_diagram(workflow, theme = "github"))

# With source file info for traceability
cat(put_diagram(workflow, show_source_info = TRUE))

# Save to file for review
writeLines(put_diagram(workflow, theme = "github"), "workflow-auto.md")
```

**预期结果：** 一个 Mermaid 流程图，展示由数据流边连接的检测节点。节点应标有有意义的函数/文件名。

**失败处理：** 如果图表显示断开的节点，自动检测找到了 I/O 模式但无法推断连接。这是正常的——连接是通过将输出文件名与输入文件名匹配来推导的。注解计划（下一步）将解决这些差距。

### 第 5 步：生成注解计划

生成结构化计划，记录发现了什么以及什么需要手动注解。

```r
# Generate annotation suggestions
put_generate("./src/", style = "single")

# For multiline style (more readable for complex workflows)
put_generate("./src/", style = "multiline")

# Copy suggestions to clipboard for easy pasting
put_generate("./src/", output = "clipboard")
```

用覆盖率评估记录计划：

```markdown
## Annotation Plan

### Auto-Detected (no manual work needed)
- `src/etl/extract.R` — 3 inputs, 2 outputs detected
- `src/etl/transform.py` — 1 input, 1 output detected

### Needs Manual Annotation
- `src/api/handler.js` — Language supported but no I/O patterns matched
- `src/config/setup.sh` — Only 12 shell patterns; complex logic missed

### Not Supported
- `src/legacy/process.f90` — Fortran not in detection languages

### Recommended Connections
- extract.R output `data.csv` → transform.py input `data.csv` (auto-linked)
- transform.py output `clean.parquet` → load.R input (needs annotation)
```

**预期结果：** 一个清晰的计划，将自动检测的文件与需要手动注解的文件分开，并为每个文件提供具体建议。

**失败处理：** 如果 `put_generate()` 不产生输出，确保目录路径正确且包含支持语言的源文件。

## 验证清单

- [ ] `put_auto()` 在目标目录上无错误执行
- [ ] 检测到的工作流至少有一个节点（除非仓库没有可识别的 I/O）
- [ ] `put_diagram()` 从自动检测的工作流生成有效的 Mermaid 代码
- [ ] `put_generate()` 为有检测到模式的文件生成注解建议
- [ ] 创建了带覆盖率评估的注解计划文档

## 常见问题

- **扫描范围过广**：在仓库根目录运行 `put_auto(".")` 可能包含 `node_modules/`、`.git/`、`venv/` 等。应针对特定源代码目录
- **期望完全覆盖**：自动检测找到文件 I/O 和库调用，而非业务逻辑。40-60% 的覆盖率是典型的；其余需要手动注解
- **忽略依赖**：`detect_dependencies = TRUE` 标志捕获将脚本链接在一起的 `source()`、`import`、`require()` 调用。禁用它会丢失跨文件连接
- **语言不匹配**：具有非标准扩展名的文件（如 `.R` vs `.r`、`.jsx` vs `.js`）可能不被检测。使用 `get_comment_prefix()` 检查扩展名是否被识别。注意像 `Dockerfile` 和 `Makefile` 这样的无扩展名文件通过精确文件名匹配支持
- **大型仓库**：对于 100+ 源文件的仓库，按模块/目录分析以保持图表可读

## 相关技能

- `install-putior` — 前置条件：必须先安装 putior
- `annotate-source-files` — 下一步：根据计划添加手动注解
- `generate-workflow-diagram` — 注解完成后生成最终图表
- `configure-putior-mcp` — 使用 MCP 工具进行交互式分析会话
