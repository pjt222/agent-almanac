---
name: define-slo-sli-sla
description: >
  建立服务级别目标（SLO）、服务级别指标（SLI）和服务级别协议（SLA），
  通过错误预算追踪、燃烧率告警及使用 Prometheus 和 Sloth 或 Pyrra 等工具的自动化报告。
  适用于为面向客户的服务定义可靠性目标、通过错误预算平衡功能迭代速度与系统可靠性、
  将任意正常运行时间目标迁移到数据驱动的指标，或实施站点可靠性工程实践。
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
  complexity: intermediate
  language: multi
  tags: slo, sli, sla, error-budget, burn-rate
---

# Define SLO/SLI/SLA

建立可衡量的可靠性目标，用服务级别目标追踪并管理错误预算。

## 适用场景

- 为面向客户的服务或 API 定义可靠性目标
- 在服务提供商和消费者之间建立清晰的预期
- 通过错误预算平衡功能迭代速度与系统可靠性
- 为事故严重程度和响应创建客观标准
- 将任意正常运行时间目标迁移到数据驱动的可靠性指标
- 实施站点可靠性工程（SRE）实践
- 随时间推移衡量和改善服务质量

## 输入

- **必填**：服务描述和关键用户旅程
- **必填**：历史指标数据（请求速率、延迟、错误率）
- **可选**：现有的客户 SLA 承诺
- **可选**：服务可用性和性能的业务需求
- **可选**：事故历史和客户影响数据

## 步骤

> 完整配置文件和模板请参阅 [Extended Examples](references/EXAMPLES.md)。

### 第 1 步：理解 SLI、SLO 和 SLA 层次结构

了解这三个概念之间的关系和差异。

**定义**：

```markdown
SLI (Service Level Indicator)
- **What**: A quantitative measure of service behavior
- **Example**: Request success rate, request latency, system throughput
- **Measurement**: `successful_requests / total_requests * 100`

SLO (Service Level Objective)
- **What**: Target value or range for an SLI over a time window
- **Example**: 99.9% of requests succeed in 30-day window
- **Purpose**: Internal reliability target to guide operations

SLA (Service Level Agreement)
- **What**: Contractual commitment with consequences for missing SLO
- **Example**: 99.9% uptime SLA with refunds if breached
- **Purpose**: External promise to customers with penalties
```

**层次结构**：
```
SLA (99.9% uptime, customer refunds)
  ├─ SLO (99.95% success rate, internal target)
  │   └─ SLI (actual measured: 99.97% success rate)
  └─ Error Budget (0.05% failures allowed per month)
```

**关键原则**：SLO 应**严于** SLA，在客户受影响之前提供缓冲。

示例：
- **SLA**：99.9% 可用性（对客户的承诺）
- **SLO**：99.95% 可用性（内部目标）
- **缓冲**：0.05% 的余量，用于 SLA 违约前的缓冲

**预期结果：** 团队理解各概念差异，就哪些指标成为 SLI 达成共识，对 SLO 目标保持一致。

**失败处理：**
- 复习 Google SRE 书中关于 SLI/SLO/SLA 的章节
- 与利益相关方举办研讨会对齐定义
- 在复杂延迟 SLO 之前，从简单的成功率 SLI 开始

### 第 2 步：选择合适的 SLI

选择反映用户体验和业务影响的 SLI。

**四个黄金信号**（Google SRE）：

1. **延迟**：处理请求的时间
   ```promql
   # P95 latency
   histogram_quantile(0.95,
     sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
   )
   ```

2. **流量**：系统需求
   ```promql
   # Requests per second
   sum(rate(http_requests_total[5m]))
   ```

3. **错误**：失败请求的速率
   ```promql
   # Error rate percentage
   sum(rate(http_requests_total{status=~"5.."}[5m]))
   / sum(rate(http_requests_total[5m])) * 100
   ```

4. **饱和度**：系统的"饱满"程度
   ```promql
   # CPU saturation
   avg(rate(node_cpu_seconds_total{mode!="idle"}[5m]))
   ```

**常见 SLI 模式**：

```yaml
# Availability SLI
availability:
  description: "Percentage of successful requests"
  query: |
    sum(rate(http_requests_total{status!~"5.."}[5m]))
    / sum(rate(http_requests_total[5m]))
  good_threshold: 0.999  # 99.9%

# Latency SLI
latency:
  description: "P99 request latency under 500ms"
  query: |
    histogram_quantile(0.99,
      sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
    ) < 0.5
  good_threshold: 0.95  # 95% of windows meet target

# Throughput SLI
throughput:
  description: "Requests processed per second"
  query: |
    sum(rate(http_requests_total[5m]))
  good_threshold: 1000  # Minimum 1000 req/s

# Data freshness SLI (for batch jobs)
freshness:
  description: "Data updated within last hour"
  query: |
    (time() - max(data_last_updated_timestamp)) < 3600
  good_threshold: 1  # Always fresh
```

