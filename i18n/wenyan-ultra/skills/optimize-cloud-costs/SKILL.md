---
name: optimize-cloud-costs
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Implement cloud cost optimization strategies for Kubernetes workloads using tools like
  Kubecost for visibility, right-sizing recommendations, horizontal and vertical pod
  autoscaling, spot/preemptible instances, and resource quotas. Covers cost allocation,
  showback reporting, and continuous optimization practices. Use when cloud costs are
  growing without proportional business value, when resource requests are misaligned with
  actual usage, when manual scaling leads to over-provisioning, or when implementing
  showback and chargeback for internal cost accountability.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: devops
  complexity: intermediate
  language: multi
  tags: cost-optimization, kubecost, hpa, vpa, spot-instances, resource-management, kubernetes
---

# 省雲費

施 Kubernetes 之全費省策以減雲費。

## 用

- 雲費長而業值不增
- 須見費按隊、用、境分配
- 求/限與實用不合
- 手調縮致過供
- 欲用 spot/preemptible 於非要負
- 須行 showback/chargeback
- 立 FinOps 文化（覺+責）

## 入

- **必**：有負之 K8s 群
- **必**：雲商賬 API
- **必**：metrics-server 或 Prometheus
- **可**：舊用料以察趨
- **可**：費分配求（按 ns、標、隊）
- **可**：SLO
- **可**：預算或減費標

## 行

> 詳例見 [Extended Examples](references/EXAMPLES.md)。

### 一：裝費見具

裝 Kubecost 或 OpenCost 以察+分配。

**裝 Kubecost：**
```bash
# Add Kubecost Helm repository
helm repo add kubecost https://kubecost.github.io/cost-analyzer/
helm repo update

# Install Kubecost with Prometheus integration
helm install kubecost kubecost/cost-analyzer \
  --namespace kubecost \
  --create-namespace \
  --set kubecostToken="your-token-here" \
  --set prometheus.server.global.external_labels.cluster_id="production-cluster" \
  --set prometheus.nodeExporter.enabled=true \
  --set prometheus.serviceAccounts.nodeExporter.create=true

# For existing Prometheus, configure Kubecost to use it
helm install kubecost kubecost/cost-analyzer \
  --namespace kubecost \
  --create-namespace \
  --set prometheus.enabled=false \
  --set global.prometheus.fqdn="http://prometheus-server.monitoring.svc.cluster.local" \
  --set global.prometheus.enabled=true

# Verify installation
kubectl get pods -n kubecost
kubectl get svc -n kubecost

# Access Kubecost UI
kubectl port-forward -n kubecost svc/kubecost-cost-analyzer 9090:9090
# Open http://localhost:9090
```

**配雲商：**
```yaml
# kubecost-cloud-integration.yaml
apiVersion: v1
kind: Secret
metadata:
  name: cloud-integration
  namespace: kubecost
type: Opaque
stringData:
  # For AWS
  cloud-integration.json: |
    {
      "aws": [
        {
          "serviceKeyName": "AWS_ACCESS_KEY_ID",
          "serviceKeySecret": "AWS_SECRET_ACCESS_KEY",
          "athenaProjectID": "cur-query-results",
          "athenaBucketName": "s3://your-cur-bucket",
          "athenaRegion": "us-east-1",
          "athenaDatabase": "athenacurcfn_my_cur",
          "athenaTable": "my_cur"
        }
      ]
    }
---
# For GCP
apiVersion: v1
kind: Secret
metadata:
  name: gcp-key
  namespace: kubecost
type: Opaque
data:
  key.json: <base64-encoded-service-account-key>
---
# For Azure
apiVersion: v1
kind: ConfigMap
metadata:
  name: azure-config
  namespace: kubecost
data:
  azure.json: |
    {
      "azureSubscriptionID": "your-subscription-id",
      "azureClientID": "your-client-id",
      "azureClientSecret": "your-client-secret",
      "azureTenantID": "your-tenant-id",
      "azureOfferDurableID": "MS-AZR-0003P"
    }
```

施雲整：
```bash
kubectl apply -f kubecost-cloud-integration.yaml

# Verify cloud costs are being imported
kubectl logs -n kubecost -l app=cost-analyzer -c cost-model --tail=100 | grep -i "cloud"

# Check Kubecost API for cost data
kubectl port-forward -n kubecost svc/kubecost-cost-analyzer 9090:9090 &
curl http://localhost:9090/model/allocation\?window\=7d | jq .
```

**得：** Kubecost pod 行、UI 可見費按 ns/部署/pod 分。雲費入（初同步 24-48 時）。API 返分配料。

**敗：**
- 查 Prometheus 行：`kubectl get svc -n monitoring prometheus-server`
- 雲憑證有賬 API 權
- 看 cost-model 日誌：`kubectl logs -n kubecost -l app=cost-analyzer -c cost-model`
- metrics-server 或 node-exporter 在採
- 網策無阻雲賬 API

### 二：析現用率

