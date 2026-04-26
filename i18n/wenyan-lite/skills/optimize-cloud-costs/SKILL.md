---
name: optimize-cloud-costs
locale: wenyan-lite
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

# 優化雲端成本

為 Kubernetes 集群實施全面之成本優化策略，以減雲端支出。

## 適用時機

- 雲端基礎設施成本增而業務價值未相應增
- 須見成本依團隊、應用或環境之分配
- 資源請求/限制與實際使用模式不合
- 手動縮放致過度配置與浪費
- 欲利用 spot/preemptible 實例供非關鍵負載
- 須實施 showback 或 chargeback 以內部成本分配
- 欲建立 FinOps 文化，培養成本意識與責任

## 輸入

- **必要**：運行負載之 Kubernetes 集群
- **必要**：雲端供應商計費 API 存取
- **必要**：metrics server 或 Prometheus 以資源指標
- **選擇性**：歷史使用資料，供趨勢分析
- **選擇性**：成本分配需求（依命名空間、標籤、團隊）
- **選擇性**：性能約束之服務水準目標（SLO）
- **選擇性**：預算上限或成本減少目標

## 步驟

> 完整配置檔與範本詳見 [Extended Examples](references/EXAMPLES.md)。


### 步驟一：部署成本可見性工具

安裝 Kubecost 或 OpenCost 以監測與分配成本。

**安裝 Kubecost：**
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

**配置雲端供應商整合：**
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

施雲端整合：
```bash
kubectl apply -f kubecost-cloud-integration.yaml

# Verify cloud costs are being imported
kubectl logs -n kubecost -l app=cost-analyzer -c cost-model --tail=100 | grep -i "cloud"

# Check Kubecost API for cost data
kubectl port-forward -n kubecost svc/kubecost-cost-analyzer 9090:9090 &
curl http://localhost:9090/model/allocation\?window\=7d | jq .
```

**預期：** Kubecost pods 順利運行。UI 可達，呈依命名空間、部署、pod 之成本分解。雲端供應商成本匯入中（初次同步或須 24-48 小時）。API 返分配資料。

**失敗時：**
- 查 Prometheus 運行且可達：`kubectl get svc -n monitoring prometheus-server`
- 驗雲端憑證有計費 API 存取
- 覽 cost-model 日誌：`kubectl logs -n kubecost -l app=cost-analyzer -c cost-model`
- 確 metrics-server 或 Prometheus node-exporter 蒐資源指標
- 查網路策略阻擋雲端計費 API 存取者

### 步驟二：分析當前資源使用率

辨過度配置之資源與優化機會。

**查詢資源使用率：**
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

**用 Kubecost 建議：**
```bash
# Get right-sizing recommendations via API
curl "http://localhost:9090/model/savings/requestSizing?window=7d" | jq . > recommendations.json

# Extract top wasteful resources
jq '.data[] | select(.totalRecommendedSavings > 10) | {
  cluster: .clusterID,
# ... (see EXAMPLES.md for complete configuration)
```

**建使用率儀表板：**
```yaml
# grafana-utilization-dashboard.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: utilization-dashboard
  namespace: monitoring
# ... (see EXAMPLES.md for complete configuration)
```

**預期：** 清晰見當前資源請求 vs 實際使用。辨識使用率 <30% 之 pods（過度配置）。優化機會清單附估計節省。儀表板顯使用率隨時間之趨勢。

**失敗時：**
- 確 metrics-server 運行：`kubectl get deployment metrics-server -n kube-system`
- 查 Prometheus 有 node-exporter 指標：`curl http://prometheus:9090/api/v1/query?query=node_cpu_seconds_total`
- 驗 pods 已運行足夠久以得有意義之資料（至少 24 小時）
- 查指標蒐集中之缺口：覽 Prometheus 保留與抓取間隔
- 對 Kubecost，確已蒐至少 48 小時之資料

### 步驟三：實施水平 Pod 自動縮放（HPA）

