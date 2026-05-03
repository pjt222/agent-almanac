---
name: setup-service-mesh
locale: wenyan-ultra
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

# 設服網

釋配服網為安服間通、流管、察、策強。

## 用

- 微服需加密服間通→用
- 需細流控（金釋、A/B、流分）→用
- 需察諸服互動而不改應→用
- 強安策（mTLS、授）於基設層→用
- 一致行斷、重、超→用
- 需散追與服依映→用

## 入

- **必**：Kubernetes 叢含管權
- **必**：服網選（Istio 或 Linkerd）
- **必**：所啟服網之名空
- **可**：察棧（Prometheus、Grafana、Jaeger）
- **可**：自流管需
- **可**：mTLS 之 CA 配

## 行

> 全配與板見 [Extended Examples](references/EXAMPLES.md)。

### 一：裝服網控面

擇並裝服網控面。

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

建服網配含資源限與追：
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
```

得：控面 pod 行於 istio-system 或 linkerd 名空。`istioctl version` 或 `linkerd version` 示客服合本。

敗：
- 察叢有足資源（產 ≥ 4 CPU、8GB RAM）
- 驗 Kubernetes 本相容
- 察日誌：`kubectl logs -n istio-system -l app=istiod` 或 `kubectl logs -n linkerd -l linkerd.io/control-plane-component=controller`
- 察衝 CRD：`kubectl get crd | grep istio` 或 `kubectl get crd | grep linkerd`

### 二：啟自旁注

配名空為自旁代注。

**Istio：**
```bash
kubectl label namespace default istio-injection=enabled
kubectl get namespace -L istio-injection
```

**Linkerd：**
```bash
kubectl annotate namespace default linkerd.io/inject=enabled
```

測旁注樣釋：
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
```

施驗：
```bash
kubectl apply -f test-deployment.yaml
kubectl get pods -n default
# Expect 2/2 containers
```

得：新 pod 示 2/2 容（應 + 旁代）。述出含 istio-proxy 或 linkerd-proxy 容。日示成代啟。

敗：
- 察名空標：`kubectl get ns default -o yaml`
- 驗變鉤活：`kubectl get mutatingwebhookconfiguration`
- 察注日：`kubectl logs -n istio-system -l app=sidecar-injector`（Istio）
- 手注測：`kubectl get deploy test-app -o yaml | istioctl kube-inject -f - | kubectl apply -f -`

### 三：配 mTLS 策

啟雙 TLS 為安服間通。

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
```

**Linkerd：**
```bash
linkerd viz tap deploy/test-app -n default
```

施驗：
```bash
kubectl apply -f mtls-policy.yaml
istioctl authn tls-check $(kubectl get pod -n default -l app=test-app -o jsonpath='{.items[0].metadata.name}') -n default
```

得：諸網服間連示 mTLS 啟。Istio `tls-check` 示 STATUS 為「OK」。Linkerd `tap` 出示 🔒 於諸連。服日無 TLS 誤。

敗：
- 察證簽：`kubectl get certificates -A`
- 驗 CA 健：`kubectl logs -n istio-system -l app=istiod | grep -i cert`
- 先測 PERMISSIVE 模再轉 STRICT
- 察無旁服：`kubectl get pods --all-namespaces -o json | jq '.items[] | select(.spec.containers | length == 1) | .metadata.name'`

### 四：行流管則

配智流路、重、行斷。

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
```

**Linkerd 流分：**
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

施測：
```bash
kubectl apply -f traffic-management.yaml
for i in {1..100}; do curl -s http://api.example.com/api/v2 | grep version; done | sort | uniq -c
istioctl dashboard kiali
```

得：流按定權分。行斷後續誤跳。重於暫敗發。Kiali/Linkerd 板示流可視。

敗：
- 驗目主機解：`kubectl get svc -n production`
- 察子標合 pod 標：`kubectl get pods -n production --show-labels`
- 察 pilot 日：`kubectl logs -n istio-system -l app=istiod`
- 先無行斷測再加
- `istioctl analyze -n production` 查配

### 五：接察棧

連服網遙與察追系。

