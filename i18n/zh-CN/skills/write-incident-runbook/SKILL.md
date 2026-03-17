---
name: write-incident-runbook
description: >
  创建包含诊断步骤、解决流程、升级路径和通信模板的结构化事故运行手册，
  用于有效的事故响应。适用于为反复出现的告警记录响应流程、
  在值班轮换中标准化事故响应、通过清晰的诊断步骤缩短 MTTR、
  为新团队成员创建培训材料，或将告警注解直接链接到解决流程。
locale: zh-CN
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: observability
  complexity: basic
  language: multi
  tags: runbook, incident-response, diagnostics, escalation, documentation
---

# Write Incident Runbook

创建可操作的运行手册，引导响应人员完成事故诊断和解决。

## 适用场景

- 为反复出现的告警或事故记录响应流程
- 在值班轮换成员中标准化事故响应
- 通过清晰的诊断步骤缩短平均修复时间（MTTR）
- 为新团队成员创建事故处理培训材料
- 建立升级路径和通信协议
- 将部落知识迁移到书面文档
- 将告警链接到解决流程（告警注解）

## 输入

- **必填**：事故或告警名称/描述
- **必填**：历史事故数据和解决模式
- **可选**：诊断查询（Prometheus、日志、追踪）
- **可选**：升级联系人和通信渠道
- **可选**：以前的事故复盘

## 步骤

### 第 1 步：选择运行手册模板结构

