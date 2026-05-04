---
name: decode-minified-js-gates
description: >
  ミニファイされた JavaScript バンドル内のゲート呼び出しバリアントを
  分類する。フラグ出現箇所周辺のコンテキストウィンドウ抽出、4〜6 種の
  リーダーバリアント(同期ブール、同期設定オブジェクト、ブートストラップ
  対応 TTL、truthy 限定、非同期ブートストラップ、非同期ブリッジ)の特定、
  デフォルト値の抽出(ブール / null / 数値 / 設定オブジェクトリテラル)、
  `&&` 述語をまたぐ連言検出、キルスイッチ反転検出、そして
  probe-feature-flag-state に渡すゲートメカニクスレコードの生成を扱う。
  フラグの振る舞いを名前だけから推定できないとき、バイナリが複数のリーダー
  ライブラリを使うとき、または設定オブジェクトゲートがブールゲートとは
  異なる構造化スキーマを持つときに使用する。
license: MIT
allowed-tools: Read Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: reverse-engineering, feature-flags, minified-js, gate-decoding, classification
  locale: ja
  source_locale: en
  source_commit: 90b159ab
  translator: "Claude + human review"
  translation_date: "2026-05-04"
---

# Decode Minified JS Gates

ミニファイされた JavaScript バンドル内のフラグ文字列周辺の呼び出し箇所コンテキストを読み取り、ゲートメカニクスレコードを生成する：どのリーダーバリアントか、デフォルトは何か、連言は何か、役割は何か。`probe-feature-flag-state` が「このゲートはオンかオフか?」に答えるのに対し、本スキルはその前提となる問い — 「このゲートは実際に何をするのか?」に答える。

## 使用タイミング

- `sweep-flag-namespace` で浮かび上がったフラグが、名前だけからは分類できないとき。
- バイナリが複数のゲートリーダー関数を使っており、フラグがどれを呼び出すかを知る必要があるとき。
- ゲートの「デフォルト」が非ブール(`{}`、`null`、数値リテラル)に見え、実際のリーダーバリアントを解読する必要があるとき。
- キルスイッチ(反転ゲート)を疑っているが、フラグ名からは確認できないとき。
- 述語が複数のゲートを `&&` で結合しており、いずれかをプローブする前に共起ゲートを列挙する必要があるとき。

## 入力

- **必須**: ミニファイされた JavaScript バンドルファイル(`.js`、`.mjs`、`.bun`)。
- **必須**: 解読対象となるフラグ文字列(リテラル形式)。
- **任意**: 過去の解読パスから既知のリーダー関数名のリスト — ステップ 2 が高速化する。
- **任意**: コンテキストウィンドウサイズの上書き値。デフォルトはフラグ出現箇所の前 300 文字、後 200 文字。

## 手順

### Step 1: コンテキストウィンドウを抽出する

フラグ文字列を見つけ、各出現箇所の周辺で非対称ウィンドウを取得する。前置コンテキスト(フラグの前)はリーダー関数名が存在する場所であり、後置コンテキスト(後)はデフォルト値と連言が存在する場所である。

```bash
BUNDLE=/path/to/cli/bundle.js
FLAG=acme_widget_v3                   # synthetic placeholder
PRE=300
POST=200

# All byte offsets where the flag string occurs
grep -boE "\"${FLAG}\"" "$BUNDLE" | cut -d: -f1 > /tmp/decode-offsets.txt
wc -l /tmp/decode-offsets.txt

# Capture an asymmetric window per occurrence
while read -r offset; do
  start=$((offset - PRE))
  [ "$start" -lt 0 ] && start=0
  length=$((PRE + POST))
  echo "=== offset $offset ==="
  dd if="$BUNDLE" bs=1 skip="$start" count="$length" 2>/dev/null
  echo
done < /tmp/decode-offsets.txt > /tmp/decode-windows.txt

less /tmp/decode-windows.txt
```

最初の高速パスとしては、Perl 互換正規表現の負の後読みを伴う `grep -oE` が同じウィンドウを 1 つのパイプで取得できる。

**期待結果：** フラグ出現箇所ごとに 1 つ以上のコンテキストウィンドウ(各約 500 文字)。複数の出現箇所は通常同じリーダー関数を共有するが、デフォルトや連言が異なる場合がある — それぞれを独立に検査する。

**失敗時：** バンドルが `dd` を出現箇所ごとに実行するには大きすぎる(バイナリが 100MB 超、または出現箇所が多数)場合、`rg -B 5 -A 3 "$FLAG" "$BUNDLE"` を使って構造化出力で近似する。ウィンドウが文字化けして見える場合、バンドルが UTF-16 か、非 ASCII 区切りを含む可能性がある。`iconv` を使うか、バイナリとして扱う。

