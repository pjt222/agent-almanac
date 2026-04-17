---
name: conduct-empirical-wire-capture
description: >
  CLIハーネスから実行時に送信されるHTTPおよびテレメトリを捕捉する。
  キャプチャチャネルの選択(トランスクリプトファイル、verbose-fetch
  stderr、外向きプロキシ、オンディスク状態)、イベント単位のフック駆動
  キャプチャ対ロングランニングセッションキャプチャ、差分に適したJSONL
  出力形式、および各ターゲットを最も低コストなチャネルにマッピングする
  可観測性テーブルを取り扱う。静的な発見に実行時の裏付けが必要な場合、
  クライアント再実装のためにペイロード形状が必要な場合、またはダーク
  対ライブの判別でバイナリが実際に送信している内容を観測する必要が
  ある場合に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: reverse-engineering, wire-capture, http, telemetry, jsonl, observability
  locale: ja
  source_locale: en
  source_commit: f74b59bd
  translator: claude-sonnet-4-6
  translation_date: "2026-04-17"
---

# 経験的ワイヤーキャプチャの実施

CLIツールから送信されるHTTPおよびテレメトリに対して、各可観測性ターゲットを最も低コストなチャネルにマッピングする再現可能なワイヤーキャプチャハーネスを構築する。

## 範囲と倫理

キャプチャを設定する前にこれを読むこと。

- ワイヤーキャプチャは、**自身の**マシン上で、**自身の**アカウントに対する、**自身の**リクエストのために行うもの。他ユーザーのトラフィックを捕捉することは研究ではなく持ち出しであり、範囲外である。
- 資格情報は生のワイヤー出力にほぼ必ず現れる。キャプチャ時(Step 6)にリダクトすること。決して「今キャプチャして後でリダクト」にしてはならない。
- キャプチャは*観測*であり、改変ではない。キャプチャしたペイロードを使用してサーバー側のレート制限を迂回したり、他ユーザーのセッションを再生したり、許可なくダークローンチされた機能を有効化してはならない。
- このスキルの出力は内部アーティファクトである。ワイヤー発見を公開するには、このスキルではなく `redact-for-public-disclosure`(親ガイドのPhase 5)を経由する。

## 使用する場面

- 静的な発見(フラグ、エンドポイント参照、テレメトリイベント名)が実際に発火することを実行時に確認する必要がある。
- クライアント再実装、トレーシング計装、バージョン間差分のためにペイロード形状が必要。
- ダーク対ライブの判別には、バンドルが示唆するものではなく、バイナリが実際に送信する内容を観測する必要がある。
- バージョン間で挙動が静かに変化し、将来のバージョンと比較できる再現可能なアーティファクトが必要。

以下の場合には**使用しない**: バージョンベースライン作成(`monitor-binary-version-baselines`を使用)、フラグ状態の検査(`probe-feature-flag-state`を使用)、公開用のリダクト済みアーティファクトの準備(`redact-for-public-disclosure`を使用)。

## 入力

- **必須**: 自身のアカウントに対してローカルで実行可能なCLIハーネスバイナリ。
- **必須**: 答えるべき具体的な質問(例: 「エンドポイントXはイベントYで発火するか?」「テレメトリイベントZのペイロード形状は何か?」)。質問なしのキャプチャは誰も読まないログを生成する。
- **オプション**: キャプチャターゲットの範囲を決める、先行フェーズからの静的発見(マーカーカタログ、候補フラグリスト、疑わしいエンドポイント)。
- **オプション**: キャプチャアーティファクト用のプライベートワークスペースパス。デフォルトは `./captures/` で、`.gitignore` に登録されている必要がある。

## 手順

### Step 1: 可観測性テーブルを最初に構築する

キャプチャを設定する前に、答えるべき質問を列挙し、それぞれをキャプチャチャネルにマッピングする。ターゲット1つにつき1行。

