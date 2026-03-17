---
name: build-pkgdown-site
description: >
  为 R 包构建并将 pkgdown 文档站点部署至 GitHub Pages。涵盖
  _pkgdown.yml 配置、主题设置、文章组织、参考索引定制及部署方式。
  适用于为新建或现有包创建文档站点、定制布局或导航、修复已部署
  站点上的 404 错误，或在分支部署与 GitHub Actions 部署方式之间迁移。
locale: zh-CN
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
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

# 构建 pkgdown 站点

为 R 包配置并部署 pkgdown 文档网站。

## 适用场景

- 为 R 包创建文档站点
- 自定义 pkgdown 布局、主题或导航
- 修复已部署 pkgdown 站点上的 404 错误
- 在部署方式之间迁移

## 输入

- **必需**：具有 roxygen2 文档的 R 包
- **必需**：GitHub 仓库
- **可选**：自定义主题或品牌标识
- **可选**：作为文章包含的 vignette

## 步骤

### 第 1 步：初始化 pkgdown

```r
usethis::use_pkgdown()
```

此步骤创建 `_pkgdown.yml` 并将 pkgdown 添加至 `.Rbuildignore`。

**预期结果：** `_pkgdown.yml` 存在于项目根目录。`.Rbuildignore` 包含 pkgdown 相关条目。

**失败处理：** 使用 `install.packages("pkgdown")` 安装 pkgdown。若 `_pkgdown.yml` 已存在，该函数将更新 `.Rbuildignore` 而不会覆盖配置文件。

### 第 2 步：配置 `_pkgdown.yml`

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

**关键提示**：设置 `development: mode: release`。默认的 `mode: auto` 会因在 URL 中追加 `/dev/` 而导致 GitHub Pages 上出现 404 错误。

**预期结果：** `_pkgdown.yml` 包含有效的 YAML，具有适合该包的 `url`、`template`、`navbar`、`reference` 和 `articles` 部分。

**失败处理：** 使用在线 YAML 语法检查器验证语法。确保 `reference.contents` 中的所有函数名与实际导出的函数匹配。

### 第 3 步：本地构建

```r
pkgdown::build_site()
```

**预期结果：** `docs/` 目录已创建，包含完整站点，包括 `index.html`、函数参考页面和文章。

**失败处理：** 常见问题：找不到 pandoc（在 `.Renviron` 中设置 `RSTUDIO_PANDOC`）、缺少 vignette 依赖（安装 Suggests 中列出的包）、示例有问题（修复或用 `\dontrun{}` 包裹）。

### 第 4 步：本地预览

```r
pkgdown::preview_site()
```

验证导航、函数参考、文章和搜索是否正常工作。

**预期结果：** 站点在浏览器中于 localhost 打开。所有导航链接有效，函数参考页面正常渲染，搜索返回结果。

**失败处理：** 若预览未打开，手动在浏览器中打开 `docs/index.html`。若页面缺失，检查构建站点前是否已运行 `devtools::document()`。

### 第 5 步：部署至 GitHub Pages

**方式 A：GitHub Actions（推荐）**

参见 `setup-github-actions-ci` 技能中的 pkgdown 工作流。

**方式 B：手动分支部署**

```bash
# 构建站点
Rscript -e "pkgdown::build_site()"

# 若 gh-pages 分支不存在则创建
git checkout --orphan gh-pages
git rm -rf .
cp -r docs/* .
git add .
git commit -m "Deploy pkgdown site"
git push origin gh-pages

# 切换回 main
git checkout main
```

**预期结果：** `gh-pages` 分支在远程存在，站点文件位于根目录级别。

**失败处理：** 若推送被拒绝，确认具有仓库写入权限。若改用 GitHub Actions 部署，跳过此步骤并遵循 `setup-github-actions-ci` 技能。

### 第 6 步：配置 GitHub Pages

1. 进入仓库 Settings > Pages
2. 将 Source 设置为"Deploy from a branch"
3. 选择 `gh-pages` 分支，`/ (root)` 文件夹
4. 保存

**预期结果：** 站点在几分钟内可通过 `https://username.github.io/packagename/` 访问。

**失败处理：** 若站点返回 404，确认 Pages 源与部署方式匹配（分支部署需选择"Deploy from a branch"）。检查 `_pkgdown.yml` 中是否已设置 `development: mode: release`。

### 第 7 步：将 URL 添加至 DESCRIPTION

```
URL: https://username.github.io/packagename/, https://github.com/username/packagename
```

**预期结果：** DESCRIPTION `URL` 字段包含 pkgdown 站点 URL 和 GitHub 仓库 URL，以逗号分隔。

**失败处理：** 若 `R CMD check` 警告 URL 无效，在添加 URL 前确认 pkgdown 站点已实际部署且可访问。

## 验证清单

- [ ] 站点在本地构建无错误
- [ ] 所有函数参考页面正常渲染
- [ ] 文章/vignette 可访问且渲染正确
- [ ] 搜索功能正常
- [ ] 导航链接正确
- [ ] 站点成功部署至 GitHub Pages
- [ ] 已部署站点无 404 错误
- [ ] `_pkgdown.yml` 中已设置 `development: mode: release`

## 常见问题

- **部署后 404 错误**：几乎总是由 `development: mode: auto`（默认值）引起，改为 `mode: release`。
- **缺少参考页面**：函数必须已导出且有文档，先运行 `devtools::document()`。
- **vignette 链接失效**：在交叉引用中使用 `vignette("name")` 语法，而非文件路径。
- **Logo 不显示**：将 logo 放置于 `man/figures/logo.png` 并在 `_pkgdown.yml` 中引用。
- **搜索不工作**：需要在 `_pkgdown.yml` 中正确设置 `url` 字段。

## 相关技能

- `setup-github-actions-ci` — 自动化 pkgdown 部署工作流
- `write-roxygen-docs` — 站点上显示的函数文档
- `write-vignette` — 出现在站点导航中的文章
- `release-package-version` — 发布版本时触发站点重建
