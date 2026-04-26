---
name: manage-changelog
locale: wenyan
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

# 管變更日誌

守 [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) 之格維項目之變更日誌。此技涵建新日誌、分類項、管 `[Unreleased]` 節、發布時升項至版節。察 R 慣則應 `NEWS.md`。

## 用時

- 啟需變更日誌之新項目
- 成特性、修、或他變後加項
- 備發布，移 Unreleased 項至版節
- 發布前審日誌之全
- 將自由格變更日誌轉為 Keep a Changelog 格

## 入

- **必要**：項目根目錄
- **必要**：所記變之述（或自 git log 取之）
- **可選**：目標版號（為發布升）
- **可選**：發布日（預設今日）
- **可選**：變更日誌格之好（Keep a Changelog 或 R NEWS.md）

## 法

### 第一步：尋或建變更日誌

於項目根尋既有之變更日誌。

```bash
# Check for common changelog filenames
ls -1 CHANGELOG.md CHANGELOG NEWS.md CHANGES.md HISTORY.md 2>/dev/null
```

若無，以標頭建之：

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
```

R 包者，以 `NEWS.md` 與 R 慣格之：

```markdown
# packagename (development version)

## New features

## Bug fixes

## Minor improvements and fixes
```

**得：**變更日誌檔已尋或建，具正頭與 Unreleased 節。

**敗則：**若變更日誌以非標格存，勿蓋之。記格之異並適諸項於既樣。

### 第二步：解既項

讀變更日誌並辨其結構：

1. 頭／前言（項目名、格述）
2. `[Unreleased]` 節含待變
3. 反時序之版節（`[1.2.0]` 先於 `[1.1.0]`）
4. 末之比較連（選）

每節辨所具類：
- **Added** — 新特性
- **Changed** — 既功之改
- **Deprecated** — 將除之特性
- **Removed** — 已除之特性
- **Fixed** — 修疵
- **Security** — 漏洞之修

**得：**變更日誌結構已解，既項已清。

**敗則：**若日誌畸（缺節、誤序），記之而未獲確認勿重構。正加新項，標結構之疑以供人審。

### 第三步：分類新變

為每記之變，分於六類之一：

| 類 | 用時 | 例項 |
|---|---|---|
| Added | 新特性或能 | `- Add CSV export for summary reports` |
| Changed | 既特性之改 | `- Change default timeout from 30s to 60s` |
| Deprecated | 標為將除 | `- Deprecate `old_function()` in favor of `new_function()`` |
| Removed | 特性或能已除 | `- Remove legacy XML parser` |
| Fixed | 修疵 | `- Fix off-by-one error in pagination` |
| Security | 漏洞之修 | `- Fix SQL injection in user search (CVE-2026-1234)` |

項之書則：
- 每項以祈使動詞始（Add、Change、Fix、Remove）
- 具足使用者無需讀碼即解其影響
- 參議題號或 CVE，可則為之
- 項一行；唯複變用子列

**得：**每變歸於一類，項善書。

**敗則：**若變跨多類（如既加特性亦修疵），於各相關類建分項。若類不清，默為「Changed」。

### 第四步：加項於 Unreleased 節

納分類之項於 `[Unreleased]` 下。保類序：Added、Changed、Deprecated、Removed、Fixed、Security。

```markdown
## [Unreleased]

### Added

- Add batch processing mode for large datasets
- Add `--dry-run` flag to preview changes without applying

### Fixed

- Fix memory leak when processing files over 1GB
- Fix incorrect timezone handling in date parsing
```

唯加具項之類；勿含空類之標。

**得：**新項納於 `[Unreleased]` 正類，保格一致。

**敗則：**若 Unreleased 節不存，即於頭／前言下、首版節上建之。

### 第五步：發布時升至版節

發布時，移諸 Unreleased 項至新版節：

1. 建新節標：`## [1.3.0] - 2026-02-17`
2. 移諸項自 `[Unreleased]` 至新節
3. 留 `[Unreleased]` 空（而保其標）
4. 更檔末之比較連

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

更比較連（若末有）：

```markdown
[Unreleased]: https://github.com/user/repo/compare/v1.3.0...HEAD
[1.3.0]: https://github.com/user/repo/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/user/repo/compare/v1.1.0...v1.2.0
```

R `NEWS.md` 者，用 R 慣：

```markdown
# packagename 1.3.0

## New features

- Add batch processing mode for large datasets

## Bug fixes

- Fix memory leak when processing files over 1GB

# packagename 1.2.0
...
```

**得：**Unreleased 項移至標日之版節；Unreleased 節已清；比較連已更。

**敗則：**若版號與既節衝突，版已發。以 `apply-semantic-versioning` 定正版。

### 第六步：驗變更日誌格

察變更日誌合格：

1. 版反時序（新者先）
2. 日循 ISO 8601（YYYY-MM-DD）
3. 每版節至少一分類之項
4. 無重版節
5. 比較連（若有）配版節

```bash
# Check for duplicate version sections
grep "^## \[" CHANGELOG.md | sort | uniq -d

# Verify date format
grep "^## \[" CHANGELOG.md | grep -v "Unreleased" | grep -vE "\d{4}-\d{2}-\d{2}"
```

**得：**變更日誌過諸格察，無警。

**敗則：**修所察之格疑：重序節、正日格、除重。標需人判者（如既知變而缺項）。

## 驗

- [ ] 變更日誌檔存，具 Keep a Changelog 與 SemVer 之正頭
- [ ] `[Unreleased]` 節於頂（頭下）
- [ ] 諸新項分類於 Added/Changed/Deprecated/Removed/Fixed/Security
- [ ] 項以祈使動詞始並述使用者面之影響
- [ ] 版節反時序
- [ ] 日循 ISO 8601（YYYY-MM-DD）
- [ ] 無重版節
- [ ] 比較連（若用）正而新
- [ ] 空類不含（無項之標勿存）

## 陷

- **僅內部之項**：「Refactored database module」於使用者無益。聚於使用者面之變。內部重構於提交訊而非變更日誌
- **模糊之項**：「Various bug fixes」於使用者不告何。每修當為具體述之項
- **忘 Unreleased**：直加項於版節而非 Unreleased 致變被錄為已發而實未
- **類誤**：「Fix」而實加新特性。修復預期行為；新能為「Added」即使以疵報請
- **缺 Security 項**：安全之修可得則恆以 CVE 識別字記之。使用者需知是否急升
- **日誌漂**：變時不更日誌。發布前批書項致失或劣述。項隨碼變而書

## 參

- `apply-semantic-versioning` — 定與變更日誌項相配之版號
- `plan-release-cycle` — 定何時升變更日誌項至版節
- `commit-changes` — 以正訊提交變更日誌之更
- `release-package-version` — R 專發布工作流含 NEWS.md 之更
- `create-github-release` — 用變更日誌內容為 GitHub 發布說明
