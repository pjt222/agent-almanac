---
name: build-pkgdown-site
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Build and deploy a pkgdown documentation site for an R package to
  GitHub Pages. Covers _pkgdown.yml configuration, theming, article
  organization, reference index customization, and deployment methods.
  Use when creating a documentation site for a new or existing package,
  customizing layout or navigation, fixing 404 errors on a deployed site,
  or migrating between branch-based and GitHub Actions deployment methods.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: r-packages
  complexity: intermediate
  language: R
  tags: r, pkgdown, documentation, github-pages, website
---

# 建 pkgdown 站

配發 R 包之 pkgdown 文站。

## 用

- 為 R 包造文站
- 客 pkgdown 布、題、導
- 修已發 pkgdown 站之 404 誤
- 移發法

## 入

- **必**：含 roxygen2 文之 R 包
- **必**：GitHub 庫
- **可**：客題或品牌
- **可**：涵為篇之 vignette

## 行

### 一：初 pkgdown

```r
usethis::use_pkgdown()
```

此造 `_pkgdown.yml` 且加 pkgdown 至 `.Rbuildignore`。

**得：** `_pkgdown.yml` 存案根。`.Rbuildignore` 含 pkgdown 相條。

**敗：** 以 `install.packages("pkgdown")` 裝 pkgdown。若 `_pkgdown.yml` 已存→函更 `.Rbuildignore` 而不覆配。

### 二：配 `_pkgdown.yml`

```yaml
url: https://username.github.io/packagename/

development:
  mode: release

template:
  bootstrap: 5
  bootswatch: flatly

navbar:
  structure:
    left: [intro, reference, articles, news]
    right: [search, github]
  components:
    github:
      icon: fa-github
      href: https://github.com/username/packagename

reference:
  - title: Core Functions
    desc: Primary package functionality
    contents:
      - main_function
      - helper_function
  - title: Utilities
    desc: Helper and utility functions
    contents:
      - starts_with("util_")

articles:
  - title: Getting Started
    contents:
      - getting-started
  - title: Advanced Usage
    contents:
      - advanced-features
      - customization
```

**要**：設 `development: mode: release`。默 `mode: auto` 致 GitHub Pages 之 404，因附 `/dev/` 於 URL。

**得：** `_pkgdown.yml` 含有效 YAML 附 `url`、`template`、`navbar`、`reference`、`articles` 段合包。

**敗：** 以網上 YAML 解器驗法。確 `reference.contents` 之諸函名合實導函。

### 三：本地構

```r
pkgdown::build_site()
```

**得：** `docs/` 目已造附全站含 `index.html`、函引頁、篇。

**敗：** 常題：pandoc 缺（於 `.Renviron` 設 `RSTUDIO_PANDOC`）、vignette 依缺（裝薦包）、例破（修或以 `\dontrun{}` 包）。

### 四：預覽站

```r
pkgdown::preview_site()
```

驗導、函引、篇、搜正。

**得：** 站於 localhost 開於瀏。諸導連行、函引頁渲、搜返結。

**敗：** 預覽不開→手開 `docs/index.html`。頁缺→察 `devtools::document()` 構前已行。

### 五：發至 GitHub Pages

**法 A：GitHub Actions（薦）**

詳 `setup-github-actions-ci` 技之 pkgdown 流。

**法 B：手枝發**

```bash
# Build site
Rscript -e "pkgdown::build_site()"

# Create gh-pages branch if it doesn't exist
git checkout --orphan gh-pages
git rm -rf .
cp -r docs/* .
git add .
git commit -m "Deploy pkgdown site"
git push origin gh-pages

# Switch back to main
git checkout main
```

**得：** `gh-pages` 枝存於遠附站檔於根級。

**敗：** 推拒→確有庫書權。若用 GitHub Actions 發→略此步而從 `setup-github-actions-ci`。

### 六：配 GitHub Pages

1. 至庫 Settings > Pages
2. 設 Source 為「Deploy from a branch」
3. 擇 `gh-pages` 枝、`/ (root)` 目
4. 存

**得：** 站於數分內於 `https://username.github.io/packagename/` 可達。

**敗：** 站返 404→驗 Pages 源合發法（枝發需「Deploy from a branch」）。察 `_pkgdown.yml` 設 `development: mode: release`。

### 七：加 URL 至 DESCRIPTION

```
URL: https://username.github.io/packagename/, https://github.com/username/packagename
```

**得：** DESCRIPTION `URL` 欄含 pkgdown 站 URL 與 GitHub 庫 URL，逗分。

**敗：** `R CMD check` 警 URL 無效→先驗 pkgdown 站實發且可達而後加 URL。

## 驗

- [ ] 站於本地無誤構
- [ ] 諸函引頁正渲
- [ ] 篇/vignette 可達且正渲
- [ ] 搜功行
- [ ] 導連正
- [ ] 站成發至 GitHub Pages
- [ ] 已發站無 404 誤
- [ ] `_pkgdown.yml` 設 `development: mode: release`

## 忌

- **發後 404 誤**：幾皆因 `development: mode: auto`（默）。改 `mode: release`。
- **函引頁缺**：函必導出且錄。先行 `devtools::document()`。
- **vignette 連破**：交引中用 `vignette("name")` 法，非檔徑。
- **標誌不現**：標誌置 `man/figures/logo.png` 且於 `_pkgdown.yml` 引。
- **搜不行**：需 `_pkgdown.yml` 之 `url` 欄正設。
- **混系 R 執誤**：WSL/Docker 上 `Rscript` 或解為跨平包裝非原 R。察 `which Rscript && Rscript --version`。宜用原 R（如 Linux/WSL `/usr/local/bin/Rscript`）以穩。詳 [Setting Up Your Environment](../../guides/setting-up-your-environment.md)。

## 參

- `setup-github-actions-ci` — 自動 pkgdown 發流
- `write-roxygen-docs` — 現於站之函文
- `write-vignette` — 現於站導之篇
- `release-package-version` — 發時觸站重構
