---
name: analyze-codebase-workflow
description: >
  putiorのput_auto()エンジンを使用して、任意のコードベースのワークフロー、
  データパイプライン、ファイル依存関係を自動検出する。30以上の対応言語と
  902の自動検出パターンで、検出されたI/Oパターンをソースファイルにマッピングする
  アノテーション計画を作成する。馴染みのないコードベースのデータフローを理解する時、
  既存のアノテーションなしでputior統合を開始する時、ドキュメント作成前に
  データパイプラインを監査する時、annotate-source-filesの前にアノテーション計画を
  準備する時に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: workflow-visualization
  complexity: intermediate
  language: multi
  tags: putior, workflow, analysis, auto-detect, polyglot, data-pipeline
  locale: ja
  source_locale: en
  source_commit: 30b85b9086a4cb52c5c8f7abb8970bd42512bb3e
  translator: claude
  translation_date: "2026-03-17"
---

# コードベースワークフロー分析

任意のリポジトリを調査してデータフロー、ファイルI/O、スクリプト依存関係を自動検出し、手動で精緻化するための構造化されたアノテーション計画を作成する。

## 使用タイミング

- 馴染みのないコードベースにオンボーディングしてデータフローを理解する必要がある時
- PUTアノテーションがまだないプロジェクトでputior統合を開始する時
- ドキュメント作成前に既存プロジェクトのデータパイプラインを監査する時
- `annotate-source-files`を実行する前にアノテーション計画を準備する時

## 入力

- **必須**: 分析対象のリポジトリまたはソースディレクトリへのパス
- **任意**: フォーカスする特定のサブディレクトリ（デフォルト: リポジトリ全体）
- **任意**: 含めるまたは除外する言語（デフォルト: 検出されたすべて）
- **任意**: 検出スコープ: 入力のみ、出力のみ、または両方（デフォルト: 両方 + 依存関係）

## 手順

### ステップ1: リポジトリ構造を調査する

ソースファイルとその言語を特定し、putiorが何を分析できるかを理解する。

```r
library(putior)

# List all supported languages and their extensions
list_supported_languages()
list_supported_languages(detection_only = TRUE)  # Only languages with auto-detection

# Get supported extensions
exts <- get_supported_extensions()
```

ファイルリストを使用してリポジトリの構成を理解する:

```bash
# Count files by extension in the target directory
find /path/to/repo -type f | sed 's/.*\.//' | sort | uniq -c | sort -rn | head -20
```

**期待結果:** リポジトリに存在するファイル拡張子のリストとカウント。これらを`get_supported_extensions()`と照合してカバレッジを把握する。

**失敗時:** リポジトリにサポートされた拡張子に一致するファイルがない場合、putiorはワークフローを自動検出できない。言語はサポートされているがファイルが非標準の拡張子を使用していないか検討する。

### ステップ2: 言語検出カバレッジを確認する

検出された各言語について、自動検出パターンの利用可能性を確認する。

```r
# Check which languages have auto-detection patterns (18 languages, 902 patterns)
detection_langs <- list_supported_languages(detection_only = TRUE)
cat("Languages with auto-detection:\n")
print(detection_langs)

# Get pattern counts for specific languages found in the repo
for (lang in c("r", "python", "javascript", "sql", "dockerfile", "makefile")) {
  patterns <- get_detection_patterns(lang)
  cat(sprintf("%s: %d input, %d output, %d dependency patterns\n",
    lang,
    length(patterns$input),
    length(patterns$output),
    length(patterns$dependency)
  ))
}
```

**期待結果:** 各言語のパターン数が表示される。Rは124パターン、Pythonは159、JavaScriptは71など。

**失敗時:** 言語がパターンを返さない場合、手動アノテーションはサポートしているが自動検出はサポートしていない。それらのファイルは手動でアノテーションする計画を立てる。

### ステップ3: 自動検出を実行する

対象ディレクトリで`put_auto()`を実行してワークフロー要素を発見する。

```r
# Full auto-detection
workflow <- put_auto("./src/",
  detect_inputs = TRUE,
  detect_outputs = TRUE,
  detect_dependencies = TRUE
)

# Exclude build scripts and test helpers from scanning
workflow <- put_auto("./src/",
  detect_inputs = TRUE,
  detect_outputs = TRUE,
  detect_dependencies = TRUE,
  exclude = c("build-", "test_helper")
)

# View detected workflow nodes
print(workflow)

# Check node count
cat(sprintf("Detected %d workflow nodes\n", nrow(workflow)))
```

大規模リポジトリでは、サブディレクトリごとにインクリメンタルに分析する:

```r
# Analyze specific subdirectories
etl_workflow <- put_auto("./src/etl/")
api_workflow <- put_auto("./src/api/")
```

