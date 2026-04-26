---
name: manage-renv-dependencies
locale: wenyan
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

以 renv 立並護可重現 R 包環境。

## 用時

- 為新 R 項目啟依賴管
- 加或更包依賴
- 於新機復項目環境
- 排查 renv 復之敗
- 合 renv 於 CI/CD 管線

## 入

- **必要**：R 項目目
- **可選**：既 `renv.lock` 檔（為復）
- **可選**：私包用之 GitHub PAT

## 法

### 第一步：啟 renv

```r
renv::init()
```

此生：
- `renv/` 目（庫、設、啟動腳）
- `renv.lock`（依賴之拍）
- 更 `.Rprofile` 以啟載時啟 renv

**得：**項目本地庫已建。`renv/` 目與 `renv.lock` 存。`.Rprofile` 已更附啟動腳。

**敗則：**若懸，察網。若敗於某包，先以 `install.packages()` 手裝此包，再運 `renv::init()`。

### 第二步：加依賴

如常裝包：

```r
install.packages("dplyr")
renv::install("github-user/private-pkg")
```

然後拍以記態：

```r
renv::snapshot()
```

**得：**`renv.lock` 以新包及版本更。`renv::status()` 顯無不同步之包。

**敗則：**若 `renv::snapshot()` 報驗誤，行 `renv::dependencies()` 察何包實用，再 `renv::snapshot(force = TRUE)` 繞驗。

### 第三步：於他機復

```r
renv::restore()
```

**得：**諸包裝於 `renv.lock` 中之精版。

**敗則：**常疑：GitHub 包敗（於 `.Renviron` 設 `GITHUB_PAT`）、系統依賴缺（Linux 以 `apt-get` 裝）、大包超時（復前設 `options(timeout = 600)`）、或二進不可得（renv 自源編；確構工具已裝）。

### 第四步：更依賴

```r
# Update a specific package
renv::update("dplyr")

# Update all packages
renv::update()

# Snapshot after updates
renv::snapshot()
```

**得：**目標包已更至最新相容版。拍後 `renv.lock` 反新版。

**敗則：**若 `renv::update()` 為某包敗，試以 `renv::install("package@version")` 直裝再拍。

### 第五步：察態

```r
renv::status()
```

**得：**「No issues found」或清列之不同步包附可行之導。

**敗則：**若態報包用而未記，行 `renv::snapshot()`。若包已記而未裝，行 `renv::restore()`。

### 第六步：設 `.Rprofile` 以條件啟

```r
if (file.exists("renv/activate.R")) {
  source("renv/activate.R")
}
```

此確項目即於 renv 未裝（CI 環境、合作者）時亦奏。

**得：**R 會於項目目啟時自動啟 renv。renv 未裝之會仍無誤而啟。

**敗則：**若 `.Rprofile` 致誤，確 `file.exists()` 守在。勿無條件呼 `source("renv/activate.R")`。

### 第七步：Git 之設

追此諸檔：

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

**得：**`renv.lock`、`renv/activate.R`、`renv/settings.json` 為 Git 追。機專之目（`renv/library/`、`renv/cache/`）已忽。

**敗則：**若 `renv/library/` 誤提交，以 `git rm -r --cached renv/library/` 除並加於 `.gitignore`。

### 第八步：CI/CD 之合

於 GitHub Actions，用 renv 快取行動：

```yaml
- uses: r-lib/actions/setup-renv@v2
```

此自動以 `renv.lock` 復，具快取。

**得：**CI 管線自 `renv.lock` 復包具快取。後運以快取之包更速。

**敗則：**若 CI 復敗，察 `renv.lock` 已提交且新。私 GitHub 包者，確 `GITHUB_PAT` 設為倉之密。

## 驗

- [ ] `renv::status()` 報無疑
- [ ] `renv.lock` 已於版本控制中提交
- [ ] `renv::restore()` 於潔取時奏
- [ ] `.Rprofile` 條件啟 renv
- [ ] CI/CD 用 `renv.lock` 解依賴

## 陷

- **`renv::init()` 於誤目行**：恆先驗 `getwd()`
- **混 renv 於系統庫**：`renv::init()` 後唯用項目之庫
- **忘拍**：裝包後恆行 `renv::snapshot()`
- **`--vanilla` 旗**：`Rscript --vanilla` 跳 `.Rprofile`，故 renv 不啟
- **diff 中之大鎖檔**：常——`renv.lock` 設為可 diff 之 JSON
- **Bioconductor 之包**：用 `renv::install("bioc::PackageName")` 並確 BiocManager 已設

## 參

- `create-r-package` — 含 renv 之啟
- `setup-github-actions-ci` — 以 renv 合 CI
- `submit-to-cran` — CRAN 包之依賴管
