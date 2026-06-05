---
name: r-package-review
description: 多智能体团队，对 R 包进行涵盖代码质量、架构和安全性的全面质量审查
lead: r-developer
version: "1.0.0"
author: Philipp Thoss
created: 2026-02-16
updated: 2026-02-16
tags: [R, code-review, quality, package-development]
coordination: hub-and-spoke
members:
  - id: r-developer
    role: Lead
    responsibilities: 分配审查任务，检查 R 特定约定（roxygen2、NAMESPACE、testthat），综合最终审查报告
  - id: code-reviewer
    role: Quality Reviewer
    responsibilities: 审查代码风格、测试覆盖率、拉取请求质量和通用最佳实践
  - id: senior-software-developer
    role: Architecture Reviewer
    responsibilities: 评估包结构、API 设计、依赖管理、SOLID 原则和技术债务
  - id: security-analyst
    role: Security Reviewer
    responsibilities: 审计暴露的密钥、输入验证、安全文件操作和依赖漏洞
locale: zh-CN
source_locale: en
source_commit: 6a868d56
translator: Claude Opus 4.6
translation_date: "2026-03-13"
---

# R 包审查团队

一个由四个智能体组成的团队，对 R 包执行全面的质量审查。负责人（r-developer）协调代码质量、架构和安全方面的并行审查，然后将发现综合为统一报告。

## 目的

R 包开发受益于单个智能体无法同时提供的多维审查视角。该团队将包审查分解为四个互补的专业方向：

- **R 约定**：roxygen2 文档、NAMESPACE 导出、testthat 模式、CRAN 合规性
- **代码质量**：风格一致性、测试覆盖率、错误处理、拉取请求规范
- **架构**：包结构、API 接口、依赖图、SOLID 原则遵循
- **安全**：密钥暴露、输入清理、安全 eval 模式、依赖 CVE

通过并行运行这些审查并综合结果，团队比单智能体顺序审查更快地交付全面反馈。

## 团队组成

| 成员 | 智能体 | 角色 | 关注领域 |
|------|--------|------|----------|
| 负责人 | `r-developer` | 负责人 | R 约定、CRAN 合规性、最终综合 |
| 质量 | `code-reviewer` | 质量审查员 | 风格、测试、错误处理、PR 质量 |
| 架构 | `senior-software-developer` | 架构审查员 | 结构、API 设计、依赖、技术债务 |
| 安全 | `security-analyst` | 安全审查员 | 密钥、输入验证、CVE、安全模式 |

## 协调模式

中心辐射型：r-developer 负责人分配审查任务，每个审查员独立工作，负责人收集并综合所有发现。

```
            r-developer（负责人）
           /       |        \
          /        |         \
   code-reviewer   |    security-analyst
                   |
     senior-software-developer
```

**流程：**

1. 负责人分析包结构并创建审查任务
2. 三名审查员在各自专业领域并行工作
3. 负责人收集所有发现并生成统一报告
4. 负责人标记冲突或重叠的发现

## 任务分解

### 阶段 1：准备（负责人）
r-developer 负责人检查包并创建针对性任务：

- 识别关键文件：`DESCRIPTION`、`NAMESPACE`、`R/`、`tests/`、`man/`、`vignettes/`
- 创建范围匹配每个审查员专业的审查任务
- 记录任何包特定的关注点（如 Rcpp 集成、Shiny 组件）

### 阶段 2：并行审查

**code-reviewer** 任务：
- 按照 tidyverse 风格指南审查代码风格
- 检查测试覆盖率和 testthat 模式
- 评估错误消息和 `stop()`/`warning()` 使用
- 审查 `.Rbuildignore` 和开发文件管理

**senior-software-developer** 任务：
- 评估包的 API 接口（`@export` 决策）
- 检查依赖权重（`Imports` vs `Suggests`）
- 评估内部代码组织和耦合度
- 审查不必要的复杂性或过早抽象

