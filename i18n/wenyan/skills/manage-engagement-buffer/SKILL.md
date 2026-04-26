---
name: manage-engagement-buffer
locale: wenyan
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

# 管交流緩衝

跨平台納、序、限速、去重、追來交流項之態，生週期摘要並施冷卻。緩衝居原平台信與慎行之間：納爆發、合重項、施冷卻、確代理先行於最值之項。無緩衝，自主代理或依到達序處（失噪中埋之急），或齊試諸（犯速限而似濫）。

此技與 `du-dum` 合：du-dum 定*何時*觀與行；此技定*何*值行。緩衝乃累於 du-dum 之拍間之隊。

## 用時

- 自主代理每週得交流逾其可處
- 重或近重之項耗行之預算
- 行之鐘啟前，交流需序
- 需冷卻以阻過交或速限
- 多平台源（GitHub、Slack、郵）匯入一代理之行環

## 入

- **必要**：`buffer_path` — JSONL 緩衝檔之路
- **可選**：`platform_config` — 各平台之速限與冷卻設
- **可選**：`digest_size` — 摘要中頂項之數（預設：5）
- **可選**：`ttl_hours` — 未行項之存期（預設：48）
- **可選**：`cooldown_minutes` — 行後線之冷卻（預設：60）

## 法

### 第一步：定緩衝模式

設交流項之結。緩衝中每項為單 JSON 行，具下欄：

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

欄之定：

| 欄 | 類 | 述 |
|-------|------|-------------|
| `id` | string | 唯一識別字（源頭 + 日 + 序） |
| `source` | string | 平台與通道（`github:repo`、`slack:channel`、`email:inbox`） |
| `timestamp` | ISO 8601 | 項納之時 |
| `content_summary` | string | 交流項之一行述 |
| `priority` | int 1-5 | 合序（見第四步） |
| `state` | enum | `new`、`acknowledged`、`acted`、`cooldown`、`merged`、`expired` |
| `dedup_key` | string | 合鍵：源 + 線 + 作者 |
| `thread_id` | string | 為冷卻追之談線識別字 |
| `ttl_hours` | int | 項不行則期時（預設：48） |

存為 JSON Lines 檔（每行一 JSON 物）。此格支僅附之寫、行對行處、並以重寫（除已過期之行）易剪。

**得：**JSONL 緩衝檔已於 `buffer_path` 初始，具述於伴之註或頭。模式穩足以支諸下游之步。

**敗則：**若緩衝檔不可建（權限、路問），此週期退至內存列並記檔系之誤。勿靜棄項——緩衝之於某處，即暫。

### 第二步：施納

受自平台適配器之項，附之於緩衝並設初序。

類之初序：

| 類 | 序 | 理 |
|------|----------|-----------|
| 直提 (@agent) | 5 | 有人明求注 |
| 審請 | 4 | 阻他人之工 |
| 追線之回 | 3 | 代理所參之活談 |
| 通知（指、訂） | 2 | 訊，或需行 |
| 廣告（發布、宣） | 1 | 僅覺，鮮可行 |

每入項：

1. 以模式之欄構項之 JSON
2. 依上類表設初序
3. 設 `state` 為 `new`
4. 設 `timestamp` 為當前 UTC
5. 以源 + 線 + 作者生 `dedup_key`
6. 附 JSON 行於緩衝檔

```
# Pseudocode: ingest from GitHub adapter
for notification in github_adapter.fetch():
    item = build_item(notification)
    item.priority = priority_by_type(notification.reason)
    item.state = "new"
    append_jsonl(buffer_path, item)
    log("ingested {item.id} priority={item.priority}")
```

**得：**新項現於緩衝檔，序正、`state=new`。每適配器獨生形良之項——適配器之敗不阻他。

**敗則：**若平台適配器敗（認證過、速限、網斷），記敗並略此週期之源。勿清既緩衝之項——前成所納之陳項較空緩衝為善。

### 第三步：去重

掃緩衝為共 `dedup_key` 之項於可設之窗（預設：24 小時）。留最高序之項，他標為已合。

1. 依 `dedup_key` 聚項
2. 每聚內，依序降、時戳降排
3. 留首項（序最高、時最新）；餘標 `state=merged`
4. 察線爆：同 `thread_id` 於 1 小時內異作者示活爆——合為單項並於 `content_summary` 附參與者數

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

**得：**緩衝於窗內無重 `dedup_key`。線爆已塌為單項附參與者數。合之項仍於檔（為審）而除於下游處。

**敗則：**若去重生不期之合（異項共鍵），窄去重之窗或精鍵之構。於 dedup_key 加內容之雜湊可別同源線作者而實異內容之項。

### 第四步：序

以含新近衰與升之合分重序緩衝。

合分式：

```
score = base_priority * recency_weight * escalation_factor

recency_weight = 0.9 ^ hours_since_ingestion
escalation_factor = 1.0 + (resubmission_count * 0.2)

# Cap effective priority at 5
effective_priority = min(5, score)
```

行為：

- 0 小時前納之序-3 項：`3 * 1.0 * 1.0 = 3.0`
- 8 小時前納之序-3 項：`3 * 0.43 * 1.0 = 1.29`（衰於序-2 下）
- 重提二次之序-2 項：`2 * 1.0 * 1.4 = 2.8`（升近序-3）

以 `effective_priority` 降排諸 `state=new` 項。此序乃摘要（第六步）呈 du-dum 者。

