---
name: coordinate-reasoning
description: >
  AI 内部协调，使用趋化信号——管理上下文和记忆中的信息新鲜度、假设过时的衰减率，
  以及从简单的局部协议中产生的涌现一致行为。适用于多个子任务需要协调的复杂任务中、
  上下文变长且信息新鲜度不确定时、上下文压缩后信息可能已丢失时，或子任务输出需要
  在不降质的情况下清晰地衔接时。
license: MIT
allowed-tools: Read Write
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: swarm
  complexity: intermediate
  language: natural
  tags: swarm, coordination, stigmergy, context-management, information-decay, ai-self-application
  locale: zh-CN
  source_locale: en
  source_commit: 902f69ec
  translator: claude
  translation_date: "2026-03-17"
---

# 协调推理

使用趋化原则管理推理过程的内部协调——将上下文视为一个环境，其中信息信号具有新鲜度、衰减率和交互规则，从简单的局部协议中产生一致行为。

## 适用场景

- 在多个子任务需要协调的复杂任务中（多文件编辑、多步骤重构）
- 当上下文变长且信息新鲜度不确定时
- 上下文压缩后某些信息可能已丢失时
- 子任务输出需要清晰地衔接到下一个时
- 需要将早期推理结果向前传递而不降质时
- 与 `forage-solutions`（探索）和 `build-coherence`（决策）配合进行执行协调时

## 输入

- **必需**：当前任务分解（存在哪些子任务以及它们如何关联？）
- **可选**：已知的信息新鲜度顾虑（如"我在 20 条消息前读了那个文件"）
- **可选**：子任务依赖图（哪些子任务输入给哪些？）
- **可选**：可用的协调工具（MEMORY.md、任务列表、内联注释）

## 步骤

### 第 1 步：分类协调问题

不同的协调挑战需要不同的信号设计。

```
AI Coordination Problem Types:
┌─────────────────────┬──────────────────────────────────────────────────┐
│ Type                │ Characteristics                                  │
├─────────────────────┼──────────────────────────────────────────────────┤
│ Foraging            │ Multiple independent searches running in         │
│ (scattered search)  │ parallel or sequence. Coordination need: share   │
│                     │ findings, avoid duplicate work, converge on      │
│                     │ best trail                                       │
├─────────────────────┼──────────────────────────────────────────────────┤
│ Consensus           │ Multiple approaches evaluated, one must be       │
│ (competing paths)   │ selected. Coordination need: independent         │
│                     │ evaluation, unbiased comparison, commitment      │
├─────────────────────┼──────────────────────────────────────────────────┤
│ Construction        │ Building a complex output incrementally (multi-  │
│ (incremental build) │ file edit, long document). Coordination need:    │
│                     │ consistency across parts, progress tracking,     │
│                     │ dependency ordering                              │
├─────────────────────┼──────────────────────────────────────────────────┤
│ Defense             │ Maintaining quality under pressure (tight time,  │
│ (quality under      │ complex requirements). Coordination need:        │
│ pressure)           │ monitoring for errors, rapid correction,         │
│                     │ awareness of degradation                         │
├─────────────────────┼──────────────────────────────────────────────────┤
│ Division of labor   │ Task decomposed into sub-tasks with              │
│ (sub-task mgmt)     │ dependencies. Coordination need: ordering,       │
│                     │ handoff, result integration                      │
└─────────────────────┴──────────────────────────────────────────────────┘
```

分类当前任务。大多数复杂任务属于构建型或分工型；大多数调试任务属于觅食型；大多数设计决策属于共识型。

**预期结果：** 明确的分类，确定使用哪种协调信号。分类应匹配任务的实际感受，而非其描述方式。

**失败处理：** 如果任务跨越多个类型（大型任务中常见），识别当前阶段的主导类型。实施阶段为构建型，调试阶段为觅食型，设计阶段为共识型。类型可以随任务进展而变化。

### 第 2 步：设计上下文信号

将对话上下文中的信息视为具有新鲜度和衰减属性的信号。

