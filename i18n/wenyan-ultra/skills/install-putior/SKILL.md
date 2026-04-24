---
name: install-putior
locale: wenyan-ultra
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

裝 putior R 包與其可選依以備標註至圖之管線。

## 用

- 首次於項目或環境立 putior
- 備機供工作流視覺任務
- 下游技能（analyze-codebase-workflow、generate-workflow-diagram）需 putior 已裝
- R 升或 renv 除後復環境

## 入

- **必**：R 裝（>= 4.1.0）可訪
- **可**：由 CRAN（默）或 GitHub 開發版裝
- **可**：哪可選依組：MCP（`mcptools`、`ellmer`）、交互（`shiny`、`shinyAce`）、記（`logger`）、ACP（`plumber2`）

## 行

### 一：驗 R 裝

確 R 可用且合最低版。

```r
R.Version()$version.string
# Must be >= 4.1.0
```

```bash
# From WSL with Windows R
"/mnt/c/Program Files/R/R-4.5.2/bin/Rscript.exe" -e "cat(R.version.string)"
```

得：R 版串印，>= 4.1.0。

敗：裝或升 R。Windows：由 https://cran.r-project.org/bin/windows/base/ 下。Linux：用 `sudo apt install r-base`。

### 二：裝 putior

由 CRAN（穩）或 GitHub（開發）裝。

```r
# CRAN (recommended)
install.packages("putior")

# GitHub dev version (if latest features needed)
remotes::install_github("pjt222/putior")
```

得：包無誤裝。`library(putior)` 靜載。

敗：CRAN 裝敗「not available for this version of R」→用 GitHub 版。GitHub 敗→察 `remotes` 已裝：`install.packages("remotes")`。

### 三：裝可選依

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

得：各包無誤裝。

敗：`mcptools` 敗→先確 `remotes` 已裝。Linux 之系依誤→裝所需庫（如 httr2 依之 `sudo apt install libcurl4-openssl-dev`）。

### 四：驗裝

行基管線確諸作。

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

得：Mermaid 流程碼印至控台含 `test` 與 `Hello putior`。

> **關鍵默**：諸掃函（`put()`、`put_auto()`、`put_generate()`、`put_merge()`）默 `recursive = TRUE`，自動掃子目錄。此為由 0.2.0 前版默 `FALSE` 之破變。諸掃函亦受 `exclude` 參供正則檔過濾（如 `put("./src/", exclude = "test_")`）。

若可選 `shiny` 包已裝→試交互沙盒：

```r
putior::run_sandbox()
```

啟瀏覽器編輯，可試 PUT 標註語法並即時見繪圖。

敗：`put` 未找→包未正裝。以 `install.packages("putior", dependencies = TRUE)` 重裝。圖空→驗臨檔已造且標註語法於雙引內用單引。

## 驗

- [ ] `library(putior)` 無誤載
- [ ] `packageVersion("putior")` 返有效版
- [ ] 含有效 PUT 標註之檔於 `put()` 返一列數據幀
- [ ] `put_diagram()` 生以 `flowchart` 開之 Mermaid 碼
- [ ] 諸所請可選依無誤載

## 忌

- **引錯嵌**：PUT 標註於內用單引：`id:'name'`，非 `id:"name"`（某脈絡衝注串分隔）
- **小插件需 Pandoc**：欲本地建 putior 小插件→確 `.Renviron` 已設 `RSTUDIO_PANDOC`
- **renv 隔**：項目用 renv→必於 renv 庫內裝 putior。行 `renv::install("putior")` 非 `install.packages("putior")`
- **GitHub 率限**：由 GitHub 裝 `mcptools` 無 `GITHUB_PAT` 則敗。經 `usethis::create_github_token()` 設
- **版不符**：既裝舊版 putior→先卸舊：`remove.packages("putior")`
- **裝於錯徑**：路近遠異庫者→用 `install.packages(..., lib = "/目標")` 顯指
- **Windows 編譯工缺**：由源裝需 Rtools。於 Windows 先裝 Rtools43+
- **WSL 混**：WSL 中用 Windows R 則徑必以 `/mnt/c/` 開。勿混 Linux 原生 R
- **依鏈斷**：`install.packages("putior", dependencies = TRUE)` 拉諸所需依，免手逐一裝
- **CRAN 鏡陳**：選近地鏡供速。`options(repos = "https://cloud.r-project.org")` 宜
- **記憶不足**：大依裝致失敗→擴可用記憶或分次裝

## 參

- `analyze-codebase-workflow`
- `configure-putior-mcp`
- `manage-renv-dependencies`
- `configure-mcp-server`
