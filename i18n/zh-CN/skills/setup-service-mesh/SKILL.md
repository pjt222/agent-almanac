---
name: setup-service-mesh
description: >
  在 Kubernetes 集群中部署和配置服务网格（Istio 或 Linkerd），以实现
  安全的服务间通信、流量管理、可观测性和策略执行。涵盖安装、mTLS
  配置、流量路由、熔断器和与监控工具的集成。适用于微服务需要加密
  服务间通信、金丝雀或 A/B 部署需要细粒度流量控制、无需修改应用即可
  实现所有服务交互的可观测性，或需要一致的熔断和重试策略的场景。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: devops
  complexity: advanced
  language: multi
  tags: service-mesh, istio, linkerd, mtls, traffic-management, observability, kubernetes
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: "2026-03-16"
---

# 设置服务网格

部署和配置服务网格，实现安全的服务间通信和高级流量管理。

## 适用场景

- 微服务架构需要加密的服务间通信
- 需要细粒度流量控制（金丝雀部署、A/B 测试、流量拆分）
- 需要在不修改应用的情况下观测所有服务交互
- 在基础设施层面强制执行安全策略（mTLS、授权）
- 跨服务一致地实现熔断、重试和超时
- 需要分布式追踪和服务依赖图

## 输入

- **必填**：具有管理员权限的 Kubernetes 集群
- **必填**：服务网格选择（Istio 或 Linkerd）
- **必填**：需要启用服务网格的命名空间
- **可选**：监控栈（Prometheus、Grafana、Jaeger）
- **可选**：自定义流量管理需求
- **可选**：mTLS 的证书机构配置

## 步骤

> 完整配置文件和模板请参阅[扩展示例](references/EXAMPLES.md)。

### 第 1 步：安装服务网格控制平面

选择并安装服务网格控制平面。

**Istio 方案：**
```bash
curl -L https://istio.io/downloadIstio | ISTIO_VERSION=1.20.2 sh -
istioctl install --set profile=production -y
kubectl get pods -n istio-system
```

**Linkerd 方案：**
```bash
curl -sL https://run.linkerd.io/install | sh
linkerd check --pre
linkerd install --ha | kubectl apply -f -
linkerd check
```

创建带资源限制和追踪配置的服务网格配置：
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

**预期结果：** 控制平面 pod 在 istio-system（Istio）或 linkerd（Linkerd）命名空间中运行。`istioctl version` 或 `linkerd version` 显示客户端和服务器版本一致。

**失败处理：**
- 检查集群是否有足够资源（生产环境至少需要 4 核 CPU、8GB RAM）
- 验证 Kubernetes 版本兼容性（查阅网格文档）
- 检查日志：`kubectl logs -n istio-system -l app=istiod` 或 `kubectl logs -n linkerd -l linkerd.io/control-plane-component=controller`
- 检查冲突的 CRD：`kubectl get crd | grep istio` 或 `kubectl get crd | grep linkerd`

### 第 2 步：启用自动 Sidecar 注入

为命名空间配置自动 Sidecar 代理注入。

**Istio 方案：**
```bash
# Label namespace for automatic injection
kubectl label namespace default istio-injection=enabled
kubectl get namespace -L istio-injection
```

**Linkerd 方案：**
```bash
# Annotate namespace for injection
kubectl annotate namespace default linkerd.io/inject=enabled
```

使用示例部署测试 Sidecar 注入：
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

应用并验证：
```bash
kubectl apply -f test-deployment.yaml
kubectl get pods -n default
# Expect 2/2 containers (app + proxy)
```

**预期结果：** 新 pod 显示 2/2 容器（应用 + Sidecar 代理）。Describe 输出显示 istio-proxy 或 linkerd-proxy 容器。日志显示代理启动成功。

**失败处理：**
- 检查命名空间标签/注解：`kubectl get ns default -o yaml`
- 验证 Mutating Webhook 处于活动状态：`kubectl get mutatingwebhookconfiguration`
- 检查注入日志：`kubectl logs -n istio-system -l app=sidecar-injector`（Istio）
- 手动注入进行测试：`kubectl get deploy test-app -o yaml | istioctl kube-inject -f - | kubectl apply -f -`

### 第 3 步：配置 mTLS 策略

启用双向 TLS 实现安全的服务间通信。

**Istio 方案：**
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

**Linkerd 方案：**
```bash
# Linkerd enforces mTLS by default for meshed pods
linkerd viz tap deploy/test-app -n default
# Check for 🔒 (lock) symbol
```

应用并验证：
```bash
kubectl apply -f mtls-policy.yaml
# Istio: verify mTLS status
istioctl authn tls-check $(kubectl get pod -n default -l app=test-app -o jsonpath='{.items[0].metadata.name}') -n default
```

**预期结果：** 网格化服务之间的所有连接显示 mTLS 已启用。Istio `tls-check` 显示状态为 "OK"。Linkerd `tap` 输出显示所有连接带锁图标。服务日志显示无 TLS 错误。

**失败处理：**
- 检查证书签发：`kubectl get certificates -A`（cert-manager）
- 验证 CA 是否健康：`kubectl logs -n istio-system -l app=istiod | grep -i cert`
- 先使用 PERMISSIVE 模式测试，再切换到 STRICT
- 检查无 Sidecar 的服务：`kubectl get pods --all-namespaces -o json | jq '.items[] | select(.spec.containers | length == 1) | .metadata.name'`

### 第 4 步：实现流量管理规则

配置智能流量路由、重试和熔断。

创建流量管理策略：
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

**Linkerd 流量拆分方案：**
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

