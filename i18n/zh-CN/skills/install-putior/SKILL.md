---
name: install-putior
description: >
  安装并配置 putior R 包用于工作流可视化。涵盖 CRAN 和 GitHub 安装、可选依赖项
  （mcptools、ellmer、shiny、shinyAce、logger、plumber2）及完整注释到图表流水线
  的验证。适用于首次安装 putior、为工作流可视化任务准备机器、当下游技能需要
  putior 已安装时，或在 R 版本升级或 renv 清空后恢复环境。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: workflow-visualization
  complexity: basic
  language: R
  tags: putior, install, workflow, mermaid, visualization, R
locale: zh-CN
source_locale: en
source_commit: ecb11b8b
translator: claude-opus-4-6
translation_date: 2026-03-16
---

# 安装 putior

安装 putior R 包及其可选依赖项，使注释到图表流水线准备就绪。

## 适用场景

- 首次在项目或环境中安装 putior
- 为工作流可视化任务准备机器
- 下游技能（analyze-codebase-workflow、generate-workflow-diagram）需要 putior 已安装
- 在 R 版本升级或 renv 清空后恢复环境

## 输入

- **必需**：可用的 R 安装（>= 4.1.0）
- **可选**：是否从 CRAN 安装（默认）还是 GitHub 开发版
- **可选**：要安装的可选依赖组：MCP（`mcptools`、`ellmer`）、交互式（`shiny`、`shinyAce`）、日志（`logger`）、ACP（`plumber2`）

## 步骤

### 第 1 步：验证 R 安装

确认 R 可用且满足最低版本要求。

```r
R.Version()$version.string
# Must be >= 4.1.0
```

```bash
# From WSL with Windows R
"/mnt/c/Program Files/R/R-4.5.2/bin/Rscript.exe" -e "cat(R.version.string)"
```

**预期结果：** 打印 R 版本字符串，>= 4.1.0。

**失败处理：** 安装或升级 R。Windows 上从 https://cran.r-project.org/bin/windows/base/ 下载。Linux 上使用 `sudo apt install r-base`。

### 第 2 步：安装 putior

从 CRAN（稳定版）或 GitHub（开发版）安装。

```r
# CRAN (recommended)
install.packages("putior")

# GitHub dev version (if latest features needed)
remotes::install_github("pjt222/putior")
```

**预期结果：** 包安装无错误。`library(putior)` 静默加载。

**失败处理：** 如果 CRAN 安装失败并提示"此版本 R 不可用"，使用 GitHub 版本。如果 GitHub 安装失败，检查 `remotes` 是否已安装：`install.packages("remotes")`。

### 第 3 步：安装可选依赖项

根据所需功能安装可选包。

```r
# MCP server integration (for AI assistant access)
remotes::install_github("posit-dev/mcptools")
install.packages("ellmer")

# Interactive sandbox
install.packages("shiny")
install.packages("shinyAce")

# Structured logging
install.packages("logger")

# ACP server (agent-to-agent communication)
install.packages("plumber2")
```

**预期结果：** 每个包安装无错误。

**失败处理：** 对于 `mcptools`，确保先安装了 `remotes`。对于 Linux 上的系统依赖错误，安装所需库（如 `sudo apt install libcurl4-openssl-dev` 用于 httr2 依赖）。

### 第 4 步：验证安装

运行基础流水线确认一切正常。

```r
library(putior)

# Check package version
packageVersion("putior")

# Verify core functions are available
stopifnot(
  is.function(put),
  is.function(put_auto),
  is.function(put_diagram),
  is.function(put_generate),
  is.function(put_merge),
  is.function(put_theme)
)

# Test basic pipeline with a temp file
tmp <- tempfile(fileext = ".R")
writeLines("# put id:'test', label:'Hello putior'", tmp)
cat(put_diagram(put(tmp)))
```

**预期结果：** 打印到控制台的 Mermaid 流程图代码，包含 `test` 和 `Hello putior`。

**失败处理：** 如果找不到 `put`，说明包未正确安装。使用 `install.packages("putior", dependencies = TRUE)` 重新安装。如果图表为空，验证临时文件是否已创建，且注释语法中在双引号内使用单引号。

> **重要：自定义调色板不能通过 MCP 使用。** `put_diagram` 的 `palette` 参数接受由 `put_theme()` 创建的 `putior_theme` R 对象。由于 MCP 通过 JSON 通信，无法跨 MCP 边界序列化 `putior_theme` 等 R 对象。通过 MCP 调用 `put_diagram` 时，请改用基于字符串的 `theme` 参数（例如 `theme = "viridis"`）。对于自定义调色板，请直接在 R 会话中调用 `put_theme()` 和 `put_diagram(palette = ...)`。

> **关键默认值**：所有扫描函数（`put()`、`put_auto()`、`put_generate()`、`put_merge()`）默认 `recursive = TRUE`，自动扫描子目录。这是相较于 0.2.0 之前版本（默认为 `FALSE`）的破坏性变更。所有扫描函数还接受 `exclude` 参数用于基于正则表达式的文件过滤（例如 `put("./src/", exclude = "test_")`）。

如果安装了可选的 `shiny` 包，请尝试交互式沙箱：

```r
putior::run_sandbox()
```

这将启动一个基于浏览器的编辑器，您可以在其中试验 PUT 注释语法并实时查看渲染的图表。

## 验证清单

- [ ] `library(putior)` 加载无错误
- [ ] `packageVersion("putior")` 返回有效版本
- [ ] 包含有效 PUT 注释的文件调用 `put()` 返回单行数据框
- [ ] `put_diagram()` 生成以 `flowchart` 开头的 Mermaid 代码
- [ ] 所有请求的可选依赖项加载无错误

## 常见问题

- **错误的引号嵌套**：PUT 注释在注释内使用单引号：`id:'name'`，而非 `id:"name"`（在某些上下文中与注释字符串分隔符冲突）。
- **vignette 缺少 Pandoc**：如果计划在本地构建 putior 的 vignette，确保在 `.Renviron` 中设置了 `RSTUDIO_PANDOC`。
- **renv 隔离**：如果项目使用 renv，必须在 renv 库中安装 putior。使用 `renv::install("putior")` 而非 `install.packages("putior")`。
- **GitHub 速率限制**：从 GitHub 安装 `mcptools` 时，没有 `GITHUB_PAT` 可能失败。通过 `usethis::create_github_token()` 设置一个。

## 相关技能

- `analyze-codebase-workflow` — 安装后对代码库进行调查的下一步
- `configure-putior-mcp` — 安装可选依赖后设置 MCP 服务器
- `manage-renv-dependencies` — 在 renv 环境中管理 putior
- `configure-mcp-server` — 通用 MCP 服务器配置
