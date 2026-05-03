---
name: setup-service-mesh
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Deploy and configure a service mesh (Istio or Linkerd) to enable secure service-to-service
  communication, traffic management, observability, and policy enforcement in Kubernetes clusters.
  Covers installation, mTLS configuration, traffic routing, circuit breaking, and integration
  with monitoring tools. Use when microservices need encrypted service-to-service communication,
  fine-grained traffic control for canary or A/B deployments, observability across all service
  interactions without application changes, or consistent circuit breaking and retry policies.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: devops
  complexity: advanced
  language: multi
  tags: service-mesh, istio, linkerd, mtls, traffic-management, observability, kubernetes
---

# 設置服務網格

部署並配置服務網格以提供安全之服務間通訊與進階流量管理。

## 適用時機

- 微服務架構需加密之服務間通訊
- 需細粒度之流量控制（金絲雀部署、A/B 測試、流量分割）
- 需跨所有服務互動之可觀察性而無需應用變更
- 於基礎設施層強制安全策略（mTLS、授權）
- 跨服務一致地實作斷路、重試與超時
- 需分散式追蹤與服務依賴圖

## 輸入

- **必要**：具管理員存取之 Kubernetes 集群
- **必要**：服務網格之選擇（Istio 或 Linkerd）
- **必要**：欲啟用服務網格之命名空間
- **選擇性**：監控堆疊（Prometheus、Grafana、Jaeger）
- **選擇性**：自訂流量管理要求
- **選擇性**：mTLS 之憑證機構配置

## 步驟

> 詳見 [Extended Examples](references/EXAMPLES.md) 取得完整配置文件與範本。

### 步驟一：安裝服務網格控制平面

選擇並安裝服務網格控制平面。

**對 Istio：**
```bash
curl -L https://istio.io/downloadIstio | ISTIO_VERSION=1.20.2 sh -
istioctl install --set profile=production -y
kubectl get pods -n istio-system
```

**對 Linkerd：**
```bash
curl -sL https://run.linkerd.io/install | sh
linkerd check --pre
linkerd install --ha | kubectl apply -f -
linkerd check
```

建立含資源限制與追蹤之服務網格配置：
```yaml
# service-mesh-config.yaml (abbreviated)
spec:
  profile: production
  meshConfig:
    enableTracing: true
  components:
    pilot:
      k8s:
        resources: { requests: { cpu: 500m, memory: 2Gi } }
# See EXAMPLES.md Step 1 for complete configuration
```

**預期：** 控制平面 pod 於 istio-system（Istio）或 linkerd（Linkerd）命名空間執行。`istioctl version` 或 `linkerd version` 顯示客戶端與伺服器版本相符。

**失敗時：**
- 檢查集群有足夠資源（生產至少 4 CPU 核、8GB RAM）
- 驗證 Kubernetes 版本相容性（查網格文件）
- 審視日誌：`kubectl logs -n istio-system -l app=istiod` 或 `kubectl logs -n linkerd -l linkerd.io/control-plane-component=controller`
- 檢查衝突之 CRD：`kubectl get crd | grep istio` 或 `kubectl get crd | grep linkerd`

### 步驟二：啟用自動 sidecar 注入

為自動 sidecar 代理注入配置命名空間。

**對 Istio：**
```bash
# Label namespace for automatic injection
kubectl label namespace default istio-injection=enabled
kubectl get namespace -L istio-injection
```

**對 Linkerd：**
```bash
# Annotate namespace for injection
kubectl annotate namespace default linkerd.io/inject=enabled
```

以樣本部署測試 sidecar 注入：
```yaml
# test-deployment.yaml (abbreviated)
apiVersion: apps/v1
kind: Deployment
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: app
        image: nginx:alpine
# See EXAMPLES.md Step 2 for complete test deployment
```

施行並驗證：
```bash
kubectl apply -f test-deployment.yaml
kubectl get pods -n default
# Expect 2/2 containers (app + proxy)
```

**預期：** 新 pod 顯示 2/2 容器（應用 + sidecar 代理）。Describe 輸出顯示 istio-proxy 或 linkerd-proxy 容器。日誌顯示代理成功啟動。

**失敗時：**
- 檢查命名空間標籤/註解：`kubectl get ns default -o yaml`
- 驗證 mutating webhook 啟用：`kubectl get mutatingwebhookconfiguration`
- 審視注入日誌：`kubectl logs -n istio-system -l app=sidecar-injector`（Istio）
- 手動注入以測試：`kubectl get deploy test-app -o yaml | istioctl kube-inject -f - | kubectl apply -f -`

