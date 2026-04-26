---
name: manage-changelog
locale: wenyan-lite
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

# 管更新日誌

循 [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) 格式維護項目更新日誌。此技能涵創新日誌、分類條目、管 `[Unreleased]` 節，並於發佈時升條目至版本化節。察 R 慣例（`NEWS.md`）時適之。

## 適用時機

- 始需更新日誌之新項目
- 成功能、修復或他變後加條目
- 備發佈而移 Unreleased 條目至版本化節
- 發佈前審更新日誌之完整
- 化自由式日誌為 Keep a Changelog 格式

## 輸入

- **必要**：項目根目錄
- **必要**：待記之變描述（或自中抽之 git log）
- **選擇性**：目標版號（供發佈升）
- **選擇性**：發佈日（默為今）
- **選擇性**：日誌格式偏好（Keep a Changelog 或 R NEWS.md）

## 步驟

### 步驟一：定位或創日誌

於項目根搜既有日誌。

```bash
# Check for common changelog filenames
ls -1 CHANGELOG.md CHANGELOG NEWS.md CHANGES.md HISTORY.md 2>/dev/null
```

若無日誌存，以標準標頭創之：

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
```

R 套件者，用 `NEWS.md` 附 R 慣格式：

```markdown
# packagename (development version)

## New features

## Bug fixes

## Minor improvements and fixes
```

**預期：** 日誌文件已定位或已創附適標頭與 Unreleased 節。

**失敗時：** 若日誌以非標準格式存，勿覆之。而記格式異並適條目於既存樣式。

### 步驟二：解析既有條目

讀日誌並識其結構：

1. 標頭/序言（項目名、格式述）
2. 含待變之 `[Unreleased]` 節
3. 逆時序之版本化節（`[1.2.0]` 於 `[1.1.0]` 之前）
4. 底之比較鏈（選）

對每節，識所存之類別：
- **Added** -- 新特性
- **Changed** -- 既功能之變
- **Deprecated** -- 即將除之特性
- **Removed** -- 今已除之特性
- **Fixed** -- 錯修
- **Security** -- 漏洞修

**預期：** 日誌結構已解，既條目已清。

**失敗時：** 若日誌畸形（缺節、序誤），記問題而勿無確認即重構。正加新條目並標結構問題供手審。

### 步驟三：分類新變

對每待記之變，分至六類之一：

| Category | When to Use | Example Entry |
|---|---|---|
| Added | New feature or capability | `- Add CSV export for summary reports` |
| Changed | Modification to existing feature | `- Change default timeout from 30s to 60s` |
| Deprecated | Feature marked for future removal | `- Deprecate `old_function()` in favor of `new_function()`` |
| Removed | Feature or capability removed | `- Remove legacy XML parser` |
| Fixed | Bug fix | `- Fix off-by-one error in pagination` |
| Security | Vulnerability fix | `- Fix SQL injection in user search (CVE-2026-1234)` |

條目書寫指引：
- 每條以祈使動詞始（Add、Change、Fix、Remove）
- 夠具體以令用戶無需讀碼即解影響
- 適用處引問題號或 CVE
- 保條目一行；僅複雜變用子點

**預期：** 每變指派於恰一類附善書之條目。

**失敗時：** 若變跨多類（如既加特性又修錯），於每相關類創分條目。若類不清，默「Changed」。

### 步驟四：加條目於 Unreleased 節

於 `[Unreleased]` 節下插分類條目。保類序：Added、Changed、Deprecated、Removed、Fixed、Security。

```markdown
## [Unreleased]

### Added

- Add batch processing mode for large datasets
- Add `--dry-run` flag to preview changes without applying

### Fixed

- Fix memory leak when processing files over 1GB
- Fix incorrect timezone handling in date parsing
```

僅加有條目之類；勿含空類標題。

**預期：** 新條目已於 `[Unreleased]` 下之正類加，保格式一致。

**失敗時：** 若 Unreleased 節不存，立創於標頭/序言下而於首版本化節上。

### 步驟五：發佈時升至版本化節

於發佈時，移所有 Unreleased 條目至新版本化節：

1. 創新節標題：`## [1.3.0] - 2026-02-17`
2. 移 `[Unreleased]` 之所有條目至新節
3. 留 `[Unreleased]` 空（然保標題）
4. 更文件底之比較鏈

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

更比較鏈（若存於底）：

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

**預期：** Unreleased 條目移至附日期版本化節；Unreleased 節已清；比較鏈已更。

**失敗時：** 若版號與既存節衝，版已發。以 `apply-semantic-versioning` 查正版。

### 步驟六：驗日誌格式

驗日誌合格式需：

1. 版本為逆時序（新先）
2. 日期循 ISO 8601 格式（YYYY-MM-DD）
3. 每版本化節至少有一分類條目
4. 無重版節
5. 比較鏈（若存）匹配版本節

```bash
# Check for duplicate version sections
grep "^## \[" CHANGELOG.md | sort | uniq -d

# Verify date format
grep "^## \[" CHANGELOG.md | grep -v "Unreleased" | grep -vE "\d{4}-\d{2}-\d{2}"
```

**預期：** 日誌過所有格式查而無警。

**失敗時：** 修所尋格式問題：重排節、正日期格式、除重。報需人判問題（如已知變之缺條目）。

## 驗證

- [ ] 日誌文件存附引 Keep a Changelog 與 SemVer 之正標頭
- [ ] `[Unreleased]` 節存於頂（標頭下）
- [ ] 所有新條目已分為 Added/Changed/Deprecated/Removed/Fixed/Security
- [ ] 條目以祈使動詞始而述用戶面影響
- [ ] 版本化節為逆時序
- [ ] 日期用 ISO 8601 格式（YYYY-MM-DD）
- [ ] 無重版節存
- [ ] 比較鏈（若用）正確且最新
- [ ] 空類不含（無條目即無標題）

## 常見陷阱

- **僅內部之條目**：「重構資料庫模塊」於用戶無用。聚焦用戶面變。內部重構入提交消息，非日誌
- **糊條目**：「多錯修」於用戶不告。每修當為具體述之條目
- **忘 Unreleased**：直加條目於版本化節而非 Unreleased 謂變已作已發而實未
- **錯類**：實加新特性之「Fix」。修復預期行為；新能即使以錯報請求亦為「Added」
- **缺 Security 條目**：安全修當以 CVE 標識記（可得時）。用戶需知是否當緊升
- **日誌漂**：變時未更日誌。批寫條目於發佈前致失或劣述變。於碼變時同寫條目

## 相關技能

- `apply-semantic-versioning` -- 定與日誌條目配之版號
- `plan-release-cycle` -- 定何時升日誌條目至版本化節
- `commit-changes` -- 以適消息提日誌更
- `release-package-version` -- R 特發佈工作流含 NEWS.md 更
- `create-github-release` -- 用日誌內容為 GitHub 發佈說明