依 CPU、記憶體或自定指標配置自動縮放。

**為 CPU 縮放建 HPA：**
```yaml
# hpa-cpu.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-server-hpa
  namespace: production
# ... (see EXAMPLES.md for complete configuration)
```

**部署並驗 HPA：**
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

**預期：** HPA 已建並顯當前/目標指標。負載下 pods 縮放上去。負載減則縮放回（穩定窗口後）。縮放事件已記錄。無顛簸（速縮放上下之循環）。

**失敗時：**
- 驗 metrics-server 運行：`kubectl get apiservice v1beta1.metrics.k8s.io`
- 查部署是否設資源請求（HPA 所必）
- 覽 HPA 事件：`kubectl describe hpa api-server-hpa -n production`
- 確目標部署未達最大副本數
- 對自定指標，驗 metrics adapter 已裝且配置
- 查 HPA 控制器日誌：`kubectl logs -n kube-system -l app=kube-controller-manager | grep horizontal-pod-autoscaler`

### 步驟四：配置垂直 Pod 自動縮放（VPA）

依實際使用模式自動調整資源請求。

**安裝 VPA：**
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

**建 VPA 策略：**
```yaml
# vpa-policies.yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: api-server-vpa
  namespace: production
# ... (see EXAMPLES.md for complete configuration)
```

**部署並監測 VPA：**
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

**預期：** VPA 提建議或自動更新資源請求。建議基於百分位使用模式（通常 P95）。Auto/Recreate 模式下 pods 以新請求重啟。HPA 與 VPA 無衝突（HPA 用於副本，VPA 用於每 pod 之資源）。

**失敗時：**
- 確 metrics-server 有足夠資料（VPA 需數日方能準確建議）
- 查 VPA 組件運行：`kubectl get pods -n kube-system | grep vpa`
- 覽 VPA admission controller 日誌：`kubectl logs -n kube-system -l app=vpa-admission-controller`
- 驗 webhook 已註冊：`kubectl get mutatingwebhookconfigurations vpa-webhook-config`
- 同指標（CPU/記憶體）勿同用 VPA 與 HPA——致衝突
- 始於 "Off" 模式覽建議，後再啟自動更新

### 步驟五：利用 Spot/Preemptible 實例

配置工作負載排程於成本效益高之 spot 實例。

**建附 spot 實例之節點池：**
```yaml
# For AWS (via Karpenter)
apiVersion: karpenter.sh/v1alpha5
kind: Provisioner
metadata:
  name: spot-provisioner
spec:
# ... (see EXAMPLES.md for complete configuration)
```

**為 spot 實例配置工作負載：**
```yaml
# spot-workload.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: batch-processor
  namespace: production
# ... (see EXAMPLES.md for complete configuration)
```

**部署並監測 spot 使用：**
```bash
kubectl apply -f spot-workload.yaml

# Monitor spot node allocation
kubectl get nodes -l node-type=spot

# Check workload distribution
# ... (see EXAMPLES.md for complete configuration)
```

**預期：** 工作負載順利排於 spot 節點。顯著減成本（通常 60-90% vs on-demand）。Spot 中斷之優雅處理，附 pod 重排。監測示 spot 中斷率與成功恢復。

**失敗時：**
- 驗你之區/區可用 spot 實例
- 查節點標籤與污點與工作負載容忍相符
- 覽 Karpenter 日誌：`kubectl logs -n karpenter -l app.kubernetes.io/name=karpenter`
- 確工作負載無狀態或對中斷有妥當之狀態管理
- 測中斷處理：手動 cordon 並 drain spot 節點
- 監測中斷率——若過高，考備援 on-demand 節點

### 步驟六：實施資源配額與預算告警

設硬上限與告警以管控成本。

**建資源配額：**
```yaml
# resource-quotas.yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: production-quota
  namespace: production
# ... (see EXAMPLES.md for complete configuration)
```

**配置預算告警：**
```yaml
# kubecost-budget-alerts.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: budget-alerts
  namespace: kubecost
# ... (see EXAMPLES.md for complete configuration)
```

