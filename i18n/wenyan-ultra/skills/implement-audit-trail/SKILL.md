---
name: implement-audit-trail
locale: wenyan-ultra
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

# 實審計追跡

加審計追跡能於 R 項目供法規合規。

## 用

- R 析需電子記錄合規（21 CFR Part 11）
- 需記析中誰於何時為何事
- 施數據源追跡
- 造防篡析記

## 入

- **必**：含數據處理或析腳本之 R 項目
- **必**：法規需求（哪些審跡元素必需）
- **可**：既有記基建
- **可**：電子簽需求

## 行

### 一：立結構化日記

造 `R/audit_log.R`：

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

得：`R/audit_log.R` 造，含 `init_audit_log()` 與 `log_audit_event()` 函。調 `init_audit_log()` 造 `audit_logs/` 目錄與時戳 JSONL 檔。各記條為單 JSON 行，含 `timestamp`、`event`、`analyst`、`session_id` 諸欄。

敗：`jsonlite::toJSON()` 敗→確 `jsonlite` 包已裝。記目錄不可造→察檔系權。時戳缺時區→驗 `%z` 於平台支援。

### 二：加數據完整性察

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

得：`hash_data()` 返 SHA-256 散列串並記 `DATA_HASH` 事件。`verify_data_integrity()` 比當前數據於存散列並記 `DATA_VERIFY` 事件含 PASS 或 FAIL。

敗：`digest::digest()` 未找→裝 `digest` 包。同數據散列不符→察散列與驗時欄順與數據型一致。

### 三：追蹤數據變換

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

得：`audited_transform()` 包任變換函，記入維與散列、出維與散列、變換述為 `DATA_TRANSFORM` 事件。

敗：變換函誤→審計事件未記。以 `tryCatch()` 包變換以記成敗。確變換函受並返數據幀。

### 四：記會環境

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

得：`SESSION_INFO` 事件記含 R 版本、平台、區域、附載包與版本、renv 鎖檔散列（若用）。

敗：`sessionInfo()` 返不全包訊→確諸包於調 `log_session_info()` 前經 `library()` 載。項目未用 renv→renv 鎖檔散列為 `NA`。

### 五：於析腳本施行

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

得：析腳本始時初化審跡，記各數據入、變換、析步，終時記會訊。JSONL 記檔捕全源鏈。

敗：`init_audit_log()` 缺→確 `R/audit_log.R` 源載或包已載。事件缺於記→驗 `log_audit_event()` 於各重要操作後調。

### 六：Git 變更控制

補應用級審跡以 git：

```bash
# Use signed commits for non-repudiation
git config commit.gpgsign true

# Descriptive commit messages referencing change control
git commit -m "CHG-042: Add BMI calculation to data processing

Per change request CHG-042, approved by [Name] on [Date].
Validation impact assessment: Low risk - additional derived variable."
```

得：Git 提交已簽（GPG）且用述訊引變更控制 ID。應用級 JSONL 審跡與 git 史合成全變更控制記。

敗：GPG 簽敗→用 `git config --global user.signingkey KEY_ID` 配簽鍵。鍵未設→依 `gpg --gen-key` 造。

## 驗

- [ ] 審跡捕諸必需事件（始、數據訪、變換、析、出）
- [ ] 時戳用 ISO 8601 格式含時區
- [ ] 數據散列使完整性可驗
- [ ] 會訊已記
- [ ] 記僅附加（無刪改）
- [ ] 各會捕析者身分
- [ ] 記格式機可讀（JSONL）

## 忌

- **記過多**：專於受規事件。勿記諸變量賦值
- **可變記**：審跡必僅附加。用 JSONL（每行一 JSON 對象）
- **缺時戳**：各事件需含時區之時戳
- **無會脈絡**：各記條應引會以相關
- **忘初化**：腳本於諸析前必調 `init_audit_log()`
- **敏感數據入記**：審跡不應存 PII 或秘密。僅記散列與元數據
- **記不備份**：審記與數據同命保存

## 參

- `setup-gxp-r-project`
- `write-validation-documentation`
- `validate-statistical-output`
- `configure-git-repository`
