---
name: setup-service-mesh
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Deploy+configure service mesh (Istio|Linkerd) → secure svc-to-svc, traffic mgmt, observability, policy enforce in K8s. Install, mTLS, routing, circuit break, monitoring integ. Use → microservices need encrypted svc-to-svc, fine traffic ctrl (canary|A/B), observability w/o app changes, consistent circuit break+retry policies.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: devops
  complexity: advanced
  language: multi
  tags: service-mesh, istio, linkerd, mtls, traffic-management, observability, kubernetes
---

# Setup Service Mesh

Deploy+configure mesh → secure svc-to-svc + advanced traffic mgmt.

## Use When

- Microservices arch needs encrypted svc-to-svc
- Fine traffic ctrl (canary, A/B, splitting)
- Observability across all svc interactions w/o app changes
- Enforce security policies (mTLS, authz) at infra level
- Impl circuit break, retries, timeouts consistent
- Distributed tracing + svc dependency mapping

## In

- **Required**: K8s cluster w/ admin
- **Required**: Mesh choice (Istio|Linkerd)
- **Required**: Namespace(s) to enable
- **Optional**: Monitoring stack (Prometheus, Grafana, Jaeger)
- **Optional**: Custom traffic mgmt reqs
- **Optional**: CA config for mTLS

## Do

> See [Extended Examples](references/EXAMPLES.md) for complete config + templates.

### Step 1: Install Control Plane

**Istio:**
```bash
curl -L https://istio.io/downloadIstio | ISTIO_VERSION=1.20.2 sh -
istioctl install --set profile=production -y
kubectl get pods -n istio-system
```

**Linkerd:**
```bash
curl -sL https://run.linkerd.io/install | sh
linkerd check --pre
linkerd install --ha | kubectl apply -f -
linkerd check
```

Mesh config w/ resource limits + tracing:
```yaml
# service-mesh-config.yaml (abbreviated)
spec:
  profile: production
  meshConfig:
    enableTracing: true
  components:
    pilot:
      k8s:
        resources: { requests: { cpu: 500m, memory: 2Gi } }
# See EXAMPLES.md Step 1 for complete configuration
```

→ Control plane pods running in istio-system|linkerd ns. `istioctl version`|`linkerd version` shows matching client+server.

If err:
- Cluster has resources (≥4 CPU, 8GB RAM prod)
- K8s ver compat (check mesh docs)
- Logs: `kubectl logs -n istio-system -l app=istiod`|`kubectl logs -n linkerd -l linkerd.io/control-plane-component=controller`
- Conflicting CRDs: `kubectl get crd | grep istio`|`grep linkerd`

### Step 2: Auto Sidecar Injection

**Istio:**
```bash
# Label namespace for automatic injection
kubectl label namespace default istio-injection=enabled
kubectl get namespace -L istio-injection
```

**Linkerd:**
```bash
# Annotate namespace for injection
kubectl annotate namespace default linkerd.io/inject=enabled
```

Test:
```yaml
# test-deployment.yaml (abbreviated)
apiVersion: apps/v1
kind: Deployment
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: app
        image: nginx:alpine
# See EXAMPLES.md Step 2 for complete test deployment
```

```bash
kubectl apply -f test-deployment.yaml
kubectl get pods -n default
# Expect 2/2 containers (app + proxy)
```

→ New pods 2/2 (app + sidecar). Describe shows istio-proxy|linkerd-proxy. Logs show successful proxy startup.

If err:
- Labels|annotations: `kubectl get ns default -o yaml`
- Webhook active: `kubectl get mutatingwebhookconfiguration`
- Inject logs: `kubectl logs -n istio-system -l app=sidecar-injector` (Istio)
- Manual inject test: `kubectl get deploy test-app -o yaml | istioctl kube-inject -f - | kubectl apply -f -`

### Step 3: mTLS Policy

**Istio:**
```yaml
# mtls-policy.yaml (abbreviated)
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: istio-system
spec:
  mtls:
    mode: STRICT
# See EXAMPLES.md Step 3 for per-namespace and permissive mode examples
```

**Linkerd:**
```bash
# Linkerd enforces mTLS by default for meshed pods
linkerd viz tap deploy/test-app -n default
# Check for 🔒 (lock) symbol
```

Apply + verify:
```bash
kubectl apply -f mtls-policy.yaml
# Istio: verify mTLS status
istioctl authn tls-check $(kubectl get pod -n default -l app=test-app -o jsonpath='{.items[0].metadata.name}') -n default
```

→ All meshed conns mTLS enabled. Istio `tls-check` STATUS "OK". Linkerd `tap` 🔒 all conns. No TLS errs in logs.

If err:
- Cert issuance: `kubectl get certificates -A` (cert-manager)
- CA healthy: `kubectl logs -n istio-system -l app=istiod | grep -i cert`
- PERMISSIVE first → STRICT
- Svcs w/o sidecars: `kubectl get pods --all-namespaces -o json | jq '.items[] | select(.spec.containers | length == 1) | .metadata.name'`

### Step 4: Traffic Mgmt Rules

```yaml
# traffic-management.yaml (abbreviated)
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
spec:
  http:
  - match:
    - uri: { prefix: /api/v2 }
    route:
    - destination: { host: api-service, subset: v2 }
      weight: 10
    - destination: { host: api-service, subset: v1 }
      weight: 90
    retries: { attempts: 3, perTryTimeout: 2s }
# See EXAMPLES.md Step 4 for complete routing, circuit breaker, and gateway configs
```

**Linkerd traffic split:**
```yaml
apiVersion: split.smi-spec.io/v1alpha2
kind: TrafficSplit
spec:
  service: api-service
  backends:
  - service: api-service-v1
    weight: 900
  - service: api-service-v2
    weight: 100
```