**期待結果:** `id`、`label`、`input`、`output`、`source_file`を含むカラムを持つデータフレーム。各行は検出されたワークフローステップを表す。

**失敗時:** 結果が空の場合、ソースファイルに認識可能なI/Oパターンが含まれていない可能性がある。デバッグログを有効にしてみる: `workflow <- put_auto("./src/", log_level = "DEBUG")` でどのファイルがスキャンされ、どのパターンがマッチしたかを確認する。

### ステップ4: 初期ダイアグラムを生成する

自動検出されたワークフローを可視化してカバレッジを評価し、ギャップを特定する。

```r
# Generate diagram from auto-detected workflow
cat(put_diagram(workflow, theme = "github"))

# With source file info for traceability
cat(put_diagram(workflow, show_source_info = TRUE))

# Save to file for review
writeLines(put_diagram(workflow, theme = "github"), "workflow-auto.md")
```

**期待結果:** 検出されたノードがデータフローエッジで接続されたMermaidフローチャート。ノードには意味のある関数/ファイル名がラベル付けされているべき。

**失敗時:** ダイアグラムが切断されたノードを表示する場合、自動検出はI/Oパターンを見つけたが接続を推論できなかった。これは正常である — 接続は出力ファイル名と入力ファイル名のマッチングから導出される。アノテーション計画（次のステップ）がギャップに対処する。

### ステップ5: アノテーション計画を作成する

発見されたものと手動アノテーションが必要なものを文書化した構造化計画を生成する。

```r
# Generate annotation suggestions
put_generate("./src/", style = "single")

# For multiline style (more readable for complex workflows)
put_generate("./src/", style = "multiline")

# Copy suggestions to clipboard for easy pasting
put_generate("./src/", output = "clipboard")
```

カバレッジ評価付きで計画を文書化する:

```markdown
## Annotation Plan

### Auto-Detected (no manual work needed)
- `src/etl/extract.R` — 3 inputs, 2 outputs detected
- `src/etl/transform.py` — 1 input, 1 output detected

### Needs Manual Annotation
- `src/api/handler.js` — Language supported but no I/O patterns matched
- `src/config/setup.sh` — Only 12 shell patterns; complex logic missed

### Not Supported
- `src/legacy/process.f90` — Fortran not in detection languages

### Recommended Connections
- extract.R output `data.csv` → transform.py input `data.csv` (auto-linked)
- transform.py output `clean.parquet` → load.R input (needs annotation)
```

**期待結果:** 自動検出されたファイルと手動アノテーションが必要なファイルを分離した明確な計画、各ファイルへの具体的な推奨事項付き。

**失敗時:** `put_generate()`が出力を生成しない場合、ディレクトリパスが正しく、サポートされた言語のソースファイルが含まれていることを確認する。

## バリデーション

- [ ] `put_auto()`が対象ディレクトリでエラーなく実行される
- [ ] 検出されたワークフローに少なくとも1つのノードがある（リポジトリに認識可能なI/Oがない場合を除く）
- [ ] `put_diagram()`が自動検出されたワークフローから有効なMermaidコードを生成する
- [ ] `put_generate()`が検出パターンのあるファイルのアノテーション提案を生成する
- [ ] カバレッジ評価付きのアノテーション計画ドキュメントが作成される

## よくある落とし穴

- **スキャン範囲が広すぎる**: リポジトリルートで`put_auto(".")`を実行すると`node_modules/`、`.git/`、`venv/`などが含まれる可能性がある。特定のソースディレクトリを対象にする。
- **完全なカバレッジを期待する**: 自動検出はファイルI/Oとライブラリ呼び出しを見つけるが、ビジネスロジックは見つけない。40-60%のカバレッジ率が典型的であり、残りは手動アノテーションが必要。
- **依存関係を無視する**: `detect_dependencies = TRUE`フラグは`source()`、`import`、`require()`呼び出しをキャッチしてスクリプト同士をリンクする。無効にするとファイル間の接続が失われる。
- **言語の不一致**: 非標準の拡張子（例: `.R` vs `.r`、`.jsx` vs `.js`）のファイルは検出されない可能性がある。`get_comment_prefix()`を使用して拡張子が認識されるか確認する。`Dockerfile`や`Makefile`のような拡張子なしファイルは正確なファイル名マッチングでサポートされている。
- **大規模リポジトリ**: 100以上のソースファイルを持つリポジトリでは、ダイアグラムの可読性を保つためにモジュール/ディレクトリ単位で分析する。

## 関連スキル

- `install-putior` — 前提条件: putiorを先にインストールする必要がある
- `annotate-source-files` — 次のステップ: 計画に基づいて手動アノテーションを追加する
- `generate-workflow-diagram` — アノテーション完了後に最終ダイアグラムを生成する
- `configure-putior-mcp` — インタラクティブな分析セッションにMCPツールを使用する
