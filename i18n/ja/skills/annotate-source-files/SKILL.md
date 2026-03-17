---
name: annotate-source-files
description: >
  正しい言語固有のコメントプレフィックスを使用して、ソースファイルにPUTワークフロー
  アノテーションを追加する。アノテーション構文、put_generate()によるスケルトン
  生成、複数行アノテーション、.internal変数、バリデーションをカバーする。
  30以上の言語をサポートし、自動コメントプレフィックス検出を備える。
  コードベースを分析してアノテーション計画を持った後、新規または既存のソースファイルに
  ワークフロードキュメントを追加する時、データパイプライン、ETLプロセス、
  複数ステップの計算をドキュメント化する時に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: workflow-visualization
  complexity: intermediate
  language: multi
  tags: putior, annotation, workflow, comment-syntax, polyglot, documentation
  locale: ja
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# ソースファイルのアノテーション

putiorが構造化ワークフローデータを抽出してMermaidダイアグラムを生成できるように、ソースファイルにPUTワークフローアノテーションを追加する。

## 使用タイミング

- `analyze-codebase-workflow`でコードベースを分析してアノテーション計画を持った後
- 新規または既存のソースファイルにワークフロードキュメントを追加する時
- 自動検出されたワークフローを手動ラベルと接続で強化する時
- データパイプライン、ETLプロセス、複数ステップの計算をドキュメント化する時

## 入力

- **必須**: アノテーションするソースファイル
- **必須**: アノテーション計画またはワークフローステップの知識
- **任意**: スタイルの好み: 単一行または複数行（デフォルト: 単一行）
- **任意**: スケルトン生成に`put_generate()`を使用するかどうか（デフォルト: はい）

## 手順

### ステップ1: コメントプレフィックスを確認する

各言語にはPUTアノテーション用の特定のコメントプレフィックスがある。正しいものを見つけるには`get_comment_prefix()`を使用する。

```r
library(putior)

# Common prefixes
get_comment_prefix("R")    # "#"
get_comment_prefix("py")   # "#"
get_comment_prefix("sql")  # "--"
get_comment_prefix("js")   # "//"
get_comment_prefix("ts")   # "//"
get_comment_prefix("go")   # "//"
get_comment_prefix("rs")   # "//"
get_comment_prefix("m")    # "%"
get_comment_prefix("lua")  # "--"
```

**期待結果:** `"#"`、`"--"`、`"//"`、`"%"`のような文字列。

> **行コメントとブロックコメント:** putiorは行コメント（`//`、`#`、`--`）とCスタイルのブロックコメント（`/* */`、`/** */`）の両方でアノテーションを検出する。JS/TSでは`//`と`/* */`ブロックの両方がスキャンされる。Pythonのトリプルクオート文字列（`''' '''`）は検出**されない** — Pythonアノテーションには`#`を使用する。

**失敗時:** 拡張子が認識されない場合、ファイルの言語がサポートされていない可能性がある。完全なリストは`get_supported_extensions()`で確認する。サポートされていない言語の場合、規約上のデフォルトとして`#`を使用する。

### ステップ2: アノテーションスケルトンを生成する

自動検出されたI/Oに基づいてアノテーションテンプレートを作成するために`put_generate()`を使用する。

```r
# Print suggestions to console
put_generate("./src/etl/")

# Single-line style (default)
put_generate("./src/etl/", style = "single")

# Multiline style for complex annotations
put_generate("./src/etl/", style = "multiline")

# Copy to clipboard for pasting
put_generate("./src/etl/", output = "clipboard")
```

Rファイルの出力例:
```r
# put id:'extract_data', label:'Extract Customer Data', input:'customers.csv', output:'raw_data.internal'
```

SQLの出力例:
```sql
-- put id:'load_data', label:'Load Customer Table', output:'customers'
```

**期待結果:** ソースファイルごとに1つ以上のアノテーションコメント行、検出された関数名とI/Oで事前入力されている。

**失敗時:** 提案が生成されない場合、ファイルに認識可能なI/Oパターンが含まれていない可能性がある。コードの理解に基づいて手動でアノテーションを書く。