### 步驟三：配置 mTLS 策略

啟用相互 TLS 以提供安全之服務間通訊。

**對 Istio：**
```yaml
# mtls-policy.yaml (abbreviated)
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: istio-system
spec:
  mtls:
    mode: STRICT
# See EXAMPLES.md Step 3 for per-namespace and permissive mode examples
```

**對 Linkerd：**
```bash
# Linkerd enforces mTLS by default for meshed pods
linkerd viz tap deploy/test-app -n default
# Check for 🔒 (lock) symbol
```

施行並驗證：
```bash
kubectl apply -f mtls-policy.yaml
# Istio: verify mTLS status
istioctl authn tls-check $(kubectl get pod -n default -l app=test-app -o jsonpath='{.items[0].metadata.name}') -n default
```

**預期：** 已網格化服務間之所有連線顯示 mTLS 啟用。Istio `tls-check` 顯示 STATUS 為「OK」。Linkerd `tap` 輸出顯示所有連線之 🔒。服務日誌無 TLS 錯誤。

**失敗時：**
- 檢查憑證簽發：`kubectl get certificates -A`（cert-manager）
- 驗證 CA 健康：`kubectl logs -n istio-system -l app=istiod | grep -i cert`
- 先以 PERMISSIVE 模式測試，再轉至 STRICT
- 檢查無 sidecar 之服務：`kubectl get pods --all-namespaces -o json | jq '.items[] | select(.spec.containers | length == 1) | .metadata.name'`

### 步驟四：實作流量管理規則

配置智慧之流量路由、重試與斷路。

建立流量管理策略：
```yaml
# traffic-management.yaml (abbreviated)
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
spec:
  http:
  - match:
    - uri: { prefix: /api/v2 }
    route:
    - destination: { host: api-service, subset: v2 }
      weight: 10
    - destination: { host: api-service, subset: v1 }
      weight: 90
    retries: { attempts: 3, perTryTimeout: 2s }
# See EXAMPLES.md Step 4 for complete routing, circuit breaker, and gateway configs
```

**對 Linkerd 流量分割：**
```yaml
apiVersion: split.smi-spec.io/v1alpha2
kind: TrafficSplit
spec:
  service: api-service
  backends:
  - service: api-service-v1
    weight: 900
  - service: api-service-v2
    weight: 100
```

施行並測試：
```bash
kubectl apply -f traffic-management.yaml
# Test traffic distribution
for i in {1..100}; do curl -s http://api.example.com/api/v2 | grep version; done | sort | uniq -c
# Monitor: istioctl dashboard kiali or linkerd viz dashboard
```

**預期：** 流量依定義權重分割。連續錯誤後斷路觸發。短暫失敗時發生重試。Kiali/Linkerd 儀表板顯示流量視覺化。

**失敗時：**
- 驗證目的主機解析：`kubectl get svc -n production`
- 檢查子集標籤符合 pod 標籤：`kubectl get pods -n production --show-labels`
- 審視 pilot 日誌：`kubectl logs -n istio-system -l app=istiod`
- 先無斷路測試，再漸進加入
- 用 `istioctl analyze` 檢查配置：`istioctl analyze -n production`

### 步驟五：整合可觀察性堆疊

將服務網格遙測連至監控與追蹤系統。

**安裝可觀察性附加元件：**
```bash
# Istio: Prometheus, Grafana, Kiali, Jaeger
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/prometheus.yaml
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/grafana.yaml
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/kiali.yaml
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/jaeger.yaml

# Linkerd
linkerd viz install | kubectl apply -f -
linkerd jaeger install | kubectl apply -f -
```

配置自訂指標與儀表板：
```yaml
# service-monitor.yaml (abbreviated)
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: istio-mesh-metrics
spec:
  selector: { matchLabels: { app: istiod } }
  endpoints:
  - port: http-monitoring
    interval: 30s
# See EXAMPLES.md Step 5 for Grafana dashboards and telemetry config
```

存取儀表板：
```bash
istioctl dashboard grafana  # or: linkerd viz dashboard
istioctl dashboard kiali
istioctl dashboard jaeger
```

**預期：** 儀表板顯示服務拓撲、請求速率、延遲百分位、錯誤率。Jaeger 中分散式追蹤可用。Prometheus 成功採集網格指標。自訂指標出現於查詢中。

**失敗時：**
- 驗證 Prometheus 採集：`kubectl get servicemonitor -A`
- 檢查附加元件 pod 執行：`kubectl get pods -n istio-system`
- 審視遙測配置：`istioctl proxy-config log <pod-name> -n <namespace>`
- 驗證網格配置已啟用遙測：`kubectl get configmap istio -n istio-system -o yaml | grep -A 5 enableTracing`
- 若 port-forward 失敗，檢查連接埠衝突

