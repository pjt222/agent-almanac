---
name: evolve-skill-from-traces
description: >
  Evolve SKILL.md files from agent execution traces using a three-stage pipeline:
  trajectory collection from observed runs, parallel multi-agent patch proposal
  for error and success analysis, and conflict-free consolidation of overlapping
  edits via prevalence-weighting. Based on the Trace2Skill methodology.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob Agent
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: advanced
  language: multi
  tags: meta, skill-evolution, traces, multi-agent, consolidation, trace2skill
  locale: ja
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Evolve a Skill from Execution Traces

3 段階パイプラインを通じて、生のエージェント実行トレースを検証された SKILL.md へと変換する: 軌跡収集、並列マルチエージェントパッチ提案、コンフリクトフリー統合。本スキルは、観察されたエージェント挙動と文書化された手順の間のギャップを橋渡しし、成功実行を再現可能なスキルへと変える。

## 使用タイミング

- 実行トレースが既存スキルに捕捉されていない繰り返しパターンを明らかにする
- 観察されたエージェント挙動が文書化された手順を上回っている
- 専門家のデモを記録してゼロからスキルを構築する
- 複数エージェントが同じスキルへ矛盾する改善を提案する

## 入力

- **必須**: `traces` -- エージェント実行ログまたはセッショントランスクリプトのセット（最低 10 の成功実行を推奨）
- **必須**: `target_skill` -- 進化させる既存 SKILL.md のパス、またはゼロからのスキル抽出には `"new"`
- **任意**: `analyst_count` -- 並列に生成するアナリストエージェント数（既定: 4）
- **任意**: `held_out_ratio` -- ドラフトに使われず検証用に予約するトレースの割合（既定: 0.2）

## 手順

### ステップ1: 実行トレースを収集する

ターゲット挙動を示すエージェントセッションログ、ツール呼び出しシーケンス、または会話トランスクリプトを集める。成功とタグ付けされた実行をフィルタする。標準トレース形式に正規化する: タイムスタンプ付きの (state, action, outcome) トリプルのシーケンス。

1. トレース源を特定: セッションログ、ツール呼び出し履歴、会話エクスポート
2. 成功基準でトレースをフィルタ（exit code 0、タスク完了フラグ、ユーザー確認）
3. 各トレースを構造化トリプルのリストに正規化:

```
trace_entry:
  state: <context before the action>
  action: <tool call, command, or decision made>
  outcome: <result, output, or state change>
  timestamp: <ISO 8601>
```

4. トレースを分割: ステップ7 の検証用に `held_out_ratio`（既定 20%）を予約、残りをステップ2-6 に使用

```bash
# Example: count available traces and compute partition
total_traces=$(ls traces/*.json | wc -l)
held_out=$(echo "$total_traces * 0.2 / 1" | bc)
drafting=$((total_traces - held_out))
echo "Drafting: $drafting traces, Held-out: $held_out traces"
```

**期待結果：** ドラフト（80%）と検証用（20%）サブセットに分割された正規化トレースセット。各トレースエントリは state、action、outcome、timestamp フィールドを含む。

**失敗時：** 成功トレースが 10 未満なら、進む前にもっと集める。小さいトレースセットは新規入力で失敗する過剰適合スキルを生む。トレースにタイムスタンプがなければ、代わりに序数シーケンス番号を割り当てる。

### ステップ2: 軌跡をクラスタリングする

正規化されたトレースを結果パターンでグループ化する。不変コア（すべての成功軌跡に存在するステップ）と可変分岐（実行間で異なるステップ）を特定する。不変コアがスキル手順の骨格になる。

1. アクション種別でトレースを整列 -- 各トレースをアクションラベルのシーケンスにマップ
2. すべてのトレース間の最長共通部分列を見つけて不変コアを特定
3. 残るアクションを可変分岐に分類し、どのトレースがそれを含むかとどんな条件下かを記す
4. 分岐頻度を記録: 成功トレースの何パーセントが各可変ステップを含むか

