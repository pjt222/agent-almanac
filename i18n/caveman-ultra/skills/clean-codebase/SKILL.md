---
name: clean-codebase
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Remove dead code, unused imports, fix lint warnings, and normalize formatting
  across a codebase without changing business logic or architecture. Use when
  lint warnings have piled up during rapid development, unused imports and
  variables clutter files, dead code paths were never removed, formatting is
  inconsistent, or static analysis tools report fixable hygiene issues.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: maintenance
  complexity: intermediate
  language: multi
  tags: maintenance, cleanup, lint, dead-code, formatting
---

# clean-codebase

## Use When

Codebase has hygiene debt:

- Lint warns piled up during rapid dev
- Unused imports + vars clutter files
- Dead code paths never removed
- Formatting inconsistent across files
- Static analysis reports fixable issues

**Do NOT use** for architectural refactor, bug fixes, or business logic changes. This = hygiene + automated cleanup only.

## In

| Param | Type | Required | Description |
|-----------|------|----------|-------------|
| `codebase_path` | string | Yes | Absolute path to codebase root |
| `language` | string | Yes | Primary language (js, python, r, rust, etc.) |
| `cleanup_mode` | enum | No | `safe` (default) or `aggressive` |
| `run_tests` | boolean | No | Run test suite after cleanup (default: true) |
| `backup` | boolean | No | Create backup before deletion (default: true) |

## Do

### Step 1: Pre-Cleanup Assessment

Measure current state → quantify gains later.

```bash
# Count lint warnings by severity
lint_tool --format json > lint_before.json

# Count lines of code
cloc . --json > cloc_before.json

# List unused symbols (language-dependent)
# JavaScript/TypeScript: ts-prune or depcheck
# Python: vulture
# R: lintr unused function checks
```

**→** Baseline metrics saved to `lint_before.json` + `cloc_before.json`

**If err:** Lint tool not found → skip automated fixes, manual review

### Step 2: Fix Automated Lint Warnings

Apply safe auto fixes (spacing, quotes, semis, trailing ws).

**JavaScript/TypeScript**:
```bash
eslint --fix .
prettier --write .
```

**Python**:
```bash
black .
isort .
ruff check --fix .
```

**R**:
```bash
Rscript -e "styler::style_dir('.')"
```

**Rust**:
```bash
cargo fmt
cargo clippy --fix --allow-dirty
```

**→** All safe lint warns resolved; files formatted consistent

**If err:** Auto fixes break tests → revert, escalate

### Step 3: Identify Dead Code Paths

Static analysis → unreferenced fns, unused vars, orphaned files.

**JavaScript/TypeScript**:
```bash
ts-prune | tee dead_code.txt
depcheck | tee unused_deps.txt
```

**Python**:
```bash
vulture . | tee dead_code.txt
```

**R**:
```bash
Rscript -e "lintr::lint_dir('.', linters = lintr::unused_function_linter())"
```

**General approach**:
1. Grep fn defs
2. Grep fn calls
3. Report fns defined but never called

**→** `dead_code.txt` lists unused fns, vars, files

**If err:** Static analysis tool unavail → manual review recent commit history for orphans

### Step 4: Remove Unused Imports

Clean import blocks → drop refs to pkgs never used.

**JavaScript**:
```bash
eslint --fix --rule 'no-unused-vars: error'
```

**Python**:
```bash
autoflake --remove-all-unused-imports --in-place --recursive .
```

**R**:
```bash
# Manual review: grep for library() calls, check if package used
grep -r "library(" . | cut -d: -f2 | sort | uniq
```

**→** All unused imports removed

**If err:** Removing imports breaks build → used indirectly → restore + doc

### Step 5: Remove Dead Code (Mode-Dependent)

**Safe Mode** (default):
- Remove code explicit marked deprecated
- Remove commented-out blocks (>10 lines + >6 months old)
- Remove TODO comments for completed issues

**Aggressive Mode** (opt-in):
- Remove all unused fns from Step 3
- Remove private methods w/ zero refs
- Remove feature flags for deprecated features

