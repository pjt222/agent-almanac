---
name: unleash-the-agents
description: >
  在并行波次中启动所有可用代理，对正确领域未知的问题进行开放式假设生成。
  在面对无清晰起点的跨领域问题时、单代理方法停滞时，或多样视角比深度
  专长更有价值时使用。产出带收敛分析和对抗性精炼的有序假设集。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob Agent ToolSearch TeamCreate TaskCreate TaskUpdate TaskList SendMessage
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: swarm
  complexity: advanced
  language: multi
  tags: swarm, parallel, hypothesis-generation, multi-agent, brainstorming, convergence
  locale: zh-CN
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# 释放代理

在并行波次中咨询所有可用代理，为开放式问题生成多样假设。每个代理通过其独特领域视角推理 —— kabalist 通过数字命理找到模式、martial-artist 提议条件分支、contemplative 通过与数据共处注意结构。跨独立视角的收敛是假设有价值的主要信号。

## 适用场景

- 面对正确方法未知的跨领域问题
- 单代理或单领域方法已停滞或未产生信号
- 问题受益于真正多样视角（不只是更多算力）
- 您需要假设生成，而非执行（执行用团队）
- 错过非显而易见角度承担真实代价的高风险决策

## 输入

- **必需**：问题简报 —— 问题清晰描述、5+ 具体示例，以及什么算解决方案
- **必需**：验证方法 —— 如何测试假设是否正确（程序化测试、专家审查或零模型对比）
- **可选**：代理子集 —— 要包含或排除的特定代理（默认：所有已注册代理）
- **可选**：波次大小 —— 每波代理数（默认：10）
- **可选**：输出格式 —— 代理响应的结构化模板（默认：假设 + 推理 + 信心 + 可测试预测）

## 步骤

### 第 1 步：准备简报

写一份任何代理都能理解的问题简报，无论领域专长。包括：

1. **问题陈述**：您试图发现或决定什么（1-2 句）
2. **示例**：至少 5 个具体输入/输出示例或数据点（越多越好 —— 3 个对大多数代理找到模式太少）
3. **已知约束**：您已知道什么、已尝试什么
4. **成功标准**：如何识别正确假设
5. **输出模板**：您想要响应的精确格式

```markdown
## Brief: [Problem Title]

**Problem**: [1-2 sentence statement]

**Examples**:
1. [Input] → [Output]  (explain what's known)
2. [Input] → [Output]
3. [Input] → [Output]
4. [Input] → [Output]
5. [Input] → [Output]

**Already tried**: [List failed approaches to avoid rediscovery]

**Success looks like**: [Testable criterion]

**Respond with**:
- Hypothesis: [Your proposed mechanism in one sentence]
- Reasoning: [Why your domain expertise suggests this]
- Confidence: [low/medium/high]
- Testable prediction: [If my hypothesis is correct, then X should be true]
```

**预期结果：** 自包含的简报 —— 仅收到此文本的代理拥有推理问题所需的一切。

**失败处理：** 若您无法表达 5 个示例或验证方法，问题尚未准备好多代理咨询。先缩窄范围。

### 第 2 步：规划波次

列出所有可用代理并将它们分为约 10 个的波次。前 2 波顺序无关；后续波次的波间知识注入改善结果。

```bash
# List all agents from registry
grep '  - id: ' agents/_registry.yml | sed 's/.*- id: //' | shuf
```

将代理分配到波次。最初规划 4 波 —— 您可能不需要所有（见第 4 步的早停）。

| 波次 | 代理 | 简报变体 |
|------|--------|---------------|
| 1-2 | 20 个代理 | 标准简报 |
| 3 | 10 个代理 + advocatus-diaboli | 简报 + 涌现共识 + 对抗性挑战 |
| 4+ | 各 10 个代理 | 简报 + "X 已确认。专注边界情况和失败。" |

**预期结果：** 所有代理已分配的波次分配表。在 Wave 3（不要后）包含 `advocatus-diaboli`，使对抗通行告知后续波次。

**失败处理：** 若可用代理少于 20，减为 2-3 波。模式仍可工作（少至 10 个代理），尽管收敛信号较弱。

### 第 3 步：启动波次

将每波作为并行代理启动。为成本效率使用 `sonnet` 模型（价值来自视角多样性，非个体深度）。

#### 选项 A：TeamCreate（推荐用于完整释放）

使用 Claude Code 的 `TeamCreate` 工具设置带任务跟踪的协调团队。TeamCreate 是延迟工具 —— 先通过 `ToolSearch("select:TeamCreate")` 获取它。

1. 创建团队：
   ```
   TeamCreate({ team_name: "unleash-wave-1", description: "Wave 1: open-ended hypothesis generation" })
   ```
