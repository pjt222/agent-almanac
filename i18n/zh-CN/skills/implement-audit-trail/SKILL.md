---
name: implement-audit-trail
description: >
  为受监管环境中的 R 项目实施审计追踪功能。涵盖日志记录、来源追踪、
  电子签名、数据完整性检查和 21 CFR Part 11 合规性。适用于 R 分析
  需要电子记录合规（21 CFR Part 11）、需要追踪分析中的操作人员和时间、
  实施数据来源追踪，或为法规申报创建防篡改分析日志时使用。
locale: zh-CN
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: compliance
  complexity: advanced
  language: R
  tags: audit-trail, logging, provenance, 21-cfr-part-11, data-integrity
---

# 实施审计追踪

为 R 项目添加审计追踪功能以满足法规合规要求。

## 适用场景

- R 分析需要电子记录合规（21 CFR Part 11）
- 需要追踪分析中的操作人员、操作内容、时间及原因
- 实施数据来源追踪
- 创建防篡改分析日志

## 输入

- **必填**：包含数据处理或分析脚本的 R 项目
- **必填**：法规要求（哪些审计追踪要素是强制性的）
- **可选**：现有日志基础设施
- **可选**：电子签名要求

## 步骤

### 第 1 步：设置结构化日志记录

创建 `R/audit_log.R`：

```r
#' 为会话初始化审计日志
#'
#' @param log_dir 审计日志文件目录
#' @param analyst 分析人员姓名
#' @return 已创建日志文件的路径
init_audit_log <- function(log_dir = "audit_logs", analyst = Sys.info()["user"]) {
  dir.create(log_dir, showWarnings = FALSE, recursive = TRUE)

  log_file <- file.path(log_dir, sprintf(
    "audit_%s_%s.jsonl",
    format(Sys.time(), "%Y%m%d_%H%M%S"),
    analyst
  ))

  entry <- list(
    timestamp = format(Sys.time(), "%Y-%m-%dT%H:%M:%S%z"),
    event = "SESSION_START",
    analyst = analyst,
    r_version = R.version.string,
    platform = .Platform$OS.type,
    working_directory = getwd(),
    session_id = paste0(Sys.getpid(), "-", format(Sys.time(), "%Y%m%d%H%M%S"))
  )

  write(jsonlite::toJSON(entry, auto_unbox = TRUE), log_file, append = TRUE)
  options(audit_log_file = log_file, audit_session_id = entry$session_id)

  log_file
}

#' 记录审计事件
#'
#' @param event 事件类型（DATA_IMPORT、TRANSFORM、ANALYSIS、EXPORT 等）
#' @param description 人可读的描述
#' @param details 附加详情的命名列表
log_audit_event <- function(event, description, details = list()) {
  log_file <- getOption("audit_log_file")
  if (is.null(log_file)) stop("审计日志未初始化，请先调用 init_audit_log()。")

  entry <- list(
    timestamp = format(Sys.time(), "%Y-%m-%dT%H:%M:%S%z"),
    event = event,
    description = description,
    session_id = getOption("audit_session_id"),
    details = details
  )

  write(jsonlite::toJSON(entry, auto_unbox = TRUE), log_file, append = TRUE)
}
```

**预期结果：** 已创建 `R/audit_log.R`，包含 `init_audit_log()` 和 `log_audit_event()` 函数。调用 `init_audit_log()` 会创建 `audit_logs/` 目录和带时间戳的 JSONL 文件。每条日志条目是包含 `timestamp`、`event`、`analyst` 和 `session_id` 字段的单行 JSON。

**失败处理：** 若 `jsonlite::toJSON()` 失败，确保已安装 `jsonlite` 软件包。若无法创建日志目录，检查文件系统权限。若时间戳缺少时区，验证平台是否支持 `%z`。

### 第 2 步：添加数据完整性检查

```r
#' 计算并记录数据哈希值以进行完整性验证
#'
#' @param data 待哈希的数据框
#' @param label 数据集的描述性标签
#' @return SHA-256 哈希字符串
hash_data <- function(data, label = "dataset") {
  hash_value <- digest::digest(data, algo = "sha256")

  log_audit_event("DATA_HASH", sprintf("已为 %s 计算哈希值", label), list(
    hash_algorithm = "sha256",
    hash_value = hash_value,
    nrow = nrow(data),
    ncol = ncol(data),
    columns = names(data)
  ))

  hash_value
}

#' 根据已记录哈希值验证数据完整性
#'
#' @param data 待验证的数据框
#' @param expected_hash 之前记录的哈希值
#' @return 表示数据是否匹配的逻辑值
verify_data_integrity <- function(data, expected_hash) {
  current_hash <- digest::digest(data, algo = "sha256")
  match <- identical(current_hash, expected_hash)

  log_audit_event("DATA_VERIFY",
    sprintf("数据完整性检查：%s", ifelse(match, "通过", "失败")),
    list(expected = expected_hash, actual = current_hash))

  if (!match) warning("数据完整性检查失败")
  match
}
```

**预期结果：** `hash_data()` 返回 SHA-256 哈希字符串并记录 `DATA_HASH` 事件。`verify_data_integrity()` 将当前数据与已存储的哈希值进行比较，并记录含通过或失败状态的 `DATA_VERIFY` 事件。

**失败处理：** 若找不到 `digest::digest()`，安装 `digest` 软件包。若相同数据的哈希值不一致，检查哈希和验证之间的列顺序及数据类型是否一致。

### 第 3 步：追踪数据转换

