---
name: manage-engagement-buffer
description: >
  Manage an engagement buffer that ingests, prioritizes, rate-limits,
  deduplicates, and tracks state for incoming engagement items across
  platforms. Generates periodic digests and enforces cooldown periods.
  Composes with du-dum: du-dum sets the observation/action cadence,
  this skill manages the queue between beats.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: engagement, buffer, queue, rate-limiting, deduplication, digest, cooldown, autonomous-agents
  locale: ja
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Manage Engagement Buffer

プラットフォームを横断する着信エンゲージメントアイテムを取り込み、重複排除し、優先順位付けし、レート制限を行い、それから簡潔なダイジェストを行動クロックへ引き渡す。バッファは生のプラットフォーム信号と意図的行動の間に座る: バーストを吸収し、重複をマージし、クールダウンを強制し、エージェントが最高価値のアイテムを最初に処理することを保証する。バッファなしには、自律エージェントは到着順にアイテムを処理する（ノイズに埋もれた緊急のものを逃す）か、すべてを一度に試みる（レート制限にぶつかりスパムに見える）。

本スキルは `du-dum` と構成する: du-dum は *いつ* 観察し行動するかを決め、本スキルは *何が* 行動に値するかを決める。バッファは du-dum の拍の間に蓄積する queue。

## 使用タイミング

- 自律エージェントがサイクルあたり処理できる以上のエンゲージメントを受け取る
- 重複または近重複アイテムが行動予算を浪費する
- エンゲージメントが行動クロック発火前に優先順位付けを必要とする
- 過剰エンゲージメントまたはレート制限を防ぐためにクールダウン期間が必要
- 複数プラットフォームソース（GitHub、Slack、メール）が単一エージェントの行動ループに供給する

## 入力

- **必須**: `buffer_path` — JSONL バッファファイルへのパス
- **任意**: `platform_config` — プラットフォームごとのレート制限とクールダウン設定
- **任意**: `digest_size` — ダイジェストのトップアイテム数（既定: 5）
- **任意**: `ttl_hours` — 未行動アイテムの time-to-live（既定: 48）
- **任意**: `cooldown_minutes` — 行動後のスレッドごとクールダウン（既定: 60）

## 手順

### ステップ1: バッファスキーマを定義する

エンゲージメントアイテム構造を設計する。バッファ内の各アイテムはこれらのフィールドを持つ単一 JSON 行:

```json
{
  "id": "gh-notif-20260408-001",
  "source": "github:pjt222/agent-almanac",
  "timestamp": "2026-04-08T09:15:00Z",
  "content_summary": "PR #218 review requested by contributor",
  "priority": 4,
  "state": "new",
  "dedup_key": "github:pjt222/agent-almanac:pr-218:contributor-name",
  "thread_id": "pr-218",
  "ttl_hours": 48
}
```

フィールド定義:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (source prefix + date + sequence) |
| `source` | string | Platform and channel (`github:repo`, `slack:channel`, `email:inbox`) |
| `timestamp` | ISO 8601 | When the item was ingested |
| `content_summary` | string | One-line description of the engagement item |
| `priority` | int 1-5 | Composite priority (see Step 4) |
| `state` | enum | `new`, `acknowledged`, `acted`, `cooldown`, `merged`, `expired` |
| `dedup_key` | string | Composite key: source + thread + author |
| `thread_id` | string | Conversation thread identifier for cooldown tracking |
| `ttl_hours` | int | Hours until item expires if unacted (default: 48) |

JSON Lines ファイル（行ごとに 1 つの JSON オブジェクト）として保存する。このフォーマットは追記専用書き込み、行ごとの処理、期限切れ行なしで書き直すことによる簡単な剪定をサポートする。

**期待結果：** スキーマがコンパニオンコメントまたはヘッダで文書化された、`buffer_path` で初期化された JSONL バッファファイル。スキーマはすべての下流ステップをサポートするのに十分安定している。

**失敗時：** バッファファイルが作成できない（権限、パス問題）なら、現在のサイクルにはインメモリリストにフォールバックしファイルシステムエラーをログする。アイテムを静かにドロップしない — 一時的でもどこかにバッファする。

### ステップ2: 取り込みを実装する

プラットフォームアダプタからアイテムを受け入れ、初期優先順位割り当てと共にバッファに追記する。

アイテムタイプ別の優先順位割り当て:

| Type | Priority | Rationale |
|------|----------|-----------|
| Direct mention (@agent) | 5 | Someone explicitly asked for attention |
| Review request | 4 | Blocking someone else's work |
| Reply in tracked thread | 3 | Active conversation the agent participates in |
| Notification (assigned, subscribed) | 2 | Informational, may require action |
| Broadcast (release, announcement) | 1 | Awareness only, rarely actionable |

