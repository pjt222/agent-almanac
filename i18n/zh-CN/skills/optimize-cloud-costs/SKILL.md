---
name: optimize-cloud-costs
description: >
  使用 Kubecost 等工具为 Kubernetes 工作负载实施云成本优化策略，
  包括可见性分析、资源规格调整建议、水平和垂直 Pod 自动扩缩容、
  Spot/可抢占实例和资源配额。涵盖成本分配、分摊报告和持续优化
  实践。适用于云成本增长与业务价值不匹配、资源请求与实际使用
  不一致、手动扩缩容导致过度配置，或需要为内部成本问责实施
  分摊计费的场景。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: devops
  complexity: intermediate
  language: multi
  tags: cost-optimization, kubecost, hpa, vpa, spot-instances, resource-management, kubernetes
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: "2026-03-16"
---

# 优化云成本

为 Kubernetes 集群实施全面的成本优化策略，降低云计算支出。

## 适用场景

- 云基础设施成本增长但对应业务价值未同步增加
- 需要按团队、应用或环境了解成本分配情况
- 资源请求/限制与实际使用模式不一致
- 手动扩缩容导致过度配置和资源浪费
- 希望利用 Spot/可抢占实例处理非关键工作负载
- 需要为内部成本分配实施分摊展示或分摊计费
- 希望建立具有成本意识和问责制的 FinOps 文化

## 输入

- **必填**：运行工作负载的 Kubernetes 集群
- **必填**：云提供商账单 API 访问权限
- **必填**：用于资源指标的 Metrics Server 或 Prometheus
- **可选**：用于趋势分析的历史使用数据
- **可选**：成本分配需求（按命名空间、标签、团队）
- **可选**：性能约束的服务级别目标（SLO）
- **可选**：预算限制或成本削减目标

## 步骤

> 完整配置文件和模板请参阅[扩展示例](references/EXAMPLES.md)。


### 第 1 步：部署成本可见性工具

安装 Kubecost 或 OpenCost 进行成本监控和分配。

**安装 Kubecost：**
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

**配置云提供商集成：**
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

应用云集成：
```bash
kubectl apply -f kubecost-cloud-integration.yaml

# Verify cloud costs are being imported
kubectl logs -n kubecost -l app=cost-analyzer -c cost-model --tail=100 | grep -i "cloud"

# Check Kubecost API for cost data
kubectl port-forward -n kubecost svc/kubecost-cost-analyzer 9090:9090 &
curl http://localhost:9090/model/allocation\?window\=7d | jq .
```

**预期结果：** Kubecost pod 成功运行。UI 可访问并显示按命名空间、Deployment、Pod 的成本分解。云提供商成本开始导入（初次同步可能需要 24-48 小时）。API 返回分配数据。

**失败处理：**
- 检查 Prometheus 是否运行且可访问：`kubectl get svc -n monitoring prometheus-server`
- 验证云凭证是否具有账单 API 访问权限
- 检查 cost-model 日志：`kubectl logs -n kubecost -l app=cost-analyzer -c cost-model`
- 确保 Metrics Server 或 Prometheus node-exporter 正在收集资源指标
- 检查阻止访问云账单 API 的网络策略

### 第 2 步：分析当前资源利用率

识别过度配置的资源和优化机会。

**查询资源利用率：**
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

**使用 Kubecost 建议：**
```bash
# Get right-sizing recommendations via API
curl "http://localhost:9090/model/savings/requestSizing?window=7d" | jq . > recommendations.json

# Extract top wasteful resources
jq '.data[] | select(.totalRecommendedSavings > 10) | {
  cluster: .clusterID,
# ... (see EXAMPLES.md for complete configuration)
```

**创建利用率仪表板：**
```yaml
# grafana-utilization-dashboard.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: utilization-dashboard
  namespace: monitoring
# ... (see EXAMPLES.md for complete configuration)
```

**预期结果：** 清晰了解当前资源请求与实际使用情况。识别出利用率低于 30% 的 pod（过度配置）。列出优化机会及预估节省金额。仪表板显示随时间的利用率趋势。

**失败处理：**
- 确保 Metrics Server 正在运行：`kubectl get deployment metrics-server -n kube-system`
- 检查 Prometheus 是否有 node-exporter 指标：`curl http://prometheus:9090/api/v1/query?query=node_cpu_seconds_total`
- 验证 pod 已运行足够长时间以获取有意义的数据（至少 24 小时）
- 检查指标收集中的间隙：检查 Prometheus 保留期和抓取间隔
- 对于 Kubecost，确保已收集至少 48 小时的数据

