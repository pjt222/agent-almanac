---
name: create-r-package
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Scaffold a new R package with complete structure including DESCRIPTION,
  NAMESPACE, testthat, roxygen2, renv, Git, GitHub Actions CI, and
  development configuration files (.Rprofile, .Renviron.example, CLAUDE.md).
  Follows usethis conventions and tidyverse style. Use when starting a new R
  package from scratch, converting loose R scripts into a structured package,
  or setting up a package skeleton for collaborative development.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: r-packages
  complexity: basic
  language: R
  tags: r, package, usethis, scaffold, setup
---

# 建 R 包

搭全配之 R 包，以新具與最佳之法。

## 用時

- 由無而建 R 包
- 將散 R 本轉為包
- 為協作開發搭包骨

## 入

- **必要**：包名（小寫，唯 `.` 為特字）
- **必要**：包志之一行述
- **可選**：許可類（默 MIT）
- **可選**：作者信息（名、電郵、ORCID）
- **可選**：是否起 renv（默為）

## 法

### 第一步：建包骨

```r
usethis::create_package("packagename")
setwd("packagename")
```

**得：** 目錄建，含 `DESCRIPTION`、`NAMESPACE`、`R/`、`man/` 子目錄。

**敗則：** 確 usethis 已裝（`install.packages("usethis")`）。察目錄未存。

### 第二步：設 DESCRIPTION

編 `DESCRIPTION` 含精元資料：

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

**得：** 合法 DESCRIPTION 過 `R CMD check` 無元資料警。

**敗則：** 若 `R CMD check` 警 DESCRIPTION 域，驗 `Title` 為題式大小寫、`Description` 逾一句、`Authors@R` 用合法 `person()` 語法。

### 第三步：設基建

```r
usethis::use_mit_license()
usethis::use_readme_md()
usethis::use_news_md()
usethis::use_testthat(edition = 3)
usethis::use_git()
usethis::use_github_action("check-standard")
```

**得：** LICENSE、README.md、NEWS.md、`tests/` 目錄、`.git/` 已起、`.github/workflows/` 已建。

**敗則：** 若某 `usethis::use_*()` 敗，裝缺依而重運。若 `.git/` 已存，`use_git()` 略起。

### 第四步：建開發之配

建 `.Rprofile`：

```r
if (file.exists("renv/activate.R")) {
  source("renv/activate.R")
}

if (requireNamespace("mcptools", quietly = TRUE)) {
  mcptools::mcp_session()
}
```

建 `.Renviron.example`：

```
RSTUDIO_PANDOC="C:/Program Files/RStudio/resources/app/bin/quarto/bin/tools"
# GITHUB_PAT=your_github_token_here
```

建 `.Rbuildignore` 項：

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

**得：** `.Rprofile`、`.Renviron.example`、`.Rbuildignore` 已建。開發文件排於建包外。

**敗則：** 若 `.Rprofile` 致起誤，察語法。確 `requireNamespace()` 守防可選包缺致敗。

### 第五步：起 renv

```r
renv::init()
```

**得：** `renv/` 目錄與 `renv.lock` 建。項目本地庫活。

**敗則：** 以 `install.packages("renv")` 裝之。若 renv 起時卡，察網或 `options(timeout = 600)`。

### 第六步：建包文件

建 `R/packagename-package.R`：

```r
#' @keywords internal
"_PACKAGE"

## usethis namespace: start
## usethis namespace: end
NULL
```

**得：** `R/packagename-package.R` 存含 `"_PACKAGE"` 標。`devtools::document()` 生包級助。

**敗則：** 確文件名合 `R/<packagename>-package.R`。`"_PACKAGE"` 字串宜獨立表達，非函內。

### 第七步：建 CLAUDE.md

於項根建 `CLAUDE.md`，含項專 AI 助手之指。

**得：** `CLAUDE.md` 存於項根，含項專編慣、建命、構註。

**敗則：** 若疑含何，始以包名、一行述、常開發命（`devtools::check()`、`devtools::test()`），及任何非顯慣。

## 驗

- [ ] `devtools::check()` 返 0 誤 0 警
- [ ] 包構合期佈
- [ ] `.Rprofile` 加載無訛
- [ ] `renv::status()` 無問
- [ ] Git 庫已起含宜 `.gitignore`
- [ ] GitHub Actions 工作流文件存

## 陷

- **包名衝**：建名前以 `available::available("packagename")` 察 CRAN
- **缺 .Rbuildignore 項**：開發文件（`.Rprofile`、`.Renviron`、`renv/`）須排於建包外
- **忘 Encoding**：DESCRIPTION 皆含 `Encoding: UTF-8`
- **RoxygenNote 不合**：DESCRIPTION 之版須合所裝 roxygen2

## 例

```r
# Minimal creation
usethis::create_package("myanalysis")

# Full setup in one session
usethis::create_package("myanalysis")
usethis::use_mit_license()
usethis::use_testthat(edition = 3)
usethis::use_readme_md()
usethis::use_git()
usethis::use_github_action("check-standard")
renv::init()
```

## 參

- `write-roxygen-docs` — 文所建之函
- `write-testthat-tests` — 為包加試
- `setup-github-actions-ci` — 詳 CI/CD 配
- `manage-renv-dependencies` — 管包依
- `write-claude-md` — 建有效 AI 助手指
