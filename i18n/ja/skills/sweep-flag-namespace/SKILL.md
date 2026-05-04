---
name: sweep-flag-namespace
description: >
  バイナリの名前空間からあらゆるフラグ候補を一括抽出し、出現回数と
  呼び出し種別タグを付与した抽出インベントリを構築し、ドキュメント化済み
  集合と相互参照し、調査キャンペーン全体にわたって未ドキュメント残数が
  ゼロに達するまで網羅性を追跡する。名前空間プレフィックスの収集、
  呼び出し箇所単位でのゲート対テレメトリの曖昧性解消、網羅性メトリクス、
  DEFAULT-TRUE 集団の報告、最終的な完了確認スキャンを扱う。サンプルでは
  なく完全なカタログが必要なとき、または波単位で進行した過去の
  キャンペーンに検証可能な終了条件が必要なときに、probe-feature-flag-state
  の上流として使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: reverse-engineering, feature-flags, completeness, sweep, inventory
  locale: ja
  source_locale: en
  source_commit: 90b159ab
  translator: "Claude + human review"
  translation_date: "2026-05-04"
---

# Sweep Flag Namespace

バイナリの名前空間からあらゆるフラグ候補を網羅的に抽出し、ゲート呼び出しとテレメトリを分離し、進行中のドキュメント化済み集合に対して未ドキュメント残数がゼロになるまで網羅性を追跡する。`probe-feature-flag-state` が一度に一つのフラグを分類するのに対し、本スキルはそれらの調査が対象とするカタログそのものを作り出し、カタログがいつ完成したかを確認する。

## 使用タイミング

- フラグ発見キャンペーンが進行中で、フラグが「十分」かどうかを推測するのではなく、検証可能な停止条件が必要なとき。
- バイナリのフラグ名前空間が大規模(候補文字列が数百個)で、サンプルベースの手法では意味のあるゲートを取りこぼすリスクがあるとき。
- DEFAULT-TRUE のフラグを DEFAULT-FALSE と分離して報告する必要があるとき。これは通常、任意の名前空間における高シグナル部分集合となる。
- バイナリに対して複数波のドキュメント化を実施しており、各波の完了メトリクスを書面で残したいとき。
- 過去のキャンペーンが早期終了した疑いがあり、新たなスイープでそれを確認または反証する必要があるとき。

## 入力

- **必須**: 読み取り可能なバイナリまたはバンドルファイル。
- **必須**: 調査対象システムに属するフラグを識別する名前空間プレフィックス(合成例: `acme_*`)。
- **必須**: 作業中のドキュメンテーション集合 — これまでにキャンペーンで作成したフラグ解説の進行中リスト。
- **任意**: ゲートリーダー関数名(合成例: `gate(...)`, `flag(...)`, `isEnabled(...)`)。事前に算出しておくとステップ 2 が高速化する。
- **任意**: テレメトリ/emit 関数名。同じ理由、ただし反対の符号で機能する。
- **任意**: 同じバイナリの過去バージョンに対する以前のスイープ出力。差分分析に使う。

## 手順

### Step 1: 名前空間プレフィックスに一致するすべての文字列を収集する

呼び出し箇所での役割に関係なく、名前空間プレフィックスに一致するバイナリ内のすべてのリテラルを抽出する。このステップの目標は分類ではなく*網羅性*である。

```bash
BUNDLE=/path/to/cli/bundle.js
PREFIX=acme_                       # synthetic placeholder

# Pull every quoted string starting with the prefix
grep -oE "\"${PREFIX}[a-zA-Z0-9_]+\"" "$BUNDLE" | sort -u > /tmp/sweep-candidates.txt
wc -l /tmp/sweep-candidates.txt    # unique candidate count

# Per-string occurrence count (gives a first hint at gate-call density)
grep -oE "\"${PREFIX}[a-zA-Z0-9_]+\"" "$BUNDLE" | sort | uniq -c | sort -rn > /tmp/sweep-occurrences.txt
head /tmp/sweep-occurrences.txt
```

**期待結果：** 重複排除された候補リストと、頻度でソートされた出現ファイルが得られる。出現回数が非常に多い文字列(10 回以上)はゲート呼び出し密度の高い文字列を示唆し、1 回しか出現しない文字列はテレメトリのイベント名や静的ラベルである可能性が高い。