識過供+省機。

**查資源用率：**
```bash
# Get resource requests vs usage for all pods
kubectl top pods --all-namespaces --containers | \
  awk 'NR>1 {print $1,$2,$3,$4,$5}' > current-usage.txt

# Compare requests to actual usage
cat <<'EOF' > analyze-utilization.sh
#!/bin/bash
echo "Pod,Namespace,CPU-Request,CPU-Usage,Memory-Request,Memory-Usage"
for ns in $(kubectl get ns -o jsonpath='{.items[*].metadata.name}'); do
  kubectl get pods -n $ns -o json | jq -r '
    .items[] |
    select(.status.phase == "Running") |
    {
      name: .metadata.name,
      namespace: .metadata.namespace,
      containers: [
        .spec.containers[] |
        {
          name: .name,
          cpuReq: .resources.requests.cpu,
          memReq: .resources.requests.memory
        }
      ]
    } |
    "\(.name),\(.namespace),\(.containers[].cpuReq // "none"),\(.containers[].memReq // "none")"
  ' 2>/dev/null
done
EOF

chmod +x analyze-utilization.sh
./analyze-utilization.sh > resource-requests.csv

# Get actual usage from metrics server
kubectl top pods --all-namespaces --containers > actual-usage.txt
```

**用 Kubecost 薦：**
```bash
# Get right-sizing recommendations via API
curl "http://localhost:9090/model/savings/requestSizing?window=7d" | jq . > recommendations.json

# Extract top wasteful resources
jq '.data[] | select(.totalRecommendedSavings > 10) | {
  cluster: .clusterID,
# ... (see EXAMPLES.md for complete configuration)
```

**立用率板：**
```yaml
# grafana-utilization-dashboard.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: utilization-dashboard
  namespace: monitoring
# ... (see EXAMPLES.md for complete configuration)
```

**得：** 求 vs 實用清明。識用率 < 30% 之 pod（過供）。省機單+估省。板示用率趨。

**敗：**
- metrics-server 行：`kubectl get deployment metrics-server -n kube-system`
- Prometheus 有 node-exporter：`curl http://prometheus:9090/api/v1/query?query=node_cpu_seconds_total`
- 行足期（≥ 24 時）
- 採料無隙—察 Prometheus 留存+採率
- Kubecost 至少 48 時料

### 三：施 HPA（水平 pod 自調）

依 CPU、memory、自指自調。

**立 CPU HPA：**
```yaml
# hpa-cpu.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-server-hpa
  namespace: production
# ... (see EXAMPLES.md for complete configuration)
```

**部署+驗：**
```bash
kubectl apply -f hpa-cpu.yaml

# Check HPA status
kubectl get hpa -n production
kubectl describe hpa api-server-hpa -n production

# Monitor scaling events
kubectl get events -n production --field-selector involvedObject.kind=HorizontalPodAutoscaler --watch

# Generate load to test autoscaling
kubectl run load-generator --rm -it --image=busybox -- /bin/sh -c \
  "while true; do wget -q -O- http://api-server.production.svc.cluster.local; done"

# Watch replicas scale
watch kubectl get hpa,deployment -n production
```

**得：** HPA 立、見當前/標指。負高則增、負低則減（穩窗後）。事件記錄。無震蕩。

**敗：**
- metrics-server 行：`kubectl get apiservice v1beta1.metrics.k8s.io`
- 部署有資源求（HPA 必須）
- HPA 事：`kubectl describe hpa api-server-hpa -n production`
- 標部署未達最大副本
- 自指：metrics 適配器已裝
- HPA 控器日誌：`kubectl logs -n kube-system -l app=kube-controller-manager | grep horizontal-pod-autoscaler`

### 四：配 VPA（垂直 pod 自調）

依實用自調資源求。

**裝 VPA：**
```bash
# Clone VPA repository
git clone https://github.com/kubernetes/autoscaler.git
cd autoscaler/vertical-pod-autoscaler

# Install VPA
./hack/vpa-up.sh

# Verify installation
kubectl get pods -n kube-system | grep vpa

# Check VPA CRDs
kubectl get crd | grep verticalpodautoscaler
```

**立 VPA 策：**
```yaml
# vpa-policies.yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: api-server-vpa
  namespace: production
# ... (see EXAMPLES.md for complete configuration)
```

**部署+察：**
```bash
kubectl apply -f vpa-policies.yaml

# Check VPA recommendations
kubectl get vpa -n production
kubectl describe vpa api-server-vpa -n production

# View detailed recommendations
kubectl get vpa api-server-vpa -n production -o jsonpath='{.status.recommendation}' | jq .

# Monitor VPA-initiated pod updates
kubectl get events -n production --field-selector involvedObject.kind=VerticalPodAutoscaler --watch

# Compare recommendations to current requests
kubectl get deployment api-server -n production -o json | \
  jq '.spec.template.spec.containers[].resources.requests'
```

