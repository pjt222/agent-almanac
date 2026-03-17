---
name: configure-api-gateway
description: >
  部署和配置 API 网关（Kong 或 Traefik）以处理 API 流量管理、认证、
  速率限制、请求/响应转换和路由。涵盖插件配置、上游服务、消费者管理
  以及与现有基础设施的集成。适用于多个后端服务需要统一 API 端点、
  需要集中认证或速率限制、实现 API 版本控制，或需要为微服务提供详细
  分析和负载均衡的场景。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: devops
  complexity: intermediate
  language: multi
  tags: api-gateway, kong, traefik, rate-limiting, authentication, routing, middleware
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: "2026-03-16"
---

# 配置 API 网关

部署和配置 API 网关，实现集中化 API 流量管理和策略执行。

## 适用场景

- 多个后端服务需要带统一策略的统一 API 端点
- 需要对 API 访问进行集中认证/授权
- 需要跨 API 进行速率限制和配额管理
- 在不修改后端服务的情况下转换请求/响应
- 实现 API 版本控制和废弃策略
- 需要详细的 API 分析和监控
- 需要微服务的服务发现和负载均衡

## 输入

- **必填**：Kubernetes 集群或 Docker 环境
- **必填**：API 网关选择（Kong 或 Traefik）
- **必填**：需要代理的后端服务端点
- **可选**：认证提供商（OAuth2、OIDC、API 密钥）
- **可选**：速率限制需求（每分钟/小时请求数）
- **可选**：自定义中间件或插件配置
- **可选**：HTTPS 端点的 TLS 证书

## 步骤

> 完整配置文件和模板请参阅[扩展示例](references/EXAMPLES.md)。

### 第 1 步：安装 API 网关

使用数据库（Kong）或基于文件的配置（Traefik）部署 API 网关。

**Kong 与 PostgreSQL 方案：**
```yaml
# kong-deployment.yaml (excerpt - see EXAMPLES.md for complete file)
apiVersion: v1
kind: Namespace
metadata:
  name: kong
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kong
  namespace: kong
spec:
  replicas: 2
  # ... (PostgreSQL, migrations, services - see EXAMPLES.md)
```

**Traefik 方案：**
```yaml
# traefik-deployment.yaml (excerpt - see EXAMPLES.md for complete file)
apiVersion: v1
kind: Namespace
metadata:
  name: traefik
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: traefik
  namespace: traefik
spec:
  replicas: 2
  # ... (RBAC, ConfigMap, services - see EXAMPLES.md)
```

