---
name: create-github-release
description: >
  创建带有适当标签、发布说明和可选构建产物的 GitHub 发布版本。涵盖语义化版本控制、
  变更日志生成以及 GitHub CLI 的使用。适用于为分发标记稳定版本、发布新的库或
  应用程序版本、为利益相关者创建发布说明，或分发构建产物（二进制文件、压缩包）。
locale: zh-CN
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: git
  complexity: basic
  language: multi
  tags: github, release, git-tags, changelog, versioning
---

# 创建 GitHub 发布版本

创建带有发布说明和可选产物的已标记 GitHub 发布版本。

## 适用场景

- 标记软件的稳定版本以供分发
- 发布库或应用程序的新版本
- 为利益相关者创建发布说明
- 分发构建产物（二进制文件、压缩包）

## 输入

- **必需**：版本号（语义化版本控制）
- **必需**：自上次发布以来的更改摘要
- **可选**：要附加的构建产物
- **可选**：是否为预发布版本

## 步骤

### 第 1 步：确定版本号

遵循语义化版本控制（`MAJOR.MINOR.PATCH`）：

| 变更类型 | 示例 | 适用场景 |
|--------|---------|------|
| MAJOR | 1.0.0 -> 2.0.0 | 破坏性变更 |
| MINOR | 1.0.0 -> 1.1.0 | 新功能，向后兼容 |
| PATCH | 1.0.0 -> 1.0.1 | 仅问题修复 |

**预期结果：** 所选版本号准确反映了自上次发布以来的变更范围。

**失败处理：** 若不确定变更是否属于破坏性变更，请审查公共 API 差异。任何已导出函数的删除或签名变更都是需要提升 MAJOR 版本的破坏性变更。

### 第 2 步：更新项目文件中的版本号

- `DESCRIPTION`（R 包）
- `package.json`（Node.js）
- `Cargo.toml`（Rust）
- `pyproject.toml`（Python）

**预期结果：** 版本号已在相应项目文件中更新并提交到版本控制。

**失败处理：** 若版本在前序步骤中已更新（例如通过 R 中的 `usethis::use_version()`），请验证其与预期发布版本一致。

### 第 3 步：撰写发布说明

创建或更新变更日志，按类别组织：

```markdown
## What's Changed

### New Features
- Added user authentication (#42)
- Support for custom themes (#45)

### Bug Fixes
- Fixed crash on empty input (#38)
- Corrected date parsing in UTC (#41)

### Improvements
- Improved error messages
- Updated dependencies

### Breaking Changes
- `old_function()` renamed to `new_function()` (#50)

**Full Changelog**: https://github.com/user/repo/compare/v1.0.0...v1.1.0
```

**预期结果：** 发布说明按类别（功能、修复、破坏性变更）组织，并附有 Issue/PR 引用以便追溯。

**失败处理：** 若难以对变更分类，使用 `git log v1.0.0..HEAD --oneline` 重建自上次发布以来的变更列表。

### 第 4 步：创建 Git 标签

```bash
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0
```

**预期结果：** 带注释的标签 `v1.1.0` 在本地和远程均存在，`git tag -l` 显示该标签。

**失败处理：** 若标签已存在，使用 `git tag -d v1.1.0 && git push origin :refs/tags/v1.1.0` 删除后重新创建。若推送被拒绝，请确认对远程有写权限。

### 第 5 步：创建 GitHub 发布版本

**使用 GitHub CLI（推荐）**：

```bash
gh release create v1.1.0 \
  --title "v1.1.0" \
  --notes-file CHANGELOG.md
```

附加产物：

```bash
gh release create v1.1.0 \
  --title "v1.1.0" \
  --notes "Release notes here" \
  build/app-v1.1.0.tar.gz \
  build/app-v1.1.0.zip
```

预发布版本：

```bash
gh release create v2.0.0-beta.1 \
  --title "v2.0.0 Beta 1" \
  --prerelease \
  --notes "Beta release for testing"
```

**预期结果：** 发布版本在 GitHub 上可见，包含标签、说明及附加产物（如有）。

**失败处理：** 若 `gh` 未认证，运行 `gh auth login`。若标签在远程不存在，先使用 `git push origin v1.1.0` 推送。

### 第 6 步：自动生成发布说明

GitHub 可从已合并的 PR 自动生成说明：

```bash
gh release create v1.1.0 \
  --title "v1.1.0" \
  --generate-notes
```

在 `.github/release.yml` 中配置分类：

```yaml
changelog:
  categories:
    - title: New Features
      labels:
        - enhancement
    - title: Bug Fixes
      labels:
        - bug
    - title: Documentation
      labels:
        - documentation
    - title: Other Changes
      labels:
        - "*"
```

**预期结果：** 发布说明从已合并 PR 的标题自动生成，并按标签分类。`.github/release.yml` 控制分类方式。

**失败处理：** 若自动生成的说明为空，请确认 PR 是已合并（而非已关闭）且已分配标签。手动撰写说明作为备选方案。

### 第 7 步：验证发布版本

```bash
# List releases
gh release list

# View specific release
gh release view v1.1.0
```

**预期结果：** `gh release list` 显示新发布版本，`gh release view` 显示正确的标题、标签、说明和资源。

**失败处理：** 若发布版本缺失，检查 Actions 标签页查看可能失败的发布工作流。使用 `git tag -l` 验证标签是否存在。

## 验证清单

- [ ] 版本标签遵循语义化版本控制
- [ ] Git 标签指向正确的提交
- [ ] 发布说明准确描述了变更内容
- [ ] 产物（如有）已附加且可下载
- [ ] 发布版本在 GitHub 仓库页面上可见
- [ ] 预发布标志设置正确

## 常见问题

- **标记了错误的提交**：打标签前始终验证 `git log`。在版本号更新提交后再打标签。
- **忘记推送标签**：`git push` 不会推送标签，使用 `git push --tags` 或 `git push origin v1.1.0`。
- **版本格式不一致**：决定使用 `v1.0.0` 还是 `1.0.0` 后保持一致。
- **空的发布说明**：始终提供有意义的说明，用户需要了解变更内容。
- **删除并重新创建标签**：避免在推送后修改标签。如有需要，创建新版本。

## 相关技能

- `commit-changes` — 暂存与提交工作流
- `manage-git-branches` — 发布准备的分支管理
- `release-package-version` — R 专属发布工作流
- `configure-git-repository` — Git 设置先决条件
- `setup-github-actions-ci` — 通过 CI 自动化发布
