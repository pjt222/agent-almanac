---
name: setup-service-mesh
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Deploy and configure a service mesh (Istio or Linkerd) to enable secure service-to-service
  communication, traffic management, observability, and policy enforcement in Kubernetes clusters.
  Covers installation, mTLS configuration, traffic routing, circuit breaking, and integration
  with monitoring tools. Use when microservices need encrypted service-to-service communication,
  fine-grained traffic control for canary or A/B deployments, observability across all service
  interactions without application changes, or consistent circuit breaking and retry policies.
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

Deploy + configure service mesh for secure service-to-service comms + advanced traffic management.

## When Use

- Microservices arch needs encrypted service-to-service comms
- Need fine-grained traffic control (canary deployments, A/B testing, traffic splitting)
- Need observability across all service interactions without app changes
- Enforce security policies (mTLS, authorization) at infra level
- Implement circuit breaking, retries, timeouts consistent across services
- Need distributed tracing + service dependency mapping

## Inputs

- **Required**: Kubernetes cluster with admin access
- **Required**: Choice of service mesh (Istio or Linkerd)
- **Required**: Namespace(s) to enable service mesh
- **Optional**: Monitoring stack (Prometheus, Grafana, Jaeger)
- **Optional**: Custom traffic management requirements
- **Optional**: CA config for mTLS

## Steps

> See [Extended Examples](references/EXAMPLES.md) for complete configuration files and templates.

### Step 1: Install Service Mesh Control Plane

Choose + install service mesh control plane.

**For Istio:**
```bash
curl -L https://istio.io/downloadIstio | ISTIO_VERSION=1.20.2 sh -
istioctl install --set profile=production -y
kubectl get pods -n istio-system
```

**For Linkerd:**
```bash
curl -sL https://run.linkerd.io/install | sh
linkerd check --pre
linkerd install --ha | kubectl apply -f -
linkerd check
```

Make service mesh config with resource limits + tracing.
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

**Got:** Control plane pods running in istio-system (Istio) or linkerd (Linkerd) namespace. `istioctl version` or `linkerd version` shows matching client + server versions.

**If fail:**
- Check cluster has sufficient resources (at least 4 CPU cores, 8GB RAM for prod)
- Verify Kubernetes version compat (check mesh docs)
- Review logs: `kubectl logs -n istio-system -l app=istiod` or `kubectl logs -n linkerd -l linkerd.io/control-plane-component=controller`
- Check for conflicting CRDs: `kubectl get crd | grep istio` or `kubectl get crd | grep linkerd`

### Step 2: Enable Automatic Sidecar Injection

Configure namespaces for auto sidecar proxy injection.

**For Istio:**
```bash
# Label namespace for automatic injection
kubectl label namespace default istio-injection=enabled
kubectl get namespace -L istio-injection
```

**For Linkerd:**
```bash
# Annotate namespace for injection
kubectl annotate namespace default linkerd.io/inject=enabled
```

Test sidecar injection with sample deployment.
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

Apply + verify.
```bash
kubectl apply -f test-deployment.yaml
kubectl get pods -n default
# Expect 2/2 containers (app + proxy)
```

**Got:** New pods show 2/2 containers (app + sidecar proxy). Describe shows istio-proxy or linkerd-proxy container. Logs show successful proxy startup.

**If fail:**
- Check namespace labels/annotations: `kubectl get ns default -o yaml`
- Verify mutating webhook active: `kubectl get mutatingwebhookconfiguration`
- Review injection logs: `kubectl logs -n istio-system -l app=sidecar-injector` (Istio)
- Manually inject to test: `kubectl get deploy test-app -o yaml | istioctl kube-inject -f - | kubectl apply -f -`

### Step 3: Configure mTLS Policy

Enable mutual TLS for secure service-to-service comms.

**For Istio:**
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

**For Linkerd:**
```bash
# Linkerd enforces mTLS by default for meshed pods
linkerd viz tap deploy/test-app -n default
# Check for 🔒 (lock) symbol
```

Apply + verify.
```bash
kubectl apply -f mtls-policy.yaml
# Istio: verify mTLS status
istioctl authn tls-check $(kubectl get pod -n default -l app=test-app -o jsonpath='{.items[0].metadata.name}') -n default
```

**Got:** All connections between meshed services show mTLS enabled. Istio `tls-check` shows STATUS as "OK". Linkerd `tap` shows 🔒 for all connections. Service logs show no TLS errors.

**If fail:**
- Check certificate issuance: `kubectl get certificates -A` (cert-manager)
- Verify CA healthy: `kubectl logs -n istio-system -l app=istiod | grep -i cert`
- Test with PERMISSIVE mode first, then transition to STRICT
- Check for services without sidecars: `kubectl get pods --all-namespaces -o json | jq '.items[] | select(.spec.containers | length == 1) | .metadata.name'`

### Step 4: Implement Traffic Management Rules

Configure intelligent traffic routing, retries, circuit breaking.

Make traffic management policies.
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

**For Linkerd traffic splitting:**
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

Apply + test.
```bash
kubectl apply -f traffic-management.yaml
# Test traffic distribution
for i in {1..100}; do curl -s http://api.example.com/api/v2 | grep version; done | sort | uniq -c
# Monitor: istioctl dashboard kiali or linkerd viz dashboard
```

