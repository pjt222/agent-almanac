---
name: manage-renv-dependencies
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Manage R package dependencies using renv for reproducible environments.
  Covers initialization, snapshot/restore workflow, troubleshooting
  common issues, and CI/CD integration. Use when initializing dependency
  management for a new R project, adding or updating packages, restoring
  an environment on a new machine, troubleshooting restore failures, or
  integrating renv with CI/CD pipelines.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: r-packages
  complexity: intermediate
  language: R
  tags: r, renv, dependencies, reproducibility, lockfile
---

# 管 renv 依賴

以 renv 設並維可重現之 R 套件環境。

## 適用時機

- 為新 R 項目初始化依賴管理
- 加或更新套件依賴
- 於新機重現項目環境
- 排查 renv restore 敗
- 整合 renv 於 CI/CD 管線

## 輸入

- **必要**：R 項目目錄
- **選擇性**：既有 `renv.lock` 文件（供復）
- **選擇性**：供私套件之 GitHub PAT

## 步驟

### 步驟一：初始化 renv

```r
renv::init()
```

此創：
- `renv/` 目錄（庫、設置、激活腳本）
- `renv.lock`（依賴快照）
- 更 `.Rprofile` 以於載入時激活 renv

**預期：** 項目本地庫已創。`renv/` 目錄與 `renv.lock` 存。`.Rprofile` 已更附激活腳本。

**失敗時：** 若掛，查網連。若於特定套件敗，先手動以 `install.packages()` 裝該套件，再重行 `renv::init()`。

### 步驟二：加依賴

如常裝套件：

```r
install.packages("dplyr")
renv::install("github-user/private-pkg")
```

再快照以記態：

```r
renv::snapshot()
```

**預期：** `renv.lock` 已更附新套件與其版本。`renv::status()` 示無不同步套件。

**失敗時：** 若 `renv::snapshot()` 報驗證誤，行 `renv::dependencies()` 查何套件實被用，再以 `renv::snapshot(force = TRUE)` 繞驗證。

### 步驟三：於他機重現

```r
renv::restore()
```

**預期：** 所有套件按 `renv.lock` 中確切版本裝。

**失敗時：** 常問題：GitHub 套件敗（設 `.Renviron` 中 `GITHUB_PAT`）、缺系統依賴（Linux 以 `apt-get` 裝）、大套件超時（復前設 `options(timeout = 600)`）、二進制不可得（renv 自源編；確建工具已裝）。

### 步驟四：更依賴

```r
# Update a specific package
renv::update("dplyr")

# Update all packages
renv::update()

# Snapshot after updates
renv::snapshot()
```

**預期：** 目標套件已更至其最新兼容版本。快照後 `renv.lock` 反映新版本。

**失敗時：** 若 `renv::update()` 於特定套件敗，試以 `renv::install("package@version")` 直裝再快照。

### 步驟五：查態

```r
renv::status()
```

**預期：** 「無問題」或不同步套件之明清單附可行指引。

**失敗時：** 若態報套件已用而未記，行 `renv::snapshot()`。若已記而未裝，行 `renv::restore()`。

### 步驟六：配 `.Rprofile` 以條件激活

```r
if (file.exists("renv/activate.R")) {
  source("renv/activate.R")
}
```

此確即 renv 未裝（CI 環境、協作者）項目仍可作。

**預期：** R 會話於項目目錄啟時自動激活 renv。無 renv 裝之會話仍無誤啟。

**失敗時：** 若 `.Rprofile` 致誤，確 `file.exists()` 守存。絕勿無條件 `source("renv/activate.R")`。

### 步驟七：Git 配置

追此文件：

```
renv.lock           # Always commit
renv/activate.R     # Always commit
renv/settings.json  # Always commit
.Rprofile           # Commit (contains renv activation)
```

忽此（已於 renv 之 `.gitignore` 中）：

```
renv/library/       # Machine-specific
renv/staging/       # Temporary
renv/cache/         # Machine-specific cache
```

**預期：** `renv.lock`、`renv/activate.R` 與 `renv/settings.json` 為 Git 所追。機特目錄（`renv/library/`、`renv/cache/`）已忽。

**失敗時：** 若 `renv/library/` 意外提，以 `git rm -r --cached renv/library/` 除之並加於 `.gitignore`。

### 步驟八：CI/CD 整合

於 GitHub Actions，用 renv 緩存動作：

```yaml
- uses: r-lib/actions/setup-renv@v2
```

此自 `renv.lock` 自動復並啟緩存。

**預期：** CI 管線自 `renv.lock` 復套件並啟緩存。後續運因緩存而快。

**失敗時：** 若 CI 復敗，查 `renv.lock` 已提且最新。對私 GitHub 套件，確 `GITHUB_PAT` 已設為倉秘密。

## 驗證

- [ ] `renv::status()` 報無問題
- [ ] `renv.lock` 已提於版本控制
- [ ] `renv::restore()` 於乾淨檢出時行
- [ ] `.Rprofile` 條件激活 renv
- [ ] CI/CD 用 `renv.lock` 作依賴解析

## 常見陷阱

- **於錯目錄行 `renv::init()`**：恒先驗 `getwd()`
- **混 renv 與系統庫**：`renv::init()` 後僅用項目庫
- **忘快照**：裝套件後恒行 `renv::snapshot()`
- **`--vanilla` 旗**：`Rscript --vanilla` 略 `.Rprofile`，則 renv 不激活
- **大鎖文件於 diff 中**：正常——`renv.lock` 設計為可差之 JSON
- **Bioconductor 套件**：用 `renv::install("bioc::PackageName")` 並確 BiocManager 已配

## 相關技能

- `create-r-package` - 含 renv 初始化
- `setup-github-actions-ci` - 與 renv 之 CI 整合
- `submit-to-cran` - 為 CRAN 套件之依賴管理
