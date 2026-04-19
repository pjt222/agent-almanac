---
name: apply-semantic-versioning
locale: wenyan
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

# 施語義版控

依變析定正版升。此技讀版檔、分變為破（主）、功（次）、修（補）、算新版、更諸檔。循 [SemVer 2.0.0](https://semver.org/) 規。

## 用時

- 備新發而須定正版乃用
- 合變後、標前乃用
- 察變為破否乃用
- 加預發標（alpha、beta、rc）乃用
- 解何升宜之爭乃用

## 入

- **必要**：含版檔（DESCRIPTION、package.json、Cargo.toml、pyproject.toml、或 VERSION）之項根
- **必要**：上發後之 git 史（標或提交）
- **可選**：用之提交約（Conventional Commits、自由式）
- **可選**：將施之預發標（alpha、beta、rc）
- **可選**：若檔不可讀則前版

## 法

### 第一步：讀當前版

覓項根之版檔而讀之。

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

析當前版為 major.minor.patch 諸分。若版含預發後綴（如 `1.2.0-beta.1`），別記。

**得：** 當前版識為 `MAJOR.MINOR.PATCH[-PRERELEASE]`。

**敗則：** 若無版檔，察 VERSION 或 git 標（`git describe --tags --abbrev=0`）。若全無版，初發以 `0.1.0` 始，若項有穩之公 API 則以 `1.0.0` 始。

### 第二步：析上發後之變

取上標發後諸變。

```bash
# Find the last version tag
git describe --tags --abbrev=0

# List commits since that tag
git log --oneline v1.2.3..HEAD

# If using Conventional Commits, filter by type
git log --oneline v1.2.3..HEAD | grep -E "^[a-f0-9]+ (feat|fix|BREAKING)"
```

若無標，對初提交或已知基線比。

**得：** 可按變類分之提交列。

**敗則：** 若 git 史不可得或標闕，請開發手述變。依其述分類。

### 第三步：分變

施 SemVer 分類則：

| Change Type | Version Bump | Examples |
|---|---|---|
| **Breaking** (incompatible API change) | MAJOR | Renamed/removed public function, changed return type, removed parameter, changed default behavior |
| **Feature** (new backwards-compatible functionality) | MINOR | New exported function, new parameter with default, new file format support |
| **Fix** (backwards-compatible bug fix) | PATCH | Bug fix, documentation correction, performance improvement with same API |

分類則：
1. 若任一變破，升為 MAJOR（重次與補為零）
2. 若無破而任新功，升為 MINOR（重補為零）
3. 若僅修，升為 PATCH

特例：
- **1.0.0 前**：初發中（`0.x.y`），次升可含破。明書
- **棄用**：棄函乃次變（仍行）。除之為主
- **內變**：重構而不變公 API 乃補

**得：** 諸變分為破/功/修而升級定。

**敗則：** 若變歧，偏高升。保守主升勝於破下游之次升。

### 第四步：算新版

施升於當前版：

| Current | Bump | New Version |
|---|---|---|
| 1.2.3 | MAJOR | 2.0.0 |
| 1.2.3 | MINOR | 1.3.0 |
| 1.2.3 | PATCH | 1.2.4 |
| 0.9.5 | MINOR | 0.10.0 |
| 2.0.0-rc.1 | (release) | 2.0.0 |

若請預發標：
- `1.3.0-alpha.1` 為將至 1.3.0 之首 alpha
- `1.3.0-beta.1` 為首 beta
- `1.3.0-rc.1` 為首 rc

預發先後：`alpha < beta < rc < (release)`。

**得：** 新版依 SemVer 則算。

**敗則：** 若當前版不合式或非 SemVer，先歸一。如 `1.2` 為 `1.2.0`。

### 第五步：更版檔

書新版於宜檔。

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

若項有多檔引版（如 `_pkgdown.yml`、`CITATION`、`codemeta.json`），皆更。

**得：** 諸版檔一致更至新版。

**敗則：** 若某檔更敗，撤諸變守一致。勿留版檔於半更之狀。

### 第六步：建版標

更版提交後，建 git 標。

```bash
# Annotated tag (preferred)
git tag -a v1.3.0 -m "Release v1.3.0"

# Lightweight tag (acceptable)
git tag v1.3.0
```

循項既立標式：
- `v1.3.0`（最常）
- `1.3.0`（無前綴）
- `package-name@1.3.0`（monorepo）

**得：** git 標合新版。

**敗則：** 若標已存，版未正升。以 `git tag -l "v1.3*"` 察重標解之而進。

## 驗

- [ ] 當前版自正版檔讀
- [ ] 上發後諸提交皆析
- [ ] 每變分為破、功、或修
- [ ] 升級合最重變（破 > 功 > 修）
- [ ] 新版循 SemVer 2.0.0 式：`MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]`
- [ ] 項中諸版檔一致更
- [ ] 無版跳（如 1.2.3 直至 1.4.0 而 1.3.0 未發）
- [ ] git 標合新版與項約
- [ ] 預發後綴若用，循正先後（alpha < beta < rc）

## 陷

- **跳次**：自 1.2.3 直至 1.4.0 因「加二功」。每發一升；功數非定版
- **視棄用為破**：棄函（加警）乃次變。僅除之為破
- **忘 1.0.0 前則**：1.0.0 前，API 視不穩。諸項於此階以次升破變，然當書
- **版檔不一**：更 package.json 而不更 package-lock.json、或更 DESCRIPTION 而不更 CITATION。諸版引須同步
- **建元混**：建元（`+build.123`）不影版先後。`1.0.0+build.1` 與 `1.0.0+build.2` 先後同
- **不標發**：無 git 標，後升不能定變析之基

## 參

- `manage-changelog` — 守配版升之更記
- `plan-release-cycle` — 謀發里程以定何時升
- `release-package-version` — R 特之發流含版升
- `commit-changes` — 以正辭提交版升
- `create-github-release` — 自版標建 GitHub 發
