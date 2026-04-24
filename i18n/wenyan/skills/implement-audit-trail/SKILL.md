---
name: implement-audit-trail
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Implement audit trail functionality for R projects in regulated
  environments. Covers logging, provenance tracking, electronic
  signatures, data integrity checks, and 21 CFR Part 11 compliance. Use
  when an R analysis requires electronic records compliance (21 CFR Part 11),
  when you need to track who did what and when in an analysis, when
  implementing data provenance tracking, or when creating tamper-evident
  analysis logs for regulatory submissions.
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

# 審計軌之實

為受監管 R 項目加審計軌以合規。

## 用時

- R 析需電子記錄合規（21 CFR Part 11）
- 需跟何人何時於析何事何因
- 實資料溯源跟蹤
- 創防篡改析記

## 入

- **必要**：有資料處理或析腳本之 R 項目
- **必要**：監管需求（何審計軌元素必要）
- **可選**：現有日志架構
- **可選**：電子簽名需求

## 法

### 第一步：設結構化日志

創 `R/audit_log.R`：

```r
#' Initialize audit log for a session
#'
#' @param log_dir Directory for audit log files
#' @param analyst Name of the analyst
#' @return Path to the created log file
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

#' Log an audit event
#'
#' @param event Event type (DATA_IMPORT, TRANSFORM, ANALYSIS, EXPORT, etc.)
#' @param description Human-readable description
#' @param details Named list of additional details
log_audit_event <- function(event, description, details = list()) {
  log_file <- getOption("audit_log_file")
  if (is.null(log_file)) stop("Audit log not initialized. Call init_audit_log() first.")

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

**得：** `R/audit_log.R` 已創含 `init_audit_log()` 與 `log_audit_event()` 函。調 `init_audit_log()` 創 `audit_logs/` 目錄與帶時戳之 JSONL 檔。每日志項為單 JSON 行含 `timestamp`、`event`、`analyst`、`session_id` 欄。

**敗則：** 若 `jsonlite::toJSON()` 敗，確 `jsonlite` 包已裝。若日志目錄不能創，察檔系權限。若時戳缺時區，驗平台支 `%z`。

### 第二步：加資料完整性察

```r
#' Compute and log data hash for integrity verification
#'
#' @param data Data frame to hash
#' @param label Descriptive label for the dataset
#' @return SHA-256 hash string
hash_data <- function(data, label = "dataset") {
  hash_value <- digest::digest(data, algo = "sha256")

  log_audit_event("DATA_HASH", sprintf("Hash computed for %s", label), list(
    hash_algorithm = "sha256",
    hash_value = hash_value,
    nrow = nrow(data),
    ncol = ncol(data),
    columns = names(data)
  ))

  hash_value
}

#' Verify data integrity against a recorded hash
#'
#' @param data Data frame to verify
#' @param expected_hash Previously recorded hash
#' @return Logical indicating whether data matches
verify_data_integrity <- function(data, expected_hash) {
  current_hash <- digest::digest(data, algo = "sha256")
  match <- identical(current_hash, expected_hash)

  log_audit_event("DATA_VERIFY",
    sprintf("Data integrity check: %s", ifelse(match, "PASS", "FAIL")),
    list(expected = expected_hash, actual = current_hash))

  if (!match) warning("Data integrity check FAILED")
  match
}
```

**得：** `hash_data()` 返 SHA-256 哈希串並記 `DATA_HASH` 事件。`verify_data_integrity()` 對已存哈希比當前資料並記 `DATA_VERIFY` 事件附 PASS 或 FAIL。

**敗則：** 若 `digest::digest()` 未找，裝 `digest` 包。若同資料哈希不合，察哈希與驗間列序與型一致。

### 第三步：跟資料變換

```r
#' Wrap a data transformation with audit logging
#'
#' @param data Input data frame
#' @param transform_fn Function to apply
#' @param description Description of the transformation
#' @return Transformed data frame
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

**得：** `audited_transform()` 包任何變換函，記入維與哈希、出維與哈希、變換述為 `DATA_TRANSFORM` 事件。

**敗則：** 若變換函誤，審計事件不記。以 `tryCatch()` 包變換以記成敗。確變換函受並返資料框。

### 第四步：記會話環境

```r
#' Log complete session information for reproducibility
log_session_info <- function() {
  si <- sessionInfo()

  log_audit_event("SESSION_INFO", "Complete session environment recorded", list(
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

**得：** `SESSION_INFO` 事件記 R 版、平台、區域、附帶版包、renv 鎖檔哈希（若適）。

**敗則：** 若 `sessionInfo()` 返不全包資，確 `log_session_info()` 前所有包以 `library()` 載。若項目不用 renv，renv 鎖檔哈希為 `NA`。

### 第五步：於析腳本實

```r
# 01_analysis.R
library(jsonlite)
library(digest)

# Start audit trail
log_file <- init_audit_log(analyst = "Philipp Thoss")

# Import data with audit
raw_data <- read.csv("data/raw/study_data.csv")
raw_hash <- hash_data(raw_data, "raw study data")

# Transform with audit
clean_data <- audited_transform(raw_data, function(d) {
  d |>
    dplyr::filter(!is.na(primary_endpoint)) |>
    dplyr::mutate(bmi = weight / (height/100)^2)
}, "Remove missing endpoints, calculate BMI")

# Run analysis
log_audit_event("ANALYSIS_START", "Primary efficacy analysis")
model <- lm(primary_endpoint ~ treatment + age + sex, data = clean_data)
log_audit_event("ANALYSIS_COMPLETE", "Primary efficacy analysis", list(
  model_class = class(model),
  formula = deparse(formula(model)),
  n_observations = nobs(model)
))

# Log session
log_session_info()
```

**得：** 析腳本於始化審計日志、記每資料入、變換、析步、末記會話資。JSONL 日志檔捕全溯源鏈。

**敗則：** 若 `init_audit_log()` 缺，確 `R/audit_log.R` 已源或包已載。若事件缺於日志，驗每重要操作後調 `log_audit_event()`。

### 第六步：以 git 作變更控

補應用級審計軌以 git：

```bash
# Use signed commits for non-repudiation
git config commit.gpgsign true

# Descriptive commit messages referencing change control
git commit -m "CHG-042: Add BMI calculation to data processing

Per change request CHG-042, approved by [Name] on [Date].
Validation impact assessment: Low risk - additional derived variable."
```

**得：** Git commit 有簽（GPG）並用描述性消息引變更控 ID。應用級 JSONL 審計軌與 git 歷之合供全變更控記。

**敗則：** 若 GPG 簽敗，以 `git config --global user.signingkey KEY_ID` 配簽鍵。若鍵未設，行 `gpg --gen-key` 創。

## 驗

- [ ] 審計日志捕所有必要事件（始、資料訪、變換、析、出）
- [ ] 時戳用 ISO 8601 格式含時區
- [ ] 資料哈希使完整性可驗
- [ ] 會話資已記
- [ ] 日志僅附（無刪無改）
- [ ] 每會話已捕析者身份
- [ ] 日志格可機讀（JSONL）

## 陷

- **記過多**：焦受管事件。勿記每變數賦
- **可變日志**：審計日志必僅附。用 JSONL（每行一 JSON 對象）
- **缺時戳**：每事件需帶時區之時戳
- **無會話語境**：每日志項應引會話以相關
- **忘初化**：腳本必於任何析前調 `init_audit_log()`

## 參

- `setup-gxp-r-project` — 受驗環境之項目結構
- `write-validation-documentation` — 驗協議與報告
- `validate-statistical-output` — 出驗法
- `configure-git-repository` — 版控為變更控之部
