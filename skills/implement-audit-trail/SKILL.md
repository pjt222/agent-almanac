---
name: implement-audit-trail
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

Add audit trail capabilities to R projects for regulatory compliance.

## When to Use

- R analysis requires electronic records compliance (21 CFR Part 11)
- Need to track who did what, when, and why in an analysis
- Implementing data provenance tracking
- Creating tamper-evident analysis logs

## Inputs

- **Required**: R project with data processing or analysis scripts
- **Required**: Regulatory requirements (which audit trail elements are mandatory)
- **Optional**: Existing logging infrastructure
- **Optional**: Electronic signature requirements

## Procedure

### Step 1: Set Up Structured Logging

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

**Expected:** `R/audit_log.R` created with `init_audit_log()` and `log_audit_event()` functions. Calling `init_audit_log()` creates the `audit_logs/` directory and a timestamped JSONL file. Each log entry is a single JSON line with `timestamp`, `event`, `analyst`, and `session_id` fields.

**On failure:** If `jsonlite::toJSON()` fails, ensure the `jsonlite` package is installed. If the log directory cannot be created, check file system permissions. If timestamps lack timezone, verify `%z` is supported on the platform.

### Step 2: Add Data Integrity Checks

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

**Expected:** `hash_data()` returns a SHA-256 hash string and logs a `DATA_HASH` event. `verify_data_integrity()` compares current data against a stored hash and logs a `DATA_VERIFY` event with PASS or FAIL status.

**On failure:** If `digest::digest()` is not found, install the `digest` package. If hashes don't match for identical data, check that column order and data types are consistent between hashing and verification.

### Step 3: Track Data Transformations

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

**Expected:** `audited_transform()` wraps any transformation function, logging input dimensions and hash, output dimensions and hash, and the transformation description as a `DATA_TRANSFORM` event.

**On failure:** If the transform function errors, the audit event is not logged. Wrap the transform in `tryCatch()` to log both successes and failures. Ensure the transform function accepts and returns a data frame.

### Step 4: Log Session Environment

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

**Expected:** A `SESSION_INFO` event logged with R version, platform, locale, attached packages with versions, and the renv lockfile hash (if applicable).

**On failure:** If `sessionInfo()` returns incomplete package information, ensure all packages are loaded via `library()` before calling `log_session_info()`. The renv lockfile hash will be `NA` if the project does not use renv.

### Step 5: Implement in Analysis Scripts

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

**Expected:** Analysis scripts initialize the audit log at the start, log each data import, transformation, and analysis step, and record session info at the end. The JSONL log file captures the complete provenance chain.

**On failure:** If `init_audit_log()` is missing, ensure `R/audit_log.R` is sourced or the package is loaded. If events are missing from the log, verify that `log_audit_event()` is called after every significant operation.

### Step 6: Git-Based Change Control

Complement the application-level audit trail with git:

```bash
# Use signed commits for non-repudiation
git config commit.gpgsign true

# Descriptive commit messages referencing change control
git commit -m "CHG-042: Add BMI calculation to data processing

Per change request CHG-042, approved by [Name] on [Date].
Validation impact assessment: Low risk - additional derived variable."
```

**Expected:** Git commits are signed (GPG) and use descriptive messages referencing change control IDs. The combination of application-level JSONL audit trail and git history provides a complete change control record.

**On failure:** If GPG signing fails, configure the signing key with `git config --global user.signingkey KEY_ID`. If the key is not set up, follow `gpg --gen-key` to create one.

## Validation

- [ ] Audit log captures all required events (start, data access, transforms, analysis, export)
- [ ] Timestamps use ISO 8601 format with timezone
- [ ] Data hashes enable integrity verification
- [ ] Session information is recorded
- [ ] Logs are append-only (no deletion or modification)
- [ ] Analyst identity is captured for each session
- [ ] Log format is machine-readable (JSONL)

## Common Pitfalls

- **Logging too much**: Focus on regulated events. Don't log every variable assignment.
- **Mutable logs**: Audit logs must be append-only. Use JSONL (one JSON object per line).
- **Missing timestamps**: Every event needs a timestamp with timezone.
- **No session context**: Each log entry should reference the session for correlation.
- **Forgetting to initialize**: Scripts must call `init_audit_log()` before any analysis.

## Related Skills

- `setup-gxp-r-project` - project structure for validated environments
- `write-validation-documentation` - validation protocols and reports
- `validate-statistical-output` - output verification methodology
- `configure-git-repository` - version control as part of change control
