---
name: du-dum
description: >
  Separate expensive observation from cheap decision-making in autonomous agent
  loops using a two-clock architecture. A fast clock accumulates data into a
  digest file; a slow clock reads the digest and acts only when something is
  pending. Idle cycles cost nothing because the action clock returns immediately
  after reading an empty digest. Use when building autonomous agents that must
  observe continuously but can only afford to act occasionally, when API or LLM
  costs dominate and most cycles have nothing to do, when designing cron-based
  agent architectures with observation and action phases, or when an existing
  heartbeat loop is too expensive because it calls the LLM on every tick.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: autonomous-agents, cost-optimization, two-clock, digest, heartbeat, batch-then-act, cron
  locale: ja
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Du-Dum: Batch-Then-Act パターン

異なる頻度で動く 2 つのクロックを使って観察と行動を分離する。速いクロック（解析）はデータを安く集めて簡潔なダイジェストを書く。遅いクロック（行動）はダイジェストを読んで行動するか決める。ダイジェストが何も保留中でないと言えば、行動クロックは即座に終了する — アイドルサイクルのコストはゼロ。

名前は心拍リズムから: du-dum、du-dum。最初の拍（du）が観察し、二つ目の拍（dum）が行動する。ほとんどの時間、最初の拍だけが発火する。

## 使用タイミング

- 予算で動き、行動より頻繁に観察しなければならない自律エージェントを構築するとき
- 既存のハートビートループが、何も変わっていないときでも毎ティック LLM を呼ぶとき
- 観察が安い（API 読み取り、ファイル解析、ログスキャン）が行動が高い（LLM 呼び出し、書き込み操作、通知）とき
- 分離された失敗が必要: 観察が失敗しても、最後の良いダイジェストが行動クロックにとって有効であるべき
- 解析と行動が別ジョブとして動く cron ベースエージェントアーキテクチャを設計するとき

## 入力

- **必須**: 速いクロックが観察すべきデータソースのリスト（API、ファイル、ログ、フィード）
- **必須**: ダイジェストが保留中作業を示すとき遅いクロックが取るべき行動
- **任意**: 速いクロック間隔（既定: 4 時間ごと）
- **任意**: 遅いクロック間隔（既定: 1 日 1 回）
- **任意**: 1 日あたりのコスト天井（クロック設定検証用）
- **任意**: ダイジェストフォーマット選好（markdown、JSON、YAML）

## 手順

### ステップ1: 2 つのクロックを特定する

すべての作業を観察（安い、頻繁）と行動（高い、稀）に分離する。

1. 現在のループまたは計画ワークフローのすべての操作を列挙する
2. 各々を観察（データを読み概要を生む）または行動（LLM を呼び、出力を書き、メッセージを送る）に分類する
3. 分離を検証: 観察はゼロまたはほぼゼロの限界コスト; 行動は高価な操作
4. 頻度を割り当てる: 速いクロックはイベントを捕まえるのに十分頻繁; 遅いクロックは応答時間要件を満たすのに十分頻繁

| Clock | Cost profile | Frequency | Example |
|-------|-------------|-----------|---------|
| Fast (analysis) | Cheap: API reads, file parsing, no LLM | 4-6x/day | Scan GitHub notifications, parse RSS, read logs |
| Slow (action) | Expensive: LLM inference, write operations | 1x/day | Compose response, update dashboard, send alerts |

**期待結果：** すべての操作が正確に 1 つのクロックに割り当てられる明確な 2 列分離。速いクロックには LLM 呼び出しなし、遅いクロックにはデータ収集なし。

**失敗時：** 操作が読み取りと LLM 推論の両方を必要とするなら（例: 「新しい issue を要約」）、分割する: 速いクロックが生 issue をダイジェストへ集め、遅いクロックがそれらを要約する。ダイジェストが境界。

### ステップ2: ダイジェストフォーマットを設計する

ダイジェストは 2 つのクロックを橋渡しする低帯域メッセージ。簡潔、人間可読、機械解析可能でなければならない。

1. ダイジェストファイルパスとフォーマットを定義する（人間デバッグには markdown を推奨）
2. タイムスタンプとソースメタデータ付きヘッダを含む
3. 行動が必要なアイテムを列挙する「pending」セクションを定義する
4. 現在の状態を伴う「status」セクションを定義する（ダッシュボードまたはログ用）
5. 明確な空状態インジケーターを含む（例: `pending: none` または空セクション）

ダイジェスト構造例:

```markdown
# Digest — 2026-03-22T06:30:00Z

## Pending

- PR #42 needs review response (opened 2h ago, author requested feedback)
- Issue #99 has new comment from maintainer (action: reply)

## Status

- Last analyzed: 2026-03-22T06:30:00Z
- Sources checked: github-notifications, rss-feed, error-log
- Items scanned: 14
- Items pending: 2
```

何も保留中でないとき:

```markdown
# Digest — 2026-03-22T06:30:00Z

## Pending

(none)

## Status

- Last analyzed: 2026-03-22T06:30:00Z
- Sources checked: github-notifications, rss-feed, error-log
- Items scanned: 8
- Items pending: 0
```

**期待結果：** 明確な pending/empty 状態を持つダイジェストテンプレート。行動クロックは単一フィールドまたはセクションを確認することで進むかを決められる。

**失敗時：** ダイジェストが大きくなりすぎる（>50 行）なら、速いクロックが生データを含めすぎている。詳細を別データファイルへ移し、ダイジェストはポインタ付き要約として保つ。

### ステップ3: 速いクロック（解析）を実装する

速いスケジュールで動く観察スクリプトを構築する。

1. データソース 1 つにつき 1 スクリプト（失敗を独立に保つ）
2. 各スクリプトはソースを読み、関連イベントを抽出し、ダイジェストへ追記または書き換える
3. 部分ダイジェストを防ぐためファイルロックまたはアトミック書き込みを使う
4. 解析実行（タイムスタンプ、見つけたアイテム、エラー）を別ログファイルに記録する
5. ダイジェスト更新を超える LLM 呼び出しまたは書き込み操作を決して行わない

```
# Pseudocode: analyze-notifications.sh
fetch_notifications()
filter_actionable(notifications)
format_as_digest_entries(filtered)
atomic_write(digest_path, entries)
log("analyzed {count} notifications, {pending} actionable")
```

スケジュール例（cron）:
```
# Fast clock: analyze every 4 hours
30 */4 * * *  /path/to/analyze-notifications.sh >> /var/log/analysis.log 2>&1
0  6   * * *  /path/to/analyze-pr-status.sh     >> /var/log/analysis.log 2>&1
```

**期待結果：** 1 つ以上の解析スクリプト、各々がダイジェストファイルを生成または更新する。スクリプトは独立に動く — 1 つが失敗しても他がそれぞれのセクションを更新する。

**失敗時：** データソースが一時的に利用不能なら、スクリプトはエラーをログし以前のダイジェストエントリをそのまま残すべき。ソース失敗でダイジェストをクリアしない — 古いデータの方が、行動クロックにとってデータ欠如よりまし。

### ステップ4: 遅いクロック（行動）を実装する

ダイジェストを読んで行動するか決める行動スクリプトを構築する。

1. ダイジェストファイルを読む（すべての行動サイクルのステップ 0）
2. pending セクションを確認: 空または "none" なら、ログエントリと共に即座に終了
3. アイテムが保留中なら、高価な操作（LLM 呼び出し、メッセージ構成など）を呼ぶ
4. 行動後、処理済みダイジェストエントリをクリアまたはアーカイブ
5. 行動実行（処理アイテム、コスト、時間）をログ

```
# Pseudocode: heartbeat.sh (the slow clock)
digest = read_file(digest_path)

if digest.pending is empty:
    log("heartbeat: nothing pending, exiting")
    exit(0)

# Only reaches here if work exists
response = call_llm(digest.pending, system_prompt)
execute_actions(response)
archive_digest(digest_path)
log("heartbeat: processed {count} items, cost: {tokens} tokens")
```

スケジュール例（cron）:
```
# Slow clock: act once per day at 7am
0 7 * * *  /path/to/heartbeat.sh >> /var/log/heartbeat.log 2>&1
```

**期待結果：** 行動スクリプトはアイドルサイクルでは 1 秒未満で終了する（ファイル読み取りと空チェックだけ）。アクティブサイクルでは保留アイテムを処理しダイジェストをクリアする。

**失敗時：** LLM 呼び出しが失敗したら、ダイジェストをクリアしない。保留アイテムは次の行動サイクルに残る。永続的に失敗するアイテムでの無限リトライを避けるため、ダイジェストにリトライカウンタの実装を検討する。

### ステップ5: アイドル検出を設定する

コスト節約はアイドル検出から来る — 行動クロックは「することがない」と「することがある」を最小オーバーヘッドで確実に区別しなければならない。

1. アイドルチェックを単一の高速操作（ファイル読み取り + 文字列チェック）として定義する
2. アイドルパスに外部呼び出しがないことを検証（API なし、LLM なし、ネットワークなし）
3. アイドルパスの所要時間を計測 — 1 秒未満であるべき
4. 監視のため、アイドルサイクルをアクティブサイクルと違う形でログする

```bash
# Minimal idle check
if grep -q "^(none)$" "$DIGEST_PATH" || grep -q "pending: 0" "$DIGEST_PATH"; then
    echo "$(date -u +%FT%TZ) heartbeat: idle" >> "$LOG_PATH"
    exit 0
fi
```

**期待結果：** アイドルパスは単一ファイル読み取りに続く文字列マッチ。スクリプト自体を超えるネットワーク呼び出しもプロセス生成もない。

**失敗時：** アイドルチェックが信頼できない（偽陽性で作業を逃す、偽陰性で不必要な LLM 呼び出し）なら、ダイジェストフォーマットを単純化する。ファイル先頭の単一ブール値（`has_pending: true/false`）が最も信頼できるアプローチ。

