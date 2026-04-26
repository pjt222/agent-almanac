---
name: repair-broken-references
locale: wenyan-lite
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

## 適用時機

當項目引用陳舊時用本技能：

- 文件含失效之內部連結
- 外部 URL 返 404 錯誤
- 載入述句引用已移或已刪之模組
- 文件間之交互引用失同步
- 文件存在但無處被引用

**勿用**於重構模組依賴或重設計資訊架構。本技能修既有引用，不重構之。

## 輸入

| 參數 | 類型 | 必要 | 描述 |
|-----------|------|----------|-------------|
| `project_path` | string | 是 | 項目根之絕對路徑 |
| `check_external` | boolean | 否 | 驗外部 URL（預設 true，慢） |
| `fix_mode` | enum | 否 | `auto`（修明顯者）、`report`（僅記）、`interactive`（提問） |
| `orphan_threshold` | integer | 否 | 視為孤兒之自上次修改起天數（預設 180） |

## 步驟

### 步驟一：掃描失效之內部連結

找指向不存在文件之所有 markdown 連結。

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

**預期：** `broken_internal.txt` 列所有失效內部引用

**失敗時：** 若 `realpath` 不可用，手檢每連結

### 步驟二：檢外部 URL

驗外部連結仍可達（HTTP 200 回應）。

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

**預期：** `dead_urls.txt` 列返 4xx／5xx 錯誤之 URL

**失敗時：** 若 curl 不可用或被擋，用線上連結檢查器或略

**注**：某些 URL 因機器人偵測返 403 但於瀏覽器中可用。需手動檢視。

### 步驟三：找失效之載入

檢所有 import／require 述句皆引用既有模組。

**JavaScript／TypeScript**：
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

**預期：** `broken_imports.txt` 列引用已刪／已移模組之所有引用

**失敗時：** 若語言特定工具不可用，手檢近期重構提交

### 步驟四：找孤兒文件

識存在但無處被引用之文件。

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

**預期：** `orphans.txt` 列他處未引用之文件

**失敗時：** 若 git log 失敗，改用文件系統 mtime

**注**：某些文件（如 CLI 入口、頂層腳本）合理未被引用但非孤兒。需手動檢視。

### 步驟五：修內部連結

以下列三策之一修失效內部引用：

**策一：找已移文件**
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

**策二：建重定向樁**
```bash
# If file was deleted intentionally, create redirect stub
echo "# Moved" > "$broken_link"
echo "This content moved to [new location](new_path.md)" >> "$broken_link"
```

**策三：移除失效連結**
```bash
# If content no longer exists, remove link (keep text)
# Replace [text](broken_link) with text (plain)
```

**預期：** 所有失效內部連結或修、或重定向、或移除

**失敗時：** 若自動修破壞脈絡，升級至手動檢視

### 步驟六：修失效之載入

更新 import 述句以引正確路徑（移後）。

**JavaScript 例**：
```javascript
// Before (broken)
import { helper } from './utils/helper';

// After (fixed — file moved to lib/)
import { helper } from './lib/helper';
```

對每失效之 import：
1. 定位已移之模組（似步驟五）
2. 於所有引用之文件中更新 import 路徑
3. 跑 linter／類型檢查器以驗修復

**預期：** 所有 import 正確解析；無 module-not-found 錯

**失敗時：** 若模組確已刪，升級以決功能是否仍需

### 步驟七：記錄孤兒文件

對標為孤兒之文件，定處置：

1. **保**：合理未引用（入口、腳本、模板）
2. **歸檔**：舊代碼不再需但保歷史
3. **刪**：無價值之死代碼

```markdown
# Orphaned Files Review

| File | Last Modified | Recommendation | Reason |
|------|---------------|----------------|--------|
| scripts/old_deploy.sh | 2024-01-05 | Archive | Replaced by CI/CD |
| src/legacy_api.js | 2023-06-12 | Delete | API v1 fully deprecated |
| bin/cli.py | 2025-12-01 | Keep | CLI entry point (unreferenced by design) |
```

**預期：** 孤兒檢視文件已建；自動決策已標待人核准

**失敗時：**（不適用——即無清晰處置亦記錄）

### 步驟八：生修復報告

總結所有失效引用與所施修復。

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

**預期：** 報告存於 `REFERENCE_REPAIR_REPORT.md`

**失敗時：**（不適用——無論如何皆生報告）

## 驗證

修復後：

- [ ] 文件中無失效內部連結
- [ ] 失效之外部 URL 已記錄（非皆可修）
- [ ] 所有 import 正確解析
- [ ] 孤兒文件已檢並處置
- [ ] import 修復後測試通過
- [ ] linter 報告無未解之引用
- [ ] git 歷史已保（任何移動皆用 `git mv`）

## 常見陷阱

1. **自動 URL 修復破壞脈絡**：將失效連結替換為 web.archive.org URL 恐非作者本意。某些連結宜移除
2. **過度刪除孤兒**：入口、CLI 腳本與模板每每合理未被引用。勿不檢視即刪
3. **import 路徑假設**：假設所有相對 import 用同基礎路徑。不同模組系統（CommonJS、ES6、TypeScript）路徑處理不同
4. **外部 URL 誤報**：某些站擋 curl／機器人但於瀏覽器中可用。務手動驗失效 URL
5. **循環引用陷阱**：A 載 B，B 載 A。更新一者破壞他者。需同時修復
6. **忽略片段識別符**：修 `[link](#section)` 需檢 `#section` 錨是否存在，非僅檢文件存在
7. **混合系統錯之 R 二進位**：於 WSL 或 Docker 上，`Rscript` 恐解至跨平台包裝而非原生 R。以 `which Rscript && Rscript --version` 檢之。為可靠性宜選原生 R 二進位（如 Linux／WSL 上之 `/usr/local/bin/Rscript`）。R 路徑配置見 [Setting Up Your Environment](../../guides/setting-up-your-environment.md)

## 相關技能

- [clean-codebase](../clean-codebase/SKILL.md) — 確認孤兒後移除死代碼
- [tidy-project-structure](../tidy-project-structure/SKILL.md) — 重組文件（恐生失效引用）
- [escalate-issues](../escalate-issues/SKILL.md) — 將複雜引用問題交專家
- [compliance/documentation-audit](../../compliance/documentation-audit/SKILL.md) — 全面文件檢視
- [web-dev/link-checker](../../web-dev/link-checker/SKILL.md) — 進階外部 URL 驗證