各着信アイテムについて:

1. スキーマからのフィールドでアイテム JSON を構成
2. 上のタイプ表に基づいて初期優先順位を割り当て
3. `state` を `new` に設定
4. `timestamp` を現在 UTC 時間に設定
5. source + thread + author から `dedup_key` を生成
6. JSON 行をバッファファイルに追記

```
# Pseudocode: ingest from GitHub adapter
for notification in github_adapter.fetch():
    item = build_item(notification)
    item.priority = priority_by_type(notification.reason)
    item.state = "new"
    append_jsonl(buffer_path, item)
    log("ingested {item.id} priority={item.priority}")
```

**期待結果：** 新しいアイテムが正しい優先順位と `state=new` でバッファファイルに現れる。各アダプタは独立に整形式のアイテムを生成する — アダプタ失敗が他のアダプタをブロックしない。

**失敗時：** プラットフォームアダプタが失敗（auth 期限切れ、レート制限、ネットワークダウン）したら、失敗をログしこのサイクルではそのソースをスキップする。既存バッファアイテムをクリアしない — 以前の成功フェッチからの古いアイテムは空バッファよりまし。

### ステップ3: 重複排除する

設定可能な窓（既定: 24 時間）内で同じ `dedup_key` を共有するアイテムをバッファでスキャンする。最高優先順位インスタンスを保ち、他をマージとしてマークする。

1. `dedup_key` でアイテムをグループ化
2. 各グループ内で、優先順位降順、それからタイムスタンプ降順でソート
3. 最初のアイテム（最高優先順位、最も最近）を保ち、残りを `state=merged` としてマーク
4. スレッドバーストを検出: 1 時間以内に異なる作者からの同じ `thread_id` は活動バーストを示す — `content_summary` に追加された参加者数で単一アイテムに統合

```
# Dedup logic
groups = group_by(buffer, "dedup_key", window_hours=24)
for key, items in groups:
    if len(items) > 1:
        keeper = max(items, key=lambda i: (i.priority, i.timestamp))
        for item in items:
            if item.id != keeper.id:
                item.state = "merged"

# Thread burst detection
thread_groups = group_by(buffer, "thread_id", window_hours=1)
for thread_id, items in thread_groups:
    active_items = [i for i in items if i.state == "new"]
    if len(active_items) >= 3:
        keeper = max(active_items, key=lambda i: i.priority)
        keeper.content_summary += f" ({len(active_items)} participants)"
        for item in active_items:
            if item.id != keeper.id:
                item.state = "merged"
```

**期待結果：** バッファは窓内に重複 `dedup_key` エントリを含まない。スレッドバーストは参加者数と共に単一アイテムに崩される。マージされたアイテムは（監査用に）ファイルに残るが下流処理から除外される。

**失敗時：** 重複排除が予想外のマージ（鍵を共有する正当な別個のアイテム）を生むなら、dedup 窓を狭めるか鍵構成を精緻化する。dedup 鍵にコンテンツハッシュを加えると、source + thread + author を共有するが真に異なるコンテンツを持つアイテムを区別できる。

### ステップ4: 優先順位付けする

最近度減衰とエスカレーションを取り入れた合成スコアでバッファを再ソートする。

合成スコア式:

```
score = base_priority * recency_weight * escalation_factor

recency_weight = 0.9 ^ hours_since_ingestion
escalation_factor = 1.0 + (resubmission_count * 0.2)

# Cap effective priority at 5
effective_priority = min(5, score)
```

挙動:

- 0 時間前に取り込まれた priority-3 アイテム: `3 * 1.0 * 1.0 = 3.0`
- 8 時間前に取り込まれた priority-3 アイテム: `3 * 0.43 * 1.0 = 1.29`（priority-2 アイテム未満に減衰）
- 2 回再提出された priority-2 アイテム: `2 * 1.0 * 1.4 = 2.8`（priority-3 近くにエスカレート）

すべての `state=new` アイテムを `effective_priority` 降順でソート。このソート順がダイジェスト（ステップ6）が du-dum に提示するもの。

**期待結果：** バッファが合成スコアでソートされる。新鮮な高優先順位アイテムが上にある。古いアイテムは減衰した。再提出アイテムはエスカレートした。アイテムは優先順位 5 を超えない。

**失敗時：** スコア式が直感に反するランキング（例: 1 時間古い priority-2 アイテムが新鮮な priority-3 アイテムより上）を生むなら、減衰率を調整する。1 時間あたり 0.95 の減衰はより穏やか; 1 時間あたり 0.85 はより攻撃的。エンゲージメントテンポに合うようにチューニングする。

