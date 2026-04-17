---
name: awareness
description: >
  AI 态势感知——针对幻觉风险、范围蔓延和上下文退化的内部威胁检测。将库珀颜色
  代码映射到推理状态，将 OODA 循环映射到实时决策。适用于任何推理质量重要的
  任务中、在不熟悉的领域操作时、检测到早期预警信号（如不确定的事实或可疑的
  工具结果）后，或在高风险输出（如不可逆变更或架构决策）之前。
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: defensive
  complexity: advanced
  language: natural
  tags: defensive, awareness, threat-detection, hallucination-risk, ooda, meta-cognition, ai-self-application
  locale: zh-CN
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# 态势感知

持续维护对内部推理质量的态势感知——使用改编的库珀颜色代码和 OODA 循环决策实时检测幻觉风险、范围蔓延、上下文退化和信心-准确度不匹配。

## 适用场景

- 在任何推理质量重要的任务中（即大多数任务）
- 在不熟悉的领域操作时（新代码库、不熟悉的领域、复杂请求）
- 检测到早期预警信号后：一个感觉不确定的事实、一个看起来有误的工具结果、日益增长的困惑感
- 作为长时间工作会话中的持续后台进程
- 当 `center` 或 `heal` 揭示了偏移但尚未识别出具体威胁时
- 在高风险输出之前（不可逆变更、面向用户的沟通、架构决策）

## 输入

- **必需**：活跃的任务上下文（隐式可用）
- **可选**：触发提升感知的具体关切（例如"我不确定这个 API 是否存在"）
- **可选**：用于威胁配置文件选择的任务类型（见第 5 步）

## 步骤

### 第 1 步：建立 AI 库珀颜色代码

使用改编版的库珀颜色代码系统校准当前的感知水平。

```
AI Cooper Color Codes:
┌──────────┬─────────────────────┬──────────────────────────────────────────┐
│ Code     │ State               │ AI Application                           │
├──────────┼─────────────────────┼──────────────────────────────────────────┤
│ White    │ Autopilot           │ Generating output without monitoring     │
│          │                     │ quality. No self-checking. Relying       │
│          │                     │ entirely on pattern completion.          │
│          │                     │ DANGEROUS — hallucination risk highest   │
├──────────┼─────────────────────┼──────────────────────────────────────────┤
│ Yellow   │ Relaxed alert       │ DEFAULT STATE. Monitoring output for     │
│          │                     │ accuracy. Checking facts against context.│
│          │                     │ Noticing when confidence exceeds         │
│          │                     │ evidence. Sustainable indefinitely       │
├──────────┼─────────────────────┼──────────────────────────────────────────┤
│ Orange   │ Specific risk       │ A specific threat identified: uncertain  │
│          │ identified          │ fact, possible hallucination, scope      │
│          │                     │ drift, context staleness. Forming        │
│          │                     │ contingency: "If this is wrong, I        │
│          │                     │ will..."                                 │
├──────────┼─────────────────────┼──────────────────────────────────────────┤
│ Red      │ Risk materialized   │ The threat from Orange has materialized: │
│          │                     │ confirmed error, user correction, tool   │
│          │                     │ contradiction. Execute the contingency.  │
│          │                     │ No hesitation — the plan was made in     │
│          │                     │ Orange                                   │
├──────────┼─────────────────────┼──────────────────────────────────────────┤
│ Black    │ Cascading failures  │ Multiple simultaneous failures, lost     │
│          │                     │ context, fundamental confusion about     │
│          │                     │ what the task even is. STOP. Ground      │
│          │                     │ using `center`, then rebuild from user's │
│          │                     │ original request                         │
└──────────┴─────────────────────┴──────────────────────────────────────────┘
```

识别当前的颜色代码。如果答案是白色（无监控），感知练习已经通过揭示这个差距而成功了。

**预期结果：** 对当前感知水平的准确自我评估。正常工作期间的目标是黄色。白色应该罕见且短暂。持续橙色是不可持续的——要么确认要么消除关切。