```r
#' 使用审计日志包装数据转换操作
#'
#' @param data 输入数据框
#' @param transform_fn 待应用的函数
#' @param description 转换描述
#' @return 转换后的数据框
audited_transform <- function(data, transform_fn, description) {
  input_hash <- digest::digest(data, algo = "sha256")
  input_dim <- dim(data)

  result <- transform_fn(data)

  output_hash <- digest::digest(result, algo = "sha256")
  output_dim <- dim(result)

  log_audit_event("DATA_TRANSFORM", description, list(
    input_hash = input_hash,
    input_rows = input_dim[1],
    input_cols = input_dim[2],
    output_hash = output_hash,
    output_rows = output_dim[1],
    output_cols = output_dim[2]
  ))

  result
}
```

**预期结果：** `audited_transform()` 包装任意转换函数，将输入维度和哈希值、输出维度和哈希值，以及转换描述记录为 `DATA_TRANSFORM` 事件。

**失败处理：** 若转换函数出错，审计事件将不会被记录。使用 `tryCatch()` 包装转换以记录成功和失败。确保转换函数接受并返回数据框。

### 第 4 步：记录会话环境

```r
#' 记录完整的会话信息以确保可重现性
log_session_info <- function() {
  si <- sessionInfo()

  log_audit_event("SESSION_INFO", "已记录完整会话环境", list(
    r_version = si$R.version$version.string,
    platform = si$platform,
    locale = Sys.getlocale(),
    base_packages = si$basePkgs,
    attached_packages = sapply(si$otherPkgs, function(p) paste(p$Package, p$Version)),
    renv_lockfile_hash = if (file.exists("renv.lock")) {
      digest::digest(file = "renv.lock", algo = "sha256")
    } else NA
  ))
}
```

**预期结果：** 已记录 `SESSION_INFO` 事件，包含 R 版本、平台、语言环境、附加软件包及其版本，以及 renv 锁文件哈希值（如适用）。

**失败处理：** 若 `sessionInfo()` 返回不完整的软件包信息，确保在调用 `log_session_info()` 之前已通过 `library()` 加载所有软件包。若项目未使用 renv，renv 锁文件哈希值将为 `NA`。

### 第 5 步：在分析脚本中实施

```r
# 01_analysis.R
library(jsonlite)
library(digest)

# 启动审计追踪
log_file <- init_audit_log(analyst = "Philipp Thoss")

# 带审计记录的数据导入
raw_data <- read.csv("data/raw/study_data.csv")
raw_hash <- hash_data(raw_data, "raw study data")

# 带审计记录的数据转换
clean_data <- audited_transform(raw_data, function(d) {
  d |>
    dplyr::filter(!is.na(primary_endpoint)) |>
    dplyr::mutate(bmi = weight / (height/100)^2)
}, "Remove missing endpoints, calculate BMI")

# 运行分析
log_audit_event("ANALYSIS_START", "Primary efficacy analysis")
model <- lm(primary_endpoint ~ treatment + age + sex, data = clean_data)
log_audit_event("ANALYSIS_COMPLETE", "Primary efficacy analysis", list(
  model_class = class(model),
  formula = deparse(formula(model)),
  n_observations = nobs(model)
))

# 记录会话信息
log_session_info()
```

**预期结果：** 分析脚本在开始时初始化审计日志，记录每次数据导入、转换和分析步骤，并在结束时记录会话信息。JSONL 日志文件捕获完整的来源链。

**失败处理：** 若缺少 `init_audit_log()`，确保已加载 `R/audit_log.R` 或相关软件包。若日志中缺少事件，验证在每次重要操作后是否调用了 `log_audit_event()`。

### 第 6 步：基于 Git 的变更控制

用 git 补充应用层审计追踪：

```bash
# 使用签名提交实现不可否认性
git config commit.gpgsign true

# 引用变更控制的描述性提交消息
git commit -m "CHG-042: Add BMI calculation to data processing

Per change request CHG-042, approved by [Name] on [Date].
Validation impact assessment: Low risk - additional derived variable."
```

**预期结果：** Git 提交已签名（GPG），并使用引用变更控制 ID 的描述性消息。应用层 JSONL 审计追踪与 git 历史记录的结合提供了完整的变更控制记录。

**失败处理：** 若 GPG 签名失败，使用 `git config --global user.signingkey KEY_ID` 配置签名密钥。若密钥未设置，按照 `gpg --gen-key` 创建一个。

## 验证清单

- [ ] 审计日志捕获所有必需事件（启动、数据访问、转换、分析、导出）
- [ ] 时间戳使用带时区的 ISO 8601 格式
- [ ] 数据哈希值能够实现完整性验证
- [ ] 会话信息已记录
- [ ] 日志为仅追加模式（不可删除或修改）
- [ ] 每次会话均捕获分析人员身份
- [ ] 日志格式为机器可读（JSONL）

## 常见问题

- **记录过多**：专注于受监管的事件，不要记录每次变量赋值
- **可变日志**：审计日志必须仅追加，使用 JSONL（每行一个 JSON 对象）
- **缺少时间戳**：每个事件均需带时区的时间戳
- **无会话上下文**：每条日志条目应引用会话以便关联
- **忘记初始化**：脚本必须在任何分析之前调用 `init_audit_log()`

## 相关技能

- `setup-gxp-r-project` — 已验证环境的项目结构
- `write-validation-documentation` — 验证协议和报告
- `validate-statistical-output` — 输出验证方法
- `configure-git-repository` — 作为变更控制一部分的版本控制
