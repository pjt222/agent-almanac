---
name: install-putior
locale: wenyan-lite
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

# 裝 putior 套件

裝 putior R 套件及其選擇性依賴，使註解至圖之管線於專案中可用。本技能涵蓋核心裝、選擇性擴展之擇與管線之驗證。

## 適用時機

- 於專案或環境首次設 putior
- 為工作流程視覺化任務備機
- 下游技能（analyze-codebase-workflow、generate-workflow-diagram）需 putior 已裝
- R 版本升級或 renv 清除後恢復環境

## 輸入

- **必要**：可存取之 R 安裝（>= 4.1.0）
- **選擇性**：自 CRAN（預設）或 GitHub 開發版裝
- **選擇性**：欲裝哪些選擇性依賴群：MCP（`mcptools`、`ellmer`）、互動（`shiny`、`shinyAce`）、日誌（`logger`）、ACP（`plumber2`）

## 步驟

### 步驟一：驗 R 安裝

確 R 可用且合最低版本要求。

```r
R.Version()$version.string
# Must be >= 4.1.0
```

```bash
# From WSL with Windows R
"/mnt/c/Program Files/R/R-4.5.2/bin/Rscript.exe" -e "cat(R.version.string)"
```

**預期：** R 版本字串印出，>= 4.1.0。

**失敗時：** 裝或升級 R。Windows 自 https://cran.r-project.org/bin/windows/base/ 下。Linux 用 `sudo apt install r-base`。

### 步驟二：裝 putior

自 CRAN（穩定）或 GitHub（開發）裝。

```r
# CRAN (recommended)
install.packages("putior")

# GitHub dev version (if latest features needed)
remotes::install_github("pjt222/putior")
```

**預期：** 套件無錯裝。`library(putior)` 默載。

**失敗時：** 若 CRAN 裝失敗報「not available for this version of R」，用 GitHub 版。若 GitHub 失敗，核 `remotes` 已裝：`install.packages("remotes")`。

### 步驟三：裝選擇性依賴

依所需功能裝選擇性套件。

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

**預期：** 每套件無錯裝。
各套件之功能：
- `mcptools` + `ellmer`：令 AI 助理可經 MCP 存取 putior
- `shiny` + `shinyAce`：啟瀏覽器基之互動沙箱
- `logger`：結構化日誌以供除錯
- `plumber2`：建 ACP 伺服器供代理間通訊

**失敗時：** `mcptools` 須先裝 `remotes`。
Linux 系統依賴錯則裝所需函式庫。
如 `sudo apt install libcurl4-openssl-dev` 為 httr2 之依賴。
於 macOS 可能需 `brew install openssl`。

### 步驟四：驗安裝

執基本管線以確一切運作。

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

**預期：** Mermaid 流程圖代碼印至主控台含 `test` 與 `Hello putior`。

> **關鍵預設**：所有掃描函數（`put()`、`put_auto()`、`put_generate()`、`put_merge()`）預設 `recursive = TRUE`，自動掃子目錄。此為自 0.2.0 前版本之破壞性變更，彼時預設為 `FALSE`。所有掃描函數亦接受 `exclude` 參數以供正則為基之檔過濾（如 `put("./src/", exclude = "test_")`）。

若選擇性 `shiny` 套件已裝，試互動沙箱：

```r
putior::run_sandbox()
```

此啟基於瀏覽器之編輯器，可試驗 PUT 註解語法並即時見圖渲染。

**失敗時：** 若 `put` 未覓，套件未正確裝。以 `install.packages("putior", dependencies = TRUE)` 重裝。若圖空，驗暫存檔已建且註解語法用單引號於雙引號內。

## 驗證

- [ ] `library(putior)` 無錯載
- [ ] `packageVersion("putior")` 返有效版本
- [ ] `put()` 於含有效 PUT 註解之檔返一列資料框
- [ ] `put_diagram()` 產以 `flowchart` 始之 Mermaid 代碼
- [ ] 所有所請之選擇性依賴無錯載

## 常見陷阱

- **引號嵌套錯**：PUT 註解於註解內用單引號：`id:'name'`，非 `id:"name"`（某些情境下與註解字串定界符衝突）。
- **無 Pandoc 缺小品文**：若計畫本地建 putior 之小品文，確 `RSTUDIO_PANDOC` 於 `.Renviron` 中設。
- **renv 隔離**：若專案用 renv，須於 renv 函式庫內裝 putior。執 `renv::install("putior")` 而非 `install.packages("putior")`。
- **GitHub 速率限**：自 GitHub 裝 `mcptools` 可能無 `GITHUB_PAT` 而失敗。經 `usethis::create_github_token()` 設之。

## 相關技能

- `analyze-codebase-workflow` — 裝後調查代碼庫之下步
- `configure-putior-mcp` — 裝選擇性依賴後設 MCP 伺服器
- `manage-renv-dependencies` — 於 renv 環境內管 putior
- `configure-mcp-server` — 通用 MCP 伺服器配置