### ステップ3: アノテーションを精緻化する

生成されたスケルトンを編集して正確なラベル、接続、メタデータを追加する。

**アノテーション構文リファレンス:**

```
<prefix> put id:'unique_id', label:'Human Readable Label', input:'file1.csv, file2.rds', output:'result.parquet, summary.internal'
```

フィールド:
- `id`（必須）: 一意の識別子、ノード接続に使用
- `label`（必須）: ダイアグラムに表示される人間可読な説明
- `input`: カンマ区切りの入力ファイルまたは変数のリスト
- `output`: カンマ区切りの出力ファイルまたは変数のリスト
- `.internal`拡張子: メモリ内変数を示す（スクリプト間で永続化されない）
- `node_type`: Mermaidノードの形状とクラススタイルを制御する。値:
  - `"input"` — スタジアム形状`([...])`、データソースと設定用
  - `"output"` — サブルーチン形状`[[...]]`、生成されたアーティファクト用
  - `"process"` — 矩形`[...]`、処理ステップ用（デフォルト）
  - `"decision"` — ダイヤモンド`{...}`、条件ロジック用
  - `"start"` / `"end"` — スタジアム形状`([...])`、開始/終端ノード用

`node_type`の例:
```r
# put id:'config', label:'Load Config', node_type:'input', output:'config.internal'
# put id:'transform', label:'Apply Rules', node_type:'process', input:'config.internal', output:'result.rds'
# put id:'report', label:'Generate Report', node_type:'output', input:'result.rds'
```

**複数行構文**（複雑なアノテーション用）:
```r
# put id:'complex_step', \
#   label:'Multi-line Label', \
#   input:'data.csv, config.yaml', \
#   output:'result.parquet'
```

**ファイル間データフロー**（ファイルベースI/Oによるスクリプト間接続）:
```r
# Script 1: extract.R
# put id:'extract', label:'Extract Data', output:'raw_data.internal, raw_data.rds'
data <- read.csv("source.csv")
saveRDS(data, "raw_data.rds")

# Script 2: transform.R
# put id:'transform', label:'Transform Data', input:'raw_data.rds', output:'clean_data.parquet'
data <- readRDS("raw_data.rds")
arrow::write_parquet(clean, "clean_data.parquet")
```

**期待結果:** 実際のデータフローを反映する正確なID、ラベル、I/Oフィールドでアノテーションが精緻化される。

**失敗時:** I/Oが不確かな場合、メモリ内の中間物には`.internal`拡張子を使用し、永続化データには明示的なファイル名を使用する。

### ステップ4: ファイルにアノテーションを挿入する

各ファイルの先頭または関連するコードブロックの直上にアノテーションを配置する。

**配置規約:**
1. **ファイルレベルアノテーション**: ファイルの先頭に配置、shebang行やファイルヘッダーコメントの後
2. **ブロックレベルアノテーション**: 記述するコードブロックの直上に配置
3. **ファイルあたり複数のアノテーション**: 異なるワークフローフェーズを持つファイルに使用

Rファイルでの配置例:
```r
#!/usr/bin/env Rscript
# ETL Extract Script
#
# put id:'read_source', label:'Read Source Data', input:'raw_data.csv', output:'df.internal'

df <- read.csv("raw_data.csv")

# put id:'clean_data', label:'Clean and Validate', input:'df.internal', output:'clean.rds'

df_clean <- df[complete.cases(df), ]
saveRDS(df_clean, "clean.rds")
```

Editツールを使用して、周囲のコードを乱さずに既存ファイルにアノテーションを挿入する。

**期待結果:** 各ソースファイルの適切な場所にアノテーションが挿入される。

**失敗時:** アノテーションがエディターのシンタックスハイライトを壊す場合、コメントプレフィックスが言語に対して正しいことを確認する。PUTアノテーションは標準コメントであり、コードの実行に影響しないはずである。

### ステップ5: アノテーションを検証する

putiorのバリデーションを実行してアノテーション構文と接続性を確認する。

