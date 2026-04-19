---
name: clean-codebase
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Remove dead code, unused imports, fix lint warnings, and normalize formatting
  across a codebase without changing business logic or architecture. Use when
  lint warnings have piled up during rapid development, unused imports and
  variables clutter files, dead code paths were never removed, formatting is
  inconsistent, or static analysis tools report fixable hygiene issues.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: maintenance
  complexity: intermediate
  language: multi
  tags: maintenance, cleanup, lint, dead-code, formatting
---

# clean-codebase

## 適用時機

代碼庫積衛生之債時用此技能：

- 速開發中 lint 告警積如山
- 未用之 import 與變數塞檔
- 死徑存而未除
- 檔案間格式不一
- 靜態分析工具報可修之項

**勿用**於架構重構、除錯、業務邏輯之改。此技能純於衛生與自動化清理。

## 輸入

| 參數 | 類型 | 必要 | 描述 |
|-----------|------|----------|-------------|
| `codebase_path` | string | 是 | 代碼庫根之絕對路徑 |
| `language` | string | 是 | 主語言（js、python、r、rust 等） |
| `cleanup_mode` | enum | 否 | `safe`（預設）或 `aggressive` |
| `run_tests` | boolean | 否 | 清理後行測試套件（預設：是） |
| `backup` | boolean | 否 | 刪前備份（預設：是） |

## 步驟

### 步驟一：清理前評估

度當前態以後量其進。

```bash
# Count lint warnings by severity
lint_tool --format json > lint_before.json

# Count lines of code
cloc . --json > cloc_before.json

# List unused symbols (language-dependent)
# JavaScript/TypeScript: ts-prune or depcheck
# Python: vulture
# R: lintr unused function checks
```

**預期：** 基準度量存於 `lint_before.json` 與 `cloc_before.json`

**失敗時：** 若 lint 工具不存，略自動修復，專於人工審閱

### 步驟二：修自動化 lint 告警

行安全之自動修復（空白、引號、分號、尾空白）。

**JavaScript/TypeScript**：
```bash
eslint --fix .
prettier --write .
```

**Python**：
```bash
black .
isort .
ruff check --fix .
```

**R**：
```bash
Rscript -e "styler::style_dir('.')"
```

**Rust**：
```bash
cargo fmt
cargo clippy --fix --allow-dirty
```

**預期：** 所有安全 lint 告警已解；檔案格式一致

**失敗時：** 若自動修復致測試敗，還原並升呈

### 步驟三：識死代碼徑

用靜態分析尋無引用之函數、未用變數、孤立檔案。

**JavaScript/TypeScript**：
```bash
ts-prune | tee dead_code.txt
depcheck | tee unused_deps.txt
```

**Python**：
```bash
vulture . | tee dead_code.txt
```

**R**：
```bash
Rscript -e "lintr::lint_dir('.', linters = lintr::unused_function_linter())"
```

**通法**：
1. 以 grep 尋函數定義
2. 以 grep 尋函數呼叫
3. 報定義而未呼之函數

**預期：** `dead_code.txt` 列未用之函數、變數、檔案

**失敗時：** 若無靜態分析工具，人工審近來提交史覓孤立代碼

### 步驟四：除未用 import

清 import 塊，除未用包之引。

**JavaScript**：
```bash
eslint --fix --rule 'no-unused-vars: error'
```

**Python**：
```bash
autoflake --remove-all-unused-imports --in-place --recursive .
```

**R**：
```bash
# Manual review: grep for library() calls, check if package used
grep -r "library(" . | cut -d: -f2 | sort | uniq
```

**預期：** 所有未用之 import 已除

**失敗時：** 若除 import 破建置，其或間接被用——還原並記

### 步驟五：除死代碼（視模式）

**安全模式**（預設）：
- 僅除明示已棄之代碼
- 除註釋掉之代碼塊（若 >10 行且 >6 月）
- 除引已完議題之 TODO 註釋

**積極模式**（選入）：
- 除步驟三所識所有未用函數
- 除零引用之私有方法
- 除已棄功能之旗標

