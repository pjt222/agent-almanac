---
name: fail-early-pattern
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Apply the fail-early (fail-fast) pattern to detect and report errors at
  the earliest possible point. Covers input validation with guard clauses,
  meaningful error messages, assertion functions, and anti-patterns that
  silently swallow failures. Primary examples in R with general/polyglot
  guidance. Use when writing functions that accept external input, adding
  input validation before CRAN submission, refactoring code that silently
  produces wrong results, reviewing PRs for error-handling quality, or
  hardening internal APIs against invalid arguments.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: error-handling, validation, defensive-programming, guard-clauses, fail-fast
---

# Fail Early

If something is going to fail, it should fail as early as possible, as loud as possible, with as much context as possible. This skill codifies fail-early pattern: check inputs at system edges, use guard clauses to reject bad state before it spreads, and write error msgs that answer *what* failed, *where*, *why*, and *how to fix it*.

## When Use

- Writing or reviewing functions that take external input (user data, API responses, file content)
- Adding input check to package functions before CRAN submit
- Refactor code that silently makes wrong results instead of erroring
- Reviewing PRs for error-handle quality
- Harden internal APIs vs bad args

## Inputs

- **Required**: Function or module to apply pattern to
- **Required**: Spot of trust edges (where external data enters)
- **Optional**: Existing error-handle code to refactor
- **Optional**: Target lang (default: R; also applies to Python, TypeScript, Rust)

## Steps

### Step 1: Identify Trust Boundaries

Map where external data enters system. These are spots that need check:

- Public API functions (exported functions in R package)
- User-facing params
- File I/O (reading configs, data files, user uploads)
- Network responses (API calls, DB queries)
- Env vars and system config

Internal helper functions called only by your own checked code usually do not need dup check.

**Got:** List of entry points where untrusted data crosses into your code.

**If fail:** Edges unclear? Trace back from errors in logs or bug reports to find where bad data first entered.

### Step 2: Add Guard Clauses at Entry Points

Check inputs at top of each public function, before any work starts.

**R (base):**

```r
calculate_summary <- function(data, method = c("mean", "median", "trim"), trim_pct = 0.1) {
  # Guard: type check
  if (!is.data.frame(data)) {
    stop("'data' must be a data frame, not ", class(data)[[1]], call. = FALSE)
  }
  # Guard: non-empty
  if (nrow(data) == 0L) {
    stop("'data' must have at least one row", call. = FALSE)
  }
  # Guard: argument matching
  method <- match.arg(method)
  # Guard: range check
  if (!is.numeric(trim_pct) || trim_pct < 0 || trim_pct > 0.5) {
    stop("'trim_pct' must be a number between 0 and 0.5, got: ", trim_pct, call. = FALSE)
  }
  # --- All guards passed, begin real work ---
  # ...
}
```

**R (rlang/cli — preferred for packages):**

```r
calculate_summary <- function(data, method = c("mean", "median", "trim"), trim_pct = 0.1) {
  rlang::check_required(data)
  if (!is.data.frame(data)) {
    cli::cli_abort("{.arg data} must be a data frame, not {.cls {class(data)}}.")
  }
  if (nrow(data) == 0L) {
    cli::cli_abort("{.arg data} must have at least one row.")
  }
  method <- rlang::arg_match(method)
  if (!is.numeric(trim_pct) || trim_pct < 0 || trim_pct > 0.5) {
    cli::cli_abort("{.arg trim_pct} must be between 0 and 0.5, not {.val {trim_pct}}.")
  }
  # ...
}
```

**General (TypeScript):**

```typescript
function calculateSummary(data: DataFrame, method: Method, trimPct: number): Summary {
  if (data.rows.length === 0) {
    throw new Error(`data must have at least one row`);
  }
  if (trimPct < 0 || trimPct > 0.5) {
    throw new RangeError(`trimPct must be between 0 and 0.5, got: ${trimPct}`);
  }
  // ...
}
```

**Got:** Every public function opens with guard clauses that reject bad input before any side effects or compute.