| target | observable via | blocker |
|---|---|---|
| Outbound HTTP to endpoint X | verbose-fetch stderr | TUI noise pollutes terminal |
| Telemetry event Y on user action | hook-driven subprocess | requires harness hook surface |
| Token-refresh handshake | outbound HTTP proxy | cert trust required |
| Scheduled-task lifecycle event | long-running session capture | wallclock alignment |
| Local config mutation | on-disk state diff | none — cheapest channel |

代表的なチャネル、低コスト順:

- **オンディスク状態ファイルの変化** — ハーネスが既知のパスに状態を書き込む場合、スナップショット間の `diff` は無料である。
- **トランスクリプトファイル** — ハーネスが既にセッショントランスクリプトを書き出す場合、それを直接解析する。計装不要。
- **Verbose-fetch stderr** — バンドラ提供の環境変数(例: bunの `BUN_CONFIG_VERBOSE_FETCH=curl`)が全てのフェッチをstderrに流す。ノイズが多いが全てのフェッチを捕捉する。
- **フック駆動サブプロセス** — ハーネスがライフサイクルフック(`UserPromptSubmit`、`Stop` など)を提供する場合、イベントごとに短いキャプチャサブプロセスを起動する。
- **ロングランニングセッションキャプチャ** — セッション全体に対して1プロセス、ウォールクロックで時刻を付与する。シーケンスに使用。
- **外向きHTTPプロキシ** — クリーンに分離されるが、CA証明書の信頼が必要で、ハーネスが証明書をピン留めしている場合に破綻する。

ターゲットを捕捉できる最も低コストなチャネルを選ぶ。1つの具体的な質問に答える3ターゲットのキャプチャは、何も答えない20ターゲットのキャプチャに勝る。

**Expected:** 各質問に対して1行ずつ、チャネルと既知のブロッカーを注釈した可観測性テーブル。有効なチャネルのないターゲットは「今回のセッションでは範囲外」とフラグ付けされている。

**On failure:** すべてのターゲットがプロキシ欄に収まる場合、テーブルは野心的すぎる。最も価値の高い1つか2つの質問に絞り、それらに対して低コストなチャネルを再検討する。

### Step 2: 使い捨てのワークスペースを準備する

ワイヤーキャプチャはターミナルを汚染し、予期しない場所にファイルを残し、資格情報をログに漏らす可能性がある。

```bash
mkdir -p captures/$(date -u +%Y-%m-%dT%H-%M-%S)
cd captures/$(date -u +%Y-%m-%dT%H-%M-%S)
echo 'captures/' >> ../../.gitignore
git check-ignore captures/ || echo "WARNING: captures/ not git-ignored"
```

キャプチャセッションが主作業セッションとは別であることを確認する — verbose-fetchとTUI描画は相互に干渉する。

**Expected:** タイムスタンプ付きでgit-ignore済みの、作業セッションから分離されたキャプチャディレクトリ。

**On failure:** `git check-ignore` がディレクトリが無視されていないと報告した場合、キャプチャコマンドを実行する前に `.gitignore` を修正する。資格情報がリスクにさらされた状態で先に進んではならない。

### Step 3: イベント単位ターゲット向けのフック駆動キャプチャ

ターゲットが離散イベント(ツール呼び出し、プロンプト送信、セッション停止)の場合、ハーネスのフック面を使用する。イベントごとに短命のキャプチャサブプロセスを起動する。プロセス内に常駐してはならない。

パターン(合成例):

```bash
# Hook script, registered with the harness's hook config.
# Invoked once per event; writes one JSONL line; exits.
#!/usr/bin/env bash
set -euo pipefail
TS=$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)
EVENT="${1:-unknown}"
PAYLOAD=$(jq -c --arg ts "$TS" --arg ev "$EVENT" \
  '{ts:$ts, source:"hook", target:$ev, payload:.}' < /dev/stdin)
echo "$PAYLOAD" >> "$CAPTURE_DIR/events.jsonl"
```

