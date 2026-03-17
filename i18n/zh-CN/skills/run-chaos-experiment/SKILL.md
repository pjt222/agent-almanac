---
name: run-chaos-experiment
description: >
  使用 Litmus 或 Chaos Mesh 设计并执行混沌工程实验。通过受控故障注入测试系统韧性、
  验证假设驱动的测试、改善故障恢复能力。适用于重大产品发布前、架构变更后验证韧性、
  GameDay 或灾难恢复演练期间、验证对故障模式的假设，或作为 SRE 成熟度计划的一部分。
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
  complexity: advanced
  language: multi
  tags: chaos-engineering, litmus, chaos-mesh, resilience, fault-injection
---

# Run Chaos Experiment

注入受控故障，测试并改善系统韧性。

## 适用场景

- 重大产品发布前（负载测试）
- 架构变更后（验证韧性）
- GameDay 或灾难恢复演练期间
- 验证对故障模式的假设
- 作为 SRE 成熟度计划的一部分

## 输入

- **必填**：Kubernetes 集群（用于 Litmus 或 Chaos Mesh）
- **必填**：稳态定义（"正常"状态的样子）
- **必填**：待测试的假设（例如，"如果一个 Pod 崩溃，API 保持可用"）
- **可选**：可观测性栈（Prometheus、Grafana）用于测量影响
- **可选**：回滚计划

## 步骤

### 第 1 步：定义稳态和假设

记录正常系统行为：

```markdown
## Steady State Definition

### Service: API Gateway
- **Availability**: 99.9% (< 0.1% error rate)
- **Latency**: p95 < 200ms
- **Throughput**: 1000 req/s
- **Dependencies**: Database (Postgres), Cache (Redis), Auth Service

### Metrics
- `rate(http_requests_total{job="api"}[5m])`
- `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))`
- `rate(http_requests_total{status=~"5.."}[5m])`

## Hypothesis
**"If one API pod is killed, the remaining pods will handle the load with <5s
disruption and no increase in error rate."**

### Validation Criteria
- Error rate remains <1%
- p95 latency stays <300ms (50ms grace)
- Service recovers within 5 seconds
- No cascading failures to downstream services
```

**预期结果：** 清晰、可测量的正常行为定义和成功标准。

**失败处理：** 如果无法定义稳态，说明可观测性不足。先添加指标。

### 第 2 步：设置爆炸半径限制

将实验范围限定在最小风险范围内：

```yaml
# chaos-config.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: chaos-testing

---
# Label pods participating in chaos experiments
apiVersion: v1
kind: Pod
metadata:
  labels:
    chaos-enabled: "true"
    environment: staging  # NEVER production for first run
```

设置安全措施：

```markdown
## Blast Radius Controls

### Environment
- **Scope**: Staging only (first 5 runs)
- **Production**: Only after 5 successful staging runs
- **Timing**: Business hours (09:00-17:00 local), never weekends/holidays

### Target Selection
- **Limit**: Max 1 pod per service
- **Percentage**: Max 25% of replicas
- **Exclusions**: Database, payment service, auth service (critical path)

### Auto-Abort Conditions
- Error rate >10% for >30 seconds
- Customer-facing alerts fire
- Manual abort signal from on-call engineer

### Rollback Plan
- Kubernetes will auto-restart killed pods
- Manual rollback: `kubectl rollout undo deployment/api`
- Incident declared if recovery takes >5 minutes
```

**预期结果：** 实验有明确边界，不会使整个系统宕机。

**失败处理：** 如果爆炸半径过大，缩小范围。从一个非关键服务开始。

### 第 3 步：安装 Chaos Mesh

部署 Chaos Mesh（Kubernetes 原生）：

```bash
# Add Chaos Mesh Helm repo
helm repo add chaos-mesh https://charts.chaos-mesh.org
helm repo update

# Install Chaos Mesh in isolated namespace
helm install chaos-mesh chaos-mesh/chaos-mesh \
  --namespace chaos-mesh \
  --create-namespace \
  --set dashboard.create=true \
  --set controllerManager.replicaCount=1

# Verify installation
kubectl get pods -n chaos-mesh

# Access dashboard
kubectl port-forward -n chaos-mesh svc/chaos-dashboard 2333:2333
# Open http://localhost:2333
```

替代方案：Litmus（供应商中立）：

```bash
# Install Litmus
kubectl apply -f https://litmuschaos.github.io/litmus/litmus-operator-v2.14.0.yaml

# Wait for Litmus pods
kubectl get pods -n litmus

# Install Litmus CRDs
kubectl apply -f https://hub.litmuschaos.io/api/chaos/master?file=charts/generic/experiments.yaml
```

**预期结果：** Chaos Mesh 或 Litmus 运行，仪表板可访问。

**失败处理：** 检查 RBAC 权限。混沌工具需要集群范围的访问权限。

### 第 4 步：创建并执行实验

示例：Pod Kill 实验（Chaos Mesh）：

```yaml
# pod-kill-experiment.yaml
apiVersion: chaos-mesh.org/v1alpha1
kind: PodChaos
metadata:
  name: api-pod-kill-test
  namespace: chaos-testing
spec:
  action: pod-kill
  mode: one  # Kill one pod only
  selector:
    namespaces:
      - production
    labelSelectors:
      app: api-gateway
      chaos-enabled: "true"
  duration: "30s"
  scheduler:
    cron: "@every 5m"  # Repeat every 5 minutes (for sustained testing)
```

