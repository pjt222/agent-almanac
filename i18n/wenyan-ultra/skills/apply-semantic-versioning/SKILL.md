---
name: apply-semantic-versioning
locale: wenyan-ultra
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

# 施 SemVer

由變析定正版升。析變、分主/次/補、算新版、更檔。循 [SemVer 2.0.0](https://semver.org/)。

## 用

- 備新發須定正版號→用
- 合變後標前→用
- 評變為破否→用
- 加預發識（alpha、beta、rc）→用
- 解版升爭→用

## 入

- **必**：項根含版檔（DESCRIPTION、package.json、Cargo.toml、pyproject.toml、或 VERSION）
- **必**：自末發以來之 git 史
- **可**：用之提例（規範提交、自由）
- **可**：欲加預發標
- **可**：前版若不可自檔讀

## 行

### 一：讀今版

於項根尋讀版檔。

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

析今版為 major.minor.patch。版含預發後綴（如 `1.2.0-beta.1`）→獨記。

得：今版識為 `MAJOR.MINOR.PATCH[-PRERELEASE]`。

敗：無版檔→察 VERSION 或 git 標（`git describe --tags --abbrev=0`）。全無版→初發用 `0.1.0`，穩公 API 用 `1.0.0`。

### 二：析末發以來之變

取自末標以來諸變。

```bash
# Find the last version tag
git describe --tags --abbrev=0

# List commits since that tag
git log --oneline v1.2.3..HEAD

# If using Conventional Commits, filter by type
git log --oneline v1.2.3..HEAD | grep -E "^[a-f0-9]+ (feat|fix|BREAKING)"
```

無標→比於初提或知基。

得：諸提附訊可分變類。

敗：git 史不可達或標缺→請開發者述變。按述分。

### 三：分變

施 SemVer 分律：

| Change Type | Version Bump | Examples |
|---|---|---|
| **Breaking** (incompatible API change) | MAJOR | Renamed/removed public function, changed return type, removed parameter, changed default behavior |
| **Feature** (new backwards-compatible functionality) | MINOR | New exported function, new parameter with default, new file format support |
| **Fix** (backwards-compatible bug fix) | PATCH | Bug fix, documentation correction, performance improvement with same API |

分律：

1. 任變為破→升 MAJOR（次與補歸零）
2. 無破而任新功→升 MINOR（補歸零）
3. 唯修→升 PATCH

特例：

- **<1.0.0**：初發（`0.x.y`）次升或含破。明文
- **棄用**：棄函（仍行）為 MINOR。去之為 MAJOR
- **內變**：不改公 API 之重構為 PATCH

得：各變分為破/功/修，全升階定。

敗：變含糊→傾高升。保守主升勝破下游碼之次升。

### 四：算新版

施升於今版：

| Current | Bump | New Version |
|---|---|---|
| 1.2.3 | MAJOR | 2.0.0 |
| 1.2.3 | MINOR | 1.3.0 |
| 1.2.3 | PATCH | 1.2.4 |
| 0.9.5 | MINOR | 0.10.0 |
| 2.0.0-rc.1 | (release) | 2.0.0 |

請預發標：

- `1.3.0-alpha.1` 為將 1.3.0 之首 alpha
- `1.3.0-beta.1` 為首 beta
- `1.3.0-rc.1` 為首發候

預發序：`alpha < beta < rc < (發)`。

得：新版號循 SemVer 算。

敗：今版形誤或非 SemVer→先正規。如 `1.2` 為 `1.2.0`。

### 五：更版檔

書新版於相關檔。

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

項有多檔涉版（如 `_pkgdown.yml`、`CITATION`、`codemeta.json`）→皆更。

得：諸版檔一致更為新版號。

敗：檔更敗→撤諸變保一致。永勿留版檔半更態。

### 六：建版標

提版升後建 git 標。

```bash
# Annotated tag (preferred)
git tag -a v1.3.0 -m "Release v1.3.0"

# Lightweight tag (acceptable)
git tag v1.3.0
```

用項標例：

- `v1.3.0`（最常）
- `1.3.0`（無前綴）
- `package-name@1.3.0`（單庫多項）

得：git 標配新版。

敗：標已存→版未正升。以 `git tag -l "v1.3*"` 察重標解之再進。

## 驗

- [ ] 今版自正版檔讀
- [ ] 末發以來諸提皆析
- [ ] 各變分為破、功、修
- [ ] 升階配最高嚴變（破 > 功 > 修）
- [ ] 新版循 SemVer 2.0.0 式：`MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]`
- [ ] 項諸版檔一致更
- [ ] 無版跳（如 1.2.3 至 1.4.0 而 1.3.0 未發）
- [ ] git 標配新版與項標式
- [ ] 預發後綴若用循正序（alpha < beta < rc）

## 忌

- **跳次版**：自 1.2.3 直至 1.4.0「以加二功」。各發一升；功數不定版
- **棄用為破**：棄函（加警）為次。唯去為破
- **忘 <1.0.0 律**：1.0.0 前 API 視為不穩。某項此期次升或破，當文
- **版檔不一致**：更 package.json 而非 package-lock.json，或更 DESCRIPTION 而非 CITATION。諸版引須同
- **建元混**：建元（`+build.123`）不影版序。`1.0.0+build.1` 與 `1.0.0+build.2` 同序
- **不標發**：無 git 標，後版升不能定變析基

## 參

- `manage-changelog` —— 維變誌條與版升配
- `plan-release-cycle` —— 計發里程定何時版升
- `release-package-version` —— R 專發流含版升
- `commit-changes` —— 以正訊提版升
- `create-github-release` —— 自版標建 GitHub 發
