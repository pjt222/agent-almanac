---
name: verify-agent-output
description: >
  エージェント間で作業が受け渡される際に成果物を検証し、エビデンストレイルを構築する。
  実行前の期待される結果の仕様定義、実行中の構造化されたエビデンス生成、実行後の外部アンカーに対する
  成果物のバリデーション、圧縮または要約された出力の忠実度チェック、信頼境界の分類、
  バリデーション失敗時の構造化された不一致報告をカバーする。マルチエージェントワークフローの調整、
  エージェント間のハンドオフのレビュー、外部向け出力の生成、またはエージェントの要約がソース素材を
  忠実に表現しているかの監査時に使用する。
locale: ja
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: "2026-03-16"
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: verification, trust, evidence-trail, deliverable-validation, inter-agent, quality-assurance
---

# Verify Agent Output

エージェント間で検証可能な受け渡しを確立する。あるエージェントが別のエージェントが消費する出力を生成する場合 — または人間が依存する場合 — ハンドオフには「良さそうだ」以上のものが必要だ。このスキルは、作業開始前にチェック可能な期待を定義し、作業の副作用としてエビデンスを生成し、自己評価ではなく外部アンカーに対して成果物を検証するという実践を体系化する。核心原則：忠実度は内部で測定できない。エージェントは自身の圧縮された出力を確実に検証できない；検証には外部参照点が必要だ。

## 使用タイミング

- マルチエージェントワークフローがあるエージェントから別のエージェントに成果物を受け渡す場合
- エージェントが人間が依存する外部向け出力（レポート、コード、デプロイメント）を生成する場合
- エージェントがデータを要約、圧縮、または変換し、要約がソースを忠実に表現する必要がある場合
- チーム調整パターンがメンバー間の構造化されたハンドオフバリデーションを必要とする場合
- 信頼境界を確立する必要がある場合 — 何を検証する必要があり、何を信頼できるかを決定する
- コンプライアンスまたは再現性のために監査トレイルが必要な場合

## 入力

- **必須**: 検証する成果物（ファイル、アーティファクト、レポート、または構造化出力）
- **必須**: 期待される結果の仕様（「完了」がどのようなものかの定義）
- **任意**: ソース素材（要約または変換の忠実度チェック用）
- **任意**: 信頼境界の分類（`cross-agent`、`external-facing`、`internal`）
- **任意**: バリデーションの深さ（`spot-check`、`full`、`sample-based`）

## 手順

### ステップ1: 期待される結果の仕様を定義する

実行が始まる前に、「完了」がどのようなものかを具体的でチェック可能な条件のセットとして書き留める。主観的な基準（「良い品質」）は、検証可能なアサーションで置き換える。

チェック可能な条件のカテゴリ：

- **存在**: ファイルがパスに存在する、エンドポイントが応答する、データベースにレコードが存在する
- **形状**: 出力がN列を持つ、JSONがスキーマに一致する、関数が期待されるシグネチャを持つ
- **内容**: 値が範囲内にある、文字列がパターンに一致する、リストに必要な項目が含まれる
- **動作**: テストスイートがパスする、コマンドが0で終了する、APIが期待されるステータスコードを返す
- **一貫性**: 出力ハッシュが入力ハッシュと一致する、変換後に行数が保持される、合計が一致する

仕様の例：

```yaml
expected_outcome:
  existence:
    - path: "output/report.html"
    - path: "output/data.csv"
  shape:
    - file: "output/data.csv"
      columns: ["id", "name", "score", "grade"]
      min_rows: 100
  content:
    - file: "output/data.csv"
      column: "score"
      range: [0, 100]
    - file: "output/report.html"
      contains: ["Summary", "Methodology", "Results"]
  behavior:
    - command: "Rscript -e 'testthat::test_dir(\"tests\")'"
      exit_code: 0
  consistency:
    - check: "row_count"
      source: "input/raw.csv"
      target: "output/data.csv"
      tolerance: 0
```

**期待結果：** 成果物ごとに少なくとも1つのチェック可能な条件を持つ書面による仕様。すべての条件は機械的に検証可能（スクリプトまたはコマンドでチェックできる、読んで判断するだけでなく）。

**失敗時：** 期待される結果を具体的に述べることができない場合、タスク自体が不十分に指定されている。進める前にタスク定義にフィードバックを送る — 曖昧な期待は検証不可能な作業を生む。

### ステップ2: 実行中にエビデンストレイルを生成する

作業が進む中で、作業を行う副作用として構造化されたエビデンスを発行する。エビデンストレイルは別のバリデーションステップではない — 実行自体によって生成される。

キャプチャするエビデンスの種類：