应用并测试：
```bash
kubectl apply -f traffic-management.yaml
# Test traffic distribution
for i in {1..100}; do curl -s http://api.example.com/api/v2 | grep version; done | sort | uniq -c
# Monitor: istioctl dashboard kiali or linkerd viz dashboard
```

**预期结果：** 流量按定义权重拆分。熔断器在连续错误后触发。重试在瞬时故障时发生。Kiali/Linkerd 仪表板显示流量可视化。

**失败处理：**
- 验证目标主机是否可解析：`kubectl get svc -n production`
- 检查子集标签是否与 pod 标签匹配：`kubectl get pods -n production --show-labels`
- 检查 Pilot 日志：`kubectl logs -n istio-system -l app=istiod`
- 先不使用熔断器测试，然后逐步添加
- 使用 `istioctl analyze` 检查配置：`istioctl analyze -n production`

### 第 5 步：集成可观测性栈

将服务网格遥测连接到监控和追踪系统。

**安装可观测性插件：**
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

配置自定义指标和仪表板：
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

访问仪表板：
```bash
istioctl dashboard grafana  # or: linkerd viz dashboard
istioctl dashboard kiali
istioctl dashboard jaeger
```

**预期结果：** 仪表板显示服务拓扑、请求速率、延迟百分位数和错误率。Jaeger 中可查看分布式追踪。Prometheus 成功抓取网格指标。自定义指标出现在查询中。

**失败处理：**
- 验证 Prometheus 抓取：`kubectl get servicemonitor -A`
- 检查插件 pod 是否运行：`kubectl get pods -n istio-system`
- 检查遥测配置：`istioctl proxy-config log <pod-name> -n <namespace>`
- 验证网格配置启用了遥测：`kubectl get configmap istio -n istio-system -o yaml | grep -A 5 enableTracing`
- 如果端口转发失败，检查端口冲突

### 第 6 步：验证和监控网格健康状态

执行全面的健康检查并设置持续监控。

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

创建健康检查脚本和告警：
```bash
#!/bin/bash
# mesh-health-check.sh (abbreviated)
echo "=== Service Mesh Health Check ==="
kubectl get pods -n istio-system
istioctl analyze --all-namespaces
# See EXAMPLES.md Step 6 for complete health check script and alert configs
```

**预期结果：** 所有分析检查通过，无警告。proxy-status 显示所有代理已同步。mTLS 检查确认加密。指标显示流量正常流动。控制平面 pod 稳定，资源使用率低。

**失败处理：**
- 解决 `istioctl analyze` 输出中的特定问题
- 检查各 pod 的代理日志：`kubectl logs <pod> -c istio-proxy -n <namespace>`
- 验证网络策略没有阻止网格流量
- 检查控制平面日志中的错误：`kubectl logs -n istio-system deploy/istiod --tail=100`
- 重启有问题的代理：`kubectl rollout restart deploy/<deployment> -n <namespace>`

## 验证清单

- [ ] 控制平面 pod 运行正常（istiod/linkerd-controller）
- [ ] Sidecar 代理已注入所有应用 pod（2/2 容器）
- [ ] mTLS 已启用且功能正常（使用 tls-check/tap 验证）
- [ ] 流量管理规则正确路由请求（使用 curl 测试验证）
- [ ] 熔断器在重复失败时触发（使用故障注入测试）
- [ ] 可观测性仪表板显示指标（Grafana/Kiali/Linkerd Viz）
- [ ] Jaeger 中捕获了示例请求的分布式追踪
- [ ] istioctl analyze/linkerd check 无配置警告
- [ ] 代理同步状态显示所有代理已同步
- [ ] 服务间通信已加密（在日志/仪表板中验证）

## 常见问题

- **资源耗尽**：服务网格为每个 pod 的 Sidecar 增加 100-200MB 内存。确保集群有足够容量。在注入配置中设置适当的资源限制。

- **配置冲突**：同一主机有多个 VirtualService 会导致未定义行为。使用单个 VirtualService 配合多个匹配条件，而非多个 VirtualService。

- **证书过期**：mTLS 证书自动轮换，但 CA 根证书必须手动管理。使用 `kubectl get certificate -A` 监控证书过期并设置告警。

- **Sidecar 未注入**：在命名空间打标签之前创建的 pod 不会有 Sidecar。必须重新创建：`kubectl rollout restart deploy/<name> -n <namespace>`。

- **DNS 解析问题**：服务网格拦截 DNS。跨命名空间调用使用完全限定名称（service.namespace.svc.cluster.local）。

- **端口命名要求**：Istio 要求端口名遵循协议名称模式（如 http-web、tcp-db）。未命名端口默认为 TCP 透传。

- **需要渐进式部署**：不要在生产环境立即启用 STRICT mTLS。迁移期间使用 PERMISSIVE 模式，验证所有服务都已纳入网格，然后切换到 STRICT。

- **可观测性开销**：100% 追踪采样会导致性能问题。生产环境使用 1-10%：在网格配置中设置 `sampling: 1.0`。

- **Gateway 与 VirtualService 混淆**：Gateway 配置入口（负载均衡器），VirtualService 配置路由。外部流量两者都需要。

- **版本兼容性**：确保网格版本与 Kubernetes 版本兼容。Istio 支持 n-1 小版本，Linkerd 通常支持最近 3 个 Kubernetes 版本。

## 相关技能

- `configure-ingress-networking` - Gateway 配置与网格入口互补
- `deploy-to-kubernetes` - 与服务网格配合使用的应用部署模式
- `setup-prometheus-monitoring` - 网格指标的 Prometheus 集成
- `manage-kubernetes-secrets` - mTLS 的证书管理
- `enforce-policy-as-code` - 与网格授权配合使用的 OPA 策略
