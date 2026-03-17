---
name: conduct-gxp-audit
description: >
  对计算机化系统和流程执行 GxP 审计。涵盖审计计划、首次会议、证据收集、
  发现分类（关键/重大/轻微）、CAPA 生成、末次会议、报告编写和后续验证。
  适用于定期内部审计、供应商资质审计、监管检查前的就绪评估、由偏差或数据
  完整性问题触发的原因审计，或已验证系统的定期合规状态评审。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: compliance
  complexity: advanced
  language: multi
  tags: gxp, audit, capa, inspection, compliance, quality-assurance
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# 执行 GxP 审计

计划并执行计算机化系统、数据完整性实践或受监管流程的 GxP 审计。

## 适用场景

- 已验证计算机化系统的定期内部审计
- GxP 相关软件的供应商/承包商资质审计
- 监管审计前的检查就绪评估
- 由偏差、投诉或数据完整性问题触发的原因审计
- 已验证系统合规状态的定期评审

## 输入

- **必需**：审计范围（待审计的系统、流程或场所）
- **必需**：适用法规（21 CFR Part 11、EU Annex 11、GMP、GLP、GCP）
- **必需**：以往审计报告和未关闭的 CAPA 项
- **可选**：系统验证文件（URS、VP、IQ/OQ/PQ、追溯矩阵）
- **可选**：SOP、培训记录、变更控制日志
- **可选**：触发审计的特定风险领域或问题

## 步骤

### 第 1 步：制定审计计划

```markdown
# Audit Plan
## Document ID: AP-[SYS]-[YYYY]-[NNN]

### 1. Objective
[State the purpose: scheduled, for-cause, supplier qualification, pre-inspection]

### 2. Scope
- **System/Process**: [Name and version]
- **Regulations**: [21 CFR Part 11, EU Annex 11, ICH Q7, etc.]
- **Period**: [Date range of records under review]
- **Exclusions**: [Any areas explicitly out of scope]

### 3. Audit Criteria
| Area | Regulatory Reference | Key Requirements |
|------|---------------------|------------------|
| Electronic records | 21 CFR 11.10 | Controls for closed systems |
| Audit trail | 21 CFR 11.10(e) | Secure, computer-generated, time-stamped |
| Electronic signatures | 21 CFR 11.50 | Manifestation, legally binding |
| Access controls | EU Annex 11, §12 | Role-based, documented |
| Data integrity | MHRA guidance | ALCOA+ principles |
| Change control | ICH Q10 | Documented, assessed, approved |

### 4. Schedule
| Date | Time | Activity | Participants |
|------|------|----------|-------------|
| Day 1 AM | 09:00 | Opening meeting | All |
| Day 1 AM | 10:00 | Document review | Auditor + QA |
| Day 1 PM | 13:00 | System walkthrough | Auditor + IT + System Owner |
| Day 2 AM | 09:00 | Interviews + evidence collection | Auditor + Users |
| Day 2 PM | 14:00 | Finding consolidation | Auditor |
| Day 2 PM | 16:00 | Closing meeting | All |

### 5. Audit Team
| Role | Name | Responsibility |
|------|------|---------------|
| Lead Auditor | [Name] | Plan, execute, report |
| Subject Matter Expert | [Name] | Technical assessment |
| Auditee Representative | [Name] | Facilitate access and information |
```

**预期结果：** 审计计划经质量管理部门批准，并在审计前至少 2 周通知被审计方。
**失败处理：** 如果被审计方无法提供所需文件或人员，则重新安排。

### 第 2 步：召开首次会议

议程：
1. 介绍审计团队及角色
2. 确认范围、日程和后勤安排
3. 解释发现分类体系（关键/重大/轻微）
4. 确认保密协议
5. 确定被审计方陪同人员和文件保管人
6. 解答问题

**预期结果：** 首次会议有文档记录和出席记录。
**失败处理：** 如果关键人员无法到场，重新安排受影响的审计活动。

### 第 3 步：收集和审查证据

根据审计标准审查文件和记录：

#### 3a. 验证文件审查
- [ ] URS 存在且已批准
- [ ] 验证计划与系统类别和风险相匹配
- [ ] IQ/OQ/PQ 方案已执行并有结果记录
- [ ] 追溯矩阵将需求链接到测试结果
- [ ] 偏差已记录并解决
- [ ] 验证总结报告已批准

#### 3b. 运营控制审查
- [ ] SOP 为最新且已批准
- [ ] 培训记录证明所有用户具备能力
- [ ] 变更控制记录完整（申请、评估、批准、验证）
- [ ] 事件/偏差报告按 SOP 处理
- [ ] 定期审查按计划执行

#### 3c. 数据完整性评估
- [ ] 审计追踪已启用且用户不可修改
- [ ] 电子签名符合监管要求
- [ ] 备份和恢复程序已记录并经过测试
- [ ] 访问控制执行基于角色的权限
- [ ] 数据具有可归属性、可辨识性、同步性、原始性、准确性（ALCOA+）

#### 3d. 系统配置审查
- [ ] 生产配置与已验证状态一致
- [ ] 用户账户已审查——无共享账户，非活跃账户已禁用
- [ ] 系统时钟已同步且准确
- [ ] 安全补丁按批准的变更控制应用

**预期结果：** 证据以截图、文件副本、带时间戳的访谈记录形式收集。
**失败处理：** 将"无法验证"记录为观察结果并注明原因。

