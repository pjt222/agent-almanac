---
name: du-dum
description: >
  使用双时钟架构在自主代理循环中将昂贵的观察与廉价的决策分离。快时钟将
  数据累积到摘要文件中；慢时钟读取摘要并仅在有待办事项时行动。空闲周期
  零成本，因为行动时钟在读取空摘要后立即返回。在构建必须持续观察但只能
  偶尔行动的自主代理时、当 API 或 LLM 成本占主导且大多数周期无事可做时、
  在设计具有观察和行动阶段的基于 cron 的代理架构时，或当现有心跳循环因
  每次 tick 调用 LLM 而过于昂贵时使用。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: autonomous-agents, cost-optimization, two-clock, digest, heartbeat, batch-then-act, cron
  locale: zh-CN
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Du-Dum：先批处理后行动模式

使用以不同频率运行的两个时钟分离观察与行动。快时钟（分析）廉价地收集数据并写入紧凑摘要。慢时钟（行动）读取摘要并决定是否行动。如果摘要表示无待办事项，行动时钟立即退出 —— 空闲周期零成本。

名称源自心跳节律：du-dum、du-dum。第一拍（du）观察；第二拍（dum）行动。多数时候，只有第一拍触发。

## 适用场景

- 构建预算受限、必须比行动更频繁地观察的自主代理
- 现有心跳循环每个 tick 都调用 LLM，即使没有变化
- 观察廉价（API 读取、文件解析、日志扫描），但行动昂贵（LLM 调用、写操作、通知）
- 你需要解耦故障：若观察失败，最后一份好摘要对行动时钟仍应有效
- 设计基于 cron 的代理架构，分析和行动作为独立作业运行

## 输入

- **必需**：快时钟应观察的数据源列表（API、文件、日志、信息源）
- **必需**：摘要指示有待办工作时慢时钟应采取的行动
- **可选**：快时钟间隔（默认：每 4 小时）
- **可选**：慢时钟间隔（默认：每天一次）
- **可选**：每日成本上限（用于验证时钟配置）
- **可选**：摘要格式偏好（markdown、JSON、YAML）

## 步骤

### 第 1 步：识别两个时钟

将所有工作分为观察（廉价、频繁）和行动（昂贵、罕见）。

1. 列出当前循环或计划工作流中的每个操作
2. 将每个分类为观察（读取数据、产出摘要）或行动（调用 LLM、写入输出、发送消息）
3. 验证拆分：观察应有零或近零的边际成本；行动应是昂贵操作
4. 分配频率：快时钟运行频繁到能捕捉事件；慢时钟运行频繁到满足响应时间要求

| 时钟 | 成本特征 | 频率 | 示例 |
|-------|-------------|-----------|---------|
| 快（分析） | 廉价：API 读取、文件解析、无 LLM | 每天 4-6 次 | 扫描 GitHub 通知、解析 RSS、读取日志 |
| 慢（行动） | 昂贵：LLM 推理、写操作 | 每天 1 次 | 撰写响应、更新仪表板、发送告警 |

**预期结果：** 清晰的双列拆分，每个操作恰好分配给一个时钟。快时钟无 LLM 调用；慢时钟无数据收集。

**失败处理：** 若操作既需读取又需 LLM 推理（如"汇总新 issue"），拆分它：快时钟将原始 issue 收集到摘要；慢时钟汇总它们。摘要是边界。

### 第 2 步：设计摘要格式

摘要是连接两个时钟的低带宽消息。它必须紧凑、人类可读、机器可解析。

1. 定义摘要文件路径和格式（推荐 markdown 用于人类调试）
2. 包含带时间戳和源元数据的头部
3. 定义列出需要行动项的"pending"部分
4. 定义带当前状态的"status"部分（用于仪表板或日志）
5. 包含清晰的空状态指示器（如 `pending: none` 或空部分）

示例摘要结构：

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

无待办事项时：

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

**预期结果：** 一个带有清晰 pending/empty 状态的摘要模板。行动时钟可通过检查单个字段或部分来确定是否继续。

**失败处理：** 若摘要变得太大（>50 行），快时钟包含了过多原始数据。将细节移到单独的数据文件，保持摘要为带指针的概述。

### 第 3 步：实现快时钟（分析）

构建按快速调度运行的观察脚本。

1. 每个数据源创建一个脚本（保持故障独立）
2. 每个脚本读取其源、提取相关事件，并追加或重写摘要
3. 使用文件锁或原子写入防止部分摘要
4. 将分析运行（时间戳、找到的项、错误）记录到单独的日志文件
5. 永不调用 LLM 或执行更新摘要之外的写操作

```
# Pseudocode: analyze-notifications.sh
fetch_notifications()
filter_actionable(notifications)
format_as_digest_entries(filtered)
atomic_write(digest_path, entries)
log("analyzed {count} notifications, {pending} actionable")
```

调度示例（cron）：
```
# Fast clock: analyze every 4 hours
30 */4 * * *  /path/to/analyze-notifications.sh >> /var/log/analysis.log 2>&1
0  6   * * *  /path/to/analyze-pr-status.sh     >> /var/log/analysis.log 2>&1
```

**预期结果：** 一个或多个分析脚本，每个产出或更新摘要文件。脚本独立运行 —— 若一个失败，其他仍更新各自部分。

**失败处理：** 若数据源暂时不可用，脚本应记录错误并保留先前摘要条目完好。源故障时不要清除摘要 —— 对行动时钟而言，过时数据胜过缺失数据。

### 第 4 步：实现慢时钟（行动）

构建读取摘要并决定是否行动的行动脚本。

