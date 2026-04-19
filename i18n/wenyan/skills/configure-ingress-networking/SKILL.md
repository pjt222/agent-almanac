---
name: configure-ingress-networking
locale: wenyan
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

# 設入之網

設產級 Kubernetes Ingress 附 NGINX 控、自 TLS 證、進路之能。

## 用時

- 經單載衡露多 K8s 服
- 施徑或主之路於微服
- 以 Let's Encrypt 自發與更 TLS 證
- 施率限、認、WAF 策
- 設藍綠或金絲雀附流分
- 設自定誤頁與請應之變

## 入

- **必**：支 LoadBalancer 或 MetalLB 之 K8s 簇
- **必**：DNS 指簇 LoadBalancer IP
- **可選**：現存 TLS 證或 Let's Encrypt 戶
- **可選**：認之 OAuth2 供
- **可選**：WAF 則（ModSecurity）
- **可選**：Prometheus 收量

## 法

> 見 [Extended Examples](references/EXAMPLES.md) 以全設檔。

### 第一步：裝 NGINX Ingress 控

以 Helm 部 NGINX Ingress 控且設雲供合。

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

**得：** NGINX Ingress 控 pod 行於 ingress-nginx 命名空間。LoadBalancer 服附外 IP。量端於 10254 可訪。`/healthz` 健察返 200。

**敗則：** LoadBalancer 懸則驗雲供合與服額。CrashLoopBackOff 則察控誌 `kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller`。鉤誤則驗准鉤證有效。裸機無外 IP 則裝 MetalLB 或用 NodePort。

### 第二步：裝 cert-manager 為自 TLS

部 cert-manager 且設 Let's Encrypt ClusterIssuer。

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

**得：** cert-manager pod 行於 cert-manager 命名空間。ClusterIssuer 建附 Ready 態。ACME 戶已於 Let's Encrypt 註。鉤應證求。

**敗則：** 鉤超時誤則增 `webhook.timeoutSeconds` 或察網策阻 cert-manager 於 API 伺。ACME 註敗則驗郵有效且服 URL 正。DNS01 敗則察 Route53 IAM 權許 route53:ChangeResourceRecordSets。以 `dig +short _acme-challenge.example.com TXT` 試 DNS 傳。

### 第三步：建基 Ingress 附 TLS

部應且經 Ingress 露附自證發。

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

**得：** Ingress 資建。cert-manager 察註而建 Certificate 資。HTTP-01 挑戰成。TLS 秘建附有效證。HTTPS 請以信證成。HTTP 重至 HTTPS。

**敗則：** 挑戰敗則以 `dig web.example.com` 驗 DNS 指 Ingress LoadBalancer IP。率限誤則用暫發者至設正。證不發則以 `kubectl describe certificate web-tls-secret` 與 `kubectl get challenges` 察事。「too many certificates」誤則遇 Let's Encrypt 率限（五十證/域/週）；待或用暫。

### 第四步：施進路與載衡

設徑、頭之路與流分。

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

**得：** 單 Ingress 依徑路於多服。Rewrite-target 剝徑前綴。金絲雀 Ingress 依重分流。頭之路送特請於金絲雀。TLS 終於 Ingress，後用 HTTP。

**敗則：** 404 則驗服名與埠配。重寫問則以 `nginx.ingress.kubernetes.io/rewrite-target` 調之具試正則。金絲雀不行則驗唯一 Ingress 有 `canary: "false"`（主）而他有 `canary: "true"`。流不衡則察後 pod 數與準探。

### 第五步：設率限與認

施率限、基認、OAuth2 認。

```bash
# Rate limiting by IP
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ratelimit
# ... (see EXAMPLES.md for complete configuration)
```

**得：** 率限以 503 阻過請。基認請憑，拒未權。OAuth2 重至供登頁，設認餅。

**敗則：** 率限不行則驗註法且重啟 Ingress 控 pod。基認 500 誤則以 `kubectl get secret basic-auth -o yaml | grep auth:` 察秘式。OAuth2 敗則驗客 ID/秘與回呼 URL 於供註。察 oauth2-proxy 誌詳誤。

### 第六步：施自定誤頁與請之變

設自定誤頁、CORS、請應頭。

```bash
# Create ConfigMap with custom error pages
kubectl create configmap custom-errors --from-file=404.html --from-file=503.html -n ingress-nginx

# Configure NGINX to use custom error pages
cat <<EOF | kubectl apply -f -
apiVersion: v1
# ... (see EXAMPLES.md for complete configuration)
```

**得：** 自定 404 與 503 頁代默 NGINX 頁。CORS 頭許特源與法。安頭禦 XSS 與點劫。請體限許大傳。超時設防早閉。

**敗則：** 自定誤頁不示則驗 ConfigMap 掛於控 pod 且默後已部。CORS 預檢敗則察後服許 OPTIONS 請。413 則增 `proxy-body-size` 註。超時誤則同增三超時註。

## 驗

- [ ] NGINX Ingress 控行附外 IP
- [ ] cert-manager 經 Let's Encrypt 自發證
- [ ] HTTPS 重執 SSL 於諸 Ingress
- [ ] 徑路送請於正後服
- [ ] 金絲雀 Ingress 依重註分流
- [ ] 率限阻單 IP 過請
- [ ] 認（基或 OAuth2）護管徑
- [ ] 404/503 誤示自定頁
- [ ] CORS 頭許特域跨源
- [ ] 量端為監露 Prometheus 量

## 陷

- **無 ingressClassName**：Ingress 不為控取。K8s 1.19+ 必宣 `ingressClassName: nginx`。

- **證挑戰敗**：DNS 不指 Ingress LoadBalancer。證求前以 `dig yourdomain.com` 驗。

- **HTTP-01 挑戰超時**：防火阻埠 80。Let's Encrypt 必達 `http://domain/.well-known/acme-challenge/` 以驗。

- **率限全域**：`limit-rps` 註於 Ingress 施，非於徑。為異率限建獨 Ingress。

- **Rewrite-target 正則誤**：捕不配徑式。以 `echo "/api/users" | sed 's|/api(/\|$)\(.*\)|/\2|'` 試。

- **金絲雀重忽**：同主/徑多金絲雀 Ingress 衝。每路只建一金絲雀。

- **認繞經 IP**：認只於 Ingress，後經 ClusterIP 可達。施網策或服網。

- **configuration-snippet 注險**：其中用者入許 NGINX 設注。驗淨諸註。

## 參

- `deploy-to-kubernetes` - 建 Ingress 所路之 Service
- `manage-kubernetes-secrets` - 為 Secret 治 TLS 證
- `implement-gitops-workflow` - 以 Argo CD 宣 Ingress 治
- `setup-service-mesh` - Istio/Linkerd 進流治
- `build-ci-cd-pipeline` - CI/CD 中自動 Ingress 更
