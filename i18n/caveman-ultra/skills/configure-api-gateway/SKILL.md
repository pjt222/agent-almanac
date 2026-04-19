---
name: configure-api-gateway
locale: caveman-ultra
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

# Configure API Gateway

Deploy + configure API gateway → centralized API traffic mgmt + policy enforcement.

## Use When

- Multi backend services need unified API endpoint + consistent policies
- Need centralized auth for API access
- Need rate limiting + quota mgmt across APIs
- Want transform reqs/res w/o modifying backend services
- Impl API versioning + deprecation strategies
- Need detailed API analytics + monitoring
- Need service discovery + load balancing for microservices

## In

- **Required**: Kubernetes cluster or Docker env
- **Required**: Choice of API gateway (Kong or Traefik)
- **Required**: Backend service endpoints to proxy
- **Optional**: Auth provider (OAuth2, OIDC, API keys)
- **Optional**: Rate limiting req's (reqs per min/hr)
- **Optional**: Custom middleware / plugin configs
- **Optional**: TLS certs for HTTPS endpoints

## Do

> See [Extended Examples](references/EXAMPLES.md) for complete config files + templates.

### Step 1: Install API Gateway

Deploy gateway w/ DB (Kong) or file-based config (Traefik).

**For Kong w/ PostgreSQL:**
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

**For Traefik:**
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

