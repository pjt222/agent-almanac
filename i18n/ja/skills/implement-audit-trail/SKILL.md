---
name: implement-audit-trail
description: >
  規制環境のRプロジェクトに監査証跡機能を実装します。ロギング、来歴追跡、
  電子署名、データ整合性チェック、21 CFR Part 11準拠を対象とします。
  RプロジェクトにelectronicRecords準拠（21 CFR Part 11）が必要な場合、
  分析中の誰が何をいつ行ったかを追跡する必要がある場合、データ来歴追跡の実装時、
  または規制提出用の改ざん防止分析ログの作成時に使用します。
locale: ja
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

# 監査証跡の実装

規制準拠のためにRプロジェクトに監査証跡機能を追加します。

## 使用タイミング

- R分析に電子記録準拠（21 CFR Part 11）が必要な場合
- 分析中の誰が何をいつ、なぜ行ったかを追跡する必要がある場合
- データ来歴追跡の実装時
- 改ざん防止分析ログの作成時

## 入力

- **必須**: データ処理または分析スクリプトを含むRプロジェクト
- **必須**: 規制要件（どの監査証跡要素が必須か）
- **任意**: 既存のロギングインフラ
- **任意**: 電子署名要件

## 手順

### ステップ1: 構造化ロギングの設定

`R/audit_log.R` を作成します:

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

**期待結果：** `R/audit_log.R` が `init_audit_log()` と `log_audit_event()` 関数を含んで作成されていること。`init_audit_log()` を呼び出すと `audit_logs/` ディレクトリとタイムスタンプ付きJSONLファイルが作成されること。各ログエントリが `timestamp`、`event`、`analyst`、`session_id` フィールドを含む単一のJSON行であること。

**失敗時：** `jsonlite::toJSON()` が失敗した場合は `jsonlite` パッケージがインストールされていることを確認します。ログディレクトリを作成できない場合はファイルシステム権限を確認します。タイムスタンプにタイムゾーンがない場合は `%z` がプラットフォームでサポートされているか確認します。

### ステップ2: データ整合性チェックの追加

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

**期待結果：** `hash_data()` がSHA-256ハッシュ文字列を返し、`DATA_HASH` イベントをログに記録すること。`verify_data_integrity()` が現在のデータを保存されたハッシュと比較し、PASSまたはFAILステータスを含む `DATA_VERIFY` イベントをログに記録すること。

**失敗時：** `digest::digest()` が見つからない場合は `digest` パッケージをインストールします。同一データのハッシュが一致しない場合は、ハッシュ化と検証の間で列の順序とデータ型が一貫していることを確認します。

### ステップ3: データ変換の追跡

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

**期待結果：** `audited_transform()` が任意の変換関数をラップし、入力の寸法とハッシュ、出力の寸法とハッシュ、および変換の説明を `DATA_TRANSFORM` イベントとしてログに記録すること。

**失敗時：** 変換関数がエラーになった場合、監査イベントがログに記録されません。成功と失敗の両方をログに記録するために変換を `tryCatch()` でラップします。変換関数がデータフレームを受け取り、返すことを確認します。

### ステップ4: セッション環境のログ記録

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

**期待結果：** `SESSION_INFO` イベントがRバージョン、プラットフォーム、ロケール、バージョン付きのアタッチされたパッケージ、renvロックファイルのハッシュ（該当する場合）とともにログに記録されること。

**失敗時：** `sessionInfo()` が不完全なパッケージ情報を返す場合は、`log_session_info()` を呼び出す前にすべてのパッケージが `library()` でロードされていることを確認します。プロジェクトがrenvを使用しない場合、renvロックファイルのハッシュは `NA` になります。

### ステップ5: 分析スクリプトへの実装

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

**期待結果：** 分析スクリプトが開始時に監査ログを初期化し、各データインポート、変換、分析ステップをログに記録し、最後にセッション情報を記録すること。JSONLログファイルが完全な来歴チェーンをキャプチャすること。

**失敗時：** `init_audit_log()` が欠けている場合は `R/audit_log.R` がソース化またはパッケージがロードされていることを確認します。イベントがログに欠けている場合は、すべての重要な操作の後に `log_audit_event()` が呼び出されていることを確認します。

### ステップ6: Gitによる変更管理

アプリケーションレベルの監査証跡をgitで補完します:

```bash
# Use signed commits for non-repudiation
git config commit.gpgsign true

# Descriptive commit messages referencing change control
git commit -m "CHG-042: Add BMI calculation to data processing

Per change request CHG-042, approved by [Name] on [Date].
Validation impact assessment: Low risk - additional derived variable."
```

**期待結果：** Gitコミットが署名済み（GPG）で、変更管理IDを参照した説明的なメッセージを使用していること。アプリケーションレベルのJSONL監査証跡とgit履歴の組み合わせが完全な変更管理記録を提供すること。

**失敗時：** GPG署名が失敗した場合は `git config --global user.signingkey KEY_ID` で署名キーを設定します。キーが設定されていない場合は `gpg --gen-key` に従って作成します。

## バリデーション

- [ ] 監査ログが必要なすべてのイベント（開始、データアクセス、変換、分析、エクスポート）をキャプチャしている
- [ ] タイムスタンプがタイムゾーン付きのISO 8601形式を使用している
- [ ] データハッシュが整合性検証を可能にしている
- [ ] セッション情報が記録されている
- [ ] ログが追記専用である（削除や変更ができない）
- [ ] 各セッションでアナリストのIDがキャプチャされている
- [ ] ログフォーマットが機械可読（JSONL）である

## よくある落とし穴

- **過剰なロギング**: 規制されたイベントに焦点を当てること。すべての変数代入をログに記録しないこと
- **変更可能なログ**: 監査ログは追記専用でなければならない。JSONL（1行に1つのJSONオブジェクト）を使用すること
- **タイムスタンプの欠如**: すべてのイベントにタイムゾーン付きのタイムスタンプが必要
- **セッションコンテキストなし**: 各ログエントリは相関のためにセッションを参照すること
- **初期化の忘れ**: スクリプトは分析前に `init_audit_log()` を呼び出す必要がある

## 関連スキル

- `setup-gxp-r-project` - バリデート済み環境のプロジェクト構造
- `write-validation-documentation` - バリデーションプロトコルと報告書
- `validate-statistical-output` - 出力検証方法論
- `configure-git-repository` - 変更管理の一部としてのバージョン管理
