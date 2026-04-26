---
name: optimize-cloud-costs
locale: caveman-ultra
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

# Optimize Cloud Costs

Cut k8s cloud spend.

## Use When

- Costs grow, no biz value match
- Need cost allocation by team/app/env
- Requests/limits ≠ actual usage
- Manual scaling → over-provision waste
- Want spot/preemptible for non-critical
- Showback / chargeback for internal allocation
- Build FinOps culture

## In

- **Required**: K8s cluster w/ workloads
- **Required**: Cloud billing API access
- **Required**: Metrics server / Prometheus
- **Optional**: Historical usage
- **Optional**: Cost allocation reqs (ns, label, team)
- **Optional**: SLOs (perf constraints)
- **Optional**: Budget limits / reduction targets

## Do

> See [Extended Examples](references/EXAMPLES.md) for complete configuration files and templates.

### Step 1: Deploy cost visibility

Kubecost / OpenCost.

**Install Kubecost:**
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

**Cloud provider integration:**
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

Apply:
```bash
kubectl apply -f kubecost-cloud-integration.yaml

# Verify cloud costs are being imported
kubectl logs -n kubecost -l app=cost-analyzer -c cost-model --tail=100 | grep -i "cloud"

# Check Kubecost API for cost data
kubectl port-forward -n kubecost svc/kubecost-cost-analyzer 9090:9090 &
curl http://localhost:9090/model/allocation\?window\=7d | jq .
```

→ Kubecost pods running. UI shows breakdown by ns/deployment/pod. Cloud costs importing (24-48h initial sync). API returns allocation data.

If err:
- Prometheus running? `kubectl get svc -n monitoring prometheus-server`
- Cloud creds have billing API access?
- `kubectl logs -n kubecost -l app=cost-analyzer -c cost-model`
- metrics-server / node-exporter collecting?
- Network policies blocking billing APIs?

### Step 2: Analyze utilization

ID over-provisioned + opportunities.

**Query utilization:**
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

**Kubecost recommendations:**
```bash
# Get right-sizing recommendations via API
curl "http://localhost:9090/model/savings/requestSizing?window=7d" | jq . > recommendations.json

# Extract top wasteful resources
jq '.data[] | select(.totalRecommendedSavings > 10) | {
  cluster: .clusterID,
# ... (see EXAMPLES.md for complete configuration)
```

**Util dashboard:**
```yaml
# grafana-utilization-dashboard.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: utilization-dashboard
  namespace: monitoring
# ... (see EXAMPLES.md for complete configuration)
```

→ Clear view requests vs actual. ID pods <30% util (over-provision). List opportunities + savings est. Trend dashboard.

If err:
- metrics-server up? `kubectl get deployment metrics-server -n kube-system`
- Prom has node-exporter? `curl http://prometheus:9090/api/v1/query?query=node_cpu_seconds_total`
- Pods running ≥24h for meaningful data
- Gaps in collection: review Prom retention + scrape intervals
- Kubecost ≥48h data collected

### Step 3: HPA

Auto-scale on CPU/mem/custom metrics.

**HPA CPU-based:**
```yaml
# hpa-cpu.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-server-hpa
  namespace: production
# ... (see EXAMPLES.md for complete configuration)
```

**Deploy + verify:**
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

→ HPA shows current/target. Scales up under load, down after stabilization. Events logged. No thrashing.

If err:
- metrics-server? `kubectl get apiservice v1beta1.metrics.k8s.io`
- Deployment has resource requests? (HPA requires)
- `kubectl describe hpa api-server-hpa -n production`
- Not at max replicas?
- Custom metrics → adapter installed + configured
- `kubectl logs -n kube-system -l app=kube-controller-manager | grep horizontal-pod-autoscaler`

### Step 4: VPA

Auto-adjust requests by usage patterns.

**Install:**
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

**VPA policies:**
```yaml
# vpa-policies.yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: api-server-vpa
  namespace: production
# ... (see EXAMPLES.md for complete configuration)
```

**Deploy + monitor:**
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

→ VPA gives recommendations or auto-updates requests. Recs based on percentile (typ P95). Pods restart in Auto/Recreate mode. No HPA-VPA conflict (HPA→replicas, VPA→per-pod).

If err:
- metrics-server has enough data (VPA needs days for accurate)
- VPA pods running? `kubectl get pods -n kube-system | grep vpa`
- `kubectl logs -n kube-system -l app=vpa-admission-controller`
- Webhook registered? `kubectl get mutatingwebhookconfigurations vpa-webhook-config`
- Don't VPA+HPA on same metric (CPU/mem) — conflicts
- Start "Off" mode → review recs before enabling auto

### Step 5: Spot/preemptible

