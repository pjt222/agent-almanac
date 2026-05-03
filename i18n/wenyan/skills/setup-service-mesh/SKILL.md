---
name: setup-service-mesh
locale: wenyan
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

# 設服之網

展而配服之網（Istio 或 Linkerd）以為服間之安通與高之流管。

## 用時

- 微服之構需服間加密之通乃用
- 需細之流控（canary、A/B、流分）乃用
- 需跨諸服之可察而不改應乃用
- 於基設級強安策（mTLS、授權）乃用
- 跨服一致施斷路、重試、超時乃用
- 需分布之追與服依繪乃用

## 入

- **必要**：附管權之 Kubernetes 集
- **必要**：服網之擇（Istio 或 Linkerd）
- **必要**：欲啟服網之命名空
- **可選**：監之棧（Prometheus、Grafana、Jaeger）
- **可選**：自定流管之求
- **可選**：mTLS 之證書權威之配

## 法

> 詳備之配與模板，參 [Extended Examples](references/EXAMPLES.md)。

### 第一步：裝服網之控面

擇而裝服網之控面。

**Istio：**

```bash
curl -L https://istio.io/downloadIstio | ISTIO_VERSION=1.20.2 sh -
istioctl install --set profile=production -y
kubectl get pods -n istio-system
```

**Linkerd：**

```bash
curl -sL https://run.linkerd.io/install | sh
linkerd check --pre
linkerd install --ha | kubectl apply -f -
linkerd check
```

立服網之配附資源限與追：

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

得：控面之 pod 行於 istio-system（Istio）或 linkerd（Linkerd）命名空。`istioctl version` 或 `linkerd version` 示客與服版合。

敗則：

- 察集有足之資源（生產至少 4 CPU 核、8GB RAM）
- 驗 Kubernetes 版兼（察網之文檔）
- 察日：`kubectl logs -n istio-system -l app=istiod` 或 `kubectl logs -n linkerd -l linkerd.io/control-plane-component=controller`
- 察衝之 CRD：`kubectl get crd | grep istio` 或 `kubectl get crd | grep linkerd`

### 第二步：啟自動之邊車注入

配命名空為自動之邊車代理之注。

**Istio：**

```bash
# Label namespace for automatic injection
kubectl label namespace default istio-injection=enabled
kubectl get namespace -L istio-injection
```

**Linkerd：**

```bash
# Annotate namespace for injection
kubectl annotate namespace default linkerd.io/inject=enabled
```

以樣展試邊車注：

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

施而驗：

```bash
kubectl apply -f test-deployment.yaml
kubectl get pods -n default
# Expect 2/2 containers (app + proxy)
```

得：新 pod 示 2/2 容（應 + 邊車）。describe 之出示 istio-proxy 或 linkerd-proxy 容。日示代理啟成。

敗則：

- 察命名空之標/注：`kubectl get ns default -o yaml`
- 驗變 webhook 活：`kubectl get mutatingwebhookconfiguration`
- 察注日：`kubectl logs -n istio-system -l app=sidecar-injector`（Istio）
- 人手注以試：`kubectl get deploy test-app -o yaml | istioctl kube-inject -f - | kubectl apply -f -`

### 第三步：配 mTLS 之策

啟雙向 TLS 為服間之安通。

**Istio：**

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

**Linkerd：**

```bash
# Linkerd enforces mTLS by default for meshed pods
linkerd viz tap deploy/test-app -n default
# Check for 🔒 (lock) symbol
```

施而驗：

```bash
kubectl apply -f mtls-policy.yaml
# Istio: verify mTLS status
istioctl authn tls-check $(kubectl get pod -n default -l app=test-app -o jsonpath='{.items[0].metadata.name}') -n default
```

得：諸網之服間連示 mTLS 啟。Istio `tls-check` 示 STATUS 為「OK」。Linkerd `tap` 出示 🔒 於諸連。服日無 TLS 之誤。

敗則：

- 察證書之發：`kubectl get certificates -A`（cert-manager）
- 驗 CA 健：`kubectl logs -n istio-system -l app=istiod | grep -i cert`
- 先以 PERMISSIVE 模試，後轉至 STRICT
- 察無邊車之服：`kubectl get pods --all-namespaces -o json | jq '.items[] | select(.spec.containers | length == 1) | .metadata.name'`

### 第四步：施流管之則

配智之流路、重試、斷路。

立流管之策：

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

**Linkerd 之流分：**

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

施而試：

```bash
kubectl apply -f traffic-management.yaml
# Test traffic distribution
for i in {1..100}; do curl -s http://api.example.com/api/v2 | grep version; done | sort | uniq -c
# Monitor: istioctl dashboard kiali or linkerd viz dashboard
```

