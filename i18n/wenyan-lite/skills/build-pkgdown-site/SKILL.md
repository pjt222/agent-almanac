---
name: build-pkgdown-site
locale: wenyan-lite
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

# Build pkgdown Site

配置並部署 R 套件之 pkgdown 文檔網站。

## 適用時機

- 為 R 套件建文檔站
- 定制 pkgdown 之版型、主題、導航
- 修已部署 pkgdown 站之 404
- 於部署法間遷移

## 輸入

- **必要**：含 roxygen2 文檔之 R 套件
- **必要**：GitHub 倉庫
- **選擇性**：自定主題或品牌
- **選擇性**：列為文章之 vignettes

## 步驟

### 步驟一：初始化 pkgdown

```r
usethis::use_pkgdown()
```

此創 `_pkgdown.yml` 並於 `.Rbuildignore` 加 pkgdown 相關項。

**預期：** `_pkgdown.yml` 存於項目根。`.Rbuildignore` 含 pkgdown 相關項。

**失敗時：** 以 `install.packages("pkgdown")` 裝 pkgdown。若 `_pkgdown.yml` 已存，此函僅更 `.Rbuildignore` 而不覆配置。

### 步驟二：配置 `_pkgdown.yml`

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

**關鍵**：設 `development: mode: release`。預設 `mode: auto` 於 GitHub Pages 致 404，因其於 URL 附 `/dev/`。

**預期：** `_pkgdown.yml` 含有效 YAML，具合於套件之 `url`、`template`、`navbar`、`reference`、`articles` 段。

**失敗時：** 以線上 YAML 校驗器驗語法。確 `reference.contents` 中所有函數名合實際已導出之函數。

### 步驟三：本地構建

```r
pkgdown::build_site()
```

**預期：** 創 `docs/` 目錄，含完整站，包 `index.html`、函數參考頁、文章。

**失敗時：** 常見問題：pandoc 缺（於 `.Renviron` 設 `RSTUDIO_PANDOC`）、vignette 依賴缺（裝建議套件）、或破之示例（修或包入 `\dontrun{}`）。

### 步驟四：預覽站

```r
pkgdown::preview_site()
```

驗導航、函數參考、文章、搜索正工。

**預期：** 站於瀏覽器之 localhost 開。導航連結皆工、函數參考頁渲染、搜索返結果。

**失敗時：** 若預覽不開，手於瀏覽器開 `docs/index.html`。若頁缺，查構站前是否已運行 `devtools::document()`。

### 步驟五：部署至 GitHub Pages

**法甲：GitHub Actions（建議）**

見 `setup-github-actions-ci` 技能之 pkgdown 工作流。

**法乙：手動分支部署**

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

**預期：** `gh-pages` 分支存於遠端，站文件於根層級。

**失敗時：** 若推被拒，確有倉庫寫權限。若用 GitHub Actions 部署，略此步並循 `setup-github-actions-ci` 技能。

### 步驟六：配置 GitHub Pages

1. 至倉庫 Settings > Pages
2. Source 設為「Deploy from a branch」
3. 選 `gh-pages` 分支、`/ (root)` 資料夾
4. 存

**預期：** 站於數分鐘內於 `https://username.github.io/packagename/` 可用。

**失敗時：** 若站返 404，驗 Pages 源合部署法（分支部署須「Deploy from a branch」）。查 `_pkgdown.yml` 中 `development: mode: release` 已設。

### 步驟七：加 URL 至 DESCRIPTION

```
URL: https://username.github.io/packagename/, https://github.com/username/packagename
```

**預期：** DESCRIPTION 之 `URL` 段含 pkgdown 站 URL 與 GitHub 倉庫 URL，以逗分。

**失敗時：** 若 `R CMD check` 警 URL 無效，先驗 pkgdown 站確實部署且可達，後加 URL。

## 驗證

- [ ] 站於本地無錯構建
- [ ] 所有函數參考頁正渲染
- [ ] 文章／vignettes 可達且正渲染
- [ ] 搜索功能工作
- [ ] 導航連結正確
- [ ] 站成部署至 GitHub Pages
- [ ] 已部署站無 404
- [ ] `_pkgdown.yml` 中 `development: mode: release` 已設

## 常見陷阱

- **部署後之 404**：幾皆因 `development: mode: auto`（預設）。改為 `mode: release`
- **參考頁缺**：函數須已導出且已文檔。先運行 `devtools::document()`
- **破之 vignette 連結**：交叉引用用 `vignette("name")` 語法，非文件路徑
- **標誌不顯**：標誌置於 `man/figures/logo.png`，於 `_pkgdown.yml` 引之
- **搜索不工**：須 `_pkgdown.yml` 之 `url` 段正設
- **混合系統之誤 R 二進位**：WSL 或 Docker 中，`Rscript` 或解為跨平台包裝而非原生 R。以 `which Rscript && Rscript --version` 查。為可靠，宜用原生 R 二進位（如 Linux/WSL 之 `/usr/local/bin/Rscript`）。見 [Setting Up Your Environment](../../guides/setting-up-your-environment.md) 之 R 路徑配置。

## 相關技能

- `setup-github-actions-ci` — 自動化 pkgdown 部署工作流
- `write-roxygen-docs` — 於站顯之函數文檔
- `write-vignette` — 於站導航顯之文章
- `release-package-version` — 發布時觸站重構
