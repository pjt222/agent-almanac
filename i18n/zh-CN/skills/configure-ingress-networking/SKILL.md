---
name: configure-ingress-networking
description: >
  使用 NGINX Ingress Controller 配置 Kubernetes Ingress 网络，支持通过
  cert-manager 自动管理 TLS 证书、基于路径的路由、速率限制，以及带
  SSL 终止和负载均衡的多域名托管。适用于通过单个负载均衡器暴露多个
  Kubernetes 服务、实现基于路径或主机的路由、使用 Let's Encrypt 自动化
  TLS 证书签发，或设置带流量拆分的蓝绿和金丝雀部署。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: devops
  complexity: intermediate
  language: multi
  tags: ingress, nginx, cert-manager, tls, networking
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: "2026-03-16"
---

# 配置 Ingress 网络

使用 NGINX 控制器、自动化 TLS 证书和高级路由功能，搭建生产级 Kubernetes Ingress。

## 适用场景

- 通过单个负载均衡器暴露多个 Kubernetes 服务
- 为微服务实现基于路径或主机的路由
- 使用 Let's Encrypt 自动化 TLS 证书签发和续期
- 实现速率限制、认证和 WAF 策略
- 设置带流量拆分的蓝绿或金丝雀部署
- 配置自定义错误页面和请求/响应修改

## 输入

- **必填**：支持 LoadBalancer 或 MetalLB 的 Kubernetes 集群
- **必填**：指向集群负载均衡器 IP 的 DNS 记录
- **可选**：现有 TLS 证书或 Let's Encrypt 账户
- **可选**：用于认证的 OAuth2 提供商
- **可选**：WAF 规则（ModSecurity）
- **可选**：用于指标收集的 Prometheus

## 步骤

> 完整配置文件和模板请参阅[扩展示例](references/EXAMPLES.md)。


### 第 1 步：安装 NGINX Ingress Controller

使用 Helm 部署 NGINX Ingress Controller 并配置云提供商集成。

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

**预期结果：** NGINX Ingress Controller pod 在 ingress-nginx 命名空间中运行。LoadBalancer 服务已分配外部 IP。指标端点在端口 10254 上可访问。`/healthz` 的健康检查返回 200 OK。

**失败处理：** 对于 LoadBalancer 处于 Pending 状态，验证云提供商集成和服务配额。对于 CrashLoopBackOff，使用 `kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller` 检查控制器日志。对于 Webhook 错误，验证准入 Webhook 证书是否有效。对于裸机环境无外部 IP，安装 MetalLB 或使用 NodePort 服务类型。

### 第 2 步：安装 cert-manager 实现自动化 TLS

部署 cert-manager 并配置 Let's Encrypt ClusterIssuer。

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

**预期结果：** cert-manager pod 在 cert-manager 命名空间中运行。ClusterIssuer 创建并显示 Ready 状态。ACME 账户已在 Let's Encrypt 注册。Webhook 响应证书请求。

**失败处理：** 对于 Webhook 超时错误，增加 `webhook.timeoutSeconds` 或检查阻止 cert-manager 访问 API 服务器的网络策略。对于 ACME 注册失败，验证邮件地址有效且服务器 URL 正确。对于 DNS01 失败，检查 Route53 IAM 权限是否允许 route53:ChangeResourceRecordSets。使用 `dig +short _acme-challenge.example.com TXT` 测试 DNS 传播。

### 第 3 步：创建带 TLS 的基本 Ingress

部署应用并通过 Ingress 暴露，自动签发证书。

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

**预期结果：** Ingress 资源创建完成。cert-manager 检测到注解并创建 Certificate 资源。HTTP-01 挑战成功完成。使用有效证书创建 TLS Secret。HTTPS 请求使用受信证书成功响应。HTTP 重定向到 HTTPS。

**失败处理：** 对于挑战失败，使用 `dig web.example.com` 验证 DNS 是否解析到 Ingress LoadBalancer IP。对于速率限制错误，在配置正确之前使用暂存签发者。对于证书未签发，使用 `kubectl describe certificate web-tls-secret` 和 `kubectl get challenges` 检查事件。对于"证书过多"错误，已触及 Let's Encrypt 速率限制（每域名每周 50 个证书）；等待或使用暂存环境。

### 第 4 步：实现高级路由和负载均衡

配置基于路径的路由、基于请求头的路由和流量拆分。

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

**预期结果：** 单个 Ingress 根据路径路由到多个服务。rewrite-target 去除路径前缀。金丝雀 Ingress 按权重拆分流量。基于请求头的路由将特定请求发送到金丝雀。TLS 在 Ingress 处终止，后端使用 HTTP。