**失敗時：** ユニーク件数が 0 の場合、プレフィックスが誤っている(タイプミス、名前空間境界の不一致、ハーネスが想定と異なる規約を使用している)。件数が約 5000 を超える場合、プレフィックスが広すぎる — 続行する前に絞り込まないとインベントリが手に負えなくなる。

### Step 2: ゲート呼び出し、テレメトリ、静的ラベルの曖昧性を解消する

同じ文字列でも役割は異なる。呼び出し箇所で役割を区別することがインベントリを実用的にする。`probe-feature-flag-state` のステップ 2 にある曖昧性解消の流儀を再利用する。

各候補について、出現箇所ごとに分類する：

- **gate-call** — 文字列がゲートリーダー関数の第 1 引数になっている(`gate("$FLAG", default)`、`flag("$FLAG", ...)`、`isEnabled("$FLAG")` など)。
- **telemetry-call** — 文字列が emit/log/track 関数の第 1 引数になっている。
- **env-var-check** — 文字列が `process.env.X` 参照またはそれに相当する箇所に現れる。
- **static-label** — 文字列がレジストリ、マップ、コメント中に現れ、振る舞いとの結びつきがない。

```bash
# Count gate-call occurrences for the candidate set, using a synthetic
# reader-name pattern. Adapt the regex to the actual reader names found.
GATE_PATTERN='(gate|flag|isEnabled)\(\s*"acme_'
grep -coE "$GATE_PATTERN" "$BUNDLE"

# Per-flag gate-call count
while read -r flag; do
  flag_no_quotes="${flag//\"/}"
  count=$(grep -coE "(gate|flag|isEnabled)\(\s*\"${flag_no_quotes}\"" "$BUNDLE")
  echo -e "${flag_no_quotes}\t${count}"
done < /tmp/sweep-candidates.txt > /tmp/sweep-gate-counts.tsv
```

**期待結果：** ユニーク文字列ごとに `{flag, total_occurrences, gate_call_count, telemetry_count, static_label_count, env_var_count}` 形式のインベントリレコードが得られる。ゲート呼び出し件数が実用上意味のある列であり、その他はノイズフィルタとして機能する。

**失敗時：** すべての候補でゲート呼び出しヒットがゼロの場合、ゲートリーダーパターンが誤っている。バイナリがこの正規表現で取りこぼされるリーダー関数を使っているか、その名前空間が完全にテレメトリ用(そもそもフラグ名前空間ではない)である。このステップを再実行する前に、いくつかの候補に対して `decode-minified-js-gates` を実行し、実際のリーダー名を学習する。

### Step 3: 抽出インベントリを構築する

文字列単位のレコードを 1 つのインベントリ成果物に統合する。CSV か JSONL — どちらかを選び、波をまたいだ差分比較のために首尾一貫させる。

```bash
# JSONL inventory
{
  while IFS=$'\t' read -r flag gate_count; do
    [ "$gate_count" -gt 0 ] || continue   # skip strings with no gate-call evidence
    total=$(grep -c "\"${flag}\"" "$BUNDLE")
    telem=$((total - gate_count))         # rough; refine if other call types matter
    printf '{"flag":"%s","total":%d,"gate_calls":%d,"telemetry":%d,"documented":false}\n' \
      "$flag" "$total" "$gate_count" "$telem"
  done < /tmp/sweep-gate-counts.tsv
} > /tmp/sweep-inventory.jsonl

wc -l /tmp/sweep-inventory.jsonl    # gate-bearing flag count
```

派生的に重要な 2 つの件数：

- **`total_unique`**: プレフィックスに一致したすべての文字列(ゲートフィルタ前)
- **`gate_calls`**: 少なくとも 1 つのゲート呼び出し出現を持つ部分集合 — これがキャンペーンの作業セットとなる

**期待結果：** ゲートを担うユニークなフラグごとに 1 レコードを持つインベントリファイル。ゲート件数は通常 `total_unique` の一部分(よくあるのは 5〜20%)であり、両者の数値は明確に異なるはずである。

**失敗時：** インベントリが空、または `gate_calls` ≈ `total_unique` となる場合、ステップ 2 のゲート対テレメトリの曖昧性解消が無意味な分割を生んでいる。リーダー名の正規表現を見直す。

### Step 4: ドキュメント化済み集合との相互参照

網羅性メトリクスはドキュメント化済み集合 — 調査成果物として既に書き上げたフラグ — に依存する。相互参照を行い、残りを報告する。

