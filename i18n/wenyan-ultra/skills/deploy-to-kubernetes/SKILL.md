---
name: deploy-to-kubernetes
locale: wenyan-ultra
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

# 部署至 Kubernetes

部容器化應用至 K8s，含健康檢、資源管、自動推出。

## 用

- 新應部至 K8s 集群（EKS、GKE、AKS、自託）
- Docker Compose/傳統 VM→容器編排
- 零停機滾動更新+回滾
- K8s 管應配置+密
- 多環境部署（dev/staging/prod）
- 建可重用 Helm 圖表

## 入

- **必**：K8s 集群訪問（`kubectl cluster-info`）
- **必**：容器像已推至倉（Docker Hub、ECR、GCR、Harbor）
- **必**：應要求（端口、環境變量、卷）
- **可**：HTTPS 入 TLS 證
- **可**：持久存（StatefulSet、PVC）
- **可**：Helm CLI

## 法

> 詳例見 [Extended Examples](references/EXAMPLES.md)。

### 一：建命名空間+資源配額

以命名空間+資源限+RBAC 組織。

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

**得：** 命名空間建，配額限算力+存。LimitRange 設默認 CPU/內存請求+限。ServiceAccount 配最小 RBAC。

**敗：** 配額錯→`kubectl describe nodes` 驗集群資源足。RBAC 錯→`kubectl auth can-i create role --namespace myapp-prod` 查集群管權。`kubectl describe` 察拒資源之配額/限違。

### 二：配應密與 ConfigMap

以 ConfigMap 與 Secret 外部化配置+敏感數據。

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

複雜配用 YAML：

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

**得：** ConfigMap 存非敏感配，Secret 存憑證/鑰。值於 Pod 可經環境變量或卷掛載訪。TLS 密格式合 Ingress。

**敗：** 編碼問題→YAML 用 `stringData` 代 `data`。TLS 密錯→`openssl x509 -in tls.crt -text -noout` 驗證+鑰格式。訪問問題→查 ServiceAccount RBAC。察解碼密：`kubectl get secret myapp-secret -o jsonpath='{.data.api-key}' | base64 -d`。

### 三：建 Deployment 含健康檢+資源限

部應含生產配，含探針+資源管。

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

施用+監部署：

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

**得：** Deployment 建 3 副本行滾動策。Pod 通就緒探後始受流量。活躍探重啟不健康 Pod。資源請求/限防 OOM。日誌示應成功啟。

**敗：** ImagePullBackOff→驗像存+imagePullSecret 有效（`kubectl get secret registry-credentials -o yaml`）。CrashLoopBackOff→察日誌（`kubectl logs pod-name --previous`）。探針失→`kubectl port-forward` 手測 `curl localhost:8080/healthz`。OOMKilled→增內存限或查內存洩漏。

### 四：以 Service+負載均衡露應

建 Service 內外露應。

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp
  namespace: myapp-prod
# ... (see EXAMPLES.md for complete configuration)
```

施用+測：

```bash
# Apply services
kubectl apply -f service.yaml

# Get service details
kubectl get svc -n myapp-prod

# ... (see EXAMPLES.md for complete configuration)
```

**得：** LoadBalancer Service 預置外 LB 含公 IP/主機名。ClusterIP 供穩定內 DNS。Endpoint 列示健康 Pod IP。curl 請求成功。

**敗：** LoadBalancer pending→查雲集成+配額。無端點→`kubectl get pods --show-labels` 驗 Pod 標籤匹 Service 選擇器。連拒→驗 targetPort 匹容器端口。`kubectl port-forward` 繞 Service 層調試。

### 五：配水平 Pod 自動擴

按 CPU/內存/自定指標自動擴。

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-hpa
  namespace: myapp-prod
# ... (see EXAMPLES.md for complete configuration)
```

若無 metrics-server 則裝：

```bash
# Install metrics-server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Verify metrics-server
kubectl get deployment metrics-server -n kube-system
kubectl top nodes
# ... (see EXAMPLES.md for complete configuration)
```

**得：** HPA 監 CPU/內存。超閾時擴至 maxReplicas。負載降時漸縮（穩定窗防抖）。指標於 `kubectl top` 可見。

**敗：** 指標「unknown」→驗 metrics-server 跑+Pod 有資源請求定。無擴→`kubectl top pods` 查現用量真超目標。抖→增 stabilizationWindowSeconds。擴慢→scaleUp 策減 periodSeconds。

### 六：以 Helm 圖表打包應

建可重用多環境 Helm 圖表。

```bash
# Create Helm chart structure
helm create myapp-chart
cd myapp-chart

# Edit Chart.yaml
cat > Chart.yaml <<EOF
# ... (see EXAMPLES.md for complete configuration)
```

**得：** Helm 圖表以模板值打包諸 K8s 資源。dry-run 示渲染清單。裝以正序部署諸資源。升級行滾動更新。回滾復前版。

**敗：** 模板錯→`helm template .` 本地渲染非裝。依賴問→`helm dependency update`。值覆寫失→驗 values.yaml 內 YAML 路徑存。`helm get manifest myapp -n myapp-prod` 察實部資源。

## 驗

- [ ] Pod Running 態，諸容器就緒
- [ ] 就緒探通後 Pod 始入 Service 端點
- [ ] 活躍探自動重啟不健康容器
- [ ] 資源請求+限防 OOM+節點超負
- [ ] Secret+ConfigMap 正確掛載含期望值
- [ ] Service 其 Pod 經 DNS（cluster.local）解析
- [ ] LoadBalancer/Ingress 於外網可達
- [ ] HPA 負載擴，空縮
- [ ] 滾動更新零停機畢
- [ ] 日誌由 kubectl logs 或集中化收集訪

## 忌

- **缺就緒探**：Pod 全啟前即受流量。常行驗應依賴之就緒探。
- **啟時不足**：快活躍探殺慢啟應。用 startupProbe+寬 failureThreshold。
- **無資源限**：Pod 耗無限 CPU/內存→節點不穩。常設請求+限。
- **硬編碼配**：清單內環境特值防重用。用 ConfigMap、Secret、Helm 值。
- **默認 ServiceAccount**：Pod 有不必集群權。建專 SA+最小 RBAC。
- **無滾動策**：Deployment 同重建諸 Pod→停機。用 RollingUpdate，maxUnavailable: 0。
- **密入版本控**：敏感數據入 Git。用 sealed-secrets、external-secrets-operator 或 vault。
- **無 PDB**：集群維護排空節點+斷服。建 PodDisruptionBudget 確最少可用副本。

## 參

- `setup-docker-compose`
- `containerize-mcp-server`
- `write-helm-chart`
- `manage-kubernetes-secrets`
- `configure-ingress-networking`
- `implement-gitops-workflow`
- `setup-container-registry`