**裝察附：**
```bash
# Istio
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/prometheus.yaml
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/grafana.yaml
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/kiali.yaml
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/jaeger.yaml

# Linkerd
linkerd viz install | kubectl apply -f -
linkerd jaeger install | kubectl apply -f -
```

配自指與板：
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
```

達板：
```bash
istioctl dashboard grafana
istioctl dashboard kiali
istioctl dashboard jaeger
```

得：板示服拓、請率、延分位、誤率。散追於 Jaeger 可。Prometheus 採網指成。自指現於詢。

敗：
- 驗 Prometheus 採：`kubectl get servicemonitor -A`
- 察附 pod 行：`kubectl get pods -n istio-system`
- 察遙配：`istioctl proxy-config log <pod-name> -n <namespace>`
- 驗網配啟追：`kubectl get configmap istio -n istio-system -o yaml | grep -A 5 enableTracing`
- 察口衝若 port-forward 敗

### 六：驗察網健

行全健察設續察。

```bash
# Istio
istioctl analyze --all-namespaces
istioctl verify-install
istioctl proxy-status

# Linkerd
linkerd check
linkerd viz check
linkerd diagnostics policy

# Proxy sync
kubectl get pods -n production -o json | \
  jq '.items[] | {name: .metadata.name, proxy: .status.containerStatuses[] | select(.name=="istio-proxy").ready}'

# Control plane health
kubectl get pods -n istio-system -w
kubectl top pods -n istio-system
```

建健察本與警：
```bash
#!/bin/bash
# mesh-health-check.sh (abbreviated)
echo "=== Service Mesh Health Check ==="
kubectl get pods -n istio-system
istioctl analyze --all-namespaces
```

得：諸析察過無警。proxy-status 示諸代同步。mTLS 察確加密。指示流通。控面 pod 穩低資。

敗：
- 解 `istioctl analyze` 出之具題
- 察單 pod 代日：`kubectl logs <pod> -c istio-proxy -n <namespace>`
- 驗網策不阻網流
- 察控面誤日：`kubectl logs -n istio-system deploy/istiod --tail=100`
- 重啟問代：`kubectl rollout restart deploy/<deployment> -n <namespace>`

## 驗

- [ ] 控面 pod 行健（istiod/linkerd-controller）
- [ ] 旁代注於諸應 pod（2/2 容）
- [ ] mTLS 啟運（驗於 tls-check/tap）
- [ ] 流管則正路請（驗以 curl）
- [ ] 行斷於連敗跳（注故測）
- [ ] 察板示指（Grafana/Kiali/Linkerd Viz）
- [ ] 散追捕於 Jaeger
- [ ] istioctl analyze/linkerd check 無警
- [ ] 代同步示諸代同
- [ ] 服間通加密（驗於日/板）

## 忌

- **資竭**：服網每 pod 加 100-200MB 為旁。確叢有足容。注配設宜資限
- **配衝**：同主機多 VirtualService 致未定行。每主一 VirtualService 含多配
- **證期**：mTLS 證自轉而 CA 根需管。`kubectl get certificate -A` 察並設警
- **旁未注**：標前建之 pod 無旁。必重建：`kubectl rollout restart deploy/<name> -n <namespace>`
- **DNS 解問**：服網截 DNS。跨名空用全限名（service.namespace.svc.cluster.local）
- **口名需**：Istio 需名口循協議名（如 http-web、tcp-db）。無名口默 TCP 通透
- **漸釋需**：勿產立啟 STRICT mTLS。遷時用 PERMISSIVE、驗諸服網、再轉 STRICT
- **察負**：100% 追採致性問題。產用 1-10%：`sampling: 1.0` 於網配
- **Gateway vs VirtualService 混**：Gateway 配入（負衡）、VirtualService 配路。外流二需
- **本相容**：確網本相容 K8s 本。Istio 支 n-1 微本、Linkerd 常支末 3 K8s 本

## 參

- `configure-ingress-networking`
- `deploy-to-kubernetes`
- `setup-prometheus-monitoring`
- `manage-kubernetes-secrets`
- `enforce-policy-as-code`