2. 用 `TaskCreate` 为每个代理创建任务，附简报和领域特定构架
3. 使用 `Agent` 工具派生每个代理为团友，附 `team_name: "unleash-wave-1"` 和设为代理类型的 `subagent_type`（如 `kabalist`、`geometrist`）
4. 通过 `TaskUpdate` 用 `owner` 将任务分配给团友
5. 通过 `TaskList` 监视进度 —— 团友完成后将任务标记完成
6. 在波次之间，通过 `SendMessage({ type: "shutdown_request" })` 关闭当前团队，并用更新的简报创建下个团队（第 4 步）

这给您内置协调：共享任务列表跟踪哪些代理已响应、可向团友发消息跟进，且 lead 通过任务分配管理波次过渡。

#### 选项 B：原始 Agent 派生（更简单，用于较小运行）

对波中每个代理，用简报和领域特定构架派生它：

```
Use the [agent-name] agent to analyze this problem through your domain expertise.
[Paste the brief]
Think about this from your specific perspective as a [agent-description].
[For non-technical agents: add a domain-specific framing, e.g., "What patterns
does your tradition recognize in systems that exhibit this kind of threshold behavior?"]
Respond exactly in the requested format.
```

使用 Agent 工具用 `run_in_background: true` 同时启动一波中所有代理。等待波次完成后再启动下波（以使能第 4 步的波间知识注入）。

#### 在选项之间选择

| | TeamCreate | 原始 Agent |
|---|---|---|
| 最适合 | 第 3 层完整释放（40+ 代理） | 第 2 层小组（5-10 代理） |
| 协调 | 任务列表、消息、所有权 | 即发即忘、手动收集 |
| 波间交接 | 任务状态承载 | 必须手动跟踪 |
| 开销 | 较高（每波团队设置） | 较低（每代理单一工具调用） |

**预期结果：** 每波在 2-5 分钟内返回约 10 个结构化响应。无法响应或返回非格式输出的代理被注明，但不阻塞流水线。

**失败处理：** 若波次失败超过 50%，检查简报清晰度。常见原因：输出模板模糊，或示例对非领域代理推理不足。

### 第 4 步：注入波间知识（并评估早停）

波 1-2 后，在启动下波前提取涌现信号。

1. 扫描已完成波次的响应找重复主题
2. 识别最常见假设家族（收敛信号）
3. **检查早停阈值**：若顶级家族在 20 个代理后已超过零模型预期 3 倍，您有强信号。规划 Wave 3 为对抗性 + 精炼波，并考虑在其后停止
4. 为下波更新简报：

```markdown
**Update from prior waves**: [N] agents independently proposed [hypothesis family].
Build on this — what explains the remaining cases where this hypothesis fails?
Do NOT simply restate this finding. Extend, challenge, or refine it.
```

**早停指南**：并非每个 unleash 都需要所有代理。对良好定义的问题域（如代码库分析），收敛常在 30-40 个代理稳定。对抽象或开放式问题（如未知数学转换），完整名册增加价值，因为正确领域真正不可预测。每波后检查收敛 —— 若顶级家族的计数和零模型比已平台化，额外波产生递减收益。

这防止重发现（后波独立重新得出早波已找到的）并将后代理引向问题边缘。

**预期结果：** 后波产出更细微、有针对性的假设，处理涌现共识的差距。

**失败处理：** 若 2 波后未出现收敛，问题可能太无约束。考虑缩窄范围或提供更多示例。

### 第 5 步：收集和去重

所有波次完成后，将所有响应聚集到单一文档。通过将假设分组到家族去重：

1. 提取所有假设陈述
2. 按机制聚类（不按措辞 —— "modular arithmetic mod 94" 和 "cyclic group over Z_94" 是同一家族）
3. 计算每个家族的独立发现数
4. 按收敛排名：被更多代理独立发现的家族排名更高

**预期结果：** 带收敛计数、贡献代理和代表性可测试预测的有序假设家族列表。

**失败处理：** 若每个假设独特（无收敛），信噪比太低。要么问题需更多示例，要么代理需更紧输出格式。

### 第 6 步：对照零模型验证

对照零模型测试顶级假设以确保收敛有意义，非共享训练数据的伪影。

- **程序化验证**：若假设产出可测试公式或算法，对保留示例运行
- **零模型**：估计 N 个代理偶然收敛到同一假设家族的概率（如，若有 K 个合理假设家族，随机收敛概率约为 N/K）
- **阈值**：若收敛超过零模型预期 3 倍，信号有意义

**预期结果：** 顶级假设家族显著超过偶然级收敛和/或通过程序化验证。

**失败处理：** 若顶级假设验证失败，检查第二排名家族。若无家族通过，问题可能需要不同方法（更深单专家分析、更多数据或重新表述示例）。

### 第 7 步：对抗性精炼

