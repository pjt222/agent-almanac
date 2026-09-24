---
name: repair-broken-references
description: >
  Find and fix broken internal links, dead external URLs, stale imports,
  missing cross-references, and orphaned files. Ensures all project references
  remain valid and up-to-date. Use when documentation contains broken internal
  links, external URLs return 404 errors, import statements reference moved or
  deleted modules, cross-references between files are out of sync, or files
  exist but are never referenced anywhere in the project. Also use in index
  mode for a directory of markdown notes with a designated index, such as an
  agent-memory store, where an orphan is a file the index does not link to.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: maintenance
  complexity: intermediate
  language: multi
  tags: maintenance, links, imports, references, orphans
---

# repair-broken-references

## When to Use

Use this skill when project references have become stale:

- Documentation contains broken internal links
- External URLs return 404 errors
- Import statements reference moved or deleted modules
- Cross-references between files are out of sync
- Files exist but are never referenced anywhere
- A directory of markdown notes has an index, and topic files may not be linked from it

**Do NOT use** for refactoring module dependencies or redesigning information architecture. This skill repairs existing references, not restructures them.

### Two Modes

| Mode | Corpus | An orphan is | Steps |
|---|---|---|---|
| `source` (default) | A source tree: code, docs, external URLs | A file nothing in the tree references | 1-8 |
| `index` | A flat directory of markdown notes with one designated index | A file the designated index does not link to | 9-10 |

Index mode exists because source mode returns **empty** on an agent-memory directory while real orphans sit on disk, and an empty result reads as "no problems". Three separate causes, each addressed in Steps 9-10: discovery looks for source extensions rather than `.md` notes; the age heuristic keys off version-control history, which a memory directory typically does not have; and orphanhood is defined tree-wide rather than against the index — a different and stricter question, since a topic file cited only by a sibling topic file counts as reachable tree-wide while nothing ever loads the sibling either.

## Inputs

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_path` | string | Yes | Absolute path to project root |
| `check_external` | boolean | No | Verify external URLs (default: true, slow) |
| `fix_mode` | enum | No | `auto` (fix obvious), `report` (document only), `interactive` (prompt) |
| `orphan_threshold` | integer | No | Source mode only (Step 4): days since last modified to flag as orphan (default: 180) |
| `mode` | enum | No | `source` (default, Steps 1-8) or `index` (Steps 9-10) |
| `index_file` | string | No | Index-mode only: the designated index (default: `MEMORY.md`, which the Step 9 block names literally — edit it in place for any other index) |

## Procedure

Steps 1-8 are `source` mode. In `index` mode run Steps 9-10 **instead**, not after: source discovery, external URL checking, and import scanning all measure the wrong corpus for a directory of markdown notes.

### Step 1: Scan for Broken Internal Links

Find all markdown links pointing to non-existent files.

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

**Expected:** `broken_internal.txt` lists all broken internal references

**On failure:** If `realpath` unavailable, manually check each link

### Step 2: Check External URLs

Verify that external links are still accessible (HTTP 200 response).

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

**Expected:** `dead_urls.txt` lists URLs returning 4xx/5xx errors

**On failure:** If curl unavailable or blocked, use online link checker or skip

**Note**: Some URLs may return 403 due to bot detection but work in browsers. Manual review required.

### Step 3: Find Broken Imports

Check that all import/require statements reference existing modules.

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

**Expected:** `broken_imports.txt` lists all references to deleted/moved modules

**On failure:** If language-specific tool unavailable, manually review recent refactoring commits

### Step 4: Find Orphaned Files

Identify files that exist but are never referenced anywhere.

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

**Expected:** `orphans.txt` lists files not referenced elsewhere

**On failure:** If git log fails, use filesystem mtime instead

**Note**: Some files (e.g., CLI entry points, top-level scripts) are legitimately unreferenced but not orphans. Requires manual review.

### Step 5: Fix Internal Links

Repair broken internal references using one of three strategies:

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

**Expected:** All broken internal links either fixed, redirected, or removed

**On failure:** If automated fix breaks context, escalate for manual review

### Step 6: Fix Broken Imports

Update import statements to reference correct paths after moves.

**JavaScript Example**:
```javascript
// Before (broken)
import { helper } from './utils/helper';

// After (fixed — file moved to lib/)
import { helper } from './lib/helper';
```

For each broken import:
1. Locate the moved module (similar to Step 5)
2. Update import path in all files referencing it
3. Run linter/type checker to verify fix

**Expected:** All imports resolve correctly; no module-not-found errors

**On failure:** If module was truly deleted, escalate to determine if functionality still needed

### Step 7: Document Orphaned Files

For files flagged as orphans, determine disposition:

1. **Keep**: Legitimately unreferenced (entry points, scripts, templates)
2. **Archive**: Old code no longer needed but preserve history
3. **Delete**: Dead code with no value

```markdown
# Orphaned Files Review

