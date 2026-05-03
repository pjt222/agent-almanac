---
name: manage-engagement-buffer
description: >
  管理跨平台摄取、优先级排序、速率限制、去重并跟踪传入参与项状态的
  engagement buffer。生成定期摘要并强制执行冷却期。与 du-dum 组合：
  du-dum 设置观察/行动节奏，本技能管理节拍间的队列。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: engagement, buffer, queue, rate-limiting, deduplication, digest, cooldown, autonomous-agents
  locale: zh-CN
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# 管理参与缓冲

跨平台摄取、去重、优先级排序并速率限制传入参与项，然后将紧凑摘要交给行动时钟。缓冲位于原始平台信号与有意行动之间：它吸收突发、合并重复、强制冷却，并确保代理首先对最高价值项行动。没有缓冲，自主代理要么按到达顺序处理项（错过埋在噪声中的紧急项），要么尝试一次做所有事（撞到速率限制并显得垃圾）。

本技能与 `du-dum` 组合：du-dum 决定*何时*观察和行动；本技能决定*什么*值得行动。缓冲是在 du-dum 节拍间累积的队列。

## 适用场景

- 自主代理收到多于其每周期能处理的参与
- 重复或近重复项浪费行动预算
- 行动时钟触发前参与需要优先级排序
- 需要冷却期防止过度参与或速率限制
- 多个平台源（GitHub、Slack、电子邮件）馈入单一代理的行动循环

## 输入

- **必需**：`buffer_path` —— JSONL 缓冲文件的路径
- **可选**：`platform_config` —— 每平台速率限制和冷却设置
- **可选**：`digest_size` —— 摘要中的顶部项数（默认：5）
- **可选**：`ttl_hours` —— 未行动项的生存时间（默认：48）
- **可选**：`cooldown_minutes` —— 行动后每线程冷却（默认：60）

## 步骤

### 第 1 步：定义缓冲架构

设计参与项结构。缓冲中的每项是带这些字段的单个 JSON 行：

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

字段定义：

| 字段 | 类型 | 描述 |
|-------|------|-------------|
| `id` | string | 唯一标识符（源前缀 + 日期 + 序列） |
| `source` | string | 平台和频道（`github:repo`、`slack:channel`、`email:inbox`） |
| `timestamp` | ISO 8601 | 项被摄取时 |
| `content_summary` | string | 参与项的单行描述 |
| `priority` | int 1-5 | 复合优先级（见第 4 步） |
| `state` | enum | `new`、`acknowledged`、`acted`、`cooldown`、`merged`、`expired` |
| `dedup_key` | string | 复合键：source + thread + author |
| `thread_id` | string | 用于冷却跟踪的对话线程标识符 |
| `ttl_hours` | int | 未行动时项过期前小时数（默认：48） |

存储为 JSON Lines 文件（每行一个 JSON 对象）。此格式支持仅追加写入、逐行处理，以及通过重写而不含已过期行轻松剪枝。

**预期结果：** 在 `buffer_path` 初始化的 JSONL 缓冲文件，架构记录在伴随注释或头中。架构稳定到足以支持所有下游步骤。

**失败处理：** 若无法创建缓冲文件（权限、路径问题），回退到当前周期的内存列表并记录文件系统错误。不要静默丢弃项 —— 在某处缓冲它们，即使临时。

### 第 2 步：实现摄取

接受来自平台适配器的项并将它们追加到缓冲，附初始优先级分配。

按项类型的优先级分配：

| 类型 | 优先级 | 理由 |
|------|----------|-----------|
| 直接提及（@agent） | 5 | 有人显式要求注意 |
| 审查请求 | 4 | 阻塞他人工作 |
| 跟踪线程中的回复 | 3 | 代理参与的活跃对话 |
| 通知（被分配、订阅） | 2 | 信息性，可能需要行动 |
| 广播（发布、公告） | 1 | 仅意识，很少可执行 |

对每个传入项：

1. 用架构字段构造项 JSON
2. 根据上述类型表分配初始优先级
3. 将 `state` 设为 `new`
4. 将 `timestamp` 设为当前 UTC 时间
5. 从 source + thread + author 生成 `dedup_key`
6. 将 JSON 行追加到缓冲文件

```
# Pseudocode: ingest from GitHub adapter
for notification in github_adapter.fetch():
    item = build_item(notification)
    item.priority = priority_by_type(notification.reason)
    item.state = "new"
    append_jsonl(buffer_path, item)
    log("ingested {item.id} priority={item.priority}")
```

