---
name: assess-context
description: >
  AI 上下文评估——评估问题的可塑性、映射结构刚性与灵活性、分析转型压力、估算
  适应能力。适用于复杂任务陷入僵局且不确定应坚持还是转向时、在重大方法变更前
  评估当前推理结构是否能支撑变更时、当累积的变通方案暗示底层方法可能有误时，
  或作为长时间多步骤任务中的周期性结构健康检查。
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: morphic
  complexity: intermediate
  language: natural
  tags: morphic, assessment, context-evaluation, malleability, meta-cognition, ai-self-application
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# 评估上下文

评估当前推理上下文的可塑性——识别哪些元素是刚性的（无法改变）、哪些是灵活的（可以低成本改变）、转型压力在哪里积聚，以及当前方法是否有能力在需要时进行适应。

## 适用场景

- 当复杂任务陷入僵局，不确定应该坚持推进还是转向时
- 在重大方法变更之前，评估当前推理结构是否能支撑变更
- 当累积的变通方案暗示底层方法可能有误时
- 在 `heal` 或 `awareness` 识别出偏移后，但适当的响应（继续、调整或重建）不明确时
- 当上下文已经很长，不清楚多少可以保留、多少需要重建时
- 长时间多步骤任务中的周期性结构健康检查

## 输入

- **必需**：当前任务上下文和推理状态（隐式可用）
- **可选**：触发评估的具体关切（例如"我一直在添加变通方案"）
- **可选**：建议的转向方向（方法可能需要变成什么？）
- **可选**：之前的评估结果，用于趋势分析

## 步骤

### 第 1 步：清点推理形态

不带判断地编目当前推理方法的结构组件。

```
Structural Inventory Table:
┌────────────────────┬──────────────┬──────────────────────────────────┐
│ Component          │ Type         │ Description                      │
├────────────────────┼──────────────┼──────────────────────────────────┤
│ Main task          │ Skeleton     │ The user's core request — cannot │
│                    │              │ change without user direction     │
├────────────────────┼──────────────┼──────────────────────────────────┤
│ Sub-task breakdown │ Flesh        │ How the task is decomposed —     │
│                    │              │ can be restructured               │
├────────────────────┼──────────────┼──────────────────────────────────┤
│ Tool strategy      │ Flesh        │ Which tools are being used and   │
│                    │              │ in what order — can be changed    │
├────────────────────┼──────────────┼──────────────────────────────────┤
│ Output plan        │ Flesh/Skel   │ The expected deliverable format  │
│                    │              │ — may be constrained by user     │
│                    │              │ expectations                      │
├────────────────────┼──────────────┼──────────────────────────────────┤
│ Key assumptions    │ Skeleton     │ Facts treated as given — may be  │
│                    │              │ wrong but are load-bearing        │
├────────────────────┼──────────────┼──────────────────────────────────┤
│ Constraints        │ Skeleton     │ Hard limits (user-imposed, tool  │
│                    │              │ limitations, time)                │
├────────────────────┼──────────────┼──────────────────────────────────┤
│ Workarounds        │ Scar tissue  │ Patches for things that didn't   │
│                    │              │ work as expected — signals of     │
│                    │              │ structural stress                 │
└────────────────────┴──────────────┴──────────────────────────────────┘
```

对每个组件进行分类：
- **骨架（Skeleton）**：难以改变；改变它会级联影响下游的一切
- **血肉（Flesh）**：容易改变；可以在不影响其他组件的情况下替换
- **疤痕组织（Scar tissue）**：表明结构性问题的变通方案；通常是伪装成骨架的血肉

映射依赖关系：哪些组件依赖于哪些？一个拥有许多依赖者的骨架组件是承重的。一个没有依赖者的血肉组件是可丢弃的。

**预期结果：** 一份完整的清单，展示当前方法由什么构建、什么是刚性的、什么是灵活的、以及压力在哪里可见（变通方案）。清点应该揭示出在编目之前不明显的结构。

**失败处理：** 如果清单难以构建（方法过于纠缠而无法分解），这本身就是一个发现——高结构不透明度表明高刚性。从可见的部分开始，并标注不透明区域。

### 第 2 步：映射转型压力

识别推动当前方法变化的力量和抵抗变化的力量。