施與監測：
```bash
kubectl apply -f resource-quotas.yaml
kubectl apply -f kubecost-budget-alerts.yaml

# Check quota usage
kubectl get resourcequota -n production
kubectl describe resourcequota production-quota -n production
# ... (see EXAMPLES.md for complete configuration)
```

**預期：** 資源配額按命名空間執行限制。配額逾時 pod 創建被擋。閾值逾時預算告警觸發。成本驟增偵測運作。定期報告送至利害關係人。

**失敗時：**
- 驗 ResourceQuota 與 LimitRange 已正確施：`kubectl get resourcequota,limitrange -A`
- 查因配額而失敗之 pods：`kubectl get events -n production | grep quota`
- 覽 Kubecost 告警配置：`kubectl logs -n kubecost -l app=cost-analyzer | grep alert`
- 確 Prometheus 有 Kubecost 指標：`curl http://prometheus:9090/api/v1/query?query=kubecost_monthly_cost`
- 測告警路由：驗 email/Slack webhook 配置

## 驗證

- [ ] Kubecost 或 OpenCost 已部署，顯準確之成本資料
- [ ] 雲端供應商計費整合運作（成本與實際帳單相符）
- [ ] 資源使用率分析辨識過度配置之工作負載
- [ ] HPA 依負載縮放 pods（已負載測驗證）
- [ ] VPA 提建議或自動調整資源請求
- [ ] Spot 實例優雅處理中斷
- [ ] 資源配額按命名空間執行限制
- [ ] 閾值逾時預算告警觸發
- [ ] 月度成本下降趨勢或保持於預算內
- [ ] Showback 報告已為團隊/專案產生
- [ ] 成本優化未致性能下降
- [ ] 文件已以優化實踐更新

## 常見陷阱

- **激進右尺寸**：勿即施 VPA 建議。始於 "Off" 模式，覽建議一週，再漸施。驟變致 OOMKill 或 CPU 限流。

- **HPA + VPA 衝突**：同指標（CPU/記憶體）勿同用 HPA 與 VPA。HPA 用於水平縮放，VPA 用於每 pod 資源調，或 HPA 於自定指標 + VPA 於資源。

- **Spot 無容錯**：但於容錯、無狀態工作負載運於 spot。永勿資料庫、有狀態服務或單副本關鍵服務。恆用 PodDisruptionBudgets。

- **監測期不足**：成本優化決策需歷史資料。變前等至少 7 日，VPA 建議 30 日，趨勢分析 90 日。

- **忽略爆發需求**：依平均使用設限過低致流量驟增時限流。容量規劃用 P95 或 P99 百分位，非平均。

- **網路出站成本**：計算成本於 Kubecost 中可見，然出站（資料傳輸）可觀。監測跨 AZ 流量，用拓樸感知路由，將資料傳輸成本納入架構考量。

- **儲存被忽**：PersistentVolume 成本常被遺。稽核未用之 PVC，右尺寸卷，用卷擴展而非過度配置，實施 PV 清理策略。

- **配額過嚴**：配額過低擋合理增長。月度覽配額使用，依實際需求調，執行前向團隊溝通限制。

- **錯指標下之假節省**：但用 CPU/記憶體為唯一優化指標漏 I/O、網路、儲存成本。考總擁有成本，非但計算。

- **信任前 chargeback**：團隊了解並信任成本資料前實施 chargeback 致摩擦。始於 showback（資訊性），建成本意識文化，後移至 chargeback。

## 相關技能

- `deploy-to-kubernetes` - 應用部署附適當資源請求
- `setup-prometheus-monitoring` - 為成本指標之監測基礎設施
- `plan-capacity` - 依成本與性能之容量規劃
- `setup-local-kubernetes` - 本地開發以避雲端成本
- `write-helm-chart` - 範本化資源請求與限制
- `implement-gitops-workflow` - GitOps 為成本優化之配置