### 步驟六：驗證並監控網格健康

執行全面健康檢查並設置持續監控。

```bash
# Istio validation
istioctl analyze --all-namespaces
istioctl verify-install
istioctl proxy-status

# Linkerd validation
linkerd check
linkerd viz check
linkerd diagnostics policy

# Check proxy sync status
kubectl get pods -n production -o json | \
  jq '.items[] | {name: .metadata.name, proxy: .status.containerStatuses[] | select(.name=="istio-proxy").ready}'

# Monitor control plane health
kubectl get pods -n istio-system -w
kubectl top pods -n istio-system
```

建立健康檢查腳本與警報：
```bash
#!/bin/bash
# mesh-health-check.sh (abbreviated)
echo "=== Service Mesh Health Check ==="
kubectl get pods -n istio-system
istioctl analyze --all-namespaces
# See EXAMPLES.md Step 6 for complete health check script and alert configs
```

**預期：** 所有分析檢查通過無警告。Proxy-status 顯示所有代理已同步。mTLS 檢查確認加密。指標顯示流量流動。控制平面 pod 穩定且資源用量低。

**失敗時：**
- 處理 `istioctl analyze` 輸出之具體問題
- 檢查個別 pod 之代理日誌：`kubectl logs <pod> -c istio-proxy -n <namespace>`
- 驗證網路策略未阻塞網格流量
- 審視控制平面之錯誤日誌：`kubectl logs -n istio-system deploy/istiod --tail=100`
- 重啟有問題之代理：`kubectl rollout restart deploy/<deployment> -n <namespace>`

## 驗證

- [ ] 控制平面 pod 執行且健康（istiod/linkerd-controller）
- [ ] Sidecar 代理已注入所有應用 pod（2/2 容器）
- [ ] mTLS 啟用且運作（以 tls-check/tap 驗證）
- [ ] 流量管理規則正確路由請求（以 curl 測試驗證）
- [ ] 反覆失敗時斷路觸發（以故障注入測試）
- [ ] 可觀察性儀表板顯示指標（Grafana/Kiali/Linkerd Viz）
- [ ] 樣本請求之分散式追蹤於 Jaeger 中捕捉
- [ ] istioctl analyze/linkerd check 無配置警告
- [ ] Proxy 同步狀態顯示所有代理已同步
- [ ] 服務間通訊已加密（於日誌/儀表板驗證）

## 常見陷阱

- **資源耗盡**：服務網格為每 pod 之 sidecar 加 100-200MB 記憶體。確保集群有足夠容量。於注入配置中設適當資源限制。

- **配置衝突**：對同主機之多個 VirtualService 引發未定義行為。改用單一 VirtualService 含多個匹配條件。

- **憑證過期**：mTLS 憑證自動輪換但 CA 根必須管理。以 `kubectl get certificate -A` 監控憑證過期並設警報。

- **Sidecar 未注入**：命名空間標籤前建立之 pod 無 sidecar。須重建：`kubectl rollout restart deploy/<name> -n <namespace>`。

- **DNS 解析問題**：服務網格攔截 DNS。對跨命名空間呼叫用完全限定名（service.namespace.svc.cluster.local）。

- **連接埠命名要求**：Istio 要求遵循協議-名模式之命名連接埠（如 http-web、tcp-db）。未命名連接埠預設為 TCP 直通。

- **需漸進推出**：勿於生產立即啟用 STRICT mTLS。遷移期間用 PERMISSIVE 模式、驗證所有服務已網格化、再切至 STRICT。

- **可觀察性開銷**：100% 追蹤取樣引發效能問題。生產用 1-10%：網格配置中 `sampling: 1.0`。

- **Gateway 對 VirtualService 混淆**：Gateway 配置入口（負載均衡器），VirtualService 配置路由。外部流量兩者皆需。

- **版本相容性**：確保網格版本與 Kubernetes 版本相容。Istio 支援 n-1 minor 版本，Linkerd 通常支援最後 3 Kubernetes 版本。

## 相關技能

- `configure-ingress-networking` - Gateway 配置補足網格入口
- `deploy-to-kubernetes` - 與服務網格運作之應用部署模式
- `setup-prometheus-monitoring` - 網格指標之 Prometheus 整合
- `manage-kubernetes-secrets` - mTLS 之憑證管理
- `enforce-policy-as-code` - 與網格授權並行之 OPA 策略
