---
name: manage-engagement-buffer
locale: wenyan-ultra
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

# 管投入緩

收、排、限速、去重、追跨平台投入項之態。生期摘並執冷卻。與 du-dum 組：du-dum 設觀/動節，此技管拍間之列。

## 用

- 自主代理受逾週期可處之投入
- 重或近重項費動預算
- 投入須序於動鐘前
- 需冷卻以阻過投或限速
- 多平台源（GitHub、Slack、郵）饋單代理動環

## 入

- **必**：`buffer_path` — JSONL 緩文件路
- **可**：`platform_config` — 各平台限速與冷卻
- **可**：`digest_size` — 摘頂項數（默 5）
- **可**：`ttl_hours` — 未動項之生壽（默 48）
- **可**：`cooldown_minutes` — 動後線冷卻（默 60）

## 行

### 一：定緩模

設投入項結。緩中各項為單 JSON 行含此字段：

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

字段定義：

| 字段 | 型 | 述 |
|-------|------|-------------|
| `id` | 串 | 獨識（源前綴+日+序） |
| `source` | 串 | 平與道（`github:repo`、`slack:channel`、`email:inbox`） |
| `timestamp` | ISO 8601 | 項收時 |
| `content_summary` | 串 | 投入項之一行述 |
| `priority` | int 1-5 | 合排（見步四） |
| `state` | enum | `new`、`acknowledged`、`acted`、`cooldown`、`merged`、`expired` |
| `dedup_key` | 串 | 合鍵：源+線+作者 |
| `thread_id` | 串 | 話線識以追冷卻 |
| `ttl_hours` | int | 未動過期時（默 48） |

存為 JSON Lines（各行一 JSON 象）。此格支僅追寫、行處、易按重寫除過期行而清。

得：於 `buffer_path` 初 JSONL 緩文件附模於伴註或頭。模穩足支諸下游步。

敗：緩文件不可造（權、路）→當週回內存列並記文系誤。勿默棄項——存於某處，即臨。

### 二：施收

受平適配器之項並加至緩附初排：

按項型之初排：

| 型 | 排 | 理 |
|------|----------|-----------|
| 直提（@agent） | 5 | 有人明求注 |
| 審請 | 4 | 阻他人工 |
| 追線中之應 | 3 | 代理參之活話 |
| 通知（派、訂） | 2 | 信息，或需動 |
| 廣播（發、通） | 1 | 僅覺，少可動 |

各新項：

1. 由模字段構項 JSON
2. 按上表按型賦初排
3. 置 `state` 為 `new`
4. 置 `timestamp` 為當 UTC
5. 由源+線+作者生 `dedup_key`
6. 加 JSON 行至緩文件

```
# Pseudocode: ingest from GitHub adapter
for notification in github_adapter.fetch():
    item = build_item(notification)
    item.priority = priority_by_type(notification.reason)
    item.state = "new"
    append_jsonl(buffer_path, item)
    log("ingested {item.id} priority={item.priority}")
```

得：新項現於緩附正排與 `state=new`。各適配器獨生合格項——適配器敗不阻他。

敗：平適配器敗（認過期、限速、網斷）→記敗並略此週之源。勿清現緩項——前成功取之陳項較空緩佳。

### 三：去重

掃緩於可配窗（默 24 時）內共 `dedup_key` 之項。保最高排並他標為合：

1. 按 `dedup_key` 組
2. 各組按排降、時降排
3. 保首（排最高、時最近）；他標 `state=merged`
4. 察線潮：同 `thread_id` 於 1 時內異作者示活動潮——合為單項附參者計加於 `content_summary`

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

得：緩無窗內重 `dedup_key` 項。線潮縮為單項附參者計。合項保於文件（審用）而除下游處外。

敗：去重生意外合（合法異項共鍵）→窄去重窗或精鍵構。加容散於去重鍵可辨共源+線+作者而容真異之項。

### 四：排序

按合分（含近衰與升級）重排緩：

合分式：

```
score = base_priority * recency_weight * escalation_factor

recency_weight = 0.9 ^ hours_since_ingestion
escalation_factor = 1.0 + (resubmission_count * 0.2)

# Cap effective priority at 5
effective_priority = min(5, score)
```

行為：

- 排 3 項收 0 時前：`3 * 1.0 * 1.0 = 3.0`
- 排 3 項收 8 時前：`3 * 0.43 * 1.0 = 1.29`（衰下於排 2 項）
- 排 2 項二次重提：`2 * 1.0 * 1.4 = 2.8`（升近排 3）

排諸 `state=new` 項按 `effective_priority` 降。此排序即摘（步六）呈予 du-dum 者。

得：緩按合分排。新高排項於頂。老項衰。重提項升。無項逾排 5。