### Step 2: リーダーバリアントを特定する

ミニファイされたゲートライブラリは通常、異なるセマンティクスを持つ 4〜6 種のリーダーバリアントを公開する。リーダー関数名は最初の手がかりであり、呼び出しシグネチャが裏付けとなる。

バリアント分類(合成名 — 実際のバンドルで見つかったミニファイ済み識別子に置き換える)：

| バリアント | 合成形式 | 戻り値 | 一般的な用途 |
|---|---|---|---|
| **Sync boolean** | `gate("flag", false)` または `gate("flag", true)` | `boolean` | 標準的なオン/オフ機能スイッチ |
| **Sync config-object** | `fvReader("flag", {key: value})` | JSON オブジェクト | 構造化設定(遅延、許可リスト、モデル名) |
| **Bootstrap-aware TTL** | `ttlReader("flag", default, ttlMs)` | `boolean`(キャッシュ) | リモート設定到着前の起動経路ゲート |
| **Truthy-only** | `truthyReader("flag")` | truthy/falsy | 簡易チェック。明示的なデフォルトなし |
| **Async bootstrap** | `asyncReader("flag")` | `Promise<boolean>` | ブートストラップ後に解決されるゲート |
| **Async bridge** | `bridgeReader("flag")` | `Promise<boolean>` | 別経路で評価されるブリッジ/リレーチャネルゲート |

各コンテキストウィンドウをバリアントパターンと照合する：

```bash
# Test for variant patterns. Replace the synthetic reader names with the
# actual minified identifiers found in the bundle.
grep -oE '\b(gate|fvReader|ttlReader|truthyReader|asyncReader|bridgeReader)\("acme_widget_v3"' /tmp/decode-windows.txt | sort | uniq -c
```

同じフラグに対して複数のバリアントが出現する場合(まれだが現実にあり得る — フラグが起動時に同期で読まれ、ブートストラップ後には非同期で読まれるなど)、出現箇所ごとのバリアントを別々に記録する。プローブ結果が異なる可能性がある。

**期待結果：** すべてのゲート呼び出し出現箇所に 1 つのバリアントタグが付く。スイープ全体のバリアント件数からバイナリレベルの分布が得られる(例: 「同期ブール 60%、設定オブジェクト 30%、TTL 10%」)。

**失敗時：** コンテキストウィンドウに認識可能なリーダーパターンが含まれない場合、フラグは実際にはゲート呼び出されていない可能性がある — `sweep-flag-namespace` のステップ 2 の呼び出し箇所分類を見直す。ウィンドウにこの分類表に含まれないリーダー名がある場合、調査成果物に新たなバリアントとして文書化し、別の処理経路を割り当てるべきかを判断する。

### Step 3: デフォルト値を抽出する

デフォルトはリーダーの第 2 位置引数である(truthy 限定 / 非同期バリアントでは存在しない)。正確なリテラルを取得する — `false`、`true`、`null`、`0`、文字列、または JSON 設定オブジェクト。

```bash
# Boolean default extraction (sync boolean and TTL variants)
grep -oE '\b(gate|ttlReader)\("acme_widget_v3",\s*(true|false)' /tmp/decode-windows.txt

# Config-object default — match the opening brace and capture until the
# matching brace at the same nesting depth. For minified bundles this is
# usually safe with a non-greedy match because objects rarely span lines.
grep -oE 'fvReader\("acme_widget_v3",\s*\{[^}]*\}' /tmp/decode-windows.txt

# Numeric default (rare but real for TTL or threshold gates)
grep -oE '\b(gate|ttlReader)\("acme_widget_v3",\s*[0-9]+' /tmp/decode-windows.txt
```

設定オブジェクトのデフォルトについては JSON 構造を検査する — キーがゲートの目的を示唆することが多い(例えば `{maxRetries: 3, timeoutMs: 5000}` は機能トグルではなく再試行ポリシー設定である)。

**期待結果：** 出現箇所ごとに正確なリテラルデフォルトが得られる。ブールは曖昧でないが、設定オブジェクトは構造を手動で読む必要がある。

**失敗時：** 設定オブジェクトの対応する閉じ括弧がコンテキストウィンドウの外にある場合、ステップ 1 の後置コンテキストサイズを大きくする。デフォルトが変数参照(例: `gate("flag", x)`)に見える場合、デフォルトは実行時に計算される — DYNAMIC として記録し、`probe-feature-flag-state` を介して実際の戻り値をプローブする。

