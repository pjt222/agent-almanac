---
name: tidy-project-structure
locale: wenyan-ultra
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

# 整案構

## 用

案組離規時用：

- 檔散於諸目無明組
- README 舊或含斷例
- 配檔繁衍（dev/staging/prod 漂）
- 棄檔留於案根
- 名規於諸目不一

**勿用**於碼重構或依重構。此技焦於檔組與文衛。

## 入

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `project_path` | string | Yes | Absolute path to project root |
| `conventions` | string | No | Path to style guide (e.g., `docs/conventions.md`) |
| `archive_mode` | enum | No | `move` (default) or `delete` for deprecated files |
| `readme_update` | boolean | No | Update stale READMEs (default: true) |

## 行

### 一：察目布

比今構於案規或語善法。

**諸語常規**：

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

得：違規之檔/目列存於 `structure_audit.txt`

敗：無文規→用語標默

### 二：移錯位之檔

遷檔至常目。

**常移**：
1. `tests/` 外測檔 → 移於 `tests/`
2. `docs/` 外文 → 移於 `docs/`
3. `src/` 中構物 → 刪（當忽於 git）
4. 根中配檔 → 移於 `config/` 或 `.config/`

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

得：諸檔於常位；git 史以 `git mv` 留

敗：移斷入→更入路或升

### 三：察 README 新

識諸 README 中陳訊。

**陳示**：
1. 末改 >6 月前
2. 引舊版號
3. 斷鏈或例
4. 缺段（裝、用、貢）
5. 無證徽或斷徽

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

得：陳 README 列於 `readme_freshness.txt` 含具患

敗：markdown-link-check 不在→手覆外鏈

### 四：更陳 README

修斷鏈、更例、加缺段。

**標修**：
1. 替斷徽 URL
2. 更裝指中版號
3. 修斷例（行驗）
4. 加缺段（用案規模）
5. 更權年

**README 模構**：
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

得：諸 README 更；例驗行

敗：例不可驗→以警注標

### 五：察配檔

識配漂與合複設。

**常配患**：
1. 多 `.env` 檔（`.env`、`.env.local`、`.env.dev`、`.env.prod`）
2. 跨配檔複設
3. 硬碼密（當用環變）
4. 舊 API 端或功旗

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

得：配漂文於 `config_review.txt`；密標升

敗：差顯大→升於 devops-engineer

### 六：藏棄檔

移或刪不需檔。

**藏候**：
- 注配檔（如 `nginx.conf.old`）
- >1 年未行之舊腳本
- 備檔（如 `file.bak`、`file~`）
- 誤入之構物

**藏程**：
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

得：棄檔藏；`ARCHIVE_LOG.md` 更

敗：不確檔棄否→留位文於報

### 七：驗名規

察跨案名不一。

**常規**：
- **kebab-case**：`my-file.js`（JS/web 常）
- **snake_case**：`my_file.py`（Python 標）
- **PascalCase**：`MyComponent.tsx`（React 件）
- **camelCase**：`myUtility.js`（JS 函）

```bash
# Find files violating conventions
# Example: Python project expecting snake_case
find . -name "*.py" | grep -v "__pycache__" | grep -E "[A-Z-]"

# For each violation, either:
# 1. Rename to match conventions
# 2. Document exception (e.g., Django settings.py convention)
```

得：諸檔合名規或例外文

敗：改名斷入→更參或升

### 八：生整報

文諸構變。

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

敗：（不適——無論生報）

## 驗

整後：

- [ ] 諸檔於常目
- [ ] README 中無斷鏈
- [ ] README 例驗行
- [ ] 配檔察密
- [ ] 棄檔藏含文
- [ ] 名規一
- [ ] git 史留（用 `git mv`、非 `mv`）
- [ ] 移後測仍過

## 忌

1. **斷相對入**：移檔斷相對入路。更諸參或用絕對入

2. **失 git 史**：用 `mv` 而非 `git mv` 失史。常用 git 為移

3. **過組**：建多嵌目使遊難。保平至繁需構

4. **刪代藏**：直刪失復。常先藏除非確

5. **忽語規**：施己好於語標。守既規

6. **不更文**：移檔不更 README 路使文斷

## 參

- [clean-codebase](../clean-codebase/SKILL.md) — 除死碼、修 lint 警
- [repair-broken-references](../repair-broken-references/SKILL.md) — 移後修鏈與入
- [escalate-issues](../escalate-issues/SKILL.md) — 繁配患路至專
- [devops/config-management](../../devops/config-management/SKILL.md) — 進配合
- [compliance/documentation-audit](../../compliance/documentation-audit/SKILL.md) — 全文覆