```bash
DOCUMENTED=/path/to/research/documented-flags.txt   # one flag name per line

# Extract gate-bearing flag names from the inventory
jq -r '.flag' /tmp/sweep-inventory.jsonl | sort -u > /tmp/sweep-extracted.txt

# Compute the documented and remaining sets
sort -u "$DOCUMENTED" > /tmp/sweep-documented.txt
comm -23 /tmp/sweep-extracted.txt /tmp/sweep-documented.txt > /tmp/sweep-remaining.txt

echo "Extracted (gate-bearing):  $(wc -l < /tmp/sweep-extracted.txt)"
echo "Documented:                $(wc -l < /tmp/sweep-documented.txt)"
echo "Remaining (undocumented):  $(wc -l < /tmp/sweep-remaining.txt)"
```

網羅性メトリクスは `remaining` であり、これが 0 に達したとき、ドキュメント化済み集合は名前空間内のすべてのゲート担保フラグをカバーしている。

**期待結果：** 3 つの件数が得られる。キャンペーン初期では `remaining` は `extracted` のかなりの割合を占めるはずである。各波で `remaining` が減少し、最終的に 0 に収束する。プラトー(既にドキュメント化されたフラグを再調査して進まなくなった波)を検出するため、波をまたいで軌跡を追跡する。

**失敗時：** `documented` が `extracted` を上回る場合、ドキュメント化済み集合に古いエントリ(現バイナリで削除されたフラグ)が含まれている。代わりに `comm -13` を計算して廃止されたドキュメント名を浮かび上がらせ、次のキャンペーン成果物では REMOVED として保管する。

### Step 5: DEFAULT-TRUE 集団を報告する

ゲート担保のフラグ集合内で、バイナリのデフォルトが `true` のフラグと、`false`(または非ブール)のフラグを分離する。DEFAULT-TRUE のフラグはサーバー側の上書きなしですべてのユーザーに対して有効であり、任意の名前空間における最高シグナルの部分集合となる。

```bash
# Heuristic: gate-call shape `gate("flag_name", true)` indicates DEFAULT-TRUE
DEFAULT_TRUE_PATTERN='(gate|flag|isEnabled)\(\s*"acme_[a-zA-Z0-9_]+",\s*!?true\b'
grep -oE "$DEFAULT_TRUE_PATTERN" "$BUNDLE" | grep -oE '"acme_[a-zA-Z0-9_]+"' | sort -u > /tmp/sweep-default-true.txt

DEFAULT_FALSE_PATTERN='(gate|flag|isEnabled)\(\s*"acme_[a-zA-Z0-9_]+",\s*false\b'
grep -oE "$DEFAULT_FALSE_PATTERN" "$BUNDLE" | grep -oE '"acme_[a-zA-Z0-9_]+"' | sort -u > /tmp/sweep-default-false.txt

echo "DEFAULT-TRUE:  $(wc -l < /tmp/sweep-default-true.txt)"
echo "DEFAULT-FALSE: $(wc -l < /tmp/sweep-default-false.txt)"
```

非ブールデフォルト(設定オブジェクト、TTL リーダー、非同期リーダー)を持つフラグについては、`decode-minified-js-gates` を使ってリーダーバリアントを分類する。これらは異なるデフォルト形状を生むため、独自のバケットで報告すべきである。

**期待結果：** 一般的な分割は DEFAULT-TRUE が 10〜20%、DEFAULT-FALSE が 80〜90%。極端な値(TRUE が 90%以上または FALSE が 90%以上)は珍しく調査の価値がある — リリース段階の規約(テスト用にすべてデフォルト ON、段階的ロールアウト用にすべてデフォルト OFF)を示している可能性がある。

**失敗時：** DEFAULT-TRUE と DEFAULT-FALSE の合計がゲート担保インベントリをカバーしない場合、残りは非ブールリーダーを使っている。そのギャップに対して `decode-minified-js-gates` を実行し、使われているリーダーバリアントを分類する。

### Step 6: 完了を確認する

ステップ 4 で `remaining = 0` となったら、最終スキャンを実行する：ドキュメント化済み集合に含まれていない、名前空間に一致する文字列のゲート呼び出し出現を検索する。これによってステップ 1 の収集で見落とされたフラグ(例えば、文字列連結によって単純な grep からリテラルが隠されている場合)を捕捉できる。

