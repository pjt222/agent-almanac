# Configure API Gateway — Extended Examples

Complete configuration files and templates for Kong and Traefik API gateway deployments.

## Step 1: Install API Gateway

### Kong with PostgreSQL (Complete Deployment)

```yaml
# kong-deployment.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: kong
---
apiVersion: v1
kind: Secret
metadata:
  name: kong-postgres-secret
  namespace: kong
type: Opaque
stringData:
  POSTGRES_PASSWORD: "strongpassword123"
  POSTGRES_USER: "kong"
  POSTGRES_DB: "kong"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: kong
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:14
        envFrom:
        - secretRef:
            name: kong-postgres-secret
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: kong
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: kong
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
---
apiVersion: batch/v1
kind: Job
metadata:
  name: kong-migrations
  namespace: kong
spec:
  template:
    spec:
      containers:
      - name: kong-migrations
        image: kong:3.5
        command: ["kong", "migrations", "bootstrap"]
        env:
        - name: KONG_DATABASE
          value: postgres
        - name: KONG_PG_HOST
          value: postgres
        - name: KONG_PG_USER
          valueFrom:
            secretKeyRef:
              name: kong-postgres-secret
              key: POSTGRES_USER
        - name: KONG_PG_PASSWORD
          valueFrom:
            secretKeyRef:
              name: kong-postgres-secret
              key: POSTGRES_PASSWORD
      restartPolicy: OnFailure
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kong
  namespace: kong
spec:
  replicas: 2
  selector:
    matchLabels:
      app: kong
  template:
    metadata:
      labels:
        app: kong
    spec:
      containers:
      - name: kong
        image: kong:3.5
        env:
        - name: KONG_DATABASE
          value: postgres
        - name: KONG_PG_HOST
          value: postgres
        - name: KONG_PG_USER
          valueFrom:
            secretKeyRef:
              name: kong-postgres-secret
              key: POSTGRES_USER
        - name: KONG_PG_PASSWORD
          valueFrom:
            secretKeyRef:
              name: kong-postgres-secret
              key: POSTGRES_PASSWORD
        - name: KONG_PROXY_LISTEN
          value: "0.0.0.0:8000, 0.0.0.0:8443 ssl"
        - name: KONG_ADMIN_LISTEN
          value: "0.0.0.0:8001"
        - name: KONG_STATUS_LISTEN
          value: "0.0.0.0:8100"
        ports:
        - name: proxy
          containerPort: 8000
        - name: proxy-ssl
          containerPort: 8443
        - name: admin
          containerPort: 8001
        livenessProbe:
          httpGet:
            path: /status
            port: 8100
          initialDelaySeconds: 30
        readinessProbe:
          httpGet:
            path: /status
            port: 8100
          initialDelaySeconds: 10
        resources:
          requests:
            cpu: 250m
            memory: 512Mi
          limits:
            cpu: 1000m
            memory: 1Gi
---
apiVersion: v1
kind: Service
metadata:
  name: kong-proxy
  namespace: kong
spec:
  type: LoadBalancer
  selector:
    app: kong
  ports:
  - name: http
    port: 80
    targetPort: 8000
  - name: https
    port: 443
    targetPort: 8443
---
apiVersion: v1
kind: Service
metadata:
  name: kong-admin
  namespace: kong
spec:
  type: ClusterIP
  selector:
    app: kong
  ports:
  - name: admin
    port: 8001
```

### Traefik (Complete Deployment)