```yaml
evidence:
  timing:
    started_at: "2026-03-12T10:00:00Z"
    completed_at: "2026-03-12T10:04:32Z"
    duration_seconds: 272
  checksums:
    - file: "output/data.csv"
      sha256: "a1b2c3..."
    - file: "output/report.html"
      sha256: "d4e5f6..."
  test_results:
    total: 24
    passed: 24
    failed: 0
    skipped: 0
  diff_summary:
    files_changed: 3
    insertions: 47
    deletions: 12
  tool_versions:
    r: "4.5.2"
    testthat: "3.2.1"
```

エビデンスを生成するための実用的なコマンド：

```bash
# Checksums
sha256sum output/data.csv output/report.html > evidence/checksums.txt

# Row counts
wc -l < input/raw.csv > evidence/input_rows.txt
wc -l < output/data.csv > evidence/output_rows.txt

# Test results (R)
Rscript -e "results <- testthat::test_dir('tests'); cat(format(results))" > evidence/test_results.txt

# Git diff summary
git diff --stat HEAD~1 > evidence/diff_summary.txt

# Timing (wrap the actual command)
start_time=$(date +%s)
# ... do the work ...
end_time=$(date +%s)
echo "duration_seconds: $((end_time - start_time))" > evidence/timing.txt
```

**期待結果：** 生成されたすべてのアーティファクトについて少なくともチェックサムとタイミングを含む `evidence/` ディレクトリ（または構造化ログ）。エビデンスは作業の一部として生成され、事後に再構成されない。

**失敗時：** エビデンス生成が実行を妨げる場合、作業をブロックすることなく可能な範囲でキャプチャする。最低限、完了後にファイルチェックサムを記録する — これにより、リアルタイムのエビデンスがキャプチャされなかった場合でも後の検証が可能になる。

### ステップ3: 期待される結果に対して成果物を検証する

実行後、ステップ1の仕様に対して成果物をチェックする。生成したエージェントに「これは正しいですか？」と尋ねるのではなく、外部アンカー（テストスイート、スキーマバリデーター、チェックサム、行数）を使用する。

カテゴリ別のバリデーションチェック：

```bash
# Existence
for file in output/report.html output/data.csv; do
  test -f "$file" && echo "PASS: $file exists" || echo "FAIL: $file missing"
done

# Shape (CSV column check)
head -1 output/data.csv | tr ',' '\n' | sort > /tmp/actual_cols.txt
echo -e "grade\nid\nname\nscore" > /tmp/expected_cols.txt
diff /tmp/expected_cols.txt /tmp/actual_cols.txt && echo "PASS: columns match" || echo "FAIL: column mismatch"

# Row count
actual_rows=$(wc -l < output/data.csv)
[ "$actual_rows" -ge 101 ] && echo "PASS: $actual_rows rows (>= 100 + header)" || echo "FAIL: only $actual_rows rows"

# Content range check (R)
Rscript -e '
  d <- read.csv("output/data.csv")
  stopifnot(all(d$score >= 0 & d$score <= 100))
  cat("PASS: all scores in [0, 100]\n")
'

# Behavior
Rscript -e "testthat::test_dir('tests')" && echo "PASS: tests pass" || echo "FAIL: tests fail"

# Consistency (row count preserved)
input_rows=$(wc -l < input/raw.csv)
output_rows=$(wc -l < output/data.csv)
[ "$input_rows" -eq "$output_rows" ] && echo "PASS: row count preserved" || echo "FAIL: $input_rows -> $output_rows"
```

**期待結果：** すべてのチェックがパスする。結果はステップ2のエビデンストレイルとともに構造化出力（条件ごとに PASS/FAIL）として記録される。

**失敗時：** 部分的なパスをサイレントに受け入れない。FAIL はステップ6の構造化された不一致プロセスをトリガーする。どのチェックがパスしてどれが失敗したかを記録する — 部分的な結果でも価値あるエビデンスだ。

### ステップ4: 圧縮された出力の忠実度チェックを実行する

エージェントがデータを要約、圧縮、または変換する場合、設計上出力は入力より小さい。要約だけを読んでも要約を検証できない — ソースと比較する必要がある。サンプルベースのスポットチェックを使用して忠実度を検証する。

手順：

1. ソース素材からランダムサンプルを選択する（スポットチェックには3〜5項目、徹底的なチェックには10%）
2. サンプルとして選ばれた各項目について、圧縮された出力で正確に表現されていることを確認する
3. 捏造されたコンテンツを確認する — ソースのない出力内の項目

