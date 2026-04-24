---
name: deploy-to-kubernetes
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Deploy applications to Kubernetes clusters using kubectl manifests for Deployments,
  Services, ConfigMaps, Secrets, and Ingress resources. Implement health checks, resource
  limits, rolling updates, and Helm chart packaging for production deployments. Use when
  deploying new applications to EKS, GKE, AKS, or self-hosted clusters, migrating from
  Docker Compose to container orchestration, implementing zero-downtime rolling updates,
  or setting up multi-environment deployments across dev, staging, and production.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: devops
  complexity: intermediate
  language: multi
  tags: kubernetes, k8s, kubectl, deployment, service
---

# Deploy to Kubernetes

Ship container apps to Kubernetes. Prod-ready config: health checks, resource limits, rolling updates.

## When Use

- Ship new app to K8s cluster (EKS, GKE, AKS, self-hosted)
- Migrate from Docker Compose or VM to container orchestration
- Zero-downtime rolling update + rollback
- Manage app config and secrets in K8s
- Multi-env deploy (dev, staging, prod)
- Build reusable Helm chart for distribution

## Inputs

- **Required**: K8s cluster access (`kubectl cluster-info`)
- **Required**: Container images in registry (Docker Hub, ECR, GCR, Harbor)
- **Required**: App needs (ports, env vars, volumes)
- **Optional**: TLS certs for HTTPS ingress
- **Optional**: Persistent storage (StatefulSets, PVCs)
- **Optional**: Helm CLI for chart deploy

## Steps

> See [Extended Examples](references/EXAMPLES.md) for complete configuration files and templates.


### Step 1: Make Namespace + Resource Quotas

Split apps into namespaces. Set resource limits, RBAC.

```bash
# Create namespace
kubectl create namespace myapp-prod

# Apply resource quota
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
  namespace: myapp-prod
spec:
  hard:
    requests.cpu: "10"
    requests.memory: "20Gi"
    limits.cpu: "20"
    limits.memory: "40Gi"
    persistentvolumeclaims: "5"
    services.loadbalancers: "2"
---
apiVersion: v1
kind: LimitRange
metadata:
  name: default-limits
  namespace: myapp-prod
spec:
  limits:
  - default:
      cpu: "500m"
      memory: "512Mi"
    defaultRequest:
      cpu: "100m"
      memory: "128Mi"
    type: Container
EOF

# Create service account
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ServiceAccount
metadata:
  name: myapp
  namespace: myapp-prod
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: myapp-role
  namespace: myapp-prod
rules:
- apiGroups: [""]
  resources: ["configmaps", "secrets"]
  verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: myapp-rolebinding
  namespace: myapp-prod
subjects:
- kind: ServiceAccount
  name: myapp
  namespace: myapp-prod
roleRef:
  kind: Role
  name: myapp-role
  apiGroup: rbac.authorization.k8s.io
EOF

# Verify namespace setup
kubectl get resourcequota -n myapp-prod
kubectl get limitrange -n myapp-prod
kubectl get sa -n myapp-prod
```

**Got:** Namespace made. Quotas cap compute + storage. LimitRange sets default CPU/memory. ServiceAccount has least-privilege RBAC.

**If fail:** Quota err? Check cluster resources: `kubectl describe nodes`. RBAC err? Check admin perms: `kubectl auth can-i create role --namespace myapp-prod`. Rejected resource? `kubectl describe` shows quota/limit violations.

### Step 2: Config App Secrets + ConfigMaps

Put config and secrets outside pod. Use ConfigMaps, Secrets.

```bash
# Create ConfigMap from literal values
kubectl create configmap myapp-config \
  --namespace=myapp-prod \
  --from-literal=LOG_LEVEL=info \
  --from-literal=API_TIMEOUT=30s \
  --from-literal=FEATURE_FLAGS='{"newUI":true,"betaAPI":false}'

# Create ConfigMap from file
cat > app.properties <<EOF
database.pool.size=20
cache.ttl=3600
retry.attempts=3
EOF

kubectl create configmap myapp-properties \
  --namespace=myapp-prod \
  --from-file=app.properties

# Create Secret for database credentials
kubectl create secret generic myapp-db-secret \
  --namespace=myapp-prod \
  --from-literal=username=appuser \
  --from-literal=password='sup3rs3cr3t!' \
  --from-literal=connection-string='postgresql://db.example.com:5432/myapp'

# Create TLS secret for ingress
kubectl create secret tls myapp-tls \
  --namespace=myapp-prod \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key

# Verify secrets/configmaps
kubectl get configmap -n myapp-prod
kubectl get secret -n myapp-prod
kubectl describe configmap myapp-config -n myapp-prod
```