完整部署清单请参阅 [EXAMPLES.md](references/EXAMPLES.md#step-1-install-api-gateway)。

部署：
```bash
kubectl apply -f kong-deployment.yaml  # OR traefik-deployment.yaml
kubectl wait --for=condition=ready pod -l app=kong -n kong --timeout=300s
kubectl get svc -n kong kong-proxy  # Get load balancer IP
```

**预期结果：** 网关 pod 以 2 个副本运行。负载均衡器服务已分配外部 IP。管理 API 可访问（Kong：端口 8001，Traefik：仪表板端口 8080）。健康检查通过。

**失败处理：**
- 检查 pod 日志：`kubectl logs -n kong -l app=kong`
- 验证数据库连接（Kong）：`kubectl logs -n kong kong-migrations-<hash>`
- 检查服务账户权限（Traefik）：`kubectl get clusterrolebinding traefik -o yaml`
- 确保端口未被占用：`kubectl get svc --all-namespaces | grep 8000`

### 第 2 步：配置后端服务和路由

定义上游服务并创建路由以暴露 API。

**Kong 方案（使用 decK 声明式配置）：**
```bash
# Install decK CLI
curl -sL https://github.com/Kong/deck/releases/download/v1.28.0/deck_1.28.0_linux_amd64.tar.gz | tar -xz
sudo mv deck /usr/local/bin/

# Create kong.yaml with services, routes, upstreams
# (see EXAMPLES.md for complete configuration)
deck sync --kong-addr http://localhost:8001 -s kong.yaml
curl -i http://localhost:8001/routes  # Verify routes
```

**Traefik 方案（使用 IngressRoute CRD）：**
```yaml
# traefik-routes.yaml (excerpt)
apiVersion: traefik.io/v1alpha1
kind: IngressRoute
metadata:
  name: user-api-route
spec:
  entryPoints: [websecure]
  routes:
  - match: Host(`api.example.com`) && PathPrefix(`/api/users`)
    # ... (see EXAMPLES.md for full configuration)
```

应用路由：
```bash
kubectl apply -f traefik-routes.yaml
curl -H "Host: api.example.com" https://GATEWAY_IP/api/users
```

完整路由配置请参阅 [EXAMPLES.md](references/EXAMPLES.md#step-2-configure-backend-services-and-routes)。

**预期结果：** 路由正确代理流量到后端服务。加权路由按配置分配流量。健康检查监控后端服务健康状态。

**失败处理：**
- 验证后端服务是否运行：`kubectl get svc -n default`
- 检查 DNS 解析：`kubectl run test --rm -it --image=busybox -- nslookup user-service.default.svc.cluster.local`
- 检查网关日志：`kubectl logs -n kong -l app=kong --tail=50`
- 验证配置：`deck validate -s kong.yaml`

### 第 3 步：实现认证和授权

配置认证插件/中间件以保护 API 安全。

**Kong 方案（API 密钥和 JWT 认证）：**
```yaml
# kong-auth-config.yaml (excerpt)
consumers:
- username: mobile-app
  custom_id: app-001

keyauth_credentials:
- consumer: mobile-app
  key: mobile-secret-key-123

plugins:
- name: key-auth
  service: user-api
  # ... (see EXAMPLES.md for full configuration)
```

```bash
deck sync --kong-addr http://localhost:8001 -s kong-auth-config.yaml
curl -i -H "apikey: mobile-secret-key-123" http://GATEWAY_IP/api/users
```

**Traefik 方案（BasicAuth 和 ForwardAuth 中间件）：**
```yaml
# traefik-auth-middleware.yaml (excerpt)
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: basic-auth-middleware
spec:
  basicAuth:
    secret: basic-auth
    removeHeader: true
# ... (see EXAMPLES.md for OAuth2, rate limiting)
```

```bash
kubectl apply -f traefik-auth-middleware.yaml
curl -u user1:password https://GATEWAY_IP/api/protected
```

完整认证配置请参阅 [EXAMPLES.md](references/EXAMPLES.md#step-3-implement-authentication-and-authorization)。

**预期结果：** 未认证请求返回 401。有效凭证允许访问。速率限制在达到阈值后返回 429。JWT 令牌验证正确。ACL 强制执行组权限。

**失败处理：**
- 验证消费者创建：`curl http://localhost:8001/consumers`
- 检查插件启用状态：`curl http://localhost:8001/plugins | jq .`
- 使用 verbose 测试：`curl -v` 查看响应头
- 验证 JWT：使用 jwt.io 解码令牌

### 第 4 步：配置请求/响应转换

添加中间件以转换请求和响应。

**Kong 方案：**
```yaml
# kong-transformations.yaml (excerpt)
plugins:
- name: request-transformer
  service: user-api
  config:
    add:
      headers: [X-Gateway-Version:1.0, X-Request-ID:$(uuid)]
    remove:
      headers: [X-Internal-Token]
- name: correlation-id
  # ... (see EXAMPLES.md for full configuration)
```

```bash
deck sync --kong-addr http://localhost:8001 -s kong-transformations.yaml
```

**Traefik 方案：**
```yaml
# traefik-transformations.yaml (excerpt)
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: add-headers
spec:
  headers:
    customRequestHeaders:
      X-Gateway-Version: "1.0"
    # ... (see EXAMPLES.md for circuit breaker, retry, chain)
```

```bash
kubectl apply -f traefik-transformations.yaml
curl -v https://GATEWAY_IP/api/users | grep X-Gateway
```

完整转换配置请参阅 [EXAMPLES.md](references/EXAMPLES.md#step-4-configure-requestresponse-transformation)。

**预期结果：** 请求头按配置添加/删除。响应头包含网关元数据。超大请求以 413 拒绝。熔断器在重复失败后触发。瞬时错误时发生重试。

**失败处理：**
- 验证链中的中间件顺序
- 检查与后端服务的头冲突
- 在链接之前单独测试每个转换
- 检查日志中的转换错误

### 第 5 步：启用监控和分析

配置指标、日志和仪表板以实现 API 可见性。

**Kong 监控配置：**
```yaml
# kong-monitoring.yaml (excerpt)
plugins:
- name: prometheus
  config:
    per_consumer: true
- name: http-log
  service: user-api
  # ... (see EXAMPLES.md for Datadog, file-log configuration)
```

```bash
deck sync --kong-addr http://localhost:8001 -s kong-monitoring.yaml

# Deploy ServiceMonitor (see EXAMPLES.md)
kubectl apply -f kong-servicemonitor.yaml
curl http://localhost:8100/metrics
```

**Traefik 监控（内置）：**
```yaml
# ServiceMonitor (excerpt - see EXAMPLES.md for Grafana dashboard)
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: traefik-metrics
spec:
  endpoints:
  - port: metrics
    path: /metrics
    interval: 30s
```

```bash
kubectl port-forward -n traefik svc/traefik-dashboard 8080:8080
# Open http://localhost:8080/dashboard/
```

完整监控配置请参阅 [EXAMPLES.md](references/EXAMPLES.md#step-5-enable-monitoring-and-analytics)。

**预期结果：** Prometheus 成功抓取网关指标。仪表板显示请求速率、延迟百分位数和错误率。日志转发到聚合系统。指标按服务、路由和消费者分段。

**失败处理：**
- 验证 ServiceMonitor：`kubectl get servicemonitor -A`
- 在 UI 中检查 Prometheus 目标
- 确保指标端口可访问：`kubectl port-forward -n kong svc/kong-metrics 8100:8100`
- 验证日志端点可达性

### 第 6 步：实现 API 版本控制和废弃

配置版本管理和优雅的 API 废弃。

**Kong 版本控制策略：**
```yaml
# kong-versioning.yaml (excerpt)
services:
- name: user-api-v1
  url: http://user-service-v1.default.svc.cluster.local:8080
  routes:
  - name: user-v1-route
    paths: [/api/v1/users]
  plugins:
  - name: response-transformer
    config:
      add:
        headers:
        - X-Deprecation-Notice:"API v1 deprecated on 2024-12-31"
        - Sunset:"Wed, 31 Dec 2024 23:59:59 GMT"
# ... (see EXAMPLES.md for v2, default routing, rate limits)
```

**Traefik 版本控制：**
```yaml
# traefik-versioning.yaml (excerpt)
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: v1-deprecation-headers
spec:
  headers:
    customResponseHeaders:
      X-Deprecation-Notice: "API v1 deprecated on 2024-12-31"
# ... (see EXAMPLES.md for complete IngressRoutes)
```

测试版本控制：
```bash
curl -i https://api.example.com/api/v1/users  # Deprecated
curl -i https://api.example.com/api/v2/users  # Current
curl -i https://api.example.com/api/users     # Routes to v2
```

完整版本控制配置请参阅 [EXAMPLES.md](references/EXAMPLES.md#step-6-implement-api-versioning-and-deprecation)。

**预期结果：** 不同版本路由到相应的后端服务。v1 响应中包含废弃头。废弃版本的速率限制更严格。默认路径路由到最新版本。指标按 API 版本分段。

**失败处理：**
- 验证路径优先级/优先权配置（优先级越高 = 越先评估）
- 检查是否有重叠的路径模式
- 独立测试每个版本路由
- 检查路由日志中的路径匹配情况
- 确保每个版本的后端服务都在运行

## 验证清单

- [ ] API 网关 pod 以多个副本运行以实现高可用
- [ ] 负载均衡器服务已分配外部 IP
- [ ] 路由正确代理流量到后端服务
- [ ] 认证/授权强制执行访问控制（401/403 响应）
- [ ] 速率限制在超过配额后返回 429
- [ ] 请求/响应转换正确添加/删除头
- [ ] 熔断器在后端重复失败时触发
- [ ] 指标已暴露并被 Prometheus 抓取
- [ ] 仪表板显示请求速率、延迟和错误
- [ ] API 版本控制将请求路由到正确的后端版本
- [ ] 旧版 API 响应中包含废弃头
- [ ] 健康检查监控后端服务可用性

## 常见问题

- **数据库依赖（Kong）**：带数据库的 Kong 需要 PostgreSQL/Cassandra。无数据库模式可用，但限制了某些功能（运行时配置变更）。生产环境中使用多网关实例时使用数据库模式。

- **路径匹配顺序**：路由/IngressRoute 按特定顺序评估。更具体的路径应具有更高优先级。重叠路径会导致不可预测的路由。使用 `curl -v` 测试验证实际命中的路由。

- **认证绕过**：确保认证插件应用于所有路由。很容易添加无认证的路由。在服务级别使用默认插件，然后按需在路由级别覆盖。

- **速率限制范围**：速率限制 `policy: local` 按网关 pod 计数。对于多副本间一致的限制，使用集中策略（Redis）或粘性会话。

- **CORS 配置**：API 网关应处理 CORS，而非各个服务。尽早添加 CORS 插件/中间件，避免浏览器预检失败。

- **SSL/TLS 终止**：网关通常终止 SSL。确保证书有效且已配置自动续期。在 Kubernetes 中使用 cert-manager 管理证书。

- **上游健康检查**：配置主动健康检查以快速检测后端故障。被动检查依赖真实流量，检测问题可能较慢。

- **插件/中间件执行顺序**：顺序很重要。认证应在速率限制之前（避免为无效请求浪费速率限制配额）。转换应在日志记录之前（记录转换后的值）。

- **资源限制**：高负载下网关 pod 可能消耗大量 CPU。设置适当的资源请求/限制。在生产环境中监控 CPU 限流。

- **迁移策略**：不要一次启用所有插件。逐步推进：路由 → 认证 → 速率限制 → 转换 → 高级功能。

## 相关技能

- `configure-ingress-networking` - Ingress 控制器配置与 API 网关互补
- `setup-service-mesh` - 服务网格提供互补的东西向流量管理
- `manage-kubernetes-secrets` - 网关的证书和凭证管理
- `setup-prometheus-monitoring` - 网关指标的监控集成
- `enforce-policy-as-code` - 与网关授权互补的策略执行
