---
name: tidy-project-structure
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Organize project files → conventional dirs, update stale READMEs, clean
  config drift, archive deprecated w/o changing code logic. Use → files
  scattered no clear org, READMEs outdated/broken examples, config files
  multiplied across dev/staging/prod, deprecated in root, naming
  conventions inconsistent.
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

## Use When

Project org drifted from conventions:

- Files scattered, no clear org
- READMEs outdated | broken examples
- Config files multiplied (dev, staging, prod drift)
- Deprecated in project root
- Naming inconsistent across dirs

**Do NOT use** for code refactoring | dep restructuring. Focus = file org + doc hygiene.

## In

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `project_path` | string | Yes | Absolute path to project root |
| `conventions` | string | No | Path to style guide (e.g., `docs/conventions.md`) |
| `archive_mode` | enum | No | `move` (default) or `delete` for deprecated files |
| `readme_update` | boolean | No | Update stale READMEs (default: true) |

## Do

### Step 1: Audit Layout

Cmp current structure vs conventions | language best practices.

**Common conventions by lang**:

**JavaScript/TypeScript**:
```
src/          # Source code
tests/        # Test files
dist/         # Build output (gitignored)
docs/         # Documentation
.github/      # CI/CD workflows
```

**Python**:
```
package_name/      # Package code
tests/             # Test suite
docs/              # Sphinx docs
scripts/           # Utility scripts
```

**R**:
```
R/                 # R source
tests/testthat/    # Test suite
man/               # Documentation (generated)
vignettes/         # Long-form guides
inst/              # Installed files
data/              # Package data
```

**Rust**:
```
src/          # Source code
tests/        # Integration tests
benches/      # Benchmarks
examples/     # Usage examples
```

**Got:** List of files/dirs violating saved to `structure_audit.txt`.

**If err:** No conventions doc'd → use language-std defaults.

### Step 2: Move Misplaced Files

Relocate to conventional dirs.

**Common moves**:
1. Test files outside `tests/` → `tests/`
2. Docs outside `docs/` → `docs/`
3. Build artifacts in `src/` → delete (gitignored)
4. Config in root → `config/` | `.config/`

Per move:
```bash
# Check if file is referenced anywhere
grep -r "filename" .

# If no references or only relative path references:
mkdir -p target_directory/
git mv source/file target_directory/file

# Update any imports/requires
# (language-specific — see repair-broken-references skill)
```

**Got:** All files in conventional locations; git history preserved via `git mv`.

**If err:** Moving breaks imports → update import paths | escalate.

### Step 3: README Freshness

ID stale info in all READMEs.

**Staleness indicators**:
1. Last mod >6 mo ago
2. Old ver # references
3. Broken links | code examples
4. Missing sections (Install, Usage, Contributing)
5. No license badge | broken badge links

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

**Got:** List of stale READMEs in `readme_freshness.txt` w/ specific issues.

**If err:** markdown-link-check unavail → manually review external links.

### Step 4: Update Stale READMEs

Fix broken links, update examples, add missing sections.

**Std fixes**:
1. Replace broken badge URLs
2. Update vers in install instructions
3. Fix broken example code (run to verify)
4. Add missing sections (template from conventions)
5. Update copyright year

**README template**:
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

**Got:** All READMEs updated; examples verified to run.

**If err:** Example code can't be verified → mark w/ warning comment.

### Step 5: Review Config Files

ID drift + consolidate duplicate settings.

**Common config issues**:
1. Multiple `.env` (`.env`, `.env.local`, `.env.dev`, `.env.prod`)
2. Duplicate settings across configs
3. Hardcoded secrets (use env vars)
4. Outdated API endpoints | feature flags

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

**Got:** Config drift doc'd in `config_review.txt`; secrets flagged for escalation.

**If err:** Diff shows major divergence → escalate to devops-engineer.

### Step 6: Archive Deprecated Files

Move | delete files no longer needed.

**Candidates**:
- Commented-out configs (`nginx.conf.old`)
- Legacy scripts not run in >1y
- Backup files (`file.bak`, `file~`)
- Build artifacts accidentally committed

**Archive process**:
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

**Got:** Deprecated archived; `ARCHIVE_LOG.md` updated.

**If err:** Uncertain if deprecated → leave + doc in report.

### Step 7: Verify Naming Conventions

Check inconsistent file naming across project.

**Common conventions**:
- **kebab-case**: `my-file.js` (JS/web)
- **snake_case**: `my_file.py` (Python)
- **PascalCase**: `MyComponent.tsx` (React)
- **camelCase**: `myUtility.js` (JS fns)

```bash
# Find files violating conventions
# Example: Python project expecting snake_case
find . -name "*.py" | grep -v "__pycache__" | grep -E "[A-Z-]"

# For each violation, either:
# 1. Rename to match conventions
# 2. Document exception (e.g., Django settings.py convention)
```

**Got:** All files follow conventions | exceptions doc'd.

**If err:** Renaming breaks imports → update references | escalate.

### Step 8: Generate Tidying Report

Doc all structural changes.

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

**Got:** Report saved to `TIDYING_REPORT.md`.

**If err:** (N/A — generate regardless)

## Check

Post-tidy:

- [ ] All files in conventional dirs
- [ ] No broken links any README
- [ ] README examples verified
- [ ] Config files reviewed for secrets
- [ ] Deprecated archived w/ docs
- [ ] Naming conventions consistent
- [ ] Git history preserved (`git mv` not `mv`)
- [ ] Tests still pass after moves

## Traps

1. **Break Relative Imports**: Moving breaks relative paths. Update refs | use absolute.
2. **Lose Git History**: `mv` not `git mv` → loses history. Always git cmds for moves.
3. **Over-Organize**: Too many nested dirs → harder navigation. Flat until complexity demands.
4. **Delete vs Archive**: Direct delete → no recovery. Always archive first unless certain.
5. **Ignore Language Conventions**: Personal pref over language std. Follow established.
6. **Not Updating Docs**: Moving w/o updating README paths → broken docs.

## →

- [clean-codebase](../clean-codebase/SKILL.md) — remove dead code, fix lint warns
- [repair-broken-references](../repair-broken-references/SKILL.md) — fix links + imports after moves
- [escalate-issues](../escalate-issues/SKILL.md) — route complex config to specialists
- [devops/config-management](../../devops/config-management/SKILL.md) — advanced config consolidation
- [compliance/documentation-audit](../../compliance/documentation-audit/SKILL.md) — comprehensive doc review