```
Pressure Map:
┌─────────────────────────┬──────────────────────────────────────────┐
│ External Pressure       │ Forces from outside the reasoning        │
│ (pushing toward change) │                                          │
├─────────────────────────┼──────────────────────────────────────────┤
│ New information         │ Tool results or user input that          │
│                         │ contradicts current approach              │
├─────────────────────────┼──────────────────────────────────────────┤
│ Tool contradictions     │ Tools returning unexpected results that  │
│                         │ the current approach cannot explain       │
├─────────────────────────┼──────────────────────────────────────────┤
│ Time pressure           │ The current approach is too slow for the │
│                         │ complexity of the task                    │
├─────────────────────────┼──────────────────────────────────────────┤
│ Internal Pressure       │ Forces from within the reasoning         │
│ (pushing toward change) │                                          │
├─────────────────────────┼──────────────────────────────────────────┤
│ Diminishing returns     │ Each step yields less progress than the  │
│                         │ previous one                              │
├─────────────────────────┼──────────────────────────────────────────┤
│ Workaround accumulation │ The number of patches is growing —       │
│                         │ complexity is outpacing the structure     │
├─────────────────────────┼──────────────────────────────────────────┤
│ Coherence loss          │ Sub-tasks are not fitting together       │
│                         │ cleanly anymore                           │
├─────────────────────────┼──────────────────────────────────────────┤
│ Resistance              │ Forces opposing change                    │
│ (pushing against change)│                                          │
├─────────────────────────┼──────────────────────────────────────────┤
│ Sunk cost               │ Significant work already done on current │
│                         │ approach — pivoting "wastes" that effort  │
├─────────────────────────┼──────────────────────────────────────────┤
│ "Good enough"           │ The current approach is producing        │
│                         │ acceptable (if not optimal) results       │
├─────────────────────────┼──────────────────────────────────────────┤
│ Pivot cost              │ Switching approaches means rebuilding    │
│                         │ context, losing momentum, potential      │
│                         │ confusion                                 │
└─────────────────────────┴──────────────────────────────────────────┘
```

估计平衡：转型压力是在增长、稳定还是下降？

**预期结果：** 一幅关于作用在当前方法上的力量的清晰图景。如果压力显著超过阻力，转向已经过迟。如果阻力显著超过压力，应继续当前方法。

**失败处理：** 如果压力图不明确（既没有强压力也没有强阻力），向前投射：压力会加剧吗？变通方案会复合吗？一个"现在够好但在退化"的方法承受的压力比表面看起来更大。

### 第 3 步：评估推理刚性

确定当前方法有多灵活——它能适应，还是会断裂？

```
Rigidity Score:
┌──────────────────────────┬─────┬──────────┬──────┬──────────────┐
│ Dimension                │ Low │ Moderate │ High │ Assessment   │
│                          │ (1) │ (2)      │ (3)  │              │
├──────────────────────────┼─────┼──────────┼──────┼──────────────┤
│ Component swappability   │ Can swap parts   │ Changing one │              │
│                          │ freely          │ breaks others│              │
├──────────────────────────┼─────┼──────────┼──────┼──────────────┤
│ "God module" dependency  │ No single point  │ Everything   │              │
│                          │ of failure       │ depends on   │              │
│                          │                  │ one conclusion│             │
├──────────────────────────┼─────┼──────────┼──────┼──────────────┤
│ Tool entanglement        │ Tools serve      │ Approach is  │              │
│                          │ reasoning        │ shaped by    │              │
│                          │                  │ tool limits   │              │
├──────────────────────────┼─────┼──────────┼──────┼──────────────┤
│ Assumption transparency  │ Assumptions are  │ Assumptions  │              │
│                          │ stated, testable │ are implicit, │             │
│                          │                  │ untested      │              │
├──────────────────────────┼─────┼──────────┼──────┼──────────────┤
│ Workaround count         │ None or few      │ Multiple     │              │
│                          │                  │ accumulating  │              │
├──────────────────────────┼─────┼──────────┼──────┼──────────────┤
│ Total (max 15)           │ 5-7: flexible    │              │              │
│                          │ 8-10: moderate   │              │              │
│                          │ 11-15: rigid     │              │              │
└──────────────────────────┴─────┴──────────┴──────┴──────────────┘
```

**预期结果：** 一个带有每个维度具体证据的刚性评分。该评分揭示方法是否能吸收变化，或是否需要重建。

**失败处理：** 如果所有维度都评分较低（声称高灵活性），更仔细地探测"上帝模块"维度：是否有一个所有其他东西都依赖的关键结论或假设？如果是，灵活性是虚幻的——一个错误的假设就会坍塌整个结构。

### 第 4 步：估算变化容量

评估转向或适应当前方法的实际能力。