### 第 3 步：实现水平 Pod 自动扩缩容（HPA）

基于 CPU、内存或自定义指标配置自动扩缩容。

**创建基于 CPU 的 HPA：**
```yaml
# hpa-cpu.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-server-hpa
  namespace: production
# ... (see EXAMPLES.md for complete configuration)
```

**部署并验证 HPA：**
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

**预期结果：** HPA 已创建并显示当前/目标指标。负载下 pod 数量增加。负载减少时 pod 数量减少（在稳定窗口之后）。扩缩容事件已记录。无抖动（快速扩缩容循环）。

**失败处理：**
- 验证 Metrics Server 是否运行：`kubectl get apiservice v1beta1.metrics.k8s.io`
- 检查 Deployment 是否已设置资源请求（HPA 需要此项）
- 检查 HPA 事件：`kubectl describe hpa api-server-hpa -n production`
- 确保目标 Deployment 未达到最大副本数
- 对于自定义指标，验证指标适配器已安装和配置
- 检查 HPA 控制器日志：`kubectl logs -n kube-system -l app=kube-controller-manager | grep horizontal-pod-autoscaler`

### 第 4 步：配置垂直 Pod 自动扩缩容（VPA）

根据实际使用模式自动调整资源请求。

**安装 VPA：**
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

**创建 VPA 策略：**
```yaml
# vpa-policies.yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: api-server-vpa
  namespace: production
# ... (see EXAMPLES.md for complete configuration)
```

**部署并监控 VPA：**
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

**预期结果：** VPA 提供建议或自动更新资源请求。建议基于百分位使用模式（通常为 P95）。使用 Auto/Recreate 模式时，pod 以新请求值重启。HPA 和 VPA 之间无冲突（使用 HPA 管理副本数，VPA 管理每个 pod 的资源）。

**失败处理：**
- 确保 Metrics Server 有足够数据（VPA 需要几天时间获取准确建议）
- 检查 VPA 组件是否运行：`kubectl get pods -n kube-system | grep vpa`
- 检查 VPA 准入控制器日志：`kubectl logs -n kube-system -l app=vpa-admission-controller`
- 验证 Webhook 是否已注册：`kubectl get mutatingwebhookconfigurations vpa-webhook-config`
- 不要对同一指标（CPU/内存）同时使用 VPA 和 HPA — 会产生冲突
- 先使用 "Off" 模式检查建议，再启用自动更新

### 第 5 步：利用 Spot/可抢占实例

配置工作负载调度到成本效益高的 Spot 实例。

**创建 Spot 实例节点池：**
```yaml
# For AWS (via Karpenter)
apiVersion: karpenter.sh/v1alpha5
kind: Provisioner
metadata:
  name: spot-provisioner
spec:
# ... (see EXAMPLES.md for complete configuration)
```

**配置工作负载使用 Spot 实例：**
```yaml
# spot-workload.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: batch-processor
  namespace: production
# ... (see EXAMPLES.md for complete configuration)
```

**部署并监控 Spot 使用情况：**
```bash
kubectl apply -f spot-workload.yaml

# Monitor spot node allocation
kubectl get nodes -l node-type=spot

# Check workload distribution
# ... (see EXAMPLES.md for complete configuration)
```

**预期结果：** 工作负载成功调度到 Spot 节点。显著降低成本（通常比按需实例节省 60-90%）。优雅处理 Spot 中断并重新调度 pod。监控显示 Spot 中断率和成功恢复情况。

**失败处理：**
- 验证你的地区/可用区 Spot 实例是否可用
- 检查节点标签和污点是否与工作负载容忍度匹配
- 检查 Karpenter 日志：`kubectl logs -n karpenter -l app.kubernetes.io/name=karpenter`
- 确保工作负载是无状态的或有适当的状态管理以处理中断
- 测试中断处理：手动隔离并驱逐 Spot 节点
- 监控中断率 — 如果过高，考虑回退到按需节点

### 第 6 步：实现资源配额和预算告警

设置硬性限制和成本控制告警。

**创建资源配额：**
```yaml
# resource-quotas.yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: production-quota
  namespace: production
# ... (see EXAMPLES.md for complete configuration)
```