1. 读取摘要文件（每个行动周期的第 0 步）
2. 检查 pending 部分：若空或 "none"，立即退出并记录日志条目
3. 若有待办事项，调用昂贵操作（LLM 调用、消息撰写等）
4. 行动后，清除或归档已处理的摘要条目
5. 记录行动运行（处理的项、成本、持续时间）

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

调度示例（cron）：
```
# Slow clock: act once per day at 7am
0 7 * * *  /path/to/heartbeat.sh >> /var/log/heartbeat.log 2>&1
```

**预期结果：** 行动脚本在空闲周期内 1 秒内退出（仅文件读取和空检查）。在活跃周期内，处理待办事项并清除摘要。

**失败处理：** 若 LLM 调用失败，不要清除摘要。待办事项保留供下个行动周期。考虑在摘要中实现重试计数器，以避免对永久失败项的无限重试。

### 第 5 步：配置空闲检测

成本节省源于空闲检测 —— 行动时钟必须以最小开销可靠地区分"无事可做"与"有事可做"。

1. 将空闲检查定义为单个、快速的操作（文件读取 + 字符串检查）
2. 验证空闲路径无外部调用（无 API、无 LLM、无网络）
3. 测量空闲路径持续时间 —— 应在 1 秒以下
4. 对空闲周期与活跃周期采用不同的日志记录方式以便监视

```bash
# Minimal idle check
if grep -q "^(none)$" "$DIGEST_PATH" || grep -q "pending: 0" "$DIGEST_PATH"; then
    echo "$(date -u +%FT%TZ) heartbeat: idle" >> "$LOG_PATH"
    exit 0
fi
```

**预期结果：** 空闲路径是单次文件读取后跟字符串匹配。无网络调用、除脚本本身外无进程产生。

**失败处理：** 若空闲检查不可靠（误报导致漏工作，或漏报导致不必要的 LLM 调用），简化摘要格式。文件顶部的单个布尔字段（`has_pending: true/false`）是最可靠的方法。

### 第 6 步：验证成本模型

计算预期成本以确认双时钟架构带来节省。

1. 计算每天快时钟运行：`fast_runs = 24 / fast_interval_hours`
2. 计算每天慢时钟运行：通常为 1
3. 计算观察成本：`fast_runs * cost_per_analysis_run`（若无 LLM 应约为 $0）
4. 计算行动成本：`active_days_fraction * cost_per_action_run`
5. 计算空闲成本：`(1 - active_days_fraction) * cost_per_idle_check`（应约为 $0）
6. 与原单循环成本比较

成本比较示例：

| 架构 | 每日成本（活跃） | 每日成本（空闲） | 月度成本（80% 空闲） |
|-------------|--------------------|--------------------|------------------------|
| 单循环（每 30 分钟 LLM） | $13.74/37h | $13.74/37h | ~$400 |
| Du-dum（6 次分析 + 1 次行动） | $0.30 | $0.00 | ~$6 |

**预期结果：** 成本模型显示在空闲日 du-dum 架构比原始至少便宜 10 倍。

**失败处理：** 若成本模型未显示显著节省，可能是以下之一：(a) 快时钟过频，(b) 快时钟包含隐藏的 LLM 调用，或 (c) 系统很少空闲。Du-dum 受益于高空闲比的系统。若系统始终活跃，更简单的轮询方法可能更合适。

## 验证清单

- [ ] 快慢时钟干净分离，快路径无 LLM 调用
- [ ] 摘要格式有清晰的空状态指示器
- [ ] 空闲检测在 1 秒内退出且无外部调用
- [ ] 快时钟故障不损坏摘要（保留过时数据）
- [ ] 慢时钟故障不清除待办事项（下个周期重试）
- [ ] 成本模型显示空闲日相比单循环架构至少 10 倍节省
- [ ] 两个时钟都记录其运行供监视和调试
- [ ] 摘要不无限增长（处理后归档或清除旧条目）

## 常见问题

- **摘要无限增长**：若快时钟追加但慢时钟从不清除，摘要变成不断增长的日志。行动周期完成后始终清除或归档已处理条目。
- **快时钟过快**：在事件每天到达时每 5 分钟运行分析浪费 API 配额和磁盘 I/O。匹配快时钟频率到数据源的实际事件率。
- **慢时钟过慢**：若行动窗口为每天一次但事件需要同小时响应，慢时钟过慢。增加其频率或添加触发立即行动的紧急事件捷径。
- **快时钟中的 LLM 调用**：若快时钟包含 LLM 推理，整个成本模型崩溃。审计每个快时钟脚本以确认零 LLM 调用。若需汇总，推迟到慢时钟。
- **耦合快时钟脚本**：若一个分析脚本依赖另一个的输出，第一个失败会级联。保持快时钟脚本独立 —— 每个读取自己源并写入自己摘要部分。
- **静默空闲日志记录**：若空闲周期不产出日志输出，无法区分"运行且空闲"与"崩溃且未运行"。始终记录空闲周期，即使只是时间戳。
- **分析失败时清除摘要**：若数据源宕机，不要写入空摘要。慢时钟会看到"无待办"并跳过实际待办的工作。失败时保留最后一份好摘要。

## 相关技能

- `manage-token-budget` —— du-dum 使之实用的成本控制框架；du-dum 是架构模式，token 预算是会计层
- `circuit-breaker-pattern` —— 处理故障情况（工具损坏）；du-dum 处理正常情况（无事可做）。一起使用：du-dum 用于空闲检测，circuit-breaker 用于故障恢复
- `observe` —— 快时钟的观察方法；du-dum 通过摘要构造观察何时及如何变得可执行
- `forage-resources` —— 战略探索层；du-dum 是 forage-resources 在其内运行的执行节奏
- `coordinate-reasoning` —— 共生信号模式；摘要文件是共生的一种形式（通过环境工件的间接协调）