**失败处理：** 对于 404 错误，验证服务名称和端口是否匹配。对于重写问题，使用 `nginx.ingress.kubernetes.io/rewrite-target` 调试器测试正则表达式。对于金丝雀不生效，验证只有一个 Ingress 带 `canary: "false"`（主路由），其他带 `canary: "true"`。对于流量分配不均衡，检查后端 pod 数量和就绪探针。

### 第 5 步：配置速率限制和认证

实现速率限制、基本认证和 OAuth2 认证。

```bash
# Rate limiting by IP
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ratelimit
# ... (see EXAMPLES.md for complete configuration)
```

**预期结果：** 速率限制以 503 Service Temporarily Unavailable 阻止过多请求。基本认证提示输入凭证，拒绝未授权请求。OAuth2 重定向到提供商登录页面，设置认证 Cookie。

**失败处理：** 对于速率限制不生效，验证注解语法并重启 Ingress 控制器 pod。对于基本认证 500 错误，使用 `kubectl get secret basic-auth -o yaml | grep auth:` 检查 Secret 格式。对于 OAuth2 失败，验证客户端 ID/Secret 和回调 URL 是否已在提供商处注册。检查 oauth2-proxy 日志获取详细错误。

### 第 6 步：实现自定义错误页面和请求修改

配置自定义错误页面、CORS 和请求/响应头。

```bash
# Create ConfigMap with custom error pages
kubectl create configmap custom-errors --from-file=404.html --from-file=503.html -n ingress-nginx

# Configure NGINX to use custom error pages
cat <<EOF | kubectl apply -f -
apiVersion: v1
# ... (see EXAMPLES.md for complete configuration)
```

**预期结果：** 显示自定义 404 和 503 页面而非默认 NGINX 页面。CORS 头允许指定来源和方法。安全头防止 XSS 和点击劫持。请求体大小限制允许大文件上传。超时设置防止连接过早关闭。

**失败处理：** 对于自定义错误页面不显示，验证 ConfigMap 是否挂载到控制器 pod 且默认后端已部署。对于 CORS 预检失败，检查后端服务是否允许 OPTIONS 请求。对于 413 Request Entity Too Large，增加 `proxy-body-size` 注解。对于超时错误，同时增加所有三个超时注解。

## 验证清单

- [ ] NGINX Ingress Controller 运行并已分配外部 IP
- [ ] cert-manager 通过 Let's Encrypt 自动签发证书
- [ ] HTTPS 重定向对所有 Ingress 强制执行 SSL
- [ ] 基于路径的路由将请求导向正确的后端服务
- [ ] 金丝雀 Ingress 根据权重注解拆分流量
- [ ] 速率限制阻止单个 IP 的过多请求
- [ ] 认证（基本认证或 OAuth2）保护管理路由
- [ ] 自定义错误页面在 404/503 时显示
- [ ] CORS 头允许来自指定域名的跨域请求
- [ ] 指标端点向 Prometheus 暴露指标

## 常见问题

- **无 ingressClassName**：Ingress 未被控制器识别。在 Kubernetes 1.19+ 中始终指定 `ingressClassName: nginx`。

- **证书挑战失败**：DNS 未指向 Ingress LoadBalancer。在申请证书前使用 `dig yourdomain.com` 验证。

- **HTTP-01 挑战超时**：防火墙阻止 80 端口。Let's Encrypt 必须能访问 `http://domain/.well-known/acme-challenge/` 进行验证。

- **速率限制全局生效**：`limit-rps` 注解按 Ingress 生效，而非按路径。为不同速率限制创建单独的 Ingress。

- **rewrite-target 正则错误**：捕获组与路径模式不匹配。使用 `echo "/api/users" | sed 's|/api(/\|$)\(.*\)|/\2|'` 测试。

- **金丝雀权重被忽略**：同一主机/路径有多个金丝雀 Ingress 冲突。每条路由只创建一个金丝雀 Ingress。

- **通过 IP 绕过认证**：认证仅在 Ingress 上，后端服务可通过 ClusterIP 访问。实现网络策略或服务网格。

- **configuration-snippet 注入风险**：configuration-snippet 中的用户输入允许 NGINX 配置注入。验证并清理所有注解。

## 相关技能

- `deploy-to-kubernetes` - 创建 Ingress 路由到的 Service
- `manage-kubernetes-secrets` - 将 TLS 证书作为 Secret 管理
- `implement-gitops-workflow` - 使用 Argo CD 声明式管理 Ingress
- `setup-service-mesh` - 使用 Istio/Linkerd 进行高级流量管理
- `build-ci-cd-pipeline` - CI/CD 中的自动化 Ingress 更新