每一欲刪之候選：
1. 驗代碼庫中零引用
2. 查 git 史近活動（若近 30 日有改則略）
3. 除之並於 `CLEANUP_LOG.md` 增項

**預期：** 死代碼已除；`CLEANUP_LOG.md` 記所有刪除

**失敗時：** 若不確代碼真死，改移至 `archive/` 目錄

### 步驟六：格式正規化

確所有檔案格式一致（即 linter 未捕者）。

1. 正規化行尾（LF vs CRLF）
2. 確檔尾單一換行
3. 除尾空白
4. 正規化縮排（空格 vs 制表、縮排寬度）

```bash
# Example: Fix line endings and trailing whitespace
find . -type f -name "*.js" -exec sed -i 's/\r$//' {} +
find . -type f -name "*.js" -exec sed -i 's/[[:space:]]*$//' {} +
```

**預期：** 所有檔案循一致格式慣例

**失敗時：** 若 sed 破二進制檔，略之並記

### 步驟七：行測試

驗清理未破功能。

```bash
# Language-specific test command
npm test              # JavaScript
pytest                # Python
R CMD check           # R
cargo test            # Rust
```

**預期：** 所有測試通過（或與清理前同之敗）

**失敗時：** 漸次還原以識破壞之改，然後升呈

### 步驟八：生清理報告

記所有改以供審。

```markdown
# Codebase Cleanup Report

**Date**: YYYY-MM-DD
**Mode**: safe | aggressive
**Language**: <language>

## Metrics

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Lint warnings | X | Y | -Z |
| Lines of code | A | B | -C |
| Unused imports | D | 0 | -D |
| Dead functions | E | F | -G |

## Changes Applied

1. Fixed X lint warnings (automated)
2. Removed Y unused imports
3. Deleted Z lines of dead code (see CLEANUP_LOG.md)
4. Normalized formatting across W files

## Escalations

- [Issue description requiring human review]
- [Uncertain deletion moved to archive/]

## Validation

- [x] All tests pass
- [x] Backup created: backup_YYYYMMDD/
- [x] CLEANUP_LOG.md updated
```

**預期：** 報告存於項目根之 `CLEANUP_REPORT.md`

**失敗時：**（無——無論結果皆生報）

## 驗證

清理後：

- [ ] 所有測試通過（或與前同之敗）
- [ ] 未引入新 lint 告警
- [ ] 刪除前已備份
- [ ] `CLEANUP_LOG.md` 記所有除代碼
- [ ] 清理報已附度量而生
- [ ] Git diff 已審意外之改
- [ ] CI 流水線通過

## 常見陷阱

1. **除仍以反射用之代碼**：靜態分析漏動態呼叫（如 `eval()`、元編程）。總查 git 史。

2. **破隱含依賴**：除被依賴所用之 import。每次除 import 後行測試。

3. **刪有效功能之旗標**：雖當前分支未用，旗標或於他環境有效。查部署配置。

4. **過積極格式化**：`black` 或 `prettier` 或改代碼致無謂之 diff。配工具以合項目風。

5. **忽測試覆蓋**：無測試則不能安全清理。覆蓋低則先升呈求增測試。

6. **不備份**：刪前總建 `backup_YYYYMMDD/` 目錄，即用 git 亦然。

7. **混雜系統用錯 R 二進制**：WSL 或 Docker 中，`Rscript` 或指向跨平台包裝非原生 R。以 `which Rscript && Rscript --version` 查。用原生 R 二進制（如 Linux/WSL 之 `/usr/local/bin/Rscript`）為佳。見 [Setting Up Your Environment](../../guides/setting-up-your-environment.md) 之 R 路徑配置。

## 相關技能

- [tidy-project-structure](../tidy-project-structure/SKILL.md) — 理目錄佈局、更新 READMEs
- [repair-broken-references](../repair-broken-references/SKILL.md) — 修死鏈與 import
- [escalate-issues](../escalate-issues/SKILL.md) — 送複雜問題於專家
- [r-packages/run-r-cmd-check](../../r-packages/run-r-cmd-check/SKILL.md) — 行完整 R 包檢查
- [devops/dependency-audit](../../devops/dependency-audit/SKILL.md) — 查過時依賴
