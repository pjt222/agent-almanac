---
name: run-chaos-experiment
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Design and execute chaos engineering experiments using Litmus or Chaos Mesh.
  Test system resilience through controlled fault injection, validate
  hypothesis-driven tests, and improve failure recovery. Use before major
  product launches, after architecture changes to validate resilience, during
  GameDays or disaster recovery drills, to validate assumptions about failure
  modes, or as part of an SRE maturity program.
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

# 行混沌之試

注控之故障，以試而進系統之韌。

## 用時

- 大發布之前（負載之試）乃用
- 架構之變後（驗韌）乃用
- GameDay 或災備之演乃用
- 驗故障模之假乃用
- SRE 成熟之程乃用

## 入

- **必要**：Kubernetes 之集（為 Litmus 或 Chaos Mesh）
- **必要**：穩態之定（「常」之貌）
- **必要**：欲試之假（如「一 pod 崩，API 仍可用」）
- **可選**：可察之棧（Prometheus、Grafana）以量影
- **可選**：回退之計

## 法

### 第一步：定穩態與假

書系統常為：

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

得：常之定明且可量，成之準明。

敗則：不能定穩態，可察之力不足。先增指標。

### 第二步：限爆之徑

縮試之範以減險：

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

設防護：

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

得：試有明界，不傾全系。

敗則：爆徑過大，縮其範。先以一非關鍵之服。

### 第三步：裝 Chaos Mesh

展 Chaos Mesh（Kubernetes 原生）：

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

或用 Litmus（中立於供者）：

```bash
# Install Litmus
kubectl apply -f https://litmuschaos.github.io/litmus/litmus-operator-v2.14.0.yaml

# Wait for Litmus pods
kubectl get pods -n litmus

# Install Litmus CRDs
kubectl apply -f https://hub.litmuschaos.io/api/chaos/master?file=charts/generic/experiments.yaml
```

得：Chaos Mesh 或 Litmus 行，儀表可達。

敗則：察 RBAC 之權。混沌之器需集級之訪。

### 第四步：建並行試

例：殺 Pod 之試（Chaos Mesh）：

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

施其試：

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

於 Grafana 監其影：

```promql
# Error rate during experiment
rate(http_requests_total{status=~"5..", job="api"}[1m])

# Latency spike
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job="api"}[1m]))

# Pod restarts
rate(kube_pod_container_status_restarts_total{pod=~"api-.*"}[5m])
```

得：pod 被殺，Kubernetes 復起之，服務僅微頓而續。

敗則：誤率突升或服顯降，止試而查。

### 第五步：析果而續

立試報：

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

於日誌錄諸試：

```bash
# chaos-experiment-log.csv
date,experiment,environment,status,error_rate_peak,recovery_time_s,outcome
2025-02-09,pod-kill-api,staging,complete,2.3%,8,failed
2025-02-16,pod-kill-api,staging,complete,0.8%,4,passed
2025-02-23,network-delay-db,staging,aborted,15%,N/A,failed
```

得：所學已捕，修已施，後續已排。

敗則：試後無行，混沌成戲也。先修所得。

### 第六步：升至生產（慎之）

試於 staging 屢過，乃可升：

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

生產之防：

```bash
# Create a kill switch for production chaos
kubectl create configmap chaos-killswitch \
  -n chaos-testing \
  --from-literal=enabled=true

# Update experiments to check kill switch
# (implementation depends on chaos tool)
```

得：生產之試於低險之時行，斷閘已備。

敗則：生產之試致事故，立廢之而事後審。

## 驗

- [ ] 穩態與假皆明定
- [ ] 爆徑限（境、範、時）
- [ ] 混沌之器（Chaos Mesh 或 Litmus）已裝且試
- [ ] 試於 staging 行而成
- [ ] 果有書記，附指與析
- [ ] 依得行修
- [ ] 後續試驗其修
- [ ] 生產之試唯五次以上 staging 之成後乃行

## 陷

- **無假**：「視何發」之混沌費時也。必有假
- **範過廣**：一時殺諸 pod 試災備，非試韌也。始於小
- **生產為先**：勿於生產為首試。staging 在先，常然
- **忽果**：無行之混沌，戲也。修所學
- **警之疲**：混沌試觸警。註於 Grafana 或靜其預期之警
- **無斷之計**：試誤需斷閘。備之

## 參

- `setup-prometheus-monitoring` — 量試影之指
- `configure-alerting-rules` — 混沌時觸之警（預期）
- `define-slo-sli-sla` — 穩態繫於 SLO
