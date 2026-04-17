---
name: fail-early-pattern
description: >
  应用尽早失败（快速失败）模式，在最早可能的时间点检测并报告错误。涵盖使用
  守卫子句进行输入验证、有意义的错误消息、断言函数，以及静默吞噬失败的反模式。
  主要以 R 语言为例，并提供通用/多语言指导。适用于编写接受外部输入的函数、
  在 CRAN 提交前添加输入验证、重构静默产生错误结果的代码、审查 PR 的错误处理
  质量，或强化内部 API 对无效参数的防护。
locale: zh-CN
source_locale: en
source_commit: acc252e6
translator: claude-opus-4-6
translation_date: 2026-03-16
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

# 尽早失败

如果某件事会失败，它应该尽早失败、尽可能响亮地失败、携带尽可能多的上下文。此技能固化了尽早失败模式：在系统边界验证输入，使用守卫子句在错误状态传播之前拒绝它，以及编写能回答*什么*失败了、*在哪里*、*为什么*以及*如何修复*的错误消息。

## 适用场景

- 编写或审查接受外部输入（用户数据、API 响应、文件内容）的函数
- 在 CRAN 提交前为包函数添加输入验证
- 重构静默产生错误结果而非报错的代码
- 审查 pull request 的错误处理质量
- 强化内部 API 对无效参数的防护

## 输入

- **必需**：需要应用该模式的函数或模块
- **必需**：信任边界的识别（外部数据进入的位置）
- **可选**：需要重构的现有错误处理代码
- **可选**：目标语言（默认：R；也适用于 Python、TypeScript、Rust）

## 步骤

### 第 1 步：识别信任边界

映射外部数据进入系统的位置。这些是需要验证的点：

- 公共 API 函数（R 包中的导出函数）
- 面向用户的参数
- 文件 I/O（读取配置、数据文件、用户上传）
- 网络响应（API 调用、数据库查询）
- 环境变量和系统配置

仅由你自己已验证代码调用的内部辅助函数通常不需要冗余验证。

**预期结果：** 列出不可信数据进入代码的入口点。

**失败处理：** 若边界不清晰，从日志或错误报告中向后追踪，找到错误数据首次进入的位置。

### 第 2 步：在入口点添加守卫子句

在每个公共函数顶部、任何工作开始之前验证输入。

**R（base）：**

```r
calculate_summary <- function(data, method = c("mean", "median", "trim"), trim_pct = 0.1) {
  # 守卫：类型检查
  if (!is.data.frame(data)) {
    stop("'data' must be a data frame, not ", class(data)[[1]], call. = FALSE)
  }
  # 守卫：非空
  if (nrow(data) == 0L) {
    stop("'data' must have at least one row", call. = FALSE)
  }
  # 守卫：参数匹配
  method <- match.arg(method)
  # 守卫：范围检查
  if (!is.numeric(trim_pct) || trim_pct < 0 || trim_pct > 0.5) {
    stop("'trim_pct' must be a number between 0 and 0.5, got: ", trim_pct, call. = FALSE)
  }
  # --- 所有守卫通过，开始实际工作 ---
  # ...
}
```

**R（rlang/cli——包的首选）：**

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

**预期结果：** 每个公共函数以守卫子句开头，在任何副作用或计算之前拒绝无效输入。

**失败处理：** 若验证逻辑变得很长（守卫超过 15 行），提取 `validate_*` 辅助函数或使用 `stopifnot()` 进行简单类型断言。

### 第 3 步：编写有意义的错误消息

每条错误消息应回答四个问题：

1. **什么**失败了——哪个参数或操作
2. **在哪里**——函数名或上下文（使用 `cli::cli_abort` 自动提供）
3. **为什么**——期望的是什么，实际收到了什么
4. **如何修复**——当修复方法不明显时

**好的消息：**

