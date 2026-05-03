---
name: evolve-skill-from-traces
description: >
  使用三阶段流水线从代理执行轨迹演化 SKILL.md 文件：从观察到的运行收集
  轨迹、并行多代理补丁提议（用于错误和成功分析），以及通过流行度加权对
  重叠编辑进行无冲突合并。基于 Trace2Skill 方法论。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob Agent
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: advanced
  language: multi
  tags: meta, skill-evolution, traces, multi-agent, consolidation, trace2skill
  locale: zh-CN
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# 从执行轨迹演化技能

通过三阶段流水线将原始代理执行轨迹转化为经验证的 SKILL.md：轨迹收集、并行多代理补丁提议和无冲突合并。本技能桥接观察到的代理行为与已记录的步骤之间的差距，将成功运行转化为可复现的技能。

## 适用场景

- 执行轨迹揭示现有技能未捕捉的反复出现的模式
- 观察到的代理行为优于已记录的步骤
- 通过记录专家演示从零构建技能
- 多个代理对同一技能提出冲突的改进

## 输入

- **必需**：`traces` —— 一组代理执行日志或会话记录（建议至少 10 次成功运行）
- **必需**：`target_skill` —— 待演化的现有 SKILL.md 路径，或 `"new"` 表示从零提取技能
- **可选**：`analyst_count` —— 要派生的并行分析师代理数（默认：4）
- **可选**：`held_out_ratio` —— 保留用于验证、不用于起草的轨迹比例（默认：0.2）

## 步骤

### 第 1 步：收集执行轨迹

收集展示目标行为的代理会话日志、工具调用序列或对话记录。过滤标记为成功的运行。归一化为标准轨迹格式：带时间戳的 (state, action, outcome) 三元组序列。

1. 识别轨迹源：会话日志、工具调用历史或对话导出
2. 按成功标准过滤轨迹（退出码 0、任务完成标志、用户确认）
3. 将每个轨迹归一化为结构化三元组列表：

```
trace_entry:
  state: <context before the action>
  action: <tool call, command, or decision made>
  outcome: <result, output, or state change>
  timestamp: <ISO 8601>
```

4. 划分轨迹：保留 `held_out_ratio`（默认 20%）用于第 7 步的验证，其余用于第 2-6 步

```bash
# Example: count available traces and compute partition
total_traces=$(ls traces/*.json | wc -l)
held_out=$(echo "$total_traces * 0.2 / 1" | bc)
drafting=$((total_traces - held_out))
echo "Drafting: $drafting traces, Held-out: $held_out traces"
```

**预期结果：** 划分为起草（80%）和保留（20%）子集的归一化轨迹集。每个轨迹条目包含 state、action、outcome 和 timestamp 字段。

**失败处理：** 若可用的成功轨迹少于 10 个，先收集更多再继续。小轨迹集产出在新输入上失败的过拟合技能。若轨迹缺少时间戳，改为分配序数序列号。

### 第 2 步：聚类轨迹

按结果模式分组归一化轨迹。识别不变核心（所有成功轨迹中存在的步骤）vs 可变分支（运行间不同的步骤）。不变核心成为技能步骤的骨架。

1. 按 action 类型对齐轨迹 —— 将每个轨迹映射到 action 标签序列
2. 找到所有轨迹中最长的公共子序列以识别不变核心
3. 将剩余 action 分类为可变分支，记录哪些轨迹包含它们及在何条件下
4. 记录分支频率：每个可变步骤在多少百分比的成功轨迹中出现

```
invariant_core:
  - action: "read_input_file"
    frequency: 100%
  - action: "validate_schema"
    frequency: 100%
  - action: "transform_data"
    frequency: 100%

variant_branches:
  - action: "retry_on_timeout"
    frequency: 35%
    condition: "network latency > 2s"
  - action: "fallback_to_cache"
    frequency: 15%
    condition: "API returns 503"
```

**预期结果：** 不变核心 action（在所有成功轨迹中出现）与可变分支（条件性，在子集中出现）之间的清晰分离。每个可变分支有频率计数和触发条件。

**失败处理：** 若没有不变核心浮现（轨迹过于异质），目标行为实际上可能是多个不同的技能。按结果类型将轨迹拆分为连贯子组，分别处理每个组。

### 第 3 步：起草技能骨架

从不变核心生成初始 SKILL.md，包含 frontmatter、何时使用（从轨迹间的入口条件派生）、输入（运行间变化的参数）和每个不变 action 一步的步骤部分。

1. 从每个轨迹的第一个状态提取入口条件以填充"何时使用"
2. 识别运行间变化的参数（文件路径、阈值、选项）以填充"输入"
3. 每个不变核心 action 创建一个步骤，使用轨迹间最常见的措辞
4. 基于观察到的结果添加占位 Expected/On failure 块

```bash
# Scaffold the skeleton if creating a new skill
mkdir -p skills/<skill-name>/
```