| File | Last Modified | Recommendation | Reason |
|------|---------------|----------------|--------|
| scripts/old_deploy.sh | 2024-01-05 | Archive | Replaced by CI/CD |
| src/legacy_api.js | 2023-06-12 | Delete | API v1 fully deprecated |
| bin/cli.py | 2025-12-01 | Keep | CLI entry point (unreferenced by design) |
```

**Expected:** Orphan review document created; automated decisions flagged for human approval

**On failure:** (N/A — document even if no clear disposition)

### Step 8: Generate Repair Report

Summarize all broken references and fixes applied.

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

**Expected:** Report saved to `REFERENCE_REPAIR_REPORT.md`

**On failure:** (N/A — generate report regardless)

### Step 9: Index Mode — Reachability Against a Designated Index

Applies when the corpus is a flat directory of markdown notes with one designated index — an agent-memory store (`MEMORY.md` plus topic files) is the reference case, and the block below also appears in `manage-memory`, `prune-agent-memory`, and `verify-memory-integrity`, kept byte-identical across all four by `scripts/test/memory-blocks.test.js`. Only the index is loaded automatically; topic files are read on demand. So **a write succeeding tells you nothing about whether the memory will ever be read again.** Verify reachability, not write success — and verify it every session, because the operation that breaks reachability (compaction) is the same operation the size and line caps make mandatory.

```bash
# Reachability: the index is the only file loaded automatically, so a topic file
# that nothing links to is not deprioritized — it is invisible.
DIR=<memory-dir>
python3 - "$DIR" <<'PY'
import os, re, sys

d    = sys.argv[1]
text = open(os.path.join(d, 'MEMORY.md'), 'rb').read().decode('utf-8', 'replace')
# HTML comments are stripped before the index reaches the model, and the
# stripped content is excluded from the load limits: a note left in one is
# invisible to the reader, and buys nothing by being cheap.
text = re.sub(r'<!--.*?-->', '', text, flags=re.S)

EXAMPLES = {'file.md', 'example.md', 'topic-name.md'}      # format-documentation targets
linked   = {os.path.basename(m) for m in re.findall(r'\]\(([^)#\s]+\.md)', text)} - EXAMPLES
on_disk  = {f for f in os.listdir(d) if f.endswith('.md') and f != 'MEMORY.md'}

orphans, dangling = sorted(on_disk - linked), sorted(linked - on_disk)
size = lambda names: sum(os.path.getsize(os.path.join(d, n)) for n in names)
tot  = size(on_disk) or 1

print(f"topic files {len(on_disk)}; linked {len(linked & on_disk)}")
print(f"ORPHANS  {len(orphans)} = {len(orphans)/max(len(on_disk),1):.1%} of files, {size(orphans)/tot:.1%} of bytes")
print(f"DANGLING {len(dangling)} (linked, absent on disk)")
for n in orphans:  print(f"  orphan   {n}")
for n in dangling: print(f"  dangling {n}")
PY
```

Rules this implementation honors, each learned from a real miss:

1. **Exclude template/example link targets** — a format-documentation line such as `- [Title](file.md) — hook` otherwise reports as a dangling link forever, and a check that cries wolf trains its operator to ignore it.
2. **A prose mention is not reachability.** Require an exact filename match on a real link target. Report near-matches separately as *degraded references*; never count them as reachable.
3. **HTML comments in the index are not a mitigation.** They are stripped before the index reaches the model, so a curator note left in one is written into a void. If a note must survive, it has to be a plain markdown line.
4. **Parse frontmatter, do not grep it.** A `^type:` regex misses a field nested under `metadata:` and reports a conformance failure that does not exist.
5. **Report both denominators, labeled.** File share and byte share are different numbers and must never be printed interchangeably.

**Expected:** Every topic file is classified reachable or orphan, every index link either resolves or is reported dangling, and the orphan share is printed as both a file share and a byte share.

**On failure:** If the designated index is absent, stop and report that. An index-mode run with no index has no reachability question to answer, and falling back to Step 4 would silently answer the tree-wide question instead.

### Step 10: Index Mode — Age Without Version-Control History

Step 4 dates a candidate orphan with `git log -1`. A memory directory usually lives outside any repository, so that command prints nothing, every candidate loses its date, and the run reports no orphans at all. Fall back to filesystem mtime:

```bash
# Age fallback for a store with no version-control history.
DIR=<memory-dir>
find "$DIR" -maxdepth 1 -name '*.md' ! -name 'MEMORY.md' \
  -printf '%TY-%Tm-%Td  %p\n' | sort
