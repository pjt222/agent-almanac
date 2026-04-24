---
name: implement-audit-trail
locale: wenyan-lite
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

# 實稽核軌跡

為管制環境之 R 專案加稽核軌跡能力。

## 適用時機

- R 分析需電子記錄合規（21 CFR Part 11）
- 須追蹤分析中誰何時何事何故
- 實資料出處追蹤
- 建防篡改之分析日誌

## 輸入

- **必要**：含資料處理或分析腳本之 R 專案
- **必要**：監管要求（何稽核軌跡要素為強制）
- **選擇性**：現有日誌基礎設施
- **選擇性**：電子簽章要求

## 步驟

### 步驟一：設結構化日誌

建 `R/audit_log.R`：

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

**預期：** `R/audit_log.R` 已建，含 `init_audit_log()` 與 `log_audit_event()` 函數。呼 `init_audit_log()` 建 `audit_logs/` 目錄與時間戳 JSONL 檔。每日誌條目為單一 JSON 行含 `timestamp`、`event`、`analyst`、`session_id` 欄。

**失敗時：** 若 `jsonlite::toJSON()` 失敗，確 `jsonlite` 套件已裝。若日誌目錄不能建，核檔案系統權限。若時間戳缺時區，驗 `%z` 於平台支援。

### 步驟二：加資料完整性檢查

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

**預期：** `hash_data()` 返 SHA-256 雜湊字串並記 `DATA_HASH` 事件。`verify_data_integrity()` 較當前資料於儲存雜湊並以 PASS 或 FAIL 狀態記 `DATA_VERIFY` 事件。

**失敗時：** 若 `digest::digest()` 未見，裝 `digest` 套件。若同一資料雜湊不配，核雜湊與驗證間欄順與資料型別一致。

### 步驟三：追資料轉換

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

**預期：** `audited_transform()` 包任何轉換函數，記輸入尺寸與雜湊、輸出尺寸與雜湊、轉換描述為 `DATA_TRANSFORM` 事件。

**失敗時：** 若轉換函數錯，稽核事件不記。以 `tryCatch()` 包轉換以記成與敗。確轉換函數接受並返資料框。

### 步驟四：記會話環境

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

**預期：** 記 `SESSION_INFO` 事件含 R 版本、平台、區域、附載套件含版本與 renv 鎖檔雜湊（若適用）。

**失敗時：** 若 `sessionInfo()` 返不全套件資訊，確所有套件經 `library()` 呼 `log_session_info()` 前載。若專案不用 renv，renv 鎖檔雜湊為 `NA`。

### 步驟五：於分析腳本實行

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

**預期：** 分析腳本始時初始化稽核日誌，記每資料匯入、轉換、分析步驟，末記會話資訊。JSONL 日誌檔捕完整出處鏈。

**失敗時：** 若 `init_audit_log()` 缺，確 `R/audit_log.R` 已來源或套件已載。若事件自日誌缺，驗 `log_audit_event()` 於每重要操作後呼之。

### 步驟六：基於 git 之變更控制

以 git 補應用層稽核軌跡：

```bash
# Use signed commits for non-repudiation
git config commit.gpgsign true

# Descriptive commit messages referencing change control
git commit -m "CHG-042: Add BMI calculation to data processing

Per change request CHG-042, approved by [Name] on [Date].
Validation impact assessment: Low risk - additional derived variable."
```

**預期：** Git 提交已簽章（GPG）並用描述訊息參考變更控制 ID。應用層 JSONL 稽核軌跡與 git 歷史之合構成完整變更控制記錄。

**失敗時：** 若 GPG 簽章失敗，以 `git config --global user.signingkey KEY_ID` 配簽章金鑰。若金鑰未設，循 `gpg --gen-key` 以建之。

## 驗證

- [ ] 稽核日誌捕所有所需事件（始、資料取、轉換、分析、輸出）
- [ ] 時間戳用 ISO 8601 格式附時區
- [ ] 資料雜湊允許完整性驗證
- [ ] 會話資訊已記
- [ ] 日誌為只附加（無刪或改）
- [ ] 每會話捕分析師身分
- [ ] 日誌格式可機讀（JSONL）

## 常見陷阱

- **記過多**：專注於管制事件。勿記每變數賦值。
- **可變日誌**：稽核日誌須只附加。用 JSONL（一行一 JSON 物件）。
- **缺時間戳**：每事件需附時區之時間戳。
- **無會話情境**：每日誌條目應參考會話以供關聯。
- **忘初始化**：腳本須於任何分析前呼 `init_audit_log()`。

## 相關技能

- `setup-gxp-r-project` - 驗證環境之專案結構
- `write-validation-documentation` - 驗證協定與報告
- `validate-statistical-output` - 輸出驗證法
- `configure-git-repository` - 版本控制為變更控制之一部