```yaml
# traefik-deployment.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: traefik
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: traefik
  namespace: traefik
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: traefik
rules:
- apiGroups: [""]
  resources: ["services", "endpoints", "secrets"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["extensions", "networking.k8s.io"]
  resources: ["ingresses", "ingressclasses"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["extensions", "networking.k8s.io"]
  resources: ["ingresses/status"]
  verbs: ["update"]
- apiGroups: ["traefik.io"]
  resources: ["*"]
  verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: traefik
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: traefik
subjects:
- kind: ServiceAccount
  name: traefik
  namespace: traefik
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: traefik-config
  namespace: traefik
data:
  traefik.yaml: |
    api:
      dashboard: true
      insecure: true
    entryPoints:
      web:
        address: ":80"
        http:
          redirections:
            entryPoint:
              to: websecure
              scheme: https
      websecure:
        address: ":443"
        http:
          tls: {}
      metrics:
        address: ":9090"
    providers:
      kubernetesIngress: {}
      kubernetesCRD: {}
    metrics:
      prometheus:
        entryPoint: metrics
    log:
      level: INFO
    accessLog:
      format: json
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: traefik
  namespace: traefik
spec:
  replicas: 2
  selector:
    matchLabels:
      app: traefik
  template:
    metadata:
      labels:
        app: traefik
    spec:
      serviceAccountName: traefik
      containers:
      - name: traefik
        image: traefik:v2.10
        args:
        - --configFile=/config/traefik.yaml
        ports:
        - name: web
          containerPort: 80
        - name: websecure
          containerPort: 443
        - name: dashboard
          containerPort: 8080
        - name: metrics
          containerPort: 9090
        volumeMounts:
        - name: config
          mountPath: /config
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 256Mi
      volumes:
      - name: config
        configMap:
          name: traefik-config
---
apiVersion: v1
kind: Service
metadata:
  name: traefik
  namespace: traefik
spec:
  type: LoadBalancer
  selector:
    app: traefik
  ports:
  - name: web
    port: 80
    targetPort: 80
  - name: websecure
    port: 443
    targetPort: 443
---
apiVersion: v1
kind: Service
metadata:
  name: traefik-dashboard
  namespace: traefik
spec:
  type: ClusterIP
  selector:
    app: traefik
  ports:
  - name: dashboard
    port: 8080
    targetPort: 8080
```

## Step 2: Configure Backend Services and Routes

### Kong Declarative Configuration (decK)

```yaml
# kong.yaml
_format_version: "3.0"

services:
- name: user-api
  url: http://user-service.default.svc.cluster.local:8080
  routes:
  - name: user-route
    paths:
    - /api/users
    methods:
    - GET
    - POST
    - PUT
    - DELETE
    strip_path: false

- name: order-api
  url: http://order-service.default.svc.cluster.local:8080
  routes:
  - name: order-route
    paths:
    - /api/orders
    methods:
    - GET
    - POST
    strip_path: false

- name: legacy-service
  url: http://legacy-backend.default.svc.cluster.local:3000
  retries: 3
  connect_timeout: 30000
  read_timeout: 30000
  routes:
  - name: legacy-route
    paths:
    - /v1/legacy
    strip_path: true
    path_handling: v1

upstreams:
- name: user-api-upstream
  targets:
  - target: user-service-v1.default.svc.cluster.local:8080
    weight: 90
  - target: user-service-v2.default.svc.cluster.local:8080
    weight: 10
  algorithm: round-robin
  healthchecks:
    active:
      healthy:
        interval: 10
        successes: 2
      unhealthy:
        interval: 10
        http_failures: 3
    passive:
      healthy:
        successes: 5
      unhealthy:
        http_failures: 5
```

### Traefik IngressRoute Configuration