```
invariant_core:
  - action: "read_input_file"
    frequency: 100%
  - action: "validate_schema"
    frequency: 100%
  - action: "transform_data"
    frequency: 100%

variant_branches:
  - action: "retry_on_timeout"
    frequency: 35%
    condition: "network latency > 2s"
  - action: "fallback_to_cache"
    frequency: 15%
    condition: "API returns 503"
```

**期待結果：** 不変コアアクション（すべての成功トレースに存在）と可変分岐（条件的、サブセットに存在）の明確な分離。各可変分岐は頻度カウントとトリガー条件を持つ。

**失敗時：** 不変コアが現れない（トレースが異種すぎる）なら、ターゲット挙動は実は複数の別個スキルかもしれない。結果タイプでトレースを一貫したサブグループに分割し、各グループを別々に処理する。

### ステップ3: スキル骨格をドラフトする

不変コアから、frontmatter、（トレース全体のエントリ条件から導出された）When to Use、（実行間で変動したパラメータの）Inputs、不変アクション 1 つにつき 1 ステップの Procedure セクションを持つ初期 SKILL.md を生成する。

1. 各トレースの最初の状態からエントリ条件を抽出して When to Use を埋める
2. 実行間で変動したパラメータ（ファイルパス、閾値、オプション）を特定して Inputs を埋める
3. 不変コアアクションごとに、トレース全体で最も一般的なフレージングを使い 1 手順ステップを作る
4. 観察された結果に基づくプレースホルダの Expected/On failure ブロックを追加

```bash
# Scaffold the skeleton if creating a new skill
mkdir -p skills/<skill-name>/
```

```markdown
# Skeleton structure
## When to Use
- <derived from common entry conditions>

## Inputs
- **Required**: <parameters present in all traces>
- **Optional**: <parameters present in some traces>

## Procedure
### Step N: <invariant action label>
<most common implementation from traces>

**Expected:** <most common success outcome>
**On failure:** <placeholder -- refined in Steps 4-6>
```

**期待結果：** frontmatter、When to Use、Inputs、不変コアアクションごとに 1 ステップを含む Procedure セクションを持つ、構文的に有効な SKILL.md 骨格。Expected ブロックは観察された結果を反映、On failure ブロックはプレースホルダ。

**失敗時：** 可変分岐を加える前に骨格が 500 行を超えるなら、不変コアが粒度が細かすぎる。常に一緒に起こる隣接アクションを単一ステップにマージする。5-10 手順ステップを目標とする。

### ステップ4: 並列マルチエージェントパッチ提案

N アナリストエージェント（4-6 を推奨）を生成し、各々が異なる解析レンズからドラフト骨格に対して全トレースセットをレビューする。各エージェントは構造化パッチを生成: section、old text、new text、rationale。

アナリスト 1 人につき 1 レンズを割り当てる:

| Analyst | Lens | Focus |
|---------|------|-------|
| 1 | Correctness | Does the skeleton capture all success paths? Are any invariant steps missing? |
| 2 | Efficiency | Are there redundant steps? Can any steps be merged or parallelized? |
| 3 | Robustness | Which failure modes are unhandled? What should On failure blocks contain? |
| 4 | Edge Cases | Which variant branches should become conditional steps or pitfalls? |
| 5 (optional) | Clarity | Is each step unambiguous? Can an agent follow it mechanically? |
| 6 (optional) | Generalizability | Are there trace-specific artifacts that should be abstracted? |

各アナリストエージェントが受け取るもの:
- ステップ3からのドラフト骨格
- 全ドラフトトレースセット（held-out ではない）
- 割り当てられたレンズと焦点質問

各アナリストは構造化パッチのリストを返す:

```
patch:
  analyst: "robustness"
  section: "Procedure > Step 3"
  old_text: "**On failure:** <placeholder>"
  new_text: "**On failure:** If the API returns 503, wait 5 seconds and retry up to 3 times. If retries are exhausted, fall back to the cached response from the previous successful run."
  rationale: "Traces #4, #7, #12 show 503 errors resolved by retry. Trace #15 shows cache fallback when retries fail."
  supporting_traces: [4, 7, 12, 15]
```

**期待結果：** 各アナリストはセクション参照、old/new text、rationale、サポートトレース ID を伴う 3-10 の構造化パッチを返す。すべてのパッチが単一パッチセットに集められる。