得：流依所定之權分。斷路於連誤後跳。重試於暫敗發。Kiali/Linkerd 儀表示流之繪。

敗則：

- 驗目主解：`kubectl get svc -n production`
- 察子集標合 pod 標：`kubectl get pods -n production --show-labels`
- 察 pilot 日：`kubectl logs -n istio-system -l app=istiod`
- 先試無斷路，後增之
- 用 `istioctl analyze` 察配：`istioctl analyze -n production`

### 第五步：集可察棧

連服網之遙測於監與追之系。

**裝可察之附加：**

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

配自定指與儀表：

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

訪儀表：

```bash
istioctl dashboard grafana  # or: linkerd viz dashboard
istioctl dashboard kiali
istioctl dashboard jaeger
```

得：儀表示服之拓、請率、延百分、誤率。Jaeger 中分布之追可得。Prometheus 抓網指成。自定指現於查。

敗則：

- 驗 Prometheus 抓：`kubectl get servicemonitor -A`
- 察附加 pod 行：`kubectl get pods -n istio-system`
- 察遙測之配：`istioctl proxy-config log <pod-name> -n <namespace>`
- 驗網配啟遙測：`kubectl get configmap istio -n istio-system -o yaml | grep -A 5 enableTracing`
- 察端口衝若 port-forward 敗

### 第六步：驗而監網之健

行全健察而設續監。

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

立健察本與警：

```bash
#!/bin/bash
# mesh-health-check.sh (abbreviated)
echo "=== Service Mesh Health Check ==="
kubectl get pods -n istio-system
istioctl analyze --all-namespaces
# See EXAMPLES.md Step 6 for complete health check script and alert configs
```

得：諸析察過而無警。proxy-status 示諸代理同步。mTLS 察確加密。指示流通。控面 pod 穩於低資源用。

敗則：

- 處 `istioctl analyze` 之具體患
- 察各 pod 之代理日：`kubectl logs <pod> -c istio-proxy -n <namespace>`
- 驗網策不阻網之流
- 察控面之誤日：`kubectl logs -n istio-system deploy/istiod --tail=100`
- 重啟患代理：`kubectl rollout restart deploy/<deployment> -n <namespace>`

## 驗

- [ ] 控面 pod 行而健（istiod/linkerd-controller）
- [ ] 邊車注入諸應 pod（2/2 容）
- [ ] mTLS 啟而行（以 tls-check/tap 驗）
- [ ] 流管之則正路請（以 curl 試驗）
- [ ] 斷路於重敗跳（以注故試）
- [ ] 可察儀表示指（Grafana/Kiali/Linkerd Viz）
- [ ] Jaeger 捕樣請之分布之追
- [ ] istioctl analyze/linkerd check 無配警
- [ ] 代理同步示諸代理同步
- [ ] 服間之通加密（於日/儀表驗）

## 陷

- **資源耗**：服網每 pod 加 100-200MB 為邊車。確集有足。於注配設宜資源限
- **配衝**：同主多 VirtualService 致未定之為。每主用單 VirtualService 附多 match 條件
- **證書過期**：mTLS 證書自輪而 CA 根需管。以 `kubectl get certificate -A` 監過期而設警
- **邊車未注**：命名空標前所立之 pod 無邊車。必再立：`kubectl rollout restart deploy/<name> -n <namespace>`
- **DNS 解之患**：服網截 DNS。跨命名空之呼用全限名（service.namespace.svc.cluster.local）
- **端口名之求**：Istio 求端口名循 protocol-name 之模（如 http-web、tcp-db）。無名之端默為 TCP 透
- **漸展所求**：勿於生產立啟 STRICT mTLS。遷時用 PERMISSIVE 模，驗諸服皆網，後轉 STRICT
- **可察之耗**：百分百追採致性能患。生產用 1-10%：網配 `sampling: 1.0`
- **Gateway vs VirtualService 之惑**：Gateway 配入（負載均衡），VirtualService 配路。外流二者皆需
- **版兼**：確網版兼於 Kubernetes 版。Istio 支 n-1 小版，Linkerd 常支末三 Kubernetes 版

## 參

- `configure-ingress-networking` — Gateway 配補網入
- `deploy-to-kubernetes` — 與服網行之應展模
- `setup-prometheus-monitoring` — 為網指之 Prometheus 集
- `manage-kubernetes-secrets` — mTLS 之證書管
- `enforce-policy-as-code` — 與網授權並行之 OPA 策
