---
name: create-github-release
locale: wenyan-ultra
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

# 造 GitHub 發行

建含標、發注、可選構品之 GitHub 發行。

## 用

- 標軟穩版為分
- 發庫或應新版
- 為利益者建發注
- 分構品（二進、tarball）

## 入

- **必**：版號（語義版控）
- **必**：上發後變之結
- **可**：附之構品
- **可**：是否為預發

## 行

### 一：定版號

循語義版控（`MAJOR.MINOR.PATCH`）：

| 變 | 例 | 時 |
|--------|---------|------|
| MAJOR | 1.0.0 -> 2.0.0 | 破壞變 |
| MINOR | 1.0.0 -> 1.1.0 | 新能、後相容 |
| PATCH | 1.0.0 -> 1.0.1 | 僅修誤 |

**得：** 擇版號合上發後變範。

**敗：** 疑變為破壞→察公 API 差。出函之除或簽變為破壞變、須 MAJOR 升。

### 二：於案檔更版

- `DESCRIPTION`（R 包）
- `package.json`（Node.js）
- `Cargo.toml`（Rust）
- `pyproject.toml`（Python）

**得：** 版號於合案檔中更且承於控。

**敗：** 版已於前步更（如 R 中 `usethis::use_version()`）→驗合欲發之版。

### 三：書發注

建或更 changelog。按類組：

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

**得：** 發注按類組（能、修、破壞變）含議/PR 引可追。

**敗：** 變難類→察 `git log v1.0.0..HEAD --oneline` 以重構上發後變列。

### 四：建 git 標

```bash
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0
```

**得：** 註標 `v1.1.0` 存於地與遠。`git tag -l` 顯標。

**敗：** 標已存→以 `git tag -d v1.1.0 && git push origin :refs/tags/v1.1.0` 刪重建。推拒→確寫權於遠。

### 五：建 GitHub 發行

**用 GitHub CLI（宜）**：

```bash
gh release create v1.1.0 \
  --title "v1.1.0" \
  --notes-file CHANGELOG.md
```

含品：

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

**得：** 發顯於 GitHub 含標、注、附品（若有）。

**敗：** `gh` 未證→行 `gh auth login`。標不存於遠→先以 `git push origin v1.1.0` 推。

### 六：自生發注

GitHub 可自併 PR 生注：

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

**得：** 發注自併 PR 標生、按標類。`.github/release.yml` 控類。

**敗：** 自生注空→保 PR 已併（非閉）且含標。手書注為退。

### 七：驗發

```bash
# List releases
gh release list

# View specific release
gh release view v1.1.0
```

**得：** `gh release list` 顯新發。`gh release view` 顯正標、標籤、注、資。

**敗：** 發缺→察 Actions 頁有敗之發流。以 `git tag -l` 驗標存。

## 驗

- [ ] 版標循語義版控
- [ ] Git 標指正承
- [ ] 發注合述變
- [ ] 品（若有）附且可下
- [ ] 發顯於 GitHub 庫頁
- [ ] 預發旗設正

## 忌

- **標誤承**：標前恆驗 `git log`。版升承後方標
- **忘推標**：`git push` 不推標。用 `git push --tags` 或 `git push origin v1.1.0`
- **版式不一**：擇 `v1.0.0` 或 `1.0.0` 一貫
- **發注空**：恆予義注。用須知所變
- **刪重建標**：避推後改標。須則建新版

## 參

- `commit-changes` - 階與承流
- `manage-git-branches` - 發備之枝理
- `release-package-version` - R 專發流
- `configure-git-repository` - Git 前設
- `setup-github-actions-ci` - 以 CI 自動發
