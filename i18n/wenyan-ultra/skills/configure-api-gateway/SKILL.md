---
name: configure-api-gateway
locale: wenyan-ultra
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

# 配 API 閘

部且配 API 閘以集中管流與策執。

## 用

- 多後端須統 API 端與一策
- 須集中 API 存取之鑑授
- 諸 API 須限率與配額管
- 欲變求/響而不改後端
- 施 API 版管與廢策
- 須詳 API 析與監
- 須服發現與微服負載平衡

## 入

- **必**：Kubernetes 群或 Docker 境
- **必**：閘擇（Kong 或 Traefik）
- **必**：所代後端服端
- **可**：鑑供（OAuth2、OIDC、API key）
- **可**：限率求（每分/時）
- **可**：自定中間件或 plugin 配
- **可**：HTTPS 之 TLS 證

## 行

> 見 [Extended Examples](references/EXAMPLES.md) 以全配檔與模。

### 一：裝 API 閘

部閘與庫（Kong）或檔配（Traefik）。

**Kong 加 PostgreSQL：**
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

見 [EXAMPLES.md](references/EXAMPLES.md#step-1-install-api-gateway) 以全部 manifest

部：
```bash
kubectl apply -f kong-deployment.yaml  # OR traefik-deployment.yaml
kubectl wait --for=condition=ready pod -l app=kong -n kong --timeout=300s
kubectl get svc -n kong kong-proxy  # Get load balancer IP
```

**得：** 閘 pod 行 2 replica。負載平衡服有外 IP。管 API 可達（Kong: 8001、Traefik: 8080）。健察過。

**敗：**
- 察 pod 日誌：`kubectl logs -n kong -l app=kong`
- 驗庫連（Kong）：`kubectl logs -n kong kong-migrations-<hash>`
- 察服帳權（Traefik）：`kubectl get clusterrolebinding traefik -o yaml`
- 確埠未佔：`kubectl get svc --all-namespaces | grep 8000`

### 二：配後端服與路

定上游服，建路以露 API。

**Kong（用 decK 宣式配）：**
```bash
# Install decK CLI
curl -sL https://github.com/Kong/deck/releases/download/v1.28.0/deck_1.28.0_linux_amd64.tar.gz | tar -xz
sudo mv deck /usr/local/bin/

# Create kong.yaml with services, routes, upstreams
# (see EXAMPLES.md for complete configuration)
deck sync --kong-addr http://localhost:8001 -s kong.yaml
curl -i http://localhost:8001/routes  # Verify routes
```

**Traefik（用 IngressRoute CRD）：**
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

見 [EXAMPLES.md](references/EXAMPLES.md#step-2-configure-backend-services-and-routes) 以全路配

**得：** 路正代流至後端。權重路按配分。健察監後端狀。

**敗：**
- 驗後端服行：`kubectl get svc -n default`
- 察 DNS：`kubectl run test --rm -it --image=busybox -- nslookup user-service.default.svc.cluster.local`
- 審閘日誌：`kubectl logs -n kong -l app=kong --tail=50`
- 驗配：`deck validate -s kong.yaml`

### 三：施鑑與授

配鑑 plugin/中間件於 API 安。

**Kong（API key 與 JWT 鑑）：**
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

**Traefik（BasicAuth 與 ForwardAuth 中間件）：**
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

見 [EXAMPLES.md](references/EXAMPLES.md#step-3-implement-authentication-and-authorization) 以全鑑配

**得：** 未鑑求返 401。有效憑得入。限率達閾返 429。JWT 正驗。ACL 執組權。

**敗：**
- 驗 consumer 建：`curl http://localhost:8001/consumers`
- 察 plugin 啟：`curl http://localhost:8001/plugins | jq .`
- 詳測：`curl -v` 察響頭
- 驗 JWT：jwt.io 解碼

### 四：配求/響變換

加中間件變換求與響。

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

見 [EXAMPLES.md](references/EXAMPLES.md#step-4-configure-requestresponse-transformation) 以全變換配

**得：** 求頭按配加/除。響頭含閘元。大求以 413 拒。屢敗觸斷路。瞬錯重試。

**敗：**
- 驗鏈中中間件序
- 察與後端之頭衝突
- 先獨測變換再鏈
- 察日誌尋變換錯

### 五：啟監與析

配度、日、板以 API 可見。

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

見 [EXAMPLES.md](references/EXAMPLES.md#step-5-enable-monitoring-and-analytics) 以全監配

**得：** Prometheus 成刮閘度。板示求率、延百分位、錯率。日前至聚系。度按服、路、consumer 分。

**敗：**
- 驗 ServiceMonitor：`kubectl get servicemonitor -A`
- 於 Prometheus UI 察目標
- 確度埠可達：`kubectl port-forward -n kong svc/kong-metrics 8100:8100`
- 驗日端可達

### 六：施 API 版與廢

配版管與優雅廢。

**Kong 版策：**
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

測版：
```bash
curl -i https://api.example.com/api/v1/users  # Deprecated
curl -i https://api.example.com/api/v2/users  # Current
curl -i https://api.example.com/api/users     # Routes to v2
```

見 [EXAMPLES.md](references/EXAMPLES.md#step-6-implement-api-versioning-and-deprecation) 以全版配

**得：** 異版路至宜後端。廢頭現於 v1 響。限率於廢版更嚴。默路至最新。度按版分。

**敗：**
- 驗路先後（高先評）
- 察重疊路模式
- 各版路獨測
- 察路日誌察路匹
- 確諸版後端在行

## 驗

- [ ] 閘 pod 行多 replica 為高可用
- [ ] 負載平衡服有外 IP
- [ ] 路正代流至後端
- [ ] 鑑授執控（401/403 響）
- [ ] 限率超配額返 429
- [ ] 求/響變換正加/除頭
- [ ] 屢後端敗觸斷路
- [ ] 度露且 Prometheus 刮
- [ ] 板示求率、延、錯
- [ ] API 版路至正後端版
- [ ] 廢頭現於舊 API 版
- [ ] 健察監後端可用

## 忌

- **庫依（Kong）**：Kong 含庫須 PostgreSQL/Cassandra。無庫模可，然限部分功能（運時配變）。生產多閘須庫模。

- **路匹序**：路/IngressRoute 按特序評。具體路須高優。重疊路致不可料路由。`curl -v` 驗實路。

- **鑑繞過**：確鑑 plugin 施於諸路。易添路而無鑑。用服級默 plugin，再每路覆。

- **限率範**：`policy: local` 每閘 pod 計。跨 replica 一致→用集中策（Redis）或粘會話。

- **CORS 配**：閘宜處 CORS，非個服。早加 CORS plugin/中間件以免瀏覽器預檢敗。

- **SSL/TLS 終**：閘常終 SSL。確證有效且自動更新。K8s 用 cert-manager 管證。

- **上游健察**：配主動察以速偵後端敗。被動察依實流→或慢察。

- **Plugin/中間件行序**：序要。鑑先於限率（免無效求耗限率位）。變換先於日誌（記變換值）。

- **資源限**：閘 pod 於壓下耗 CPU 多。設宜之 request/limit。生產察 CPU 節流。

- **遷策**：勿一時啟諸 plugin。漸施：路→鑑→限率→變換→進階。

## 參

- `configure-ingress-networking` - Ingress 控器設補 API 閘
- `setup-service-mesh` - 服網供補東西流管
- `manage-kubernetes-secrets` - 閘證與憑管
- `setup-prometheus-monitoring` - 閘度監整
- `enforce-policy-as-code` - 策執補閘授
