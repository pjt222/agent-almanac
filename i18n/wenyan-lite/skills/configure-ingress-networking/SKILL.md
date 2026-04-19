---
name: configure-ingress-networking
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Configure Kubernetes Ingress networking with NGINX Ingress Controller, cert-manager
  for automated TLS certificate management, path-based routing, rate limiting, and
  multi-domain hosting with SSL termination and load balancing. Use when exposing multiple
  Kubernetes services via a single load balancer, implementing path-based or host-based
  routing, automating TLS certificate issuance with Let's Encrypt, or setting up blue-green
  and canary deployments with traffic splitting.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: devops
  complexity: intermediate
  language: multi
  tags: ingress, nginx, cert-manager, tls, networking
---

# 配置 Ingress 網路

設生產級 Kubernetes Ingress 含 NGINX 控制器、自動 TLS 憑證、進階路由。

## 適用時機

- 以單一負載均衡暴露多 Kubernetes 服務
- 為微服務行路徑式或主機式路由
- 以 Let's Encrypt 自動 TLS 憑證之頒與更新
- 行速率限、認證、WAF 策
- 設藍綠或金絲雀部署附流量分
- 配自訂錯頁與請求/回應改動

## 輸入

- **必要**：支 LoadBalancer 之 Kubernetes 叢集或 MetalLB
- **必要**：指向叢集 LoadBalancer IP 之 DNS 記錄
- **選擇性**：既有 TLS 憑證或 Let's Encrypt 帳號
- **選擇性**：認證用之 OAuth2 提供者
- **選擇性**：WAF 規則（ModSecurity）
- **選擇性**：收集指標之 Prometheus

## 步驟

> 見 [Extended Examples](references/EXAMPLES.md) 取完整配置檔與模板。

### 步驟一：裝 NGINX Ingress 控制器

以 Helm 部署並配雲商整合。

```bash
# Add NGINX Ingress Helm repository
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

# Create namespace
kubectl create namespace ingress-nginx

# Install for cloud providers (AWS, GCP, Azure)
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --set controller.service.type=LoadBalancer \
  --set controller.metrics.enabled=true \
  --set controller.metrics.serviceMonitor.enabled=true \
  --set controller.podAnnotations."prometheus\.io/scrape"=true \
  --set controller.podAnnotations."prometheus\.io/port"=10254

# Or install for bare-metal with NodePort
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --set controller.service.type=NodePort \
  --set controller.service.nodePorts.http=30080 \
  --set controller.service.nodePorts.https=30443

# AWS-specific configuration with NLB
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --set controller.service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-type"=nlb \
  --set controller.service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-backend-protocol"=tcp \
  --set controller.service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-cross-zone-load-balancing-enabled"=true

# Verify installation
kubectl get pods -n ingress-nginx
kubectl get svc -n ingress-nginx

# Wait for LoadBalancer external IP
kubectl get svc ingress-nginx-controller -n ingress-nginx -w

# Get external IP/hostname
INGRESS_IP=$(kubectl get svc ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
INGRESS_HOST=$(kubectl get svc ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

echo "Ingress IP: $INGRESS_IP"
echo "Ingress Hostname: $INGRESS_HOST"

# Test controller
curl http://$INGRESS_IP
# Should return 404 (no backend configured yet)
```

**預期：** NGINX Ingress 控制器 pod 運行於 ingress-nginx 命名空間。LoadBalancer 服務有外部 IP。指標端點於 port 10254 可達。`/healthz` 健康檢查返 200 OK。

**失敗時：** LoadBalancer 掛起則驗雲商整合與服務配額。CrashLoopBackOff 則以 `kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller` 查控制器日誌。webhook 錯則驗 admission webhook 憑證有效。裸金屬無外 IP 則裝 MetalLB 或用 NodePort 服務類型。

### 步驟二：裝 cert-manager 以自動 TLS

部署 cert-manager 並配 Let's Encrypt ClusterIssuer。

```bash
# Install cert-manager CRDs
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.crds.yaml

# Add cert-manager Helm repository
helm repo add jetstack https://charts.jetstack.io
helm repo update

# Install cert-manager
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.13.0 \
  --set prometheus.enabled=true \
  --set webhook.timeoutSeconds=30

# Verify installation
kubectl get pods -n cert-manager
kubectl get apiservice v1beta1.webhook.cert-manager.io -o yaml

# Create Let's Encrypt staging issuer (for testing)
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-staging
spec:
  acme:
    server: https://acme-staging-v02.api.letsencrypt.org/directory
    email: admin@example.com
    privateKeySecretRef:
      name: letsencrypt-staging-account-key
    solvers:
    - http01:
        ingress:
          class: nginx
EOF

# Create Let's Encrypt production issuer
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@example.com
    privateKeySecretRef:
      name: letsencrypt-prod-account-key
    solvers:
    - http01:
        ingress:
          class: nginx
    - dns01:
        route53:
          region: us-east-1
          hostedZoneID: Z1234567890ABC
          # IAM role for EKS with IRSA
          role: arn:aws:iam::123456789012:role/cert-manager
EOF

# Verify ClusterIssuer ready
kubectl get clusterissuer
kubectl describe clusterissuer letsencrypt-prod
```