```bash
# Example: verify a summary report against source data

# 1. Select random rows from source
shuf -n 5 input/raw.csv > /tmp/sample.csv

# 2. For each sampled row, verify it appears correctly in the output
while IFS=, read -r id name score grade; do
  grep -q "$id" output/report.html && echo "PASS: $id found in report" || echo "FAIL: $id missing from report"
done < /tmp/sample.csv

# 3. Check for fabricated IDs in the output
# Extract IDs from output, verify each exists in source
grep -oP 'id="[^"]*"' output/report.html | while read -r output_id; do
  grep -q "$output_id" input/raw.csv && echo "PASS: $output_id has source" || echo "FAIL: $output_id fabricated"
done
```

正確なマッチングが不可能なテキスト要約の場合、重要な主張を確認する：

- 引用された統計がソースデータと一致する
- 要約で言及されている名前付きエンティティがソースに存在する
- 因果関係の主張やランキングが基礎データによって支持されている
- ソースに存在しない項目が要約に現れない

**期待結果：** サンプルとして選ばれたすべての項目が正確に表現されている。捏造されたコンテンツが検出されない。要約内の重要な統計がソースから計算された値と一致する。

**失敗時：** 忠実度チェックが失敗した場合、要約は信頼できない。ステップ6の構造化された不一致フォーマットを使用して特定の不一致を報告する。生成したエージェントはソースから要約を再導出しなければならない — 既存の出力をパッチするのではなく。

### ステップ5: 信頼境界を分類する

すべてのものを検証する必要はない。過度な検証もコストだ — 実行を遅らせ、複雑さを増し、検証プロセス自体への誤った信頼を生む可能性がある。重要な場所に検証の努力を集中させるために、出力を信頼レベルで分類する。

信頼境界の分類：

| 境界 | 必要な検証 | 例 |
|----------|----------------------|----------|
| **Cross-agent handoff** | あり — 常に | エージェントAがエージェントBが消費するデータを生成する；チームメンバーがリードに成果物を渡す |
| **External-facing output** | あり — 常に | 人間に届けられるレポート、デプロイされたコード、公開されたパッケージ、APIレスポンス |
| **Compressed/summarized** | あり — サンプルベース | 設計上入力より小さい出力（要約、集計、抽出） |
| **Internal intermediate** | なし — チェックサムで信頼 | 一時ファイル、中間計算結果、ステップ間の内部状態 |
| **Idempotent operations** | なし — 一度検証 | 設定ファイルの書き込み、決定論的変換、既知の入力を持つ純粋関数 |

検証を比例的に適用する：

- **Cross-agent handoffs**: 期待される結果仕様に対する完全バリデーション（ステップ3）
- **External-facing outputs**: 要約された場合は完全バリデーションと忠実度チェック（ステップ3〜4）
- **Internal intermediates**: チェックサムのみ記録（ステップ2）— 下流で失敗した場合にオンデマンドで検証
- **Idempotent operations**: 最初の実行で検証、再実行では信頼

**期待結果：** ワークフロー内の各成果物が信頼境界カテゴリの1つに分類される。検証の努力がクロスエージェントおよび外部向けの境界に集中している。

**失敗時：** 疑わしい場合は検証する。誤った信頼のコスト（悪い出力の受け入れ）は、不必要な検証のコストをほぼ常に上回る。デフォルトで検証し、境界が安全であるというエビデンスがある場合にのみ緩和する。

### ステップ6: 失敗時に構造化された不一致を報告する

バリデーションが失敗した場合、出力をサイレントに受け入れるかサイレントに拒否するのではなく、構造化された不一致を生成する。構造化された不一致は失敗をアクション可能にする — 生成エージェント（または人間）に何が期待され、何が受け取られ、ギャップがどこにあるかを正確に伝える。

不一致のフォーマット：

```yaml
verification_result: FAIL
deliverable: "output/data.csv"
timestamp: "2026-03-12T10:04:32Z"
failures:
  - check: "row_count"
    expected: 500
    actual: 487
    severity: warning
    note: "13 rows dropped — investigate filter logic"
  - check: "score_range"
    expected: "[0, 100]"
    actual: "[-3, 100]"
    severity: error
    note: "3 negative scores found — data validation missing"
  - check: "column_presence"
    expected: "grade"
    actual: null
    severity: error
    note: "grade column missing from output"
passes:
  - check: "file_exists"
  - check: "checksum_stable"
  - check: "test_suite"
recommendation: >
  Re-run with input validation enabled. The score_range and column_presence
  failures suggest the transform step is not handling edge cases. Do not
  patch the output — fix the transform and re-execute from source.
```

不一致報告の主要原則：

- **具体的に**: 「42、187、301行目に3つの負のスコアが見つかった」、「一部の値が間違っている」ではなく
- **期待値と実際の値の両方を含める**: その間のギャップが重要
- **重大度を分類する**: `error`（受け入れをブロック）、`warning`（注意書き付きで受け入れ）、`info`（記録として注意）
- **アクションを推奨する**: 修正して再実行 vs. 注意書き付きで受け入れ vs. 完全に拒否
- **サイレントに受け入れない**: 社会的信頼（「他のエージェントは大丈夫だと言った」）は攻撃ベクターだ。アサーションではなくエビデンスを信頼する。