See [EXAMPLES.md](references/EXAMPLES.md#step-1-install-api-gateway) for complete deployment manifests

Deploy:
```bash
kubectl apply -f kong-deployment.yaml  # OR traefik-deployment.yaml
kubectl wait --for=condition=ready pod -l app=kong -n kong --timeout=300s
kubectl get svc -n kong kong-proxy  # Get load balancer IP
```

**→** Gateway pods running w/ 2 replicas. LB service has external IP. Admin API accessible (Kong: port 8001, Traefik: dashboard port 8080). Health checks pass.

**If err:**
- Check pod logs: `kubectl logs -n kong -l app=kong`
- Valid. DB connection (Kong): `kubectl logs -n kong kong-migrations-<hash>`
- Check service account perms (Traefik): `kubectl get clusterrolebinding traefik -o yaml`
- Ensure ports not already bound: `kubectl get svc --all-namespaces | grep 8000`

### Step 2: Configure Backend Services + Routes

Define upstream services + create routes to expose APIs.

**For Kong (using decK for declarative config):**
```bash
# Install decK CLI
curl -sL https://github.com/Kong/deck/releases/download/v1.28.0/deck_1.28.0_linux_amd64.tar.gz | tar -xz
sudo mv deck /usr/local/bin/

# Create kong.yaml with services, routes, upstreams
# (see EXAMPLES.md for complete configuration)
deck sync --kong-addr http://localhost:8001 -s kong.yaml
curl -i http://localhost:8001/routes  # Verify routes
```

**For Traefik (using IngressRoute CRD):**
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

Apply routes:
```bash
kubectl apply -f traefik-routes.yaml
curl -H "Host: api.example.com" https://GATEWAY_IP/api/users
```

See [EXAMPLES.md](references/EXAMPLES.md#step-2-configure-backend-services-and-routes) for complete routing configs

**→** Routes proxy traffic correct to backend services. Weighted routing distributes traffic per config. Health checks monitor backend health.

**If err:**
- Valid. backend services running: `kubectl get svc -n default`
- Check DNS resolution: `kubectl run test --rm -it --image=busybox -- nslookup user-service.default.svc.cluster.local`
- Review gateway logs: `kubectl logs -n kong -l app=kong --tail=50`
- Valid. config: `deck validate -s kong.yaml`

### Step 3: Implement Auth

Configure auth plugins/middleware for API security.

**For Kong (API Key + JWT auth):**
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

**For Traefik (BasicAuth + ForwardAuth middleware):**
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

See [EXAMPLES.md](references/EXAMPLES.md#step-3-implement-authentication-and-authorization) for complete auth configs

**→** Unauth'd reqs return 401. Valid creds allow access. Rate limiting returns 429 after threshold. JWT tokens valid. correctly. ACL enforces group perms.

**If err:**
- Valid. consumer creation: `curl http://localhost:8001/consumers`
- Check plugin enabled: `curl http://localhost:8001/plugins | jq .`
- Test w/ verbose: `curl -v` to see res headers
- Valid. JWT: use jwt.io to decode token

### Step 4: Configure Request/Response Transformation

Add middleware to transform reqs + res.

**For Kong:**
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

**For Traefik:**
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

See [EXAMPLES.md](references/EXAMPLES.md#step-4-configure-requestresponse-transformation) for complete transformation configs

**→** Req headers added/removed as config'd. Res headers include gateway metadata. Large reqs rejected w/ 413. Circuit breaker trips on repeated fails. Retries occur for transient errs.

**If err:**
- Valid. middleware order in chain
- Check for header conflicts w/ backend services
- Test transformations individually before chaining
- Review logs for transformation errs

### Step 5: Enable Monitoring + Analytics

Configure metrics, logging, dashboards for API visibility.

**Kong monitoring setup:**
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

**Traefik monitoring (built-in):**
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

See [EXAMPLES.md](references/EXAMPLES.md#step-5-enable-monitoring-and-analytics) for complete monitoring configs

**→** Prometheus scraping gateway metrics successfully. Dashboards show req rates, latency percentiles, err rates. Logs forwarding to aggregation system. Metrics segmented by service, route, consumer.

**If err:**
- Valid. ServiceMonitor: `kubectl get servicemonitor -A`
- Check Prometheus targets in UI
- Ensure metrics port accessible: `kubectl port-forward -n kong svc/kong-metrics 8100:8100`
- Valid. log endpoint reachability

### Step 6: Implement API Versioning + Deprecation

Configure version mgmt + graceful API deprecation.

**Kong versioning strategy:**
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

**Traefik versioning:**
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

Test versioning:
```bash
curl -i https://api.example.com/api/v1/users  # Deprecated
curl -i https://api.example.com/api/v2/users  # Current
curl -i https://api.example.com/api/users     # Routes to v2
```

See [EXAMPLES.md](references/EXAMPLES.md#step-6-implement-api-versioning-and-deprecation) for complete versioning configs

**→** Diff versions route to appropriate backend services. Deprecation headers on v1 res. Rate limits stricter for deprecated versions. Default path routes to latest version. Metrics segmented by API version.

**If err:**
- Valid. path precedence/priority config (higher priority = eval'd first)
- Check for overlapping path patterns
- Test each version route independently
- Review routing logs for path matching
- Ensure backend services for each version running

## Check

- [ ] API gateway pods running w/ multi replicas for HA
- [ ] LB service has external IP
- [ ] Routes proxy traffic correct to backend services
- [ ] Auth enforcing access control (401/403 res)
- [ ] Rate limiting returns 429 after exceeding quotas
- [ ] Req/res transformation adding/removing headers correct
- [ ] Circuit breaker trips on repeated backend fails
- [ ] Metrics exposed + scraped by Prometheus
- [ ] Dashboards showing req rates, latency, errs
- [ ] API versioning routing reqs to correct backend versions
- [ ] Deprecation headers on older API versions
- [ ] Health checks monitoring backend service avail

## Traps

- **DB Dependency (Kong)**: Kong w/ DB requires PostgreSQL/Cassandra. DB-less mode avail but limits features (runtime config changes). Use DB mode for prod w/ multi gateway instances.

- **Path Matching Order**: Routes/IngressRoutes evaluated in specific order. More specific paths should have higher priority. Overlapping paths → unpredictable routing. Test w/ `curl -v` to verify actual route hit.

- **Auth Bypass**: Ensure auth plugins applied to all routes. Easy to add route w/o auth. Use default plugins at service level, override per-route as needed.

- **Rate Limit Scope**: Rate limiting `policy: local` counts per gateway pod. Consistent limits across replicas → use centralized policy (Redis) or sticky sessions.

- **CORS Config**: API gateway should handle CORS, not individual services. Add CORS plugin/middleware early → avoid browser preflight fails.

- **SSL/TLS Termination**: Gateway typically terminates SSL. Ensure certs valid + auto-renewal config'd. Use cert-manager for K8s cert mgmt.

- **Upstream Health Checks**: Active health checks detect backend fails quickly. Passive checks rely on real traffic + slower to detect issues.

- **Plugin/Middleware Exec Order**: Order matters. Auth before rate limiting (avoid wasted rate limit slots for invalid reqs). Transformation before logging (log transformed values).

- **Resource Limits**: Gateway pods can consume big CPU under load. Set appropriate resource reqs/limits. Monitor CPU throttling in prod.

- **Migration Strategy**: Don't enable all plugins at once. Roll out incrementally: routing → auth → rate limiting → transformations → advanced features.

## →

- `configure-ingress-networking` - Ingress controller setup complements API gateway
- `setup-service-mesh` - Service mesh provides complementary east-west traffic mgmt
- `manage-kubernetes-secrets` - Cert + credential mgmt for gateway
- `setup-prometheus-monitoring` - Monitoring integration for gateway metrics
- `enforce-policy-as-code` - Policy enforcement complements gateway auth