### Step 4: 連言とキルスイッチを検出する

多くのゲートは複合述語に参加する。連言(`&&`)と反転(`!`)はゲートの実効的な役割を変える。

```bash
# Conjunction detection: gate-call followed by `&&` and another gate-call
# within the same predicate window
grep -oE '(gate|fvReader|ttlReader|truthyReader|asyncReader|bridgeReader)\("acme_widget_v3"[^)]*\)\s*&&\s*(gate|fvReader|ttlReader|truthyReader|asyncReader|bridgeReader)\("acme_[a-zA-Z0-9_]+"' /tmp/decode-windows.txt

# Kill-switch detection: leading `!` before the gate-call
grep -oE '!\s*(gate|fvReader|ttlReader|truthyReader|asyncReader|bridgeReader)\("acme_widget_v3"' /tmp/decode-windows.txt
```

検出された各連言について、共起ゲートのフラグ名を列挙する。これらはプローブ範囲の一部となる — 対象フラグの評価が共起ゲートに依存する場合、対象フラグだけをプローブしても不完全な状態しか得られない。

検出された各反転については、ゲートメカニクスレコードでフラグをキルスイッチとしてマークする。キルスイッチはデフォルトの意味を反転させる：`default=false` のキルスイッチは「デフォルトで機能オン」(なぜなら `!false === true`)を意味し、`default=false` の通常ゲートは「デフォルトで機能オフ」を意味する。

**期待結果：** 出現箇所ごとに連言リスト(空の可能性あり)と反転フラグ(ブール)が得られる。

**失敗時：** 連言が 3 つ以上の共起ゲートを含む場合、述語は正規表現が構造を取りこぼすほど複雑である。コンテキストウィンドウを手動で読み、述語形状を逐語的にゲートメカニクスレコードに記録する。

### Step 5: ゲートの役割を分類する

ステップ 2〜4 を統合して役割分類とする。役割は異なるプローブ戦略と異なる統合リスクをもたらす。

| 役割 | シグネチャ | 含意 |
|---|---|---|
| **Feature switch** | 同期ブール、反転なし、連言なし | 標準的なオン/オフ。直接プローブ可能 |
| **Config provider** | 同期設定オブジェクト(`fvReader`) | 戻り値オブジェクトを読む。空デフォルト `{}` は機能オフではない |
| **Lifecycle guard** | ブートストラップ対応 TTL または非同期ブートストラップ | 状態がブートストラップタイミングに依存。複数時点でプローブする |
| **Kill switch** | 反転ゲート、デフォルト false | ユーザーにとってデフォルトで機能オン。フラグを立てるとオフになる |
| **Conjunction member** | `&&` 共起ゲートを伴う任意のバリアント | 単独評価不可。共起ゲートはプローブ範囲の一部である |
| **Bridge gate** | 非同期ブリッジバリアント | プローブはメイン経路ではなくブリッジチャネル経由で行う必要がある |

**期待結果：** すべてのゲート呼び出し出現箇所に主要な役割が 1 つ割り当てられる。一部のフラグは出現箇所ごとに複数の役割で現れる(例: ある呼び出し箇所では機能スイッチ、別の箇所では連言メンバー) — 各役割を独立に記録する。

**失敗時：** 役割が表に当てはまらない場合、バイナリは本スキルでまだ文書化されていないゲートライブラリを使っている。合成識別子で行を追加し、将来の調査者のためにバリアントをスキル(またはプロジェクト固有の拡張)に貢献する。

### Step 6: ゲートメカニクスレコードを生成する

フラグごとの調査結果を構造化レコードに統合する。フラグごとに 1 行になるため、`sweep-flag-namespace` インベントリと容易に統合できる JSONL が便利である。

```jsonl
{"flag":"acme_widget_v3","variant":"sync_boolean","default":false,"role":"feature_switch","conjunctions":[],"inverted":false,"occurrences":3}
{"flag":"acme_retry_policy","variant":"sync_config_object","default":{"maxRetries":3,"timeoutMs":5000},"role":"config_provider","conjunctions":[],"inverted":false,"occurrences":1}
{"flag":"acme_legacy_path","variant":"sync_boolean","default":false,"role":"kill_switch","conjunctions":[],"inverted":true,"occurrences":2}
{"flag":"acme_beta_feature","variant":"sync_boolean","default":false,"role":"conjunction_member","conjunctions":["acme_beta_program_active"],"inverted":false,"occurrences":1}
```