```r
# 什么 + 为什么（期望 vs. 实际）
stop("'n' must be a positive integer, got: ", n, call. = FALSE)

# 什么 + 为什么 + 如何修复
cli::cli_abort(c(
  "{.arg config_path} does not exist: {.file {config_path}}",
  "i" = "Create it with {.run create_config({.file {config_path}})}."
))

# 什么 + 上下文
cli::cli_abort(c(
  "Column {.val {col_name}} not found in {.arg data}.",
  "i" = "Available columns: {.val {names(data)}}"
))
```

**差的消息：**

```r
stop("Error")                    # 什么失败了？完全不知道
stop("Invalid input")           # 哪个输入？有什么问题？
stop(paste("Error in step", i)) # 没有可操作的信息
```

**预期结果：** 错误消息是自文档化的——第一次看到错误的开发者无需阅读源代码就能诊断和修复。

**失败处理：** 审查最近三个错误报告。若有任何一个需要阅读源代码才能理解，其错误消息需要改进。

### 第 4 步：优先使用 stop() 而非 warning()

当函数无法产生正确结果时使用 `stop()`（或 `cli::cli_abort()`）。仅当函数仍能产生有意义的结果但调用者应了解某问题时使用 `warning()`。

**经验法则：** 若用户可能静默地得到错误答案，那就是 `stop()`，而非 `warning()`。

```r
# 正确：结果会错时使用 stop
read_config <- function(path) {
  if (!file.exists(path)) {
    stop("Config file not found: ", path, call. = FALSE)
  }
  yaml::read_yaml(path)
}

# 正确：结果仍可用时使用 warn
summarize_data <- function(data) {
  if (any(is.na(data$value))) {
    warning(sum(is.na(data$value)), " NA values dropped from 'value' column", call. = FALSE)
    data <- data[!is.na(data$value), ]
  }
  # 继续处理有效数据
}
```

**预期结果：** `stop()` 用于会产生错误结果的条件；`warning()` 保留用于降级但有效的结果。

**失败处理：** 审计现有 `warning()` 调用。若函数在警告后返回无意义结果，改为 `stop()`。

### 第 5 步：使用断言处理内部不变量

对于"正确代码中不应该发生"的条件，使用断言。这些可以在开发期间捕获程序员错误：

```r
# R：使用 stopifnot 处理内部不变量
process_chunk <- function(chunk, total_size) {
  stopifnot(
    is.list(chunk),
    length(chunk) > 0,
    total_size > 0
  )
  # ...
}

# R：带上下文的显式断言
merge_results <- function(left, right) {
  if (ncol(left) != ncol(right)) {
    stop("Internal error: column count mismatch (", ncol(left), " vs ", ncol(right),
         "). This is a bug — please report it.", call. = FALSE)
  }
  # ...
}
```

**预期结果：** 内部不变量被断言，这样 bug 能在违规位置立即浮现，而非三个函数调用之后出现神秘错误。

**失败处理：** 若 `stopifnot()` 消息太隐晦，改为带上下文的显式 `if/stop`。

### 第 6 步：重构反模式

识别并修复以下常见反模式：

**反模式 1：空的 tryCatch（吞噬错误）**

```r
# 之前：错误静默消失
result <- tryCatch(
  parse_data(input),
  error = function(e) NULL
)

# 之后：记录日志、重新抛出或返回类型化错误
result <- tryCatch(
  parse_data(input),
  error = function(e) {
    cli::cli_abort("Failed to parse input: {e$message}", parent = e)
  }
)
```

**反模式 2：用默认值掩盖错误输入**

```r
# 之前：调用者永远不知道其输入被忽略了
process <- function(x = 10) {
  if (!is.numeric(x)) x <- 10  # 静默替换错误输入
  x * 2
}

# 之后：告知调用者问题所在
process <- function(x = 10) {
  if (!is.numeric(x)) {
    stop("'x' must be numeric, got ", class(x)[[1]], call. = FALSE)
  }
  x * 2
}
```

**反模式 3：将 suppressWarnings 当作修复方法**

```r
# 之前：掩盖症状而不是修复原因
result <- suppressWarnings(as.numeric(user_input))

# 之后：显式验证，处理预期情况
if (!grepl("^-?\\d+\\.?\\d*$", user_input)) {
  stop("Expected a number, got: '", user_input, "'", call. = FALSE)
}
result <- as.numeric(user_input)
```

