# Deploy to Kubernetes — Extended Examples

Complete configuration files and code templates.


## Step 1: Create Namespace and Resource Quotas

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


## Step 2: Configure Application Secrets and ConfigMaps

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


## Step 3: Create Deployment with Health Checks and Resource Limits

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

No `replicas:` field: the HPA in Step 5 targets this Deployment and owns the
count. Declaring both makes every client-side `kubectl apply` — the default —
reset what the autoscaler chose; under `--server-side`, once the HPA has written
the field, the apply is refused with a conflict on `.spec.replicas` instead.
Without the field the Deployment starts at the API default of one replica and the
HPA raises it to `minReplicas`.

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


## Step 4: Expose Application with Services and Load Balancers

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp
  namespace: myapp-prod
  labels:
    app: myapp
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-type: "nlb"
    service.beta.kubernetes.io/aws-load-balancer-backend-protocol: "http"
spec:
  type: LoadBalancer
  selector:
    app: myapp
  ports:
  - name: http
    port: 80
    targetPort: http
    protocol: TCP
  sessionAffinity: ClientIP
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 10800
---
# Internal service for inter-service communication
apiVersion: v1
kind: Service
metadata:
  name: myapp-internal
  namespace: myapp-prod
  labels:
    app: myapp
spec:
  type: ClusterIP
  selector:
    app: myapp
  ports:
  - name: http
    port: 8080
    targetPort: http
    protocol: TCP
  - name: metrics
    port: 9090
    targetPort: metrics
    protocol: TCP
---
# Headless service for StatefulSets
apiVersion: v1
kind: Service
metadata:
  name: myapp-headless
  namespace: myapp-prod
spec:
  clusterIP: None
  selector:
    app: myapp
  ports:
  - name: http
    port: 8080
    targetPort: http
```

```bash
# Apply services
kubectl apply -f service.yaml

# Get service details
kubectl get svc -n myapp-prod

# Wait for LoadBalancer external IP
kubectl get svc myapp -n myapp-prod -w

# Test internal service
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -n myapp-prod -- \
  curl http://myapp-internal.myapp-prod.svc.cluster.local:8080/healthz

# Test external LoadBalancer
EXTERNAL_IP=$(kubectl get svc myapp -n myapp-prod -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
curl http://$EXTERNAL_IP/healthz

# Check endpoints
kubectl get endpoints myapp -n myapp-prod
```


## Step 5: Configure Horizontal Pod Autoscaling

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-hpa
  namespace: myapp-prod
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
      - type: Pods
        value: 2
        periodSeconds: 60
      selectPolicy: Min
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 30
      - type: Pods
        value: 4
        periodSeconds: 30
      selectPolicy: Max
```

```bash
# Install metrics-server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Verify metrics-server
kubectl get deployment metrics-server -n kube-system
kubectl top nodes
kubectl top pods -n myapp-prod

# Apply HPA
kubectl apply -f hpa.yaml

# Check HPA status
kubectl get hpa -n myapp-prod
kubectl describe hpa myapp-hpa -n myapp-prod

# Generate load to test autoscaling
kubectl run -i --tty load-generator --rm --image=busybox --restart=Never -- /bin/sh -c "while sleep 0.01; do wget -q -O- http://myapp.myapp-prod.svc.cluster.local; done"

# Watch scaling in another terminal
kubectl get hpa myapp-hpa -n myapp-prod --watch
```


## Step 6: Package Application with Helm Chart

`replicaCount` in the values below is not the same decision as the Deployment's
`replicas:` field above. The `helm create` scaffold this chart starts from guards
its template's `replicas:` line behind `{{- if not .Values.autoscaling.enabled }}`,
so with `autoscaling.enabled: true` the value is inert and `minReplicas` is the
floor that applies. It is kept here because it is the value a chart with
autoscaling disabled would use — delete it only if you also delete the guard.

```bash
# Create Helm chart structure
helm create myapp-chart
cd myapp-chart

# Edit Chart.yaml
cat > Chart.yaml <<EOF
apiVersion: v2
name: myapp
description: A Helm chart for MyApp
type: application
version: 1.0.0
appVersion: "1.0.0"
keywords:
  - web
  - api
maintainers:
  - name: Philipp Thoss
    email: ph.thoss@example.com
EOF

# Edit values.yaml
cat > values.yaml <<EOF
replicaCount: 3

image:
  repository: myregistry.io/myapp
  pullPolicy: IfNotPresent
  tag: "v1.0.0"

imagePullSecrets:
  - name: registry-credentials

serviceAccount:
  create: true
  name: myapp

service:
  type: LoadBalancer
  port: 80
  targetPort: 8080

ingress:
  enabled: false
  className: nginx
  hosts:
    - host: myapp.example.com
      paths:
        - path: /
          pathType: Prefix

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70

config:
  logLevel: info
  apiTimeout: 30s

secrets:
  dbUsername: appuser
  dbPassword: changeme
EOF

# Edit templates/deployment.yaml to use values
# (Helm will template {{ .Values.replicaCount }}, etc.)

# Validate chart
helm lint .

# Dry-run to see rendered manifests
helm install myapp . --dry-run --debug --namespace myapp-prod

# Install chart
helm install myapp . --namespace myapp-prod --create-namespace

# Upgrade with new values
helm upgrade myapp . --namespace myapp-prod --set image.tag=v1.1.0

# Rollback if needed
helm rollback myapp 1 --namespace myapp-prod

# List releases
helm list -n myapp-prod

# Uninstall
helm uninstall myapp -n myapp-prod
```