**SLI 选择标准**：
- **用户可见**：反映实际用户体验
- **可测量**：可从现有指标量化
- **可行动**：团队可通过工程工作改善
- **有意义**：与客户满意度相关
- **简单**：易于理解和解释

避免：
- 用户不可见的内部系统指标（CPU、内存）
- 不能预测客户影响的虚荣指标
- 过于复杂的复合评分

**预期结果：** 每个服务选择 2-4 个 SLI，至少覆盖可用性和延迟，团队对测量查询达成共识。

**失败处理：**
- 绘制用户旅程图，识别关键故障点
- 分析事故历史：哪些指标预测了客户影响？
- 用 A/B 测试验证 SLI：降级指标，衡量客户投诉
- 从简单的可用性 SLI 开始，逐步增加复杂性

### 第 3 步：设置 SLO 目标和时间窗口

定义现实可行的可靠性目标。

**SLO 规格格式**：

```yaml
service: user-api
slos:
  - name: availability
    objective: 99.9
    description: |
      99.9% of requests return non-5xx status codes
# ... (see EXAMPLES.md for complete configuration)
```

**时间窗口选择**：

常见窗口：
- **30 天**（月度）：外部 SLA 的典型选择
- **7 天**（周度）：工程团队更快的反馈
- **1 天**（日度）：需要快速响应的高频服务

30 天窗口错误预算示例：
```
SLO: 99.9% availability over 30 days
Allowed failures: 0.1%
Total requests per month: 100M
Error budget: 100,000 failed requests
Daily budget: ~3,333 failed requests
```

**设置现实目标**：

1. **建立当前性能基准**：
   ```promql
   # Check actual availability over past 90 days
   avg_over_time(
     (sum(rate(http_requests_total{status!~"5.."}[5m]))
     / sum(rate(http_requests_total[5m])))[90d:5m]
   )
   # Result: 99.95% → Set SLO at 99.9% (safer than current)
   ```

2. **计算每个 9 的代价**：
   ```
   99%    → 7.2 hours downtime/month (low reliability)
   99.9%  → 43 minutes downtime/month (good)
   99.95% → 22 minutes downtime/month (very good)
   99.99% → 4.3 minutes downtime/month (expensive)
   99.999% → 26 seconds downtime/month (very expensive)
   ```

3. **平衡用户满意度与工程成本**：
   - 过严：成本高，拖慢功能开发
   - 过宽：用户体验差，客户流失
   - **最佳平衡点**：略优于用户期望

**预期结果：** 在业务利益相关方认可下设定 SLO 目标，记录理由，计算错误预算。

**失败处理：**
- 从可实现的目标开始（例如当前为 98.5% 时设 99%）
- 根据实际性能每季度迭代 SLO 目标
- 在"五个九"需求面前，寻求高管支持以设定现实目标
- 记录每增加一个九的成本收益分析

### 第 4 步：使用 Sloth 实现 SLO 监控

使用 Sloth 从 SLO 规格生成 Prometheus 记录规则和告警。

**安装 Sloth**：

```bash
# Binary installation
wget https://github.com/slok/sloth/releases/download/v0.11.0/sloth-linux-amd64
chmod +x sloth-linux-amd64
sudo mv sloth-linux-amd64 /usr/local/bin/sloth

# Or Docker
docker pull ghcr.io/slok/sloth:latest
```

**创建 Sloth SLO 规格**（`slos/user-api.yml`）：

```yaml
version: "prometheus/v1"
service: "user-api"
labels:
  team: "platform"
  tier: "1"
slos:
# ... (see EXAMPLES.md for complete configuration)
```

**生成 Prometheus 规则**：

```bash
# Generate recording and alerting rules
sloth generate -i slos/user-api.yml -o prometheus/rules/user-api-slo.yml

# Validate generated rules
promtool check rules prometheus/rules/user-api-slo.yml
```

**生成的记录规则**（摘录）：

```yaml
groups:
  - name: sloth-slo-sli-recordings-user-api-requests-availability
    interval: 30s
    rules:
      # SLI: Ratio of good events
      - record: slo:sli_error:ratio_rate5m
# ... (see EXAMPLES.md for complete configuration)
```

**生成的告警**：

```yaml
groups:
  - name: sloth-slo-alerts-user-api-requests-availability
    rules:
      # Fast burn: 2% budget consumed in 1 hour
      - alert: UserAPIHighErrorRate
        expr: |
# ... (see EXAMPLES.md for complete configuration)
```

**将规则加载到 Prometheus**：

```yaml
# prometheus.yml
rule_files:
  - "rules/user-api-slo.yml"
```

重新加载 Prometheus：
```bash
curl -X POST http://localhost:9090/-/reload
```

**预期结果：** Sloth 生成多窗口多燃烧率告警，记录规则成功评估，告警在事故期间适当触发。