**预期结果：** 新项以正确优先级和 `state=new` 出现在缓冲文件中。每个适配器独立产出格式良好的项 —— 适配器故障不阻塞其他适配器。

**失败处理：** 若平台适配器失败（认证过期、被速率限制、网络断开），记录失败并跳过此周期的该源。不要清除现有缓冲项 —— 来自先前成功获取的过时项胜过空缓冲。

### 第 3 步：去重

扫描缓冲查找在可配置窗口（默认：24 小时）内共享相同 `dedup_key` 的项。保留最高优先级实例并将其他标记为已合并。

1. 按 `dedup_key` 分组项
2. 在每组内，按优先级降序、然后时间戳降序排序
3. 保留第一项（最高优先级、最近）；将其余标记为 `state=merged`
4. 检测线程突发：相同 `thread_id` 在 1 小时内带不同作者表明活动突发 —— 合并为单项，附 participant count 到 `content_summary`

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

**预期结果：** 缓冲在窗口内不含重复 `dedup_key` 条目。线程突发被折叠为带 participant count 的单项。已合并项保留在文件中（用于审计）但被排除在下游处理之外。

**失败处理：** 若去重产出意外合并（合法不同的项共享键），收紧去重窗口或精炼键构造。向去重键添加内容散列可区分共享 source + thread + author 但内容真正不同的项。

### 第 4 步：优先级排序

按合并近期衰减和升级的复合分数重新排序缓冲。

复合分数公式：

```
score = base_priority * recency_weight * escalation_factor

recency_weight = 0.9 ^ hours_since_ingestion
escalation_factor = 1.0 + (resubmission_count * 0.2)

# Cap effective priority at 5
effective_priority = min(5, score)
```

行为：

- 0 小时前摄取的优先级 3 项：`3 * 1.0 * 1.0 = 3.0`
- 8 小时前摄取的优先级 3 项：`3 * 0.43 * 1.0 = 1.29`（衰减到优先级 2 项之下）
- 重新提交两次的优先级 2 项：`2 * 1.0 * 1.4 = 2.8`（升级到接近优先级 3）

按 `effective_priority` 降序排序所有 `state=new` 项。此排序顺序是摘要（第 6 步）呈现给 du-dum 的。

**预期结果：** 缓冲按复合分数排序。新鲜高优先级项在顶部。旧项已衰减。重新提交的项已升级。无项超过优先级 5。

**失败处理：** 若评分公式产出反直觉排名（如 1 小时前的优先级 2 项排在新鲜优先级 3 项之上），调整衰减率。每小时 0.95 衰减更温和；每小时 0.85 更激进。调整以匹配参与节奏。

### 第 5 步：强制速率限制和冷却

通过强制每平台写入限制和每线程冷却，防止代理过度参与。

**每平台速率限制**（通过 `platform_config` 可配置）：

| 平台 | 默认限制 | 窗口 |
|----------|--------------|--------|
| GitHub 评论 | 1 per 20 秒 | 滚动 |
| GitHub 审查 | 3 per 小时 | 滚动 |
| Slack 消息 | 1 per 10 秒 | 滚动 |
| 电子邮件回复 | 5 per 小时 | 滚动 |

**每线程冷却：** 代理对线程行动后，该线程进入冷却 `cooldown_minutes`（默认：60）。冷却期间，该线程的新项被摄取但不浮现在摘要中。

**错误退避：** 收到任何平台的 429/速率限制响应时，将该平台的冷却加倍。成功行动后重置为默认。

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

**预期结果：** 代理永不超过平台速率限制。线程有强制冷却期。速率限制错误触发自动退避。缓冲在冷却期间累积项而不丢失它们。

**失败处理：** 若尽管强制仍击中速率限制（时钟偏差、并发代理），增加安全余量 —— 将限制设为平台实际限制的 80%。若冷却太激进（错过时间敏感线程），仅为高优先级线程降低 `cooldown_minutes`。

### 第 6 步：生成摘要

为 du-dum 的行动节拍产出紧凑摘要。摘要是交接点：du-dum 读这个，不读原始缓冲。

摘要内容：

1. **总待处理**：`state=new` 项的计数
2. **顶部 N 项**：最高优先级项（默认 N=5 来自 `digest_size`）
3. **即将过期**：在其 TTL 20% 内的项
4. **冷却中的线程**：带剩余时间的活跃冷却
5. **缓冲健康**：总项、合并计数、过期计数

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

