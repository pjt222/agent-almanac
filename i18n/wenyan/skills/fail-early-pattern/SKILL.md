---
name: fail-early-pattern
locale: wenyan
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

將敗者宜早敗、明敗、附最多脈。此技定早敗之模：於系界驗入、以守句拒壞態於傳前、書答*何*敗、*何處*、*何以*、*如何修*之誤訊。

## 用時

- 書或審受外入（用數、API 應、文容）之函
- CRAN 提前加包函之入驗
- 重構默生誤果之碼
- 審 PR 之誤處之質
- 強內 API 之抗壞參

## 入

- **必要**：欲施此模之函或模
- **必要**：信界之識（外數何入）
- **可選**：欲重構之既誤處碼
- **可選**：目語（默 R；亦適 Python、TypeScript、Rust）

## 法

### 第一步：識信界

映外數入系之處。此乃需驗之點：

- 公 API 函（R 包中出函）
- 用面參
- 文 I/O（讀配、數文、用上傳）
- 網應（API 呼、庫詢）
- 環變與系配

唯汝已驗碼呼之內輔函通常無需重驗。

**得：** 不信數入汝碼之入點之列。

**敗則：** 若界不明，自日或缺報之誤反溯以尋壞數首入處。

### 第二步：於入點加守句

於各公函頂驗入，於工始前。

**R（基）：**

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

**R（rlang/cli——包宜用）：**

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

**得：** 諸公函首守句，拒壞入於任何副效或算前。

**敗則：** 若驗邏長（守逾十五行），析 `validate_*` 輔或用 `stopifnot()` 為簡型斷。

### 第三步：書義誤訊

每誤訊當答四問：

1. **何**敗——何參或操
2. **何處**——函名或脈（`cli::cli_abort` 自動）
3. **何以**——預何對受何
4. **如何修**——若修非顯

**善訊：**

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

**惡訊：**

```r
stop("Error")                    # What failed? No idea
stop("Invalid input")           # Which input? What's wrong with it?
stop(paste("Error in step", i)) # No actionable information
```

**得：** 誤訊自證——初見誤者可診而修，不讀源。

**敗則：** 察近三缺報。若任一需讀源方解，其誤訊須改。

### 第四步：偏 stop() 於 warning()

用 `stop()`（或 `cli::cli_abort()`）於函不能生正果時。用 `warning()` 唯函仍能生有義果而呼者當知之憂。

**要則：** 若用或默得誤答，乃 `stop()`，非 `warning()`。

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

**得：** `stop()` 用於將生誤果之況；`warning()` 留於降質但有效之果。

**敗則：** 察既 `warning()` 呼。若警後函返無義，改為 `stop()`。

### 第五步：以斷之內不變

於正碼中「不當生」之況用斷。於開發時捕程誤：

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

**得：** 內不變以斷，缺於違處立現，非三呼後以謎誤。

**敗則：** 若 `stopifnot()` 訊過謎，改以明 `if/stop` 附脈。

### 第六步：重構反模

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

**反模二：默值遮壞入**

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

**反模三：suppressWarnings 為修**

```r
# BEFORE: Hiding the symptom instead of fixing the cause
result <- suppressWarnings(as.numeric(user_input))

# AFTER: Validate explicitly, handle the expected case
if (!grepl("^-?\\d+\\.?\\d*$", user_input)) {
  stop("Expected a number, got: '", user_input, "'", call. = FALSE)
}
result <- as.numeric(user_input)
```

**反模四：統括之異處**

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

**得：** 反模以明驗或具體誤處代之。

**敗則：** 若去 `tryCatch` 致連敗，上游碼有驗缺。修源，非症。

### 第七步：驗早敗重構

運試集以確誤徑正工：

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

**得：** 諸試過。誤徑試確壞入觸預誤訊。

**敗則：** 若既試賴默敗（如壞入返 NULL），更之以預新誤。

## 驗

- [ ] 諸公函於工前驗入
- [ ] 誤訊答：何敗、何處、何以、如何修
- [ ] `stop()` 用於生誤果之況
- [ ] `warning()` 唯用於降質有效之果
- [ ] 無默吞誤之空 `tryCatch`
- [ ] 無 `suppressWarnings()` 代正驗
- [ ] 無默遮壞入之默值
- [ ] 內不變用 `stopifnot()` 或明斷
- [ ] 各驗守有誤徑試
- [ ] 重構後試集過

## 陷

- **驗過深**：於信界（公 API）驗，非諸內輔。過驗加噪損性能
- **無脈之誤訊**：「Invalid input」迫呼者猜。恆含參名、預類/域、實收值
- **當用 stop() 時用 warning()**：若警後函返垃圾，呼者默得誤答。用 `stop()`，令呼者決如何處
- **tryCatch 吞誤**：`tryCatch(..., error = function(e) NULL)` 藏缺。若必捕，記或附脈重擲
- **忘 call. = FALSE**：R 中 `stop("msg")` 默含呼，於用顯噪。用面函用 `call. = FALSE`。`cli::cli_abort()` 自動
- **於試驗而非碼**：試驗行而不護產呼者。驗屬函本
- **雜系誤 R 本**：於 WSL 或 Docker，`Rscript` 或解至跨平台包而非原 R。以 `which Rscript && Rscript --version` 察。偏原 R（如 Linux/WSL 之 `/usr/local/bin/Rscript`）以穩。見 [Setting Up Your Environment](../../guides/setting-up-your-environment.md) 之 R 路配

## 參

- `write-testthat-tests` - 書驗誤徑之試
- `review-pull-request` - 審碼缺驗與默敗
- `review-software-architecture` - 於系級評誤處策
- `create-skill` - 循 agentskills.io 標造新技
- `security-audit-codebase` - 與入驗疊之安全審