应用实验：

```bash
# Apply experiment
kubectl apply -f pod-kill-experiment.yaml

# Watch experiment status
kubectl get podchaos -n chaos-testing -w

# View detailed status
kubectl describe podchaos api-pod-kill-test -n chaos-testing

# Check which pods were affected
kubectl get events -n production --sort-by=.metadata.creationTimestamp | grep api-gateway
```

在 Grafana 中监控影响：

```promql
# Error rate during experiment
rate(http_requests_total{status=~"5..", job="api"}[1m])

# Latency spike
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job="api"}[1m]))

# Pod restarts
rate(kube_pod_container_status_restarts_total{pod=~"api-.*"}[5m])
```

**预期结果：** Pod 被杀死，Kubernetes 重启它，服务以轻微抖动继续运行。

**失败处理：** 如果错误率激增或服务显著降级，中止实验并调查。

### 第 5 步：分析结果并迭代

创建实验报告：

```markdown
# Chaos Experiment Report: API Pod Kill

**Date**: 2025-02-09
**Hypothesis**: API stays available if one pod crashes
**Tool**: Chaos Mesh
**Environment**: Staging
**Duration**: 30 seconds (pod kill + recovery)

## Results

### Metrics During Experiment
- **Error Rate**: Increased from 0.1% to 2.3% (spike lasted 8 seconds)
- **p95 Latency**: Increased from 180ms to 450ms (spike lasted 12 seconds)
- **Recovery Time**: 8 seconds (pod restart + load balancer update)

### Hypothesis Outcome
**FAILED**: Error rate exceeded 1% threshold, latency spike >300ms

## Root Cause Analysis
- Load balancer continued routing to killed pod for 8 seconds (stale endpoint)
- Readiness probe set to 10s interval (too slow)
- No pre-stop hook to drain connections gracefully

## Improvements Made
1. **Reduced readiness probe interval**: 10s → 2s
2. **Added pre-stop hook**: 5-second sleep for connection draining
3. **Tuned load balancer**: Enabled faster endpoint updates

## Follow-Up Experiment
- Re-run with same parameters in 1 week
- Expected: Error rate <1%, recovery <5s
```

在日志中追踪实验：

```bash
# chaos-experiment-log.csv
date,experiment,environment,status,error_rate_peak,recovery_time_s,outcome
2025-02-09,pod-kill-api,staging,complete,2.3%,8,failed
2025-02-16,pod-kill-api,staging,complete,0.8%,4,passed
2025-02-23,network-delay-db,staging,aborted,15%,N/A,failed
```

**预期结果：** 经验教训已记录，修复已实施，跟进已安排。

**失败处理：** 如果实验后不采取行动，混沌工程就变成了形式主义。优先处理从中学到的修复。

### 第 6 步：谨慎推进到生产环境

暂存实验持续通过后：

```yaml
# Production pod-kill experiment (more conservative)
apiVersion: chaos-mesh.org/v1alpha1
kind: PodChaos
metadata:
  name: api-pod-kill-prod
  namespace: chaos-testing
spec:
  action: pod-kill
  mode: one
  selector:
    namespaces:
      - production
    labelSelectors:
      app: api-gateway
      chaos-enabled: "true"
  duration: "10s"  # Shorter than staging
  scheduler:
    cron: "0 10 * * 2"  # Tuesdays at 10 AM only (predictable, low-risk time)
```

生产环境安全措施：

```bash
# Create a kill switch for production chaos
kubectl create configmap chaos-killswitch \
  -n chaos-testing \
  --from-literal=enabled=true

# Update experiments to check kill switch
# (implementation depends on chaos tool)
```

**预期结果：** 生产实验在低风险时间窗口运行，紧急开关随时可用。

**失败处理：** 如果生产实验导致事故，立即停用并进行后复盘。

## 验证清单

- [ ] 稳态和假设定义清晰
- [ ] 爆炸半径受限（环境、范围、时间）
- [ ] 混沌工具（Chaos Mesh 或 Litmus）已安装并测试
- [ ] 实验在暂存环境成功运行
- [ ] 结果记录包含指标和分析
- [ ] 根据发现实施了改进
- [ ] 跟进实验验证了修复
- [ ] 生产实验仅在 5+ 次暂存成功后运行

## 常见问题

- **没有假设**：运行混沌实验"看看会发生什么"是在浪费时间。始终要有假设。
- **范围过大**：一次性杀死所有 Pod 测试的是灾难恢复，而非韧性。从小处开始。
- **生产优先**：永远不要在生产环境运行第一个实验。始终先在暂存环境。
- **忽视结果**：没有行动的混沌是形式主义。修复你学到的问题。
- **告警疲劳**：混沌实验会触发告警。在 Grafana 中添加注解或静默预期告警。
- **没有中止计划**：如果实验出错，需要紧急开关。提前准备好。

## 相关技能

- `setup-prometheus-monitoring` - 测量实验影响的指标
- `configure-alerting-rules` - 混沌期间触发的告警（预期行为）
- `define-slo-sli-sla` - 与 SLO 关联的稳态定义