ゲートメカニクスレコードは `probe-feature-flag-state` のステップ 2(ゲート対イベントの曖昧性解消)に渡される：バリアント + 役割 + 連言リストが、どの観測を LIVE / DARK / INDETERMINATE 状態の証拠として数えるかを決定する。

**期待結果：** フラグごと(または 1 つのフラグが複数の異なるメカニクスを持つ場合は出現箇所ごと)に 1 つの JSONL レコード。レコードは再現可能である — 同じバイナリに対して手順を再実行すると同じレコードが得られる。

**失敗時：** 実行ごとにレコードが変動する場合、上流のステップが非決定的である。最も多いのはステップ 1 の正規表現が出現箇所を取りこぼすか過剰一致するケースである。キャンペーンの期間中は正規表現を固定する。

## バリデーション

- [ ] ステップ 1 がフラグ出現箇所ごとに 1 つのコンテキストウィンドウを生み、ウィンドウは約 500 文字である
- [ ] ステップ 2 が各出現箇所に分類表からちょうど 1 つのリーダーバリアントタグを付ける
- [ ] ステップ 3 が正確なデフォルトリテラル(ブール、設定オブジェクト、または DYNAMIC)を捕捉する
- [ ] ステップ 4 がウィンドウ内に存在するすべての連言とキルスイッチ反転を浮かび上がらせる
- [ ] ステップ 5 が役割表から引き出された 1 つの役割を出現箇所ごとに割り当てる
- [ ] ステップ 6 が再実行間でクリーンに差分比較できる JSONL ゲートメカニクスレコードを生成する
- [ ] すべての作業例が合成プレースホルダ(`acme_*`、`gate`、`fvReader` など)を使い、実際のフラグ名、リーダー名、設定オブジェクトスキーマが含まれていない
- [ ] レコードが `probe-feature-flag-state` で消費可能である(同じフラグ識別子、互換性のあるフィールド名)

## よくある落とし穴

- **「デフォルト」を「振る舞い」と読む**: `default=true` のゲートは*このバイナリでは*デフォルトでオンだが、サーバー側の上書きで反転する可能性がある。デフォルトはベースラインを示し、実行時プローブ(`probe-feature-flag-state`)が状態を示す。
- **設定オブジェクトの空デフォルトを機能オフと混同する**: `fvReader("flag", {})` はデフォルトとして空オブジェクトを返すが、フラグは*オン*である(ゲートは truthy として評価される)。`{}` を「オフ」として扱うと、設定プロバイダを機能スイッチとして誤分類してしまう。
- **キルスイッチを見落とす**: ゲート呼び出しの直前の `!` は意味を反転させる。ステップ 4 を省略すると、真実が「デフォルト false、反転によりデフォルトで機能オン」であるのに「デフォルト false、デフォルトで機能オフ」と書かれたレコードが生成される。
- **連言の片方だけをプローブする**: 述語が `acme_widget_v3 && acme_user_in_cohort` のとき、`acme_widget_v3` だけをプローブして LIVE と分かっても機能がライブとは言えない — 連言はコホートフラグ経由でなおもオフにできる。
- **バージョンをまたいでリーダー名を信じる**: ミニファイ識別子はメジャーバージョン間で変わり得る。ステップ 2 の分類は名前ではなく*シグネチャ*(呼び出し形状、戻り値型、デフォルト位置)に基づく。バイナリバージョンが変わったら、新たな解読パスからリーダー名を再導出する。
- **ウィンドウが狭すぎる**: 200/100 の分割では 300 文字以上にまたがる設定オブジェクトデフォルトを取りこぼす。300/200 や 400/300 がより安全である。バンドルが巨大でウィンドウのコストが問題となる場合のみ絞り込む。
- **実際のリーダー名を漏らす**: ミニファイされたリーダー名は意味不明に見えること(`a`、`b`、`Yc1`)があり、逐語的に貼り付けても安全に感じられる。それでも発見内容である — 方法論を公開する前に合成プレースホルダに置き換える。

## 関連スキル

- `probe-feature-flag-state` — ゲートメカニクスレコードを使って実行時観測を解釈する
- `sweep-flag-namespace` — 本スキルが解読する候補フラグ集合を生成する
- `monitor-binary-version-baselines` — バイナリバージョンをまたぐリーダー名変更を追跡する。ベースラインが変わったらステップ 2 のパターンを再導出する
- `redact-for-public-disclosure` — 実際のリーダー名やスキーマを露出させずにゲート解読方法論を公開する方法
- `conduct-empirical-wire-capture` — ゲートメカニクスレコードを実行時挙動と照らして検証する