```r
# Scan annotated files
workflow <- put("./src/", validate = TRUE)

# Check for validation issues
print(workflow)
cat(sprintf("Total nodes: %d\n", nrow(workflow)))

# Verify connections by checking input/output overlap
inputs <- unlist(strsplit(workflow$input, ",\\s*"))
outputs <- unlist(strsplit(workflow$output, ",\\s*"))
connected <- intersect(inputs, outputs)
cat(sprintf("Connected data flows: %d\n", length(connected)))

# Generate diagram to visually inspect
cat(put_diagram(workflow, theme = "github", show_source_info = TRUE))

# Merge with auto-detected for maximum coverage
merged <- put_merge("./src/", merge_strategy = "supplement")
cat(put_diagram(merged, theme = "github"))
```

**期待結果:** すべてのアノテーションがエラーなくパースされる。ダイアグラムが接続されたワークフローを示す。`put_merge()`が自動検出からギャップを埋める。

**失敗時:** よくあるバリデーションの問題:
- 閉じクオートの欠落: `id:'name` → `id:'name'`
- 内部でのダブルクオートの使用: `id:"name"` → `id:'name'`
- ファイル間の重複ID: 各`id`はスキャンされたディレクトリ全体で一意でなければならない
- 誤った行でのバックスラッシュ継続: `\`は改行前の最後の文字でなければならない

## バリデーション

- [ ] アノテーションされたすべてのファイルが構文的に有効なPUTアノテーションを持つ
- [ ] `put("./src/")`が期待されるノード数のデータフレームを返す
- [ ] スキャンされたディレクトリ全体で`id`値の重複がない
- [ ] `put_diagram()`が接続されたフローチャートを生成する（すべてが孤立ノードではない）
- [ ] 複数行アノテーション（使用する場合）がバックスラッシュ継続で正しくパースされる
- [ ] `.internal`変数が出力としてのみ現れ、ファイル間入力としては現れない

## よくある落とし穴

- **クオートのネストエラー**: PUTアノテーションはシングルクオートを使用する: `id:'name'`。ダブルクオートはアノテーションが文字列コンテキスト内にある場合にパースの問題を引き起こす。
- **重複ID**: すべての`id`はスキャンスコープ内でグローバルに一意でなければならない。`<script>_<step>`のような命名規約を使用する（例: `extract_read`、`transform_clean`）。
- **ファイル間入力としての.internal**: `.internal`変数はスクリプト実行中のみ存在する。スクリプト間でデータを渡すには、1つのスクリプトの出力と次のスクリプトの入力として永続化ファイル形式（`.rds`、`.csv`、`.parquet`）を使用する。
- **接続の欠落**: ダイアグラムが切断されたノードを示す場合、あるアノテーションの出力ファイル名が別のアノテーションの入力ファイル名と正確に一致しているか（拡張子を含めて）確認する。
- **誤ったコメントプレフィックス**: SQLファイルで`#`を使用したりPythonで`//`を使用すると、アノテーションがコメントではなくコードとして扱われる。常に`get_comment_prefix()`で確認する。
- **複数行継続の忘れ**: 複数行アノテーションを使用する時、継続されるすべての行は`\`で終わり、次の行はコメントプレフィックスで始まらなければならない。
- **Pythonのトリプルクオート文字列**: putiorはPythonのトリプルクオート文字列（`''' '''`、`""" """`）をスキャンしない。Python PUTアノテーションには常に`#`を使用する。
- **メタパイプラインアノテーション**: アノテーションもスキャンするビルドスクリプト（例: `put()`と`put_diagram()`を呼ぶスクリプト）にアノテーションする場合、そのスクリプト自身のアノテーションが生成されるダイアグラムに表示される。スキャンからファイルを除外する（`generate-workflow-diagram`のよくある落とし穴を参照）か、ビルドスクリプト自体にPUTアノテーションを配置しないようにする。

## 関連スキル

- `analyze-codebase-workflow` — 前提条件: このスキルが従うアノテーション計画を生成する
- `generate-workflow-diagram` — 次のステップ: アノテーションから最終ダイアグラムを生成する
- `install-putior` — アノテーション前にputiorをインストールする必要がある
- `configure-putior-mcp` — MCPツールがインタラクティブなアノテーション支援を提供する