**security-analyst** 任务：
- 扫描代码和数据中暴露的密钥
- 检查 `system()`、`eval()` 和 `source()` 的使用
- 审查文件 I/O 是否存在路径遍历风险
- 检查依赖是否有已知漏洞

### 阶段 3：综合（负责人）
r-developer 负责人：
- 收集所有审查员的发现
- 检查 R 特定约定（roxygen2、NAMESPACE、CRAN 注意事项）
- 解决矛盾的建议
- 生成按优先级排序的报告：严重 > 高危 > 中等 > 低风险

## 配置

供工具自动创建此团队的机器可读配置块。

<!-- CONFIG:START -->
```yaml
team:
  name: r-package-review
  lead: r-developer
  coordination: hub-and-spoke
  members:
    - agent: r-developer
      role: Lead
      subagent_type: r-developer
    - agent: code-reviewer
      role: Quality Reviewer
      subagent_type: code-reviewer
    - agent: senior-software-developer
      role: Architecture Reviewer
      subagent_type: senior-software-developer
    - agent: security-analyst
      role: Security Reviewer
      subagent_type: security-analyst
  tasks:
    - name: review-code-quality
      assignee: code-reviewer
      description: Review code style, test coverage, error handling, and PR hygiene
    - name: review-architecture
      assignee: senior-software-developer
      description: Evaluate package structure, API design, dependencies, and tech debt
    - name: review-security
      assignee: security-analyst
      description: Audit for secrets, input validation, safe patterns, and dependency CVEs
    - name: review-r-conventions
      assignee: r-developer
      description: Check roxygen2 docs, NAMESPACE, testthat patterns, CRAN compliance
    - name: synthesize-report
      assignee: r-developer
      description: Collect all findings and produce unified prioritized report
      blocked_by: [review-code-quality, review-architecture, review-security, review-r-conventions]
```
<!-- CONFIG:END -->

## 使用场景

### 场景 1：CRAN 提交前审查
在提交到 CRAN 之前，运行全团队审查以全方位捕获问题：

```
用户：在 CRAN 提交前审查我位于 /path/to/mypackage 的 R 包
```

团队将检查 CRAN 特定要求（示例、\dontrun、URL 有效性）以及通用的质量、架构和安全问题。

### 场景 2：拉取请求审查
针对涉及多个包组件的重大 PR：

```
用户：审查我 R 包上的 PR #42 —— 它添加了新的 API 端点和 Rcpp 集成
```

团队将审查分配到变更涉及的各个区域，架构审查员关注 API 设计，安全审查员检查 Rcpp 绑定。

### 场景 3：包审计
对继承的或不熟悉的包进行全面评估：

```
用户：审计我继承的这个 R 包 —— 我需要了解它的质量和风险
```

团队提供涵盖代码健康度、架构决策和安全态势的全面评估。

## 局限性

- 最适合 R 包；非通用代码审查设计
- 需要四种智能体类型全部可用作子智能体
- 综合报告反映自动化分析；领域特定逻辑仍需人工判断
- 不直接运行 `R CMD check` 或测试 —— 侧重静态审查
- 大型包（>100 个 R 文件）可能更适合范围限定的审查而非全包审查

## 另请参阅

- [r-developer](../agents/r-developer.md) — 具有 R 包专业知识的负责人智能体
- [code-reviewer](../agents/code-reviewer.md) — 质量审查智能体
- [senior-software-developer](../agents/senior-software-developer.md) — 架构审查智能体
- [security-analyst](../agents/security-analyst.md) — 安全审计智能体
- [submit-to-cran](../skills/submit-to-cran/SKILL.md) — CRAN 提交技能
- [review-software-architecture](../skills/review-software-architecture/SKILL.md) — 架构审查技能

---

**作者**：Philipp Thoss
**版本**：1.0.0
**最后更新**：2026-02-16
