---
name: tidy-project-structure
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

## When to Use

Use this skill when project organization has drifted from conventions:

- Files scattered across directories without clear organization
- READMEs are outdated or contain broken examples
- Configuration files have multiplied (dev, staging, prod drift)
- Deprecated files remain in project root
- Naming conventions inconsistent across directories

**Do NOT use** for code refactoring or dependency restructuring. This skill focuses on file organization and documentation hygiene.

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `project_path` | string | Yes | Absolute path to project root |
| `conventions` | string | No | Path to style guide (e.g., `docs/conventions.md`) |
| `archive_mode` | enum | No | `move` (default) or `delete` for deprecated files |
| `readme_update` | boolean | No | Update stale READMEs (default: true) |

## Procedure

### Step 1: Audit Directory Layout

Compare current structure against project conventions or language best practices.

**Common conventions by language**:

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

**Expected:** List of files/directories violating conventions saved to `structure_audit.txt`

**On failure:** If no conventions documented, use language-standard defaults

### Step 2: Move Misplaced Files

Relocate files to their conventional directories.

**Common moves**:
1. Test files outside `tests/` → move to `tests/`
2. Documentation outside `docs/` → move to `docs/`
3. Build artifacts in `src/` → delete (should be gitignored)
4. Config files in root → move to `config/` or `.config/`

For each move:
```bash
# Check if file is referenced anywhere
grep -r "filename" .

# If no references or only relative path references:
mkdir -p target_directory/
git mv source/file target_directory/file

# Update any imports/requires
# (language-specific — see repair-broken-references skill)
```

**Expected:** All files in conventional locations; git history preserved via `git mv`

**On failure:** If moving breaks imports, update import paths or escalate

### Step 3: Check README Freshness

Identify stale information in all README files.

**Staleness indicators**:
1. Last modified >6 months ago
2. References to old version numbers
3. Broken links or code examples
4. Missing sections (Installation, Usage, Contributing)
5. No license badge or broken badge links

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

**Expected:** List of stale READMEs in `readme_freshness.txt` with specific issues

**On failure:** If markdown-link-check unavailable, manually review external links

### Step 4: Update Stale READMEs

Fix broken links, update examples, add missing sections.

**Standard fixes**:
1. Replace broken badge URLs
2. Update version numbers in installation instructions
3. Fix broken example code (run to verify)
4. Add missing sections (use template from project conventions)
5. Update copyright year

**README template structure**:
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

**Expected:** All READMEs updated; examples verified to run

**On failure:** If example code cannot be verified, mark with warning comment

### Step 5: Review Config Files

Identify configuration drift and consolidate duplicate settings.

**Common config issues**:
1. Multiple `.env` files (`.env`, `.env.local`, `.env.dev`, `.env.prod`)
2. Duplicate settings across config files
3. Hardcoded secrets (should use environment variables)
4. Outdated API endpoints or feature flags

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

**Expected:** Config drift documented in `config_review.txt`; secrets flagged for escalation

**On failure:** If diff shows major divergence, escalate to devops-engineer

### Step 6: Archive Deprecated Files

Move or delete files no longer needed.

**Candidates for archiving**:
- Commented-out config files (e.g., `nginx.conf.old`)
- Legacy scripts not run in >1 year
- Backup files (e.g., `file.bak`, `file~`)
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

**Expected:** Deprecated files archived; `ARCHIVE_LOG.md` updated

**On failure:** If uncertain whether file is deprecated, leave in place and document in report

### Step 7: Verify Naming Conventions

Check for inconsistent file naming across project.

**Common conventions**:
- **kebab-case**: `my-file.js` (common in JS/web projects)
- **snake_case**: `my_file.py` (Python standard)
- **PascalCase**: `MyComponent.tsx` (React components)
- **camelCase**: `myUtility.js` (JavaScript functions)

```bash
# Find files violating conventions
# Example: Python project expecting snake_case
find . -name "*.py" | grep -v "__pycache__" | grep -E "[A-Z-]"

# For each violation, either:
# 1. Rename to match conventions
# 2. Document exception (e.g., Django settings.py convention)
```

**Expected:** All files follow naming conventions or exceptions documented

**On failure:** If renaming breaks imports, update references or escalate

### Step 8: Generate Tidying Report

Document all structural changes.

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

**Expected:** Report saved to `TIDYING_REPORT.md`

**On failure:** (N/A — generate report regardless)

## Validation Checklist

After tidying:

- [ ] All files in conventional directories
- [ ] No broken links in any README
- [ ] README examples verified to run
- [ ] Config files reviewed for secrets
- [ ] Deprecated files archived with documentation
- [ ] Naming conventions consistent
- [ ] Git history preserved (used `git mv`, not `mv`)
- [ ] Tests still pass after moves

## Common Pitfalls

1. **Breaking Relative Imports**: Moving files breaks relative import paths. Update all references or use absolute imports.

2. **Losing Git History**: Using `mv` instead of `git mv` loses file history. Always use git commands for moves.

3. **Over-Organizing**: Creating too many nested directories makes navigation harder. Keep it flat until complexity requires structure.

4. **Deleting Instead of Archiving**: Direct deletion loses ability to recover. Always archive first unless certain.

5. **Ignoring Language Conventions**: Imposing personal preferences over language standards. Follow established conventions.

6. **Not Updating Documentation**: Moving files without updating README paths leaves docs broken.

## Related Skills

- [clean-codebase](../clean-codebase/SKILL.md) — Remove dead code, fix lint warnings
- [repair-broken-references](../repair-broken-references/SKILL.md) — Fix links and imports after moves
- [escalate-issues](../escalate-issues/SKILL.md) — Route complex config issues to specialists
- [devops/config-management](../../devops/config-management/SKILL.md) — Advanced config consolidation
- [compliance/documentation-audit](../../compliance/documentation-audit/SKILL.md) — Comprehensive doc review