### ステップ5: レート制限とクールダウンを強制する

プラットフォームごとの書き込み制限とスレッドごとのクールダウンを強制してエージェントが過剰エンゲージしないようにする。

**プラットフォームごとレート制限**（`platform_config` で設定可）:

| Platform | Default limit | Window |
|----------|--------------|--------|
| GitHub comments | 1 per 20 seconds | rolling |
| GitHub reviews | 3 per hour | rolling |
| Slack messages | 1 per 10 seconds | rolling |
| Email replies | 5 per hour | rolling |

**スレッドごとクールダウン:** エージェントがスレッドに行動した後、そのスレッドは `cooldown_minutes`（既定: 60）クールダウンに入る。クールダウン中、そのスレッドの新アイテムは取り込まれるがダイジェストに表面化しない。

**エラーバックオフ:** 任意のプラットフォームから 429/レート制限応答を受けたら、そのプラットフォームのクールダウンを倍にする。成功行動後に既定にリセット。

```
# Rate limit check before action
def can_act(platform, thread_id):
    if rate_limit_exceeded(platform):
        return False, "rate limited"
    if thread_in_cooldown(thread_id):
        return False, "thread cooldown active"
    return True, "clear"

# After action
def record_action(platform, thread_id):
    increment_rate_counter(platform)
    set_cooldown(thread_id, cooldown_minutes)

# After rate-limit error
def handle_rate_error(platform):
    current_cooldown = get_platform_cooldown(platform)
    set_platform_cooldown(platform, current_cooldown * 2)
```

**期待結果：** エージェントは決してプラットフォームレート制限を超えない。スレッドは強制されたクールダウン期間を持つ。レート制限エラーは自動バックオフを引き起こす。バッファはクールダウン中にアイテムを失わずに蓄積する。

**失敗時：** 強制にも関わらずレート制限がヒットする（クロックスキュー、並行エージェント）なら、安全マージンを増やす — 制限をプラットフォームの実際制限の 80% に設定。クールダウンが攻撃的すぎる（時間敏感スレッドを逃す）なら、高優先順位スレッドのみ `cooldown_minutes` を減らす。

### ステップ6: ダイジェストを生成する

du-dum の行動拍のための簡潔な概要を作成する。ダイジェストが引き渡し点: du-dum はこれを読み、生のバッファではない。

ダイジェスト内容:

1. **Total pending**: `state=new` アイテムのカウント
2. **Top-N items**: 最高優先順位アイテム（`digest_size` から既定 N=5）
3. **Expiring soon**: TTL の 20% 以内のアイテム
4. **Threads in cooldown**: 残時間付きアクティブクールダウン
5. **Buffer health**: 総アイテム数、マージカウント、期限切れカウント

```markdown
# Engagement Digest — 2026-04-08T12:00:00Z

## Pending: 12 items

### Top 5 by Priority
| # | Priority | Source | Summary | Age |
|---|----------|--------|---------|-----|
| 1 | 5.0 | github:pr-218 | Review requested by contributor | 2h |
| 2 | 4.2 | github:issue-99 | Maintainer question (escalated) | 6h |
| 3 | 3.0 | slack:dev | Build failure alert | 1h |
| 4 | 2.8 | github:pr-215 | CI check feedback (3 participants) | 3h |
| 5 | 2.1 | email:inbox | Collaboration inquiry | 8h |

### Expiring Soon
- github:issue-85 — 4h remaining (TTL 48h, ingested 44h ago)

### Cooldowns Active
- pr-210: 22 min remaining
- issue-92: 45 min remaining

### Buffer Health
- Total items: 47 | New: 12 | Merged: 18 | Acted: 11 | Expired: 6
```

ダイジェストを du-dum の行動クロックが読む既知のパス（例: `buffer_path.digest.md`）に書く。

**期待結果：** du-dum が一読で解析できる 50 行以下のダイジェスト。ダイジェストには何に行動するかを決めるに十分な情報が含まれるが、フルバッファではない。何も保留中でなければ、ダイジェストはそう明確に言う。

**失敗時：** ダイジェストが 50 行を超えて成長したら、`digest_size` を減らすか expiring/cooldown セクションをより攻撃的に要約する。ダイジェストは概要 — バッファのサイズに近づいたらその目的を失っている。

### ステップ7: 状態遷移を追跡する

du-dum がダイジェストからアイテムを処理した後、状態を更新し監査トレイルを維持する。

状態マシン:

```
new → acknowledged → acted → cooldown → expired
         ↑                       │
         └───── (re-ingested) ───┘

merged → (terminal, no further transitions)
expired → (terminal, archived)
```

各状態遷移について:

1. バッファファイル内のアイテムの `state` フィールドを更新
2. 遷移ログエントリを追記: `{"item_id": "...", "from": "new", "to": "acknowledged", "timestamp": "...", "reason": "du-dum digest pickup"}`
3. 行動後、スレッドクールダウンを設定（ステップ5 にフィードバック）

**保持と剪定:**

- 7 日より古い `state=acted` または `state=expired` アイテムをアーカイブ（設定可）
- 削除ではなく別ファイル（`buffer_path.archive.jsonl`）への移動でアーカイブ
- 24 時間より古い `state=merged` アイテムを剪定（dedup 目的を果たした）
- 状態更新後、各サイクル終わりに剪定を実行

```
# End-of-cycle maintenance
for item in buffer:
    if item.state == "new" and age_hours(item) > item.ttl_hours:
        transition(item, "expired", reason="TTL exceeded")
    if item.state in ("acted", "expired") and age_days(item) > retention_days:
        archive(item)
    if item.state == "merged" and age_hours(item) > 24:
        archive(item)
rewrite_buffer(buffer_path, active_items_only)
```

**期待結果：** すべての状態遷移がタイムスタンプと理由でログされる。バッファファイルはアクティブアイテム（new、acknowledged、cooldown）のみを含む。アーカイブされたアイテムは監査用に別途保存される。バッファは無制限に成長しない。

**失敗時：** バッファファイルが書き直し中に壊れた（部分書き、クラッシュ）なら、書き直し前バックアップから復元する。常にテンプファイルに書きアトミックにリネーム — その場で書き直さない。アーカイブが大きくなりすぎたら、月次で圧縮またはローテートする。

## バリデーション

- [ ] バッファスキーマがすべての必要フィールドを含む（id、source、timestamp、content_summary、priority、state、dedup_key、thread_id、ttl_hours）
- [ ] 取り込みがアイテムタイプ別に正しい初期優先順位を割り当てる
- [ ] 重複排除が設定された窓内で dedup_key を共有するアイテムをマージする
- [ ] スレッドバーストが検出され参加者数と共に統合される
- [ ] 合成スコアが最近度減衰とエスカレーションを適用し、優先順位 5 にキャップ
- [ ] プラットフォームごとレート制限が任意の書き込み行動前に強制される
- [ ] スレッドごとクールダウンがクールダウン窓内の再エンゲージメントを防ぐ
- [ ] ダイジェストが簡潔（<50 行）、トップ N アイテムを含み、明確な空状態を持つ
- [ ] 状態遷移が監査用にタイムスタンプ付きでログされる
- [ ] 期限切れと行動済みアイテムが削除ではなくアーカイブされる
- [ ] バッファファイルが複数サイクルにわたって無制限に成長しない

## よくある落とし穴

- **アイテムに TTL なし**: バッファが無制限に成長する; 古いアイテムが新鮮なものを押しのける。すべてのアイテムは TTL を必要とし、剪定ステップは毎サイクル動かなければならない。
- **スレッドクールダウンを無視**: 同じスレッドでの素早い返信は他の参加者にスパムに感じる。クールダウンはレート制限の技術ではなく社会規範。
- **減衰なしの優先順位**: 古い高優先順位アイテムが新しいものを無期限にブロックする。最近度減衰がバッファを歴史的重要性ではなく現在の関連性を反映するよう保証する。
- **dedup 窓が狭すぎる**: 1 時間窓は数時間離れて到着する重複（例: 通知に続くリマインダー）を逃す。24 時間で始め、正当なアイテムが誤ってマージされている場合のみ狭める。
- **バッファロジックを単一プラットフォームに結合**: 開始からアダプタパターン用に設計する。各プラットフォームアダプタは標準バッファアイテムを生成する; バッファ自身はプラットフォーム非依存。
- **ダイジェストステップをスキップ**: Du-dum は概要を必要とし、生のバッファではない。フルバッファを行動クロックに渡すと 2 クロックアーキテクチャの目的を破る — 行動クロックは簡潔なダイジェストを読み素早く決めるべき。

## 関連スキル

- `du-dum` — このバッファが構成する周期パターン; du-dum は *いつ* 観察し行動するかを決め、本スキルは *何が* 行動に値するかを決める
- `manage-token-budget` — コスト会計; バッファはダイジェストのサイジングと行動スループット制限時にトークン予算制約を尊重する
- `circuit-breaker-pattern` — バッファに供給するプラットフォームアダプタの失敗処理; アダプタの回路が開くと取り込みが優雅に劣化する
- `coordinate-reasoning` — バッファと行動システム間のスティグマージック信号; バッファファイル自体がスティグマージック成果物
- `forage-resources` — バッファの取り込みアダプタに供給する新しいエンゲージメントソースの発見