```yaml
# traefik-routes.yaml
apiVersion: traefik.io/v1alpha1
kind: IngressRoute
metadata:
  name: user-api-route
  namespace: default
spec:
  entryPoints:
  - websecure
  routes:
  - match: Host(`api.example.com`) && PathPrefix(`/api/users`)
    kind: Rule
    services:
    - name: user-service
      port: 8080
      strategy: RoundRobin
    middlewares:
    - name: user-api-middleware
  tls:
    secretName: api-tls-cert
---
apiVersion: traefik.io/v1alpha1
kind: IngressRoute
metadata:
  name: order-api-route
  namespace: default
spec:
  entryPoints:
  - websecure
  routes:
  - match: Host(`api.example.com`) && PathPrefix(`/api/orders`)
    kind: Rule
    services:
    - name: order-service
      port: 8080
      strategy: Weighted
      weight: 100
    middlewares:
    - name: order-api-middleware
  tls:
    secretName: api-tls-cert
---
# Canary deployment with weighted routing
apiVersion: traefik.io/v1alpha1
kind: TraefikService
metadata:
  name: user-service-weighted
  namespace: default
spec:
  weighted:
    services:
    - name: user-service-v1
      port: 8080
      weight: 9
    - name: user-service-v2
      port: 8080
      weight: 1
```

## Step 3: Implement Authentication and Authorization

### Kong Authentication Configuration

```yaml
# kong-auth-config.yaml
_format_version: "3.0"

consumers:
- username: mobile-app
  custom_id: app-001
- username: web-client
  custom_id: app-002

# API key authentication
keyauth_credentials:
- consumer: mobile-app
  key: mobile-secret-key-123
- consumer: web-client
  key: web-secret-key-456

# JWT credentials
jwt_secrets:
- consumer: mobile-app
  key: mobile-jwt-key
  secret: mobile-jwt-secret-super-secure
  algorithm: HS256

plugins:
- name: key-auth
  service: user-api
  config:
    key_names:
    - apikey
    - X-API-KEY
    hide_credentials: true

- name: jwt
  service: order-api
  config:
    uri_param_names:
    - jwt
    cookie_names:
    - jwt
    claims_to_verify:
    - exp
    key_claim_name: iss
    secret_is_base64: false

- name: rate-limiting
  service: user-api
  consumer: mobile-app
  config:
    minute: 100
    hour: 1000
    policy: local
    fault_tolerant: true
    hide_client_headers: false

- name: acl
  service: order-api
  config:
    allow:
    - premium-users
    - admin-users
    hide_groups_header: true

acls:
- consumer: mobile-app
  group: premium-users
- consumer: web-client
  group: basic-users
```

### Traefik Authentication Middleware

```yaml
# traefik-auth-middleware.yaml
apiVersion: v1
kind: Secret
metadata:
  name: basic-auth
  namespace: default
type: Opaque
stringData:
  users: |
    user1:$apr1$H6uskkkW$IgXLP6ewTrSuBkTrqE8wj/
    user2:$apr1$d9hr9HBB$4HxwgUir3HP4EsggP/QNo0
---
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: basic-auth-middleware
  namespace: default
spec:
  basicAuth:
    secret: basic-auth
    removeHeader: true
---
# OAuth2/OIDC with ForwardAuth
apiVersion: v1
kind: Service
metadata:
  name: oauth2-proxy
  namespace: default
spec:
  selector:
    app: oauth2-proxy
  ports:
  - port: 4180
---
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: oauth-middleware
  namespace: default
spec:
  forwardAuth:
    address: http://oauth2-proxy.default.svc.cluster.local:4180
    authResponseHeaders:
    - X-Auth-User
    - X-Auth-Email
    trustForwardHeader: false
---
# Rate limiting middleware
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: rate-limit-middleware
  namespace: default
spec:
  rateLimit:
    average: 100
    period: 1m
    burst: 50
---
# Apply middleware to route
apiVersion: traefik.io/v1alpha1
kind: IngressRoute
metadata:
  name: protected-api-route
  namespace: default
spec:
  entryPoints:
  - websecure
  routes:
  - match: Host(`api.example.com`) && PathPrefix(`/api/protected`)
    kind: Rule
    middlewares:
    - name: oauth-middleware
    - name: rate-limit-middleware
    services:
    - name: protected-service
      port: 8080
```

## Step 4: Configure Request/Response Transformation

### Kong Transformation Plugins

