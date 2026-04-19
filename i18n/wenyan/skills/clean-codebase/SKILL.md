---
name: clean-codebase
locale: wenyan
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

## 用時

用此技於庫積污者：

- 速開發中 lint 警已累
- 未用之引與變雜亂諸檔
- 死碼徑存而未除
- 諸檔之式不一
- 靜析具報可補之問

**勿用**於構重構、修訛、或業理之變。此技專於潔與自動之清。

## 入

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `codebase_path` | string | Yes | Absolute path to codebase root |
| `language` | string | Yes | Primary language (js, python, r, rust, etc.) |
| `cleanup_mode` | enum | No | `safe` (default) or `aggressive` |
| `run_tests` | boolean | No | Run test suite after cleanup (default: true) |
| `backup` | boolean | No | Create backup before deletion (default: true) |

## 法

### 第一步：清前之評

量當前之態以後驗改。

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

**得：** 基量存於 `lint_before.json` 與 `cloc_before.json`

**敗則：** 若 lint 具不得，略自動之補而專於手察

### 第二步：補自動 lint 警

施安之自補（間、引、分、尾空）。

**JavaScript/TypeScript**:
```bash
eslint --fix .
prettier --write .
```

**Python**:
```bash
black .
isort .
ruff check --fix .
```

**R**:
```bash
Rscript -e "styler::style_dir('.')"
```

**Rust**:
```bash
cargo fmt
cargo clippy --fix --allow-dirty
```

**得：** 諸安 lint 警已解；諸檔式一

**敗則：** 若自補引測敗，退變而升

### 第三步：識死碼徑

用靜析尋未引之函、未用之變、孤之檔。

**JavaScript/TypeScript**:
```bash
ts-prune | tee dead_code.txt
depcheck | tee unused_deps.txt
```

**Python**:
```bash
vulture . | tee dead_code.txt
```

**R**:
```bash
Rscript -e "lintr::lint_dir('.', linters = lintr::unused_function_linter())"
```

**通法**：
1. grep 函之定
2. grep 函之呼
3. 報定而未呼之函

**得：** `dead_code.txt` 列未用之函、變、檔

**敗則：** 若靜析具不得，手察近之提交史尋孤碼

### 第四步：除未用之引

清引區，除永未用之包。

**JavaScript**:
```bash
eslint --fix --rule 'no-unused-vars: error'
```

**Python**:
```bash
autoflake --remove-all-unused-imports --in-place --recursive .
```

**R**:
```bash
# Manual review: grep for library() calls, check if package used
grep -r "library(" . | cut -d: -f2 | sort | uniq
```

**得：** 諸未用之引句皆除

**敗則：** 若除引而建敗，間接有用——復而書之

### 第五步：除死碼（依模）

**安模**（默）：
- 只除明標為棄之碼
- 除已注釋之碼塊（若逾十行且逾六月）
- 除引已畢之 TODO 注

**侵模**（擇入）：
- 除第三步所識諸未用之函
- 除零引之私法
- 除棄功之旗

每候刪：
1. 驗庫中零引
2. 察 git 史近之動（若三十日內改則略）
3. 除碼而加條入 `CLEANUP_LOG.md`

**得：** 死碼已除；`CLEANUP_LOG.md` 書諸除

**敗則：** 若不確碼真死，移入 `archive/` 而非除

### 第六步：式之一

確諸檔式一（雖 lint 不捕）。

1. 一行末（LF 抑 CRLF）
2. 確檔末單新行
3. 除尾空
4. 一縮（空抑 tab，縮之寬）

```bash
# Example: Fix line endings and trailing whitespace
find . -type f -name "*.js" -exec sed -i 's/\r$//' {} +
find . -type f -name "*.js" -exec sed -i 's/[[:space:]]*$//' {} +
```

**得：** 諸檔循一式

**敗則：** 若 sed 破二進之檔，略而書之

### 第七步：行測

驗清未破功。

```bash
# Language-specific test command
npm test              # JavaScript
pytest                # Python
R CMD check           # R
cargo test            # Rust
```

**得：** 諸測皆通（或同清前之敗）

**敗則：** 漸退變以識破者，而升

### 第八步：生清報

書諸變以察。

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

**得：** 報存於項目根之 `CLEANUP_REPORT.md`

**敗則：**（無——無論結果皆生報）

## 驗

清後：

- [ ] 諸測皆通（或同前之敗）
- [ ] 無新 lint 警引入
- [ ] 除前已備
- [ ] `CLEANUP_LOG.md` 書諸除碼
- [ ] 清報已生附量
- [ ] git diff 已察無外變
- [ ] CI 管已通

## 陷

1. **除仍以反射用之碼**：靜析漏動呼（如 `eval()`、元編程）。必察 git 史。

2. **破隱依**：除依所用之引。每除引後行測。

3. **刪活功之旗**：雖當枝未用，或於他境活。察部署之設。

4. **過侵之式**：如 `black`、`prettier` 可重式生冗 diff。設具合項目之風。

5. **忽測覆**：無測之庫不可安清。若覆低，先升補測。

6. **不備**：除前必建 `backup_YYYYMMDD/`，雖用 git。

7. **混系上之誤 R 二**：於 WSL 或 Docker，`Rscript` 或解為跨臺之包而非原生 R。以 `which Rscript && Rscript --version` 察。宜用原生 R 二（如 Linux/WSL 上之 `/usr/local/bin/Rscript`）以信。見 [Setting Up Your Environment](../../guides/setting-up-your-environment.md) 以 R 路之設。

## 參

- [tidy-project-structure](../tidy-project-structure/SKILL.md) — 整目之構，更 README
- [repair-broken-references](../repair-broken-references/SKILL.md) — 修死鏈與引
- [escalate-issues](../escalate-issues/SKILL.md) — 路雜問於專
- [r-packages/run-r-cmd-check](../../r-packages/run-r-cmd-check/SKILL.md) — 行全 R 包察
- [devops/dependency-audit](../../devops/dependency-audit/SKILL.md) — 察過時之依
