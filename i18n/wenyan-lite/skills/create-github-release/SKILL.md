---
name: create-github-release
locale: wenyan-lite
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

# 造 GitHub 版本

造標記之 GitHub 版本，含發布說明與選擇性構件。

## 適用時機

- 標軟體之穩定版本以供分發
- 發布新版庫或應用
- 為相關者造發布說明
- 分發構件（二進制、tarball）

## 輸入

- **必要**：版本號（語意化版本）
- **必要**：自上次發布以來之改動摘要
- **選擇性**：待附之構件
- **選擇性**：是否為預發布

## 步驟

### 步驟一：定版本號

循語意化版本（`MAJOR.MINOR.PATCH`）：

| 改動 | 範例 | 時 |
|--------|---------|------|
| MAJOR | 1.0.0 -> 2.0.0 | 破壞性改動 |
| MINOR | 1.0.0 -> 1.1.0 | 新功能，向後相容 |
| PATCH | 1.0.0 -> 1.0.1 | 唯修錯 |

**預期：** 擇之版本號準確反映自上次發布以來之改動範圍。

**失敗時：** 疑改動是否破壞，察公開 API 之差異。已匯出函式之任何移除或簽名改皆為破壞性改動，需 MAJOR 升。

### 步驟二：更項目檔中之版本

- `DESCRIPTION`（R 套件）
- `package.json`（Node.js）
- `Cargo.toml`（Rust）
- `pyproject.toml`（Python）

**預期：** 版本號已更於當之項目檔，並提交至版本控制。

**失敗時：** 若版本前步已更（如 R 中之 `usethis::use_version()`），驗其合所欲之發布版本。

### 步驟三：寫發布說明

造或更變更日誌。按類組之：

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

**預期：** 發布說明按類組（功能、修錯、破壞性改動），含議題/PR 引以便追溯。

**失敗時：** 若改動難類，察 `git log v1.0.0..HEAD --oneline` 以重建自上次發布以來之改動清單。

### 步驟四：造 Git 標籤

```bash
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0
```

**預期：** 註記標 `v1.1.0` 存於本地與遠端。`git tag -l` 顯之。

**失敗時：** 若標已存，以 `git tag -d v1.1.0 && git push origin :refs/tags/v1.1.0` 刪之並重造。若推被拒，確認有遠端之寫權。

### 步驟五：造 GitHub 版本

**以 GitHub CLI（建議）**：

```bash
gh release create v1.1.0 \
  --title "v1.1.0" \
  --notes-file CHANGELOG.md
```

含構件：

```bash
gh release create v1.1.0 \
  --title "v1.1.0" \
  --notes "Release notes here" \
  build/app-v1.1.0.tar.gz \
  build/app-v1.1.0.zip
```

預發布：

```bash
gh release create v2.0.0-beta.1 \
  --title "v2.0.0 Beta 1" \
  --prerelease \
  --notes "Beta release for testing"
```

**預期：** 版本於 GitHub 可見，含標、說明、附之構件（若有）。

**失敗時：** 若 `gh` 未認證，行 `gh auth login`。若標於遠端不存，先以 `git push origin v1.1.0` 推之。

### 步驟六：自動生發布說明

GitHub 可自合併之 PR 生說明：

```bash
gh release create v1.1.0 \
  --title "v1.1.0" \
  --generate-notes
```

於 `.github/release.yml` 配類：

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

**預期：** 自合併之 PR 標題生發布說明，按標籤分類。`.github/release.yml` 控類。

**失敗時：** 若自動生之說明空，確認 PR 為合併（非關），且有標籤。手動寫說明為回退。

### 步驟七：驗版本

```bash
# List releases
gh release list

# View specific release
gh release view v1.1.0
```

**預期：** `gh release list` 顯新版本。`gh release view` 顯正確之標題、標、說明、資產。

**失敗時：** 若版本缺，察 Actions 標以察任何敗之版本工作流。以 `git tag -l` 驗標存否。

## 驗證

- [ ] 版本標循語意化版本
- [ ] Git 標指正確之提交
- [ ] 發布說明準確述改動
- [ ] 構件（若有）已附且可下載
- [ ] 版本於 GitHub 倉頁可見
- [ ] 預發布標正確設

## 常見陷阱

- **標錯提交**：標前恒驗 `git log`。於版本升提交後標
- **忘推標**：`git push` 不推標。用 `git push --tags` 或 `git push origin v1.1.0`
- **版本格式不一**：決 `v1.0.0` 或 `1.0.0` 並守之
- **空發布說明**：恒提供有意義之說明。用戶需知改動
- **刪並重造標**：推後避改標。若需，造新版本代之

## 相關技能

- `commit-changes` - 暫存與提交工作流
- `manage-git-branches` - 發布備置之分支管理
- `release-package-version` - R 專屬之發布工作流
- `configure-git-repository` - Git 立之前置
- `setup-github-actions-ci` - 以 CI 自動化發布