Apply + test:
```bash
kubectl apply -f traffic-management.yaml
# Test traffic distribution
for i in {1..100}; do curl -s http://api.example.com/api/v2 | grep version; done | sort | uniq -c
# Monitor: istioctl dashboard kiali or linkerd viz dashboard
```

→ Splits per weights. Circuit breaker trips after consecutive errs. Retries on transient. Kiali|Linkerd dashboard shows flow viz.

If err:
- Dest hosts resolve: `kubectl get svc -n production`
- Subset labels match pod: `kubectl get pods -n production --show-labels`
- Pilot logs: `kubectl logs -n istio-system -l app=istiod`
- Test w/o circuit breaker first → add incrementally
- `istioctl analyze -n production`

### Step 5: Observability Integration

**Install addons:**
```bash
# Istio: Prometheus, Grafana, Kiali, Jaeger
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/prometheus.yaml
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/grafana.yaml
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/kiali.yaml
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/jaeger.yaml

# Linkerd
linkerd viz install | kubectl apply -f -
linkerd jaeger install | kubectl apply -f -
```

Custom metrics + dashboards:
```yaml
# service-monitor.yaml (abbreviated)
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: istio-mesh-metrics
spec:
  selector: { matchLabels: { app: istiod } }
  endpoints:
  - port: http-monitoring
    interval: 30s
# See EXAMPLES.md Step 5 for Grafana dashboards and telemetry config
```

Access:
```bash
istioctl dashboard grafana  # or: linkerd viz dashboard
istioctl dashboard kiali
istioctl dashboard jaeger
```

→ Dashboards show topology, request rates, latency percentiles, err rates. Distributed traces in Jaeger. Prometheus scraping mesh metrics. Custom metrics in queries.

If err:
- Prometheus scraping: `kubectl get servicemonitor -A`
- Addon pods running: `kubectl get pods -n istio-system`
- Telemetry config: `istioctl proxy-config log <pod-name> -n <namespace>`
- Mesh config has tracing: `kubectl get configmap istio -n istio-system -o yaml | grep -A 5 enableTracing`
- Port conflicts if port-forward fails

### Step 6: Validate + Monitor Mesh Health

```bash
# Istio validation
istioctl analyze --all-namespaces
istioctl verify-install
istioctl proxy-status

# Linkerd validation
linkerd check
linkerd viz check
linkerd diagnostics policy

# Check proxy sync status
kubectl get pods -n production -o json | \
  jq '.items[] | {name: .metadata.name, proxy: .status.containerStatuses[] | select(.name=="istio-proxy").ready}'

# Monitor control plane health
kubectl get pods -n istio-system -w
kubectl top pods -n istio-system
```

Health check + alerts:
```bash
#!/bin/bash
# mesh-health-check.sh (abbreviated)
echo "=== Service Mesh Health Check ==="
kubectl get pods -n istio-system
istioctl analyze --all-namespaces
# See EXAMPLES.md Step 6 for complete health check script and alert configs
```

→ All checks pass no warns. Proxy-status all synced. mTLS check confirms encryption. Metrics show traffic. Control plane stable, low resource use.

If err:
- Address `istioctl analyze` output
- Proxy logs per pod: `kubectl logs <pod> -c istio-proxy -n <namespace>`
- Net policies not blocking mesh
- Control plane logs: `kubectl logs -n istio-system deploy/istiod --tail=100`
- Restart problematic: `kubectl rollout restart deploy/<deployment> -n <namespace>`

## Check

- [ ] Control plane pods running healthy (istiod|linkerd-controller)
- [ ] Sidecars injected all app pods (2/2)
- [ ] mTLS enabled+functioning (tls-check|tap verified)
- [ ] Traffic rules route correctly (curl tests)
- [ ] Circuit breaker trips on repeated fails (fault inject)
- [ ] Observability dashboards show metrics (Grafana|Kiali|Linkerd Viz)
- [ ] Distributed traces in Jaeger
- [ ] No warnings from `istioctl analyze`|`linkerd check`
- [ ] Proxy sync status all in sync
- [ ] Svc-to-svc encrypted (logs|dashboards verified)

## Traps

- **Resource exhaustion**: Mesh adds 100-200MB/pod for sidecars. Cluster needs capacity. Set limits in inject config.
- **Config conflicts**: Multi VirtualServices same host = undefined behavior. Single VS per host w/ multi match conditions.
- **Cert expiration**: mTLS auto-rotate but CA root managed. Monitor expiry: `kubectl get certificate -A` + alerts.
- **Sidecar not injected**: Pods pre-label won't have sidecars. Recreate: `kubectl rollout restart deploy/<name> -n <namespace>`.
- **DNS issues**: Mesh intercepts DNS. Use FQ names (service.namespace.svc.cluster.local) cross-ns.
- **Port naming req**: Istio needs named ports protocol-name pattern (http-web, tcp-db). Unnamed → TCP passthrough.
- **Gradual rollout req**: Don't enable STRICT mTLS immediate prod. PERMISSIVE during migration → verify all meshed → STRICT.
- **Observability overhead**: 100% tracing sampling = perf issues. Use 1-10% prod: `sampling: 1.0` in mesh config.
- **Gateway vs VS confusion**: Gateway = ingress (LB), VS = routing. Both needed for external.
- **Ver compat**: Mesh ver compat w/ K8s. Istio supports n-1 minor; Linkerd typically last 3 K8s vers.

## →

- `configure-ingress-networking` — Gateway complements mesh ingress
- `deploy-to-kubernetes` — app deploy patterns w/ mesh
- `setup-prometheus-monitoring` — Prometheus integ for mesh metrics
- `manage-kubernetes-secrets` — cert mgmt for mTLS
- `enforce-policy-as-code` — OPA policies alongside mesh authz
