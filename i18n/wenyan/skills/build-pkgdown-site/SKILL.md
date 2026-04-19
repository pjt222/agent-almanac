---
name: build-pkgdown-site
locale: wenyan
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

設而交 R 包之 pkgdown 文站。

## 用時

- 為 R 包建文站
- 訂 pkgdown 佈、主題、或航
- 修已交之 pkgdown 站 404 之錯
- 遷於諸交法間

## 入

- **必要**：R 包附 roxygen2 之文
- **必要**：GitHub 庫
- **可選**：自訂主題或品牌
- **可選**：含為文之 vignette

## 法

### 第一步：初 pkgdown

```r
usethis::use_pkgdown()
```

此建 `_pkgdown.yml` 而加 pkgdown 於 `.Rbuildignore`。

**得：** `_pkgdown.yml` 存於項目根。`.Rbuildignore` 含 pkgdown 相關之條。

**敗則：** 以 `install.packages("pkgdown")` 裝之。若 `_pkgdown.yml` 已存，函更 `.Rbuildignore` 而不覆設。

### 第二步：設 `_pkgdown.yml`

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

**要**：設 `development: mode: release`。默 `mode: auto` 致 GitHub Pages 之 404 錯——其於 URL 附 `/dev/`。

**得：** `_pkgdown.yml` 含有效 YAML，附 `url`、`template`、`navbar`、`reference`、`articles` 諸段合包所須。

**敗則：** 以線上 YAML linter 驗語。確 `reference.contents` 中諸函名合實出之函。

### 第三步：本地建

```r
pkgdown::build_site()
```

**得：** `docs/` 目建，含全站：`index.html`、函參頁、諸文。

**敗則：** 常題：缺 pandoc（於 `.Renviron` 設 `RSTUDIO_PANDOC`）、缺 vignette 之依（裝建議包）、或範壞（修或裹於 `\dontrun{}`）。

### 第四步：預站

```r
pkgdown::preview_site()
```

驗航、函參、文、搜皆行。

**得：** 站於 localhost 開於瀏覽器。諸航鏈行，函參頁渲，搜返果。

**敗則：** 若預不開，手開 `docs/index.html`。若頁缺，察建站前已行 `devtools::document()`。

### 第五步：交於 GitHub Pages

**甲法：GitHub Actions（薦）**

見 `setup-github-actions-ci` 技之 pkgdown 工作流。

**乙法：手分支之交**

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

**得：** `gh-pages` 分支存於遠端，站檔於根級。

**敗則：** 若推被拒，確有庫之書權。若用 GitHub Actions 交，略此步，循 `setup-github-actions-ci` 技。

### 第六步：設 GitHub Pages

1. 至庫 Settings > Pages
2. 設 Source 為「Deploy from a branch」
3. 擇 `gh-pages` 分支，`/ (root)` 目
4. 存

**得：** 站於數分內可見於 `https://username.github.io/packagename/`。

**敗則：** 若站返 404，驗 Pages 源合交法（分支交須「Deploy from a branch」）。察 `_pkgdown.yml` 中 `development: mode: release` 已設。

### 第七步：加 URL 於 DESCRIPTION

```
URL: https://username.github.io/packagename/, https://github.com/username/packagename
```

**得：** DESCRIPTION `URL` 欄含 pkgdown 站與 GitHub 庫二 URL，以逗點分。

**敗則：** 若 `R CMD check` 警 URL 無效，確 pkgdown 站已交而可及後加 URL。

## 驗

- [ ] 站本地建無錯
- [ ] 諸函參頁正渲
- [ ] 文/vignette 可及而正渲
- [ ] 搜功行
- [ ] 航鏈正
- [ ] 站交於 GitHub Pages 成
- [ ] 已交站無 404 錯
- [ ] `_pkgdown.yml` 中 `development: mode: release` 已設

## 陷

- **交後 404 錯**：幾恆由 `development: mode: auto`（默）致。改為 `mode: release`
- **缺函參頁**：函必出且已文。先行 `devtools::document()`
- **vignette 鏈壞**：交引中用 `vignette("name")` 之語，非檔路
- **logo 不現**：置 logo 於 `man/figures/logo.png`，引於 `_pkgdown.yml`
- **搜不行**：須 `_pkgdown.yml` 中 `url` 欄正設
- **混系上 R 誤**：WSL 或 Docker 上，`Rscript` 或解為跨平之包，非原生 R。察以 `which Rscript && Rscript --version`。為可靠宜用原生 R（如 Linux/WSL 上 `/usr/local/bin/Rscript`）。見 [Setting Up Your Environment](../../guides/setting-up-your-environment.md) 為 R 路之設

## 參

- `setup-github-actions-ci` - 自動化 pkgdown 交之工作流
- `write-roxygen-docs` - 於站現之函文
- `write-vignette` - 現於站航之文
- `release-package-version` - 發版時觸站重建
