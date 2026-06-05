---
name: create-r-package
description: >
  搭建完整的 R 包结构，包括 DESCRIPTION、NAMESPACE、testthat、roxygen2、
  renv、Git、GitHub Actions CI 以及开发配置文件（.Rprofile、.Renviron.example、
  CLAUDE.md）。遵循 usethis 约定和 tidyverse 风格。适用于从零开始创建新的
  R 包、将零散的 R 脚本整理为结构化包，或为协作开发搭建包骨架。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: r-packages
  complexity: basic
  language: R
  tags: r, package, usethis, scaffold, setup
  locale: zh-CN
  source_locale: en
  source_commit: 6a868d56
  translator: Claude Opus 4.6
  translation_date: "2026-03-13"
---

# 创建 R 包

使用现代工具链和最佳实践搭建配置完善的 R 包。

## 适用场景

- 从零开始创建新的 R 包
- 将零散的 R 脚本整理为包
- 为协作开发搭建包骨架

## 输入

- **必需**：包名（小写，除 `.` 外不含特殊字符）
- **必需**：包用途的一句话描述
- **可选**：许可证类型（默认：MIT）
- **可选**：作者信息（姓名、邮箱、ORCID）
- **可选**：是否初始化 renv（默认：是）

## 步骤

### 第 1 步：创建包骨架

```r
usethis::create_package("packagename")
setwd("packagename")
```

**预期结果：** 创建包含 `DESCRIPTION`、`NAMESPACE`、`R/` 和 `man/` 子目录的目录。

**失败处理：** 确保已安装 usethis（`install.packages("usethis")`）。检查目标目录是否已存在。

### 第 2 步：配置 DESCRIPTION

编辑 `DESCRIPTION` 填入准确的元数据：

```
Package: packagename
Title: What the Package Does (Title Case)
Version: 0.1.0
Authors@R:
    person("First", "Last", , "email@example.com", role = c("aut", "cre"),
           comment = c(ORCID = "0000-0000-0000-0000"))
Description: One paragraph describing what the package does. Must be more
    than one sentence. Avoid starting with "This package".
License: MIT + file LICENSE
Encoding: UTF-8
Roxygen: list(markdown = TRUE)
RoxygenNote: 7.3.2
URL: https://github.com/username/packagename
BugReports: https://github.com/username/packagename/issues
```

**预期结果：** 有效的 DESCRIPTION 文件，通过 `R CMD check` 且无元数据警告。

**失败处理：** 如果 `R CMD check` 对 DESCRIPTION 字段发出警告，请确认 `Title` 使用标题大小写、`Description` 超过一句话、`Authors@R` 使用有效的 `person()` 语法。

### 第 3 步：搭建基础设施

```r
usethis::use_mit_license()
usethis::use_readme_md()
usethis::use_news_md()
usethis::use_testthat(edition = 3)
usethis::use_git()
usethis::use_github_action("check-standard")
```

**预期结果：** 创建 LICENSE、README.md、NEWS.md、`tests/` 目录、初始化 `.git/`，以及创建 `.github/workflows/`。

**失败处理：** 如果任何 `usethis::use_*()` 函数失败，安装缺失的依赖后重新运行。如果 `.git/` 已存在，`use_git()` 将跳过初始化。

### 第 4 步：创建开发配置

创建 `.Rprofile`：

```r
if (file.exists("renv/activate.R")) {
  source("renv/activate.R")
}

if (requireNamespace("mcptools", quietly = TRUE)) {
  mcptools::mcp_session()
}
```

创建 `.Renviron.example`：

```
RSTUDIO_PANDOC="C:/Program Files/RStudio/resources/app/bin/quarto/bin/tools"
# GITHUB_PAT=your_github_token_here
```

创建 `.Rbuildignore` 条目：

```
^\.Rprofile$
^\.Renviron$
^\.Renviron\.example$
^renv$
^renv\.lock$
^CLAUDE\.md$
^\.github$
^.*\.Rproj$
```

**预期结果：** 创建 `.Rprofile`、`.Renviron.example` 和 `.Rbuildignore`。开发文件被排除在构建包之外。

**失败处理：** 如果 `.Rprofile` 在启动时报错，检查语法问题。确保 `requireNamespace()` 保护在可选包缺失时不会导致失败。

### 第 5 步：初始化 renv

```r
renv::init()
```

**预期结果：** 创建 `renv/` 目录和 `renv.lock`。项目本地库已激活。

**失败处理：** 使用 `install.packages("renv")` 安装 renv。如果 renv 在初始化时卡住，检查网络连接或设置 `options(timeout = 600)`。

### 第 6 步：创建包文档文件

创建 `R/packagename-package.R`：

```r
#' @keywords internal
"_PACKAGE"

## usethis namespace: start
## usethis namespace: end
NULL
```

**预期结果：** `R/packagename-package.R` 存在并包含 `"_PACKAGE"` 标记。运行 `devtools::document()` 可生成包级帮助文档。

**失败处理：** 确保文件名符合 `R/<packagename>-package.R` 模式。`"_PACKAGE"` 字符串必须是独立表达式，不能放在函数内部。

### 第 7 步：创建 CLAUDE.md

在项目根目录创建 `CLAUDE.md`，包含面向 AI 助手的项目专属说明。

**预期结果：** 项目根目录存在 `CLAUDE.md`，包含项目专属的编辑约定、构建命令和架构说明。

**失败处理：** 如不确定应包含哪些内容，先写上包名、一句话描述、常用开发命令（`devtools::check()`、`devtools::test()`）以及任何不明显的约定。

## 验证清单

- [ ] `devtools::check()` 返回 0 错误、0 警告
- [ ] 包结构符合预期布局
- [ ] `.Rprofile` 加载无错误
- [ ] `renv::status()` 无异常
- [ ] Git 仓库已初始化并配置了合适的 `.gitignore`
- [ ] GitHub Actions 工作流文件存在

## 常见问题

- **包名冲突**：提交名称前用 `available::available("packagename")` 检查 CRAN 上是否已存在同名包
- **缺少 .Rbuildignore 条目**：开发文件（`.Rprofile`、`.Renviron`、`renv/`）必须排除在构建包之外
- **忘记 Encoding**：DESCRIPTION 中始终包含 `Encoding: UTF-8`
- **RoxygenNote 版本不匹配**：DESCRIPTION 中的版本必须与已安装的 roxygen2 版本一致

## 示例

```r
# 最简创建
usethis::create_package("myanalysis")

# 在一个会话中完成全部设置
usethis::create_package("myanalysis")
usethis::use_mit_license()
usethis::use_testthat(edition = 3)
usethis::use_readme_md()
usethis::use_git()
usethis::use_github_action("check-standard")
renv::init()
```

## 相关技能

- `write-roxygen-docs` - 为创建的函数编写文档
- `write-testthat-tests` - 为包添加测试
- `setup-github-actions-ci` - 详细的 CI/CD 配置
- `manage-renv-dependencies` - 管理包依赖
- `write-claude-md` - 编写有效的 AI 助手说明
