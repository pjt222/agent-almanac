---
name: configure-api-gateway
locale: wenyan-lite
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

# 配置 API 閘道

部署並配 API 閘道以行集中式之 API 流量管理與策略執行。

## 適用時機

- 多後端服務需統一 API 端點與一致策略
- 需集中式之 API 存取認證/授權
- 需跨 API 之速率限與配額管理
- 欲無改後端而轉換請求/回應
- 實行 API 版本控制與棄用策
- 需詳細之 API 分析與監控
- 需微服務之服務發現與負載均衡

## 輸入

- **必要**：Kubernetes 叢集或 Docker 環境
- **必要**：API 閘道之擇（Kong 或 Traefik）
- **必要**：待代理之後端服務端點
- **選擇性**：認證提供者（OAuth2、OIDC、API 金鑰）
- **選擇性**：速率限需求（每分鐘/每時請求數）
- **選擇性**：自訂中介或外掛配置
- **選擇性**：HTTPS 端點之 TLS 憑證

## 步驟

> 見 [Extended Examples](references/EXAMPLES.md) 取完整配置檔與模板。

### 步驟一：裝 API 閘道

部署帶資料庫之閘道（Kong）或檔案式配置（Traefik）。

**Kong 配 PostgreSQL：**
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

見 [EXAMPLES.md](references/EXAMPLES.md#step-1-install-api-gateway) 取完整部署清單。

部署：
```bash
kubectl apply -f kong-deployment.yaml  # OR traefik-deployment.yaml
kubectl wait --for=condition=ready pod -l app=kong -n kong --timeout=300s
kubectl get svc -n kong kong-proxy  # Get load balancer IP
```

**預期：** 閘道 pod 以 2 replicas 運行。負載均衡服務有外部 IP。Admin API 可達（Kong：port 8001，Traefik：dashboard port 8080）。健康檢查通過。

**失敗時：**
- 查 pod 日誌：`kubectl logs -n kong -l app=kong`
- 驗資料庫連接（Kong）：`kubectl logs -n kong kong-migrations-<hash>`
- 查服務帳戶權限（Traefik）：`kubectl get clusterrolebinding traefik -o yaml`
- 確 port 未被占：`kubectl get svc --all-namespaces | grep 8000`

### 步驟二：配後端服務與路由

定義上游服務並建路由以暴露 API。

**Kong（以 decK 行宣告式配置）：**
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

施路由：
```bash
kubectl apply -f traefik-routes.yaml
curl -H "Host: api.example.com" https://GATEWAY_IP/api/users
```

見 [EXAMPLES.md](references/EXAMPLES.md#step-2-configure-backend-services-and-routes) 取完整路由配置。

**預期：** 路由正確代理至後端服務。加權路由依配置分發流量。健康檢查監後端服務健康。

**失敗時：**
- 驗後端服務運行：`kubectl get svc -n default`
- 查 DNS 解析：`kubectl run test --rm -it --image=busybox -- nslookup user-service.default.svc.cluster.local`
- 審閘道日誌：`kubectl logs -n kong -l app=kong --tail=50`
- 驗配置：`deck validate -s kong.yaml`

### 步驟三：實行認證與授權

配認證外掛/中介以行 API 安全。

**Kong（API 金鑰與 JWT 認證）：**
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

**Traefik（BasicAuth 與 ForwardAuth 中介）：**
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

見 [EXAMPLES.md](references/EXAMPLES.md#step-3-implement-authentication-and-authorization) 取完整認證配置。

**預期：** 未認證之請求返 401。有效憑證允入。速率限超閾值返 429。JWT 令牌正確驗證。ACL 執行組權限。

**失敗時：**
- 驗 consumer 建：`curl http://localhost:8001/consumers`
- 查外掛啟：`curl http://localhost:8001/plugins | jq .`
- 以 `curl -v` 觀回應頭
- 驗 JWT：用 jwt.io 解碼令牌

### 步驟四：配請求/回應轉換

加中介以轉請求與回應。

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

見 [EXAMPLES.md](references/EXAMPLES.md#step-4-configure-requestresponse-transformation) 取完整轉換配置。

**預期：** 請求頭依配置加/除。回應頭含閘道元資料。大請求以 413 拒。斷路器於屢敗時觸。瞬錯時行重試。

**失敗時：**
- 驗中介鏈序
- 查與後端服務之頭衝突
- 鏈前獨立測各轉換
- 審轉換錯之日誌

### 步驟五：啟監控與分析

配指標、日誌、儀表板以得 API 可見性。

**Kong 監控設：**
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

**Traefik 監控（內建）：**
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

見 [EXAMPLES.md](references/EXAMPLES.md#step-5-enable-monitoring-and-analytics) 取完整監控配置。

**預期：** Prometheus 成功爬閘道指標。儀表板顯請求率、延遲百分位、錯誤率。日誌轉至聚合系統。指標依服務、路由、consumer 分。

**失敗時：**
- 驗 ServiceMonitor：`kubectl get servicemonitor -A`
- 於 UI 中查 Prometheus 目標
- 確指標 port 可達：`kubectl port-forward -n kong svc/kong-metrics 8100:8100`
- 驗日誌端點可達

### 步驟六：實行 API 版本控制與棄用

配版本管理與優雅 API 棄用。

**Kong 版本策：**
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

測版本控制：
```bash
curl -i https://api.example.com/api/v1/users  # Deprecated
curl -i https://api.example.com/api/v2/users  # Current
curl -i https://api.example.com/api/users     # Routes to v2
```

見 [EXAMPLES.md](references/EXAMPLES.md#step-6-implement-api-versioning-and-deprecation) 取完整版本配置。

**預期：** 不同版本路由至對應後端服務。v1 回應上有棄用頭。已棄版本之速率限更嚴。預設路徑路由至最新版本。指標依 API 版本分。

**失敗時：**
- 驗路徑優先/次序配置（高優先＝先求值）
- 查重疊之路徑模式
- 獨立測每版本路由
- 審路由日誌之路徑匹配
- 確每版本之後端服務運行

## 驗證

- [ ] API 閘道 pod 以多 replicas 行以得 HA
- [ ] 負載均衡服務有外部 IP
- [ ] 路由正確代理流量至後端服務
- [ ] 認證/授權行使存取控制（401/403 回應）
- [ ] 速率限超配額時返 429
- [ ] 請求/回應轉換正確加/除頭
- [ ] 斷路器於屢後端敗時觸
- [ ] 指標暴露且為 Prometheus 爬
- [ ] 儀表板顯請求率、延遲、錯
- [ ] API 版本控制路由請求至正確後端版本
- [ ] 棄用頭見於舊 API 版本
- [ ] 健康檢查監後端服務可用

## 常見陷阱

- **資料庫依賴（Kong）**：Kong 帶資料庫需 PostgreSQL/Cassandra。DB-less 模式可用但限某些功能（運行時配置改）。生產多閘道實例用 DB 模式。

- **路徑匹配序**：路由/IngressRoute 依特定序求值。更具體之路徑宜有更高優先。重疊之路徑致不可預路由。以 `curl -v` 驗實命中路由。

- **認證繞過**：確認證外掛施於所有路由。易加路由而無 auth。於服務級用預設外掛，後按路由覆。

- **速率限範圍**：速率限 `policy: local` 按每閘道 pod 計。跨 replicas 一致限須用集中式策（Redis）或黏著會話。

- **CORS 配置**：API 閘道宜處 CORS，非各服務。早加 CORS 外掛/中介以免瀏覽器預檢敗。

- **SSL/TLS 終結**：閘道通常終結 SSL。確憑證有效且配自動更新。Kubernetes 憑證管理用 cert-manager。

- **上游健康檢查**：配主動健康檢查以速偵後端敗。被動檢查靠實流量或較慢偵。

- **外掛/中介執行序**：序要。認證先於速率限（免為無效請求耗速率槽）。轉換先於日誌（記已轉之值）。

- **資源限**：閘道 pod 於負載下可耗大量 CPU。設合適之資源請求/限制。生產中監 CPU 限流。

- **遷移策**：勿一次啟所有外掛。漸進推展：路由 → 認證 → 速率限 → 轉換 → 進階功能。

## 相關技能

- `configure-ingress-networking` - Ingress 控制器設補 API 閘道
- `setup-service-mesh` - 服務網格供互補之東西向流量管理
- `manage-kubernetes-secrets` - 閘道之憑證與憑據管理
- `setup-prometheus-monitoring` - 閘道指標之監控整合
- `enforce-policy-as-code` - 補閘道授權之策略執行