**失败处理：** 如果颜色代码评估本身感觉是在自动驾驶中进行的（走过场），那就是伪装成黄色的白色。真正的黄色涉及主动将输出与证据对照检查，而不仅仅是声称在这样做。

### 第 2 步：检测内部威胁指标

系统地扫描先于常见 AI 推理失败的特定信号。

```
Threat Indicator Detection:
┌───────────────────────────┬──────────────────────────────────────────┐
│ Threat Category           │ Warning Signals                          │
├───────────────────────────┼──────────────────────────────────────────┤
│ Hallucination Risk        │ • Stating a fact without a source        │
│                           │ • High confidence about API names,       │
│                           │   function signatures, or file paths     │
│                           │   not verified by tool use               │
│                           │ • "I believe" or "typically" hedging     │
│                           │   that masks uncertainty as knowledge    │
│                           │ • Generating code for an API without     │
│                           │   reading its documentation              │
├───────────────────────────┼──────────────────────────────────────────┤
│ Scope Creep               │ • "While I'm at it, I should also..."   │
│                           │ • Adding features not in the request     │
│                           │ • Refactoring adjacent code              │
│                           │ • Adding error handling for scenarios    │
│                           │   that can't happen                      │
├───────────────────────────┼──────────────────────────────────────────┤
│ Context Degradation       │ • Referencing information from early in  │
│                           │   a long conversation without re-reading │
│                           │ • Contradicting a statement made earlier │
│                           │ • Losing track of what has been done     │
│                           │   vs. what remains                       │
│                           │ • Post-compression confusion             │
├───────────────────────────┼──────────────────────────────────────────┤
│ Confidence-Accuracy       │ • Stating conclusions with certainty     │
│ Mismatch                  │   based on thin evidence                 │
│                           │ • Not qualifying uncertain statements    │
│                           │ • Proceeding without verification when   │
│                           │   verification is available and cheap    │
│                           │ • "This should work" without testing     │
└───────────────────────────┴──────────────────────────────────────────┘
```

对每个类别检查：这个信号现在存在吗？如果是，从黄色转移到橙色并识别具体的关切。

**预期结果：** 至少对一个类别进行了真正关注的扫描。检测到一个信号——即使是轻微的——比报告"一切正常"更有用。如果每次扫描都返回干净结果，检测阈值可能过高。

**失败处理：** 如果威胁检测感觉抽象，将其落实到最近的输出：选取最后一个事实性声明并问"我怎么知道这是真的？我读到了它，还是我在生成它？"这一个问题就能捕获大多数幻觉风险。

### 第 3 步：对已识别威胁运行 OODA 循环

当识别出特定威胁（橙色状态）时，循环执行观察-定向-决策-行动。

```
AI OODA Loop:
┌──────────┬──────────────────────────────────────────────────────────────┐
│ Observe  │ What specifically triggered the concern? Gather concrete     │
│          │ evidence. Read the file, check the output, verify the fact.  │
│          │ Do not assess until you have observed                        │
├──────────┼──────────────────────────────────────────────────────────────┤
│ Orient   │ Match observation to known patterns: Is this a common       │
│          │ hallucination pattern? A known tool limitation? A context    │
│          │ freshness issue? Orient determines response quality          │
├──────────┼──────────────────────────────────────────────────────────────┤
│ Decide   │ Select the response: verify and correct, flag to user,      │
│          │ adjust approach, or dismiss the concern with evidence.       │
│          │ A good decision now beats a perfect decision too late        │
├──────────┼──────────────────────────────────────────────────────────────┤
│ Act      │ Execute the decision immediately. If the concern was valid,  │
│          │ correct the error. If dismissed, note why and return to      │
│          │ Yellow. Re-enter the loop if new information emerges         │
└──────────┴──────────────────────────────────────────────────────────────┘
```

