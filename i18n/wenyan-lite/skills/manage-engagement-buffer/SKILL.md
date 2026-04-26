---
name: manage-engagement-buffer
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
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
---

# 管互動緩衝

跨平台吸入、去重、排序、限速入互動項，再交緊縮摘於動作時鐘。緩衝居原始平台信號與刻意行動間：吸突發、合重、施冷卻，並確代理先於最高值項行動。無緩衝則自主代理或按到序處（失藏於噪之急迫者）或一時試盡（遇速限而似垃圾）。

此技能與 `du-dum` 組合：du-dum 決 *何時* 察並行；此技能決 *何值* 行。緩衝即 du-dum 節拍間所積之佇列。

## 適用時機

- 自主代理所受互動過每週期之處能
- 重或近重項費行動預算
- 動作時鐘觸發前互動需優先排
- 需冷卻期以防過互動或速限
- 多平台源（GitHub、Slack、電郵）飼單一代理之行動環

## 輸入

- **必要**：`buffer_path` — JSONL 緩衝文件之路
- **選擇性**：`platform_config` — 每平台速限與冷卻設置
- **選擇性**：`digest_size` — 摘中頂項之數（默 5）
- **選擇性**：`ttl_hours` — 未行項之存活時（默 48）
- **選擇性**：`cooldown_minutes` — 行後每線冷卻（默 60）

## 步驟

### 步驟一：定緩衝模式

設計互動項結構。緩衝中每項為含此域之單一 JSON 行：

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

域定義：

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

存為 JSON Lines 文件（每 JSON 物件一行）。此格式支追加式寫、逐行處理，並以重寫無已過行而易清。

**預期：** 於 `buffer_path` 初始化之 JSONL 緩衝文件附於伴注釋或標頭記錄之模式。模式夠穩以支所有下游步。

**失敗時：** 若緩衝文件不能創（權限、路問題），退為當週期之內存清單並記文件系統誤。勿默丟項——於某處緩之，即臨亦然。

### 步驟二：行吸入

自平台適配器受項並以初優先分派追加於緩衝。

按項類分優先：

| Type | Priority | Rationale |
|------|----------|-----------|
| Direct mention (@agent) | 5 | Someone explicitly asked for attention |
| Review request | 4 | Blocking someone else's work |
| Reply in tracked thread | 3 | Active conversation the agent participates in |
| Notification (assigned, subscribed) | 2 | Informational, may require action |
| Broadcast (release, announcement) | 1 | Awareness only, rarely actionable |

對每來項：

1. 以模式之域構項 JSON
2. 依上類表分初優先
3. 設 `state` 為 `new`
4. 設 `timestamp` 為當前 UTC 時
5. 自 source + thread + author 生 `dedup_key`
6. 追加 JSON 行於緩衝文件

```
# Pseudocode: ingest from GitHub adapter
for notification in github_adapter.fetch():
    item = build_item(notification)
    item.priority = priority_by_type(notification.reason)
    item.state = "new"
    append_jsonl(buffer_path, item)
    log("ingested {item.id} priority={item.priority}")
```

**預期：** 新項現於緩衝文件附正確優先與 `state=new`。每適配器獨立產良形項——適配器敗不阻他適配器。

**失敗時：** 若平台適配器敗（認證過期、速限、網斷），記敗並略此源之本週期。勿清既緩衝項——先前成功取之陳項勝於空緩衝。

### 步驟三：去重

掃緩衝尋於可配窗（默 24 時）內共 `dedup_key` 之項。保最高優先之例並標他者為已合。

1. 以 `dedup_key` 分組項
2. 每組內，以優先降、再時間降排
3. 保首項（最高優先、最新）；標餘為 `state=merged`
4. 察線突發：同 `thread_id` 於 1 時內異作者之活躍示突發——合為單一項附參與者計於 `content_summary`

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

**預期：** 緩衝於窗內無重 `dedup_key` 條目。線突發合為附參與計之單一項。已合項留於文件（供審）而於下游處理排除。

**失敗時：** 若去重生意外合（合理異項共鍵），窄去重窗或精鍵構。加內容哈希於去重鍵可別共 source + thread + author 而內容真異之項。

### 步驟四：排序

以含最近衰減與升級之合分重排緩衝。

合分式：

```
score = base_priority * recency_weight * escalation_factor

recency_weight = 0.9 ^ hours_since_ingestion
escalation_factor = 1.0 + (resubmission_count * 0.2)

# Cap effective priority at 5
effective_priority = min(5, score)
```

行為：

- 0 時前吸之優先 3 項：`3 * 1.0 * 1.0 = 3.0`
- 8 時前吸之優先 3 項：`3 * 0.43 * 1.0 = 1.29`（衰減至優先 2 項下）
- 二次重提之優先 2 項：`2 * 1.0 * 1.4 = 2.8`（升級近優先 3）

以 `effective_priority` 降序排所有 `state=new` 項。此序即摘（步驟六）呈 du-dum 者。

**預期：** 緩衝已以合分排。新鮮高優先項居頂。老項已衰。重提項已升。無項超優先 5。

**失敗時：** 若分式產反直覺排名（如 1 時前之優先 2 項排於新鮮優先 3 項之上），調衰率。0.95 時之衰較柔；0.85 時之衰較烈。調以匹互動節奏。