```markdown
# Skeleton structure
## When to Use
- <derived from common entry conditions>

## Inputs
- **Required**: <parameters present in all traces>
- **Optional**: <parameters present in some traces>

## Procedure
### Step N: <invariant action label>
<most common implementation from traces>

**Expected:** <most common success outcome>
**On failure:** <placeholder -- refined in Steps 4-6>
```

**预期结果：** 一个语法上有效的 SKILL.md 骨架，含 frontmatter、何时使用、输入和包含每个不变核心 action 一步的步骤部分。Expected 块反映观察结果；On failure 块为占位。

**失败处理：** 若骨架在添加可变分支前就超过 500 行，不变核心过于细粒度。合并总是一起出现的相邻 action 为单个步骤。目标 5-10 个步骤。

### 第 4 步：并行多代理补丁提议

派生 N 个分析师代理（建议 4-6 个），每个从不同的分析视角对照起草骨架审查完整轨迹集。每个代理产出结构化补丁：section、old text、new text、rationale。

每个分析师分配一个视角：

| 分析师 | 视角 | 关注 |
|---------|------|-------|
| 1 | 正确性 | 骨架是否捕捉了所有成功路径？是否有不变步骤缺失？ |
| 2 | 效率 | 是否有冗余步骤？是否可合并或并行任何步骤？ |
| 3 | 健壮性 | 哪些失败模式未处理？On failure 块应包含什么？ |
| 4 | 边界情况 | 哪些可变分支应成为条件步骤或 pitfalls？ |
| 5（可选） | 清晰度 | 每个步骤是否无歧义？代理能否机械地遵循？ |
| 6（可选） | 可泛化性 | 是否有应抽象的轨迹特定工件？ |

每个分析师代理接收：
- 第 3 步的起草骨架
- 完整的起草轨迹集（非保留）
- 分配的视角和关注问题

每个分析师返回结构化补丁列表：

```
patch:
  analyst: "robustness"
  section: "Procedure > Step 3"
  old_text: "**On failure:** <placeholder>"
  new_text: "**On failure:** If the API returns 503, wait 5 seconds and retry up to 3 times. If retries are exhausted, fall back to the cached response from the previous successful run."
  rationale: "Traces #4, #7, #12 show 503 errors resolved by retry. Trace #15 shows cache fallback when retries fail."
  supporting_traces: [4, 7, 12, 15]
```

**预期结果：** 每个分析师返回 3-10 个结构化补丁，附 section 引用、old/new 文本、理由和支持轨迹 ID。所有补丁收集到单一补丁集。

**失败处理：** 若分析师未返回补丁，其视角可能不适用此技能。这可接受 —— 不是每个视角都浮现问题。若分析师返回模糊补丁且无轨迹引用，拒绝并以"具体 supporting_traces"要求重新提示。

### 第 5 步：检测和分类冲突

比较第 4 步所有补丁以查找重叠编辑。将每对重叠补丁分类为三类之一。

1. 按目标 section 索引补丁
2. 对针对相同 section 的补丁，比较 old_text 和 new_text
3. 分类每个重叠：

| 冲突类型 | 定义 | 解决 |
|---------------|-----------|------------|
| 兼容 | 不同 section，无重叠 | 直接合并 |
| 互补 | 相同 section，加性的（两者都添加内容，无矛盾） | 组合文本 |
| 矛盾 | 相同 section，互斥（一个添加 X，另一个移除 X 或转而添加 Y） | 在第 6 步需要解决 |

```
conflict_report:
  total_patches: 24
  compatible: 18
  complementary: 4
  contradictory: 2
  contradictions:
    - section: "Procedure > Step 5"
      patch_a: {analyst: "efficiency", action: "remove step"}
      patch_b: {analyst: "robustness", action: "add retry logic"}
      supporting_traces_a: [2, 8, 11]
      supporting_traces_b: [4, 7, 12, 15]
```

**预期结果：** 冲突报告，列出所有补丁对、其分类，以及对矛盾，每方的支持轨迹计数。

**失败处理：** 若分类有歧义（一个补丁在同一 section 既添加又修改文本），拆分为两个补丁：一个加性、一个修改。重新分类较小的补丁。

### 第 6 步：合并补丁

使用三层解决策略将所有补丁合并到单一合并的 SKILL.md。

1. **兼容补丁**：直接应用 —— 它们触及不同 section 不会冲突
2. **互补补丁**：将两个补丁的 new_text 合并为单个连贯块，保留两者贡献
3. **矛盾补丁**：用流行度加权解决：
   - 计算支持每种变体的轨迹数
   - 优先选择与更多轨迹对齐的补丁
   - 若打平（或在 10% 内），使用 `argumentation` 技能评估哪个补丁更好地服务技能既定目的
   - 将被拒绝的备选记录为 Common Pitfall 或相关 On failure 块中的注释

