---
name: manage-renv-dependencies
locale: wenyan-ultra
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

# 管 renv 依

以 renv 設並維可重 R 包環境。

## 用

- 啟新 R 項依管
- 加或更包依
- 新機上恢項環
- 調 renv 恢敗
- 合 renv 與 CI/CD

## 入

- **必**：R 項目
- **可**：現 `renv.lock`（恢用）
- **可**：私包之 GitHub PAT

## 行

### 一：啟 renv

```r
renv::init()
```

此造：
- `renv/` 目（庫、設、啟腳本）
- `renv.lock`（依快照）
- 更 `.Rprofile` 載時啟 renv

得：項本地庫造。`renv/` 目與 `renv.lock` 在。`.Rprofile` 更附啟腳本。

敗：掛→查網連。特包敗→先手動 `install.packages()` 裝後重運 `renv::init()`。

### 二：加依

常裝包：

```r
install.packages("dplyr")
renv::install("github-user/private-pkg")
```

後快照記態：

```r
renv::snapshot()
```

得：`renv.lock` 更附新包與版。`renv::status()` 示無失同包。

敗：`renv::snapshot()` 報驗誤→運 `renv::dependencies()` 察哪包實用，後 `renv::snapshot(force = TRUE)` 繞驗。

### 三：他機恢

```r
renv::restore()
```

得：諸包裝於 `renv.lock` 之確版。

敗：常問題：GitHub 包敗（於 `.Renviron` 設 `GITHUB_PAT`）；缺系統依（Linux 以 `apt-get` 裝）；大包超時（恢前設 `options(timeout = 600)`）；無二進（renv 由源編；確備工具裝）。

### 四：更依

```r
# Update a specific package
renv::update("dplyr")

# Update all packages
renv::update()

# Snapshot after updates
renv::snapshot()
```

得：目包更至新兼容版。`renv.lock` 快照後反新版。

敗：`renv::update()` 為特包敗→試以 `renv::install("package@version")` 直裝後快照。

### 五：查態

```r
renv::status()
```

得：「No issues found」或失同包之明列附可行指。

敗：態報用而未記之包→運 `renv::snapshot()`。已記而未裝之包→運 `renv::restore()`。

### 六：配 `.Rprofile` 為條件啟

```r
if (file.exists("renv/activate.R")) {
  source("renv/activate.R")
}
```

此確即 renv 未裝（CI 環、協作者）項亦行。

得：R 會話於項目中啟時自啟 renv。無 renv 之會話仍無誤啟。

敗：`.Rprofile` 致誤→確 `file.exists()` 守存。永勿無條件呼 `source("renv/activate.R")`。

### 七：Git 配

追此文件：

```
renv.lock           # Always commit
renv/activate.R     # Always commit
renv/settings.json  # Always commit
.Rprofile           # Commit (contains renv activation)
```

忽此（已於 renv 之 `.gitignore`）：

```
renv/library/       # Machine-specific
renv/staging/       # Temporary
renv/cache/         # Machine-specific cache
```

得：`renv.lock`、`renv/activate.R`、`renv/settings.json` 由 Git 追。機特目（`renv/library/`、`renv/cache/`）忽。

敗：`renv/library/` 誤提→以 `git rm -r --cached renv/library/` 除並加 `.gitignore`。

### 八：CI/CD 合

GitHub Actions 用 renv 緩動：

```yaml
- uses: r-lib/actions/setup-renv@v2
```

此自由 `renv.lock` 附緩恢。

得：CI 管線由 `renv.lock` 恢包附緩啟。後運因緩包更速。

敗：CI 恢敗→查 `renv.lock` 提且新。私 GitHub 包→確 `GITHUB_PAT` 設為庫秘。

## 驗

- [ ] `renv::status()` 報無問題
- [ ] `renv.lock` 提於版控
- [ ] `renv::restore()` 於淨檢出上行
- [ ] `.Rprofile` 條件啟 renv
- [ ] CI/CD 用 `renv.lock` 為依解

## 忌

- **於誤目運 `renv::init()`**：必先驗 `getwd()`
- **混 renv 與系統庫**：`renv::init()` 後僅用項庫
- **忘快照**：裝包後必運 `renv::snapshot()`
- **`--vanilla` 旗**：`Rscript --vanilla` 略 `.Rprofile` → renv 不啟
- **大鎖文件於 diff**：常——`renv.lock` 設為可 diff JSON
- **Bioconductor 包**：用 `renv::install("bioc::PackageName")` 並確 BiocManager 配

## 參

- `create-r-package` - 含 renv 啟
- `setup-github-actions-ci` - 與 renv 之 CI 合
- `submit-to-cran` - CRAN 包之依管
