---
name: cross-review-project
description: >
  通过 cross-review-mcp 中介在两个 Claude Code 实例之间进行结构化的
  跨项目代码审查。每个代理读取自己的代码库、审查同伴的代码，并以证据
  支持的对话进行交流 —— 由 QSG 缩放定律通过最小带宽约束和阶段门控
  推进强制审查质量。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mcp-integration
  complexity: advanced
  language: multi
  tags: mcp, cross-review, multi-agent, code-review, qsg, a2a
  locale: zh-CN
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# 跨项目审查

两个 Claude Code 实例通过 `cross-review-mcp` 中介的结构化工件交换互相审查项目。中介强制执行 Quantized Simplex Gossip (QSG) 缩放定律 —— 审查捆绑必须包含至少 5 个发现以保持在选择区间（Γ_h ≈ 1.67），防止浅层共识冒充为同意。

## 适用场景

- 两个项目共享架构关切，可以互相学习
- 你希望进行超出单一审阅者所见的独立代码审查
- 目标是交叉授粉：在一个项目中发现另一个项目缺失的模式
- 你需要带 accept/reject/discuss 裁决的、结构化的、证据支持的审查

## 输入

- **必需**：可被两个 Claude Code 实例访问的两个项目路径
- **必需**：`cross-review-mcp` 中介正在运行并在两个实例中配置为 MCP 服务器
- **可选**：聚焦区域 —— 优先处理的特定目录、模式或关切
- **可选**：Agent ID —— 每个实例的标识符（默认：项目目录名）

## 步骤

### 第 1 步：验证前提条件

确认中介正在运行且两个实例都能到达它。

1. 检查中介已配置为 MCP 服务器：
   ```bash
   claude mcp list | grep cross-review
   ```
2. 调用 `get_status` 验证中介响应正常且无过时代理已注册
3. 阅读 `cross-review://protocol` 处的协议资源 —— 这是描述审查维度和 QSG 约束的 markdown 文档

**预期结果：** 中介对 `get_status` 响应空代理列表。协议资源可读为 markdown。

**失败处理：** 若中介未配置，添加它：`claude mcp add cross-review-mcp -- npx cross-review-mcp`。若先前会话遗留过时代理，在继续前对每个调用 `deregister`。

### 第 2 步：注册

向中介注册此代理。

1. 调用 `register`，提供：
   - `agentId`：简短、唯一的标识符（如项目目录名）
   - `project`：项目名
   - `capabilities`：`["review", "suggest"]`
2. 调用 `get_status` 验证注册 —— 你的代理应以 phase `"registered"` 出现
3. 等待同伴代理注册：调用 `wait_for_phase`，提供同伴的 agent ID 和 phase `"registered"`

**预期结果：** 两个代理已在中介注册。`get_status` 显示 2 个代理处于 phase `"registered"`。

**失败处理：** 若 `register` 因 "already registered" 失败，agent ID 已被先前会话占用。先调用 `deregister`，再重新注册。

### 第 3 步：简报阶段

读取自己的代码库并向同伴发送结构化简报。

1. 系统化阅读：
   - 入口点（主文件、index、CLI 命令）
   - 依赖图（package.json、DESCRIPTION、go.mod）
   - 架构模式（目录结构、模块边界）
   - 已知问题（TODO 注释、未解决问题、技术债）
   - 测试覆盖（测试目录、CI 配置）
2. 撰写 `Briefing` 工件 —— 一个结构化摘要，让同伴能高效导航你的代码库
3. 调用 `send_task`，提供：
   - `from`：你的 agent ID
   - `to`：同伴 agent ID
   - `type`：`"briefing"`
   - `payload`：JSON 编码的简报
4. 调用 `signal_phase`，提供 phase `"briefing"`

**预期结果：** 简报已发送且阶段已发出信号。中介强制要求你必须先发送简报才能推进到审查。

**失败处理：** 若 `send_task` 拒绝简报，检查 `from` 字段是否与你已注册的 agent ID 匹配。自发送会被拒绝。

### 第 4 步：审查阶段

等待同伴的简报，然后审查他们的代码并发送发现。

1. 调用 `wait_for_phase`，提供同伴 ID 和 phase `"briefing"`
2. 调用 `poll_tasks` 检索同伴的简报
3. 调用 `ack_tasks`，提供收到的任务 ID —— 这是必需的（peek-then-ack 模式）
4. 在简报指引下阅读同伴的实际源代码
5. 在 6 个类别中产出发现：
   - `pattern_transfer` —— 同伴可以采用的、你项目中的模式
   - `missing_practice` —— 同伴缺乏的实践（测试、验证、错误处理）
   - `inconsistency` —— 同伴代码库内部矛盾
   - `simplification` —— 可以减少的不必要复杂性
   - `bug_risk` —— 潜在运行时失败或边界情况
   - `documentation_gap` —— 缺失或误导的文档
6. 每个发现必须包括：
   - `id`：唯一标识符（如 `"F-001"`）
   - `category`：上述 6 个类别之一
   - `targetFile`：同伴项目中的路径
   - `description`：你发现了什么
   - `evidence`：为何这是有效发现（代码引用、模式）
   - `sourceAnalog`（推荐）：你自己项目中演示该模式的等价物 —— 这是真正交叉授粉的唯一机制
