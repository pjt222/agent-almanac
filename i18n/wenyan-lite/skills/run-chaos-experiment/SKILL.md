---
name: run-chaos-experiment
locale: wenyan-lite
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

# 執行混沌實驗

注入受控之故障以測試並改善系統韌性。

## 適用時機

- 重大產品發佈前（負載測試）
- 架構變更後（驗證韌性）
- GameDay 或災難恢復演練期間
- 為驗證對故障模式之假設
- 作為 SRE 成熟度計劃之一部分

## 輸入

- **必要**：Kubernetes 集群（用於 Litmus 或 Chaos Mesh）
- **必要**：穩態定義（「正常」之樣貌）
- **必要**：欲測之假設（如「一個 pod 崩潰時 API 仍可用」）
- **選擇性**：可觀察性堆疊（Prometheus、Grafana）以量測影響
- **選擇性**：回滾計劃

## 步驟

### 步驟一：定義穩態與假設

記錄系統正常行為：

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

**預期：** 對正常行為與成功標準有清晰、可量測之定義。

**失敗時：** 若無法定義穩態，可觀察性不足。應先增加指標。

### 步驟二：設定爆炸半徑限制

縮小實驗範圍以最小化風險：

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

設定保護措施：

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

**預期：** 實驗有清晰邊界，不致打垮整個系統。

**失敗時：** 若爆炸半徑過大，縮小範圍。從一個非關鍵服務開始。

### 步驟三：安裝 Chaos Mesh

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

替代：Litmus（中立於供應商）：

```bash
# Install Litmus
kubectl apply -f https://litmuschaos.github.io/litmus/litmus-operator-v2.14.0.yaml

# Wait for Litmus pods
kubectl get pods -n litmus

# Install Litmus CRDs
kubectl apply -f https://hub.litmuschaos.io/api/chaos/master?file=charts/generic/experiments.yaml
```

**預期：** Chaos Mesh 或 Litmus 已運行，儀表板可存取。

**失敗時：** 檢查 RBAC 權限。混沌工具需集群範圍存取。

### 步驟四：建立並執行實驗

範例：Pod Kill 實驗（Chaos Mesh）：

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

施行實驗：

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

於 Grafana 監控影響：

```promql
# Error rate during experiment
rate(http_requests_total{status=~"5..", job="api"}[1m])

# Latency spike
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job="api"}[1m]))

# Pod restarts
rate(kube_pod_container_status_restarts_total{pod=~"api-.*"}[5m])
```

**預期：** Pod 被殺，Kubernetes 重啟之，服務以小波動繼續。

**失敗時：** 若錯誤率激增或服務顯著降級，中止實驗並調查。

### 步驟五：分析結果並反覆

建立實驗報告：

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

於日誌追蹤實驗：

```bash
# chaos-experiment-log.csv
date,experiment,environment,status,error_rate_peak,recovery_time_s,outcome
2025-02-09,pod-kill-api,staging,complete,2.3%,8,failed
2025-02-16,pod-kill-api,staging,complete,0.8%,4,passed
2025-02-23,network-delay-db,staging,aborted,15%,N/A,failed
```

**預期：** 學習已捕捉、修正已實施、後續已排程。

**失敗時：** 若實驗後無行動，混沌工程淪為表演。應將修正列為優先。

### 步驟六：謹慎晉升至生產

當預備環境實驗持續通過：

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

生產之保護措施：

```bash
# Create a kill switch for production chaos
kubectl create configmap chaos-killswitch \
  -n chaos-testing \
  --from-literal=enabled=true

# Update experiments to check kill switch
# (implementation depends on chaos tool)
```

**預期：** 生產實驗於低風險時段執行，並備有緊急開關。

**失敗時：** 若生產實驗引發事件，立即停用並進行事後檢討。

## 驗證

- [ ] 穩態與假設已清楚定義
- [ ] 爆炸半徑已限制（環境、範圍、時機）
- [ ] 混沌工具（Chaos Mesh 或 Litmus）已安裝並測試
- [ ] 實驗於預備環境成功執行
- [ ] 結果已附指標與分析記錄
- [ ] 已依發現實施改進
- [ ] 後續實驗驗證了修正
- [ ] 生產實驗僅於 5 次以上預備環境成功後執行

## 常見陷阱

- **無假設**：「看看會發生什麼」之混沌實驗浪費時間。應始終有假設。
- **範圍過廣**：一次殺死所有 pod 是測試災難恢復而非韌性。從小開始。
- **生產優先**：絕不於生產執行首次實驗。永遠先預備環境。
- **忽視結果**：無行動之混沌即表演。應修正所學。
- **警報疲勞**：混沌實驗會觸發警報。應於 Grafana 註記或靜音預期警報。
- **無中止計劃**：若實驗出錯，需有緊急開關。應預先備妥。

## 相關技能

- `setup-prometheus-monitoring` - 用以量測實驗影響之指標
- `configure-alerting-rules` - 混沌期間觸發之警報（預期內）
- `define-slo-sli-sla` - 與 SLO 連動之穩態
