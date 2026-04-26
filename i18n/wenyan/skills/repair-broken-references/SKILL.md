---
name: repair-broken-references
locale: wenyan
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

# 修斷之引

## 用時

項目之諸引已陳乃用此技：

- 文檔含斷之內鏈
- 外 URL 返 404 誤
- import 陳述引已移或已刪之模
- 文間之交引脫同
- 文存而無處引之

**勿用**於重構模之依或重設信構。本技修現引，非重構之。

## 入

| 參 | 類 | 必 | 述 |
|-----------|------|----------|-------------|
| `project_path` | 串 | 是 | 項目根之絕路 |
| `check_external` | 布 | 否 | 驗外 URL（默：是，緩） |
| `fix_mode` | 列 | 否 | `auto`（修明顯）、`report`（獨書）、`interactive`（問） |
| `orphan_threshold` | 整 | 否 | 距末改之日，標為孤（默：180） |

## 法

### 第一步：掃斷之內鏈

尋諸 markdown 鏈指不存之文。

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

得：`broken_internal.txt` 列諸斷之內引

敗則：若 `realpath` 不可得，手察各鏈

### 第二步：察外 URL

驗外鏈仍可訪（HTTP 200 之應）。

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

得：`dead_urls.txt` 列返 4xx/5xx 誤之 URL

敗則：若 curl 不可得或被阻，用線之鏈察器或略

**注**：某 URL 或因察機之拒返 403 然於覽器中行之。需手審。

### 第三步：尋斷之 import

察諸 import/require 之陳述引存之模。

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

得：`broken_imports.txt` 列諸引已刪/已移之模

敗則：若語特之具不可得，手審近之重構之提交

### 第四步：尋孤文

識文存而無處引之。

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

得：`orphans.txt` 列無處引之文

敗則：若 git log 敗，用文系之 mtime 代之

**注**：某文（如 CLI 入點、頂層之文）合而無引，非孤也。需手審。

### 第五步：修內鏈

以三策之一修斷之內引：

**策一：尋已移之文**

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

**策二：立轉之短**

```bash
# If file was deleted intentionally, create redirect stub
echo "# Moved" > "$broken_link"
echo "This content moved to [new location](new_path.md)" >> "$broken_link"
```

**策三：除死之鏈**

```bash
# If content no longer exists, remove link (keep text)
# Replace [text](broken_link) with text (plain)
```

得：諸斷內鏈或修、或轉、或除

敗則：若自動之修破境，升以行手審

### 第六步：修斷之 import

更 import 陳述以引移後之正路。

**JavaScript 例**：

```javascript
// Before (broken)
import { helper } from './utils/helper';

// After (fixed — file moved to lib/)
import { helper } from './lib/helper';
```

各斷之 import：

1. 定移之模（似第五步）
2. 於諸引之文中更 import 路
3. 行 linter/類察以驗修

得：諸 import 解正；無 module-not-found 之誤

敗則：若模真已刪，升以定其能否仍需

### 第七步：書孤文

於標為孤之文，定處：

1. **留**：合而無引（入點、文、樣）
2. **存**：舊碼不需而存其史
3. **刪**：死碼無值

```markdown
# Orphaned Files Review

| File | Last Modified | Recommendation | Reason |
|------|---------------|----------------|--------|
| scripts/old_deploy.sh | 2024-01-05 | Archive | Replaced by CI/CD |
| src/legacy_api.js | 2023-06-12 | Delete | API v1 fully deprecated |
| bin/cli.py | 2025-12-01 | Keep | CLI entry point (unreferenced by design) |
```

得：孤審文檔已立；自動之決標待人承

敗則：（無——雖無清處仍書之）

### 第八步：生修報

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

敗則：（無——雖然亦書之）

## 驗

修後：

- [ ] 文檔無斷之內鏈
- [ ] 死之外 URL 已書（非皆可修）
- [ ] 諸 import 解正
- [ ] 孤文已審且已決
- [ ] import 修後試過
- [ ] linter 報無未解之引
- [ ] git 史已存（諸移用 `git mv`）

## 陷

1. **自動 URL 修破境**：以 web.archive.org 之 URL 代死鏈或非著者所欲。某鏈宜除
2. **過烈刪孤**：入點、CLI 之文、樣常合而無引。勿無審而刪
3. **import 路之假**：假諸相對 import 用同基路。異模系（CommonJS、ES6、TypeScript）異路
4. **外 URL 之假陽**：某站阻 curl/察機而於覽器中行之。必手驗死 URL
5. **環引之陷**：文 A 引 B，B 引 A。更一破他。需同時修
6. **忽片識**：修 `[link](#section)` 須察 `#section` 錨存乎，非獨察文存
7. **混系之 R 二進制誤**：於 WSL 或 Docker，`Rscript` 或解至跨台之裹而非原 R。以 `which Rscript && Rscript --version` 察。為信宜用原 R 二進制（如 Linux/WSL 之 `/usr/local/bin/Rscript`）。R 路之設見 [Setting Up Your Environment](../../guides/setting-up-your-environment.md)

## 參

- [clean-codebase](../clean-codebase/SKILL.md) — 確孤後刪死碼
- [tidy-project-structure](../tidy-project-structure/SKILL.md) — 重組諸文（或致斷引）
- [escalate-issues](../escalate-issues/SKILL.md) — 引繁引患至專
- [compliance/documentation-audit](../../compliance/documentation-audit/SKILL.md) — 全文檔之審
- [web-dev/link-checker](../../web-dev/link-checker/SKILL.md) — 進階外 URL 之驗
