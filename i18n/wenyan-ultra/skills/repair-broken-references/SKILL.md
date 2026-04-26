---
name: repair-broken-references
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Find and fix broken internal links, dead external URLs, stale imports,
  missing cross-references, and orphaned files. Ensures all project references
  remain valid and up-to-date. Use when documentation contains broken internal
  links, external URLs return 404 errors, import statements reference moved or
  deleted modules, cross-references between files are out of sync, or files
  exist but are never referenced anywhere in the project.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: maintenance
  complexity: intermediate
  language: multi
  tags: maintenance, links, imports, references, orphans
---

# repair-broken-references

## 用

項引舊時用此技：

- 文有內鏈斷
- 外 URL 返 404
- 入述引已移或刪模
- 檔間交引失同步
- 檔存而無處引

**勿用**為重構模依或重設訊構。此技修現引、非重構。

## 入

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `project_path` | string | Yes | Absolute path to project root |
| `check_external` | boolean | No | Verify external URLs (default: true, slow) |
| `fix_mode` | enum | No | `auto` (fix obvious), `report` (document only), `interactive` (prompt) |
| `orphan_threshold` | integer | No | Days since last modified to flag as orphan (default: 180) |

## 行

### 一：掃斷內鏈

尋諸 markdown 鏈指不存檔。

```bash
# Find all markdown files
find . -name "*.md" -type f > markdown_files.txt

# Extract all markdown links: [text](path)
grep -oP '\[.*?\]\(\K[^)]+' *.md | sort | uniq > all_links.txt

# For each link:
while read link; do
  # Skip external URLs (http/https)
  if [[ "$link" =~ ^https?:// ]]; then
    continue
  fi

  # Resolve relative path
  target=$(realpath -m "$link")

  # Check if target exists
  if [ ! -e "$target" ]; then
    echo "BROKEN: $link (referenced in $file)" >> broken_internal.txt
  fi
done < all_links.txt
```

得：`broken_internal.txt` 列諸斷內引

敗：`realpath` 不可用→手察各鏈

### 二：察外 URL

驗外鏈仍可達（HTTP 200 應）。

```bash
# Extract external URLs
grep -ohP 'https?://[^\s\)]+' *.md | sort | uniq > external_urls.txt

# Check each URL (rate-limit to avoid bans)
while read url; do
  status=$(curl -o /dev/null -s -w "%{http_code}" "$url")

  if [ "$status" -ge 400 ]; then
    echo "DEAD ($status): $url" >> dead_urls.txt
  fi

  sleep 0.5  # Rate limit
done < external_urls.txt
```

得：`dead_urls.txt` 列返 4xx/5xx 之 URL

敗：curl 不可用或封→用線上鏈察或略

**注**：某 URL 或返 403 因機檢而瀏覽中行。需手審。

### 三：尋斷入

察諸 import/require 述引存模。

**JavaScript/TypeScript**：
```bash
# Find all import statements
grep -rh "^import.*from ['\"]" . | sed -E "s/.*from ['\"]([^'\"]+)['\"].*/\1/" > imports.txt

# For each import:
while read import; do
  # Skip node_modules and external packages
  if [[ "$import" =~ ^[./] ]]; then
    # Resolve to file path
    target="${import}.js"  # Try .js, .ts, .jsx, .tsx

    if [ ! -e "$target" ]; then
      echo "BROKEN IMPORT: $import" >> broken_imports.txt
    fi
  fi
done < imports.txt
```

**Python**：
```bash
# Find all import statements
grep -rh "^from .* import\|^import " . --include="*.py" | \
  sed -E "s/from ([^ ]+) import.*/\1/" | \
  sed -E "s/import ([^ ]+)/\1/" > imports.txt

# For each local import (starts with .)
# Check if module file exists
```

**R**：
```bash
# Find library() and source() calls
grep -rh "library(\\|source(" . --include="*.R" | \
  sed -E 's/.*library\("([^"]+)"\).*/\1/' > packages.txt

# For source() calls, check if file exists
# For library() calls, check if package installed
Rscript -e "installed.packages()[,'Package']" > installed_packages.txt
```

得：`broken_imports.txt` 列諸已刪/移模引

敗：語特具不可用→手審近重構提交

### 四：尋孤檔

識存而無處引之檔。

```bash
# Find all code files
find . -type f \( -name "*.js" -o -name "*.py" -o -name "*.R" \) > all_files.txt

# For each file:
while read file; do
  basename=$(basename "$file")

  # Search for references (import, require, source, href, link)
  refs=$(grep -r "$basename" . --exclude-dir=node_modules --exclude-dir=.git | wc -l)

  # If only 1 reference (itself):
  if [ "$refs" -le 1 ]; then
    # Check last modified date
    last_mod=$(git log -1 --format="%ci" "$file")

    # If modified more than orphan_threshold days ago
    # Flag as potential orphan
    echo "ORPHAN: $file (last modified: $last_mod)" >> orphans.txt
  fi
done < all_files.txt
```

得：`orphans.txt` 列他處不引之檔

敗：git log 敗→用檔系 mtime 代

