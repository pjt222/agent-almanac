---
name: manage-changelog
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Maintain a changelog following Keep a Changelog format. Covers
  entry categorization (Added, Changed, Deprecated, Removed, Fixed,
  Security), version section management, and unreleased tracking. Use when
  starting a new project that needs a changelog, adding entries after
  completing features or fixes, preparing a release by promoting Unreleased
  entries to a versioned section, or converting a free-form changelog to
  Keep a Changelog format.
license: MIT
allowed-tools: Read Write Edit Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: versioning
  complexity: basic
  language: multi
  tags: versioning, changelog, documentation, keep-a-changelog
---

# 管變錄

維項變錄循 [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) 格。覆造新、歸項、管 `[Unreleased]` 節、發時升項至版節。察 R 約（`NEWS.md`）則適之。

## 用

- 啟需變錄之新項
- 功、修畢後加項
- 備發——移 Unreleased 至版節
- 發前審變錄全
- 轉自由格變錄為 Keep a Changelog

## 入

- **必**：項根目
- **必**：待記變之述（或提 git log）
- **可**：目版號（發升）
- **可**：發日（默今）
- **可**：變錄格偏（Keep a Changelog 或 R NEWS.md）

## 行

### 一：尋或造變錄

於項根查現變錄：

```bash
# Check for common changelog filenames
ls -1 CHANGELOG.md CHANGELOG NEWS.md CHANGES.md HISTORY.md 2>/dev/null
```

無存→造以標頭：

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
```

R 包用 `NEWS.md` 附 R 約格：

```markdown
# packagename (development version)

## New features

## Bug fixes

## Minor improvements and fixes
```

得：變錄尋或造附正頭與 Unreleased 節。

敗：變錄存於非標格→勿覆。記格異並適項合現式。

### 二：析現項

讀變錄識其結：

1. 頭/前言（項名、格述）
2. `[Unreleased]` 節含待變
3. 反時排版節（`[1.2.0]` 先於 `[1.1.0]`）
4. 底比鏈（可）

各節識存類：
- **Added** —— 新功
- **Changed** —— 現功變
- **Deprecated** —— 將除功
- **Removed** —— 已除功
- **Fixed** —— 錯修
- **Security** —— 漏修

得：變錄結解，現項列。

敗：變錄誤格（缺節、序錯）→記問題而勿未確認重構。正加新項並標結構問題待人審。

### 三：歸新變

各待記變歸六類之一：

| 類 | 用時 | 例項 |
|---|---|---|
| Added | 新功或能 | `- Add CSV export for summary reports` |
| Changed | 現功改 | `- Change default timeout from 30s to 60s` |
| Deprecated | 標未來除之功 | `- Deprecate `old_function()` in favor of `new_function()`` |
| Removed | 已除功或能 | `- Remove legacy XML parser` |
| Fixed | 錯修 | `- Fix off-by-one error in pagination` |
| Security | 漏修 | `- Fix SQL injection in user search (CVE-2026-1234)` |

項寫指：
- 各項始以祈使動（Add、Change、Fix、Remove）
- 具體足以用者不讀碼而解影響
- 適時引題號或 CVE
- 項為一行；僅複變用子項

得：各變歸一類附善寫之項。

敗：變跨多類（如加功亦修錯）→各類造別項。類不明→默「Changed」。

### 四：加項至 Unreleased 節

歸項插於 `[Unreleased]` 下。保類序：Added、Changed、Deprecated、Removed、Fixed、Security。

```markdown
## [Unreleased]

### Added

- Add batch processing mode for large datasets
- Add `--dry-run` flag to preview changes without applying

### Fixed

- Fix memory leak when processing files over 1GB
- Fix incorrect timezone handling in date parsing
```

僅加有項之類；勿含空類頭。

得：新項於 `[Unreleased]` 下正類加，保一致格。

敗：Unreleased 節不存→即於頭後首版節前造之。

### 五：發時升至版節

切發時移諸 Unreleased 至新版節：

1. 造新節頭：`## [1.3.0] - 2026-02-17`
2. 移諸項由 `[Unreleased]` 至新節
3. 留 `[Unreleased]` 空（保頭）
4. 更底比鏈

```markdown
## [Unreleased]

## [1.3.0] - 2026-02-17

### Added

- Add batch processing mode for large datasets

### Fixed

- Fix memory leak when processing files over 1GB

## [1.2.0] - 2026-01-15

### Added

- Add CSV export for summary reports
```

更比鏈（若底有）：

```markdown
[Unreleased]: https://github.com/user/repo/compare/v1.3.0...HEAD
[1.3.0]: https://github.com/user/repo/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/user/repo/compare/v1.1.0...v1.2.0
```

R `NEWS.md` 用 R 約：

```markdown
# packagename 1.3.0

## New features

- Add batch processing mode for large datasets

## Bug fixes

- Fix memory leak when processing files over 1GB

# packagename 1.2.0
...
```

得：Unreleased 項移至附日版節；Unreleased 清；比鏈更。

敗：版號與現節衝→版已發。以 `apply-semantic-versioning` 定正版。

### 六：驗變錄格

驗變錄合格需：

1. 版反時排（新先）
2. 日循 ISO 8601（YYYY-MM-DD）
3. 各版節至少一歸項
4. 無重版節
5. 比鏈（若有）匹版節

```bash
# Check for duplicate version sections
grep "^## \[" CHANGELOG.md | sort | uniq -d

# Verify date format
grep "^## \[" CHANGELOG.md | grep -v "Unreleased" | grep -vE "\d{4}-\d{2}-\d{2}"
```

得：變錄過諸格查無警。

敗：修所查格問題：重排節、正日格、除重。標需人判之問題（如已知變缺項）。

## 驗

- [ ] 變錄文件存附引 Keep a Changelog 與 SemVer 之正頭
- [ ] `[Unreleased]` 節於頂（頭下）
- [ ] 諸新項歸 Added/Changed/Deprecated/Removed/Fixed/Security
- [ ] 項始以祈使動並述面用者之影響
- [ ] 版節反時排
- [ ] 日用 ISO 8601（YYYY-MM-DD）
- [ ] 無重版節存
- [ ] 比鏈（若用）正且新
- [ ] 空類不含（無項之頭）

## 忌

- **內部項**：「重構數據庫模」於用者無益。聚面用者變。內重構入提交訊非變錄
- **模糊項**：「諸錯修」告用者無。各修當為具體描述項
- **忘 Unreleased**：項直加至版節非 Unreleased →記為已發而實未
- **類誤**：「Fix」實加新功。修乃復預行為；新能為「Added」即使請為錯報
- **缺 Security 項**：安修當記附 CVE 識。用者需知是否急升
- **變錄漂**：變時未更變錄。發前批寫項→失或差述。寫項與碼變並行

## 參

- `apply-semantic-versioning` —— 定與變錄項配之版號
- `plan-release-cycle` —— 定變錄項何時升至版節
- `commit-changes` —— 以正訊提變錄更
- `release-package-version` —— R 特發流含 NEWS.md 更
- `create-github-release` —— 用變錄容為 GitHub 發註