**預期：** cert-manager pod 運行於 cert-manager 命名空間。ClusterIssuer 已建並為 Ready。ACME 帳號已於 Let's Encrypt 註冊。webhook 回應憑證請求。

**失敗時：** webhook 超時錯則增 `webhook.timeoutSeconds` 或查阻 cert-manager 至 API 伺服器之網路策。ACME 註冊敗則驗 email 有效且伺服器 URL 正確。DNS01 敗則查 Route53 IAM 權限允 route53:ChangeResourceRecordSets。以 `dig +short _acme-challenge.example.com TXT` 測 DNS 傳播。

### 步驟三：建含 TLS 之基本 Ingress

部署應用並以 Ingress 暴露含自動憑證頒發。

```bash
# Deploy sample application
kubectl create deployment web --image=nginx:alpine
kubectl expose deployment web --port=80 --target-port=80

# Create Ingress resource with TLS
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-staging"  # Use staging for testing
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - web.example.com
    secretName: web-tls-secret  # cert-manager will create this
  rules:
  - host: web.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web
            port:
              number: 80
EOF

# Watch certificate creation
kubectl get certificate -w
kubectl describe certificate web-tls-secret

# Verify certificate issued
kubectl get secret web-tls-secret
kubectl get secret web-tls-secret -o jsonpath='{.data.tls\.crt}' | base64 -d | openssl x509 -text -noout

# Check cert-manager logs if issues
kubectl logs -n cert-manager -l app=cert-manager -f

# Test HTTP to HTTPS redirect
curl -I http://web.example.com
# Should return 308 Permanent Redirect to https://

# Test HTTPS
curl -v https://web.example.com
# Should return 200 OK with valid certificate

# Once tested successfully, switch to production issuer
kubectl patch ingress web-ingress -p '{"metadata":{"annotations":{"cert-manager.io/cluster-issuer":"letsencrypt-prod"}}}'
kubectl delete certificate web-tls-secret
kubectl delete secret web-tls-secret
# cert-manager will recreate with production certificate
```

**預期：** Ingress 資源已建。cert-manager 偵註並建 Certificate 資源。HTTP-01 挑戰成。TLS secret 已建含有效憑證。HTTPS 請求以可信憑證成。HTTP 重導至 HTTPS。

**失敗時：** 挑戰敗則以 `dig web.example.com` 驗 DNS 解析至 Ingress LoadBalancer IP。速率限錯則用 staging issuer 直至配正確。憑證未頒則以 `kubectl describe certificate web-tls-secret` 與 `kubectl get challenges` 查事件。「too many certificates」則 Let's Encrypt 速率限（50 憑/域/週）；候或用 staging。

### 步驟四：行進階路由與負載均衡

配路徑式路由、頭式路由、流量分。

```bash
# Deploy multiple services
kubectl create deployment api --image=hashicorp/http-echo --replicas=3 -- -text="API Service"
kubectl create deployment admin --image=hashicorp/http-echo --replicas=2 -- -text="Admin Service"
kubectl expose deployment api --port=5678
kubectl expose deployment admin --port=5678

# Create Ingress with path-based routing
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/rewrite-target: /\$2
    nginx.ingress.kubernetes.io/use-regex: "true"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - app.example.com
    secretName: app-tls
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web
            port:
              number: 80
      - path: /api(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: api
            port:
              number: 5678
      - path: /admin(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: admin
            port:
              number: 5678
EOF

# Canary deployment with traffic splitting
kubectl create deployment api-v2 --image=hashicorp/http-echo -- -text="API Service v2"
kubectl expose deployment api-v2 --port=5678

cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-canary
  annotations:
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-weight: "20"  # 20% traffic to v2
spec:
  ingressClassName: nginx
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-v2
            port:
              number: 5678
EOF

# Header-based canary routing (for testing)
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-canary-header
  annotations:
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-by-header: "X-Canary"
    nginx.ingress.kubernetes.io/canary-by-header-value: "always"
spec:
  ingressClassName: nginx
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-v2
            port:
              number: 5678
EOF

# Test routing
curl https://app.example.com/            # -> web service
curl https://app.example.com/api/        # -> 80% api, 20% api-v2
curl https://app.example.com/admin/      # -> admin service
curl -H "X-Canary: always" https://app.example.com/api/  # -> api-v2 (100%)
```