**失敗時：** アナリストがパッチを返さなければ、そのレンズはこのスキルに適用されないかもしれない。これは許容 -- すべてのレンズが問題を浮上させるわけではない。アナリストがトレース参照なしの曖昧パッチを返すなら、却下し、具体的な supporting_traces 要件で再プロンプトする。

### ステップ5: コンフリクトを検出し分類する

ステップ4のすべてのパッチを重複編集について比較する。各重複パッチペアを 3 カテゴリの 1 つに分類する。

1. ターゲットセクションでパッチをインデックス
2. 同じセクションを対象とするパッチについて、old_text と new_text を比較
3. 各重複を分類:

| Conflict Type | Definition | Resolution |
|---------------|-----------|------------|
| Compatible | Different sections, no overlap | Merge directly |
| Complementary | Same section, additive (both add content, no contradiction) | Combine text |
| Contradictory | Same section, mutually exclusive (one adds X, other removes X or adds Y instead) | Needs resolution in Step 6 |

```
conflict_report:
  total_patches: 24
  compatible: 18
  complementary: 4
  contradictory: 2
  contradictions:
    - section: "Procedure > Step 5"
      patch_a: {analyst: "efficiency", action: "remove step"}
      patch_b: {analyst: "robustness", action: "add retry logic"}
      supporting_traces_a: [2, 8, 11]
      supporting_traces_b: [4, 7, 12, 15]
```

**期待結果：** すべてのパッチペア、その分類、矛盾については各サイドのサポートトレース数を列挙するコンフリクトレポート。

**失敗時：** 分類が曖昧（パッチが同じセクションでテキストを追加し変更する）なら、2 つのパッチに分割: 1 つは追加、1 つは変更。小さいパッチを再分類する。

### ステップ6: パッチを統合する

3 ティア解決戦略を使ってすべてのパッチを単一統合 SKILL.md にマージする。

1. **互換パッチ**: 直接適用 -- これらは異なるセクションに触れコンフリクトしえない
2. **補完パッチ**: 両パッチからの new_text を、両貢献を保ったまま単一の一貫ブロックに結合
3. **矛盾パッチ**: prevalence-weighting で解決:
   - 各バリアントをサポートするトレース数を数える
   - より多くのトレースに整合するパッチを選好
   - 同点（または互いに 10% 以内）なら、`argumentation` スキルを使ってどのパッチがスキルの述べた目的によりよく仕えるかを評価する
   - 却下された代替を関連 On failure ブロック内の Common Pitfall または注として文書化する

```
consolidation_log:
  applied_directly: 18
  combined: 4
  resolved_by_prevalence: 1
  resolved_by_argumentation: 1
  rejected_alternatives_documented: 2
```

統合後、結果の SKILL.md を検証:
- すべてのセクションが存在（When to Use、Inputs、Procedure、Validation、Common Pitfalls、Related Skills）
- すべての手順ステップに Expected と On failure がある
- 重複または矛盾する指示が残らない
- 行数が 500 行制限内

**期待結果：** すべてのアナリストからのパッチを取り入れた単一統合 SKILL.md。矛盾は文書化された根拠と共に解決される。各矛盾の却下代替が pitfall または注として現れる。

**失敗時：** 統合が内部的に矛盾するドキュメントを生む（例: ステップ3 はファイルが存在すると仮定するが、ステップ2 が efficiency パッチで除去された）なら、コンフリクト編集を戻し、そのセクションには元の骨格テキストを保つ。手動レビュー用に矛盾をフラグする。

### ステップ7: 検証して登録する

統合スキルを held-out トレース（ステップ1で予約された 20%）に対して mentally に動かす。Expected/On failure ブロックがスキルが見たことのないトレースで観察された結果と一致するか検証する。

1. 各 held-out トレースについて、スキル手順をステップ毎に通る
2. 各ステップで、スキルの Expected 結果をトレースの実際の結果と比較
3. マッチと不一致を記録:

```
validation_results:
  held_out_traces: 5
  full_match: 4
  partial_match: 1
  no_match: 0
  mismatches:
    - trace_id: 23
      step: 4
      expected: "API returns 200"
      actual: "API returns 429 (rate limited)"
      action: "Add rate-limit handling to On failure block"
```

