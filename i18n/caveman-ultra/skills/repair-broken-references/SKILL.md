---
name: repair-broken-references
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Find + fix broken internal links, dead external URLs, stale imports, missing
  cross-refs, orphaned files. Ensures all project refs valid + up-to-date.
  Use → docs has broken internal links, URLs return 404, imports ref moved/
  deleted modules, cross-refs out of sync, files exist but unreferenced.
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

## Use When

Use when project refs gone stale:

- Docs has broken internal links
- External URLs return 404
- Imports ref moved/deleted modules
- Cross-refs between files out of sync
- Files exist but never ref'd anywhere

**Do NOT use** for refactoring module deps or redesigning info arch. This repairs existing refs, not restructures.

## In

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `project_path` | string | Yes | Absolute path to project root |
| `check_external` | boolean | No | Verify external URLs (default: true, slow) |
| `fix_mode` | enum | No | `auto` (fix obvious), `report` (document only), `interactive` (prompt) |
| `orphan_threshold` | integer | No | Days since last modified to flag as orphan (default: 180) |

## Do

### Step 1: Scan Broken Internal Links

Find all markdown links → non-existent files.

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

→ `broken_internal.txt` lists all broken internal refs

If err: `realpath` unavailable → manual check each link

### Step 2: Check External URLs

Verify external links accessible (HTTP 200).

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

→ `dead_urls.txt` lists URLs returning 4xx/5xx

If err: curl unavail or blocked → use online link checker or skip

**Note**: Some URLs return 403 due to bot detection but work in browsers. Manual review needed.

### Step 3: Find Broken Imports

Check all import/require → existing modules.

**JavaScript/TypeScript**:
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

**Python**:
```bash
# Find all import statements
grep -rh "^from .* import\|^import " . --include="*.py" | \
  sed -E "s/from ([^ ]+) import.*/\1/" | \
  sed -E "s/import ([^ ]+)/\1/" > imports.txt

# For each local import (starts with .)
# Check if module file exists
```

**R**:
```bash
# Find library() and source() calls
grep -rh "library(\\|source(" . --include="*.R" | \
  sed -E 's/.*library\("([^"]+)"\).*/\1/' > packages.txt

# For source() calls, check if file exists
# For library() calls, check if package installed
Rscript -e "installed.packages()[,'Package']" > installed_packages.txt
```

→ `broken_imports.txt` lists all refs to deleted/moved modules

If err: lang-specific tool unavail → manual review recent refactor commits

### Step 4: Find Orphaned Files

ID files exist but never ref'd.

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

→ `orphans.txt` lists files not ref'd elsewhere

If err: git log fails → use filesystem mtime

**Note**: Some files (CLI entry points, top-level scripts) legitimately unref'd but not orphans. Manual review.

### Step 5: Fix Internal Links

Repair broken refs via 3 strategies:

**Strategy 1: Find Moved Files**
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

**Strategy 2: Create Redirect Stub**
```bash
# If file was deleted intentionally, create redirect stub
echo "# Moved" > "$broken_link"
echo "This content moved to [new location](new_path.md)" >> "$broken_link"
```

**Strategy 3: Remove Dead Link**
```bash
# If content no longer exists, remove link (keep text)
# Replace [text](broken_link) with text (plain)
```

→ All broken internal links fixed, redirected, or removed

If err: auto fix breaks ctx → escalate manual review

### Step 6: Fix Broken Imports

Update import statements → correct paths after moves.

**JavaScript Example**:
```javascript
// Before (broken)
import { helper } from './utils/helper';

// After (fixed — file moved to lib/)
import { helper } from './lib/helper';
```

For each broken import:
1. Locate moved module (similar Step 5)
2. Update import path in all files ref'ing
3. Run linter/type checker → verify fix

→ All imports resolve correctly; no module-not-found errs

If err: module truly deleted → escalate to determine if functionality still needed

### Step 7: Document Orphans

For files flagged orphans, determine disposition:

1. **Keep**: Legitimately unref'd (entry points, scripts, templates)
2. **Archive**: Old code no longer needed, preserve history
3. **Delete**: Dead code, no value

```markdown
# Orphaned Files Review

| File | Last Modified | Recommendation | Reason |
|------|---------------|----------------|--------|
| scripts/old_deploy.sh | 2024-01-05 | Archive | Replaced by CI/CD |
| src/legacy_api.js | 2023-06-12 | Delete | API v1 fully deprecated |
| bin/cli.py | 2025-12-01 | Keep | CLI entry point (unreferenced by design) |
```

→ Orphan review doc created; auto decisions flagged for human approval

If err: (N/A — document even if no clear disposition)

### Step 8: Generate Report

Summarize all broken refs + fixes.

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

→ Report saved → `REFERENCE_REPAIR_REPORT.md`

If err: (N/A — generate report regardless)

## Check

After repairs:

- [ ] No broken internal links in docs
- [ ] Dead external URLs documented (not all fixable)
- [ ] All imports resolve correctly
- [ ] Orphans reviewed + dispositioned
- [ ] Tests pass after import fixes
- [ ] Linter no unresolved refs
- [ ] Git history preserved (used `git mv` for moves)

## Traps

1. **Auto URL Fixes Break Ctx**: Replacing dead links w/ web.archive.org may not be what author intended. Some better removed.

2. **Over-Aggressive Orphan Delete**: Entry points, CLI scripts, templates often unref'd by design. Don't delete w/o review.

3. **Import Path Assumptions**: Assuming all relative imports use same base path. Diff module systems (CommonJS, ES6, TS) handle paths diff.

4. **External URL False Positives**: Some sites block curl/bots but work browsers. Always manually verify dead URLs.

5. **Circular Ref Traps**: File A imports B, B imports A. Updating one breaks other. Needs simul fix.

6. **Ignoring Fragment IDs**: Fixing `[link](#section)` needs check if `#section` anchor exists, not just if file exists.

7. **Wrong R binary on hybrid systems**: WSL or Docker → `Rscript` may resolve to cross-platform wrapper not native R. Check `which Rscript && Rscript --version`. Prefer native R binary (e.g. `/usr/local/bin/Rscript` on Linux/WSL). See [Setting Up Your Environment](../../guides/setting-up-your-environment.md) for R path config.

## →

- [clean-codebase](../clean-codebase/SKILL.md) — remove dead code after confirming orphans
- [tidy-project-structure](../tidy-project-structure/SKILL.md) — reorganize files (may create broken refs)
- [escalate-issues](../escalate-issues/SKILL.md) — route complex ref issues to specialists
- [compliance/documentation-audit](../../compliance/documentation-audit/SKILL.md) — comprehensive docs review
- [web-dev/link-checker](../../web-dev/link-checker/SKILL.md) — advanced external URL validation