Each candidate deletion:
1. Valid. zero refs in codebase
2. Check git history → skip if modified last 30 days
3. Remove + add entry to `CLEANUP_LOG.md`

**→** Dead code removed; `CLEANUP_LOG.md` documents all deletions

**If err:** Uncertain code truly dead → move to `archive/` dir vs. delete

### Step 6: Normalize Formatting

Consistent formatting all files (even if linters miss).

1. Normalize line endings (LF vs CRLF)
2. Single newline at EOF
3. Remove trailing ws
4. Normalize indentation (spaces vs tabs, width)

```bash
# Example: Fix line endings and trailing whitespace
find . -type f -name "*.js" -exec sed -i 's/\r$//' {} +
find . -type f -name "*.js" -exec sed -i 's/[[:space:]]*$//' {} +
```

**→** All files follow consistent formatting conventions

**If err:** sed breaks binary files → skip + doc

### Step 7: Run Tests

Valid. cleanup didn't break functionality.

```bash
# Language-specific test command
npm test              # JavaScript
pytest                # Python
R CMD check           # R
cargo test            # Rust
```

**→** All tests pass (or same fails as pre-cleanup)

**If err:** Revert incrementally → identify breaking change → escalate

### Step 8: Generate Cleanup Report

Doc all changes for review.

```markdown
# Codebase Cleanup Report

**Date**: YYYY-MM-DD
**Mode**: safe | aggressive
**Language**: <language>

## Metrics

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Lint warnings | X | Y | -Z |
| Lines of code | A | B | -C |
| Unused imports | D | 0 | -D |
| Dead functions | E | F | -G |

## Changes Applied

1. Fixed X lint warnings (automated)
2. Removed Y unused imports
3. Deleted Z lines of dead code (see CLEANUP_LOG.md)
4. Normalized formatting across W files

## Escalations

- [Issue description requiring human review]
- [Uncertain deletion moved to archive/]

## Validation

- [x] All tests pass
- [x] Backup created: backup_YYYYMMDD/
- [x] CLEANUP_LOG.md updated
```

**→** Report saved to `CLEANUP_REPORT.md` in project root

**If err:** (N/A — generate report regardless)

## Check

Post-cleanup:

- [ ] All tests pass (or same fails as before)
- [ ] No new lint warns introduced
- [ ] Backup created pre-delete
- [ ] `CLEANUP_LOG.md` documents all removed code
- [ ] Cleanup report generated w/ metrics
- [ ] Git diff reviewed for unexpected changes
- [ ] CI pipeline passes

## Traps

1. **Remove Code Still Used via Reflection**: Static analysis misses dynamic calls (e.g., `eval()`, metaprogramming). Always check git history.

2. **Break Implicit Deps**: Removing imports used by deps. Run tests after every import removal.

3. **Delete Feature Flags for Active Features**: Unused in current branch, but maybe active in other envs. Check deployment configs.

4. **Over-Aggressive Formatting**: Tools like `black` / `prettier` reformat → unnecessary diffs. Configure tools → project style.

5. **Ignore Test Coverage**: Can't safely clean codebases w/o tests. Low coverage → escalate for test additions first.

6. **No Backup**: Always create `backup_YYYYMMDD/` dir pre-delete, even w/ git.

7. **Wrong R binary on hybrid systems**: WSL / Docker, `Rscript` maybe resolves to cross-platform wrapper vs. native R. Check w/ `which Rscript && Rscript --version`. Prefer native R binary (e.g., `/usr/local/bin/Rscript` Linux/WSL) for reliability. See [Setting Up Your Environment](../../guides/setting-up-your-environment.md) for R path config.

## →

- [tidy-project-structure](../tidy-project-structure/SKILL.md) — Organize dir layout, update READMEs
- [repair-broken-references](../repair-broken-references/SKILL.md) — Fix dead links + imports
- [escalate-issues](../escalate-issues/SKILL.md) — Route complex problems to specialists
- [r-packages/run-r-cmd-check](../../r-packages/run-r-cmd-check/SKILL.md) — Full R pkg checks
- [devops/dependency-audit](../../devops/dependency-audit/SKILL.md) — Check outdated deps