```yaml
# kong-transformations.yaml
plugins:
- name: request-transformer
  service: user-api
  config:
    add:
      headers:
      - X-Gateway-Version:1.0
      - X-Request-ID:$(uuid)
      querystring:
      - source:gateway
    remove:
      headers:
      - X-Internal-Token
    replace:
      headers:
      - User-Agent:Kong-Gateway/3.5

- name: response-transformer
  service: user-api
  config:
    add:
      headers:
      - X-Response-Time:$(latency)
      - X-Gateway:Kong
    remove:
      headers:
      - X-Internal-Service
    json:
      - metadata.gateway:kong
      - metadata.timestamp:$(timestamp)

- name: correlation-id
  service: user-api
  config:
    header_name: X-Correlation-ID
    generator: uuid
    echo_downstream: true

- name: request-size-limiting
  service: user-api
  config:
    allowed_payload_size: 10
    size_unit: megabytes
    require_content_length: true

# Add versioning through routing
- name: request-transformer
  route: user-route
  config:
    add:
      headers:
      - X-API-Version:v2
    replace:
      uri: /v2$(uri)
```

### Traefik Transformation Middleware

```yaml
# traefik-transformations.yaml
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: add-headers
  namespace: default
spec:
  headers:
    customRequestHeaders:
      X-Gateway-Version: "1.0"
      X-Forwarded-Proto: "https"
    customResponseHeaders:
      X-Gateway: "Traefik"
      X-Content-Type-Options: "nosniff"
    sslRedirect: true
    stsSeconds: 31536000
    stsIncludeSubdomains: true
---
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: strip-prefix
  namespace: default
spec:
  stripPrefix:
    prefixes:
    - /api/v1
    - /api/v2
    forceSlash: false
---
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: compress-response
  namespace: default
spec:
  compress:
    excludedContentTypes:
    - text/event-stream
---
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: circuit-breaker
  namespace: default
spec:
  circuitBreaker:
    expression: NetworkErrorRatio() > 0.30 || ResponseCodeRatio(500, 600, 0, 600) > 0.25
---
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: retry
  namespace: default
spec:
  retry:
    attempts: 3
    initialInterval: 100ms
---
# Chain middlewares
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: user-api-middleware
  namespace: default
spec:
  chain:
    middlewares:
    - name: rate-limit-middleware
    - name: add-headers
    - name: compress-response
    - name: circuit-breaker
    - name: retry
```

## Step 5: Enable Monitoring and Analytics

### Kong Monitoring Configuration

```yaml
# kong-monitoring.yaml
plugins:
- name: prometheus
  config:
    per_consumer: true

- name: http-log
  service: user-api
  config:
    http_endpoint: http://logstash.monitoring.svc.cluster.local:8080
    method: POST
    timeout: 10000
    keepalive: 60000
    content_type: application/json
    flush_timeout: 2
    retry_count: 10

- name: file-log
  config:
    path: /dev/stdout
    custom_fields_by_lua:
      request_id: "return kong.ctx.shared.request_id"
      latency: "return kong.ctx.shared.total_latency"

- name: datadog
  config:
    host: datadog-agent.monitoring.svc.cluster.local
    port: 8125
    metrics:
    - name: request_count
      stat_type: counter
      sample_rate: 1
    - name: latency
      stat_type: gauge
      sample_rate: 1
    - name: status_count
      stat_type: counter
      sample_rate: 1
      consumer_identifier: custom_id
```

### Kong ServiceMonitor for Prometheus

```yaml
apiVersion: v1
kind: Service
metadata:
  name: kong-metrics
  namespace: kong
  labels:
    app: kong
spec:
  selector:
    app: kong
  ports:
  - name: metrics
    port: 8100
---
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: kong-metrics
  namespace: kong
spec:
  selector:
    matchLabels:
      app: kong
  endpoints:
  - port: metrics
    path: /metrics
    interval: 30s
```

### Traefik ServiceMonitor and Dashboard

