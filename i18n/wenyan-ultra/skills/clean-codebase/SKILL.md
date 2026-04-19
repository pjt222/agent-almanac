---
name: clean-codebase
locale: wenyan-ultra
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

## 用

庫積衛生債時用：

- lint 警速積於急開發
- 未用入、變混檔
- 死碼路在而未除
- 格式諸檔不一
- 靜析具報可修者

**勿用**於架構重構、修錯、商邏變。此技純衛生與自動清。

## 入

| 參 | 類 | 必 | 述 |
|-----------|------|----------|-------------|
| `codebase_path` | string | Yes | Absolute path to codebase root |
| `language` | string | Yes | Primary language (js, python, r, rust, etc.) |
| `cleanup_mode` | enum | No | `safe` (default) or `aggressive` |
| `run_tests` | boolean | No | Run test suite after cleanup (default: true) |
| `backup` | boolean | No | Create backup before deletion (default: true) |

## 行

### 一：清前察

量現狀以後比進。

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

**得：** 基線存於 `lint_before.json` 與 `cloc_before.json`

**敗：** lint 具缺→略自動修、焦手審

### 二：修自動 lint 警

施安全自動修（間距、引號、分號、末空白）。

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

**得：** 諸安全 lint 警皆解；格式一致

**敗：** 自動修致測敗→復而升

### 三：識死碼路

用靜析尋未引函、未用變、孤檔。

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
1. Grep 函定
2. Grep 函呼
3. 報定而未呼者

**得：** `dead_code.txt` 列未用函、變、檔

**敗：** 靜析具缺→手審近 commit 史尋孤碼

### 四：除未用入

清入塊，除未用之包引。

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

**得：** 未用入語皆除

**敗：** 除入破建→間接用也，復而記

### 五：除死碼（依模）

**Safe Mode**（默）：
- 只除明標廢者
- 除註釋塊（>10 行且 >6 月舊）
- 除 TODO 涉已畢之 issue

**Aggressive Mode**（入選）：
- 除步三所識諸未用函
- 除零引之私法
- 除已廢功能之 feature flag

每候刪：
1. 驗庫中零引
2. 察 git 史近動（30 日內改→略）
3. 刪且入 `CLEANUP_LOG.md`

**得：** 死碼已除；`CLEANUP_LOG.md` 記諸刪

**敗：** 碼死否不確→移至 `archive/` 目錄替代

### 六：歸格式

確諸檔格式一致（即 linter 未捕者）。

1. 歸行末（LF vs CRLF）
2. 檔末單換行
3. 除末空白
4. 歸縮進（空格 vs tab、寬）

```bash
# Example: Fix line endings and trailing whitespace
find . -type f -name "*.js" -exec sed -i 's/\r$//' {} +
find . -type f -name "*.js" -exec sed -i 's/[[:space:]]*$//' {} +
```

**得：** 諸檔守一致格式

**敗：** sed 破二進檔→略而記

### 七：行測

驗清未破功能。

```bash
# Language-specific test command
npm test              # JavaScript
pytest                # Python
R CMD check           # R
cargo test            # Rust
```

**得：** 諸測皆過（或清前同之敗）

**敗：** 漸復以識破因，升報

### 八：生清報

記諸變以審。

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

**得：** 報存於 `CLEANUP_REPORT.md` 於項目根

**敗：** （無——無論結果皆生報）

## 驗

清後：

- [ ] 諸測皆過（或清前同敗）
- [ ] 無新 lint 警
- [ ] 刪前備已立
- [ ] `CLEANUP_LOG.md` 記諸除碼
- [ ] 清報含量度已生
- [ ] Git diff 審察意外變
- [ ] CI 管道過

## 忌

1. **除反射尚用之碼**：靜析漏動呼（如 `eval()`、元編程）。必察 git 史。

2. **破隱依**：除依賴所用之入。每除後行測。

3. **刪在用功能之 feature flag**：雖當前分支未用，或他境在行。察部署配。

4. **過激格式化**：如 `black`、`prettier` 或重排致無謂 diff。配具守項目風。

5. **忽測覆**：無測之庫不可安清。覆低→先升補測。

6. **不備**：刪前必建 `backup_YYYYMMDD/`，即 git 在亦然。

7. **混系統之誤 R bin**：WSL 或 Docker 中，`Rscript` 或解至跨平臺封裝非原生 R。驗 `which Rscript && Rscript --version`。取原生 R bin（如 Linux/WSL 之 `/usr/local/bin/Rscript`）為靠。見[Setting Up Your Environment](../../guides/setting-up-your-environment.md)之 R 路徑配。

## 參

- [tidy-project-structure](../tidy-project-structure/SKILL.md) — 整目錄佈、更 README
- [repair-broken-references](../repair-broken-references/SKILL.md) — 修死鏈與入
- [escalate-issues](../escalate-issues/SKILL.md) — 複難至專
- [r-packages/run-r-cmd-check](../../r-packages/run-r-cmd-check/SKILL.md) — 行 R 包全察
- [devops/dependency-audit](../../devops/dependency-audit/SKILL.md) — 察過時依
