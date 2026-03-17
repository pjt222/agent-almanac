---
name: release-package-version
description: >
  发布 R 包新版本，包括版本号递增、NEWS.md 更新、git 标签创建、
  GitHub release 创建及发布后开发版本设置。适用于包已准备好发布
  新的补丁、次要或主要版本、CRAN 接受后创建对应的 GitHub release，
  或在发布后立即设置开发版本递增的场景。
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
  tags: r, versioning, release, git-tags, changelog
---

# 发布包版本

执行 R 包版本发布的完整周期。

## 适用场景

- 准备好发布新版本（缺陷修复、功能或破坏性变更）
- CRAN 接受后，创建对应的 GitHub release
- 设置发布后的开发版本

## 输入

- **必需**：已准备好发布变更的包
- **必需**：发布类型：patch（0.1.0 -> 0.1.1）、minor（0.1.0 -> 0.2.0）或 major（0.1.0 -> 1.0.0）
- **可选**：是否提交至 CRAN（默认：否，单独使用 `submit-to-cran` 技能）

## 步骤

### 第 1 步：确定版本递增类型

遵循语义化版本规范：

| 变更类型 | 版本递增 | 示例 |
|-------------|-------------|---------|
| 仅缺陷修复 | Patch | 0.1.0 -> 0.1.1 |
| 新功能（向后兼容） | Minor | 0.1.0 -> 0.2.0 |
| 破坏性变更 | Major | 0.1.0 -> 1.0.0 |

**预期结果：** 根据自上次发布以来的变更性质，确定正确的递增类型（patch、minor 或 major）。

**失败处理：** 若不确定，查看自上次标签以来的 `git log` 并对每个变更分类。任何破坏性 API 变更都需要 major 递增。

### 第 2 步：更新版本

```r
usethis::use_version("minor")  # 或 "patch" 或 "major"
```

此命令更新 DESCRIPTION 中的 `Version` 字段并在 NEWS.md 中添加标题。

**预期结果：** DESCRIPTION 版本已更新。NEWS.md 有该发布版本的新章节标题。

**失败处理：** 若 `usethis::use_version()` 不可用，手动更新 DESCRIPTION 中的 `Version` 字段，并在 NEWS.md 中添加 `# packagename x.y.z` 标题。

### 第 3 步：更新 NEWS.md

在新版本标题下填写发布说明：

```markdown
# packagename 0.2.0

## New Features
- Added `new_function()` for processing data (#42)
- Support for custom themes in `plot_results()` (#45)

## Bug Fixes
- Fixed crash when input contains all NAs (#38)
- Corrected off-by-one error in `window_calc()` (#41)

## Minor Improvements
- Improved error messages for invalid input types
- Updated documentation examples
```

使用 issue/PR 编号以便追溯。

**预期结果：** NEWS.md 包含按类别组织的完整面向用户变更摘要，并附有 issue/PR 编号以便追溯。

**失败处理：** 若难以重建变更记录，使用 `git log --oneline v<previous>..HEAD` 列出自上次发布以来的所有提交，并对其分类。

### 第 4 步：最终检查

```r
devtools::check()
devtools::spell_check()
urlchecker::url_check()
```

**预期结果：** `devtools::check()` 返回 0 个错误、0 个警告、0 个注记。拼写检查和 URL 检查未发现问题。

**失败处理：** 发布前修复所有错误和警告。将误报词汇添加至 `inst/WORDLIST` 供拼写检查器使用。替换失效的 URL。

### 第 5 步：提交发布版本

```bash
git add DESCRIPTION NEWS.md
git commit -m "Release packagename v0.2.0"
```

**预期结果：** 单个提交包含 DESCRIPTION 中的版本递增和更新后的 NEWS.md。

**失败处理：** 若存在其他未提交的变更，仅暂存 DESCRIPTION 和 NEWS.md。发布提交应只包含版本相关的变更。

### 第 6 步：打标签

```bash
git tag -a v0.2.0 -m "Release v0.2.0"
git push origin main --tags
```

**预期结果：** 注解标签 `v0.2.0` 已创建并推送至远程。`git tag -l` 在本地显示该标签；`git ls-remote --tags origin` 在远程确认。

**失败处理：** 若推送失败，检查是否有写入权限。若标签已存在，使用 `git show v0.2.0` 确认它指向正确的提交。

### 第 7 步：创建 GitHub Release

```bash
gh release create v0.2.0 \
  --title "packagename v0.2.0" \
  --notes-file NEWS.md
```

或使用：

```r
usethis::use_github_release()
```

**预期结果：** GitHub release 已创建，发布说明在仓库的 Releases 页面上可见。

**失败处理：** 若 `gh release create` 失败，确认 `gh` CLI 已通过身份验证（`gh auth status`）。若 `usethis::use_github_release()` 失败，在 GitHub 上手动创建 release。

### 第 8 步：设置开发版本

发布后，切换至开发版本：

```r
usethis::use_dev_version()
```

此命令将版本改为 `0.2.0.9000` 以表示开发中。

```bash
git add DESCRIPTION NEWS.md
git commit -m "Begin development for next version"
git push
```

**预期结果：** DESCRIPTION 版本现为 `0.2.0.9000`（开发版本）。NEWS.md 有开发版本的新标题。变更已推送至远程。

**失败处理：** 若 `usethis::use_dev_version()` 不可用，手动将 DESCRIPTION 中的版本改为 `x.y.z.9000`，并在 NEWS.md 中添加 `# packagename (development version)` 标题。

## 验证清单

- [ ] DESCRIPTION 中的版本与预期发布版本匹配
- [ ] NEWS.md 有完整、准确的发布说明
- [ ] `R CMD check` 通过
- [ ] Git 标签与版本匹配（如 `v0.2.0`）
- [ ] GitHub release 存在且含发布说明
- [ ] 已设置发布后开发版本（x.y.z.9000）

## 常见问题

- **忘记推送标签**：`git push` 单独不推送标签，使用 `--tags` 或 `git push origin v0.2.0`
- **NEWS.md 格式**：使用与 pkgdown/CRAN 期望格式匹配的 markdown 标题
- **对错误的提交打标签**：始终在版本递增提交之后打标签，而非之前
- **CRAN 版本已存在**：CRAN 不接受已发布的版本，始终递增版本号
- **发布版本中包含开发版本**：切勿将 `.9000` 版本提交至 CRAN

## 相关技能

- `submit-to-cran` — 版本发布后的 CRAN 提交
- `create-github-release` — 通用 GitHub release 创建
- `setup-github-actions-ci` — 发布版本时触发 pkgdown 重建
- `build-pkgdown-site` — 文档站点反映新版本
