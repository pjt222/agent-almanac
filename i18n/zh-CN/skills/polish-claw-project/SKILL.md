---
name: polish-claw-project
description: >
  通过结构化的 9 步工作流为 OpenClaw 生态系统项目（OpenClaw、NemoClaw、
  NanoClaw）做贡献：目标验证、代码库探索、并行审计、发现交叉引用以及
  pull request 创建。强调防止误报和遵循项目约定。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: open-source
  complexity: advanced
  language: multi
  tags: open-source, contribution, security, code-review, pull-request, claw, nvidia
  locale: zh-CN
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# 抛光 Claw 项目

为 OpenClaw 生态系统项目做贡献的结构化工作流。新颖价值在第 5-7 步：并行审计、防止误报，以及对照未解决 issue 交叉引用发现以选择高影响贡献。机械步骤（fork、PR 创建）委派给现有技能。

## 适用场景

- 为 NVIDIA/OpenClaw、NVIDIA/NemoClaw、NVIDIA/NanoClaw 或类似 Claw 生态仓库做贡献
- 首次为带安全敏感架构的不熟悉开源项目做贡献
- 当您想要可重复、可审计的贡献工作流而非临时修复时
- 在识别接受外部贡献的 Claw 项目后（检查 CONTRIBUTING.md）

## 输入

- **必需**：`repo_url` —— 目标 Claw 项目的 GitHub URL（如 `https://github.com/NVIDIA/NemoClaw`）
- **可选**：
  - `contribution_count` —— 目标贡献数（默认：1-3）
  - `focus` —— 偏好贡献类型：`security`、`tests`、`docs`、`bugs`、`any`（默认：`any`）
  - `fork_org` —— 要 fork 进入的 GitHub 组织/用户（默认：已认证用户）

## 步骤

### 第 1 步：识别并验证目标

确认项目接受外部贡献并积极维护。

1. 打开仓库 URL 并阅读 `CONTRIBUTING.md`、`CODE_OF_CONDUCT.md` 和 `LICENSE`
2. 检查最近提交活动（最后 30 天）和未解决 PR 合并率
3. 验证项目使用宽松或贡献友好的许可证
4. 阅读 `SECURITY.md` 或安全政策（若存在）—— 注意负责任披露规则
5. 识别主要语言、测试框架和 CI 系统

**预期结果：** CONTRIBUTING.md 存在，最后 30 天内有提交，清晰的贡献指南。

**失败处理：** 若无 CONTRIBUTING.md 或无近期活动，记录原因并停止 —— 陈旧项目很少合并外部 PR。

### 第 2 步：Fork 并克隆

创建仓库的工作副本。

1. Fork：`gh repo fork <repo_url> --clone`
2. 设置上游远程：`git remote add upstream <repo_url>`
3. 验证：`git remote -v` 显示 `origin`（fork）和 `upstream` 两者
4. 同步：`git fetch upstream && git checkout main && git merge upstream/main`

**预期结果：** 本地克隆，两个远程已配置且最新。

**失败处理：** 若 fork 失败，检查 GitHub 认证（`gh auth status`）。若克隆慢，初始探索尝试 `--depth=1`。

### 第 3 步：探索代码库

构建项目架构的心智模型。

1. 阅读 `README.md` 了解架构概览和项目目标
2. 识别入口点、核心模块和公开 API 表面
3. 映射测试结构：测试在哪里、什么框架、覆盖水平
4. 注意代码风格约定：linter 配置、命名模式、导入风格
5. 检查 Docker/容器设置、CI 配置和部署模式

**预期结果：** 对项目结构、约定和贡献适合处的清晰理解。

**失败处理：** 若架构不清，专注于特定子系统而非整个项目。

### 第 4 步：阅读未解决 Issue

调查现有 issue 以理解项目需求并避免重复工作。

1. 列出未解决 issue：`gh issue list --state open --limit 50`
2. 按类型分类：bug、功能、文档、安全、good-first-issue
3. 注意标记 `help wanted`、`good first issue` 或 `hacktoberfest` 的 issue
4. 检查陈旧 issue（>90 天未关闭，无近期评论）—— 这些可能被遗弃
5. 阅读任何链接的 PR 以理解尝试的解决方案

**预期结果：** 带类型标签的未认领 issue 分类列表。

**失败处理：** 若无未解决 issue 存在，进入第 5 步 —— 审计可能发现未列出的改进。

### 第 5 步：并行审计

并行运行安全和代码质量审计。这是新颖发现浮现的地方。

1. 对项目根运行 `security-audit-codebase` 技能
2. 同时以范围 `quality` 运行 `review-codebase` 技能
3. **关键：对照项目威胁模型和架构验证每个发现**
   - 沙箱引导脚本中的"硬编码密钥"不是漏洞
   - 仅内部使用函数上缺失输入验证是低严重性
   - 标记为易受攻击的依赖可能已被项目架构缓解