**If fail:** Check logic gets long (>15 lines of guards)? Pull `validate_*` helper or use `stopifnot()` for simple type asserts.

### Step 3: Write Meaningful Error Messages

Every error msg should answer four questions:

1. **What** failed — which param or op
2. **Where** — function name or context (auto with `cli::cli_abort`)
3. **Why** — what expected vs what got
4. **How to fix** — when fix not obvious

**Good messages:**

```r
# What + Why (expected vs. actual)
stop("'n' must be a positive integer, got: ", n, call. = FALSE)

# What + Why + How to fix
cli::cli_abort(c(
  "{.arg config_path} does not exist: {.file {config_path}}",
  "i" = "Create it with {.run create_config({.file {config_path}})}."
))

# What + context
cli::cli_abort(c(
  "Column {.val {col_name}} not found in {.arg data}.",
  "i" = "Available columns: {.val {names(data)}}"
))
```

**Bad messages:**

```r
stop("Error")                    # What failed? No idea
stop("Invalid input")           # Which input? What's wrong with it?
stop(paste("Error in step", i)) # No actionable information
```

**Got:** Error msgs self-doc — dev seeing error first time can diagnose and fix without read source code.

**If fail:** Review three most recent bug reports. Any need read source code to grasp? Their error msgs need fix.

### Step 4: Prefer stop() Over warning()

Use `stop()` (or `cli::cli_abort()`) when function cannot make right result. Use `warning()` only when function can still make meaningful result but caller should know about worry.

**Rule of thumb:** User could silent get wrong answer? That is `stop()`, not `warning()`.

```r
# CORRECT: stop when result would be wrong
read_config <- function(path) {
  if (!file.exists(path)) {
    stop("Config file not found: ", path, call. = FALSE)
  }
  yaml::read_yaml(path)
}

# CORRECT: warn when result is still usable
summarize_data <- function(data) {
  if (any(is.na(data$value))) {
    warning(sum(is.na(data$value)), " NA values dropped from 'value' column", call. = FALSE)
    data <- data[!is.na(data$value), ]
  }
  # proceed with valid data
}
```

**Got:** `stop()` used for conds that would make wrong results; `warning()` reserved for degraded-but-valid outcomes.

**If fail:** Audit existing `warning()` calls. Function returns nonsense after warning? Change to `stop()`.

### Step 5: Use Assertions for Internal Invariants

For conds that "should never happen" in right code, use assertions. These catch programmer errors during dev:

```r
# R: stopifnot for internal invariants
process_chunk <- function(chunk, total_size) {
  stopifnot(
    is.list(chunk),
    length(chunk) > 0,
    total_size > 0
  )
  # ...
}

# R: explicit assertion with context
merge_results <- function(left, right) {
  if (ncol(left) != ncol(right)) {
    stop("Internal error: column count mismatch (", ncol(left), " vs ", ncol(right),
         "). This is a bug — please report it.", call. = FALSE)
  }
  # ...
}
```

**Got:** Internal invariants asserted so bugs surface fast at violation site, not three function calls later with cryptic error.

**If fail:** `stopifnot()` msgs too cryptic? Switch to clear `if/stop` with context.

### Step 6: Refactor Anti-Patterns

Spot and fix these common anti-patterns:

**Anti-pattern 1: Empty tryCatch (swallow errors)**

```r
# BEFORE: Error silently disappears
result <- tryCatch(
  parse_data(input),
  error = function(e) NULL
)

# AFTER: Log, re-throw, or return a typed error
result <- tryCatch(
  parse_data(input),
  error = function(e) {
    cli::cli_abort("Failed to parse input: {e$message}", parent = e)
  }
)
```

**Anti-pattern 2: Default values mask bad input**

```r
# BEFORE: Caller never knows their input was ignored
process <- function(x = 10) {
  if (!is.numeric(x)) x <- 10  # silently replaces bad input
  x * 2
}

# AFTER: Tell the caller about the problem
process <- function(x = 10) {
  if (!is.numeric(x)) {
    stop("'x' must be numeric, got ", class(x)[[1]], call. = FALSE)
  }
  x * 2
}
```

