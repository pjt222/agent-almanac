---
name: fail-early-pattern
locale: wenyan-lite
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

若物將敗，宜盡早、盡響、盡帶語境而敗。此技定早敗之模式：於系統邊界驗輸入、以 guard 子句於壞態擴前拒之、書答*何*敗、*於何處*、*何以*、*何以修*之錯誤訊息。

## 適用時機

- 書或審受外部輸入之函數（使用者數據、API 回應、檔內容）
- CRAN 提交前為包函數加輸入驗
- 重構默生誤結而非報錯之代碼
- 審 pull request 之錯處品質
- 加固內部 API 以禦誤參

## 輸入

- **必要**：欲施此模式之函數或模組
- **必要**：信任邊界之識（外部數據入處）
- **選擇性**：待重構之既有錯處代碼
- **選擇性**：目標語言（預設：R；亦適於 Python、TypeScript、Rust）

## 步驟

### 步驟一：識信任邊界

映外部數據入系統之處。此為需驗之點：

- 公 API 函數（R 包中所匯出之函數）
- 面對使用者之參數
- 檔 I/O（讀配置、數據檔、使用者上傳）
- 網絡回應（API 呼、DB 查詢）
- 環境變量與系統配置

僅由爾自身已驗代碼呼之內部輔助函數通常無需冗餘之驗。

**預期：** 不信任數據跨入爾代碼之入口清單。

**失敗時：** 若邊界不明，自日誌或錯報中之錯倒追至壞數據首入處。

### 步驟二：於入口加 guard 子句

於各公函數之頂驗輸入，先於任何工。

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

**R（rlang/cli — 於包所偏好）：**

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

**通用（TypeScript）：**

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

**預期：** 每公函數以 guard 子句啟，於任何副作用或算前拒誤輸入。

**失敗時：** 若驗邏輯漸長（>15 行 guard），抽 `validate_*` 輔或用 `stopifnot()` 為簡類斷言。

### 步驟三：書有意之錯誤訊息

每錯訊息宜答四問：

1. **何**敗——何參數或操作
2. **於何處**——函數名或語境（用 `cli::cli_abort` 自動）
3. **何以**——期何與受何
4. **何以修**——於修不顯時

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

**預期：** 錯訊自文檔——初見錯之開發者不讀源碼即可診並修。

**失敗時：** 審近三 bug 報告。若有需讀源碼方解者，其錯訊需改。

### 步驟四：偏 stop() 而避 warning()

於函數不能生正確結果時用 `stop()`（或 `cli::cli_abort()`）。唯於函數仍可生有意之結果而呼者宜知之慮時用 `warning()`。

**約則：** 若使用者可默得誤答，則此為 `stop()`，非 `warning()`。

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

**預期：** `stop()` 用於將生誤結之條件；`warning()` 保於降級而仍有效之結果。

**失敗時：** 審既有之 `warning()` 呼。若函數於警後返無義之物，改為 `stop()`。

### 步驟五：以斷言持內部不變

於「正確代碼中不當生」之條件，用斷言。此於開發中捕程式員之錯：

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

**預期：** 內部不變已斷，故 bug 於違處立顯，非三呼後帶隱晦錯。

**失敗時：** 若 `stopifnot()` 之訊過隱，改用附語境之顯 `if/stop`。

### 步驟六：重構反模式

識並修此常反模式：

**反模式一：空 tryCatch（吞錯）**

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

**反模式二：預設值遮誤輸入**

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

**反模式三：以 suppressWarnings 為修**

```r
# BEFORE: Hiding the symptom instead of fixing the cause
result <- suppressWarnings(as.numeric(user_input))

# AFTER: Validate explicitly, handle the expected case
if (!grepl("^-?\\d+\\.?\\d*$", user_input)) {
  stop("Expected a number, got: '", user_input, "'", call. = FALSE)
}
result <- as.numeric(user_input)
```

**反模式四：通捕異常處理**

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

**預期：** 反模式已換為顯驗或具體錯處。

**失敗時：** 若移 `tryCatch` 致連鎖敗，則上游代碼有驗之罅。修源，非症。

### 步驟七：驗早敗之重構

執測試以確錯路正行：

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

**預期：** 所有測試過。錯路測試確誤輸入觸發所期之錯訊。

**失敗時：** 若既有測試倚默敗（如於誤輸入返 NULL），更之以期新之錯。

## 驗證

- [ ] 每公函數於工前驗其輸入
- [ ] 錯訊答：何敗、於何處、何以、何以修
- [ ] `stop()` 用於生誤結之條件
- [ ] `warning()` 唯用於降級而仍有效之結果
- [ ] 無默吞錯之空 `tryCatch` 塊
- [ ] 無以 `suppressWarnings()` 代正驗
- [ ] 無默遮誤輸入之預設值
- [ ] 內部不變用 `stopifnot()` 或顯斷言
- [ ] 每驗 guard 有錯路測試
- [ ] 重構後測試套件過

## 常見陷阱

- **驗過深**：於信任邊界（公 API）驗，非於每內部輔助。過驗加噪害效能。
- **無語境之錯訊**：`"Invalid input"` 迫呼者猜。恒含參名、期類/範圍、實所受之值。
- **本意 stop() 而用 warning()**：若函數於警後返垃圾，則呼者默得誤答。用 `stop()` 令呼者決如何處。
- **於 tryCatch 吞錯**：`tryCatch(..., error = function(e) NULL)` 藏 bug。若必捕，記或以加語境再拋。
- **忘 call. = FALSE**：於 R，`stop("msg")` 預設含呼，於終端使用者為噪。於面對使用者之函數用 `call. = FALSE`。`cli::cli_abort()` 自動為之。
- **於測試而非代碼中驗**：測試驗行為而不護生產呼者。驗屬函數本身。
- **混合系統之誤 R 二進制**：於 WSL 或 Docker，`Rscript` 或解為跨平台包裝而非原生 R。以 `which Rscript && Rscript --version` 察。偏原生 R 二進制（如 Linux/WSL 之 `/usr/local/bin/Rscript`）以求可靠。見 [設環境](../../guides/setting-up-your-environment.md) 查 R 路徑配置。

## 相關技能

- `write-testthat-tests` - 書驗錯路之測試
- `review-pull-request` - 審代碼缺驗與默敗
- `review-software-architecture` - 於系統層評錯處策略
- `create-skill` - 循 agentskills.io 標準建新技能
- `security-audit-codebase` - 與輸入驗重疊之以安全為焦之審