4. 对验证的发现评级：CRITICAL、HIGH、MEDIUM、LOW
5. 用推理记录误报 —— 它们告知未来运行的 Common Pitfalls

**预期结果：** 带严重性评级和误报注释的验证发现列表。

**失败处理：** 若无发现浮现，转向测试覆盖空隙、文档改进或开发者体验增强。

### 第 6 步：交叉引用发现

将验证的审计发现映射到未解决 issue —— 核心判断步骤。

1. 对每个验证的发现，搜索未解决 issue 中的相关讨论
2. 将每个发现分类为：
   - **匹配未解决 issue** —— 将发现链接到 issue
   - **新发现** —— 无现有 issue 涵盖此
   - **已在 PR 中修复** —— 检查未解决 PR 中的进行中修复
3. 优先处理匹配现有 issue 的发现（最高合并概率）
4. 对新发现，根据项目优先级评估维护者是否欢迎修复

**预期结果：** 带发现-到-issue 映射和合并概率评估的优先级列表。

**失败处理：** 若所有发现已被解决，返回第 4 步并寻找文档、测试或开发者体验贡献。

### 第 7 步：选择贡献

基于影响、努力和专长选择 1-3 个贡献。

1. 对每个候选评分：
   - **影响**：这对项目改进多少？（安全 > bug > 测试 > 文档）
   - **努力**：能在专注会话中很好完成吗？（偏好小、完整的 PR）
   - **专长**：贡献者对此修复有领域知识吗？
   - **合并概率**：这匹配陈述的项目优先级吗？
2. 选择前几名候选（默认：1-3）
3. 对每个，定义：分支名、范围边界、接受标准、测试计划

**预期结果：** 1-3 个选定贡献，附清晰范围和接受标准。

**失败处理：** 若无贡献得分良好，考虑提交写得好的 issue 而非 PR。

### 第 8 步：实现

每个贡献创建一个分支并实现修复。

1. 对每个贡献：`git checkout -b fix/<description>`
2. 完全遵循项目约定（linter、命名、导入风格）
3. 添加或更新覆盖变更的测试
4. 运行项目测试套件：验证所有测试通过
5. 运行项目 linter：验证无新警告
6. 保持每个 PR 专注 —— 每个分支一个逻辑变更

**预期结果：** 干净的实现，带通过测试和无 linter 警告。

**失败处理：** 若测试在预先存在问题上失败，记录它们并确保 PR 不引入新失败。

### 第 9 步：创建 Pull Request

按项目 CONTRIBUTING.md 提交贡献。

1. 推送分支：`git push origin fix/<description>`
2. 使用 `create-pull-request` 技能创建 PR
3. 在 PR 正文中引用相关 issue（如 "Fixes #123"）
4. 若存在 PR 模板，遵循它
5. 对审阅者反馈响应迅速 —— 快速迭代

**预期结果：** PR 已创建、链接到 issue、遵循项目约定。

**失败处理：** 若 PR 创建失败，检查分支保护规则和贡献者许可协议。

## 验证清单

1. 所有选定贡献已实现并作为 PR 提交
2. 每个 PR 引用相关 issue（若存在）
3. 所有项目测试在每个 PR 分支上通过
4. 没有误报发现作为真实 issue 提交
5. PR 描述遵循项目 CONTRIBUTING.md 模板

## 常见问题

- **误报过度声称**：Claw 项目使用沙箱架构 —— 沙箱环境内的"漏洞"可能是设计如此。在报告前始终对照项目威胁模型验证。
- **摘要/签名链中断**：Claw 项目常使用模型完整性验证链。变更必须保留这些链，否则 PR 会被拒绝。
- **约定不匹配**：Claw 项目执行严格风格。运行项目自己的 linter，而非通用的。完全匹配导入排序、docstring 格式和测试模式。
- **范围蔓延**：3 个专注 PR 比 1 个铺张 PR 合并更快。保持每个贡献原子。
- **过时 fork**：开始工作前始终与上游同步（`git fetch upstream && git merge upstream/main`）。

## 相关技能

- [security-audit-codebase](../security-audit-codebase/SKILL.md) —— 第 5 步用于安全发现
- [review-codebase](../review-codebase/SKILL.md) —— 第 5 步用于代码质量审查
- [create-pull-request](../create-pull-request/SKILL.md) —— 第 9 步用于 PR 创建
- [create-github-issues](../create-github-issues/SKILL.md) —— 用于将未作为 PR 处理的发现作为 issue 提交
- [manage-git-branches](../manage-git-branches/SKILL.md) —— 实现期间的分支管理
- [commit-changes](../commit-changes/SKILL.md) —— 提交工作流
