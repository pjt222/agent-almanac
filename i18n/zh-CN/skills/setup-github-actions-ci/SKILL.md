---
name: setup-github-actions-ci
description: >
  为 R 包配置 GitHub Actions CI/CD，包括多平台 R CMD check、
  测试覆盖率报告及 pkgdown 站点部署。使用 r-lib/actions 标准
  工作流。适用于为新 R 包设置 CI/CD、向现有包添加多平台测试、
  配置自动化 pkgdown 站点部署，或为仓库添加代码覆盖率报告。
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
  tags: r, github-actions, ci-cd, testing, automation
---

# 为 R 包设置 GitHub Actions CI

通过 GitHub Actions 配置自动化的 R CMD check、测试覆盖率和文档部署。

## 适用场景

- 为 GitHub 上的新 R 包设置 CI/CD
- 向现有包添加多平台测试
- 配置自动化 pkgdown 站点部署
- 添加代码覆盖率报告

## 输入

- **必需**：具有有效 DESCRIPTION 和测试的 R 包
- **必需**：GitHub 仓库（公开或私有）
- **可选**：是否包含 pkgdown 部署（默认：否）
- **可选**：是否包含覆盖率报告（默认：否）

## 步骤

### 第 1 步：创建 R CMD Check 工作流

创建 `.github/workflows/R-CMD-check.yaml`：

```yaml
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

name: R-CMD-check

permissions: read-all

jobs:
  R-CMD-check:
    runs-on: ${{ matrix.config.os }}

    name: ${{ matrix.config.os }} (${{ matrix.config.r }})

    strategy:
      fail-fast: false
      matrix:
        config:
          - {os: macos-latest, r: 'release'}
          - {os: windows-latest, r: 'release'}
          - {os: ubuntu-latest, r: 'devel', http-user-agent: 'release'}
          - {os: ubuntu-latest, r: 'release'}
          - {os: ubuntu-latest, r: 'oldrel-1'}

    env:
      GITHUB_PAT: ${{ secrets.GITHUB_TOKEN }}
      R_KEEP_PKG_SOURCE: yes

    steps:
      - uses: actions/checkout@v4

      - uses: r-lib/actions/setup-pandoc@v2

      - uses: r-lib/actions/setup-r@v2
        with:
          r-version: ${{ matrix.config.r }}
          http-user-agent: ${{ matrix.config.http-user-agent }}
          use-public-rspm: true

      - uses: r-lib/actions/setup-r-dependencies@v2
        with:
          extra-packages: any::rcmdcheck
          needs: check

      - uses: r-lib/actions/check-r-package@v2
        with:
          upload-snapshots: true
          build_args: 'c("--no-manual", "--compact-vignettes=gs+qpdf")'
```

**预期结果：** 工作流文件 `.github/workflows/R-CMD-check.yaml` 已创建，包含覆盖 release、devel 和 oldrel 的多平台矩阵（macOS、Windows、Ubuntu）。

**失败处理：** 若 `.github/workflows/` 目录不存在，使用 `mkdir -p .github/workflows` 创建。使用 YAML 语法检查器验证 YAML 语法。

### 第 2 步：创建测试覆盖率工作流（可选）

创建 `.github/workflows/test-coverage.yaml`：

```yaml
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

name: test-coverage

permissions: read-all

jobs:
  test-coverage:
    runs-on: ubuntu-latest

    env:
      GITHUB_PAT: ${{ secrets.GITHUB_TOKEN }}

    steps:
      - uses: actions/checkout@v4

      - uses: r-lib/actions/setup-r@v2
        with:
          use-public-rspm: true

      - uses: r-lib/actions/setup-r-dependencies@v2
        with:
          extra-packages: any::covr, any::xml2
          needs: coverage

      - name: Test coverage
        run: |
          cov <- covr::package_coverage(
            quiet = FALSE,
            clean = FALSE,
            install_path = file.path(normalizePath(Sys.getenv("RUNNER_TEMP"), winslash = "/"), "package")
          )
          covr::to_cobertura(cov)
        shell: Rscript {0}

      - uses: codecov/codecov-action@v4
        with:
          fail_ci_if_error: ${{ github.event_name != 'pull_request' && true || false }}
          file: ./cobertura.xml
          plugin: noop
          token: ${{ secrets.CODECOV_TOKEN }}
```

**预期结果：** 工作流文件 `.github/workflows/test-coverage.yaml` 已创建。覆盖率报告将在每次推送和 PR 时上传至 Codecov。

