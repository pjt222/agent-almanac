# Extended Examples - Setup Service Mesh

Complete configuration files and templates for service mesh deployment.

## Step 1: Install Service Mesh Control Plane

### Istio Installation Commands

```bash
# Download Istio
curl -L https://istio.io/downloadIstio | ISTIO_VERSION=1.20.2 sh -
cd istio-1.20.2
export PATH=$PWD/bin:$PATH

# Install with demo profile (or production profile for production)
istioctl install --set profile=production -y

# Verify installation
kubectl get pods -n istio-system
kubectl get svc -n istio-system
```

### Linkerd Installation Commands

```bash
# Install Linkerd CLI
curl -sL https://run.linkerd.io/install | sh
export PATH=$PATH:$HOME/.linkerd2/bin

# Verify cluster compatibility
linkerd check --pre

# Install Linkerd control plane with HA
linkerd install --ha | kubectl apply -f -

# Verify installation
linkerd check
kubectl get pods -n linkerd
```

### Complete Service Mesh Configuration

```yaml
# service-mesh-config.yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  name: production-istio
  namespace: istio-system
spec:
  profile: production
  meshConfig:
    accessLogFile: /dev/stdout
    enableTracing: true
    defaultConfig:
      tracing:
        sampling: 100
        zipkin:
          address: jaeger-collector.observability:9411
  components:
    pilot:
      k8s:
        resources:
          requests:
            cpu: 500m
            memory: 2Gi
          limits:
            cpu: 2000m
            memory: 4Gi
    ingressGateways:
    - name: istio-ingressgateway
      enabled: true
      k8s:
        resources:
          requests:
            cpu: 200m
            memory: 256Mi
        service:
          type: LoadBalancer
```

## Step 2: Enable Automatic Sidecar Injection

### Istio Sidecar Injection Configuration

```bash
# Label namespace for automatic injection
kubectl label namespace default istio-injection=enabled
kubectl label namespace production istio-injection=enabled

# Verify label
kubectl get namespace -L istio-injection

# Create injection configuration for specific workloads
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Namespace
metadata:
  name: application
  labels:
    istio-injection: enabled
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-sidecar-injector
  namespace: istio-system
data:
  values: |
    global:
      proxy:
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 256Mi
EOF
```

### Linkerd Sidecar Injection

```bash
# Annotate namespace for injection
kubectl annotate namespace default linkerd.io/inject=enabled
kubectl annotate namespace production linkerd.io/inject=enabled

# For specific deployments, annotate the pod template
kubectl get deploy -n default -o yaml | \
  linkerd inject - | \
  kubectl apply -f -
```

### Test Deployment with Sidecar

```yaml
# test-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: test-app
  namespace: default
spec:
  replicas: 2
  selector:
    matchLabels:
      app: test-app
  template:
    metadata:
      labels:
        app: test-app
    spec:
      containers:
      - name: app
        image: nginx:alpine
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: test-app
  namespace: default
spec:
  selector:
    app: test-app
  ports:
  - port: 80
    targetPort: 80
```

## Step 3: Configure mTLS Policy

### Istio mTLS Configuration

```yaml
# mtls-policy.yaml
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: istio-system
spec:
  mtls:
    mode: STRICT
---
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default-production
  namespace: production
spec:
  mtls:
    mode: STRICT
---
# Allow specific workloads to use PERMISSIVE for migration
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: legacy-service
  namespace: production
spec:
  selector:
    matchLabels:
      app: legacy-api
  mtls:
    mode: PERMISSIVE
---
# Destination rule for TLS origination
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: global-mtls
  namespace: istio-system
spec:
  host: "*.local"
  trafficPolicy:
    tls:
      mode: ISTIO_MUTUAL
```

### Linkerd mTLS and Authorization

```bash
# Linkerd enforces mTLS by default for meshed pods
# Verify mTLS is working
linkerd viz tap deploy/test-app -n default

# Check for 🔒 (lock) symbol indicating encrypted connections
linkerd viz stat deploy -n default

# Create ServerAuthorization for fine-grained access control
cat <<EOF | kubectl apply -f -
apiVersion: policy.linkerd.io/v1beta1
kind: Server
metadata:
  name: test-app-server
  namespace: default
spec:
  podSelector:
    matchLabels:
      app: test-app
  port: 80
---
apiVersion: policy.linkerd.io/v1alpha1
kind: ServerAuthorization
metadata:
  name: test-app-authz
  namespace: default
spec:
  server:
    name: test-app-server
  client:
    meshTLS:
      serviceAccounts:
      - name: default
        namespace: production
EOF
```

## Step 4: Implement Traffic Management Rules

### Complete Istio Traffic Management