**得：** VPA 供薦或自更求。薦依百分位（多 P95）。Auto/Recreate 模則重啟+新求。HPA↔VPA 不衝突（HPA 管副本、VPA 管 pod 內資源）。

**敗：**
- metrics-server 料足（VPA 須數日）
- VPA 元行：`kubectl get pods -n kube-system | grep vpa`
- VPA admission 日誌：`kubectl logs -n kube-system -l app=vpa-admission-controller`
- webhook 已註：`kubectl get mutatingwebhookconfigurations vpa-webhook-config`
- 同指（CPU/mem）勿同用 VPA+HPA—衝突
- 始用 "Off" 模審薦再啟自更

### 五：用 spot/preemptible

配負於省費 spot 實例。

**立 spot 節池：**
```yaml
# For AWS (via Karpenter)
apiVersion: karpenter.sh/v1alpha5
kind: Provisioner
metadata:
  name: spot-provisioner
spec:
# ... (see EXAMPLES.md for complete configuration)
```

**配負於 spot：**
```yaml
# spot-workload.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: batch-processor
  namespace: production
# ... (see EXAMPLES.md for complete configuration)
```

**部署+察：**
```bash
kubectl apply -f spot-workload.yaml

# Monitor spot node allocation
kubectl get nodes -l node-type=spot

# Check workload distribution
# ... (see EXAMPLES.md for complete configuration)
```

**得：** 負配於 spot 成。費大減（多 60-90% vs 按需）。spot 中斷時平安遷。察示中斷率+恢復。

**敗：**
- 區/可用區有 spot
- 節標+污點合負容
- Karpenter 日誌：`kubectl logs -n karpenter -l app.kubernetes.io/name=karpenter`
- 負無狀或有態管以應中斷
- 試中斷：手 cordon+drain spot 節
- 中斷率高→備按需節

### 六：施資配額+預算警

立硬限+警以控費。

**立資配額：**
```yaml
# resource-quotas.yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: production-quota
  namespace: production
# ... (see EXAMPLES.md for complete configuration)
```

**配預算警：**
```yaml
# kubecost-budget-alerts.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: budget-alerts
  namespace: kubecost
# ... (see EXAMPLES.md for complete configuration)
```

施+察：
```bash
kubectl apply -f resource-quotas.yaml
kubectl apply -f kubecost-budget-alerts.yaml

# Check quota usage
kubectl get resourcequota -n production
kubectl describe resourcequota production-quota -n production
# ... (see EXAMPLES.md for complete configuration)
```

**得：** 配額執行 ns 限。pod 超則阻。預算警觸於閾。費突檢有效。期報送干係人。

**敗：**
- ResourceQuota+LimitRange 已施：`kubectl get resourcequota,limitrange -A`
- pod 因配額敗：`kubectl get events -n production | grep quota`
- Kubecost 警配：`kubectl logs -n kubecost -l app=cost-analyzer | grep alert`
- Prometheus 有 Kubecost 指：`curl http://prometheus:9090/api/v1/query?query=kubecost_monthly_cost`
- 試警路：驗郵/Slack webhook

## 驗

- [ ] Kubecost/OpenCost 部署且料準
- [ ] 雲商賬整成（費合實單）
- [ ] 用率析識過供之負
- [ ] HPA 依負調 pod（負試已驗）
- [ ] VPA 供薦或自更求
- [ ] spot 平安應中斷
- [ ] 配額執行 ns 限
- [ ] 預算警觸於閾
- [ ] 月費降或在預算內
- [ ] showback 報生
- [ ] 省費未致性能衰
- [ ] 文已更實踐

## 忌

- **激進右調**：勿即施 VPA 薦—始 "Off" 模審週、漸進—驟變致 OOMKill 或 CPU 節流
- **HPA+VPA 衝突**：同指（CPU/mem）勿同用—HPA 管橫、VPA 管縱、或 HPA 用自指+VPA 管資源
- **spot 無容錯**：但無狀容錯之負方可—絕勿庫、有態服、單副本要服—必用 PodDisruptionBudget
- **察期不足**：省費決須舊料—變前等 ≥ 7 日、VPA 薦 ≥ 30 日、趨析 ≥ 90 日
- **忽突發**：依平均設限低致流峰節流—用 P95/P99、勿平均
- **網出費**：算費 Kubecost 可見、出（傳）費或大—察跨區流、用拓撲路、架時計傳費
- **存忽**：PV 費常忘—審無用 PVC、右調卷、用擴展非過供、立 PV 清策
- **配額過嚴**：配額過低阻正當增—月審配額用率、依實調、施前告隊
- **誤指偽省**：但用 CPU/mem 漏 I/O、網、存費—計總擁費、非但算
- **信前 chargeback**：先 showback（告知）、立費覺文化、後 chargeback—否則摩擦

## 參

- `deploy-to-kubernetes`
- `setup-prometheus-monitoring`
- `plan-capacity`
- `setup-local-kubernetes`
- `write-helm-chart`
- `implement-gitops-workflow`
