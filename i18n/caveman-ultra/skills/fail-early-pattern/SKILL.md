---
name: fail-early-pattern
locale: caveman-ultra
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

If fails → fail early, loud, w/ context. Codifies: validate inputs at boundaries, guard clauses reject bad state before propagates, err msgs answer *what* failed, *where*, *why*, *how to fix*.

## Use When

- Writing/reviewing fns accepting external input (user data, API, file)
- Input validation before CRAN submission
- Refactor silent wrong results → errors
- Review PRs for err-handling quality
- Harden internal APIs vs invalid args

## In

- **Required**: Fn/module to apply pattern
- **Required**: Trust boundaries (where external data enters)
- **Optional**: Existing err-handling to refactor
- **Optional**: Target language (default R; also Python, TypeScript, Rust)

## Do

### Step 1: Trust Boundaries

Map external data entry. Points needing validation:

- Public API fns (exported package)
- User-facing params
- File I/O (configs, data, uploads)
- Net responses (APIs, DBs)
- Env vars + system config

Internal helpers called only by validated code generally no redundant validation.

→ List entry points where untrusted data crosses.

If err: unclear → trace backwards from err logs/bug reports → find where bad data entered.

### Step 2: Guard Clauses at Entry

Validate at top of each public fn before work.

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

→ Every public fn opens w/ guards rejecting invalid before side effects/computation.

If err: validation long (>15 lines of guards) → extract `validate_*` helper or `stopifnot()` for simple type assertions.

### Step 3: Meaningful Err Msgs

Every msg answers 4:

1. **What** failed — param/op
2. **Where** — fn name/context (auto w/ `cli::cli_abort`)
3. **Why** — expected vs received
4. **How to fix** — when fix non-obvious

**Good:**

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

**Bad:**

```r
stop("Error")                    # What failed? No idea
stop("Invalid input")           # Which input? What's wrong with it?
stop(paste("Error in step", i)) # No actionable information
```

→ Msgs self-documenting — dev seeing first time diagnose + fix w/o reading source.

If err: review 3 most recent bug reports. Required reading source to understand → msgs need improvement.

### Step 4: Prefer stop() vs warning()

`stop()` (or `cli::cli_abort()`) when can't produce correct result. `warning()` only when still meaningful but caller should know.

**Rule**: User could silently get wrong answer → `stop()` not `warning()`.

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

→ `stop()` for incorrect results; `warning()` for degraded-but-valid.

If err: audit existing `warning()` calls. Returns nonsense after → change to `stop()`.

### Step 5: Assertions for Internal Invariants

"Should never happen" → assertions. Catches programmer errs during dev:

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

→ Invariants asserted → bugs surface immediately at violation site, not 3 calls later cryptic.

If err: `stopifnot()` msgs too cryptic → switch explicit `if/stop` w/ context.

### Step 6: Refactor Anti-Patterns

Common anti-patterns:

**Anti-pattern 1: Empty tryCatch (swallowing)**

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

**Anti-pattern 2: Defaults masking bad input**

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

**Anti-pattern 4: Catch-all handlers**

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

→ Anti-patterns replaced w/ explicit validation or specific err handling.

If err: remove `tryCatch` causes cascading → upstream has validation gap. Fix source not symptom.

### Step 7: Validate Refactoring

Run tests to confirm err paths work:

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

→ All tests pass. Err-path tests confirm bad input triggers expected msg.

If err: existing tests relied on silent failures (returning NULL on bad input) → update to expect new err.

## Check

- [ ] Every public fn validates inputs before work
- [ ] Err msgs: what, where, why, how to fix
- [ ] `stop()` for incorrect results
- [ ] `warning()` only degraded-but-valid
- [ ] No empty `tryCatch` swallowing
- [ ] No `suppressWarnings()` as validation substitute
- [ ] No defaults silently masking invalid
- [ ] Invariants use `stopifnot()` or explicit assertions
- [ ] Err-path tests per guard
- [ ] Test suite passes post-refactor

## Traps

- **Validate too deep**: Validate at boundaries (public API), not every internal helper. Over-validation adds noise + hurts perf.
- **Msgs no context**: `"Invalid input"` forces caller guess. Always param name, expected type/range, actual value.
- **warning() when mean stop()**: Returns garbage after warn → wrong silently. Use `stop()`, let caller decide.
- **Swallow in tryCatch**: `tryCatch(..., error = function(e) NULL)` hides bugs. Must catch → log or re-throw w/ context.
- **Forget call. = FALSE**: R `stop("msg")` includes call by default — noisy end users. Use `call. = FALSE` user-facing. `cli::cli_abort()` does auto.
- **Validate in tests not code**: Tests verify behavior not protect production. Validation in fn itself.
- **Wrong R binary hybrid systems**: WSL/Docker, `Rscript` may resolve cross-platform wrapper not native R. Check `which Rscript && Rscript --version`. Prefer native (`/usr/local/bin/Rscript` Linux/WSL). See [Setting Up Your Environment](../../guides/setting-up-your-environment.md).

## →

- `write-testthat-tests` — tests verifying err paths
- `review-pull-request` — review for missing validation + silent failures
- `review-software-architecture` — err-handling strategy system level
- `create-skill` — new skills following agentskills.io
- `security-audit-codebase` — security-focused review overlapping validation