サブプロセス方式を取る理由:

- トークン状態もセッション結合もない — 各呼び出しが独立している。
- 1つのキャプチャの失敗が次を汚染しない。
- イベントはまれ(ユーザーアクションごと、バイトごとではない)なので、サブプロセスのオーバーヘッドは許容できる。

**Expected:** 発火した各イベントにつき `events.jsonl` に1行のJSONL、各行は `jq` で解析可能な整形済みJSON。

**On failure:** `jq` が解析エラーを報告する場合、ペイロードにエスケープされていない制御文字またはバイナリデータが含まれている — `jq -R`(raw入力)経由でパイプし、代わりにペイロードフィールドをbase64エンコードする。

### Step 4: 逐次的状態のためのロングランニングセッションキャプチャ

ターゲットがシーケンス(マルチターンハンドシェイク、スケジュールタスクライフサイクル、リトライ/バックオフ状態機械)の場合、セッション全体で1つのキャプチャプロセス、ウォールクロックで時刻を付与する。

```bash
# Run the harness with verbose-fetch routed to a tee-d log.
BUN_CONFIG_VERBOSE_FETCH=curl harness-cli run-task 2> >(
  while IFS= read -r line; do
    printf '%s\t%s\n' "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)" "$line"
  done >> "$CAPTURE_DIR/session.tsv"
)
```

ウォールクロックの接頭辞により、複数のキャプチャが並行実行される場合でも順序が曖昧でなくなる。TSV(タブ区切り)は意図的である — stderr上のJSONクォートを壊してしまうシェルでも生き残る。

TSVからJSONLへの変換はセッション終了後(Step 5)に行う。セッション中ではない。

**Expected:** 単調増加するタイムスタンプを持つTSVログ、stderr 1行ごとに1行。

**On failure:** タイムスタンプが逆行する場合、ハーネスがstderrをバッファリングしている — `stdbuf -oL -eL` またはバンドラ相当の行バッファフラグで再実行する。

### Step 5: JSONLへの正規化

JSONLがアーティファクト形式である: 1行につき1つのJSONオブジェクト、フィールドは `timestamp`、`source`、`target`、`payload`。差分に適しており、`jq` でフィルタでき、エディタ再読み込み間でも安定している。

```bash
# Parse the TSV from Step 4 into JSONL.
awk -F'\t' '{
  printf "{\"timestamp\":\"%s\",\"source\":\"verbose-fetch\",\"target\":\"%s\",\"payload\":%s}\n",
    $1, "session", $2
}' < session.tsv | jq -c . > session.jsonl
```

全行が解析できることを検証する:

```bash
while IFS= read -r line; do
  echo "$line" | jq -e . > /dev/null || echo "BAD LINE: $line"
done < session.jsonl
```

典型的なフィルタの使用例:

```bash
# Show only requests to a specific endpoint pattern.
jq -c 'select(.payload | tostring | test("/api/v1/example"))' session.jsonl

# Show timing between consecutive captures.
jq -r '.timestamp' session.jsonl | sort | uniq -c
```

**Expected:** `*.jsonl` の全行が `jq -e .` で解析される。`BAD LINE` 警告なし。

**On failure:** 一部の行が検証に失敗する場合、ソースのTSVのペイロードに埋め込みタブが含まれている — 別の区切り文字でStep 4を再実行するか、2番目のフィールドをbase64エンコードする。

### Step 6: キャプチャ時のリダクト

認証ヘッダ、セッションID、ベアラートークン、PIIはディスクに書き出す**前**に除去する。`events.jsonl` と `session.jsonl` ファイルは初回書き込み時点でシークレットを1つも含んではならない。