**預期：** 單一 Ingress 依路徑路由至多服務。rewrite-target 剝路徑前綴。金絲雀 Ingress 依重分流量。頭式路由發特定請求至金絲雀。TLS 於 Ingress 終結，後端用 HTTP。

**失敗時：** 404 則驗服務名與 port 合。rewrite 問題則以 `nginx.ingress.kubernetes.io/rewrite-target` 除錯器測正則。金絲雀不運則驗僅一 Ingress 為 `canary: "false"`（主）而他者為 `canary: "true"`。流量不均則查後端 pod 數與就緒探針。

### 步驟五：配速率限與認證

行速率限、basic auth、OAuth2 認證。

```bash
# Rate limiting by IP
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ratelimit
# ... (see EXAMPLES.md for complete configuration)
```

**預期：** 速率限以 503 Service Temporarily Unavailable 阻過度請求。Basic auth 求憑證、拒未授。OAuth2 導至提供者登頁、設認證 cookie。

**失敗時：** 速率限不運則驗註語法並重啟 Ingress 控制器 pod。Basic auth 500 錯則以 `kubectl get secret basic-auth -o yaml | grep auth:` 查 secret 格式。OAuth2 敗則驗用戶 ID/密與提供者註之回呼 URL。查 oauth2-proxy 日誌取詳錯。

### 步驟六：行自訂錯頁與請求改動

配自訂錯頁、CORS、請求/回應頭。

```bash
# Create ConfigMap with custom error pages
kubectl create configmap custom-errors --from-file=404.html --from-file=503.html -n ingress-nginx

# Configure NGINX to use custom error pages
cat <<EOF | kubectl apply -f -
apiVersion: v1
# ... (see EXAMPLES.md for complete configuration)
```

**預期：** 自訂 404 與 503 頁顯而非預 NGINX 頁。CORS 頭允指定源與法。安全頭護抗 XSS 與點劫。請求體大小限允大檔上傳。超時設防連接早閉。

**失敗時：** 自訂錯頁不現則驗 ConfigMap 掛至控制器 pod 且預設後端已部署。CORS 預檢敗則查後端服務允 OPTIONS 請求。413 Request Entity Too Large 則增 `proxy-body-size` 註。超時錯則三超時註同時增。

## 驗證

- [ ] NGINX Ingress 控制器運行含外部 IP
- [ ] cert-manager 自動經 Let's Encrypt 頒憑證
- [ ] HTTPS 重導於所有 Ingress 強行 SSL
- [ ] 路徑式路由將請求導至正確後端服務
- [ ] 金絲雀 Ingress 依重註分流量
- [ ] 速率限阻單 IP 過度請求
- [ ] 認證（basic auth 或 OAuth2）護管理路由
- [ ] 自訂錯頁於 404/503 錯顯
- [ ] CORS 頭允自指定域之跨源請求
- [ ] 指標端點暴露 Prometheus 指標供監控

## 常見陷阱

- **無 ingressClassName**：Ingress 未被控制器取。Kubernetes 1.19+ 總指 `ingressClassName: nginx`
- **憑證挑戰敗**：DNS 未指向 Ingress LoadBalancer。請憑證前以 `dig yourdomain.com` 驗
- **HTTP-01 挑戰超時**：防火牆阻 port 80。Let's Encrypt 須達 `http://domain/.well-known/acme-challenge/` 以驗
- **速率限全域施**：`limit-rps` 註按每 Ingress，非按路徑。不同速率限建分 Ingress
- **Rewrite-target 正則誤**：捕獲不合路徑模式。以 `echo "/api/users" | sed 's|/api(/\|$)\(.*\)|/\2|'` 測
- **金絲雀權忽**：同主機/路徑多金絲雀 Ingress 衝突。每路由僅建一金絲雀 Ingress
- **認證經 IP 繞**：認證僅於 Ingress，後端服務經 ClusterIP 可達。行網路策或服務網格
- **Configuration-snippet 注入險**：configuration-snippet 中之用戶輸入允 NGINX 配置注入。驗且清所有註

## 相關技能

- `deploy-to-kubernetes` - 建 Ingress 路由之服務
- `manage-kubernetes-secrets` - 管 TLS 憑證為 Secret
- `implement-gitops-workflow` - 以 Argo CD 宣告式管 Ingress
- `setup-service-mesh` - 以 Istio/Linkerd 行進階流量管理
- `build-ci-cd-pipeline` - CI/CD 中之自動 Ingress 更新