敗：若分式生反直覺排（如 1 時前排 2 項排上於新排 3）→調衰率。0.95/時 較和；0.85/時 較激。調以匹投入節奏。

### 五：執限速與冷卻

以各平寫限與線冷卻阻代理過投：

**平限速**（由 `platform_config` 配）：

| 平 | 默限 | 窗 |
|----------|--------------|--------|
| GitHub 評 | 1/20 秒 | 滾 |
| GitHub 審 | 3/時 | 滾 |
| Slack 訊 | 1/10 秒 | 滾 |
| 郵回 | 5/時 | 滾 |

**線冷卻**：代理動線後，該線入冷卻 `cooldown_minutes`（默 60）。冷卻中新項收而不於摘現。

**誤退**：受任平之 429/限速應→翻該平冷卻。成動後重設默。

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

得：代理永不逾平限速。線有執冷卻。限誤觸自退。緩冷卻中積項不失。

敗：即有執而限被觸（鐘偏、並代理）→加安全餘——設限為平實限之 80%。冷卻過激（失時敏線）→僅為高排線減 `cooldown_minutes`。

### 六：生摘

生 du-dum 動拍之緊要。摘乃交點：du-dum 讀之非原緩。

摘容：

1. **總待**：`state=new` 項計
2. **頂 N 項**：最高排項（默 N=5 由 `digest_size`）
3. **將期**：於 TTL 之 20% 內項
4. **冷卻中線**：活冷卻附餘時
5. **緩健**：總項、合計、期計

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

寫摘至已知路（如 `buffer_path.digest.md`）供 du-dum 動鐘讀。

得：摘 < 50 行，du-dum 一讀解。摘含決動何之信息，非全緩。無待→摘明言。

敗：摘 > 50 行→減 `digest_size` 或更激總期/冷卻節。摘乃總——若近緩之大→失目。

### 七：追態轉

du-dum 由摘處項後，更態並維審跡：

態機：

```
new → acknowledged → acted → cooldown → expired
         ↑                       │
         └───── (re-ingested) ───┘

merged → (終，無轉)
expired → (終，歸檔)
```

各態轉：

1. 更緩文件中項 `state` 字段
2. 加轉日誌條：`{"item_id": "...", "from": "new", "to": "acknowledged", "timestamp": "...", "reason": "du-dum digest pickup"}`
3. 動後設線冷卻（饋回步五）

**保留與修剪**：

- `state=acted` 或 `state=expired` 逾 7 日之項歸檔（可配）
- 以移至別文件歸檔（`buffer_path.archive.jsonl`），非刪
- `state=merged` 逾 24 時項修剪（已服去重目）
- 各週終運修剪，於態更後

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

得：各態轉記時戳與理。緩文件僅含活項（new、acknowledged、cooldown）。歸項別存供審。緩不無界長。

敗：緩文件重寫時壞（部寫、崩）→由重寫前備恢。必寫臨文件並原子改名——勿原地重寫。歸過大→月壓或輪。

## 驗

- [ ] 緩模含諸必字段（id、source、timestamp、content_summary、priority、state、dedup_key、thread_id、ttl_hours）
- [ ] 收按項型賦正初排
- [ ] 去重合窗內共 dedup_key 項
- [ ] 線潮察並合附參計
- [ ] 合分用近衰與升級，上限排 5
- [ ] 任寫動前執平限速
- [ ] 線冷卻阻冷卻窗內重投
- [ ] 摘緊（< 50 行）、含頂 N 項、有明空態
- [ ] 態轉記時戳供審
- [ ] 期與動項歸檔，非刪
- [ ] 緩文件跨週無界長

## 忌

- **項無 TTL**：緩無界長；陳項排擠新。各項需 TTL，修剪步各週當運
- **忽線冷卻**：同線連應於他參覺 spam。冷卻為社範非僅限速技
- **排無衰**：老高排項無限阻新。近衰確緩反當前相關非歷要
- **去重窗過窄**：1 時窗失隔時達之重（如通知後提醒）。始以 24 時僅於合項誤合時窄
- **緩邏輯耦於單平**：始時為適配器式設。各平適配器生標緩項；緩本平無關
- **略摘步**：du-dum 需總非原緩。傳全緩至動鐘失雙鐘架之目——動鐘當讀緊摘速決

## 參

- `du-dum` — 此緩組之節式；du-dum 決何時觀動，此技決何值動
- `manage-token-budget` — 本算；緩設摘尺並限動吞吐時守令牌約
- `circuit-breaker-pattern` — 饋緩之平適配器敗處；適配器斷路開時收優雅降
- `coordinate-reasoning` — 緩與動系間之群痕信號；緩文件本為群痕物
- `forage-resources` — 察饋緩收適配器之新投入源