```bash
# Search for gate-call shapes containing the namespace prefix, not constrained
# to literal-string occurrences. Loosens Step 1's grep to catch dynamic forms.
DYNAMIC_PATTERN='(gate|flag|isEnabled)\(\s*[^"]*"acme_'
grep -nE "$DYNAMIC_PATTERN" "$BUNDLE" | head -50

# Alternative: ripgrep with multiline for split-string concatenation
rg -U "(gate|flag|isEnabled)\(\s*\"acme_(\\\\\"|[a-zA-Z0-9_])+\"" "$BUNDLE"
```

ゲート呼び出しヒットを `/tmp/sweep-documented.txt` と比較する。ドキュメント化済み集合にないフラグを参照するヒットがあれば、抽出を改良(例: 動的構築のケースを処理)してステップ 1 に戻る。空であれば、キャンペーンは完了である。

**期待結果：** 最終スキャンは空(キャンペーン完了)か、わずかな残り(通常 5 件未満。動的構築や代替リーダーが浮かぶことが多い)を返す。

**失敗時：** ステップ 4 で `remaining = 0` だったのに最終スキャンで大きな残りが返る場合、ステップ 1 が体系的に過小抽出している。見落とされたパターン(動的文字列、別の引用符、別のリーダー関数)を調査し、より精緻化された正規表現でステップ 1 から再実行する。

## バリデーション

- [ ] ステップ 1 のユニーク件数が非ゼロであり、期待値とオーダーが一桁以内に収まっている
- [ ] ステップ 2 が意味のあるゲート対テレメトリの分割を生む(ゲート呼び出し件数が全出現数の一部であり、全件でも 0 件でもない)
- [ ] ステップ 3 のインベントリがゲート担保フラグごとに 1 レコード、CSV または JSONL である
- [ ] ステップ 4 が `total_unique`、`gate_calls`、`documented`、`remaining` を報告し、キャンペーン終了時にメトリクスが 0 に到達する
- [ ] ステップ 5 で DEFAULT-TRUE と DEFAULT-FALSE が別々に報告される
- [ ] ステップ 6 の最終スキャンがキャンペーン完了宣言の前に空を返す
- [ ] すべての作業例が合成プレースホルダ(`acme_*`、`gate(...)` など)を使い、実際のフラグ名やリーダー名が成果物に漏れていない
- [ ] スイープ出力が過去バージョンのスイープと差分比較可能である(同じ形状、同じフィールド)

## よくある落とし穴

- **スイープではなくサンプルで止める**: 「十分なフラグをドキュメント化した」と言って `remaining` を計算せずに終わるキャンペーンはスイープではなくサンプリングである。本スキルの存在意義は検証可能な終了条件にある。
- **ゲート担保と全抽出を混同する**: 名前空間内のほとんどの文字列はゲートではない。`total_unique` をキャンペーンの分母として報告すると作業量が水増しされ、見かけの完了率が下がる。分母には `gate_calls` を使う。
- **バージョンをまたいで 1 つの正規表現パターンを信じる**: ゲートリーダー関数名はメジャーバージョン間で変わることがある。新しいバイナリに対する新たなスイープを始めるときは、ステップ 2 のパターンを再検証する。
- **ステップ 6 を省略する**: 最終的な動的スキャンなしで `remaining = 0` をもって完了を宣言すると、文字列連結で構築されたフラグを見逃す可能性がある。最終スキャンは安価であり、恥ずかしい見落としを捕捉する。
- **実名を漏らす**: インベントリから実際のフラグ名をスキルの作業例に誤って貼り付けてしまうことは容易に起こる。プレースホルダの規律(`acme_*`)はそのために存在する — 方法論と発見内容を切り離す。
- **古いドキュメント化済み集合との相互参照**: ドキュメント化済み集合が古いバイナリに対して構築されている場合、削除されたフラグは「ドキュメント化済み」として現れるが抽出されず、本当に未ドキュメントのフラグが残りに見える。相互参照の前に、現行バイナリに対してドキュメント化済み集合を更新する。

## 関連スキル

- `probe-feature-flag-state` — フラグ単位の分類(本スキルのインベントリの下流)
- `decode-minified-js-gates` — スイープ途中でリーダーバリアントの分類が必要なとき
- `monitor-binary-version-baselines` — バイナリバージョンをまたぐ縦断的追跡。各ベースラインに対してスイープを再実行できる
- `redact-for-public-disclosure` — インベントリ自体を漏らさずにスイープから方法論を公開する方法
- `conduct-empirical-wire-capture` — スイープが浮かべたフラグの経験的検証
