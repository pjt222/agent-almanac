---
name: run-puzzle-tests
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Run the jigsawR test suite via WSL R execution. Supports full suite,
  filtered by pattern, or single file. Interprets pass/fail/skip counts
  and identifies failing tests. Never uses --vanilla flag (renv needs
  .Rprofile for activation). Use after modifying any R source code, after
  adding a new puzzle type or feature, before committing changes to verify
  nothing is broken, or when debugging a specific test failure.
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

Run jigsawR test suite. Read results.

## When Use

- After modifying R source in package
- After adding new puzzle type or feature
- Before commit to verify nothing broken
- Debugging specific test failure

## Inputs

- **Required**: Test scope (`full`, `filtered`, `single`)
- **Optional**: Filter pattern (filtered mode, e.g. `"snic"`, `"rectangular"`)
- **Optional**: Specific test file path (single mode)

## Steps

### Step 1: Choose Test Scope

| Scope | Use when | Duration |
|-------|----------|----------|
| Full | Before commits, after major changes | ~2-5 min |
| Filtered | Working on one puzzle type | ~30s |
| Single | Debugging a specific test file | ~10s |

**Got:** Scope selected by workflow: full before commits, filtered for one type, single for one debug.

**If fail:** Unsure? Default to full. Slower but catches cross-type regressions.

### Step 2: Create and Execute Test Script

**Full suite**.

Make script (e.g., `/tmp/run_tests.R`).

```r
devtools::test()
```

```bash
R_EXE="/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe"
cd /mnt/d/dev/p/jigsawR && "$R_EXE" -e "devtools::test()"
```

**Filtered by pattern**.

```bash
"$R_EXE" -e "devtools::test(filter = 'snic')"
```

**Single file**.

```bash
"$R_EXE" -e "testthat::test_file('tests/testthat/test-snic-puzzles.R')"
```

**Got:** Test output with pass/fail/skip counts.

**If fail:**
- Do NOT use `--vanilla` flag; renv needs `.Rprofile` to activate
- renv errors? Run `renv::restore()` first
- Complex commands fail with Exit 5? Write to script file

### Step 3: Interpret Results

Look for summary line.

```
[ FAIL 0 | WARN 0 | SKIP 7 | PASS 2042 ]
```

- **PASS**: Tests succeeded
- **FAIL**: Tests failed (need investigation)
- **SKIP**: Tests skipped (usually missing optional packages like `snic`)
- **WARN**: Warnings during tests (review but not blocking)

**Got:** Summary line parsed for PASS, FAIL, SKIP, WARN. FAIL = 0 = clean run.

**If fail:** Summary not visible? Runner crashed before completing. Check R-level errors above. Output truncated? Redirect to file: `"$R_EXE" -e "devtools::test()" > test_results.txt 2>&1`.

### Step 4: Investigate Failures

If tests fail.

1. Read failure msg — includes file, line, expected vs actual
2. Check if new failure or pre-existing
3. Assertion failures: read test + function being tested
4. Error failures: check function signature changed

```bash
# Run just the failing test with verbose output
"$R_EXE" -e "testthat::test_file('tests/testthat/test-failing.R', reporter = 'summary')"
```

**Got:** Root cause of each failing test identified. Failure = real regression (fix code) or test env issue (missing dep, path).

**If fail:** Failure msg unclear? Add `browser()` or `print()` to test, re-run with `testthat::test_file()` for interactive debug.

### Step 5: Verify Skip Reasons

Skipped tests normal when optional deps missing.

- `snic` package tests skip with `skip_if_not_installed("snic")`
- Tests needing specific OS skip with `skip_on_os()`
- CRAN-only skips with `skip_on_cran()`

Confirm skip reasons legitimate, not masking real failures.

**Got:** All skips accounted for by legitimate reasons (optional dep, platform skip, CRAN-only). No skips masking actual failures.

**If fail:** Skip suspicious? Temporarily remove `skip_if_*()` and run test to see pass or hidden failure.

## Checks

- [ ] All tests pass (FAIL = 0)
- [ ] No unexpected warnings
- [ ] Skip count matches expected (only optional dep skips)
- [ ] Test count not decreased (no tests removed by accident)

## Pitfalls

- **Use `--vanilla`**: Breaks renv activation. Never with jigsawR.
- **Complex `-e` strings**: Shell escaping = Exit 5. Use script files.
- **Stale package state**: Run `devtools::load_all()` or `devtools::document()` before testing if NAMESPACE-affecting code changed.
- **Missing test deps**: Some tests need suggested packages. Check `DESCRIPTION` Suggests.
- **Parallel test issues**: Tests interfere? Run sequential with `testthat::test_file()`.

## See Also

- `generate-puzzle` — generate puzzles to verify behavior matches tests
- `add-puzzle-type` — new types need comprehensive test suites
- `write-testthat-tests` — general patterns for writing R tests
- `validate-piles-notation` — test PILES parsing independently
