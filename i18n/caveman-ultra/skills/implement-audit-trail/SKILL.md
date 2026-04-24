---
name: implement-audit-trail
locale: caveman-ultra
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

# Implement Audit Trail

R audit trail for regulatory compliance.

## Use When

- 21 CFR Part 11 compliance req'd
- Track who/what/when/why
- Data provenance tracking
- Tamper-evident analysis logs

## In

- **Required**: R project w/ data processing / analysis
- **Required**: regulatory reqs (mandatory elements)
- **Optional**: existing logging infra
- **Optional**: e-sig reqs

## Do

### Step 1: Structured logging

Create `R/audit_log.R`:

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

→ `R/audit_log.R` created. `init_audit_log()` creates `audit_logs/` + timestamped JSONL. Each entry = 1 JSON line w/ `timestamp`, `event`, `analyst`, `session_id`.

**If err:** `jsonlite::toJSON()` fails → install jsonlite. No log dir → FS perms. Missing TZ → check `%z` platform support.

### Step 2: Data integrity checks

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

→ `hash_data()` returns SHA-256 + logs `DATA_HASH`. `verify_data_integrity()` compares vs stored + logs PASS/FAIL.

**If err:** `digest::digest()` missing → install digest. Hashes not match on identical → check col order + types consistent.

### Step 3: Track transformations

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

→ Wraps fn, logs in/out dims + hashes + desc as `DATA_TRANSFORM`.

**If err:** transform fn errors → event not logged. Wrap in `tryCatch()` for success + failure. Fn must accept + return DF.

### Step 4: Log session env

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

→ `SESSION_INFO` logged w/ R version, platform, locale, attached pkgs + versions, renv lockfile hash.

**If err:** incomplete pkg info → load all via `library()` before call. renv hash NA if no renv.

### Step 5: Implement in scripts

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

→ Scripts init at start, log each import/transform/analysis, record session at end. JSONL captures full provenance chain.

**If err:** `init_audit_log()` missing → source `R/audit_log.R` or load pkg. Events missing → verify `log_audit_event()` after every significant op.

### Step 6: Git change control

Complement app-level audit trail w/ git:

```bash
# Use signed commits for non-repudiation
git config commit.gpgsign true

# Descriptive commit messages referencing change control
git commit -m "CHG-042: Add BMI calculation to data processing

Per change request CHG-042, approved by [Name] on [Date].
Validation impact assessment: Low risk - additional derived variable."
```

→ Signed (GPG) commits w/ descriptive msgs referencing change control IDs. App-level JSONL + git = complete change control.

**If err:** GPG signing fails → `git config --global user.signingkey KEY_ID`. No key → `gpg --gen-key`.

## Check

- [ ] All req'd events captured (start, access, transforms, analysis, export)
- [ ] Timestamps ISO 8601 + TZ
- [ ] Hashes enable integrity verification
- [ ] Session info recorded
- [ ] Append-only (no delete/modify)
- [ ] Analyst identity captured
- [ ] Machine-readable JSONL

## Traps

- **Log too much**: focus on regulated events. Don't log every assignment.
- **Mutable logs**: must be append-only. JSONL (1 JSON/line).
- **Missing timestamps**: every event needs timestamp + TZ.
- **No session context**: entry should ref session for correlation.
- **Forget init**: must `init_audit_log()` before analysis.

## →

- `setup-gxp-r-project` — validated env structure
- `write-validation-documentation` — protocols + reports
- `validate-statistical-output` — output verification
- `configure-git-repository` — version control as change control