**Got:** Traffic splits per defined weights. Circuit breaker trips after consecutive errors. Retries occur for transient failures. Kiali/Linkerd dashboard shows traffic flow viz.

**If fail:**
- Verify destination hosts resolve: `kubectl get svc -n production`
- Check subset labels match pod labels: `kubectl get pods -n production --show-labels`
- Review pilot logs: `kubectl logs -n istio-system -l app=istiod`
- Test without circuit breaker first, add incrementally
- Use `istioctl analyze` to check config: `istioctl analyze -n production`

### Step 5: Integrate Observability Stack

Connect service mesh telemetry to monitoring + tracing systems.

**Install observability addons:**
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

Configure custom metrics + dashboards.
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

Access dashboards.
```bash
istioctl dashboard grafana  # or: linkerd viz dashboard
istioctl dashboard kiali
istioctl dashboard jaeger
```

**Got:** Dashboards show service topology, request rates, latency percentiles, error rates. Distributed traces in Jaeger. Prometheus scraping mesh metrics. Custom metrics in queries.

**If fail:**
- Verify Prometheus scraping: `kubectl get servicemonitor -A`
- Check addon pods running: `kubectl get pods -n istio-system`
- Review telemetry config: `istioctl proxy-config log <pod-name> -n <namespace>`
- Verify mesh config has telemetry enabled: `kubectl get configmap istio -n istio-system -o yaml | grep -A 5 enableTracing`
- Check for port conflicts if port-forward fails

### Step 6: Validate and Monitor Mesh Health

Run comprehensive health checks + set up ongoing monitoring.

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

Make health check script + alerts.
```bash
#!/bin/bash
# mesh-health-check.sh (abbreviated)
echo "=== Service Mesh Health Check ==="
kubectl get pods -n istio-system
istioctl analyze --all-namespaces
# See EXAMPLES.md Step 6 for complete health check script and alert configs
```

**Got:** All analysis checks pass with no warnings. Proxy-status shows all proxies synced. mTLS check confirms encryption. Metrics show traffic flowing. Control plane pods stable with low resource usage.

**If fail:**
- Address specific issues from `istioctl analyze` output
- Check proxy logs for individual pods: `kubectl logs <pod> -c istio-proxy -n <namespace>`
- Verify network policies not blocking mesh traffic
- Review control plane logs for errors: `kubectl logs -n istio-system deploy/istiod --tail=100`
- Restart problematic proxies: `kubectl rollout restart deploy/<deployment> -n <namespace>`

## Checks

- [ ] Control plane pods running + healthy (istiod/linkerd-controller)
- [ ] Sidecar proxies injected into all app pods (2/2 containers)
- [ ] mTLS enabled + functioning (verified with tls-check/tap)
- [ ] Traffic management rules routing requests correct (verified with curl tests)
- [ ] Circuit breaker trips on repeated failures (tested with fault injection)
- [ ] Observability dashboards showing metrics (Grafana/Kiali/Linkerd Viz)
- [ ] Distributed traces captured in Jaeger for sample requests
- [ ] No config warnings from istioctl analyze/linkerd check
- [ ] Proxy sync status shows all proxies in sync
- [ ] Service-to-service comms encrypted (verified in logs/dashboards)

## Pitfalls

- **Resource Exhaustion**: Service mesh adds 100-200MB memory per pod for sidecars. Ensure cluster has sufficient capacity. Set appropriate resource limits in injection config.

- **Configuration Conflicts**: Multiple VirtualServices for same host = undefined behavior. Use single VirtualService per host with multiple match conditions.

- **Certificate Expiration**: mTLS certificates auto-rotate but CA root must be managed. Monitor cert expiry with: `kubectl get certificate -A`, set up alerts.

- **Sidecar Not Injected**: Pods created before namespace labeling will not have sidecars. Must recreate: `kubectl rollout restart deploy/<name> -n <namespace>`.

- **DNS Resolution Issues**: Service mesh intercepts DNS. Use fully qualified names (service.namespace.svc.cluster.local) for cross-namespace calls.

- **Port Naming Requirement**: Istio needs named ports following protocol-name pattern (http-web, tcp-db). Unnamed ports default to TCP passthrough.

- **Gradual Rollout Required**: Do not enable STRICT mTLS immediately in prod. Use PERMISSIVE during migration, verify all services meshed, then switch to STRICT.

- **Observability Overhead**: 100% tracing sampling causes performance issues. Use 1-10% for prod: `sampling: 1.0` in mesh config.

- **Gateway vs VirtualService Confusion**: Gateway configures ingress (load balancer), VirtualService configures routing. Both required for external traffic.

- **Version Compatibility**: Ensure mesh version compat with Kubernetes version. Istio supports n-1 minor versions, Linkerd typically supports last 3 Kubernetes versions.

## See Also

- `configure-ingress-networking` - Gateway config complements mesh ingress
- `deploy-to-kubernetes` - App deployment patterns that work with service mesh
- `setup-prometheus-monitoring` - Prometheus integration for mesh metrics
- `manage-kubernetes-secrets` - Cert management for mTLS
- `enforce-policy-as-code` - OPA policies that work alongside mesh authorization
