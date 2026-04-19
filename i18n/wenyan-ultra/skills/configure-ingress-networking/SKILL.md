---
name: configure-ingress-networking
locale: wenyan-ultra
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

# 配 Ingress 網

設生產級 K8s Ingress 含 NGINX 控、自動 TLS、進階路由。

## 用

- 多 K8s 服經一負載平衡器露
- 微服之路徑或主機路
- Let's Encrypt 自動 TLS 發與更
- 施限率、鑑、WAF
- 藍綠或 canary 部含流分
- 配自錯頁與求/響改

## 入

- **必**：K8s 群含 LoadBalancer 或 MetalLB
- **必**：DNS 指群 LoadBalancer IP
- **可**：現 TLS 證或 Let's Encrypt 帳
- **可**：OAuth2 供鑑
- **可**：WAF 規（ModSecurity）
- **可**：Prometheus 集度

## 行

> 見 [Extended Examples](references/EXAMPLES.md) 以全配檔與模。

### 一：裝 NGINX Ingress 控

以 Helm 部 NGINX Ingress 控且配雲供商整。

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

**得：** NGINX Ingress 控 pod 於 ingress-nginx 命名空間行。LoadBalancer 服有外 IP。度端於 10254 可達。`/healthz` 返 200 OK。

**敗：** LoadBalancer 懸→驗雲供商整與服配額。CrashLoopBackOff→察控日誌 `kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller`。webhook 錯→驗 admission webhook 證有效。裸金無外 IP→裝 MetalLB 或用 NodePort。

### 二：裝 cert-manager 以自動 TLS

部 cert-manager 且配 Let's Encrypt ClusterIssuer。

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

**得：** cert-manager pod 於 cert-manager 命名空間行。ClusterIssuer 建且狀 Ready。ACME 帳已註冊於 Let's Encrypt。webhook 應證求。

**敗：** webhook 超時→增 `webhook.timeoutSeconds` 或察網策阻 cert-manager 至 API 服。ACME 註敗→驗郵有效與服 URL。DNS01 敗→察 Route53 IAM 權含 route53:ChangeResourceRecordSets。`dig +short _acme-challenge.example.com TXT` 測 DNS 傳。

### 三：建基 Ingress 含 TLS

部應用且以 Ingress 露，自動證發。

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

**得：** Ingress 已建。cert-manager 察注加建 Certificate。HTTP-01 挑戰成。TLS 秘建含有效證。HTTPS 求成含信證。HTTP 轉 HTTPS。

**敗：** 挑戰敗→驗 DNS 解至 Ingress LoadBalancer IP `dig web.example.com`。限率錯→staging issuer 至配正。證未發→察事 `kubectl describe certificate web-tls-secret` 與 `kubectl get challenges`。「too many certificates」→觸 Let's Encrypt 限率（50 證/域/週）；候或用 staging。

### 四：施進階路與負載平衡

配路徑、頭部路與流分。

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

**得：** 單 Ingress 依路徑路至多服。rewrite-target 削路前綴。canary Ingress 按權分流。頭部路發特求至 canary。TLS 於 Ingress 終，後端用 HTTP。

**敗：** 404→驗服名與埠匹。rewrite 問→以 `nginx.ingress.kubernetes.io/rewrite-target` 除錯器測正則。canary 不行→驗僅一 Ingress 有 `canary: "false"`（主），他 `canary: "true"`。流不均→察後端 pod 數與就緒探。

### 五：配限率與鑑

施限率、basic auth、OAuth2。

```bash
# Rate limiting by IP
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ratelimit
# ... (see EXAMPLES.md for complete configuration)
```

**得：** 限率以 503 阻過求。basic auth 問憑，拒無權。OAuth2 轉供商登，設鑑 cookie。

**敗：** 限率不行→驗注法且重啟 Ingress 控 pod。basic auth 500→察秘格 `kubectl get secret basic-auth -o yaml | grep auth:`。OAuth2 敗→驗 client ID/secret 與 callback URL 已於供商註。察 oauth2-proxy 日誌詳錯。

### 六：施自錯頁與求改

配自錯頁、CORS、求/響頭。

```bash
# Create ConfigMap with custom error pages
kubectl create configmap custom-errors --from-file=404.html --from-file=503.html -n ingress-nginx

# Configure NGINX to use custom error pages
cat <<EOF | kubectl apply -f -
apiVersion: v1
# ... (see EXAMPLES.md for complete configuration)
```

**得：** 自 404 與 503 頁替默 NGINX。CORS 頭容指源與法。安頭防 XSS 與 clickjacking。求體大限容大檔上。時設防早閉連。

**敗：** 自錯頁未現→驗 ConfigMap 掛於控 pod 且默後端已部。CORS preflight 敗→察 OPTIONS 於後端容。413 Request Entity Too Large→增 `proxy-body-size` 注。時錯→三時注同增。

## 驗

- [ ] NGINX Ingress 控行且有外 IP
- [ ] cert-manager 經 Let's Encrypt 自發證
- [ ] HTTPS 轉執諸 Ingress 之 SSL
- [ ] 路徑路至正後端
- [ ] canary Ingress 按權分流
- [ ] 限率阻單 IP 過求
- [ ] 鑑（basic 或 OAuth2）護管路
- [ ] 自錯頁現於 404/503
- [ ] CORS 頭容指域之跨源求
- [ ] 度端露 Prometheus 度以監

## 忌

- **無 ingressClassName**：Ingress 不為控拾。K8s 1.19+ 必指 `ingressClassName: nginx`。
- **證挑戰敗**：DNS 未指 Ingress LoadBalancer。請證前先 `dig yourdomain.com` 驗。
- **HTTP-01 挑戰超時**：防火牆阻 80 埠。Let's Encrypt 須達 `http://domain/.well-known/acme-challenge/` 驗。
- **限率全局**：`limit-rps` 注每 Ingress，非每路徑。異限率建別 Ingress。
- **rewrite-target 正則誤**：捕不匹路徑。`echo "/api/users" | sed 's|/api(/\|$)\(.*\)|/\2|'` 測。
- **canary 權忽**：多 canary Ingress 於同主機/路衝。每路只一 canary。
- **經 IP 繞鑑**：鑑只於 Ingress，後端可經 ClusterIP 達。施網策或服網。
- **configuration-snippet 注入險**：用戶入於 configuration-snippet 容 NGINX 配注。驗且淨諸注。

## 參

- `deploy-to-kubernetes` - 建 Ingress 所路之 Service
- `manage-kubernetes-secrets` - TLS 證為 Secret 管
- `implement-gitops-workflow` - 以 Argo CD 宣式管 Ingress
- `setup-service-mesh` - 以 Istio/Linkerd 進階流管
- `build-ci-cd-pipeline` - CI/CD 中 Ingress 自動更