Cost-effective spot scheduling.

**Spot node pools:**
```yaml
# For AWS (via Karpenter)
apiVersion: karpenter.sh/v1alpha5
kind: Provisioner
metadata:
  name: spot-provisioner
spec:
# ... (see EXAMPLES.md for complete configuration)
```

**Workloads for spot:**
```yaml
# spot-workload.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: batch-processor
  namespace: production
# ... (see EXAMPLES.md for complete configuration)
```

**Deploy + monitor:**
```bash
kubectl apply -f spot-workload.yaml

# Monitor spot node allocation
kubectl get nodes -l node-type=spot

# Check workload distribution
# ... (see EXAMPLES.md for complete configuration)
```

→ Workloads on spot. Big savings (typ 60-90% vs on-demand). Graceful interruptions w/ pod reschedule. Monitor interruption rate + recovery.

If err:
- Spot avail in region/zones?
- Node labels + taints match tolerations
- `kubectl logs -n karpenter -l app.kubernetes.io/name=karpenter`
- Workloads stateless or proper state mgmt
- Test interrupt: cordon + drain spot node
- High interruption rate → fallback to on-demand

### Step 6: Quotas + budget alerts

Hard limits + cost control.

**Resource quotas:**
```yaml
# resource-quotas.yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: production-quota
  namespace: production
# ... (see EXAMPLES.md for complete configuration)
```

**Budget alerts:**
```yaml
# kubecost-budget-alerts.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: budget-alerts
  namespace: kubecost
# ... (see EXAMPLES.md for complete configuration)
```

Apply + monitor:
```bash
kubectl apply -f resource-quotas.yaml
kubectl apply -f kubecost-budget-alerts.yaml

# Check quota usage
kubectl get resourcequota -n production
kubectl describe resourcequota production-quota -n production
# ... (see EXAMPLES.md for complete configuration)
```

→ Quotas enforce limits per ns. Pod creation blocked over quota. Alerts fire on threshold breach. Spike detect works. Reports to stakeholders.

If err:
- ResourceQuota + LimitRange applied? `kubectl get resourcequota,limitrange -A`
- Pods failing for quota? `kubectl get events -n production | grep quota`
- `kubectl logs -n kubecost -l app=cost-analyzer | grep alert`
- Prom has Kubecost metrics? `curl http://prometheus:9090/api/v1/query?query=kubecost_monthly_cost`
- Test alert routing: email/Slack webhook

## Check

- [ ] Kubecost/OpenCost deployed + accurate cost data
- [ ] Cloud billing integration works (matches actual bills)
- [ ] Util analysis IDs over-provisioned
- [ ] HPA scales pods on load (load-tested)
- [ ] VPA gives recs or auto-adjusts
- [ ] Spot handles interrupts gracefully
- [ ] Quotas enforce per-ns
- [ ] Budget alerts fire on threshold
- [ ] Monthly cost trending down or in budget
- [ ] Showback reports for teams/projects
- [ ] No perf degradation
- [ ] Docs updated

## Traps

- **Aggressive Right-Sizing**: Don't immediately apply VPA recs. Start "Off", review week, gradual apply. Sudden → OOMKills / CPU throttle
- **HPA + VPA Conflict**: Never same metric (CPU/mem). HPA→horizontal, VPA→per-pod, or HPA→custom + VPA→resources
- **Spot Without Fault Tolerance**: Only fault-tolerant + stateless on spot. Never DBs, stateful, single-replica critical. Always PodDisruptionBudgets
- **Insufficient Monitoring Period**: Need historical data. ≥7d before changes, 30d for VPA recs, 90d for trends
- **Ignoring Burst**: Limits too low on avg → throttle on spikes. Use P95/P99, not avg, for capacity
- **Network Egress Costs**: Compute visible in Kubecost, egress can be huge. Monitor cross-AZ, topology-aware routing, factor data transfer in arch
- **Storage Overlooked**: PV costs forgotten. Audit unused PVCs, right-size, expand vs over-provision, PV cleanup policies
- **Quota Too Restrictive**: Too low → blocks growth. Review monthly, adjust, communicate before enforce
- **False Savings from Wrong Metrics**: CPU/mem alone misses I/O, network, storage. TCO not just compute
- **Chargeback Before Trust**: Chargeback before trust → friction. Showback first → cost awareness culture → then chargeback

## →

- `deploy-to-kubernetes` — app deployment w/ proper requests
- `setup-prometheus-monitoring` — monitoring infra for cost metrics
- `plan-capacity` — capacity planning (cost+perf)
- `setup-local-kubernetes` — local dev avoids cloud
- `write-helm-chart` — template requests + limits
- `implement-gitops-workflow` — GitOps for cost-optimized configs