### 步驟五：施速限與冷卻

以施每平台寫限與每線冷卻防代理過互動。

**每平台速限**（可經 `platform_config` 配）：

| Platform | Default limit | Window |
|----------|--------------|--------|
| GitHub comments | 1 per 20 seconds | rolling |
| GitHub reviews | 3 per hour | rolling |
| Slack messages | 1 per 10 seconds | rolling |
| Email replies | 5 per hour | rolling |

**每線冷卻**：代理於線行後，該線入冷卻 `cooldown_minutes`（默 60）。冷卻中，該線新項吸入而不呈於摘。

**誤退縮**：自任平台受 429/速限響應時，平台冷卻倍之。成行後重置為默。

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

**預期：** 代理從不超平台速限。線有施之冷卻期。速限誤觸自動退縮。緩衝於冷卻期積項而不失。

**失敗時：** 若施而仍中速限（時鐘偏、並發代理），增安邊——設限為平台實限之 80%。若冷卻過烈（失時敏線），僅為高優先線減 `cooldown_minutes`。

### 步驟六：生摘

產供 du-dum 行動節拍之緊摘。摘為交接點：du-dum 讀此，非原緩衝。

摘內容：

1. **總待**：`state=new` 項數
2. **頂 N 項**：最高優先項（默 N=5 自 `digest_size`）
3. **將過**：於其 TTL 20% 內之項
4. **冷卻中之線**：附剩時之活冷卻
5. **緩衝健康**：總項、合計、過計

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

書摘於已知路（如 `buffer_path.digest.md`）供 du-dum 之行動時鐘讀。

**預期：** 不過 50 行之摘，du-dum 可一讀解之。摘含足信息以決何行，而非全緩衝。若無待，摘明陳之。

**失敗時：** 若摘過 50 行，減 `digest_size` 或更激總將過/冷卻節。摘為總——若近緩衝大小，已失其旨。

### 步驟七：追狀態轉換

du-dum 處摘之項後，更其狀並維審計軌。

狀態機：

```
new → acknowledged → acted → cooldown → expired
         ↑                       │
         └───── (re-ingested) ───┘

merged → (terminal, no further transitions)
expired → (terminal, archived)
```

每狀態轉換：

1. 於緩衝文件更項之 `state` 域
2. 追加轉換日誌：`{"item_id": "...", "from": "new", "to": "acknowledged", "timestamp": "...", "reason": "du-dum digest pickup"}`
3. 行後設線冷卻（反饋於步驟五）

**保留與修剪：**

- 歸檔 7 日（可配）以上 `state=acted` 或 `state=expired` 之項
- 以移至分文件（`buffer_path.archive.jsonl`）歸，非刪
- 剪 24 時以上之 `state=merged` 項（其已服去重之旨）
- 於每週期末，狀更後行剪

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

**預期：** 每狀態轉換以時戳與理由記。緩衝文件僅含活項（new、acknowledged、cooldown）。歸項供審分存。緩衝不無限長。

**失敗時：** 若緩衝文件於重寫中壞（部分寫、崩），自重寫前備份復。恒書於臨文件並原子重命名——勿就地重寫。若歸檔過大，月壓或輪換。

## 驗證

- [ ] 緩衝模式含所有所需域（id、source、timestamp、content_summary、priority、state、dedup_key、thread_id、ttl_hours）
- [ ] 吸入按項類分正確初優先
- [ ] 去重合於所配窗內共 dedup_key 之項
- [ ] 線突發已察並以參與計合
- [ ] 合分用最近衰減與升級，封於優先 5
- [ ] 每平台速限於任寫行動前已施
- [ ] 每線冷卻於冷卻窗內阻再互動
- [ ] 摘緊（<50 行），含頂 N 項，並有明空態
- [ ] 狀態轉換附時戳記供審
- [ ] 過與已行項歸而不刪
- [ ] 緩衝文件跨多週期不無限長

## 常見陷阱

- **項無 TTL**：緩衝無限長；陳項擠新者。每項需 TTL，且修剪步每週期必行
- **忽線冷卻**：同線連答於他參與者感似垃圾。冷卻為社會規，非僅速限之技術
- **無衰之優先**：老高優先項無限阻新者。最近衰確緩衝反當前相關，非歷史重要
- **去重窗過窄**：1 時窗失相隔數時之重（如通知後提醒）。始於 24 時而僅於合理項被誤合時窄
- **緩衝邏耦於單平台**：始設計適配器模式。每平台適配器產標緩衝項；緩衝本身平台不可知
- **略摘步**：du-dum 需總，非原緩衝。傳全緩衝於行動時鐘敗二時鐘架構之旨——行動時鐘當讀緊摘並速決

## 相關技能

- `du-dum` — 此緩衝組之節奏模式；du-dum 決 *何時* 察並行，此技能決 *何值* 行
- `manage-token-budget` — 成本核算；緩衝於摘尺寸與限行動吞吐時敬令牌預算約束
- `circuit-breaker-pattern` — 飼緩衝之平台適配器之敗處理；適配器之電路開時，吸入優雅退化
- `coordinate-reasoning` — 緩衝與行動系統間之 stigmergic 信號；緩衝文件本身為 stigmergic 物件
- `forage-resources` — 發現新互動源以飼緩衝之吸入適配器