```

**mtime measures writes, not reads.** A topic file read every session and never edited is byte-for-byte indistinguishable from one nothing has opened in a year. Age is therefore a ranking aid for files Step 9 has *already* called orphans, never evidence that a reachable file is unused, and never on its own a reason to delete. That is why this block carries no `orphan_threshold` cutoff: Step 9 decides orphanhood and Step 10 only dates it, so an `-mtime` filter here would hide a recently written orphan behind an empty result — the failure Pitfall 8 describes, reproduced inside index mode.

**Expected:** Every orphan carries a last-modified date, and none is dropped for want of a commit.

**On failure:** If `find -printf` is unavailable (BSD/macOS), substitute `stat -f '%Sm %N'`. If the directory *is* under version control, prefer Step 4's `git log -1`: it dates the content change rather than the file write, and a checkout rewrites mtime.

## Validation Checklist

After repairs:

- [ ] No broken internal links in documentation
- [ ] Dead external URLs documented (not all fixable)
- [ ] All imports resolve correctly
- [ ] Orphaned files reviewed and dispositioned
- [ ] Tests pass after import fixes
- [ ] Linter reports no unresolved references
- [ ] Git history preserved (used `git mv` for any moves)

Index mode replaces those with:

- [ ] The designated index exists — an empty result from a missing index is not a clean result
- [ ] Every topic file is linked from the index, or listed as a reviewed orphan
- [ ] Every index link resolves on disk; dangling links fixed or removed
- [ ] Orphan share reported as file share **and** byte share, each labeled
- [ ] Orphans dated from mtime where no version-control history exists, and the date read as a write, not a read

## Common Pitfalls

1. **Automatic URL Fixes Break Context**: Replacing dead links with web.archive.org URLs may not be what the author intended. Some links are better removed.

2. **Over-Aggressive Orphan Deletion**: Entry points, CLI scripts, and templates are often unreferenced by design. Don't delete without review.

3. **Import Path Assumptions**: Assuming all relative imports use the same base path. Different module systems (CommonJS, ES6, TypeScript) handle paths differently.

4. **External URL False Positives**: Some sites block curl/bots but work fine in browsers. Always manually verify dead URLs.

5. **Circular Reference Traps**: File A imports B, B imports A. Updating one breaks the other. Requires simultaneous fix.

6. **Ignoring Fragment Identifiers**: Fixing `[link](#section)` requires checking if `#section` anchor exists, not just if file exists.

7. **Wrong R binary on hybrid systems**: On WSL or Docker, `Rscript` may resolve to a cross-platform wrapper instead of native R. Check with `which Rscript && Rscript --version`. Prefer the native R binary (e.g., `/usr/local/bin/Rscript` on Linux/WSL) for reliability. See [Setting Up Your Environment](../../guides/setting-up-your-environment.md) for R path configuration.

8. **Running Source Mode Against an Index Corpus**: Steps 1-8 report nothing on a directory of markdown notes — the discovery globs miss `.md`, and the age heuristic finds no version-control history — and an empty report reads as "no problems found" rather than "the wrong question was asked". Choose the mode before the run, not after reading the result.

9. **Reading mtime as Evidence of Use**: A recent mtime says a file was written recently, not that anything has read it. Nothing in the store records reads at all, so no amount of filesystem metadata can promote a file out of orphan status — only a link in the index can.

10. **Carrying the Source-Mode Orphan Definition into Index Mode**: A topic file linked from a *sibling* topic file is reachable tree-wide and still an orphan against the index, because nothing loads the sibling either. Counting those as reachable is how a store reports zero orphans while carrying dozens.

## Related Skills

- [clean-codebase](../clean-codebase/SKILL.md) — Remove dead code after confirming orphans
- [tidy-project-structure](../tidy-project-structure/SKILL.md) — Reorganize files (may create broken references)
- [escalate-issues](../escalate-issues/SKILL.md) — Route complex reference issues to specialists
- [validate-references](../validate-references/SKILL.md) — External URL and DOI validation for bibliographies
- [manage-memory](../manage-memory/SKILL.md) — Curates the index this skill's index mode measures
- [verify-memory-integrity](../verify-memory-integrity/SKILL.md) — Runs the same reachability block alongside the dual-cap budget check
- [references/EXAMPLES.md](references/EXAMPLES.md) — Worked index-mode run, report template, and the degraded-reference pass
