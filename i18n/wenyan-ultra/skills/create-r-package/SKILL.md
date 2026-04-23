---
name: create-r-package
locale: wenyan-ultra
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

# 造 R 包

架含新具與佳實之全設 R 包。

## 用

- 自零始新 R 包
- 化散 R 本為包
- 為合作發立包骨

## 入

- **必**：包名（小寫、特符僅 `.`）
- **必**：一行包目述
- **可**：執照（默：MIT）
- **可**：作者（名、郵、ORCID）
- **可**：是否初 renv（默：是）

## 行

### 一：造包骨

```r
usethis::create_package("packagename")
setwd("packagename")
```

**得：** 目建、含 `DESCRIPTION`、`NAMESPACE`、`R/`、`man/` 子目。

**敗：** 保 usethis 裝（`install.packages("usethis")`）。察目未存。

### 二：設 DESCRIPTION

編 `DESCRIPTION` 含正備：

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

**得：** 有效 DESCRIPTION 通 `R CMD check` 無備警。

**敗：** `R CMD check` 警 DESCRIPTION 欄→驗 `Title` 為 Title Case、`Description` 過一句、`Authors@R` 用有效 `person()` 文。

### 三：設基建

```r
usethis::use_mit_license()
usethis::use_readme_md()
usethis::use_news_md()
usethis::use_testthat(edition = 3)
usethis::use_git()
usethis::use_github_action("check-standard")
```

**得：** LICENSE、README.md、NEWS.md、`tests/` 目、`.git/` 初、`.github/workflows/` 建。

**敗：** `usethis::use_*()` 敗→裝缺依重行。`.git/` 已存→`use_git()` 略初。

### 四：建發設

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

**得：** `.Rprofile`、`.Renviron.example`、`.Rbuildignore` 建。發檔除於構包。

**敗：** `.Rprofile` 啟誤→察文法。保 `requireNamespace()` 守防選包缺時敗。

### 五：初 renv

```r
renv::init()
```

**得：** `renv/` 目與 `renv.lock` 建。案地庫活。

**敗：** `install.packages("renv")` 裝 renv。初懸→察網或 `options(timeout = 600)`。

### 六：建包備檔

建 `R/packagename-package.R`：

```r
#' @keywords internal
"_PACKAGE"

## usethis namespace: start
## usethis namespace: end
NULL
```

**得：** `R/packagename-package.R` 存含 `"_PACKAGE"` 哨。`devtools::document()` 生包級助。

**敗：** 保檔名合 `R/<packagename>-package.R` 模。`"_PACKAGE"` 須為獨表、非於函內。

### 七：建 CLAUDE.md

於案根建 `CLAUDE.md` 含 AI 助手之案專令。

**得：** `CLAUDE.md` 存於案根含案專編規、構令、架注。

**敗：** 疑何含→始於包名、一行述、常發令（`devtools::check()`、`devtools::test()`）、任不明規。

## 驗

- [ ] `devtools::check()` 返零誤零警
- [ ] 包構合期
- [ ] `.Rprofile` 載無誤
- [ ] `renv::status()` 顯無問
- [ ] Git 庫初含合 `.gitignore`
- [ ] GitHub Actions 流檔存

## 忌

- **包名衝**：委名前以 `available::available("packagename")` 察 CRAN
- **缺 .Rbuildignore 項**：發檔（`.Rprofile`、`.Renviron`、`renv/`）須除於構包
- **忘 Encoding**：DESCRIPTION 恆含 `Encoding: UTF-8`
- **RoxygenNote 不合**：DESCRIPTION 中版須合裝之 roxygen2

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

- `write-roxygen-docs` - 備所造函
- `write-testthat-tests` - 為包加試
- `setup-github-actions-ci` - 備 CI/CD 設細
- `manage-renv-dependencies` - 理包依
- `write-claude-md` - 造效 AI 助令