```
Information Decay Rate Table:
┌───────────────────────────┬──────────┬──────────────────────────────┐
│ Information Source        │ Decay    │ Refresh Action               │
│                           │ Rate     │                              │
├───────────────────────────┼──────────┼──────────────────────────────┤
│ User's explicit statement │ Slow     │ Re-read if >30 messages ago  │
│ (direct instruction)      │          │ or after compression         │
├───────────────────────────┼──────────┼──────────────────────────────┤
│ File contents read N      │ Moderate │ Re-read if file may have     │
│ messages ago              │          │ been modified, or if >15     │
│                           │          │ messages since reading        │
├───────────────────────────┼──────────┼──────────────────────────────┤
│ Own earlier reasoning     │ Fast     │ Re-derive rather than trust. │
│ (conclusions, plans)      │          │ Earlier reasoning may have   │
│                           │          │ been based on now-stale info  │
├───────────────────────────┼──────────┼──────────────────────────────┤
│ Inferred facts (not       │ Very     │ Verify before relying on.    │
│ directly stated or read)  │ fast     │ Inferences compound error    │
├───────────────────────────┼──────────┼──────────────────────────────┤
│ MEMORY.md / CLAUDE.md     │ Very     │ Loaded at session start,     │
│ (persistent context)      │ slow     │ treat as stable unless user  │
│                           │          │ indicates changes             │
└───────────────────────────┴──────────┴──────────────────────────────┘
```

此外，设计抑制信号——标记已尝试但失败的方法：

- 工具调用失败后：记录失败模式（防止重试相同的调用）
- 放弃某方法后：记录原因（防止在没有新证据的情况下重新访问）
- 用户纠正后：记录错误内容（防止重复错误）

**预期结果：** 对当前上下文中信息新鲜度的心理模型。识别哪些信息是新鲜的，哪些在依赖前需要刷新。

**失败处理：** 如果难以评估信息新鲜度，默认对最近 5-10 个操作中未验证的任何信息采取"依赖前重新读取"策略。过度刷新会浪费一些精力，但能防止过时信息错误。

### 第 3 步：定义局部协议

建立简单规则，规定推理在每一步应如何进行，仅使用局部可用信息。

```
Local Protocol Rules:
┌──────────────────────┬────────────────────────────────────────────────┐
│ Protocol             │ Rule                                           │
├──────────────────────┼────────────────────────────────────────────────┤
│ Safety               │ Before using a fact, check: when was it last  │
│                      │ verified? If below freshness threshold,        │
│                      │ re-verify before proceeding                    │
├──────────────────────┼────────────────────────────────────────────────┤
│ Response             │ When the user corrects something, update all  │
│                      │ downstream reasoning that depended on the     │
│                      │ corrected fact. Trace the dependency chain    │
├──────────────────────┼────────────────────────────────────────────────┤
│ Exploitation         │ When a sub-task produces useful output, note  │
│                      │ the output clearly for downstream sub-tasks.  │
│                      │ The note is the trail signal                  │
├──────────────────────┼────────────────────────────────────────────────┤
│ Exploration          │ When stuck on a sub-task for >3 actions       │
│                      │ without progress, check under-explored        │
│                      │ channels: different tools, different files,    │
│                      │ different framing                              │
├──────────────────────┼────────────────────────────────────────────────┤
│ Deposit              │ After completing a sub-task, summarize its    │
│                      │ output in 1-2 sentences for future reference. │
│                      │ This deposit serves the next sub-task          │
├──────────────────────┼────────────────────────────────────────────────┤
│ Inhibition           │ Before trying an approach, check: was this    │
│                      │ already tried and failed? If so, what is      │
│                      │ different now that would change the outcome?  │
└──────────────────────┴────────────────────────────────────────────────┘
```

这些协议足够简单，可以在每一步应用而不会产生显著开销。

**预期结果：** 一组轻量级规则，在不减慢执行速度的情况下提高协调质量。规则应感觉有帮助，而不是负担。

**失败处理：** 如果协议感觉像是额外负担，精简为当前任务类型最重要的两个：构建型用安全+沉淀，觅食型用安全+探索，有用户积极反馈的任务用安全+响应。

### 第 4 步：校准信息新鲜度

对当前上下文中的信息过时状态执行主动审计。