**失败处理：** 若 Codecov 上传失败，确认 `CODECOV_TOKEN` 密钥已在仓库设置中配置。对于公开仓库，该 token 可能不是必需的。

### 第 3 步：创建 pkgdown 部署工作流（可选）

创建 `.github/workflows/pkgdown.yaml`：

```yaml
on:
  push:
    branches: [main, master]
  release:
    types: [published]
  workflow_dispatch:

name: pkgdown

permissions:
  contents: write
  pages: write

jobs:
  pkgdown:
    runs-on: ubuntu-latest

    env:
      GITHUB_PAT: ${{ secrets.GITHUB_TOKEN }}

    steps:
      - uses: actions/checkout@v4

      - uses: r-lib/actions/setup-pandoc@v2

      - uses: r-lib/actions/setup-r@v2
        with:
          use-public-rspm: true

      - uses: r-lib/actions/setup-r-dependencies@v2
        with:
          extra-packages: any::pkgdown, local::.
          needs: website

      - name: Build site
        run: pkgdown::build_site_github_pages(new_process = FALSE, install = FALSE)
        shell: Rscript {0}

      - name: Deploy to GitHub pages
        if: github.event_name != 'pull_request'
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          clean: false
          branch: gh-pages
          folder: docs
```

**预期结果：** 工作流文件 `.github/workflows/pkgdown.yaml` 已创建。站点在推送至 main 或发布版本时构建并部署至 `gh-pages` 分支。

**失败处理：** 若部署失败，确认仓库已启用 `contents: write` 权限。确认 `_pkgdown.yml` 中已设置 `development: mode: release`。

### 第 4 步：向 README 添加状态徽章

在 `README.md` 中添加：

```markdown
[![R-CMD-check](https://github.com/USERNAME/REPO/actions/workflows/R-CMD-check.yaml/badge.svg)](https://github.com/USERNAME/REPO/actions/workflows/R-CMD-check.yaml)
```

**预期结果：** README 显示实时 CI 状态徽章，每次工作流运行后自动更新。

**失败处理：** 若徽章显示"no status"，确认徽章 URL 中的工作流文件名与实际文件匹配。推送一个提交以触发第一次工作流运行。

### 第 5 步：配置 GitHub 仓库设置

1. 若使用 pkgdown，启用 GitHub Pages（Settings > Pages），指向 `gh-pages` 分支
2. 若使用覆盖率报告，添加 `CODECOV_TOKEN` 密钥
3. 确认 `GITHUB_TOKEN` 具有适当权限

**预期结果：** GitHub Pages 已为 pkgdown 部署配置。所需密钥已设置。Token 权限足以支撑工作流。

**失败处理：** 若 Pages 部署失败，检查 Settings > Pages，确认源设置为 `gh-pages` 分支。若密钥缺失，在 Settings > Secrets and variables > Actions 中添加。

### 第 6 步：推送并验证

```bash
git add .github/
git commit -m "Add GitHub Actions CI workflows"
git push
```

在 GitHub 的 Actions 标签页中验证工作流是否成功运行。

**预期结果：** GitHub Actions 标签页中所有作业显示绿色勾号。工作流在推送和 PR 事件时均触发。

**失败处理：** 在 Actions 标签页中查看工作流日志。常见问题：缺少系统依赖（添加至 `extra-packages`）、vignette 构建失败（确认存在 pandoc 设置步骤）、YAML 语法错误。

## 验证清单

- [ ] R CMD check 在所有矩阵平台上通过
- [ ] 覆盖率报告生成（若已配置）
- [ ] pkgdown 站点部署（若已配置）
- [ ] README 中显示状态徽章
- [ ] 工作流在推送和 PR 时均触发

## 常见问题

- **缺少 `permissions`**：GitHub Actions 现在要求明确指定权限，至少添加 `permissions: read-all`
- **系统依赖**：部分 R 包需要系统库，使用 `r-lib/actions/setup-r-dependencies` 可自动处理大多数情况
- **没有 pandoc 的 vignette**：始终包含 `r-lib/actions/setup-pandoc@v2`
- **pkgdown 开发模式**：确认 `_pkgdown.yml` 中设置 `development: mode: release` 以用于 GitHub Pages
- **缓存问题**：`r-lib/actions/setup-r-dependencies` 自动处理缓存

## 相关技能

- `create-r-package` — 包含 CI 工作流的包初始化
- `build-pkgdown-site` — pkgdown 详细配置
- `submit-to-cran` — CI 检查应与 CRAN 期望一致
- `release-package-version` — 发布版本时触发部署
