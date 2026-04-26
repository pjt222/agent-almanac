---
name: optimize-cloud-costs
locale: wenyan
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

# 優雲費

施全策於 Kubernetes 群以減雲費。

## 用時

- 雲基費長而業益不長乃用
- 須見費依隊、應、或環之分乃用
- 資請/限不合實用模乃用
- 手伸縮致過備與費乃用
- 欲用 spot/preemptible 例為非要工負乃用
- 內費攤須行 showback 或 chargeback 乃用
- 欲建 FinOps 之文化，覺與責費乃用

## 入

- **必要**：有負之 Kubernetes 群
- **必要**：雲供應商計費 API 入
- **必要**：metrics-server 或 Prometheus 為資度
- **可選**：歷用據以析趨
- **可選**：費攤求（依名空、標、隊）
- **可選**：服務水準目（SLO）為性束
- **可選**：算限或減費目

## 法

> 詳例見 [Extended Examples](references/EXAMPLES.md)。


### 第一步：部費見器

裝 Kubecost 或 OpenCost 以察費。

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

**設雲供應商整合：**
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

施雲整合：
```bash
kubectl apply -f kubecost-cloud-integration.yaml

# Verify cloud costs are being imported
kubectl logs -n kubecost -l app=cost-analyzer -c cost-model --tail=100 | grep -i "cloud"

# Check Kubecost API for cost data
kubectl port-forward -n kubecost svc/kubecost-cost-analyzer 9090:9090 &
curl http://localhost:9090/model/allocation\?window\=7d | jq .
```

**得：** Kubecost pod 行成。UI 可達，現費依名空、部署、pod 之分。雲費入（首同步或 24-48 時）。API 返攤據。

**敗則：**
- 察 Prometheus 行：`kubectl get svc -n monitoring prometheus-server`
- 驗雲憑有計費 API 入
- 閱 cost-model 日誌：`kubectl logs -n kubecost -l app=cost-analyzer -c cost-model`
- 確 metrics-server 或 Prometheus node-exporter 收資度
- 察網策阻雲計費 API

### 第二步：析當前資用

識過備之資與優機。

**問資用：**
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

**用 Kubecost 之薦：**
```bash
# Get right-sizing recommendations via API
curl "http://localhost:9090/model/savings/requestSizing?window=7d" | jq . > recommendations.json

# Extract top wasteful resources
jq '.data[] | select(.totalRecommendedSavings > 10) | {
  cluster: .clusterID,
# ... (see EXAMPLES.md for complete configuration)
```

**建用度盤：**
```yaml
# grafana-utilization-dashboard.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: utilization-dashboard
  namespace: monitoring
# ... (see EXAMPLES.md for complete configuration)
```

**得：** 明見當前資請與實用之較。識用度 <30% 之 pod（過備）。優機附估省。盤示用度跨時之趨。

**敗則：**
- 確 metrics-server 行：`kubectl get deployment metrics-server -n kube-system`
- 察 Prometheus 有 node-exporter 度：`curl http://prometheus:9090/api/v1/query?query=node_cpu_seconds_total`
- 驗 pod 已行足久（至少二十四時）
- 察度收之隙：閱 Prometheus 留與抓隔
- Kubecost 須收至少四十八時據

### 第三步：行 HPA（橫 pod 自伸縮）

依 CPU、記憶、或自度量設自動伸縮。

**建依 CPU 之 HPA：**
```yaml
# hpa-cpu.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-server-hpa
  namespace: production
# ... (see EXAMPLES.md for complete configuration)
```

**部並驗 HPA：**
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

**得：** HPA 已建，現當/目度量。負下 pod 增。負減（穩窗後）pod 減。伸縮事入記。無振（速增減環）。

**敗則：**
- 驗 metrics-server 行：`kubectl get apiservice v1beta1.metrics.k8s.io`
- 察部署有資請（HPA 必）
- 閱 HPA 事：`kubectl describe hpa api-server-hpa -n production`
- 確目部署未至最大複本
- 自度量者，驗度量適配器已裝設
- 察 HPA 控制器日誌：`kubectl logs -n kube-system -l app=kube-controller-manager | grep horizontal-pod-autoscaler`

### 第四步：設 VPA（縱 pod 自伸縮）

依實用模自動調資請。

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

**建 VPA 策：**
```yaml
# vpa-policies.yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: api-server-vpa
  namespace: production
# ... (see EXAMPLES.md for complete configuration)
```

**部並察 VPA：**
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

**得：** VPA 供薦或自動調資請。薦基於百分位用模（常 P95）。Auto/Recreate 模下 pod 以新請重啟。HPA 與 VPA 不衝（HPA 為複本，VPA 為每 pod 資）。

**敗則：**
- 確 metrics-server 有足據（VPA 須數日方準）
- 察 VPA 件：`kubectl get pods -n kube-system | grep vpa`
- 閱 VPA admission controller 日誌：`kubectl logs -n kube-system -l app=vpa-admission-controller`
- 驗 webhook 已註：`kubectl get mutatingwebhookconfigurations vpa-webhook-config`
- 勿同度（CPU/記憶）上同用 VPA 與 HPA - 衝
- 始以「Off」模察薦再啟自動更