1. 哪些事实是在 N 条消息之前建立的？列出它们
2. 对于每个：自那以后是否已被更新、反驳或变得无关？
3. 检查上下文压缩损失：是否有你记得有但在可见上下文中再也找不到的信息？
4. 检查早期计划和当前执行之间的偏移：方法是否在没有更新计划的情况下发生了变化？
5. 重新验证 2-3 个最关键的事实（最多下游推理依赖的那些）

```
Freshness Audit Template:
┌────────────────────────┬──────────┬──────────────┬─────────────────┐
│ Fact                   │ Source   │ Age (approx) │ Status          │
├────────────────────────┼──────────┼──────────────┼─────────────────┤
│                        │          │              │ Fresh / Stale / │
│                        │          │              │ Unknown / Lost  │
└────────────────────────┴──────────┴──────────────┴─────────────────┘
```

**预期结果：** 信息新鲜度的具体清单，已识别需要刷新的过时项目。至少有一个事实被重新验证——如果没有需要刷新的内容，审计太浅或上下文确实是新鲜的。

**失败处理：** 如果审计揭示了重大信息损失（多个事实状态为"已丢失"或"未知"），这是运行 `heal` 进行完整子系统评估的信号。超出阈值的信息损失意味着协调在基础层面已经受损。

### 第 5 步：测试涌现一致性

验证子任务组合后是否产生一致的整体。

1. 每个子任务的输出是否干净地流入下一个？还是存在差距、矛盾或不匹配的假设？
2. 工具调用是否在向目标推进，还是重复的（重新读取同一文件、重新运行同一搜索）？
3. 总体方向是否仍与用户请求一致？还是增量偏移累积成了显著的不对齐？
4. 压力测试：如果一个关键假设错误，有多少工作会级联？高级联=脆弱协调。低级联=稳健协调

```
Coherence Test:
┌────────────────────────────────────┬─────────────────────────────────┐
│ Check                              │ Result                          │
├────────────────────────────────────┼─────────────────────────────────┤
│ Sub-task outputs compatible?       │ Yes / No / Partially            │
│ Tool calls non-redundant?          │ Yes / No (list repeats)         │
│ Direction aligned with request?    │ Yes / Drifted (describe)        │
│ Single-assumption cascade risk?    │ Low / Medium / High             │
└────────────────────────────────────┴─────────────────────────────────┘
```

**预期结果：** 对整体一致性的具体评估，已识别具体问题。一致的协调应感觉像部件咔嗒拼合在一起；不一致的协调感觉像强行拼凑拼图。

**失败处理：** 如果一致性差，找出子任务分叉的具体点。通常是一个过时的假设或一个未处理的用户纠正在下游工作中传播。修复分叉点，然后重新验证下游输出。

## 验证清单

- [ ] 协调问题已按类型分类
- [ ] 对依赖的事实考虑了信息衰减率
- [ ] 应用了局部协议（特别是安全和沉淀）
- [ ] 新鲜度审计识别了过时信息（或用证据确认了新鲜度）
- [ ] 跨子任务测试了涌现一致性
- [ ] 尊重了抑制信号（未重复已尝试失败的方法）

## 常见问题

- **过度设计信号**：复杂的协调协议阻碍工作多于帮助。从安全+沉淀开始；仅在问题出现时添加其他
- **信任过时上下文**：最常见的协调失败是依赖 20 条消息前正确但此后已更新或失效的信息。有疑问时重新读取
- **忽视抑制信号**：在不改变任何条件的情况下重试失败方法不是坚持——而是忽视失败信号。重试成功需要有不同的条件
- **没有沉淀**：完成子任务而不记录其输出会迫使后续子任务重新推导或重新读取。简短的摘要可节省大量返工
- **假设一致性**：不测试子任务是否真正组合成一致的整体。每个子任务可以独立正确但集体不一致——集成是协调失败的地方

## 相关技能

- `coordinate-swarm` — 本技能适配为单代理推理的多代理协调模型
- `forage-solutions` — 协调跨多个假设的探索
- `build-coherence` — 协调跨竞争方法的评估
- `heal` — 协调失败揭示子系统偏移时的深度评估
- `awareness` — 在执行期间监控协调故障信号