将摘要写入 du-dum 行动时钟读取的已知路径（如 `buffer_path.digest.md`）。

**预期结果：** 一个少于 50 行的摘要，du-dum 一次读取就能解析。摘要包含足够信息决定行动什么，但不是完整缓冲。若没有待处理，摘要清晰说明。

**失败处理：** 若摘要超过 50 行，减少 `digest_size` 或更激进地汇总过期/冷却部分。摘要是概述 —— 若它接近缓冲大小，它已失去目的。

### 第 7 步：跟踪状态转换

du-dum 处理摘要中的项后，更新它们的状态并维持审计轨迹。

状态机：

```
new → acknowledged → acted → cooldown → expired
         ↑                       │
         └───── (re-ingested) ───┘

merged → (terminal, no further transitions)
expired → (terminal, archived)
```

对每个状态转换：

1. 在缓冲文件中更新项的 `state` 字段
2. 追加转换日志条目：`{"item_id": "...", "from": "new", "to": "acknowledged", "timestamp": "...", "reason": "du-dum digest pickup"}`
3. 行动后，设置线程冷却（反馈到第 5 步）

**保留和剪枝：**

- 归档 `state=acted` 或 `state=expired` 且超过 7 天（可配置）的项
- 通过移到单独文件（`buffer_path.archive.jsonl`）归档，不删除
- 剪枝超过 24 小时的 `state=merged` 项（它们已服务其去重目的）
- 在每周期结束后、状态更新后运行剪枝

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

**预期结果：** 每个状态转换都带时间戳和原因记录。缓冲文件仅含活跃项（new、acknowledged、cooldown）。归档项单独保留以供审计。缓冲不无限增长。

**失败处理：** 若缓冲文件在重写期间损坏（部分写入、崩溃），从重写前备份恢复。始终写入临时文件并原子重命名 —— 永不就地重写。若归档过大，每月压缩或轮换。

## 验证清单

- [ ] 缓冲架构包含所有必需字段（id、source、timestamp、content_summary、priority、state、dedup_key、thread_id、ttl_hours）
- [ ] 摄取按项类型分配正确的初始优先级
- [ ] 去重合并配置窗口内共享 dedup_key 的项
- [ ] 检测线程突发并以 participant count 合并
- [ ] 复合评分应用近期衰减和升级，上限优先级 5
- [ ] 任何写操作前强制每平台速率限制
- [ ] 每线程冷却防止冷却窗口内重新参与
- [ ] 摘要紧凑（<50 行）、含顶部 N 项、有清晰空状态
- [ ] 状态转换带时间戳记录用于审计
- [ ] 过期和已行动项被归档，不删除
- [ ] 缓冲文件不在多周期内无限增长

## 常见问题

- **项无 TTL**：缓冲无限增长；过时项挤出新鲜项。每个项需要 TTL，剪枝步骤必须每周期运行。
- **忽略线程冷却**：同一线程的快速回复让其他参与者感觉垃圾。冷却是社会规范，不只是速率限制技术。
- **优先级无衰减**：旧高优先级项无限期阻塞新的。近期衰减确保缓冲反映当前相关性，而非历史重要性。
- **去重窗口太窄**：1 小时窗口错过几小时间到达的重复（如通知后跟提醒）。从 24 小时开始，仅当合法项被错误合并时才收紧。
- **将缓冲逻辑耦合到单一平台**：从一开始为适配器模式设计。每个平台适配器产出标准缓冲项；缓冲本身是平台无关的。
- **跳过摘要步骤**：du-dum 需要概述，不是原始缓冲。将完整缓冲传给行动时钟违背双时钟架构目的 —— 行动时钟应读紧凑摘要并快速决定。

## 相关技能

- `du-dum` —— 此缓冲组合的节奏模式；du-dum 决定*何时*观察和行动，本技能决定*什么*值得行动
- `manage-token-budget` —— 成本核算；缓冲在调整摘要大小和限制行动吞吐量时尊重 token 预算约束
- `circuit-breaker-pattern` —— 馈入缓冲的平台适配器的故障处理；当适配器电路打开，摄取优雅降级
- `coordinate-reasoning` —— 缓冲与行动系统间的共生信号；缓冲文件本身是共生工件
- `forage-resources` —— 发现新参与源以馈入缓冲的摄取适配器