OODA 循环应该是快速的。目标不是完美，而是在观察和行动之间快速循环。在定向阶段花费太长时间（分析瘫痪）是最常见的失败。

**预期结果：** 在短时间内从观察到行动的完整循环。威胁要么被确认并纠正，要么被以具体证据消除。

**失败处理：** 如果循环在定向阶段停滞（无法确定威胁的含义），跳转到安全默认值：通过工具使用验证不确定的事实。直接观察比分析更快地解决大多数模糊性。

### 第 4 步：快速稳定化

当威胁实现（红色）或发生级联故障（黑色）时，在继续之前先稳定。

```
AI Stabilization Protocol:
┌────────────────────────┬─────────────────────────────────────────────┐
│ Technique              │ Application                                 │
├────────────────────────┼─────────────────────────────────────────────┤
│ Pause                  │ Stop generating output. The next sentence   │
│                        │ produced under stress is likely to compound │
│                        │ the error, not fix it                       │
├────────────────────────┼─────────────────────────────────────────────┤
│ Re-read user message   │ Return to the original request. What did   │
│                        │ the user actually ask? This is the ground   │
│                        │ truth anchor                                │
├────────────────────────┼─────────────────────────────────────────────┤
│ State task in one      │ "The task is: ___." If this sentence cannot │
│ sentence               │ be written clearly, the confusion is deeper │
│                        │ than the immediate error                    │
├────────────────────────┼─────────────────────────────────────────────┤
│ Enumerate concrete     │ List what is definitely known (verified by  │
│ facts                  │ tool use or user statement). Distinguish    │
│                        │ facts from inferences. Build only on facts  │
├────────────────────────┼─────────────────────────────────────────────┤
│ Identify one next step │ Not the whole recovery plan — just one step │
│                        │ that moves toward resolution. Execute it    │
└────────────────────────┴─────────────────────────────────────────────┘
```

**预期结果：** 通过刻意的稳定化从红色/黑色返回到黄色。稳定化后的下一个输出应该比触发错误的输出更加扎实。

**失败处理：** 如果稳定化无效（仍然困惑，仍然产生错误），问题可能是结构性的——不是一时的失误而是根本性的误解。升级：向用户沟通方法需要重置并请求澄清。

### 第 5 步：应用上下文特定的威胁配置文件

不同的任务类型有不同的主导威胁。按任务校准感知焦点。

```
Task-Specific Threat Profiles:
┌─────────────────────┬─────────────────────┬───────────────────────────┐
│ Task Type           │ Primary Threat      │ Monitoring Focus          │
├─────────────────────┼─────────────────────┼───────────────────────────┤
│ Code generation     │ API hallucination   │ Verify every function     │
│                     │                     │ name, parameter, and      │
│                     │                     │ import against actual docs│
├─────────────────────┼─────────────────────┼───────────────────────────┤
│ Architecture design │ Scope creep         │ Anchor to stated          │
│                     │                     │ requirements. Challenge   │
│                     │                     │ every "nice to have"      │
├─────────────────────┼─────────────────────┼───────────────────────────┤
│ Data analysis       │ Confirmation bias   │ Actively seek evidence    │
│                     │                     │ that contradicts the      │
│                     │                     │ emerging conclusion       │
├─────────────────────┼─────────────────────┼───────────────────────────┤
│ Debugging           │ Tunnel vision       │ If the current hypothesis │
│                     │                     │ hasn't yielded results in │
│                     │                     │ N attempts, step back     │
├─────────────────────┼─────────────────────┼───────────────────────────┤
│ Documentation       │ Context staleness   │ Verify that described     │
│                     │                     │ behavior matches current  │
│                     │                     │ code, not historical      │
├─────────────────────┼─────────────────────┼───────────────────────────┤
│ Long conversation   │ Context degradation │ Re-read key facts         │
│                     │                     │ periodically. Check for   │
│                     │                     │ compression artifacts     │
└─────────────────────┴─────────────────────┴───────────────────────────┘
```

