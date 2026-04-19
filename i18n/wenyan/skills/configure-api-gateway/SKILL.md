---
name: configure-api-gateway
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Deploy and configure an API gateway (Kong or Traefik) to handle API traffic management,
  authentication, rate limiting, request/response transformation, and routing. Covers plugin
  configuration, upstream services, consumer management, and integration with existing
  infrastructure. Use when multiple backend services need a unified API endpoint, when
  centralized authentication or rate limiting is required, when implementing API versioning,
  or when needing detailed analytics and load balancing for microservices.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: devops
  complexity: intermediate
  language: multi
  tags: api-gateway, kong, traefik, rate-limiting, authentication, routing, middleware
---

# 設 API 門

部設 API 門為中 API 流之治與策執。

## 用時

- 多後服需一之 API 端附一致策
- 需中認/權於 API 訪
- 需率限與額治於諸 API
- 欲變請應而不改後服
- 施 API 版與棄之策
- 需詳 API 析與監
- 需服發現與載衡於微服

## 入

- **必**：Kubernetes 簇或 Docker 境
- **必**：API 門之擇（Kong 或 Traefik）
- **必**：代之後端點
- **可選**：認供（OAuth2、OIDC、API 符）
- **可選**：率限之求（每分/每時）
- **可選**：自中件或插設
- **可選**：HTTPS 之 TLS 證

## 法

> 見 [Extended Examples](references/EXAMPLES.md) 以全設檔與範。

### 第一步：裝 API 門

以庫（Kong）或檔設（Traefik）部之。

**Kong 附 PostgreSQL：**
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

**Traefik：**
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