**配置预算告警：**
```yaml
# kubecost-budget-alerts.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: budget-alerts
  namespace: kubecost
# ... (see EXAMPLES.md for complete configuration)
```

应用并监控：
```bash
kubectl apply -f resource-quotas.yaml
kubectl apply -f kubecost-budget-alerts.yaml

# Check quota usage
kubectl get resourcequota -n production
kubectl describe resourcequota production-quota -n production
# ... (see EXAMPLES.md for complete configuration)
```

**预期结果：** 资源配额按命名空间强制执行限制。配额超出时阻止 pod 创建。预算阈值触发时发送告警。成本突增检测正常工作。定期向相关方发送报告。

**失败处理：**
- 验证 ResourceQuota 和 LimitRange 已正确应用：`kubectl get resourcequota,limitrange -A`
- 检查因配额失败的 pod：`kubectl get events -n production | grep quota`
- 检查 Kubecost 告警配置：`kubectl logs -n kubecost -l app=cost-analyzer | grep alert`
- 确保 Prometheus 有 Kubecost 指标：`curl http://prometheus:9090/api/v1/query?query=kubecost_monthly_cost`
- 测试告警路由：验证邮件/Slack Webhook 配置

## 验证清单

- [ ] Kubecost 或 OpenCost 已部署并显示准确的成本数据
- [ ] 云提供商账单集成正常工作（成本与实际账单匹配）
- [ ] 资源利用率分析识别出过度配置的工作负载
- [ ] HPA 根据负载扩缩 pod（通过负载测试验证）
- [ ] VPA 提供建议或自动调整资源请求
- [ ] Spot 实例优雅处理中断
- [ ] 资源配额按命名空间强制执行限制
- [ ] 超过阈值时预算告警触发
- [ ] 月度成本呈下降趋势或保持在预算内
- [ ] 为团队/项目生成分摊展示报告
- [ ] 成本优化未导致性能下降
- [ ] 文档已更新，记录优化实践

## 常见问题

- **激进的资源调整**：不要立即应用 VPA 建议。先使用 "Off" 模式，观察一周的建议，然后逐步应用。突然变更可能导致 OOMKill 或 CPU 限流。

- **HPA + VPA 冲突**：永远不要在同一指标（CPU/内存）上同时使用 HPA 和 VPA。使用 HPA 进行水平扩缩，VPA 进行每个 pod 的资源调整，或 HPA 使用自定义指标 + VPA 管理资源。

- **Spot 无容错能力**：只在 Spot 上运行容错、无状态的工作负载。永远不要运行数据库、有状态服务或单副本关键服务。始终使用 PodDisruptionBudget。

- **监控周期不足**：成本优化决策需要历史数据。至少等待 7 天再做变更，VPA 建议需要 30 天，趋势分析需要 90 天。

- **忽略突发需求**：基于平均使用率设置过低的限制会在流量峰值期间导致限流。使用 P95 或 P99 百分位而非平均值进行容量规划。

- **网络出口成本**：Kubecost 中可见计算成本，但出口（数据传输）可能很显著。监控跨可用区流量，使用拓扑感知路由，在架构中考虑数据传输成本。

- **忽视存储成本**：PersistentVolume 成本经常被遗忘。审计未使用的 PVC，合理调整卷大小，使用卷扩展而非过度配置，实施 PV 清理策略。

- **配额过于严格**：设置过低的配额会阻碍合理增长。每月审查配额使用情况，根据实际需求调整，在执行前向团队传达限制。

- **错误指标导致的虚假节省**：仅使用 CPU/内存作为优化指标会忽略 I/O、网络和存储成本。考虑总拥有成本，而非仅计算成本。

- **信任建立前实施计费**：在团队理解和信任成本数据之前实施分摊计费会产生摩擦。从分摊展示（信息性）开始，建立成本意识文化，然后再推进分摊计费。

## 相关技能

- `deploy-to-kubernetes` - 带适当资源请求的应用部署
- `setup-prometheus-monitoring` - 成本指标的监控基础设施
- `plan-capacity` - 基于成本和性能的容量规划
- `setup-local-kubernetes` - 本地开发避免云成本
- `write-helm-chart` - 资源请求和限制的模板化
- `implement-gitops-workflow` - 成本优化配置的 GitOps
