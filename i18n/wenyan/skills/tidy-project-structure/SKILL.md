---
name: tidy-project-structure
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Organize project files into conventional directories, update stale READMEs,
  clean configuration drift, and archive deprecated items without changing
  code logic. Use when files are scattered without clear organization, READMEs
  are outdated or contain broken examples, configuration files have multiplied
  across dev/staging/prod, deprecated files remain in the project root, or
  naming conventions are inconsistent across directories.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: maintenance
  complexity: intermediate
  language: multi
  tags: maintenance, organization, structure, readme, config
---

# tidy-project-structure

## 用時

當項目組已偏於規時用此技：

- 文散於諸目而無清組
- README 已陳或含斷例
- 配文增（dev、staging、prod 之偏）
- 棄文留於項目根
- 命之規於諸目不一

**勿用** 為碼重構或依重構。此技焦於文組與文檔之衛。

## 入

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `project_path` | string | Yes | 項目根之絕路 |
| `conventions` | string | No | 風格書之路（如 `docs/conventions.md`） |
| `archive_mode` | enum | No | `move`（默）或 `delete` 為棄文 |
| `readme_update` | boolean | No | 更陳之 README（默：是） |

## 法

### 第一步：審目之佈

比當前構與項目規或語最佳實。

**諸語常之規**：

**JavaScript/TypeScript**：
```
src/          # Source code
tests/        # Test files
dist/         # Build output (gitignored)
docs/         # Documentation
.github/      # CI/CD workflows
```

**Python**：
```
package_name/      # Package code
tests/             # Test suite
docs/              # Sphinx docs
scripts/           # Utility scripts
```

**R**：
```
R/                 # R source
tests/testthat/    # Test suite
man/               # Documentation (generated)
vignettes/         # Long-form guides
inst/              # Installed files
data/              # Package data
```

**Rust**：
```
src/          # Source code
tests/        # Integration tests
benches/      # Benchmarks
examples/     # Usage examples
```

得：違規之文／目列存於 `structure_audit.txt`

敗則：若無書之規，用語標默

### 第二步：移誤位之文

移文於其規之目。

**常移**：
1. `tests/` 外之試文 → 移於 `tests/`
2. `docs/` 外之文檔 → 移於 `docs/`
3. `src/` 中之建造 → 除（當 gitignored）
4. 根中之配 → 移於 `config/` 或 `.config/`

各移：
```bash
# Check if file is referenced anywhere
grep -r "filename" .

# If no references or only relative path references:
mkdir -p target_directory/
git mv source/file target_directory/file

# Update any imports/requires
# (language-specific — see repair-broken-references skill)
```

得：諸文於規之位；git 史以 `git mv` 存

敗則：若移斷引，更引路或升

### 第三步：察 README 之新

識諸 README 之陳資。

**陳之徵**：
1. 末改於 6 月之前
2. 引舊版號
3. 斷鏈或碼例
4. 缺節（裝、用、貢）
5. 無證徽或斷徽鏈

```bash
# Find all READMEs
find . -name "README.md" -o -name "readme.md"

# For each README:
# - Check last modified date
git log -1 --format="%ci" README.md

# - Check for broken links
markdown-link-check README.md

# - Verify example code still runs (sample first example)
```

得：陳 README 列於 `readme_freshness.txt`，附具患

敗則：若 markdown-link-check 不可得，手審外鏈

### 第四步：更陳 README

修斷鏈、更例、加缺節。

**標修**：
1. 替斷之徽 URL
2. 更裝之版號
3. 修斷例碼（行以驗）
4. 加缺節（用項目規之模板）
5. 更版權之年

**README 模板構**：
```markdown
# Project Name

Brief description (1-2 sentences).

## Installation

```bash
# Language-specific install command
```

## Usage

```language
# Basic example
```

## Documentation

Link to full docs.

## Contributing

Link to CONTRIBUTING.md or inline guidelines.

## License

LICENSE badge and link.
```

得：諸 README 已更；例已驗可行

敗則：若例碼不可驗，標警

### 第五步：審配文

識配偏而合重設。

**常配之患**：
1. 多 `.env` 文（`.env`、`.env.local`、`.env.dev`、`.env.prod`）
2. 諸配文重設
3. 硬編密（當用環變）
4. 陳 API 端或能旗