Complex config? Use YAML manifests:

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: myapp-config
  namespace: myapp-prod
data:
  nginx.conf: |
    server {
      listen 8080;
      location / {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
      }
    }
  app-config.json: |
    {
      "logLevel": "info",
      "features": {
        "authentication": true,
        "metrics": true
      }
    }
---
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: myapp-secret
  namespace: myapp-prod
type: Opaque
stringData:  # Automatically base64 encoded
  api-key: "sk-1234567890abcdef"
  jwt-secret: "my-jwt-signing-key"
```

**Got:** ConfigMap holds non-sensitive config. Secret holds creds/keys. Pod reads via env var or mount. TLS secret ready for Ingress.

**If fail:** Encode issue? Use `stringData` not `data` in YAML. TLS err? Check cert/key: `openssl x509 -in tls.crt -text -noout`. Access err? Check ServiceAccount RBAC. Decode secret: `kubectl get secret myapp-secret -o jsonpath='{.data.api-key}' | base64 -d`.

### Step 3: Make Deployment with Health Checks + Limits

Deploy app. Prod-ready: probes, resource limits.

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  namespace: myapp-prod
  labels:
    app: myapp
    version: v1.0.0
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0  # Zero-downtime updates
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
        version: v1.0.0
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8080"
        prometheus.io/path: "/metrics"
    spec:
      serviceAccountName: myapp
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000
      containers:
      - name: myapp
        image: myregistry.io/myapp:v1.0.0
        imagePullPolicy: IfNotPresent
        ports:
        - name: http
          containerPort: 8080
          protocol: TCP
        env:
        - name: LOG_LEVEL
          valueFrom:
            configMapKeyRef:
              name: myapp-config
              key: LOG_LEVEL
        - name: DB_USERNAME
          valueFrom:
            secretKeyRef:
              name: myapp-db-secret
              key: username
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: myapp-db-secret
              key: password
        - name: POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: POD_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        resources:
          requests:
            cpu: 250m
            memory: 256Mi
          limits:
            cpu: 500m
            memory: 512Mi
        livenessProbe:
          httpGet:
            path: /healthz
            port: http
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: http
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 2
        startupProbe:
          httpGet:
            path: /healthz
            port: http
          initialDelaySeconds: 0
          periodSeconds: 10
          timeoutSeconds: 3
          failureThreshold: 30  # 5 minutes for slow startup
        volumeMounts:
        - name: config
          mountPath: /etc/myapp
          readOnly: true
        - name: cache
          mountPath: /var/cache/myapp
      volumes:
      - name: config
        configMap:
          name: myapp-properties
      - name: cache
        emptyDir: {}
      imagePullSecrets:
      - name: registry-credentials
```

Apply and watch:

```bash
# Apply deployment
kubectl apply -f deployment.yaml

# Watch rollout status
kubectl rollout status deployment/myapp -n myapp-prod

# Check pod status
kubectl get pods -n myapp-prod -l app=myapp

# View pod logs
kubectl logs -n myapp-prod -l app=myapp --tail=50 -f

# Describe deployment for events
kubectl describe deployment myapp -n myapp-prod

# Check resource usage
kubectl top pods -n myapp-prod -l app=myapp
```

**Got:** Deployment makes 3 replicas, rolling strategy. Pods pass readiness before traffic. Liveness restarts sick pods. Resource limits block OOM. Logs show clean startup.

**If fail:** ImagePullBackOff? Check image exists + imagePullSecret valid: `kubectl get secret registry-credentials -o yaml`. CrashLoopBackOff? Check logs: `kubectl logs pod-name --previous`. Probe fail? Test manually: `kubectl port-forward` + `curl localhost:8080/healthz`. OOMKilled? Raise memory or find leak.

### Step 4: Expose App via Services + Load Balancers

