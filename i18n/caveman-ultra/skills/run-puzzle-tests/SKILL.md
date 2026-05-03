---
name: run-puzzle-tests
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Run jigsawR test suite via WSL R. Full|filtered|single. Interpret pass/fail/skip + identify fails. Never `--vanilla` (renv needs `.Rprofile`). Use → post-R-edit, post-new-type, pre-commit verify, debug fail.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: jigsawr
  complexity: basic
  language: R
  tags: jigsawr, testing, testthat, renv, wsl
---

# Run Puzzle Tests

Run jigsawR test suite + interpret results.

## Use When

- Post any R src edit
- Post new puzzle type|feature
- Pre-commit → verify nothing broke
- Debug specific fail

## In

- **Required**: Scope (`full`|`filtered`|`single`)
- **Optional**: Filter pattern (`"snic"`, `"rectangular"`)
- **Optional**: Test file path (single mode)

## Do

### Step 1: Choose Scope

| Scope | Use when | Duration |
|-------|----------|----------|
| Full | Before commits, after major changes | ~2-5 min |
| Filtered | Working on one puzzle type | ~30s |
| Single | Debugging a specific test file | ~10s |

→ Scope chosen by workflow: full pre-commit, filtered for type work, single for debug.

If err: unsure → default full. Slower but catches cross-type regressions.

### Step 2: Create+Exec Test Script

**Full**:

Create `/tmp/run_tests.R`:

```r
devtools::test()
```

```bash
R_EXE="/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe"
cd /mnt/d/dev/p/jigsawR && "$R_EXE" -e "devtools::test()"
```

**Filtered**:

```bash
"$R_EXE" -e "devtools::test(filter = 'snic')"
```

**Single**:

```bash
"$R_EXE" -e "testthat::test_file('tests/testthat/test-snic-puzzles.R')"
```

→ Test out w/ pass/fail/skip.

If err:
- NEVER `--vanilla`; renv needs `.Rprofile`
- renv errs → `renv::restore()` first
- Complex cmds fail Exit 5 → write script file

### Step 3: Interpret Results

Summary line:

```
[ FAIL 0 | WARN 0 | SKIP 7 | PASS 2042 ]
```

- **PASS**: Succeeded
- **FAIL**: Need investigation
- **SKIP**: Skipped (missing optional pkg like `snic`)
- **WARN**: Warns (review, not blocking)

→ Summary parsed → PASS, FAIL, SKIP, WARN counts. FAIL=0 = clean.

If err: no summary → runner crashed pre-complete. Check R errs above. Output truncated → redirect: `"$R_EXE" -e "devtools::test()" > test_results.txt 2>&1`.

### Step 4: Investigate Fails

If fail:

1. Read msg → file, line, expected vs actual
2. New fail or pre-existing?
3. Assertion → read test + tested fn
4. Error → check fn signature changed?

```bash
# Run just the failing test with verbose output
"$R_EXE" -e "testthat::test_file('tests/testthat/test-failing.R', reporter = 'summary')"
```

→ Root cause id'd. Real regression (fix code) or env issue (dep, path).

If err: msg unclear → add `browser()`|`print()` + re-run via `testthat::test_file()` for interactive debug.

### Step 5: Verify Skip Reasons

Skips normal when optional deps missing:

- `snic` → `skip_if_not_installed("snic")`
- OS-specific → `skip_on_os()`
- CRAN-only → `skip_on_cran()`

Confirm legitimate, not masking real fails.

→ All skips accounted by legit reasons. None mask actual fails.

If err: skip suspicious → temp remove `skip_if_*()` + run → see if pass or hidden fail.

## Check

- [ ] All pass (FAIL=0)
- [ ] No unexpected warns
- [ ] Skip matches expected (only optional dep skips)
- [ ] Test count not decreased (no accidentally removed)

## Traps

- **`--vanilla`**: Breaks renv. Never w/ jigsawR.
- **Complex `-e` strings**: Shell escape → Exit 5. Use script files.
- **Stale pkg state**: Run `devtools::load_all()`|`document()` before test if NAMESPACE changed.
- **Missing test deps**: Some need Suggests pkgs. Check `DESCRIPTION`.
- **Parallel issues**: Tests interfere → run sequential w/ `testthat::test_file()`.

## →

- `generate-puzzle` — gen puzzles → verify behavior matches tests
- `add-puzzle-type` — new types need comprehensive suites
- `write-testthat-tests` — general R test patterns
- `validate-piles-notation` — test PILES parse standalone