```yaml
# traffic-management.yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: api-routes
  namespace: production
spec:
  hosts:
  - api.example.com
  gateways:
  - istio-gateway
  http:
  # Canary deployment: 90% v1, 10% v2
  - match:
    - uri:
        prefix: /api/v2
    route:
    - destination:
        host: api-service
        subset: v2
      weight: 10
    - destination:
        host: api-service
        subset: v1
      weight: 90
    retries:
      attempts: 3
      perTryTimeout: 2s
      retryOn: 5xx,reset,connect-failure
    timeout: 10s
  # A/B testing based on headers
  - match:
    - headers:
        x-beta-user:
          exact: "true"
    route:
    - destination:
        host: api-service
        subset: v2
  - route:
    - destination:
        host: api-service
        subset: v1
---
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: api-circuit-breaker
  namespace: production
spec:
  host: api-service
  subsets:
  - name: v1
    labels:
      version: v1
  - name: v2
    labels:
      version: v2
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        http1MaxPendingRequests: 50
        http2MaxRequests: 100
        maxRequestsPerConnection: 2
    outlierDetection:
      consecutive5xxErrors: 5
      interval: 30s
      baseEjectionTime: 30s
      maxEjectionPercent: 50
      minHealthPercent: 40
---
# Gateway for external traffic
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  name: istio-gateway
  namespace: production
spec:
  selector:
    istio: ingressgateway
  servers:
  - port:
      number: 443
      name: https
      protocol: HTTPS
    tls:
      mode: SIMPLE
      credentialName: api-tls-cert
    hosts:
    - api.example.com
```

### Linkerd Traffic Splitting

```yaml
# linkerd-traffic-split.yaml
apiVersion: split.smi-spec.io/v1alpha2
kind: TrafficSplit
metadata:
  name: api-rollout
  namespace: production
spec:
  service: api-service
  backends:
  - service: api-service-v1
    weight: 900
  - service: api-service-v2
    weight: 100
```

## Step 5: Integrate Observability Stack

### Observability Addon Installation

```bash
# For Istio (includes Prometheus, Grafana, Kiali, Jaeger)
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/prometheus.yaml
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/grafana.yaml
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/kiali.yaml
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/jaeger.yaml

# For Linkerd
linkerd viz install | kubectl apply -f -
linkerd jaeger install | kubectl apply -f -
```

### Custom Metrics Configuration

```yaml
# service-monitor.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-grafana-dashboards
  namespace: istio-system
  labels:
    grafana_dashboard: "1"
data:
  istio-mesh-dashboard.json: |
    {
      "dashboard": {
        "title": "Istio Mesh Dashboard",
        "panels": [
          {
            "title": "Request Rate",
            "targets": [
              {
                "expr": "sum(rate(istio_requests_total[5m])) by (destination_service_name)"
              }
            ]
          },
          {
            "title": "Success Rate",
            "targets": [
              {
                "expr": "sum(rate(istio_requests_total{response_code!~\"5.*\"}[5m])) / sum(rate(istio_requests_total[5m])) * 100"
              }
            ]
          }
        ]
      }
    }
---
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: istio-mesh-metrics
  namespace: istio-system
spec:
  selector:
    matchLabels:
      app: istiod
  endpoints:
  - port: http-monitoring
    interval: 30s
    path: /metrics
```

### Custom Telemetry Configuration

```yaml
# telemetry.yaml
apiVersion: telemetry.istio.io/v1alpha1
kind: Telemetry
metadata:
  name: custom-metrics
  namespace: production
spec:
  metrics:
  - providers:
    - name: prometheus
    dimensions:
      request_path: request.path
      response_code: response.code
    overrides:
    - match:
        metric: REQUEST_COUNT
      tagOverrides:
        destination_port:
          operation: REMOVE
```

## Step 6: Validate and Monitor Mesh Health

### Mesh Health Check Script

```bash
#!/bin/bash
# mesh-health-check.sh
echo "=== Service Mesh Health Check ==="

echo "1. Control Plane Status:"
kubectl get pods -n istio-system

echo "2. Proxy Injection Status:"
kubectl get namespace -L istio-injection

echo "3. Configuration Analysis:"
istioctl analyze --all-namespaces

echo "4. mTLS Status:"
istioctl authn tls-check $(kubectl get pod -n production -l app=api-service -o jsonpath='{.items[0].metadata.name}').production

echo "5. Traffic Metrics (last 5 min):"
kubectl exec -n istio-system deploy/istiod -- \
  curl -s localhost:15014/metrics | grep istio_requests_total | tail -5

echo "=== Health Check Complete ==="
```

### Alert Configuration

```yaml
# istio-alerts.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-alerts
  namespace: istio-system
data:
  alerts.yaml: |
    groups:
    - name: istio
      interval: 30s
      rules:
      - alert: HighSidecarMemory
        expr: container_memory_usage_bytes{container="istio-proxy"} > 500000000
        for: 5m
        annotations:
          summary: "High sidecar memory usage"
      - alert: MeshConfigSyncFailed
        expr: pilot_proxy_convergence_time{job="istiod"} > 30
        for: 5m
        annotations:
          summary: "Mesh configuration sync taking too long"
```