Make Service resources. Expose app inside + outside.

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp
  namespace: myapp-prod
# ... (see EXAMPLES.md for complete configuration)
```

Apply and test:

```bash
# Apply services
kubectl apply -f service.yaml

# Get service details
kubectl get svc -n myapp-prod

# ... (see EXAMPLES.md for complete configuration)
```

**Got:** LoadBalancer gets public IP/host. ClusterIP gives stable internal DNS. Endpoints show healthy Pod IPs. Curl works.

**If fail:** LoadBalancer pending? Check cloud provider + quotas. No endpoints? Pod labels must match Service selector: `kubectl get pods --show-labels`. Connection refused? Check targetPort matches container port. Debug: `kubectl port-forward` bypasses Service.

### Step 5: Config Horizontal Pod Autoscaling

Auto-scale on CPU/memory or custom metrics.

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-hpa
  namespace: myapp-prod
# ... (see EXAMPLES.md for complete configuration)
```

Need metrics-server:

```bash
# Install metrics-server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Verify metrics-server
kubectl get deployment metrics-server -n kube-system
kubectl top nodes
# ... (see EXAMPLES.md for complete configuration)
```

**Got:** HPA watches CPU/memory. Over threshold → scale up to maxReplicas. Load drops → scale down slow (stabilization stops flapping). `kubectl top` shows metrics.

**If fail:** "unknown" metrics? Check metrics-server running + Pods have resource requests. No scaling? Check utilization exceeds target: `kubectl top pods`. Flapping? Raise stabilizationWindowSeconds. Slow scale-up? Lower periodSeconds in scaleUp policies.

### Step 6: Package App with Helm Chart

Reusable Helm chart for multi-env deploy.

```bash
# Create Helm chart structure
helm create myapp-chart
cd myapp-chart

# Edit Chart.yaml
cat > Chart.yaml <<EOF
# ... (see EXAMPLES.md for complete configuration)
```

**Got:** Helm chart bundles all K8s resources with templated values. Dry-run shows rendered manifests. Install deploys in order. Upgrades = rolling update. Rollback reverts.

**If fail:** Template err? Render local: `helm template .`. Dep issue? `helm dependency update`. Value override fail? Check YAML path exists in values.yaml. Inspect deployed: `helm get manifest myapp -n myapp-prod`.

## Checks

- [ ] Pods Running, all containers ready
- [ ] Readiness probe pass before Pod gets Service endpoint
- [ ] Liveness probe restarts sick containers auto
- [ ] Resource requests + limits block OOM + node overcommit
- [ ] Secrets + ConfigMaps mounted right
- [ ] Services resolve via DNS (cluster.local) from other Pods
- [ ] LoadBalancer/Ingress reachable outside
- [ ] HPA scales up under load, down when idle
- [ ] Rolling update = zero downtime
- [ ] Logs collected via kubectl logs or central log

## Pitfalls

- **No readiness probe**: Pod gets traffic before ready. Always add readiness probe that checks app deps.

- **Not enough startup time**: Fast liveness probe kills slow-start app. Use startupProbe with big failureThreshold.

- **No resource limits**: Pod eats unlimited CPU/memory, node unstable. Always set requests + limits.

- **Hardcoded config**: Env-specific values in manifest block reuse. Use ConfigMap, Secret, Helm values.

- **Default service account**: Pod has too many perms. Make dedicated ServiceAccount, minimal RBAC.

- **No rolling strategy**: Deployment recreates all Pods at once = downtime. Use RollingUpdate, maxUnavailable: 0.

- **Secrets in git**: Sensitive data leaks. Use sealed-secrets, external-secrets-operator, vault.

- **No pod disruption budget**: Cluster maintenance drains nodes, breaks service. Make PodDisruptionBudget, keep min replicas.

## See Also

- `setup-docker-compose` - Container orchestration basics before K8s
- `containerize-mcp-server` - Build container images
- `write-helm-chart` - Deep Helm chart work
- `manage-kubernetes-secrets` - SealedSecrets + external-secrets-operator
- `configure-ingress-networking` - NGINX Ingress + cert-manager
- `implement-gitops-workflow` - ArgoCD/Flux for declarative deploy
- `setup-container-registry` - Image registry integration
