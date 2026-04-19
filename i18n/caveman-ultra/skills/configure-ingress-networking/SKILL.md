---
name: configure-ingress-networking
locale: caveman-ultra
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

# Configure Ingress Networking

Set up prod-grade Kubernetes Ingress w/ NGINX controller, automated TLS certs, advanced routing.

## Use When

- Expose multi K8s services via single LB
- Impl path-based / host-based routing for microservices
- Automate TLS cert issuance + renewal w/ Let's Encrypt
- Impl rate limiting, auth, WAF policies
- Set up blue-green / canary deployments w/ traffic splitting
- Configure custom error pages + req/res modification

## In

- **Required**: K8s cluster w/ LoadBalancer support or MetalLB
- **Required**: DNS records → cluster LB IP
- **Optional**: Existing TLS certs or Let's Encrypt account
- **Optional**: OAuth2 provider for auth
- **Optional**: WAF rules (ModSecurity)
- **Optional**: Prometheus for metrics collection

## Do

> See [Extended Examples](references/EXAMPLES.md) for complete config files + templates.


### Step 1: Install NGINX Ingress Controller

Deploy NGINX Ingress Controller w/ Helm + configure cloud provider integration.

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

**→** NGINX Ingress Controller pods running in ingress-nginx ns. LB service has external IP. Metrics endpoint accessible on port 10254. Health check `/healthz` returns 200 OK.

**If err:** Pending LB → valid. cloud provider integration + service quotas. CrashLoopBackOff → check controller logs `kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller`. Webhook errs → valid. admission webhook cert valid. No external IP bare-metal → install MetalLB or use NodePort service type.

### Step 2: Install cert-manager for Automated TLS

Deploy cert-manager + configure Let's Encrypt ClusterIssuer.

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

**→** cert-manager pods running in cert-manager ns. ClusterIssuers created w/ Ready status. ACME account reg'd w/ Let's Encrypt. Webhook responding to cert reqs.

**If err:** Webhook timeout → increase `webhook.timeoutSeconds` or check network policies blocking cert-manager to API server. ACME reg fails → valid. email valid + server URL correct. DNS01 fails → check Route53 IAM perms allow route53:ChangeResourceRecordSets. Test DNS propagation w/ `dig +short _acme-challenge.example.com TXT`.

### Step 3: Create Basic Ingress w/ TLS

Deploy app + expose via Ingress w/ auto cert issuance.

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

**→** Ingress resource created. cert-manager detects annotation + creates Cert resource. HTTP-01 challenge completes. TLS secret created w/ valid cert. HTTPS reqs succeed w/ trusted cert. HTTP redirects to HTTPS.

**If err:** Challenge fails → valid. DNS resolves to Ingress LB IP w/ `dig web.example.com`. Rate limit errs → use staging issuer until config correct. Cert not issued → check events `kubectl describe certificate web-tls-secret` + `kubectl get challenges`. "Too many certificates" → hit Let's Encrypt rate limits (50 certs/domain/week); wait or use staging.

### Step 4: Implement Advanced Routing + Load Balancing

Configure path-based routing, header-based routing, traffic splitting.

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

**→** Single Ingress routes to multi services by path. Rewrite-target strips path prefix. Canary Ingress splits traffic by weight. Header-based routing sends specific reqs to canary. TLS terminates at Ingress, backends use HTTP.

**If err:** 404 errs → valid. service names + ports match. Rewrite issues → test regex w/ `nginx.ingress.kubernetes.io/rewrite-target` debugger. Canary not working → valid. only one Ingress has `canary: "false"` (main) + others have `canary: "true"`. Traffic imbalance → check backend pod counts + readiness probes.

### Step 5: Configure Rate Limiting + Auth

Impl rate limiting, basic auth, OAuth2.

```bash
# Rate limiting by IP
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ratelimit
# ... (see EXAMPLES.md for complete configuration)
```

**→** Rate limiting blocks excessive reqs w/ 503 Service Temporarily Unavailable. Basic auth prompts for creds, rejects unauth'd reqs. OAuth2 redirects to provider login page, sets auth cookies.

**If err:** Rate limit not working → valid. annotation syntax + restart Ingress controller pods. Basic auth 500 errs → check secret format `kubectl get secret basic-auth -o yaml | grep auth:`. OAuth2 fails → valid. client ID/secret + callback URL reg'd w/ provider. Check oauth2-proxy logs for detailed errs.

### Step 6: Implement Custom Error Pages + Request Modification

Configure custom error pages, CORS, req/res headers.

```bash
# Create ConfigMap with custom error pages
kubectl create configmap custom-errors --from-file=404.html --from-file=503.html -n ingress-nginx

# Configure NGINX to use custom error pages
cat <<EOF | kubectl apply -f -
apiVersion: v1
# ... (see EXAMPLES.md for complete configuration)
```

**→** Custom 404 + 503 pages display vs. default NGINX pages. CORS headers allow specified origins + methods. Security headers protect vs. XSS + clickjacking. Req body size limit allows large file uploads. Timeout settings prevent premature connection closes.

**If err:** Custom error pages not showing → valid. ConfigMap mounted to controller pods + default backend deployed. CORS preflight fails → check OPTIONS reqs allowed in backend service. 413 Req Entity Too Large → increase `proxy-body-size` annotation. Timeout errs → increase all three timeout annotations together.

## Check

- [ ] NGINX Ingress Controller running w/ external IP
- [ ] cert-manager issues certs auto via Let's Encrypt
- [ ] HTTPS redirects enforce SSL for all Ingresses
- [ ] Path-based routing directs reqs to correct backend services
- [ ] Canary Ingresses split traffic per weight annotations
- [ ] Rate limiting blocks excessive reqs from single IP
- [ ] Auth (basic auth or OAuth2) protects admin routes
- [ ] Custom error pages display on 404/503 errs
- [ ] CORS headers allow cross-origin reqs from specified domains
- [ ] Metrics endpoint exposes Prometheus metrics for monitoring

## Traps

- **No ingressClassName**: Ingress not picked up by controller. Always specify `ingressClassName: nginx` in K8s 1.19+.

- **Cert challenges fail**: DNS doesn't point to Ingress LB. Valid. w/ `dig yourdomain.com` before requesting cert.

- **HTTP-01 challenge timeout**: Firewall blocks port 80. Let's Encrypt must reach `http://domain/.well-known/acme-challenge/` for valid.

- **Rate limit applies globally**: `limit-rps` annotation applies per Ingress, not per path. Create separate Ingresses for diff rate limits.

- **Rewrite-target regex wrong**: Captures don't match path pattern. Test w/ `echo "/api/users" | sed 's|/api(/\|$)\(.*\)|/\2|'`.

- **Canary weight ignored**: Multi canary Ingresses for same host/path conflict. Only create one canary Ingress per route.

- **Auth bypass via IP**: Auth only on Ingress, backend services accessible via ClusterIP. Impl network policies or service mesh.

- **Config-snippet injection risk**: User in in config-snippet allows NGINX config injection. Valid. + sanitize all annotations.

## →

- `deploy-to-kubernetes` - Creating Services that Ingress routes to
- `manage-kubernetes-secrets` - Managing TLS certs as Secrets
- `implement-gitops-workflow` - Declarative Ingress mgmt w/ Argo CD
- `setup-service-mesh` - Advanced traffic mgmt w/ Istio/Linkerd
- `build-ci-cd-pipeline` - Automated Ingress updates in CI/CD