### 第五步：用 spot/preemptible 例

設工負排程於省費 spot 例。

**建 spot 之節點池：**
```yaml
# For AWS (via Karpenter)
apiVersion: karpenter.sh/v1alpha5
kind: Provisioner
metadata:
  name: spot-provisioner
spec:
# ... (see EXAMPLES.md for complete configuration)
```

**設工負為 spot：**
```yaml
# spot-workload.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: batch-processor
  namespace: production
# ... (see EXAMPLES.md for complete configuration)
```

**部並察 spot 用：**
```bash
kubectl apply -f spot-workload.yaml

# Monitor spot node allocation
kubectl get nodes -l node-type=spot

# Check workload distribution
# ... (see EXAMPLES.md for complete configuration)
```

**得：** 工負排成於 spot 節點。費大減（常較 on-demand 省 60-90%）。優雅處 spot 中斷與 pod 重排。察示中斷率與成功復。

**敗則：**
- 驗區/帶 spot 例可得
- 察節標籤與污合工負容
- 閱 Karpenter 日誌：`kubectl logs -n karpenter -l app.kubernetes.io/name=karpenter`
- 確工負無態或有合態管以承中斷
- 試中斷處：手 cordon 並 drain spot 節
- 察中斷率 - 過高考退至 on-demand

### 第六步：行資配額與算警

設硬限與警以控費。

**建資配額：**
```yaml
# resource-quotas.yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: production-quota
  namespace: production
# ... (see EXAMPLES.md for complete configuration)
```

**設算警：**
```yaml
# kubecost-budget-alerts.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: budget-alerts
  namespace: kubecost
# ... (see EXAMPLES.md for complete configuration)
```

施並察：
```bash
kubectl apply -f resource-quotas.yaml
kubectl apply -f kubecost-budget-alerts.yaml

# Check quota usage
kubectl get resourcequota -n production
kubectl describe resourcequota production-quota -n production
# ... (see EXAMPLES.md for complete configuration)
```

**得：** 配額施限於各名空。逾配額則 pod 建拒。閾破則算警鳴。費突察行。常報送於相關者。

**敗則：**
- 驗 ResourceQuota 與 LimitRange 已正施：`kubectl get resourcequota,limitrange -A`
- 察 pod 因配額而敗：`kubectl get events -n production | grep quota`
- 閱 Kubecost 警設：`kubectl logs -n kubecost -l app=cost-analyzer | grep alert`
- 確 Prometheus 有 Kubecost 度：`curl http://prometheus:9090/api/v1/query?query=kubecost_monthly_cost`
- 試警路：驗郵/Slack webhook 設

## 驗

- [ ] Kubecost 或 OpenCost 已部，現準費據
- [ ] 雲供應商計費整合行（費合實單）
- [ ] 資用析識過備工負
- [ ] HPA 依負伸縮 pod（試經負試驗）
- [ ] VPA 供薦或自動調資請
- [ ] Spot 例優雅處中斷
- [ ] 資配額施限於各名空
- [ ] 閾逾則算警鳴
- [ ] 月費降趨或留算內
- [ ] showback 報為隊/項目生
- [ ] 優費未致性能退
- [ ] 文檔以優實更新

## 陷

- **過急右大小**：勿即施 VPA 薦。始以「Off」模，察薦一週，後漸施。突變致 OOMKill 或 CPU 節制。

- **HPA + VPA 衝**：勿於同度（CPU/記憶）同用 HPA 與 VPA。HPA 為橫伸縮，VPA 為每 pod 資調，或 HPA 自度量 + VPA 資。

- **無容錯之 spot**：唯容錯、無態之工負於 spot。勿用於庫、有態服、或單複本要服。必用 PodDisruptionBudget。

- **察期不足**：優費決需歷據。變前候至少七日，VPA 薦三十日，趨析九十日。

- **忽突需**：依均用設限過低致流突時節制。容量計用 P95 或 P99 百分位，非均。

- **網外費**：計費於 Kubecost 可見，然外（傳）費可大。察跨 AZ 流，用拓樸路由，計傳費於架構。

- **忽存儲**：PV 費常忘。察未用 PVC，右大小卷，用卷擴非過備，行 PV 清策。

- **配額過束**：配額過低阻合理長。月察配額用，依實調，施前告隊。

- **誤度量之假省**：唯 CPU/記憶為優度漏 I/O、網、存費。考總有費，非僅算。

- **未信前 chargeback**：隊未解信費據前 chargeback 致摩。始以 showback（告），建費覺文化，後 chargeback。

## 參

- `deploy-to-kubernetes` - 應部署附宜資請
- `setup-prometheus-monitoring` - 費度之察基設
- `plan-capacity` - 依費與性容量計
- `setup-local-kubernetes` - 本地開發避雲費
- `write-helm-chart` - 模板資請與限
- `implement-gitops-workflow` - 為優費設之 GitOps