```bash
# Stream the raw capture through a redactor before persisting.
redact() {
  sed -E \
    -e 's/(authorization:[[:space:]]*Bearer[[:space:]]+)[A-Za-z0-9._-]+/\1<REDACTED>/gi' \
    -e 's/(x-api-key:[[:space:]]*)[A-Za-z0-9._-]+/\1<REDACTED>/gi' \
    -e 's/(cookie:[[:space:]]*)[^;]+/\1<REDACTED>/gi' \
    -e 's/("password"[[:space:]]*:[[:space:]]*)"[^"]*"/\1"<REDACTED>"/g' \
    -e 's/("token"[[:space:]]*:[[:space:]]*)"[^"]*"/\1"<REDACTED>"/g'
}

cat raw-capture.txt | redact > session.tsv
```

キャプチャ後、何も漏れていないことを検証する:

```bash
# Patterns that must not appear in any *.jsonl file.
grep -Ei 'bearer [A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}' captures/ \
  && { echo "LEAK DETECTED"; exit 1; } \
  || echo "redaction clean"
```

「キャプチャしてからリダクト」アーティファクトは常に何かを漏らす。唯一安全なパターンは「キャプチャ時点でリダクト済み」である。完成したアーティファクトにリダクトされていないトークンを発見した場合、キャプチャ全体を汚染済みとして扱う — 削除し、資格情報をローテートし、再実行する。

**Expected:** `LEAK DETECTED` チェックが終了コード0で終わる(一致なし)。既知の資格情報接頭辞に対する `grep` は何も返さない。

**On failure:** リークチェックがヒットを見つけた場合、ファイルをインプレースで編集してはならない。キャプチャディレクトリ全体を削除し、リダクタの正規表現を漏洩したパターンカテゴリをカバーするよう拡張し、Step 3または4から再実行する。

### Step 7: 記録前にレスポンスカテゴリを分類する

HTTPステータスコードはコンテキストによって異なる意味の重みを持つ。記録前に分類することで、下流の `jq` フィルタが生のコードではなく意図に対して動作するようにする。

| Observed status | Channel context | Classification |
|---|---|---|
| 200 / 201 | Any | success |
| 401 on token-refresh endpoint | Handshake | expected handshake step |
| 401 on data endpoint | After auth | auth failure (real) |
| 404 on lazy-loaded resource | First fetch | expected miss |
| 404 on documented endpoint | After feature gate | gate-induced absence |
| 429 | Any | rate-limit (back off; do not retry tight) |
| 5xx | Any | server failure (record, do not assume) |

キャプチャ時に `class` フィールドを追加する:

```bash
jq -c '. + {class: (
  if (.payload.status == 401 and (.target | test("token|refresh"))) then "handshake"
  elif (.payload.status >= 200 and .payload.status < 300) then "success"
  elif (.payload.status == 401) then "auth-fail"
  elif (.payload.status == 429) then "rate-limit"
  elif (.payload.status >= 500) then "server-fail"
  else "other" end)}' session.jsonl > session.classified.jsonl
```

トークンリフレッシュチャネル上の401は失敗ではない — ハンドシェイクの前半である。ハンドシェイクステップを失敗と誤分類すると、レビュアーの注意を浪費する偽陽性の発見を生む。

**Expected:** `*.classified.jsonl` の全行が既知の値を持つ `class` フィールドを持つ。

**On failure:** 分類が多くの `other` エントリを生む場合、上記の表がこのハーネスにとって不完全である — 分析を続ける前に、繰り返し出現する `other` パターン1つにつき1行ずつテーブルを拡張する。

### Step 8: キャプチャマニフェストを永続化する

キャプチャ実行は、入力が出力とともに記録されてはじめて再現可能となる。マニフェストを書き出す:

```bash
cat > capture-manifest.json <<EOF
{
  "captured_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "harness_version": "$(harness-cli --version 2>/dev/null || echo unknown)",
  "channel": "verbose-fetch",
  "question": "Does endpoint X fire on event Y?",
  "targets": ["endpoint-X", "event-Y"],
  "files": ["session.jsonl", "session.classified.jsonl"],
  "redaction_check": "passed"
}
EOF
```