**Anti-pattern 3: suppressWarnings as fix**

```r
# BEFORE: Hiding the symptom instead of fixing the cause
result <- suppressWarnings(as.numeric(user_input))

# AFTER: Validate explicitly, handle the expected case
if (!grepl("^-?\\d+\\.?\\d*$", user_input)) {
  stop("Expected a number, got: '", user_input, "'", call. = FALSE)
}
result <- as.numeric(user_input)
```

**Anti-pattern 4: Catch-all exception handlers**

```r
# BEFORE: Every error treated the same
tryCatch(
  complex_operation(),
  error = function(e) message("Something went wrong")
)

# AFTER: Handle specific conditions, let unexpected ones propagate
tryCatch(
  complex_operation(),
  custom_validation_error = function(e) {
    cli::cli_warn("Validation issue: {e$message}")
    fallback_value
  }
  # Unexpected errors propagate naturally
)
```

**Got:** Anti-patterns swapped with clear check or specific error handle.

**If fail:** Remove `tryCatch` causes cascading fails? Upstream code has check gap. Fix source, not symptom.

### Step 7: Validate the Fail-Early Refactoring

Run test suite to confirm error paths work right:

```r
# Verify error messages are triggered
testthat::expect_error(calculate_summary("not_a_df"), "must be a data frame")
testthat::expect_error(calculate_summary(data.frame()), "at least one row")
testthat::expect_error(calculate_summary(mtcars, trim_pct = 2), "between 0 and 0.5")

# Verify valid inputs still work
testthat::expect_no_error(calculate_summary(mtcars, method = "mean"))
```

```bash
# Run full test suite
Rscript -e "devtools::test()"
```

**Got:** All tests pass. Error-path tests confirm bad input fires expected error msg.

**If fail:** Existing tests leaned on silent fails (e.g., returning NULL on bad input)? Update them to expect new error.

## Validation

- [ ] Every public function checks its inputs before doing work
- [ ] Error msgs answer: what failed, where, why, how to fix
- [ ] `stop()` used for conds that make wrong results
- [ ] `warning()` used only for degraded-but-valid outcomes
- [ ] No empty `tryCatch` blocks that swallow errors silent
- [ ] No `suppressWarnings()` used as swap for proper check
- [ ] No default values that silent mask bad input
- [ ] Internal invariants use `stopifnot()` or clear assertions
- [ ] Error-path tests exist for each check guard
- [ ] Test suite passes after refactor

## Pitfalls

- **Check too deep**: Check at trust edges (public API), not in every internal helper. Over-check adds noise and hurts speed.
- **Error msgs with no context**: `"Invalid input"` forces caller to guess. Always add param name, expected type/range, and actual value got.
- **Use warning() when you mean stop()**: Function returns garbage after warning? Caller gets wrong answer silent. Use `stop()` and let caller pick how to handle.
- **Swallow errors in tryCatch**: `tryCatch(..., error = function(e) NULL)` hides bugs. If you must catch, log or re-throw with added context.
- **Forget call. = FALSE**: In R, `stop("msg")` adds call by default, which is noisy for end users. Use `call. = FALSE` in user-facing functions. `cli::cli_abort()` does this auto.
- **Check in tests instead of code**: Tests verify behavior but do not guard prod callers. Check lives in function itself.
- **Wrong R binary on hybrid systems**: On WSL or Docker, `Rscript` may resolve to cross-platform wrapper instead of native R. Check with `which Rscript && Rscript --version`. Prefer native R binary (e.g., `/usr/local/bin/Rscript` on Linux/WSL) for reliability. See [Setting Up Your Environment](../../guides/setting-up-your-environment.md) for R path config.

## See Also

- `write-testthat-tests` - write tests that check error paths
- `review-pull-request` - review code for missing check and silent fails
- `review-software-architecture` - check error-handle strategy at system level
- `create-skill` - make new skills following agentskills.io standard
- `security-audit-codebase` - security-focused review that overlaps with input check