4. 不一致率が 20% を超えるなら、不一致トレースをドラフトセットに追加してステップ4 へ戻る
5. スキルが新規なら、ディレクトリ作成、レジストリエントリ、symlink セットアップに `create-skill` に従う
6. 既存スキルを進化させるなら、バージョンバンプと翻訳同期に `evolve-skill` に従う

```bash
# Final validation: line count
lines=$(wc -l < skills/<skill-name>/SKILL.md)
[ "$lines" -le 500 ] && echo "OK ($lines lines)" || echo "FAIL: $lines lines > 500"
```

**期待結果：** 少なくとも 80% の held-out トレースがスキル手順とエンドツーエンドで一致する。スキルが正しいメタデータと共に `skills/_registry.yml` に登録される。

**失敗時：** 検証が失敗（>20% 不一致）なら、スキルがドラフトトレースに過剰適合している。不一致トレースをドラフトセットに追加してステップ2から再実行する。2 反復後も検証が失敗し続けるなら、挙動が単一スキルには可変すぎるかもしれない -- 結果タイプで複数スキルに分割を検討する。

## バリデーション

- [ ] ドラフト前に少なくとも 10 の成功トレースが集められた
- [ ] トレースがドラフト（80%）と held-out（20%）サブセットに分割されている
- [ ] 不変コアと可変分岐が明示的に文書化されている
- [ ] 少なくとも 4 つのアナリストエージェントが異なるレンズから骨格をレビューした
- [ ] すべてのパッチコンフリクトが分類されている（compatible、complementary、contradictory）
- [ ] 矛盾パッチが文書化された根拠と共に解決されている
- [ ] 統合 SKILL.md がすべての必要セクションを Expected/On failure ペアと共に持つ
- [ ] held-out 検証が少なくとも 80% マッチ率を達成している
- [ ] 行数が 500 行制限内
- [ ] スキルが標準手順に従って登録（新規）またはバージョンバンプ（既存）された

## よくある落とし穴

- **トレースが少なすぎる**: 成功実行が 10 未満では、パターン抽出は信頼できない。不変コアが偶発ステップを含むかもしれず、可変分岐は十分な頻度データを欠く。開始前にもっとトレースを集める。
- **トレース成果物への過剰適合**: ツール固有挙動（例: 特定 API クライアントのリトライパターン）は一般化しないかもしれない。ステップ3 で、ツール固有アクションをツール非依存記述へ抽象化する。スキルは *何を* するかを記述すべきで、*どのツールを* 使うかではない。
- **失敗トレースの無視**: 失敗トレースはスキルが On failure ブロックで何を警告すべきかを明らかにする。ステップ1 で失敗実行も集めてタグ付けする。robustness アナリストが未対応失敗モードを評価するときステップ4 でそれらを使う。
- **単一レンズ解析**: 1-2 アナリストだけを使うと重要な視点を逃す。efficiency アナリスト単独では robustness アナリストが保つ安全チェックを剥ぎ取る。バランスのとれたカバレッジには少なくとも 4 つの異なるレンズを使う。
- **解決なしに矛盾パッチをマージ**: 矛盾の両サイドを適用すると内部的に矛盾するスキルを生む（例: あるステップで「X をする」、別のステップで「X をスキップする」）。常にステップ6 で矛盾を明示的に分類し解決する。
- **held-out トレースに対する検証なし**: held-out 検証なしには、統合スキルがドラフトトレースに完璧に適合するが新規実行で失敗するかもしれない。常にトレースの 20% を予約し最終スキルをそれらに対してテストする。

## 関連スキル

- `evolve-skill` -- より単純な人間指示の進化（補完: トレースが利用不能なときに使う）
- `create-skill` -- まだ存在しない新規抽出スキル用; ステップ7 で登録に使用
- `review-skill-format` -- 統合後の検証で agentskills.io 準拠を保証
- `argumentation` -- prevalence が同点のとき矛盾パッチを解決するのにステップ6 で使用
- `verify-agent-output` -- パッチ提案の証拠跡; ステップ4 でアナリスト出力を検証
