---
name: apply-semantic-versioning
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Apply semantic versioning (SemVer 2.0.0) to determine the correct
  version bump based on change analysis. Covers major/minor/patch
  classification, pre-release identifiers, build metadata, and
  breaking change detection. Use when preparing a new release to determine
  the correct version number, after merging changes before tagging, evaluating
  whether a change constitutes a breaking change, adding pre-release identifiers,
  or resolving disagreement about what version bump is appropriate.
license: MIT
allowed-tools: Read Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: versioning
  complexity: intermediate
  language: multi
  tags: versioning, semver, version-bump, breaking-changes
---

# 施語意化版本控制

藉變更分析判並施正確之語意化版本升級。涵蓋 major/minor/patch 分類、預發識別碼、構建元資料與破壞性變更偵測。遵 [SemVer 2.0.0](https://semver.org/) 規格。

## 適用時機

- 備新發行而需判正確版本號
- 合一組變更後且於標記發行前
- 評變更是否構成破壞性變更
- 為版本加預發識別碼（alpha、beta、rc）
- 解何升級宜之歧見

## 輸入

- **必要**：含版本檔（DESCRIPTION、package.json、Cargo.toml、pyproject.toml 或 VERSION）之專案根目錄
- **必要**：自上次發行以來之 git 歷史（標籤或提交）
- **選擇性**：所用之提交慣例（Conventional Commits、自由形式）
- **選擇性**：欲施之預發標籤（alpha、beta、rc）
- **選擇性**：若不能自檔讀，則先前版本

## 步驟

### 步驟一：讀當前版本

於專案根尋並讀版本檔。

```bash
# R packages
grep "^Version:" DESCRIPTION

# Node.js
grep '"version"' package.json

# Rust
grep '^version' Cargo.toml

# Python
grep 'version' pyproject.toml

# Plain file
cat VERSION
```

將當前版本解析為 major.minor.patch 之分量。若版本含預發後綴（如 `1.2.0-beta.1`），分別注之。

**預期：** 當前版本識為 `MAJOR.MINOR.PATCH[-PRERELEASE]`。

**失敗時：** 若無版本檔現，查 VERSION 檔或 git 標籤（`git describe --tags --abbrev=0`）。若全無版本，初開發起 `0.1.0`，若專案有穩定公共 API 則起 `1.0.0`。

### 步驟二：析自上次發行以來之變更

取自上次標記發行以來之變更清單。

```bash
# Find the last version tag
git describe --tags --abbrev=0

# List commits since that tag
git log --oneline v1.2.3..HEAD

# If using Conventional Commits, filter by type
git log --oneline v1.2.3..HEAD | grep -E "^[a-f0-9]+ (feat|fix|BREAKING)"
```

若無標籤，對初提交或已知基線比。

**預期：** 提交清單附訊息，可按變更類型分類。

**失敗時：** 若 git 歷史不可用或標籤缺，請開發者人工述變更。依其述分類。

### 步驟三：分類變更

施 SemVer 分類規則：

| Change Type | Version Bump | Examples |
|---|---|---|
| **Breaking** (incompatible API change) | MAJOR | Renamed/removed public function, changed return type, removed parameter, changed default behavior |
| **Feature** (new backwards-compatible functionality) | MINOR | New exported function, new parameter with default, new file format support |
| **Fix** (backwards-compatible bug fix) | PATCH | Bug fix, documentation correction, performance improvement with same API |

分類規則：
1. 若任一變更為破壞性，升為 MAJOR（minor 與 patch 重置為 0）
2. 若無破壞性變更而有新功能，升為 MINOR（patch 重置為 0）
3. 若僅修復，升為 PATCH

特例：
- **Pre-1.0.0**：初開發期間（`0.x.y`），minor 升或含破壞性變更。明文記
- **棄用**：棄用函式為 MINOR 變更（仍可工）。移除為 MAJOR
- **內部變更**：不改公共 API 之重構為 PATCH

**預期：** 每變更分為破壞／功能／修復，整體升級層次已判。

**失敗時：** 若變更曖昧，寧高升。保守之 major 升勝於斷下游碼之 minor 升。

### 步驟四：計新版本

對當前版本施升級：

| Current | Bump | New Version |
|---|---|---|
| 1.2.3 | MAJOR | 2.0.0 |
| 1.2.3 | MINOR | 1.3.0 |
| 1.2.3 | PATCH | 1.2.4 |
| 0.9.5 | MINOR | 0.10.0 |
| 2.0.0-rc.1 | (release) | 2.0.0 |

若請預發標籤：
- `1.3.0-alpha.1` 為將來 1.3.0 之首 alpha
- `1.3.0-beta.1` 為首 beta
- `1.3.0-rc.1` 為首發行候選

預發優先：`alpha < beta < rc < (release)`。

**預期：** 新版本號依 SemVer 規則計算。

**失敗時：** 若當前版本格式錯或非 SemVer，先正規化之。如 `1.2` 化為 `1.2.0`。

### 步驟五：更新版本檔

將新版本寫至宜檔。

```r
# R: Update DESCRIPTION
# Change "Version: 1.2.3" to "Version: 1.3.0"
```

```json
// Node.js: Update package.json
// Change "version": "1.2.3" to "version": "1.3.0"
// Also update package-lock.json if present
```

```toml
# Rust: Update Cargo.toml
# Change version = "1.2.3" to version = "1.3.0"
```

若專案有多檔引用版本（如 `_pkgdown.yml`、`CITATION`、`codemeta.json`），皆更新。

**預期：** 一切版本檔一致更新至新版本號。

**失敗時：** 若檔更新失敗，回退一切變更以保一致。從不留版本檔於部分更新之態。

### 步驟六：建版本標籤

提交版本升後，建 git 標籤。

```bash
# Annotated tag (preferred)
git tag -a v1.3.0 -m "Release v1.3.0"

# Lightweight tag (acceptable)
git tag v1.3.0
```

用專案立之標籤格式：
- `v1.3.0`（最常）
- `1.3.0`（無前綴）
- `package-name@1.3.0`（單倉庫多套件）

**預期：** Git 標籤已建，合於新版本。

**失敗時：** 若標籤已存，版本未正確升。以 `git tag -l "v1.3*"` 查重複標籤並先解之。

## 驗證

- [ ] 當前版本自正確之版本檔讀
- [ ] 自上次發行以來一切提交皆已析
- [ ] 每變更分為破壞、功能或修復
- [ ] 升級層次合於最高嚴重度之變更（破壞 > 功能 > 修復）
- [ ] 新版本遵 SemVer 2.0.0 格式：`MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]`
- [ ] 專案中一切版本檔一致更新
- [ ] 無跳版本（如 1.2.3 至 1.4.0 而 1.3.0 未發）
- [ ] Git 標籤合於新版本與專案之標籤格式慣例
- [ ] 預發後綴（若用）遵正確優先（alpha < beta < rc）

## 常見陷阱

- **跳 minor 版本**：自 1.2.3 直至 1.4.0 因「加二功能」。每發一升；功能數不決版本
- **將棄用視為破壞**：棄用函式（加警告）為 minor 變更。僅移除為破壞性變更
- **遺 pre-1.0.0 規則**：1.0.0 前 API 視為不穩。某專案於此期間為破壞性變更升 minor，然應記之
- **版本檔不一致**：更 package.json 而不更 package-lock.json，或更 DESCRIPTION 而不更 CITATION。一切版本引用須同步
- **構建元資料之混**：構建元資料（`+build.123`）不影版本優先。`1.0.0+build.1` 與 `1.0.0+build.2` 同優先
- **不標記發行**：無 git 標籤則將來版本升不能判變更分析之基線

## 相關技能

- `manage-changelog` — 維與版本升配對之變更日誌條目
- `plan-release-cycle` — 規劃決何時版本升之發行里程
- `release-package-version` — R 特定之發行工作流，含版本升
- `commit-changes` — 以宜訊息提交版本升
- `create-github-release` — 自版本標籤建 GitHub release