**失败处理：**
- 用 `yamllint slos/user-api.yml` 验证 YAML 语法
- 检查 Sloth 版本兼容性（推荐 v0.11+）
- 验证 Prometheus 记录规则评估：`curl http://localhost:9090/api/v1/rules`
- 注入合成错误测试告警触发
- 检查 Sloth 文档中的 SLI 事件查询格式

### 第 5 步：构建错误预算仪表板

在 Grafana 中可视化 SLO 合规性和错误预算消耗。

**Grafana 仪表板 JSON**（摘录）：

```json
{
  "dashboard": {
    "title": "SLO Dashboard - User API",
    "panels": [
      {
        "type": "stat",
# ... (see EXAMPLES.md for complete configuration)
```

**需可视化的关键指标**：
- SLO 目标 vs 当前 SLI
- 剩余错误预算（百分比和绝对值）
- 燃烧率（预算消耗速度）
- 历史 SLI 趋势（30 天滚动窗口）
- 耗尽时间（如果当前燃烧率持续）

**错误预算策略仪表板**（markdown 面板）：

```markdown
## Error Budget Policy

**Current Status**: 78% budget remaining

### If Error Budget > 50%
- ✅ Full speed ahead on new features
# ... (see EXAMPLES.md for complete configuration)
```

**预期结果：** 仪表板显示实时 SLO 合规性，错误预算消耗可见，团队可对功能迭代速度做出明智决策。

**失败处理：**
- 验证记录规则存在：`curl http://localhost:9090/api/v1/rules | jq '.data.groups[].rules[] | select(.name | contains("slo:"))'`
- 检查 Grafana 中的 Prometheus 数据源 URL 正确
- 在添加到仪表板之前，在 Explore 视图中验证查询结果
- 确保时间范围设置为适当的窗口（例如月度 SLO 使用 30d）

### 第 6 步：建立错误预算策略

定义管理错误预算的组织流程。

**错误预算策略模板**：

```yaml
service: user-api
slo:
  availability: 99.9%
  latency_p99: 200ms
  window: 30 days

# ... (see EXAMPLES.md for complete configuration)
```

**自动化策略执行**：

```python
# Example: Deployment gate script
import requests
import sys

def check_error_budget(service):
    # Query Prometheus for error budget
# ... (see EXAMPLES.md for complete configuration)
```

集成到 CI/CD 管道：

```yaml
# .github/workflows/deploy.yml
jobs:
  check-error-budget:
    runs-on: ubuntu-latest
    steps:
      - name: Check SLO Error Budget
        run: |
          python scripts/check_error_budget.py user-api
      - name: Deploy
        if: success()
        run: |
          kubectl apply -f deploy/
```

**预期结果：** 策略文档清晰，自动化门控防止在预算耗尽时进行高风险部署，团队在可靠性优先级上保持一致。

**失败处理：**
- 从手动策略执行开始（Slack 提醒）
- 逐步用软门控自动化（警告，非阻断）
- 在硬门控（阻断部署）之前获得高管认可
- 每季度检查策略有效性，根据需要调整阈值

## 验证清单

- [ ] 选择的 SLI 反映用户体验和业务影响
- [ ] SLO 目标已获利益相关方认可并记录理由
- [ ] Prometheus 记录规则成功生成 SLI 指标
- [ ] 多燃烧率告警已配置并用合成错误测试
- [ ] Grafana 仪表板显示实时 SLO 合规性和错误预算
- [ ] 错误预算策略已记录并向团队传达
- [ ] 自动化门控防止在预算耗尽时进行高风险部署
- [ ] 已安排每周/每月 SLO 审查会议
- [ ] 事故复盘包含 SLO 影响分析
- [ ] SLO 合规报告与利益相关方共享

## 常见问题

- **SLO 过严**：不进行成本分析就设定"五个九"会导致精疲力竭和功能迭代减慢。从可实现的目标开始，逐步提升。
- **SLI 过多**：追踪 10+ 个指标会造成混乱。专注于 2-4 个关键的面向用户指标。
- **SLO 与 SLA 没有缓冲**：SLO 等于 SLA 在客户受影响前没有犯错余地。保留 0.05-0.1% 缓冲。
- **忽视错误预算**：追踪 SLO 但不对预算耗尽采取行动使其失去意义。执行错误预算策略。
- **将内部指标作为 SLI**：使用内部指标（CPU、内存）而非用户可见指标（延迟、错误）会导致优先级错位。
- **缺乏利益相关方认可**：没有产品/业务共识的纯工程 SLO 会导致冲突。寻求高管支持。
- **静态 SLO**：随着系统演进从不审查或调整目标。根据实际性能和用户反馈每季度重新审视。

## 相关技能

- `setup-prometheus-monitoring` - 配置 Prometheus 收集用于 SLI 计算的指标
- `configure-alerting-rules` - 将 SLO 燃烧率告警与 Alertmanager 集成用于值班通知
- `build-grafana-dashboards` - 可视化 SLO 合规性和错误预算消耗
- `write-incident-runbook` - 在运行手册中包含 SLO 影响以优先级事故响应
