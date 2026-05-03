---
name: tidy-project-structure
locale: wenyan-lite
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

## 適用時機

當專案組織自慣例漂移時用此技能：

- 檔散於目錄而無清晰組織
- README 過時或含損壞範例
- 配置檔已增多（dev、staging、prod 漂移）
- 廢棄檔留於專案根
- 跨目錄之命名慣例不一致

**勿用於**代碼重構或依賴重組。此技能聚焦於檔案組織與文件衛生。

## 輸入

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `project_path` | string | Yes | Absolute path to project root |
| `conventions` | string | No | Path to style guide (e.g., `docs/conventions.md`) |
| `archive_mode` | enum | No | `move` (default) or `delete` for deprecated files |
| `readme_update` | boolean | No | Update stale READMEs (default: true) |

## 步驟

### 步驟一：稽核目錄佈局

將當前結構與專案慣例或語言最佳實踐相比。

**依語言之常見慣例**：

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

**預期：** 違反慣例之檔／目錄清單存於 `structure_audit.txt`

**失敗時：** 若無記錄之慣例，用語言標準預設

### 步驟二：移動錯置之檔

將檔重置於其慣例目錄。

**常見移動**：
1. `tests/` 外之測試檔 → 移至 `tests/`
2. `docs/` 外之文件 → 移至 `docs/`
3. `src/` 中之建置產物 → 刪（應 gitignored）
4. 根之配置檔 → 移至 `config/` 或 `.config/`

對每移動：
```bash
# Check if file is referenced anywhere
grep -r "filename" .

# If no references or only relative path references:
mkdir -p target_directory/
git mv source/file target_directory/file

# Update any imports/requires
# (language-specific — see repair-broken-references skill)
```

**預期：** 所有檔於慣例位置；git 歷史經 `git mv` 保留

**失敗時：** 若移動破壞引入，更新引入路徑或上報

### 步驟三：檢查 README 新鮮度

識別所有 README 檔中之過時資訊。

**過時指標**：
1. 上次修改超過 6 個月前
2. 參考舊版本號
3. 損壞之連結或代碼範例
4. 缺節（Installation、Usage、Contributing）
5. 無授權標章或損壞標章連結

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

**預期：** 過時 README 之清單於 `readme_freshness.txt` 含具體問題

**失敗時：** 若 markdown-link-check 不可用，手動審外部連結

### 步驟四：更新過時 README

修損壞連結、更新範例、加缺節。

**標準修復**：
1. 替損壞標章 URL
2. 更新安裝指引中之版本號
3. 修損壞範例代碼（執以驗）
4. 加缺節（用專案慣例之模板）
5. 更新版權年

**README 模板結構**：
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

**預期：** 所有 README 已更新；範例已驗可執

**失敗時：** 若範例代碼無法驗，以警告註標記

### 步驟五：審配置檔

識別配置漂移並合併重複設定。

**常見配置問題**：
1. 多個 `.env` 檔（`.env`、`.env.local`、`.env.dev`、`.env.prod`）
2. 跨配置檔之重複設定
3. 硬編密（應用環境變數）
4. 過時 API 端點或功能旗標

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

**預期：** 配置漂移記於 `config_review.txt`；密標出供上報

**失敗時：** 若 diff 顯示主要分歧，上報至 devops-engineer

### 步驟六：歸檔廢棄檔

將不再需之檔移或刪。

**歸檔候選**：
- 已註解之配置檔（如 `nginx.conf.old`）
- 超過 1 年未執行之遺留腳本
- 備份檔（如 `file.bak`、`file~`）
- 意外提交之建置產物

**歸檔流程**：
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

**預期：** 廢棄檔已歸檔；`ARCHIVE_LOG.md` 已更新

**失敗時：** 若不確檔是否廢棄，留於原位並於報告中記錄

### 步驟七：驗命名慣例

跨專案檢檔命名不一致。

**常見慣例**：
- **kebab-case**：`my-file.js`（JS／web 專案常見）
- **snake_case**：`my_file.py`（Python 標準）
- **PascalCase**：`MyComponent.tsx`（React 組件）
- **camelCase**：`myUtility.js`（JavaScript 函式）

```bash
# Find files violating conventions
# Example: Python project expecting snake_case
find . -name "*.py" | grep -v "__pycache__" | grep -E "[A-Z-]"

# For each violation, either:
# 1. Rename to match conventions
# 2. Document exception (e.g., Django settings.py convention)
```

**預期：** 所有檔皆從命名慣例或例外已記錄

**失敗時：** 若改名破壞引入，更新引用或上報

### 步驟八：產生整理報告

記錄所有結構變更。

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

**預期：** 報告存至 `TIDYING_REPORT.md`

**失敗時：**（不適用——無論如何皆產生報告）

## 驗證清單

整理後：

- [ ] 所有檔於慣例目錄
- [ ] 任何 README 中無損壞連結
- [ ] README 範例已驗可執
- [ ] 配置檔已審密
- [ ] 廢棄檔已歸檔附記錄
- [ ] 命名慣例一致
- [ ] Git 歷史已保留（用 `git mv`，非 `mv`）
- [ ] 移動後測試仍通過

## 常見陷阱

1. **破壞相對引入**：移動檔破壞相對引入路徑。更新所有引用或用絕對引入。

2. **失 Git 歷史**：用 `mv` 而非 `git mv` 失檔之歷史。永遠用 git 命令以移動。

3. **過度組織**：建過多巢狀目錄使導航更難。保持平直至複雜需結構。

4. **刪而非歸檔**：直接刪失復原能力。除非確定否則永遠先歸檔。

5. **忽略語言慣例**：將個人偏好凌駕語言標準。從既建慣例。

6. **未更新文件**：移動檔而不更新 README 路徑留損壞文件。

## 相關技能

- [clean-codebase](../clean-codebase/SKILL.md) — 移除死碼、修棉絮警告
- [repair-broken-references](../repair-broken-references/SKILL.md) — 移動後修連結與引入
- [escalate-issues](../escalate-issues/SKILL.md) — 將複雜配置問題路由至專家
- [devops/config-management](../../devops/config-management/SKILL.md) — 進階配置合併
- [compliance/documentation-audit](../../compliance/documentation-audit/SKILL.md) — 全面文件審查
