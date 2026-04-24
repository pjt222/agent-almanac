---
name: fail-early-pattern
locale: wenyan-ultra
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

# 早敗

物將敗則宜早敗、高敗、富境敗。此技定早敗模：於系界驗入、以守護條早拒壞態、書答**何**敗、**何**處、**何以**、**何修**之誤信。

## 用

- 書或閱納外入之函（用數、API 答、文容）
- CRAN 提前加包函入驗
- 重構默產誤果之碼
- 閱 PR 察誤處質
- 強內 API 抗誤參

## 入

- **必**：施此模之函或模
- **必**：信界之識（外數入處）
- **可**：欲重構之舊誤處碼
- **可**：標語（默：R；亦適 Python、TypeScript、Rust）

## 行

### 一：識信界

映外數入系之處。此為須驗之點：

- 公 API 函（R 包之出函）
- 用者面參
- 文 I/O（讀組、數文、用傳）
- 網答（API 呼、庫詢）
- 環境變與系組

僅自己已驗碼所呼之內助函常無須重驗。

得：不信數入碼之入點列。

敗：界不明→自日或蟲報之誤反追至壞數首入處。

### 二：於入點加守護

各公函首驗入，工前。

**R（base）：**

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

**R（rlang/cli — 包宜）：**

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

**通（TypeScript）：**

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

得：每公函以守護始，於副作用或算前拒誤入。

敗：驗邏過長（>15 行）→抽 `validate_*` 助函或以 `stopifnot()` 為簡類斷。

### 三：書有義誤信

每誤信宜答四問：

1. **何**敗——何參或作
2. **何處**——函名或境（`cli::cli_abort` 自動）
3. **何以**——所期對所得
4. **何修**——非顯時

**佳信：**

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

**劣信：**

```r
stop("Error")                    # What failed? No idea
stop("Invalid input")           # Which input? What's wrong with it?
stop(paste("Error in step", i)) # No actionable information
```

得：誤信自述——初見者可不讀源而診修。

敗：閱末三蟲報。若任須讀源解→其誤信宜改。

### 四：偏 stop() 於 warning()

函不能產正果→用 `stop()`（或 `cli::cli_abort()`）。函仍能產有意果而呼者宜知憂→用 `warning()`。

**規**：若用者或默得誤答→`stop()`，非 `warning()`。

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

得：`stop()` 用於產誤果之條件；`warning()` 留於退化而有效之果。

敗：察舊 `warning()` 呼。若函於警後返荒→改為 `stop()`。

### 五：內不變用斷

對「正碼中不應發生」之條件用斷。此於發期捕程者誤：

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

得：內不變已斷，蟲立於違處現，非三呼後以隱信現。

敗：`stopifnot()` 信過隱→改為顯 `if/stop` 含境。

### 六：重構反模

識並修此常反模：

**反模一：空 tryCatch（吞誤）**

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

**反模二：默值掩壞入**

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

**反模三：以 suppressWarnings 為修**

```r
# BEFORE: Hiding the symptom instead of fixing the cause
result <- suppressWarnings(as.numeric(user_input))

# AFTER: Validate explicitly, handle the expected case
if (!grepl("^-?\\d+\\.?\\d*$", user_input)) {
  stop("Expected a number, got: '", user_input, "'", call. = FALSE)
}
result <- as.numeric(user_input)
```

**反模四：catch-all 異處**

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

得：反模以顯驗或特誤處代。

敗：去 `tryCatch` 致連崩→上碼有驗隙。修源，非症。

### 七：驗早敗重構

行試套以確誤路：

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

得：諸試過。誤路試確壞入觸期誤信。

敗：舊試依默敗（如壞入返 NULL）→更之期新誤。

## 驗

- [ ] 每公函行前驗其入
- [ ] 誤信答：何敗、何處、何以、何修
- [ ] `stop()` 用於產誤果條件
- [ ] `warning()` 僅用於退化而有效之果
- [ ] 無空 `tryCatch` 默吞誤
- [ ] 無以 `suppressWarnings()` 代正驗
- [ ] 無默值默掩誤入
- [ ] 內不變用 `stopifnot()` 或顯斷
- [ ] 各驗守有誤路試
- [ ] 重構後試套過

## 忌

- **驗過深**：於信界（公 API）驗，非每內助。過驗加噪損性
- **無境誤信**：`"Invalid input"` 迫呼者猜。必含參名、期類/域、所得值
- **本 stop 而用 warning**：若函於警後返荒→呼者默得誤。用 `stop()` 令呼者定處
- **tryCatch 吞誤**：`tryCatch(..., error = function(e) NULL)` 隱蟲。若必捕→記或加境再擲
- **忘 call. = FALSE**：R 中 `stop("msg")` 默含呼，於末用者嘈。用者面函用 `call. = FALSE`。`cli::cli_abort()` 自行此
- **於試而非碼中驗**：試驗行而不護產呼者。驗屬函本身
- **混雜系上誤 R 二**：WSL 或 Docker 中 `Rscript` 或解為跨平包而非原 R。以 `which Rscript && Rscript --version` 察。為可靠宜用原 R 二（如 Linux/WSL 上 `/usr/local/bin/Rscript`）。R 徑設見 [Setting Up Your Environment](../../guides/setting-up-your-environment.md)

## 參

- `write-testthat-tests` - 書驗誤路之試
- `review-pull-request` - 閱碼察缺驗與默敗
- `review-software-architecture` - 系級誤處策估
- `create-skill` - 循 agentskills.io 標造新技
- `security-audit-codebase` - 與入驗重之安焦閱