```
consolidation_log:
  applied_directly: 18
  combined: 4
  resolved_by_prevalence: 1
  resolved_by_argumentation: 1
  rejected_alternatives_documented: 2
```

合并后，验证产生的 SKILL.md：
- 所有部分都存在（何时使用、输入、步骤、验证、常见问题、相关技能）
- 每个步骤都有 Expected 和 On failure
- 不再有重复或矛盾的指令
- 行数在 500 行限制内

**预期结果：** 包含所有分析师补丁的单个合并 SKILL.md。矛盾以记录的理由解决。每个矛盾的被拒绝备选作为 pitfall 或注释出现。

**失败处理：** 若合并产出内部不一致的文档（如第 3 步假设文件存在但第 2 步被效率补丁移除），还原冲突编辑并保留该 section 的原始骨架文本。标记不一致以供手动审查。

### 第 7 步：验证并注册

在脑海中针对保留轨迹（第 1 步保留的 20%）运行合并的技能。验证 Expected/On failure 块匹配技能从未见过的轨迹中观察到的结果。

1. 对每个保留轨迹，逐步走过技能步骤
2. 在每步，比较技能的 Expected 结果与轨迹的实际结果
3. 记录匹配和不匹配：

```
validation_results:
  held_out_traces: 5
  full_match: 4
  partial_match: 1
  no_match: 0
  mismatches:
    - trace_id: 23
      step: 4
      expected: "API returns 200"
      actual: "API returns 429 (rate limited)"
      action: "Add rate-limit handling to On failure block"
```

4. 若不匹配率超过 20%，回到第 4 步并将不匹配轨迹加入起草集
5. 若是新技能，按 `create-skill` 进行目录创建、注册表条目和符号链接设置
6. 若演化现有技能，按 `evolve-skill` 进行版本提升和翻译同步

```bash
# Final validation: line count
lines=$(wc -l < skills/<skill-name>/SKILL.md)
[ "$lines" -le 500 ] && echo "OK ($lines lines)" || echo "FAIL: $lines lines > 500"
```

**预期结果：** 至少 80% 的保留轨迹端到端匹配技能步骤。技能已在 `skills/_registry.yml` 中以正确元数据注册。

**失败处理：** 若验证失败（>20% 不匹配），技能已对起草轨迹过拟合。将不匹配轨迹加入起草集并从第 2 步重跑。若两次迭代后验证仍失败，行为对单个技能可能太多变 —— 考虑按结果类型拆分为多个技能。

## 验证清单

- [ ] 起草前收集了至少 10 个成功轨迹
- [ ] 轨迹划分为起草（80%）和保留（20%）子集
- [ ] 不变核心和可变分支已显式记录
- [ ] 至少 4 个分析师代理从不同视角审查骨架
- [ ] 所有补丁冲突已分类（兼容、互补、矛盾）
- [ ] 矛盾补丁以记录的理由解决
- [ ] 合并的 SKILL.md 包含所有必需部分及 Expected/On failure 对
- [ ] 保留验证达到至少 80% 匹配率
- [ ] 行数在 500 行限制内
- [ ] 技能按标准步骤注册（新）或版本提升（现有）

## 常见问题

- **轨迹过少**：少于 10 次成功运行时，模式提取不可靠。不变核心可能包含偶然步骤，可变分支将缺乏足够的频率数据。开始前收集更多轨迹。
- **对轨迹工件过拟合**：工具特定行为（如某 API 客户端的重试模式）可能不泛化。在第 3 步，将工具特定 action 抽象为工具无关描述。技能应描述要做*什么*，而非用*哪个工具*。
- **忽略失败轨迹**：失败轨迹揭示技能应在 On failure 块中警告什么。在第 1 步，也收集失败运行并标记。在第 4 步当健壮性分析师评估未处理失败模式时使用它们。
- **单视角分析**：仅使用 1-2 个分析师会错过重要视角。仅效率分析师会剥离健壮性分析师会保留的安全检查。使用至少 4 个不同视角以获得平衡覆盖。
- **不解决就合并矛盾补丁**：应用矛盾的两面产出内部不一致的技能（如一步"做 X"，另一步"跳过 X"）。在第 6 步始终显式分类并解决矛盾。
- **不针对保留轨迹验证**：没有保留验证，合并技能可能完美适合起草轨迹但在新运行上失败。始终保留 20% 轨迹并对最终技能测试它们。

## 相关技能

- `evolve-skill` —— 更简单的人类指导演化（互补：在轨迹不可用时使用）
- `create-skill` —— 用于尚不存在的新提取技能；第 7 步注册时使用
- `review-skill-format` —— 合并后验证以确保 agentskills.io 合规
- `argumentation` —— 第 6 步当流行度打平时用于解决矛盾补丁
- `verify-agent-output` —— 补丁提议的证据轨迹；在第 4 步验证分析师输出