**反模式 4：通用异常处理器**

```r
# 之前：所有错误都一样处理
tryCatch(
  complex_operation(),
  error = function(e) message("Something went wrong")
)

# 之后：处理特定条件，让意外的传播
tryCatch(
  complex_operation(),
  custom_validation_error = function(e) {
    cli::cli_warn("Validation issue: {e$message}")
    fallback_value
  }
  # 意外错误自然传播
)
```

**预期结果：** 反模式被替换为显式验证或特定错误处理。

**失败处理：** 若删除 `tryCatch` 导致级联失败，上游代码存在验证缺口。修复源头，而非症状。

### 第 7 步：验证尽早失败重构

运行测试套件以确认错误路径正常工作：

```r
# 验证错误消息被触发
testthat::expect_error(calculate_summary("not_a_df"), "must be a data frame")
testthat::expect_error(calculate_summary(data.frame()), "at least one row")
testthat::expect_error(calculate_summary(mtcars, trim_pct = 2), "between 0 and 0.5")

# 验证有效输入仍然正常工作
testthat::expect_no_error(calculate_summary(mtcars, method = "mean"))
```

```bash
# 运行完整测试套件
Rscript -e "devtools::test()"
```

**预期结果：** 所有测试通过。错误路径测试确认错误输入触发了预期的错误消息。

**失败处理：** 若现有测试依赖于静默失败（例如对错误输入返回 NULL），更新它们以期待新的错误。

## 验证清单

- [ ] 每个公共函数在开始工作前验证其输入
- [ ] 错误消息回答：什么失败了、在哪里、为什么、以及如何修复
- [ ] `stop()` 用于会产生错误结果的条件
- [ ] `warning()` 仅用于降级但有效的结果
- [ ] 无空的 `tryCatch` 块静默吞噬错误
- [ ] 无将 `suppressWarnings()` 用作适当验证替代品的情况
- [ ] 无静默掩盖无效输入的默认值
- [ ] 内部不变量使用 `stopifnot()` 或显式断言
- [ ] 每个验证守卫都有对应的错误路径测试
- [ ] 重构后测试套件通过

## 常见问题

- **验证太深**：在信任边界（公共 API）验证，而不是在每个内部辅助函数中。过度验证增加噪音，影响性能。
- **缺少上下文的错误消息**：`"Invalid input"` 迫使调用者猜测。始终包含参数名称、期望的类型/范围和实际收到的值。
- **用 warning() 代替 stop()**：若函数在警告后返回无意义结果，调用者会静默得到错误答案。使用 `stop()` 让调用者决定如何处理。
- **在 tryCatch 中吞噬错误**：`tryCatch(..., error = function(e) NULL)` 隐藏 bug。若必须捕获，记录日志或重新抛出并添加上下文。
- **忘记 call. = FALSE**：在 R 中，`stop("msg")` 默认包含调用信息，对最终用户来说很嘈杂。在面向用户的函数中使用 `call. = FALSE`。`cli::cli_abort()` 自动处理这一点。
- **在测试中而非代码中验证**：测试验证行为，但不保护生产调用者。验证属于函数本身。

- **混合系统上错误的 R 二进制文件**：在 WSL 或 Docker 上，`Rscript` 可能解析为跨平台包装器而非原生 R。使用 `which Rscript && Rscript --version` 检查。优先使用原生 R 二进制文件（例如 Linux/WSL 上的 `/usr/local/bin/Rscript`）以确保可靠性。有关 R 路径配置，请参阅 [Setting Up Your Environment](../../guides/setting-up-your-environment.md)。

## 相关技能

- `write-testthat-tests` - 编写验证错误路径的测试
- `review-pull-request` - 审查代码中缺失验证和静默失败的问题
- `review-software-architecture` - 在系统级评估错误处理策略
- `create-skill` - 按照 agentskills.io 标准创建新技能
- `security-audit-codebase` - 与输入验证重叠的安全审查