### ステップ6: コストモデルを検証する

期待コストを計算して、2 クロックアーキテクチャが節約をもたらすか確認する。

1. 1 日あたりの速いクロック実行回数: `fast_runs = 24 / fast_interval_hours`
2. 1 日あたりの遅いクロック実行回数: 通常 1
3. 観察コストを計算: `fast_runs * cost_per_analysis_run`（LLM なしなら ~$0 のはず）
4. 行動コストを計算: `active_days_fraction * cost_per_action_run`
5. アイドルコストを計算: `(1 - active_days_fraction) * cost_per_idle_check`（~$0 のはず）
6. 元の単一ループコストと比較する

コスト比較例:

| Architecture | Daily cost (active) | Daily cost (idle) | Monthly cost (80% idle) |
|-------------|--------------------|--------------------|------------------------|
| Single loop (LLM every 30min) | $13.74/37h | $13.74/37h | ~$400 |
| Du-dum (6 analyses + 1 action) | $0.30 | $0.00 | ~$6 |

**期待結果：** du-dum アーキテクチャがアイドル日に元より少なくとも 10 倍安いことを示すコストモデル。

**失敗時：** コストモデルが顕著な節約を示さないなら、次のいずれかが真な可能性: (a) 速いクロックが頻繁すぎる、(b) 速いクロックに隠れた LLM 呼び出しがある、(c) システムがほとんどアイドルでない。du-dum はアイドル比率が高いシステムに利益をもたらす。常にアクティブなシステムにはより単純なポーリングアプローチが適切かもしれない。

## バリデーション

- [ ] 速いクロックと遅いクロックがきれいに分離され、速いパスに LLM 呼び出しがない
- [ ] ダイジェストフォーマットに明確な空状態インジケーターがある
- [ ] アイドル検出が外部呼び出しゼロで 1 秒未満で終了する
- [ ] 速いクロック失敗がダイジェストを汚染しない（古いデータが保存される）
- [ ] 遅いクロック失敗が保留アイテムをクリアしない（次サイクルでリトライ）
- [ ] コストモデルが単一ループアーキテクチャ vs アイドル日に少なくとも 10 倍節約を示す
- [ ] 監視・デバッグのため両クロックが実行をログする
- [ ] ダイジェストが無制限に成長しない（処理後に古いエントリがアーカイブまたはクリアされる）

## よくある落とし穴

- **ダイジェストが無制限に成長**: 速いクロックが追記し遅いクロックが決してクリアしないと、ダイジェストは成長するログになる。行動サイクル完了後、処理済みエントリを常にクリアまたはアーカイブする。
- **速いクロックが速すぎる**: イベントが日次で来るのに 5 分ごとに解析を動かすと API クォータとディスク I/O が無駄。データソースの実際のイベントレートに速いクロック頻度を合わせる。
- **遅いクロックが遅すぎる**: 行動窓が 1 日 1 回だが、イベントが同時間応答を必要とするなら、遅いクロックは遅すぎる。頻度を上げるか、即時行動を引き起こす緊急イベントショートカットを追加する。
- **速いクロックに LLM 呼び出し**: 速いクロックに LLM 推論が含まれると全コストモデルが崩壊する。すべての速いクロックスクリプトを監査し、LLM 呼び出しゼロを確認する。要約が必要なら、遅いクロックへ後送する。
- **速いクロックスクリプトの結合**: 1 つの解析スクリプトが他の出力に依存すると、最初の失敗が連鎖する。速いクロックスクリプトを独立に保つ — 各々が自分のソースを読み自分のダイジェストセクションを書く。
- **静かなアイドルログ**: アイドルサイクルがログ出力を生まないと、「動いていてアイドル」と「クラッシュして動いていない」を区別できない。タイムスタンプだけでもアイドルサイクルを常にログする。
- **解析失敗でダイジェストをクリア**: データソースがダウンなら、空ダイジェストを書かない。遅いクロックが「保留なし」と見て、実際は保留中の作業をスキップしてしまう。失敗時は最後の良いダイジェストを保存する。

## 関連スキル

- `manage-token-budget` — du-dum を実用的にするコストコントロール枠組み; du-dum はアーキテクチャパターン、トークン予算は会計層
- `circuit-breaker-pattern` — 失敗ケース（ツールが壊れる）を扱う; du-dum は通常ケース（することがない）を扱う。一緒に使う: アイドル検出に du-dum、失敗回復に circuit-breaker
- `observe` — 速いクロック用の観察方法論; du-dum は観察がいつどうダイジェストを介して行動可能になるかを構造化する
- `forage-resources` — 戦略的探索層; du-dum は forage-resources が動作する実行リズム
- `coordinate-reasoning` — スティグマージック信号パターン; ダイジェストファイルはスティグマージーの一形式（環境成果物を介した間接的調整）