1. **剩余上下文窗口**：还有多少空间用于新推理？剩余上下文充足 = 高容量。接近限制 = 低容量
2. **转向时的信息保存**：如果方法改变，什么可以带入新方法？高质量的子任务输出能在转向中存活；绑定到旧方法的推理链则不能
3. **可用的恢复工具**：MEMORY.md 能否在转向前捕获关键发现？用户能否提供额外上下文？相关文件是否仍可访问？
4. **用户耐心因素**：用户是否表示了紧迫感？多次修正暗示耐心下降。明确的"慢慢来"暗示高耐心

变化容量不仅仅是理论上的——它包括当前会话的实际约束。

**预期结果：** 对改变方向能力的诚实评估，同时考虑技术和关系因素。

**失败处理：** 如果变化容量低（上下文有限，关键信息面临丢失风险），转向前的首要优先级是保存：总结关键发现，记录关键事实，在适当时更新 MEMORY.md。没有保存的转向比不转向更糟。

### 第 5 步：分类转型准备度

将各项评估合并为一个准备度分类。

```
Transformation Readiness Matrix:
┌─────────────────┬────────────────────────┬────────────────────────┐
│                  │ Low Rigidity           │ High Rigidity          │
├─────────────────┼────────────────────────┼────────────────────────┤
│ High Pressure   │ READY — pivot now.     │ PREPARE — simplify     │
│ + High Capacity │ The approach can adapt  │ first. Remove          │
│                 │ and should. Preserve    │ workarounds, clarify   │
│                 │ valuable sub-outputs,   │ assumptions, then      │
│                 │ rebuild the structure   │ pivot                  │
├─────────────────┼────────────────────────┼────────────────────────┤
│ High Pressure   │ INVEST — preserve      │ CRITICAL — ask the     │
│ + Low Capacity  │ findings first. Update  │ user. Explain the      │
│                 │ MEMORY.md, summarize    │ situation: approach is  │
│                 │ progress, then pivot    │ struggling, pivoting   │
│                 │ with preserved context  │ is costly, what do     │
│                 │                        │ they want to prioritize?│
├─────────────────┼────────────────────────┼────────────────────────┤
│ Low Pressure    │ DEFER — the approach   │ DEFER — no urgency,    │
│ + Any Capacity  │ is working. Continue.   │ continue. Monitor for  │
│                 │ Reassess if pressure    │ pressure changes        │
│                 │ increases               │                        │
└─────────────────┴────────────────────────┴────────────────────────┘
```

记录分类结果，包括：
- 分类标签（READY / PREPARE / INVEST / CRITICAL / DEFER）
- 每个维度的关键发现
- 建议的下一步行动
- 什么信号会改变分类结果

**预期结果：** 一个清晰、有据可依的分类，附有具体的建议行动。分类结果应该像一个结论，而不是一个猜测。

**失败处理：** 如果分类不明确，默认为 PREPARE——降低刚性（澄清假设、移除变通方案）无论是否进行完全转向都是有价值的。准备工作无论方法继续还是改变都能改善方法。

## 验证清单

- [ ] 结构清点已完成，包含骨架/血肉/疤痕组织分类
- [ ] 转型压力已映射（外部、内部、阻力）
- [ ] 刚性已在多个维度评分并附有具体证据
- [ ] 变化容量已评估，包括实际会话约束
- [ ] 准备度分类已确定并附有合理推理
- [ ] 已基于分类结果确定具体的下一步行动
- [ ] 已定义重新评估的触发条件

## 常见问题

- **仅评估技术方法**：上下文准备度包括用户关系因素。一个技术上灵活但已引起用户挫败感的方法，比它表面上看起来更加刚性
- **沉没成本作为刚性**：先前的努力不是结构性刚性。无论方法是否改变，已完成的工作可能都是有价值的。区分"我无法改变"（刚性）和"我不想改变"（沉没成本）
- **评估作为逃避**：如果调用 assess-context 是为了避免做出困难决策，评估将在设计上是不确定的。如果压力很明确，就按压力行动
- **忽视变通方案作为信号**：变通方案是疤痕组织——结构被施压和修补而非正确适应的证据。高变通方案计数意味着下一次压力更可能突破
- **混淆刚性与承诺**：承诺的方法（刻意选择的、基于证据的）与刚性方法（被依赖关系和假设锁定的）不同。承诺可以通过决策改变；刚性只能通过重组改变

## 相关技能

- `assess-form` — 本技能适配到 AI 推理上下文的多系统评估模型
- `adapt-architecture` — 如果分类为 READY，使用架构适应原则进行转向
- `heal` — 当评估揭示出超越结构性问题的偏移时，进行更深层的子系统扫描
- `center` — 建立诚实评估所需的平衡基线
- `coordinate-reasoning` — 管理评估所依赖的信息新鲜度
