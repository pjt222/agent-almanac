---
name: deploy-to-kubernetes
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
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

Containerized apps → K8s. Prod-ready: health checks, resource mgmt, auto rollouts.

## Use When

- New apps → K8s (EKS, GKE, AKS, self-hosted)
- Compose/VMs → orchestration migrate
- Zero-downtime rolling updates + rollbacks
- Config + secrets mgmt
- Multi-env (dev, staging, prod)
- Reusable Helm charts

## In

- **Required**: Cluster access (`kubectl cluster-info`)
- **Required**: Images in registry (Docker Hub, ECR, GCR, Harbor)
- **Required**: App reqs (ports, env vars, volumes)
- **Optional**: TLS certs → HTTPS ingress
- **Optional**: Persistent storage (StatefulSets, PVCs)
- **Optional**: Helm CLI

## Do

> See [Extended Examples](references/EXAMPLES.md) for complete configuration files and templates.

### Step 1: Namespace + resource quotas

Orgs apps → namespaces w/ limits + RBAC.

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

→ NS created w/ quotas. LimitRange sets defaults. SA least-priv RBAC.

If err: Quota → check nodes (`kubectl describe nodes`). RBAC → `kubectl auth can-i create role --namespace myapp-prod`. Rejected resources → `kubectl describe`.

### Step 2: Secrets + ConfigMaps

Externalize config + sensitive data.

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

Complex → YAML:

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

→ ConfigMaps → non-sensitive. Secrets → creds/keys. Pods read via env/volume. TLS → Ingress.

If err: Encoding → use `stringData` not `data`. TLS → `openssl x509 -in tls.crt -text -noout`. Access → SA RBAC. Decode → `kubectl get secret myapp-secret -o jsonpath='{.data.api-key}' | base64 -d`.

### Step 3: Deployment w/ health + limits

Prod-ready w/ probes + resource mgmt.

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

Apply + monitor:

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

→ 3 replicas rolling. Readiness pre-traffic. Liveness restarts unhealthy. Limits prevent OOM. Logs show startup.

If err: ImagePullBackOff → image + imagePullSecret (`kubectl get secret registry-credentials -o yaml`). CrashLoopBackOff → `kubectl logs pod-name --previous`. Probe fail → port-forward + curl. OOMKilled → increase mem or find leaks.

### Step 4: Expose via Service + LB

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp
  namespace: myapp-prod
# ... (see EXAMPLES.md for complete configuration)
```

Apply + test:

```bash
# Apply services
kubectl apply -f service.yaml

# Get service details
kubectl get svc -n myapp-prod

# ... (see EXAMPLES.md for complete configuration)
```

→ LB → external IP. ClusterIP → stable internal DNS. Endpoints = healthy pod IPs. Curl OK.

If err: LB pending → cloud integration + quotas. No endpoints → `kubectl get pods --show-labels` matches selector. Refused → targetPort matches container. Debug → `kubectl port-forward` bypass.

### Step 5: HPA

Auto scale on CPU/mem/custom.

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-hpa
  namespace: myapp-prod
# ... (see EXAMPLES.md for complete configuration)
```

Install metrics-server:

```bash
# Install metrics-server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Verify metrics-server
kubectl get deployment metrics-server -n kube-system
kubectl top nodes
# ... (see EXAMPLES.md for complete configuration)
```

→ HPA monitors. Scale up on threshold, down gradual. Metrics via `kubectl top`.

If err: "unknown" metrics → metrics-server running + pod requests defined. No scale → `kubectl top pods` vs target. Flapping → `stabilizationWindowSeconds`. Slow → reduce `periodSeconds`.

### Step 6: Helm chart

Reusable, multi-env.

```bash
# Create Helm chart structure
helm create myapp-chart
cd myapp-chart

# Edit Chart.yaml
cat > Chart.yaml <<EOF
# ... (see EXAMPLES.md for complete configuration)
```

→ Chart packages all resources. Dry-run renders. Install orders. Upgrades roll. Rollback reverts.

If err: Template → `helm template .` local render. Dep → `helm dependency update`. Values → path in values.yaml. Inspect → `helm get manifest myapp -n myapp-prod`.

## Check

- [ ] Pods Running + all ready
- [ ] Readiness pre-endpoints
- [ ] Liveness restarts unhealthy
- [ ] Reqs/limits prevent OOM + overcommit
- [ ] Secrets/ConfigMaps mounted
- [ ] Svcs DNS resolve (cluster.local)
- [ ] LB/Ingress external
- [ ] HPA scales up/down
- [ ] Rolling zero-downtime
- [ ] Logs → kubectl or centralized

## Traps

- **No readiness**: Traffic before ready. Always readiness probes verify deps.
- **Insufficient startup**: Fast liveness kills slow apps. Use startupProbe w/ high failureThreshold.
- **No resource limits**: Unlimited CPU/mem → node instability. Always set reqs + limits.
- **Hardcoded config**: Env-specific in manifests → no reuse. ConfigMaps, Secrets, Helm values.
- **Default SA**: Unnecessary perms. Dedicated SA + minimal RBAC.
- **No rolling strategy**: Recreate all → downtime. RollingUpdate + maxUnavailable: 0.
- **Secrets in VCS**: Sensitive → Git. Sealed-secrets, external-secrets-operator, or vault.
- **No PDB**: Cluster maint drains → break. PodDisruptionBudget → min available.

## →

- `setup-docker-compose` — container fundamentals pre-K8s
- `containerize-mcp-server` — images for deploy
- `write-helm-chart` — advanced Helm
- `manage-kubernetes-secrets` — SealedSecrets + external-secrets-operator
- `configure-ingress-networking` — NGINX Ingress + cert-manager
- `implement-gitops-workflow` — ArgoCD/Flux declarative
- `setup-container-registry` — registry integration