```yaml
# Traefik ServiceMonitor
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: traefik-metrics
  namespace: traefik
spec:
  selector:
    matchLabels:
      app: traefik
  endpoints:
  - port: metrics
    path: /metrics
    interval: 30s
---
# Grafana dashboard ConfigMap
apiVersion: v1
kind: ConfigMap
metadata:
  name: traefik-dashboard
  namespace: monitoring
  labels:
    grafana_dashboard: "1"
data:
  traefik-dashboard.json: |
    {
      "dashboard": {
        "title": "Traefik API Gateway",
        "panels": [
          {
            "title": "Request Rate",
            "targets": [{
              "expr": "sum(rate(traefik_service_requests_total[5m])) by (service)"
            }]
          },
          {
            "title": "Response Time P95",
            "targets": [{
              "expr": "histogram_quantile(0.95, sum(rate(traefik_service_request_duration_seconds_bucket[5m])) by (le, service))"
            }]
          }
        ]
      }
    }
```

## Step 6: Implement API Versioning and Deprecation

### Kong Versioning Configuration

```yaml
# kong-versioning.yaml
services:
- name: user-api-v1
  url: http://user-service-v1.default.svc.cluster.local:8080
  routes:
  - name: user-v1-route
    paths:
    - /api/v1/users
    methods:
    - GET
    - POST
  plugins:
  - name: response-transformer
    config:
      add:
        headers:
        - X-API-Version:v1
        - X-Deprecation-Notice:"API v1 will be deprecated on 2024-12-31"
        - Sunset:"Wed, 31 Dec 2024 23:59:59 GMT"

- name: user-api-v2
  url: http://user-service-v2.default.svc.cluster.local:8080
  routes:
  - name: user-v2-route
    paths:
    - /api/v2/users
    methods:
    - GET
    - POST
  plugins:
  - name: response-transformer
    config:
      add:
        headers:
        - X-API-Version:v2

# Default routing to latest version
- name: user-api-default
  url: http://user-service-v2.default.svc.cluster.local:8080
  routes:
  - name: user-default-route
    paths:
    - /api/users
    plugins:
    - name: response-transformer
      config:
        add:
          headers:
          - X-API-Version:v2
          - Link:'</api/v2/users>; rel="canonical"'

# Rate limit deprecated versions more aggressively
- name: rate-limiting
  service: user-api-v1
  config:
    minute: 10
    hour: 100
    policy: local
```

### Traefik Versioning Configuration

```yaml
# traefik-versioning.yaml
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: v1-deprecation-headers
  namespace: default
spec:
  headers:
    customResponseHeaders:
      X-API-Version: "v1"
      X-Deprecation-Notice: "API v1 will be deprecated on 2024-12-31"
      Sunset: "Wed, 31 Dec 2024 23:59:59 GMT"
      Link: '</api/v2/users>; rel="successor-version"'
---
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: v2-headers
  namespace: default
spec:
  headers:
    customResponseHeaders:
      X-API-Version: "v2"
---
apiVersion: traefik.io/v1alpha1
kind: IngressRoute
metadata:
  name: user-api-v1
  namespace: default
spec:
  entryPoints:
  - websecure
  routes:
  - match: Host(`api.example.com`) && PathPrefix(`/api/v1/users`)
    kind: Rule
    middlewares:
    - name: v1-deprecation-headers
    - name: rate-limit-strict
    services:
    - name: user-service-v1
      port: 8080
---
apiVersion: traefik.io/v1alpha1
kind: IngressRoute
metadata:
  name: user-api-v2
  namespace: default
spec:
  entryPoints:
  - websecure
  routes:
  - match: Host(`api.example.com`) && (PathPrefix(`/api/v2/users`) || PathPrefix(`/api/users`))
    kind: Rule
    priority: 100
    middlewares:
    - name: v2-headers
    services:
    - name: user-service-v2
      port: 8080
```
