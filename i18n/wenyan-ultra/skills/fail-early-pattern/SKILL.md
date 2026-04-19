---
name: fail-early-pattern
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
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

If something is going to fail, it should fail as early as possible, as loudly as possible, with as much context as possible. This skill codifies the fail-early pattern: validating inputs at system boundaries, using guard clauses to reject bad state before it propagates, and writing error messages that answer *what* failed, *where*, *why*, and *how to fix it*.

## When to Use

- Writing or reviewing functions that accept external input (user data, API responses, file contents)
- Adding input validation to package functions before CRAN submission
- Refactoring code that silently produces wrong results instead of erroring
- Reviewing pull requests for error-handling quality
- Hardening internal APIs against invalid arguments

## Inputs

- **Required**: Function or module to apply the pattern to
- **Required**: Identification of trust boundaries (where external data enters)
- **Optional**: Existing error-handling code to refactor
- **Optional**: Target language (default: R; also applies to Python, TypeScript, Rust)

## Procedure

### Step 1: Identify Trust Boundaries

Map where external data enters the system. These are the points that need validation:

- Public API functions (exported functions in an R package)
- User-facing parameters
- File I/O (reading configs, data files, user uploads)
- Network responses (API calls, database queries)
- Environment variables and system configuration

Internal helper functions called only by your own validated code generally do not need redundant validation.

**Expected:** A list of entry points where untrusted data crosses into your code.

**On failure:** If boundaries are unclear, trace backwards from errors in logs or bug reports to find where bad data first entered.

### Step 2: Add Guard Clauses at Entry Points

Validate inputs at the top of each public function, before any work begins.

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

**Expected:** Every public function opens with guard clauses that reject invalid input before any side effects or computation.

**On failure:** If validation logic is getting long (>15 lines of guards), extract a `validate_*` helper or use `stopifnot()` for simple type assertions.

### Step 3: Write Meaningful Error Messages

Every error message should answer four questions:

1. **What** failed — which parameter or operation
2. **Where** — function name or context (automatic with `cli::cli_abort`)
3. **Why** — what was expected vs. what was received
4. **How to fix** — when the fix is non-obvious

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

**Expected:** Error messages are self-documenting — a developer seeing the error for the first time can diagnose and fix it without reading source code.

**On failure:** Review the three most recent bug reports. If any required reading source code to understand, their error messages need improvement.

### Step 4: Prefer stop() Over warning()

Use `stop()` (or `cli::cli_abort()`) when the function cannot produce a correct result. Use `warning()` only when the function can still produce a meaningful result but the caller should know about a concern.

**Rule of thumb:** If a user could silently get a wrong answer, that is a `stop()`, not a `warning()`.

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

**Expected:** `stop()` is used for conditions that would produce incorrect results; `warning()` is reserved for degraded-but-valid outcomes.

**On failure:** Audit existing `warning()` calls. If the function returns nonsense after the warning, change it to `stop()`.

### Step 5: Use Assertions for Internal Invariants

For conditions that "should never happen" in correct code, use assertions. These catch programmer errors during development:

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

**Expected:** Internal invariants are asserted so bugs surface immediately at the violation site, not three function calls later with a cryptic error.

**On failure:** If `stopifnot()` messages are too cryptic, switch to explicit `if/stop` with context.

### Step 6: Refactor Anti-Patterns

Identify and fix these common anti-patterns:

**Anti-pattern 1: Empty tryCatch (swallowing errors)**

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

**Anti-pattern 2: Default values masking bad input**

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

**Anti-pattern 3: suppressWarnings as a fix**

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

**Expected:** Anti-patterns are replaced with explicit validation or specific error handling.

**On failure:** If removing a `tryCatch` causes cascading failures, the upstream code has a validation gap. Fix the source, not the symptom.

### Step 7: Validate the Fail-Early Refactoring

Run the test suite to confirm error paths work correctly:

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

**Expected:** All tests pass. Error-path tests confirm that bad input triggers the expected error message.

**On failure:** If existing tests relied on silent failures (e.g., returning NULL on bad input), update them to expect the new error.

## Validation

- [ ] Every public function validates its inputs before doing work
- [ ] Error messages answer: what failed, where, why, and how to fix
- [ ] `stop()` is used for conditions that produce incorrect results
- [ ] `warning()` is used only for degraded-but-valid outcomes
- [ ] No empty `tryCatch` blocks that swallow errors silently
- [ ] No `suppressWarnings()` used as a substitute for proper validation
- [ ] No default values that silently mask invalid input
- [ ] Internal invariants use `stopifnot()` or explicit assertions
- [ ] Error-path tests exist for each validation guard
- [ ] Test suite passes after refactoring

## Common Pitfalls

- **Validating too deep**: Validate at trust boundaries (public API), not in every internal helper. Over-validation adds noise and hurts performance.
- **Error messages without context**: `"Invalid input"` forces the caller to guess. Always include the parameter name, the expected type/range, and the actual value received.
- **Using warning() when you mean stop()**: If the function returns garbage after the warning, the caller gets a wrong answer silently. Use `stop()` and let the caller decide how to handle it.
- **Swallowing errors in tryCatch**: `tryCatch(..., error = function(e) NULL)` hides bugs. If you must catch, log or re-throw with added context.
- **Forgetting call. = FALSE**: In R, `stop("msg")` includes the call by default, which is noisy for end users. Use `call. = FALSE` in user-facing functions. `cli::cli_abort()` does this automatically.
- **Validating in tests instead of code**: Tests verify behavior but do not protect production callers. Validation belongs in the function itself.
- **Wrong R binary on hybrid systems**: On WSL or Docker, `Rscript` may resolve to a cross-platform wrapper instead of native R. Check with `which Rscript && Rscript --version`. Prefer the native R binary (e.g., `/usr/local/bin/Rscript` on Linux/WSL) for reliability. See [Setting Up Your Environment](../../guides/setting-up-your-environment.md) for R path configuration.

## Related Skills

- `write-testthat-tests` - write tests that verify error paths
- `review-pull-request` - review code for missing validation and silent failures
- `review-software-architecture` - assess error-handling strategy at the system level
- `create-skill` - create new skills following the agentskills.io standard
- `security-audit-codebase` - security-focused review that overlaps with input validation