> 完整模板文件请参阅 [Extended Examples](references/EXAMPLES.md#step-1-runbook-template-examples)。

根据事故类型和复杂程度选择合适的模板。

**基础运行手册模板结构**：
```markdown
# [Alert/Incident Name] Runbook
## Overview | Severity | Symptoms
## Diagnostic Steps | Resolution Steps
## Escalation | Communication | Prevention | Related
```

**高级 SRE 运行手册模板**（摘录）：
```markdown
# [Service Name] - [Incident Type] Runbook

## Metadata
- Service, Owner, Severity, On-Call, Last Updated

## Diagnostic Phase
### Quick Health Check (< 5 min): Dashboard, error rate, deployments
### Detailed Investigation (5-20 min): Metrics, logs, traces, failure patterns
# ... (see EXAMPLES.md for complete template)
```

关键模板组件：
- **元数据**：服务所有权、严重程度、值班轮换
- **诊断阶段**：快速检查 → 详细调查 → 故障模式
- **解决阶段**：立即缓解 → 根因修复 → 验证
- **升级**：标准和联系路径
- **通信**：内部/外部模板
- **预防**：短期/长期行动

**预期结果：** 所选模板与事故复杂程度匹配，章节适合服务类型。

**失败处理：**
- 从基础模板开始，根据事故模式迭代
- 查阅行业示例（Google SRE 书籍、供应商运行手册）
- 根据首次使用后的团队反馈调整模板

### 第 2 步：记录诊断流程

> 完整的诊断查询和决策树请参阅 [Extended Examples](references/EXAMPLES.md#step-2-complete-diagnostic-procedures)。

创建带有具体查询的逐步调查流程。

**六步诊断清单**：

1. **验证服务健康状态**：健康端点检查和正常运行时间指标
   ```bash
   curl -I https://api.example.com/health  # Expected: HTTP 200 OK
   ```
   ```promql
   up{job="api-service"}  # Expected: 1 for all instances
   ```

2. **检查错误率**：当前错误百分比及按端点分解
   ```promql
   sum(rate(http_requests_total{status=~"5.."}[5m]))
   / sum(rate(http_requests_total[5m])) * 100  # Expected: < 1%
   ```

3. **分析日志**：来自 Loki 的近期错误和主要错误消息
   ```logql
   {job="api-service"} |= "error" | json | level="error"
   ```

4. **检查资源利用率**：CPU、内存和连接池状态
   ```promql
   avg(rate(container_cpu_usage_seconds_total{pod=~"api-service.*"}[5m])) * 100
   # Expected: < 70%
   ```

5. **审查近期变更**：部署、git 提交、基础设施变更

6. **检查依赖项**：下游服务健康状态、数据库/API 延迟

**故障模式决策树**（摘录）：
- 服务下线？→ 检查所有 Pod/实例
- 错误率升高？→ 检查特定错误类型（5xx、网关、数据库、超时）
- 何时开始？→ 部署后（回滚）、逐渐增加（资源泄漏）、突然发生（流量/依赖）

**预期结果：** 诊断流程具体，包含预期值与实际值对比，引导响应人员完成调查。

**失败处理：**
- 在记录前在实际监控系统中测试查询
- 为视觉参考添加仪表板截图
- 为频繁遗漏的步骤添加"常见错误"部分
- 根据事故响应人员的反馈迭代

### 第 3 步：定义解决流程

> 完整命令和回滚流程的所有 5 个解决选项请参阅 [Extended Examples](references/EXAMPLES.md#step-3-complete-resolution-procedures)。

记录带有回滚选项的逐步修复流程。

**五种解决选项**（简要摘要）：

1. **回滚部署**（最快）：针对部署后的错误
   ```bash
   kubectl rollout undo deployment/api-service
   ```
   验证 → 监控 → 确认解决（错误率 < 1%、延迟正常、无告警）

2. **扩容资源**：针对高 CPU/内存、连接池耗尽
   ```bash
   kubectl scale deployment/api-service --replicas=$((current * 3/2))
   ```

3. **重启服务**：针对内存泄漏、连接卡死、缓存损坏
   ```bash
   kubectl rollout restart deployment/api-service
   ```

4. **功能标志/熔断器**：针对特定功能错误或外部依赖故障
   ```bash
   kubectl set env deployment/api-service FEATURE_NAME=false
   ```

5. **数据库修复**：针对数据库连接、慢查询、连接池耗尽
   ```sql
   -- Kill long-running queries, restart connection pool, increase pool size
   ```

**通用验证清单**：
- [ ] 错误率 < 1%
- [ ] 延迟 P99 < 阈值
- [ ] 吞吐量达到基准
- [ ] 资源使用健康（CPU < 70%，内存 < 80%）
- [ ] 依赖项健康
- [ ] 面向用户的测试通过
- [ ] 无活跃告警

**回滚流程**：如果解决措施使情况恶化 → 暂停/取消 → 还原 → 重新评估

**预期结果：** 解决步骤清晰，包含验证检查，为每个操作提供回滚选项。

**失败处理：**
- 为复杂流程添加更细粒度的步骤
- 为多步骤流程添加截图或图表
- 记录命令输出（预期值与实际值）
- 为复杂解决流程创建单独的运行手册

### 第 4 步：建立升级路径

> 完整升级级别和联系目录模板请参阅 [Extended Examples](references/EXAMPLES.md#step-4-complete-escalation-guidelines)。

定义何时以及如何升级事故。

**立即升级的情况**：
- 面向客户的中断超过 15 分钟
- SLO 错误预算消耗 > 10%
- 疑似数据丢失/损坏或安全漏洞
- 20 分钟内无法识别根因
- 缓解尝试失败或使情况恶化

**五个升级级别**：
1. **主要值班人员**（5 分钟响应）：部署修复、回滚、扩容（单独处理最多 30 分钟）
2. **次要值班人员**（15 分钟后自动）：额外的调查支持
3. **团队负责人**（架构决策）：数据库变更、供应商升级、超过 1 小时的事故
4. **事故指挥官**（跨团队协调）：多团队、客户沟通、超过 2 小时的事故
5. **高管**（C 级）：重大影响（>50% 用户）、SLA 违约、媒体/PR、超过 4 小时的中断

**升级流程**：
1. 通知目标并提供：当前状态、影响、已采取的行动、需要的帮助、仪表板链接
2. 如有需要交接：共享时间线、行动、访问权限、保持可用
3. 不要沉默：每 15 分钟更新一次，提问，提供反馈

**联系目录**：维护包含角色、Slack、电话、PagerDuty 的表格，涵盖：
- 平台/数据库/安全/网络团队
- 事故指挥官
- 外部供应商（AWS、数据库供应商、CDN 提供商）

**预期结果：** 升级标准清晰，联系信息易于获取，升级路径与组织结构一致。

**失败处理：**
- 验证联系信息是最新的（每季度测试）
- 为何时升级添加决策树
- 包含升级消息示例
- 记录每个级别的响应时间期望

### 第 5 步：创建通信模板

> 包含完整格式的所有内部和外部模板请参阅 [Extended Examples](references/EXAMPLES.md#step-5-complete-communication-templates)。

提供预先编写的事故更新消息。

**内部模板**（Slack #incident-response）：

1. **初始声明**：
   ```
   🚨 INCIDENT: [Title] | Severity: [Critical/High/Medium]
   Impact: [users/services] | Owner: @username | Dashboard: [link]
   Quick Summary: [1-2 sentences] | Next update: 15 min
   ```

2. **进展更新**（每 15-30 分钟）：
   ```
   📊 UPDATE #N | Status: [Investigating/Mitigating/Monitoring]
   Actions: [what we tried and outcomes]
   Theory: [what we think is happening]
   Next: [planned actions]
   ```

3. **缓解完成**：
   ```
   ✅ MITIGATION | Metrics: Error [before→after], Latency [before→after]
   Root Cause: [brief or "investigating"] | Monitoring 30min before resolved
   ```

4. **解决**：
   ```
   🎉 RESOLVED | Duration: [time] | Root Cause + Impact + Follow-up actions
   ```

5. **误报**：无影响，无需跟进

**外部模板**（状态页面）：
- **初始**：正在调查，开始时间，15 分钟后下次更新
- **进展**：已识别原因（面向客户的语言），正在实施修复，预计解决时间
- **解决**：解决时间、根因（简单语言）、持续时间、预防措施

**客户邮件模板**：时间线、影响描述、解决方案、预防措施、赔偿（如适用）

**预期结果：** 模板在事故期间节省时间，确保通信一致，减少响应人员的认知负担。

**失败处理：**
- 根据公司通信风格定制模板
- 用常见事故类型预填充模板
- 创建 Slack 工作流/机器人自动填充模板
- 在事故回顾期间审查模板

### 第 6 步：将运行手册链接到监控

> 完整的 Prometheus 告警配置和 Grafana 仪表板 JSON 请参阅 [Extended Examples](references/EXAMPLES.md#step-6-alert-integration-examples)。

将运行手册与告警和仪表板集成。

**向 Prometheus 告警添加运行手册链接**：
```yaml
- alert: HighErrorRate
  annotations:
    runbook_url: "https://wiki.example.com/runbooks/high-error-rate"
    dashboard_url: "https://grafana.example.com/d/service-overview"
    incident_channel: "#incident-platform"
```

**在运行手册中嵌入快速诊断链接**：
- 服务概览仪表板
- 过去 1 小时错误率（Prometheus 直接链接）
- 近期错误日志（Loki/Grafana Explore）
- 近期部署（GitHub/CI）
- PagerDuty 事故

**创建 Grafana 仪表板面板**，包含运行手册链接（markdown 面板，列出所有事故运行手册及值班和升级信息）

**预期结果：** 响应人员可直接从告警或仪表板访问运行手册，诊断查询预填充，一键访问相关工具。

**失败处理：**
- 验证运行手册 URL 无需 VPN/登录即可访问
- 为复杂的 Grafana/Prometheus 链接使用短链接
- 每季度测试链接确保不失效
- 为常用运行手册创建浏览器书签

## 验证清单

- [ ] 运行手册遵循一致的模板结构
- [ ] 诊断流程包含具体查询和预期值
- [ ] 解决步骤可操作，包含清晰的命令
- [ ] 升级标准和联系信息是最新的
- [ ] 为内部和外部受众提供通信模板
- [ ] 运行手册从监控告警和仪表板链接
- [ ] 运行手册在事故演练或实际事故中测试过
- [ ] 响应人员的反馈已纳入运行手册
- [ ] 修订历史以日期和作者追踪
- [ ] 运行手册无需身份验证即可访问（或离线缓存）

## 常见问题

- **过于笼统**：包含"检查日志"等模糊步骤但没有具体查询的运行手册不可操作。要具体。
- **信息过时**：引用旧系统或命令的运行手册变得无用。每季度审查。
- **没有验证步骤**：没有验证的解决方案会导致误报。始终包含"如何确认已修复"。
- **缺少回滚流程**：每个操作都应有回滚计划。不要让响应人员陷入更糟糕的状态。
- **假设知识**：只面向专家的运行手册排除了初级工程师。为轮换中经验最少的人编写。
- **没有所有者**：没有所有者的运行手册会变得陈旧。分配负责更新的团队/人员。
- **隐藏在认证后面**：在 VPN/SSO 问题期间无法访问的运行手册在危机期间无用。缓存副本或使用公共 wiki。

## 相关技能

- `configure-alerting-rules` - 将运行手册链接到告警注解以在事故期间立即访问
- `build-grafana-dashboards` - 在仪表板和诊断面板中嵌入运行手册链接
- `setup-prometheus-monitoring` - 在运行手册流程中包含来自 Prometheus 的诊断查询
- `define-slo-sli-sla` - 在事故严重程度分类中引用 SLO 影响
