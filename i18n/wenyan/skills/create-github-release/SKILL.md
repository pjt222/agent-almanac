---
name: create-github-release
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Create a GitHub release with proper tagging, release notes,
  and optional build artifacts. Covers semantic versioning,
  changelog generation, and GitHub CLI usage. Use when marking a stable
  version of software for distribution, publishing a new library or
  application version, creating release notes for stakeholders, or
  distributing build artifacts (binaries, tarballs).
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

# 建 GitHub 發布

建有標之 GitHub 發布，含發布記與可選之建物。

## 用時

- 標軟件之穩版以布
- 發庫或應用新版
- 為相關者建發布記
- 布建物（二進、tarball）

## 入

- **必要**：版號（語義版本）
- **必要**：自上發以來變之概
- **可選**：附之建物
- **可選**：此為預發否

## 法

### 第一步：定版號

循語義版本（`MAJOR.MINOR.PATCH`）：

| 變 | 例 | 時 |
|--------|---------|------|
| MAJOR | 1.0.0 -> 2.0.0 | 破壞性變 |
| MINOR | 1.0.0 -> 1.1.0 | 新功，向後兼容 |
| PATCH | 1.0.0 -> 1.0.1 | 唯修訛 |

**得：** 擇版號正映自上發以來變之範圍。

**敗則：** 若疑變為破壞否，察公 API 之差。出之函刪或簽變皆破壞，需升 MAJOR。

### 第二步：更項目文件之版

- `DESCRIPTION`（R 包）
- `package.json`（Node.js）
- `Cargo.toml`（Rust）
- `pyproject.toml`（Python）

**得：** 版號於宜文件已更並提交版控。

**敗則：** 若前步已更（如 R 之 `usethis::use_version()`），驗其合意圖之發版。

### 第三步：書發布記

建或更變更誌。按類組：

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

**得：** 發布記按類組（功、修、破壞），含議題／PR 引以可追。

**敗則：** 若變難分類，察 `git log v1.0.0..HEAD --oneline` 以復自上發以來之變列。

### 第四步：建 git 標

```bash
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0
```

**得：** 註釋標 `v1.1.0` 存於本地與遠。`git tag -l` 顯之。

**敗則：** 若標已存，以 `git tag -d v1.1.0 && git push origin :refs/tags/v1.1.0` 刪之再建。若推拒，確有遠之寫權。

### 第五步：建 GitHub 發布

**用 GitHub CLI（宜）**：

```bash
gh release create v1.1.0 \
  --title "v1.1.0" \
  --notes-file CHANGELOG.md
```

含建物：

```bash
gh release create v1.1.0 \
  --title "v1.1.0" \
  --notes "Release notes here" \
  build/app-v1.1.0.tar.gz \
  build/app-v1.1.0.zip
```

預發：

```bash
gh release create v2.0.0-beta.1 \
  --title "v2.0.0 Beta 1" \
  --prerelease \
  --notes "Beta release for testing"
```

**得：** 發布現於 GitHub 含標、記、附物（若有）。

**敗則：** 若 `gh` 未認證，運 `gh auth login`。若標未於遠，以 `git push origin v1.1.0` 先推之。

### 第六步：自動生發布記

GitHub 可由已合 PR 自動生記：

```bash
gh release create v1.1.0 \
  --title "v1.1.0" \
  --generate-notes
```

於 `.github/release.yml` 設類：

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

**得：** 發布記由已合 PR 題自動生，按標分類。`.github/release.yml` 控類。

**敗則：** 若自動記為空，確 PR 已合（非閉）且有標。手書記為退。

### 第七步：驗發布

```bash
# List releases
gh release list

# View specific release
gh release view v1.1.0
```

**得：** `gh release list` 顯新發。`gh release view` 顯正題、標、記、資。

**敗則：** 若發缺，察 Actions 頁以見是否有發工作流敗。以 `git tag -l` 驗標存。

## 驗

- [ ] 版標循語義版本
- [ ] git 標指正提交
- [ ] 發布記正述變
- [ ] 附物（若有）可附可下
- [ ] 發布現於 GitHub 庫頁
- [ ] 預發旗正設

## 陷

- **標誤提交**：標前宜驗 `git log`。版升提交後乃標。
- **忘推標**：`git push` 不推標。用 `git push --tags` 或 `git push origin v1.1.0`。
- **版式不一**：於 `v1.0.0` 對 `1.0.0` 中擇一而守之。
- **發布記空**：宜供有意之記。用者需知所變。
- **刪而重建標**：推後勿改標。若需，建新版代之。

## 參

- `commit-changes` — 暫存與提交流
- `manage-git-branches` — 為發備之分支管
- `release-package-version` — R 專用發流
- `configure-git-repository` — Git 設前提
- `setup-github-actions-ci` — 以 CI 自動發