7. 捆绑至少 **5 个发现**（QSG 约束：m ≥ 5 使 Γ_h ≈ 1.67 保持在选择区间）
8. 调用 `send_task`，提供 type `"review_bundle"` 和 JSON 编码的发现数组
9. 调用 `signal_phase`，提供 phase `"review"`

**预期结果：** 审查捆绑被中介接受。少于 5 个发现会被拒绝。

**失败处理：** 若捆绑因发现不足被拒绝，更深入审查。该约束存在以防止浅层审查占主导。若你确实找不到 5 个问题，重新考虑跨审查是否是此项目对的合适工具。

### 第 5 步：对话阶段

接收关于自己项目的发现并以证据支持的裁决回应。

1. 调用 `wait_for_phase`，提供同伴 ID 和 phase `"review"`
2. 调用 `poll_tasks` 检索关于你项目的发现
3. 调用 `ack_tasks`，提供收到的任务 ID
4. 对每个发现，产出 `FindingResponse`：
   - `findingId`：与发现 ID 匹配
   - `verdict`：`"accept"`（有效，将采取行动）、`"reject"`（无效，附反证据）或 `"discuss"`（需要澄清）
   - `evidence`：为何接受或拒绝 —— 必须非空
   - `counterEvidence`（可选）：与发现相矛盾的特定代码引用
5. 通过 `send_task` 发送所有响应，提供 type `"response"`
6. 调用 `signal_phase`，提供 phase `"dialogue"`

注意：`"discuss"` 裁决不被协议门控 —— 将其视为手动跟进的标志，而非自动子交换。

**预期结果：** 所有发现都以裁决回应。空响应被中介拒绝。

**失败处理：** 若你无法对某发现形成意见，默认 `"discuss"`，并附解释你需要哪些额外上下文的证据。

### 第 6 步：综合阶段

产出综合工件，汇总已接受的发现和计划行动。

1. 调用 `wait_for_phase`，提供同伴 ID 和 phase `"dialogue"`
2. 轮询任何剩余任务并确认它们
3. 编译 `Synthesis` 工件：
   - 已接受的发现及计划行动（你将更改什么以及为何）
   - 已拒绝的发现及理由（为未来审查保留推理）
4. 调用 `send_task`，提供 type `"synthesis"` 和 JSON 编码的综合
5. 调用 `signal_phase`，提供 phase `"synthesis"`
6. 可选地为已接受的发现创建 GitHub issue
7. 调用 `signal_phase`，提供 phase `"complete"`
8. 调用 `deregister` 进行清理

**预期结果：** 两个代理都达到 `"complete"`。中介要求至少 2 个已注册代理才能推进到 complete。

**失败处理：** 若同伴已注销，你仍可在本地完成。从你收到的发现中编译你的综合。

## 验证清单

- [ ] 两个代理都已注册并达到 `"complete"` 阶段
- [ ] 简报在审查开始前交换（阶段强制）
- [ ] 审查捆绑各包含至少 5 个发现
- [ ] 所有发现都收到带证据的裁决（accept/reject/discuss）
- [ ] 每次 `poll_tasks` 后都调用了 `ack_tasks`
- [ ] 已产出综合，并将已接受发现映射到行动
- [ ] 完成后已注销代理

## 常见问题

- **少于 5 个发现**：中介拒绝 m < 5 的捆绑。这并非任意 —— 在 N=2 代理和 6 类别下，m < 5 使 Γ_h 处于或低于共识与噪声不可分的临界边界。更深入审查；若确实找不到 5 个发现，项目可能不会从跨审查中受益。
- **遗忘 `ack_tasks`**：中介使用 peek-then-ack 投递。任务保留在队列中直到确认。遗忘 ack 会在下次轮询时导致重复处理。
- **遗忘 `from` 参数**：`send_task` 需要显式 `from` 字段匹配你的 agent ID。自发送被拒绝。
- **同模型认知相关性**：两个 Claude 实例共享训练偏差。时间排序确保它们在审查期间不读取彼此输出，但它们的先验是相关的。为获得真正的认知独立性，跨实例使用不同模型族。
- **跳过 `sourceAnalog`**：`sourceAnalog` 字段可选，但是真正交叉授粉的唯一机制 —— 它展示*你*对你推荐模式的实现。当存在源类比时始终填充。
- **将 `discuss` 视为阻塞**：协议中没有任何东西在待处理讨论解决前阻塞 `complete`。将 `discuss` 裁决视为会话后手动跟进的标志。
- **不审查遥测**：中介将所有事件记录到 JSONL。会话后审查日志以验证 QSG 假设 —— 经验性估计 α（`α ≈ 1 - reject_rate`）并检查每类别接受率。

## 相关技能

- `scaffold-mcp-server` —— 用于构建或扩展中介本身
- `implement-a2a-server` —— 中介借鉴的 A2A 协议模式
- `review-codebase` —— 单代理审查（此技能将其扩展到跨代理结构化交换）
- `build-consensus` —— 群体共识模式（QSG 是理论基础）
- `configure-mcp-server` —— 在 Claude Code 中将中介配置为 MCP 服务器
- `unleash-the-agents` —— 可用于分析中介本身（实战检验：40 个代理、10 个假设族）
