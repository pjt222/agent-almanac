---
name: run-chaos-experiment
locale: wenyan-ultra
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

# 行混驗

控注故以測且改系韌也。

## 用

- 大釋前（負測）→用
- 構改後（驗韌）→用
- GameDay 或災復演→用
- 驗故模假→用
- SRE 熟度計畫→用

## 入

- **必**：Kubernetes 叢（Litmus 或 Chaos Mesh）
- **必**：穩態定（「常」貌）
- **必**：假設（如「一 pod 死，API 仍可用」）
- **可**：察棧（Prometheus、Grafana）量影
- **可**：回退計

## 行

### 一：定穩態與假

文錄常態：

```markdown
## Steady State Definition

### Service: API Gateway
- **Availability**: 99.9% (< 0.1% error rate)
- **Latency**: p95 < 200ms
- **Throughput**: 1000 req/s

## Hypothesis
"If one API pod is killed, the remaining pods will handle the load with <5s
disruption and no increase in error rate."
```

得：明、可量之常與成準。

敗：穩態不可定→察不足，先增指。

### 二：限爆徑

縮驗以減險：

```yaml
# chaos-config.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: chaos-testing
```

設護：

```markdown
## Blast Radius Controls
### Environment
- **Scope**: Staging only (first 5 runs)
- **Production**: Only after 5 successful staging runs
- **Timing**: Business hours (09:00-17:00 local)
### Auto-Abort Conditions
- Error rate >10% for >30 seconds
```

得：驗有界、不傾全系。

敗：徑過大→縮範。一非關服始。

### 三：裝 Chaos Mesh

```bash
# Add Chaos Mesh Helm repo
helm repo add chaos-mesh https://charts.chaos-mesh.org
helm repo update

# Install Chaos Mesh
helm install chaos-mesh chaos-mesh/chaos-mesh \
  --namespace chaos-mesh \
  --create-namespace \
  --set dashboard.create=true \
  --set controllerManager.replicaCount=1

# Verify
kubectl get pods -n chaos-mesh

# Dashboard
kubectl port-forward -n chaos-mesh svc/chaos-dashboard 2333:2333
```

替：Litmus（中立）：

```bash
kubectl apply -f https://litmuschaos.github.io/litmus/litmus-operator-v2.14.0.yaml
kubectl get pods -n litmus
```

得：Chaos Mesh 或 Litmus 行、面板可達。

敗：查 RBAC。混工需叢級權。

### 四：建行驗

例：Pod Kill（Chaos Mesh）：

```yaml
# pod-kill-experiment.yaml
apiVersion: chaos-mesh.org/v1alpha1
kind: PodChaos
metadata:
  name: api-pod-kill-test
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
  duration: "30s"
```

施驗：

```bash
kubectl apply -f pod-kill-experiment.yaml
kubectl get podchaos -n chaos-testing -w
kubectl describe podchaos api-pod-kill-test -n chaos-testing
```

察影於 Grafana：

```promql
rate(http_requests_total{status=~"5..", job="api"}[1m])
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job="api"}[1m]))
rate(kube_pod_container_status_restarts_total{pod=~"api-.*"}[5m])
```

得：pod 死、k8s 重啟、服續微擾。

敗：誤率躍或服衰→停驗、查。

### 五：析果迭

書驗報：

```markdown
# Chaos Experiment Report
**Hypothesis**: API stays available if one pod crashes
**Tool**: Chaos Mesh
## Results
- **Error Rate**: 0.1% → 2.3% (8s)
- **Recovery Time**: 8 seconds
## Hypothesis Outcome
**FAILED**: Error rate exceeded 1% threshold
## Improvements Made
1. Reduced readiness probe interval: 10s → 2s
2. Added pre-stop hook: 5-second sleep
```

記驗於日誌：

```bash
date,experiment,environment,status,error_rate_peak,recovery_time_s,outcome
2025-02-09,pod-kill-api,staging,complete,2.3%,8,failed
```

得：習得記、修施、後驗約。

敗：驗後無動→混工程為戲。優先修。

### 六：升至產（慎）

預驗常過後：

```yaml
apiVersion: chaos-mesh.org/v1alpha1
kind: PodChaos
metadata:
  name: api-pod-kill-prod
spec:
  action: pod-kill
  duration: "10s"
  scheduler:
    cron: "0 10 * * 2"
```

產護：

```bash
kubectl create configmap chaos-killswitch \
  -n chaos-testing \
  --from-literal=enabled=true
```

得：產驗於低險窗、急停備。

敗：產驗致事故→立禁、覆盤。

## 驗

- [ ] 穩態與假明定
- [ ] 爆徑限（境、範、時）
- [ ] 混工裝測
- [ ] 預驗成
- [ ] 果文錄附指析
- [ ] 修施
- [ ] 後驗驗修
- [ ] 產驗僅於 ≥ 5 預成後

## 忌

- **無假**：「看何發」費時。必有假
- **範過廣**：殺諸 pod 為災復測，非韌測。始小
- **產先**：勿首於產。預先恆
- **忽果**：無動之混為戲。修所學
- **警疲**：混驗觸警。Grafana 註或靜期警
- **無停計**：失控時需急停。備之

## 參

- `setup-prometheus-monitoring`
- `configure-alerting-rules`
- `define-slo-sli-sla`