**期待結果：** すべてのバリデーション失敗が、少なくとも次を含む構造化された不一致を生成する：失敗したチェック、期待値、実際の値、および重大度の分類。

**失敗時：** バリデーションプロセス自体が失敗した場合（例: バリデーションスクリプトがエラーになる）、それをメタ失敗として報告する。検証できないことそれ自体が発見事項 — それは成果物が現在の形では検証不可能であることを意味し、これは既知の失敗より悪い。

## バリデーション

- [ ] 実行開始前に期待される結果の仕様が存在する
- [ ] 仕様に機械的に検証可能な条件のみが含まれている（主観的な基準なし）
- [ ] 実行中にエビデンストレイルが生成される（チェックサム、タイミング、テスト結果）
- [ ] エビデンスは作業の副作用であり、事後のステップではない
- [ ] 成果物が外部アンカー（テスト、スキーマ、チェックサム）に対して検証される
- [ ] いかなる成果物も生成者に「これは正しいですか？」と尋ねることで検証されない
- [ ] 圧縮または要約された出力にサンプルベースの忠実度チェックが含まれる
- [ ] 忠実度チェックが要約自体ではなくソース素材と比較される
- [ ] 信頼境界が分類されている（cross-agent、external、internal）
- [ ] 検証の努力が信頼境界の重大度に比例している
- [ ] バリデーション失敗が構造化された不一致（期待値 vs. 実際値）を生成する
- [ ] バリデーション失敗がサイレントに受け入れまたは拒否されない

## よくある落とし穴

- **生成者に尋ねて出力を検証する**: エージェントは自分の作業を確実に検証できない。「チェックして正しそうに見えた」は検証ではない — 外部アンカー（テスト、チェックサム、スキーマ）が検証だ。rtamindが観察するように：忠実度は内部で測定できない。
- **内部中間物の過度な検証**: すべての一時ファイルと中間結果を検証すると、信頼性を向上させることなくオーバーヘッドが追加される。信頼境界を分類し（ステップ5）、クロスエージェントおよび外部向け出力に検証を集中させる。
- **主観的な期待される結果**: 「レポートは高品質であるべきだ」はチェック可能ではない。「レポートにはSummary、Methodology、Resultsのセクションが含まれ、引用されたすべての統計がソースから計算された値と一致する」はチェック可能だ。チェックを書けないなら検証できない。
- **事後のエビデンス再構成**: 事後にエビデンスを生成する（「自分が生成したと思うもののチェックサムを計算させてください」）は信頼できない。エビデンスは実行の副作用でなければならず、リアルタイムでキャプチャされる必要がある。再構成されたエビデンスは現在存在するものを証明するだけで、生成されたものを証明しない。
- **バリデーションを絶対視する**: バリデーション自体にバグがある可能性がある。パスするテストスイートはコードが正しいことを意味しない — コードがテストを満たすことを意味する。バリデーションを比例的に保ち、緑色のチェックを絶対的な真実として扱うのではなく、その限界を認める。
- **部分的なパスをサイレントに受け入れる**: 10個中9個のチェックがパスしても、成果物はまだ失敗している。1つの失敗を構造化された不一致として報告する。部分的なクレジットは採点のためのもの；成果物の受け渡しはバイナリだ。
- **社会的信頼を代替として**: 「エージェントAは信頼できるので検証をスキップする」は攻撃ベクターだ。Sentinel_Orolが指摘するように、検証なしの信頼は悪用可能だ。生成者の評判ではなく、境界の分類に基づいて検証する。

## 関連スキル

- `fail-early-pattern` — 補完的：fail-early は最初に悪い入力をキャッチする；verify-agent-output は最後に悪い出力をキャッチする
- `security-audit-codebase` — 重複する関心事：セキュリティ監査はコードがセキュリティ要件を満たすことを確認し、成果物バリデーションの特定のケースだ
- `honesty-humility` — 補完的：誠実なエージェントは不確実性を認め、バリデーションギャップを隠すのではなく見えるようにする
- `review-skill-format` — verify-agent-output は生成された SKILL.md がフォーマット要件を満たすことを検証でき、成果物バリデーションの具体的なインスタンスだ
- `create-team` — 複数のエージェントを調整するチームは各調整ステップで構造化されたハンドオフバリデーションから恩恵を受ける
- `test-team-coordination` — チームのハンドオフが検証可能な成果物を生成するかテストし、このスキルの手順をエンドツーエンドで実行する
