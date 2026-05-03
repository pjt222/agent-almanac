---
name: run-puzzle-tests
locale: caveman-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Run jigsawR test suite via WSL R. Supports full suite, filtered by pattern,
  or single file. Interprets pass/fail/skip counts and identifies failing tests.
  Never use `--vanilla` (renv needs `.Rprofile` to activate). Use after R source
  changes, after adding a puzzle type or feature, before commits, or when
  debugging a specific failure.
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

Run the jigsawR test suite and interpret results.

## When to Use

- After modifying R source code in the package
- After adding a new puzzle type or feature
- Before committing changes
- Debugging a specific test failure

## Inputs

- **Required**: Test scope (`full`, `filtered`, or `single`)
- **Optional**: Filter pattern for filtered mode (e.g. `"snic"`, `"rectangular"`)
- **Optional**: Specific test file path for single mode

## Procedure

### Step 1: Choose Test Scope

| Scope | Use when | Duration |
|-------|----------|----------|
| Full | Before commits, after major changes | ~2-5 min |
| Filtered | Working on one puzzle type | ~30s |
| Single | Debugging a specific test file | ~10s |

**Got:** Test scope selected: full before commits, filtered for one puzzle type, single for debugging one test.

**If fail:** If unsure, default to full suite. Slower but catches cross-type regressions.

### Step 2: Create and Execute Test Script

**Full suite**:

Create a script (e.g., `/tmp/run_tests.R`):

```r
devtools::test()
```

```bash
R_EXE="/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe"
cd /mnt/d/dev/p/jigsawR && "$R_EXE" -e "devtools::test()"
```

**Filtered by pattern**:

```bash
"$R_EXE" -e "devtools::test(filter = 'snic')"
```

**Single file**:

```bash
"$R_EXE" -e "testthat::test_file('tests/testthat/test-snic-puzzles.R')"
```

**Got:** Test output with pass/fail/skip counts.

**If fail:**
- Do NOT use `--vanilla`; renv needs `.Rprofile` to activate
- On renv errors, run `renv::restore()` first
- For complex commands failing with Exit code 5, write to a script file

### Step 3: Interpret Results

Look for the summary line:

```
[ FAIL 0 | WARN 0 | SKIP 7 | PASS 2042 ]
```

- **PASS**: Tests succeeded
- **FAIL**: Tests failed (need investigation)
- **SKIP**: Tests skipped (often due to optional packages like `snic`)
- **WARN**: Warnings during tests (review but not blocking)

**Got:** Summary line parsed for PASS, FAIL, SKIP, WARN counts. FAIL = 0 for clean run.

**If fail:** Without summary line, the runner crashed before completing. Check for R-level errors above. If output is truncated, redirect to file: `"$R_EXE" -e "devtools::test()" > test_results.txt 2>&1`.

### Step 4: Investigate Failures

If tests fail:

1. Read the failure message — includes file, line, expected vs actual
2. Check if new failure or pre-existing
3. For assertion failures, read the test and the function tested
4. For error failures, check if a function signature changed

```bash
# Run failing test with verbose output
"$R_EXE" -e "testthat::test_file('tests/testthat/test-failing.R', reporter = 'summary')"
```

**Got:** Root cause of each failing test identified — regression (code fix) or environment issue (missing dep, path).

**If fail:** With unclear failure messages, add `browser()` or `print()` and re-run with `testthat::test_file()` for interactive debugging.

### Step 5: Verify Skip Reasons

Skips are normal when optional dependencies are missing:

- `snic` package tests skip with `skip_if_not_installed("snic")`
- Tests requiring specific OS skip with `skip_on_os()`
- CRAN-only skips with `skip_on_cran()`

Confirm skip reasons are legitimate, not masking real failures.

**Got:** All skips accounted for by legitimate reasons. No skips masking failures.

**If fail:** If a skip seems suspicious, temporarily remove the `skip_if_*()` call and run the test.

## Validation

- [ ] All tests pass (FAIL = 0)
- [ ] No unexpected warnings
- [ ] Skip count matches expected (only optional deps)
- [ ] Test count has not decreased (no tests accidentally removed)

## Pitfalls

- **Using `--vanilla`**: Breaks renv activation. Never use it with jigsawR.
- **Complex `-e` strings**: Shell escaping issues cause Exit code 5. Use script files.
- **Stale package state**: Run `devtools::load_all()` or `devtools::document()` before testing if NAMESPACE changed.
- **Missing test dependencies**: Some tests need suggested packages. Check `DESCRIPTION` Suggests field.
- **Parallel test issues**: If tests interfere, run sequentially with `testthat::test_file()`.

## Related Skills

- `generate-puzzle` — generate puzzles to verify behavior matches tests
- `add-puzzle-type` — new types need comprehensive test suites
- `write-testthat-tests` — patterns for writing R tests
- `validate-piles-notation` — test PILES parsing independently