### 第 4 步：分类发现

按严重程度分类每项发现：

| 分类 | 定义 | 要求的响应 |
|------|------|-----------|
| **关键** | 直接影响产品质量、患者安全或数据完整性。关键控制的系统性失败。 | 立即遏制 + 15 个工作日内提交 CAPA |
| **重大** | 严重偏离 GxP 要求。如不纠正可能影响数据完整性。 | 30 个工作日内提交 CAPA |
| **轻微** | 程序的个别偏差。对数据完整性或产品质量无直接影响。 | 60 个工作日内纠正 |
| **观察** | 改进机会。非监管要求。 | 可选——用于趋势分析跟踪 |

记录每项发现：

```markdown
## Finding F-[NNN]
**Classification:** [Critical / Major / Minor / Observation]
**Area:** [Audit trail / Access control / Change control / etc.]
**Reference:** [Regulatory clause, e.g., 21 CFR 11.10(e)]

**Observation:**
[Objective description of what was found]

**Evidence:**
[Document ID, screenshot reference, interview notes]

**Regulatory Expectation:**
[What the regulation requires]

**Risk:**
[Impact on data integrity, product quality, or patient safety]
```

**预期结果：** 每项发现都有分类、证据和法规参考。
**失败处理：** 如果分类有争议，上报给审计项目经理进行裁决。

### 第 5 步：召开末次会议

议程：
1. 呈现发现摘要（不应提出新发现）
2. 审查发现分类
3. 讨论初步的 CAPA 期望和时间表
4. 确认后续步骤和报告时间表
5. 感谢被审计方的配合

**预期结果：** 末次会议有文档记录和出席名单。被审计方确认发现（确认不等于同意）。
**失败处理：** 如果被审计方对发现有异议，记录分歧并按 SOP 上报。

### 第 6 步：编写审计报告

```markdown
# Audit Report
## Document ID: AR-[SYS]-[YYYY]-[NNN]

### 1. Executive Summary
An audit of [System/Process] was conducted on [dates] against [regulations].
[N] findings were identified: [n] critical, [n] major, [n] minor, [n] observations.

### 2. Scope and Methodology
[Summarize audit plan scope, criteria, and methods used]

### 3. Findings Summary
| Finding ID | Classification | Area | Brief Description |
|-----------|---------------|------|-------------------|
| F-001 | Major | Audit trail | Audit trail disabled for batch record module |
| F-002 | Minor | Training | Two users missing annual GxP training |
| F-003 | Observation | Documentation | SOP formatting inconsistencies |

### 4. Detailed Findings
[Include full finding details from Step 4 for each finding]

### 5. Positive Observations
[Document areas of good practice observed during the audit]

### 6. Conclusion
The overall compliance status is assessed as [Satisfactory / Needs Improvement / Unsatisfactory].

### 7. Distribution
| Recipient | Role |
|-----------|------|
| [Name] | System Owner |
| [Name] | QA Director |
| [Name] | IT Manager |

### Approval
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Lead Auditor | | | |
| QA Director | | | |
```

**预期结果：** 报告在末次会议后 15 个工作日内发布。
**失败处理：** 如果延迟超过 15 天，通知利益相关者并记录原因。

### 第 7 步：跟踪 CAPA 并验证有效性

对每项需要 CAPA 的发现：

```markdown
## CAPA Tracking
| Finding ID | CAPA ID | Root Cause | Corrective Action | Due Date | Status | Effectiveness Check |
|-----------|---------|------------|-------------------|----------|--------|-------------------|
| F-001 | CAPA-2025-042 | Configuration oversight during upgrade | Enable audit trail, verify all modules | 2025-04-15 | Open | Scheduled 2025-07-15 |
| F-002 | CAPA-2025-043 | Training matrix not updated | Complete training, update tracking | 2025-05-01 | Open | Scheduled 2025-08-01 |
```

**预期结果：** CAPA 已分配、跟踪，并在规定时间内验证有效性。
**失败处理：** 未解决的 CAPA 上报至 QA 管理层，并在下一个审计周期中标记。

## 验证清单

- [ ] 审计计划在审计前已批准并传达
- [ ] 首次会议和末次会议有文档记录和出席名单
- [ ] 证据附有时间戳和来源参考
- [ ] 每项发现都有分类、证据和法规参考
- [ ] 审计报告在 15 个工作日内发布
- [ ] 所有关键和重大发现都已分配有截止日期的 CAPA
- [ ] 以往审计的 CAPA 已验证关闭有效性

## 常见问题

- **范围蔓延**：在执行过程中未经正式同意扩大审计范围，导致覆盖不完整和争议
- **基于意见的发现**：发现必须引用具体的法规要求，而非个人偏好
- **对抗性语气**：审计是协作性的质量改进活动，而非审讯
- **忽视正面观察**：仅报告发现而不承认良好实践会损害信任
- **缺少有效性检查**：在未验证修复是否确实有效的情况下关闭 CAPA 是反复出现的监管引用

## 相关技能

- `perform-csv-assessment` — 完整的 CSV 生命周期评估（从 URS 到验证总结）
- `setup-gxp-r-project` — 已验证 R 环境的项目结构
- `implement-audit-trail` — 电子记录的审计追踪实现
- `write-validation-documentation` — IQ/OQ/PQ 方案和报告编写
- `security-audit-codebase` — 安全导向的代码审计（互补视角）