マニフェストこそが、キャプチャを将来のバージョンと差分可能にするものである。

**Expected:** `capture-manifest.json` が存在し、`jq` で解析でき、キャプチャディレクトリ内のすべてのアーティファクトファイルを列挙している。

**On failure:** ハーネスにバージョンフラグがない場合、代わりにバイナリの `sha256sum` を記録する。身元不明のバイナリは比較不可能なキャプチャを生成する。

## 検証

- [ ] 可観測性テーブルがキャプチャコマンド実行前に構築されている
- [ ] キャプチャディレクトリがgit-ignoreされ、タイムスタンプ付きである
- [ ] 各 `*.jsonl` ファイルが `jq -e .` で1行ずつ解析できる
- [ ] リダクトリークチェックが既知の資格情報接頭辞に対して一致を返さない
- [ ] 各キャプチャイベントが既知の値を持つ `class` フィールドを持つ
- [ ] `capture-manifest.json` がハーネスバージョン(またはsha256)、チャネル、質問を記録している
- [ ] キャプチャディレクトリにStep 1で列挙したターゲットのみが含まれる(他アプリからの偶発的トラフィックなし)

## よくある落とし穴

- **キャプチャ先行、質問は後回し**: 誰も読まないログはディスクと注意力の無駄である。まず可観測性テーブルを構築し、具体的な質問に答えるものだけをキャプチャする。
- **最初に `mitmproxy` に手を伸ばす**: 外向きプロキシは最も侵襲的なチャネルである。証明書の信頼が必要で、証明書ピン留めで破綻し、ハーネスの環境を汚染する。オンディスク、トランスクリプト、verbose-fetch、フック各チャネルがすべてブロックされている場合にのみ使用する。
- **主作業セッション内でのキャプチャ**: verbose-fetch stderrはTUI描画に流れ込み、他作業の断片をキャプチャに漏らす可能性がある。必ず使い捨てのシェルを使用する。
- **「後でリダクトすればいい」**: キャプチャしてからリダクトされたアーティファクトはすべて、少なくとも一度は資格情報を漏洩している。キャプチャ時にリダクトするか、キャプチャしないかのどちらかである。
- **4xxを一様に失敗として扱う**: トークンリフレッシュチャネル上の401はハンドシェイクステップであり、失敗ではない。結論を導く前にチャネルコンテキスト別にレスポンスカテゴリを分類する(Step 7)。
- **イベント単位ターゲットにロングランニングキャプチャを使用**: 3つの離散イベントを捕捉するためにセッション全体のプロセスを使うと、キャプチャ間でトークン状態が結合し、1つの悪いイベントが次を汚染する。イベントにはフック駆動サブプロセスを使い、セッションキャプチャはシーケンスに限定する。
- **マニフェストなし**: `capture-manifest.json` のないJSONLファイルは再現不可能である — どのバージョンが生成したかわからなければ、来月のバイナリと差分を取ることはできない。
- **他ユーザーのトラフィックをキャプチャする**: 範囲外である。ワイヤーキャプチャは自身のマシン上の自身のアカウントのためのものである。キャプチャが偶発的に他ユーザーのリクエストを記録した場合、そのキャプチャを削除しチャネルを絞り込む。

## 関連スキル

- `monitor-binary-version-baselines` — 親方法論のPhase 1。このスキルのマニフェストが参照するバージョンベースラインを生成する。
- `probe-feature-flag-state` — Phase 2-3。ワイヤーキャプチャはその証拠ストランドの1つであり、このスキルはキャプチャ側を教える。
- `instrument-distributed-tracing` — JSONL-over-ウォールクロックの哲学を共有する。ここではサービスメッシュではなく単一バイナリに適用される。
- `redact-for-public-disclosure` — Phase 5。このスキルは内部利用向けのキャプチャ時リダクトのみを扱う。キャプチャがプライベートワークスペースを離れる前に必要な公開基準のリダクトは扱わない。
