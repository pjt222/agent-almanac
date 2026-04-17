---
name: fail-early-pattern
description: >
  できるだけ早い時点でエラーを検出して報告するフェイルアーリー（フェイル
  ファスト）パターンを適用する。ガード句による入力バリデーション、意味の
  ある エラーメッセージ、アサーション関数、および失敗を黙って飲み込む
  アンチパターンをカバーする。主にRの例を含み、一般的/多言語のガイダンスを
  提供する。外部入力を受け付ける関数を書く場合、CRAN申請前に入力バリデーション
  を追加する場合、誤った結果を黙って生成するコードをリファクタリングする場合、
  エラーハンドリング品質のPRレビューを行う場合、または無効な引数に対して
  内部APIを強化する場合に使用する。
locale: ja
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

# フェイルアーリー

何かが失敗する場合、できるだけ早く、できるだけ大きな声で、できるだけ多くのコンテキストとともに失敗すべきだ。このスキルはフェイルアーリーパターンを体系化する: システム境界で入力を検証し、ガード句を使用して悪い状態が伝播する前に拒否し、*何が*失敗したか、*どこで*、*なぜ*、*修正方法*に答えるエラーメッセージを書く。

## 使用タイミング

- 外部入力（ユーザーデータ、APIレスポンス、ファイルコンテンツ）を受け付ける関数を書く/レビューする場合
- CRAN申請前にパッケージ関数に入力バリデーションを追加する場合
- エラーを出す代わりに黙って誤った結果を生成するコードをリファクタリングする場合
- エラーハンドリング品質のプルリクエストをレビューする場合
- 無効な引数に対して内部APIを強化する場合

## 入力

- **必須**: パターンを適用する関数またはモジュール
- **必須**: トラスト境界の特定（外部データが入ってくる場所）
- **任意**: リファクタリングする既存のエラーハンドリングコード
- **任意**: ターゲット言語（デフォルト: R; Python、TypeScript、Rustにも適用）

## 手順

### ステップ1: トラスト境界を特定する

外部データがシステムに入ってくる場所をマップする。これらがバリデーションが必要なポイントだ:

- パブリックAPI関数（Rパッケージのエクスポートされた関数）
- ユーザー向けパラメータ
- ファイルI/O（設定、データファイル、ユーザーアップロードの読み込み）
- ネットワークレスポンス（APIコール、データベースクエリ）
- 環境変数とシステム設定

検証済みのコードのみによって呼ばれる内部ヘルパー関数は、通常冗長なバリデーションを必要としない。

**期待結果：** 信頼されていないデータがコードに入ってくるエントリポイントのリスト。

**失敗時：** 境界が不明確な場合、ログや不具合レポートのエラーから後ろ向きに追跡して、不正なデータが最初に入ってきた場所を見つける。

### ステップ2: エントリポイントにガード句を追加する

各パブリック関数の先頭で、作業が始まる前に入力を検証する。

**R（base）:**

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

**R（rlang/cli — パッケージに推奨）:**

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

**一般（TypeScript）:**

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

**期待結果：** すべてのパブリック関数が、副作用や計算の前に無効な入力を拒否するガード句で始まる。

**失敗時：** バリデーションロジックが長くなりすぎる場合（ガードが15行以上）、`validate_*` ヘルパーを抽出するか、単純な型アサーションには `stopifnot()` を使用する。

### ステップ3: 意味のあるエラーメッセージを書く

すべてのエラーメッセージは4つの質問に答えるべきだ:

1. **何が**失敗したか — どのパラメータまたは操作
2. **どこで** — 関数名またはコンテキスト（`cli::cli_abort` で自動）
3. **なぜ** — 期待されたものと受け取ったものの比較
4. **修正方法** — 修正が非自明な場合

**良いメッセージ:**

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

**悪いメッセージ:**

```r
stop("Error")                    # 何が失敗した? わからない
stop("Invalid input")           # どの入力? 何が問題?
stop(paste("Error in step", i)) # 実行可能な情報なし
```

**期待結果：** エラーメッセージが自己文書化されている — エラーを初めて見た開発者がソースコードを読まずに診断して修正できる。

**失敗時：** 最近の3つの不具合レポートを確認する。ソースコードを読む必要があった場合、そのエラーメッセージは改善が必要だ。

### ステップ4: warning()よりstop()を優先する

関数が正しい結果を生成できない場合は `stop()`（または `cli::cli_abort()`）を使用する。関数がまだ意味のある結果を生成できるが呼び出し元が懸念を知るべき場合にのみ `warning()` を使用する。

**経験則:** ユーザーが黙って誤った回答を得る可能性がある場合、それは `stop()` であり、`warning()` ではない。

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

**期待結果：** `stop()` が誤った結果を生成する条件に使用され、`warning()` が劣化しているが有効な結果に予約されている。

**失敗時：** 既存の `warning()` 呼び出しを監査する。警告後に関数がナンセンスを返す場合、`stop()` に変更する。