見 [EXAMPLES.md](references/EXAMPLES.md#step-1-install-api-gateway) 以全部署之冊

部：
```bash
kubectl apply -f kong-deployment.yaml  # OR traefik-deployment.yaml
kubectl wait --for=condition=ready pod -l app=kong -n kong --timeout=300s
kubectl get svc -n kong kong-proxy  # Get load balancer IP
```

**得：** 門之 pod 行附二副。載衡服有外 IP。管 API 可訪（Kong：8001，Traefik：8080）。健察通。

**敗則：**
- 察 pod 誌：`kubectl logs -n kong -l app=kong`
- 驗庫連（Kong）：`kubectl logs -n kong kong-migrations-<hash>`
- 察服戶權（Traefik）：`kubectl get clusterrolebinding traefik -o yaml`
- 確埠未綁：`kubectl get svc --all-namespaces | grep 8000`

### 第二步：設後服與路

定上服而建路以露 API。

**Kong（以 decK 為宣設）：**
```bash
# Install decK CLI
curl -sL https://github.com/Kong/deck/releases/download/v1.28.0/deck_1.28.0_linux_amd64.tar.gz | tar -xz
sudo mv deck /usr/local/bin/

# Create kong.yaml with services, routes, upstreams
# (see EXAMPLES.md for complete configuration)
deck sync --kong-addr http://localhost:8001 -s kong.yaml
curl -i http://localhost:8001/routes  # Verify routes
```

**Traefik（以 IngressRoute CRD）：**
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

施路：
```bash
kubectl apply -f traefik-routes.yaml
curl -H "Host: api.example.com" https://GATEWAY_IP/api/users
```

見 [EXAMPLES.md](references/EXAMPLES.md#step-2-configure-backend-services-and-routes) 以全路之設

**得：** 路正代流於後服。權路依設分流。健察後服之健。

**敗則：**
- 驗後服行：`kubectl get svc -n default`
- 察 DNS 解：`kubectl run test --rm -it --image=busybox -- nslookup user-service.default.svc.cluster.local`
- 察門誌：`kubectl logs -n kong -l app=kong --tail=50`
- 驗設：`deck validate -s kong.yaml`

### 第三步：施認與權

設認插/中件為 API 安。

**Kong（API 符與 JWT 認）：**
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

**Traefik（BasicAuth 與 ForwardAuth 中件）：**
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

見 [EXAMPLES.md](references/EXAMPLES.md#step-3-implement-authentication-and-authorization) 以全認之設

**得：** 未認之請返 401。有效憑許訪。率限後返 429。JWT 符正驗。ACL 執群權。

**敗則：**
- 驗消者建：`curl http://localhost:8001/consumers`
- 察插啟：`curl http://localhost:8001/plugins | jq .`
- 詳試：`curl -v` 察應頭
- 驗 JWT：於 jwt.io 解符

### 第四步：設請應之變

加中件以變請應。

**Kong：**
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

**Traefik：**
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

見 [EXAMPLES.md](references/EXAMPLES.md#step-4-configure-requestresponse-transformation) 以全變之設

**得：** 請頭依設加除。應頭含門元資。大請以 413 拒。斷路於屢敗跳。暫誤自再試。

**敗則：**
- 驗中件之序
- 察與後服之頭衝
- 獨試變後鏈
- 察變之誌

### 第五步：啟監與析

設量、誌、板為 API 之見。

**Kong 監設：**
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

**Traefik 監（內建）：**
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

見 [EXAMPLES.md](references/EXAMPLES.md#step-5-enable-monitoring-and-analytics) 以全監之設

**得：** Prometheus 成刮門量。板示請率、遲分、誤率。誌轉至聚系。量分於服、路、消者。

**敗則：**
- 驗 ServiceMonitor：`kubectl get servicemonitor -A`
- 察 Prometheus 之目於 UI
- 確量埠可訪：`kubectl port-forward -n kong svc/kong-metrics 8100:8100`
- 驗誌端可達

### 第六步：施 API 版與棄

設版治與柔 API 棄。

**Kong 版之策：**
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

**Traefik 版：**
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

試版：
```bash
curl -i https://api.example.com/api/v1/users  # Deprecated
curl -i https://api.example.com/api/v2/users  # Current
curl -i https://api.example.com/api/users     # Routes to v2
```

見 [EXAMPLES.md](references/EXAMPLES.md#step-6-implement-api-versioning-and-deprecation) 以全版之設

**得：** 異版路至合後服。棄頭於 v1 應。率限於棄版嚴。默徑路至最新。量分於版。

**敗則：**
- 驗徑先之設（高先先評）
- 察重疊徑式
- 獨試每版路
- 察路誌之徑配
- 確每版後服行

## 驗

- [ ] API 門 pod 行多副為 HA
- [ ] 載衡服有外 IP
- [ ] 路正代流於後服
- [ ] 認/權執訪控（401/403 應）
- [ ] 率限逾額返 429
- [ ] 請應變正加除頭
- [ ] 斷路於屢後敗跳
- [ ] 量露且 Prometheus 刮
- [ ] 板示請率、遲、誤
- [ ] API 版路請於正後版
- [ ] 棄頭於舊 API 版
- [ ] 健察監後服之可得

## 陷

- **庫依（Kong）**：Kong 附庫需 PostgreSQL/Cassandra。無庫模可而限某功。產用庫模於多門例。

- **徑配序**：路/IngressRoute 依特序評。特徑宜高先。重疊徑生不測路。以 `curl -v` 驗實配。

- **認繞**：確認插施於諸路。易加無認之路。用默插於服級，後於各路覆之。

- **率限範**：`policy: local` 每 pod 計。諸副一限，用中策（Redis）或粘話。

- **CORS 設**：門宜治 CORS，非各服。早加 CORS 插避瀏覽預檢敗。

- **SSL/TLS 終**：門常終 SSL。確證有效且設自更。K8s 用 cert-manager 治證。

- **上健察**：設主動健察以速察後敗。被察賴實流或慢察問。

- **插/中件行序**：序要。認先於率限（避無效請耗限）。變先於誌（誌變後值）。

- **資限**：門 pod 載下可耗 CPU。設合資求/限。產察 CPU 抑。

- **遷之策**：勿一啟諸插。漸展：路→認→率限→變→進功。

## 參

- `configure-ingress-networking` - 入控設補 API 門
- `setup-service-mesh` - 服網供東西流之補治
- `manage-kubernetes-secrets` - 門之證與憑治
- `setup-prometheus-monitoring` - 監合於門量
- `enforce-policy-as-code` - 策執補門權
