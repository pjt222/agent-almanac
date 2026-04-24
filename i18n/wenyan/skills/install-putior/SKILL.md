---
name: install-putior
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Install and configure the putior R package for workflow visualization.
  Covers CRAN and GitHub installation, optional dependencies (mcptools,
  ellmer, shiny, shinyAce, logger, plumber2), and verification of the
  complete annotation-to-diagram pipeline. Use when setting up putior for
  the first time, preparing a machine for workflow visualization tasks, when
  a downstream skill requires putior to be installed, or restoring an
  environment after an R version upgrade or renv wipe.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: workflow-visualization
  complexity: basic
  language: R
  tags: putior, install, workflow, mermaid, visualization, R
---

# 裝 putior

裝 putior R 包及其可選依賴使注解至圖之管線可用。

## 用時

- 於項目或環境首次設 putior
- 為工作流可視化任務備機
- 下游技能（analyze-codebase-workflow、generate-workflow-diagram）需 putior 已裝
- R 版升或 renv 清後還原環境

## 入

- **必要**：可達之 R 裝（>= 4.1.0）
- **可選**：自 CRAN（默）或 GitHub 開發版裝
- **可選**：所裝之可選依組：MCP（`mcptools`、`ellmer`）、交互（`shiny`、`shinyAce`）、日志（`logger`）、ACP（`plumber2`）

## 法

### 第一步：驗 R 裝

確 R 可得且合最低版需。

```r
R.Version()$version.string
# Must be >= 4.1.0
```

```bash
# From WSL with Windows R
"/mnt/c/Program Files/R/R-4.5.2/bin/Rscript.exe" -e "cat(R.version.string)"
```

**得：** R 版串已印，>= 4.1.0。

**敗則：** 裝或升 R。Windows 者自 https://cran.r-project.org/bin/windows/base/ 下。Linux 用 `sudo apt install r-base`。

### 第二步：裝 putior

自 CRAN（穩）或 GitHub（開發）裝。

```r
# CRAN (recommended)
install.packages("putior")

# GitHub dev version (if latest features needed)
remotes::install_github("pjt222/putior")
```

**得：** 包無誤裝。`library(putior)` 默載。

**敗則：** 若 CRAN 裝敗報「此 R 版無」，用 GitHub 版。若 GitHub 敗，察 `remotes` 已裝：`install.packages("remotes")`。

### 第三步：裝可選依賴

依所需功能裝可選包。

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

**得：** 每包無誤裝。

**敗則：** `mcptools` 者，確 `remotes` 先裝。Linux 系統依誤者，裝所需庫（如 httr2 依之 `sudo apt install libcurl4-openssl-dev`）。

### 第四步：驗裝

行基本管線以確皆作。

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

**得：** Mermaid 流程圖碼印於控制台含 `test` 與 `Hello putior`。

> **要默認**：所有掃函（`put()`、`put_auto()`、`put_generate()`、`put_merge()`）默 `recursive = TRUE`，自動掃子目錄。此為 0.2.0 前版默 `FALSE` 之破變。所有掃函亦受 `exclude` 參為正則檔過（如 `put("./src/", exclude = "test_")`）。

若可選 `shiny` 包已裝，試交互沙盒：

```r
putior::run_sandbox()
```

此啟瀏覽器編輯器，可試 PUT 注解語法並實時見圖渲染。

**敗則：** 若 `put` 未找，包未正裝。以 `install.packages("putior", dependencies = TRUE)` 重裝。若圖空，驗臨檔已創且注解語法用雙引號內單引號。

## 驗

- [ ] `library(putior)` 無誤載
- [ ] `packageVersion("putior")` 返有效版
- [ ] `put()` 於含有效 PUT 注解之檔返一行資料框
- [ ] `put_diagram()` 生始以 `flowchart` 之 Mermaid 碼
- [ ] 所請可選依賴皆無誤載

## 陷

- **引號嵌套誤**：PUT 注解內用單引號：`id:'name'`
- 如此：非 `id:"name"`（某語境中與注解串分隔衝）
- **vignettes 缺 Pandoc**：若擬本地建 putior vignettes
- 需確 `.Renviron` 設 `RSTUDIO_PANDOC`
- **renv 隔離**：若項目用 renv，必於 renv 庫中裝 putior
- 以 `renv::install("putior")` 代 `install.packages("putior")`
- **GitHub 速限**：無 `GITHUB_PAT` 自 GitHub 裝 `mcptools` 或敗
- 宜以 `usethis::create_github_token()` 設之

## 參

- `analyze-codebase-workflow` — 裝後次步察庫
- `configure-putior-mcp` — 裝可選依後設 MCP 伺服器
- `manage-renv-dependencies` — 於 renv 環境管 putior
- `configure-mcp-server` — 通用 MCP 伺服器配置
- `generate-workflow-diagram` — 裝後生工作流圖之下游技能
- `annotate-source-files` — 注源檔為前提步驟