**注**：某檔（如 CLI 入點、頂層本）正當不引而非孤。需手審。

### 五：修內鏈

以三策修斷內引：

**策一：尋移檔**
```bash
# For each broken link, search for file by name
while read broken_link; do
  filename=$(basename "$broken_link")

  # Search for file in project
  found=$(find . -name "$filename" | head -1)

  if [ -n "$found" ]; then
    # Update link to new path
    old_path="$broken_link"
    new_path="$found"

    # Use Edit tool to replace in all markdown files
    echo "FIX: $old_path -> $new_path"
  fi
done < broken_internal.txt
```

**策二：建轉檔**
```bash
# If file was deleted intentionally, create redirect stub
echo "# Moved" > "$broken_link"
echo "This content moved to [new location](new_path.md)" >> "$broken_link"
```

**策三：除死鏈**
```bash
# If content no longer exists, remove link (keep text)
# Replace [text](broken_link) with text (plain)
```

得：諸斷內鏈或修、或轉、或除

敗：自動修破脈→升手審

### 六：修斷入

更入述指移後正路。

**JavaScript 例**：
```javascript
// Before (broken)
import { helper } from './utils/helper';

// After (fixed — file moved to lib/)
import { helper } from './lib/helper';
```

各斷入：
1. 定移模（似五）
2. 更入路於諸引檔
3. 行 linter/型察驗修

得：諸入正解；無 module-not-found 錯

敗：模真已刪→升、定其功仍需乎

### 七：書孤檔

孤標檔、定處：

1. **留**：正當不引（入點、本、模板）
2. **存**：舊碼不需而存史
3. **刪**：死碼無值

```markdown
# Orphaned Files Review

| File | Last Modified | Recommendation | Reason |
|------|---------------|----------------|--------|
| scripts/old_deploy.sh | 2024-01-05 | Archive | Replaced by CI/CD |
| src/legacy_api.js | 2023-06-12 | Delete | API v1 fully deprecated |
| bin/cli.py | 2025-12-01 | Keep | CLI entry point (unreferenced by design) |
```

得：孤審文已建；自動決標待人准

敗：（無——無顯處亦書）

### 八：生修報

摘諸斷引與所施修。

```markdown
# Reference Repair Report

**Date**: YYYY-MM-DD
**Project**: <project_name>
**Fix Mode**: auto | report | interactive

## Broken Internal Links

- Total: X
- Fixed: Y
- Redirected: Z
- Escalated: W

Details:
- [file.md](file.md) line 45: Fixed broken link to moved doc
- [another.md](another.md) line 12: Created redirect stub

## Dead External URLs

- Total: X
- Fixed (wayback machine): Y
- Removed: Z

Details:
- https://example.com/old-page (404) → Removed
- https://api.old.com/docs (gone) → Replaced with new docs

## Broken Imports

- Total: X
- Fixed: Y
- Escalated: Z

Details:
- src/main.js line 3: Updated import path after refactor

## Orphaned Files

- Total: X
- Kept: Y
- Archived: Z
- Escalated for review: W

See ORPHAN_REVIEW.md for full analysis.

## Validation

- [x] All tests pass after fixes
- [x] Linter reports no module-not-found errors
- [x] Dead links documented in report
```

得：報存於 `REFERENCE_REPAIR_REPORT.md`

敗：（無——皆生報）

## 驗

修後：

- [ ] 文無斷內鏈
- [ ] 死外 URL 已書（非皆可修）
- [ ] 諸入正解
- [ ] 孤檔已審決
- [ ] 入修後試過
- [ ] Linter 報無未解引
- [ ] Git 史保（移皆用 `git mv`）

## 忌

1. **自 URL 修破脈**：代死鏈以 web.archive.org URL 或非作者意。某鏈宜除
2. **過刪孤**：入點、CLI 本、模板正當不引。勿審而刪
3. **入路設**：設諸相對入用同基。異模系（CommonJS、ES6、TypeScript）路異
4. **外 URL 假陽**：某站封 curl/機而瀏覽中行。死 URL 常手驗
5. **環引陷**：A 入 B、B 入 A。更一破他。需並修
6. **忽段識**：修 `[link](#section)` 需察 `#section` 錨存、非僅檔存
7. **混系誤 R 二進**：WSL 或 Docker、`Rscript` 或解至跨平台包代原 R。`which Rscript && Rscript --version` 察。常用原 R 二進（如 Linux/WSL `/usr/local/bin/Rscript`）為信。見 [Setting Up Your Environment](../../guides/setting-up-your-environment.md) 為 R 路設

## 參

- [clean-codebase](../clean-codebase/SKILL.md) — 確孤後除死碼
- [tidy-project-structure](../tidy-project-structure/SKILL.md) — 重組檔（或致斷引）
- [escalate-issues](../escalate-issues/SKILL.md) — 引複問導至專
- [compliance/documentation-audit](../../compliance/documentation-audit/SKILL.md) — 全文審
- [web-dev/link-checker](../../web-dev/link-checker/SKILL.md) — 進階外 URL 驗
