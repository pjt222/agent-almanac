---
name: create-r-package
locale: wenyan-lite
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

# 造 R 套件

以現代工具與最佳實踐腳手架一全配之 R 套件。

## 適用時機

- 由頭造新 R 套件
- 將鬆散 R 腳本轉為結構化套件
- 為協作開發立套件骨架

## 輸入

- **必要**：套件名（小寫，除 `.` 外無特殊字元）
- **必要**：套件目的之一句描述
- **選擇性**：授權類型（預設：MIT）
- **選擇性**：作者資訊（名、郵、ORCID）
- **選擇性**：是否初始化 renv（預設：是）

## 步驟

### 步驟一：造套件骨架

```r
usethis::create_package("packagename")
setwd("packagename")
```

**預期：** 已造目錄，含 `DESCRIPTION`、`NAMESPACE`、`R/`、`man/` 子目錄。

**失敗時：** 確保已裝 usethis（`install.packages("usethis")`）。察目錄未既存。

### 步驟二：配 DESCRIPTION

編 `DESCRIPTION` 以準確元資料：

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

**預期：** 有效之 DESCRIPTION，通過 `R CMD check` 而無元資料警告。

**失敗時：** 若 `R CMD check` 對 DESCRIPTION 欄告警，驗 `Title` 為 Title Case、`Description` 多於一句、`Authors@R` 用有效之 `person()` 語法。

### 步驟三：立基礎設施

```r
usethis::use_mit_license()
usethis::use_readme_md()
usethis::use_news_md()
usethis::use_testthat(edition = 3)
usethis::use_git()
usethis::use_github_action("check-standard")
```

**預期：** LICENSE、README.md、NEWS.md、`tests/` 目錄、`.git/` 已初始化、`.github/workflows/` 已造。

**失敗時：** 若某 `usethis::use_*()` 函式敗，裝缺之依賴並重行。若 `.git/` 已存，`use_git()` 跳初始化。

### 步驟四：造開發配置

造 `.Rprofile`：

```r
if (file.exists("renv/activate.R")) {
  source("renv/activate.R")
}

if (requireNamespace("mcptools", quietly = TRUE)) {
  mcptools::mcp_session()
}
```

造 `.Renviron.example`：

```
RSTUDIO_PANDOC="C:/Program Files/RStudio/resources/app/bin/quarto/bin/tools"
# GITHUB_PAT=your_github_token_here
```

造 `.Rbuildignore` 項：

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

**預期：** `.Rprofile`、`.Renviron.example`、`.Rbuildignore` 已造。開發檔已排於建構之套件外。

**失敗時：** 若 `.Rprofile` 於啟動致誤，察語法。確保 `requireNamespace()` 守防選擇性套件缺時之敗。

### 步驟五：初始化 renv

```r
renv::init()
```

**預期：** `renv/` 目錄與 `renv.lock` 已造。項目本地庫已激活。

**失敗時：** 以 `install.packages("renv")` 裝 renv。若 renv 於初始化時懸，察網路連通或設 `options(timeout = 600)`。

### 步驟六：造套件文件檔

造 `R/packagename-package.R`：

```r
#' @keywords internal
"_PACKAGE"

## usethis namespace: start
## usethis namespace: end
NULL
```

**預期：** `R/packagename-package.R` 存，含 `"_PACKAGE"` 哨標。行 `devtools::document()` 生套件層之說明。

**失敗時：** 確保檔名合 `R/<packagename>-package.R` 模式。`"_PACKAGE"` 字串須為獨立表式，非函式內。

### 步驟七：造 CLAUDE.md

於項目根造 `CLAUDE.md`，含 AI 助手之項目專屬指示。

**預期：** `CLAUDE.md` 存於項目根，含項目專屬編輯慣例、建構命令、架構注記。

**失敗時：** 疑應含何，始於套件名、一句描述、常開發命令（`devtools::check()`、`devtools::test()`）、任何不顯之慣例。

## 驗證

- [ ] `devtools::check()` 返 0 誤、0 警告
- [ ] 套件結構合期望佈局
- [ ] `.Rprofile` 載入無誤
- [ ] `renv::status()` 無問題
- [ ] Git 倉已初始化，含當之 `.gitignore`
- [ ] GitHub Actions 工作流檔存

## 常見陷阱

- **套件名衝突**：定名前以 `available::available("packagename")` 察 CRAN
- **缺 .Rbuildignore 項**：開發檔（`.Rprofile`、`.Renviron`、`renv/`）須排於建構之套件外
- **忘 Encoding**：DESCRIPTION 中恒含 `Encoding: UTF-8`
- **RoxygenNote 不合**：DESCRIPTION 中之版本須合已裝之 roxygen2

## 範例

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

## 相關技能

- `write-roxygen-docs` - 為造之函式寫文件
- `write-testthat-tests` - 為套件加測試
- `setup-github-actions-ci` - 詳 CI/CD 配置
- `manage-renv-dependencies` - 管套件依賴
- `write-claude-md` - 造有效之 AI 助手指示