识别当前任务类型并相应地调整监控焦点。

**预期结果：** 感知针对当前任务类型中最可能的特定威胁进行了锐化，而不是对所有事物的泛泛监控。

**失败处理：** 如果任务类型不清楚或跨越多个类别，默认为幻觉风险监控——它是最普遍适用的威胁，被遗漏时也是最具破坏性的。

### 第 6 步：回顾和校准

在每次感知事件（检测到威胁、完成 OODA 循环、应用了稳定化）之后，进行简短回顾。

1. 当问题被检测到时，哪个颜色代码是活跃的？
2. 检测是否及时，还是问题已经在输出中体现？
3. OODA 循环是否足够快，还是定向阶段停滞了？
4. 响应是否适度（没有过度或不足反应）？
5. 下次什么能更早捕获这个问题？

**预期结果：** 一个能改善未来检测的简短校准。不是冗长的事后分析——只是足够调整灵敏度。

**失败处理：** 如果回顾没有产生有用的校准，说明感知事件要么是微不足道的（不需要学习），要么回顾过于浅薄。对于重大事件，问："我没有监控什么是我应该监控的？"

### 第 7 步：整合——维持黄色默认状态

设定持续的感知姿态。

1. 黄色是所有工作期间的默认状态——放松的监控，不是过度警觉
2. 根据当前任务类型调整监控焦点（第 5 步）
3. 在 MEMORY.md 中记录本次会话中的任何反复出现的威胁模式
4. 带着校准的感知回到任务执行

**预期结果：** 一个可持续的感知水平，在不减慢工作的情况下提高工作质量。感知应该像周边视觉一样——存在但不要求中心注意力。

**失败处理：** 如果感知变得令人疲惫或过度警觉（慢性橙色），阈值过于敏感。提高触发橙色的阈值。真正的感知是可持续的。如果它消耗能量，那是伪装成警觉的焦虑。

## 验证清单

- [ ] 当前颜色代码被诚实评估（不是在白色更准确时默认为黄色）
- [ ] 至少一个威胁类别以具体证据进行了扫描，而不仅仅是打钩
- [ ] OODA 循环已应用于任何已识别的威胁（观察、定向、决策、行动）
- [ ] 稳定化协议在需要时可用（即使未触发）
- [ ] 感知焦点已针对当前任务类型进行校准
- [ ] 对任何重大感知事件进行了事后校准
- [ ] 黄色已重新建立为可持续的默认状态

## 常见问题

- **白色伪装成黄色**：声称在监控但实际上在自动驾驶。测试：你能说出最后验证的事实吗？如果不能，你处于白色
- **慢性橙色**：将每个不确定性都视为威胁会消耗认知资源并减慢工作。橙色用于特定已识别的风险，不是一般焦虑。如果一切都感觉有风险，校准偏离了
- **无行动的观察**：检测到威胁但不循环 OODA 来解决它。没有响应的检测比没有检测更糟——它增加焦虑而不纠正
- **跳过定向**：从观察跳到行动而不理解观察的含义。这会产生可能比原始错误更糟的反应性纠正
- **忽视直觉信号**：当某些东西"感觉不对"但显式检查返回干净时，进一步调查而不是忽略这种感觉。隐式模式匹配通常在显式分析之前检测到问题
- **过度稳定化**：对次要问题运行完整的稳定化协议。快速事实检查对大多数橙色级别的关切就足够了。将完整稳定化保留给红色和黑色事件

## 相关技能

- `mindfulness` — 本技能映射到 AI 推理的人类实践；物理态势感知原则为认知威胁检测提供信息
- `center` — 建立感知运行的平衡基线；没有中心的感知就是过度警觉
- `redirect` — 在感知检测到压力后处理压力
- `heal` — 当感知揭示出偏移模式时进行更深层的子系统评估
- `meditate` — 发展感知所依赖的观察清晰度