```bash
# Find all config files
find . -name "*.config.*" -o -name ".env*" -o -name "*.yml" -o -name "*.yaml"

# For each config:
# - Check for duplicate keys
# - Grep for hardcoded secrets (API keys, tokens, passwords)
grep -E "(api[_-]?key|token|password|secret)" config_file

# - Compare dev vs prod settings
diff .env.dev .env.prod
```

得：配偏書於 `config_review.txt`；密標為升

敗則：若 diff 示大歧，升於 devops-engineer

### 第六步：存棄文

移或除不再須之文。

**棄之候**：
- 注掉之配文（如 `nginx.conf.old`）
- 一年以上未行之舊本
- 備文（如 `file.bak`、`file~`）
- 誤交之建造

**存之程**：
```bash
# Create archive directory (if archive_mode=move)
mkdir -p archive/YYYY-MM-DD/

# For each deprecated file:
# 1. Verify not referenced anywhere
grep -r "filename" .

# 2. Check git history for last modification
git log -1 --format="%ci" filename

# 3. If not modified in >1 year and no references:
if [ "$archive_mode" = "move" ]; then
  git mv filename archive/YYYY-MM-DD/
else
  git rm filename
fi

# 4. Document in ARCHIVE_LOG.md
echo "- filename (reason, last modified: DATE)" >> ARCHIVE_LOG.md
```

得：棄文已存；`ARCHIVE_LOG.md` 已更

敗則：若不確文是否棄，留位而書於報

### 第七步：驗命之規

察諸項目中文命之不一。

**常規**：
- **kebab-case**：`my-file.js`（JS／網項目常用）
- **snake_case**：`my_file.py`（Python 標）
- **PascalCase**：`MyComponent.tsx`（React 件）
- **camelCase**：`myUtility.js`（JavaScript 函）

```bash
# Find files violating conventions
# Example: Python project expecting snake_case
find . -name "*.py" | grep -v "__pycache__" | grep -E "[A-Z-]"

# For each violation, either:
# 1. Rename to match conventions
# 2. Document exception (e.g., Django settings.py convention)
```

得：諸文遵命之規或例外已書

敗則：若改名斷引，更引或升

### 第八步：生整報

書諸構之變。

```markdown
# Project Structure Tidying Report

**Date**: YYYY-MM-DD
**Project**: <project_name>

## Directory Changes

- Moved X files to conventional directories
- Created Y new directories
- Archived Z deprecated files

## README Updates

- Updated W stale READMEs
- Fixed X broken links
- Verified Y code examples

## Config Cleanup

- Consolidated X duplicate settings
- Flagged Y hardcoded secrets for removal
- Documented Z config drift issues

## Files Archived

See ARCHIVE_LOG.md for full list (Z files).

## Naming Convention Fixes

- Renamed X files to match conventions
- Documented Y exceptions

## Escalations

- [Config drift requiring devops review]
- [Hardcoded secrets requiring security audit]
```

得：報存於 `TIDYING_REPORT.md`

敗則：（不適——皆生報）

## 驗

整後：

- [ ] 諸文於規之目
- [ ] 諸 README 中無斷鏈
- [ ] README 之例已驗可行
- [ ] 配文已察密
- [ ] 棄文已存附書
- [ ] 命規一致
- [ ] git 史已存（用 `git mv`，非 `mv`）
- [ ] 移後試仍過

## 陷

1. **斷相對引**：移文斷相對引路。更諸引或用絕對引。

2. **失 git 史**：用 `mv` 而非 `git mv` 失文史。移恆用 git 之命。

3. **過組**：立過深之嵌目使導行更難。簡至繁須構為止。

4. **除而非存**：直除失復之能。確之前恆先存。

5. **忽語規**：以己好凌語標。遵立之規。

6. **不更文檔**：移文不更 README 之路致文斷。

## 參

- [clean-codebase](../clean-codebase/SKILL.md) — 除死碼，修 lint 警
- [repair-broken-references](../repair-broken-references/SKILL.md) — 移後修鏈與引
- [escalate-issues](../escalate-issues/SKILL.md) — 繁配患路於專師
- [devops/config-management](../../devops/config-management/SKILL.md) — 進配合
- [compliance/documentation-audit](../../compliance/documentation-audit/SKILL.md) — 全文檔審