**得：**緩衝依合分排。新高序項於頂。老項已衰。重提項已升。無項逾序 5。

**敗則：**若式生不直覺之排（如 1 小時之序-2 項居新序-3 項上），調衰率。每時 0.95 較柔；每時 0.85 較激。調以配交流之速。

### 第五步：施速限與冷卻

施每平台寫之限與每線冷卻以阻代理過交。

**每平台速限**（以 `platform_config` 配）：

| 平台 | 預設限 | 窗 |
|----------|--------------|--------|
| GitHub comments | 1 per 20 seconds | rolling |
| GitHub reviews | 3 per hour | rolling |
| Slack messages | 1 per 10 seconds | rolling |
| Email replies | 5 per hour | rolling |

**每線冷卻**：代理行線後，彼線冷卻 `cooldown_minutes`（預設：60）。冷卻中，彼線之新項仍納而不現於摘要。

**誤退**：任何平台受 429／速限應，加倍彼平台之冷卻。成行後復預設。

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

**得：**代理永不逾平台速限。諸線具施之冷卻。速限誤觸自動退。冷卻中緩衝累項而不失。

**敗則：**若施而仍犯速限（時差、並發代理），增安邊——設限為平台實限之 80%。若冷卻過激（失時敏之線），唯為高序線減 `cooldown_minutes`。

### 第六步：生摘要

為 du-dum 之行拍產簡總。摘要乃交接之點：du-dum 讀此，非原緩衝。

摘要之內容：

1. **待總**：`state=new` 項之計
2. **頂-N 項**：最高序項（`digest_size` 預設 N=5）
3. **將到期**：於其 TTL 之 20% 內之項
4. **冷卻之線**：活冷卻及餘時
5. **緩衝健**：總項、合計、過期計

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

寫摘要於既知之路（如 `buffer_path.digest.md`），du-dum 之行鐘讀之。

**得：**摘要 50 行下，du-dum 一讀可解。摘要含足以決所行之息，而非全緩衝。若無待者，摘要清告之。

**敗則：**若摘要逾 50 行，減 `digest_size` 或更激述將到期／冷卻節。摘要乃總——若近緩衝之大，則失其旨。

### 第七步：追態轉

du-dum 處摘要之項後，更其態並持審軌。

態機：

```
new → acknowledged → acted → cooldown → expired
         ↑                       │
         └───── (re-ingested) ───┘

merged → (terminal, no further transitions)
expired → (terminal, archived)
```

每態轉：

1. 於緩衝檔更項之 `state` 欄
2. 附轉記：`{"item_id": "...", "from": "new", "to": "acknowledged", "timestamp": "...", "reason": "du-dum digest pickup"}`
3. 行後設線冷卻（反饋入第五步）

**留與剪**：

- 存 `state=acted` 或 `state=expired` 逾 7 日之項（可配）
- 以移至他檔（`buffer_path.archive.jsonl`）存之，勿刪
- 剪 `state=merged` 逾 24 小時之項（彼已盡其去重之用）
- 每週期末態更後行剪

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

**得：**每態轉有時戳與理之記。緩衝檔僅含活項（new、acknowledged、cooldown）。存項另存以備審。緩衝不無限長。

**敗則：**若緩衝檔於重寫中損（部分寫、崩），自重寫前之備還。恆寫於暫檔並原子易名——勿原地重寫。存過大則月壓或輪。

## 驗

- [ ] 緩衝模式含諸需欄（id、source、timestamp、content_summary、priority、state、dedup_key、thread_id、ttl_hours）
- [ ] 納以項類設正初序
- [ ] 去重於配之窗內合共 dedup_key 之項
- [ ] 線爆已察並塌附參與者數
- [ ] 合分施新近衰與升，上限為序 5
- [ ] 每平台速限於寫行前施
- [ ] 每線冷卻阻窗內重交
- [ ] 摘要簡（<50 行），含頂-N 項，具清之空態
- [ ] 態轉記時戳以備審
- [ ] 過期與已行項已存，未刪
- [ ] 緩衝檔跨多週期不無限長

## 陷

- **項無 TTL**：緩衝無限長；陳項擠新。每項須 TTL，剪步每週期須行
- **忽線冷卻**：同線速連之回於他參者似濫。冷卻乃社會之範，非僅速限之技
- **序無衰**：老高序項無限阻新。新近衰確緩衝反當下相關，非歷要
- **去重窗過窄**：一小時之窗失時隔之重（如通知繼以提醒）。始於 24 小時，僅合法項誤合時乃窄之
- **緩衝邏輯偶於單平台**：初即設為適配器之式。每平台適配器生標準緩衝項；緩衝本身與平台無關
- **略摘要之步**：du-dum 需總，非原緩衝。將全緩衝傳行鐘敗二鐘之構之旨——行鐘當讀簡摘並速決

## 參

- `du-dum` — 此緩衝所合之速式；du-dum 定*何時*觀與行，此技定*何*值行
- `manage-token-budget` — 費核；緩衝於摘要之大與限行吞時尊詞元預算之約
- `circuit-breaker-pattern` — 供緩衝之平台適配器之敗處；適配器環開時納優雅降
- `coordinate-reasoning` — 緩衝與行系間之化學信；緩衝檔本身乃化學之物
- `forage-resources` — 新交流源之發現以供緩衝之納適配器