**优选时机：Wave 3，非综合后。** 在 Wave 3（与波间知识注入并行）包含 `advocatus-diaboli` 比所有波次完成后的独立对抗通行更有效。早期挑战让 Waves 4+ 对照批评精炼，而非堆叠到未挑战共识上。

若对抗通行已是 Wave 3 的一部分，本步骤成为最终检查。若否（如您不带它运行所有波），现在派生 `advocatus-diaboli`（或 `senior-researcher`）。对结构化通行，使用 `TeamCreate` 起立审查团队，两个代理并行对照共识工作：

```
Here is the consensus hypothesis from [N] independent agents:
[Hypothesis]
[Supporting evidence and convergence stats]

Your job: find the strongest counterarguments. Where does this fail?
What alternative explanations are equally consistent with the evidence?
What experiment would definitively falsify this hypothesis?
```

**预期结果：** 一组反论点、边界情况和证伪实验。若假设在对抗审查中存活，它已准备好整合。良好的对抗通行有时*部分辩护*共识 —— 发现设计比备选更好（即使不完美）。

**失败处理：** 若对抗代理找到致命缺陷，将批评反馈到目标后续波（第 3 层+ 迭代模式 —— 选择 5-10 个最适合处理特定批评的代理）。

### 第 8 步：交给团队

Unleash 找问题；团队解决它们。将验证的假设家族转换为可执行 issue，然后组装聚焦团队解决每个。

1. 每个验证的假设家族创建一个 GitHub issue（使用 `create-github-issues` 技能）
2. 按收敛强度和影响优先化 issue
3. 对每个 issue，通过 `TeamCreate` 组装小团队：
   - 若 `teams/` 中预定义团队定义匹配问题域，使用它
   - 若无契合团队存在，默认 `opaque-team`（N 个 shapeshifter 带自适应角色分配）—— 它处理未知问题形状而无需自定义组合
   - 包含至少一个非技术代理（如 `advocatus-diaboli`、`contemplative`）—— 他们捕捉技术代理错过的实现风险
   - 在阶段间使用 REST 检查点防止赶时间
4. 流水线是：**unleash → triage → team-per-issue → resolve**

**预期结果：** 每个假设家族映射到带分配团队的跟踪 issue。Unleash 产出诊断；团队产出修复。

**失败处理：** 若团队组合不匹配问题，重新分配。Shapeshifter 代理可研究和设计但缺写工具 —— 团队 lead 必须应用其代码建议。

## 验证清单

- [ ] 咨询了所有可用代理（或刻意选择子集附理由）
- [ ] 以结构化、可解析格式收集响应
- [ ] 假设按独立收敛去重并排名
- [ ] 顶级假设对照零模型或程序化测试验证
- [ ] 对抗通行挑战共识
- [ ] 最终假设包括可测试预测和已知限制

## 常见问题

- **简报中示例过少**：代理需要 5+ 示例找模式。3 个示例时，多数代理诉诸表面级模式匹配或模板回响（用不同词重复简报）。
- **无验证路径**：没有测试假设的方法，您无法区分信号与噪声。仅收敛必要但不充分。
- **隐喻响应**：领域专家代理（mystic、shaman、kabalist）可能用难以程序化解析的丰富隐喻推理响应。在输出模板中包括 "Express your hypothesis as a testable formula or algorithm"。
- **跨波重发现**：没有波间知识注入，波 3-7 独立重发现波 1-2 已找到的。波间始终更新简报。
- **过度解释收敛**：43% 收敛到机制家族听起来令人印象深刻，但检查基率。若仅 3 个合理机制家族，随机收敛会约 33%。
- **期望单家族主导**：抽象问题（模式识别、密码学）倾向产出一个主导假设家族。多维问题（代码库分析、系统设计）跨多个有效家族产出更广收敛 —— 这是预期且健康，非模式失败。
- **非技术代理的通用构架**：非技术代理贡献的质量取决于简报如何用其领域语言构架问题。"What does your tradition say about systems at this threshold?" 产出结构性洞见；通用简报产出无。投资于问题自然领域外代理的领域特定构架。
- **将此用于执行**：本模式生成假设，非实现。一旦您有验证假设，将其转换为 issue 并交给团队（第 8 步）。流水线是 unleash → triage → team-per-issue。

## 相关技能

- `forage-solutions` —— 蚁群优化用于探索解空间（互补：更窄范围、更深探索）
- `build-coherence` —— 蜜蜂民主用于在竞争方法间选择（在此技能后使用以在顶级假设间选择）
- `coordinate-reasoning` —— 共生协调用于管理代理间信息流
- `coordinate-swarm` —— 分布式系统的更广群体协调模式
- `expand-awareness` —— 在收窄前打开感知（互补：作为个体代理准备使用）
- `meditate` —— 启动前清除上下文噪声（推荐在第 1 步之前）