### ステップ5: 内部不変条件にアサーションを使用する

「正しいコードでは絶対に起こらない」条件にはアサーションを使用する。これらは開発中のプログラマーエラーをキャッチする:

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

**期待結果：** 内部不変条件がアサートされ、3つの関数呼び出し後に不可解なエラーではなく、違反サイトですぐにバグが表面化する。

**失敗時：** `stopifnot()` メッセージが不可解すぎる場合、コンテキストを含む明示的な `if/stop` に切り替える。

### ステップ6: アンチパターンをリファクタリングする

これらの一般的なアンチパターンを特定して修正する:

**アンチパターン1: 空のtryCatch（エラーを飲み込む）**

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

**アンチパターン2: 悪い入力を隠すデフォルト値**

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

**アンチパターン3: suppressWarningsを修正として使用**

```r
# BEFORE: Hiding the symptom instead of fixing the cause
result <- suppressWarnings(as.numeric(user_input))

# AFTER: Validate explicitly, handle the expected case
if (!grepl("^-?\\d+\\.?\\d*$", user_input)) {
  stop("Expected a number, got: '", user_input, "'", call. = FALSE)
}
result <- as.numeric(user_input)
```

**アンチパターン4: キャッチオール例外ハンドラー**

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

**期待結果：** アンチパターンが明示的なバリデーションまたは特定のエラーハンドリングに置き換えられる。

**失敗時：** `tryCatch` を削除すると連鎖的な失敗が発生する場合、上流のコードにバリデーションギャップがある。症状ではなく原因を修正する。

### ステップ7: フェイルアーリーリファクタリングを検証する

テストスイートを実行してエラーパスが正しく機能することを確認する:

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

**期待結果：** すべてのテストがパスする。エラーパスのテストが、悪い入力が期待されるエラーメッセージをトリガーすることを確認する。

**失敗時：** 既存のテストが黙った失敗（例: 悪い入力でNULLを返す）に依存していた場合、新しいエラーを期待するように更新する。

## バリデーション

- [ ] すべてのパブリック関数が作業前に入力を検証する
- [ ] エラーメッセージが答える: 何が失敗したか、どこで、なぜ、修正方法
- [ ] `stop()` が誤った結果を生成する条件に使用されている
- [ ] `warning()` が劣化しているが有効な結果にのみ使用されている
- [ ] エラーを黙って飲み込む空の `tryCatch` ブロックがない
- [ ] 適切なバリデーションの代替として `suppressWarnings()` が使用されていない
- [ ] 無効な入力を黙って隠すデフォルト値がない
- [ ] 内部不変条件が `stopifnot()` または明示的なアサーションを使用する
- [ ] 各バリデーションガードのエラーパステストが存在する
- [ ] リファクタリング後にテストスイートがパスする

## よくある落とし穴

- **深すぎる場所でのバリデーション**: トラスト境界（パブリックAPI）でバリデーションを行い、すべての内部ヘルパーではない。過剰なバリデーションはノイズを追加しパフォーマンスを損なう。
- **コンテキストのないエラーメッセージ**: `"Invalid input"` は呼び出し元に推測を強いる。常にパラメータ名、期待される型/範囲、受け取った実際の値を含める。
- **stop()の代わりにwarning()を使用**: 警告後に関数がゴミを返す場合、呼び出し元は黙って誤った回答を得る。`stop()` を使用して呼び出し元が処理方法を決めるようにする。
- **tryCatchでエラーを飲み込む**: `tryCatch(..., error = function(e) NULL)` がバグを隠す。キャッチする必要がある場合、コンテキストを追加してログに記録するか再スローする。
- **call. = FALSEを忘れる**: Rでは `stop("msg")` はデフォルトでコールを含み、エンドユーザーにはノイズになる。ユーザー向け関数では `call. = FALSE` を使用する。`cli::cli_abort()` はこれを自動的に行う。
- **コードではなくテストでバリデーション**: テストは動作を確認するが、本番の呼び出し元を保護しない。バリデーションは関数自体に属する。

- **ハイブリッドシステムでの誤った R バイナリ**：WSL や Docker では、`Rscript` がネイティブ R の代わりにクロスプラットフォームラッパーに解決される場合があります。`which Rscript && Rscript --version` で確認してください。信頼性のために、ネイティブ R バイナリ（例：Linux/WSL では `/usr/local/bin/Rscript`）を優先してください。R パス設定については [Setting Up Your Environment](../../guides/setting-up-your-environment.md) を参照してください。

## 関連スキル

- `write-testthat-tests` - エラーパスを確認するテストを書く
- `review-pull-request` - 欠けているバリデーションと黙った失敗のコードをレビューする
- `review-software-architecture` - システムレベルでエラーハンドリング戦略を評価する
- `create-skill` - agentskills.io標準に従って新しいスキルを作成する
- `security-audit-codebase` - 入力バリデーションと重複するセキュリティ重視のレビュー
