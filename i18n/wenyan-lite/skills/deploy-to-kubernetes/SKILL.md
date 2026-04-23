---
name: deploy-to-kubernetes
locale: wenyan-lite
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

部署容器化應用於 Kubernetes，具健康檢查、資源管理、自動化推出等生產級配置。

## 適用時機

- 部署新應用於 Kubernetes 集群（EKS、GKE、AKS、自託管）
- 自 Docker Compose 或傳統 VM 遷至容器編排
- 行零停機滾動更新與回滾
- 於 Kubernetes 管應用配置與秘鑰
- 設多環境部署（dev、staging、production）
- 建可重用之 Helm chart 以供應用分發

## 輸入

- **必需**：Kubernetes 集群存取（`kubectl cluster-info`）
- **必需**：已推至登錄之容器映像（Docker Hub、ECR、GCR、Harbor）
- **必需**：應用需求（埠、環境變數、卷宗）
- **可選**：HTTPS ingress 之 TLS 憑證
- **可選**：持久儲存需求（StatefulSets、PVCs）
- **可選**：基於 chart 部署用之 Helm CLI

## 步驟

> 完整配置檔案與模板，見 [Extended Examples](references/EXAMPLES.md)。


### 步驟一：建命名空間與資源配額

將應用分入命名空間，具資源限與 RBAC。

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

**預期：** 命名空間建成，具限計算與儲存之資源配額。LimitRange 設預設之 CPU/記憶體請求與限。ServiceAccount 以最小權限 RBAC 配之。

**失敗時：** 配額錯誤時，以 `kubectl describe nodes` 驗集群資源是否足。RBAC 錯誤時，以 `kubectl auth can-i create role --namespace myapp-prod` 檢集群管理權限。於被拒資源用 `kubectl describe` 以見配額/限違反。

### 步驟二：配應用秘鑰與 ConfigMap

以 ConfigMap 與 Secret 外部化配置與敏感資料。

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

更複雜之配置宜用 YAML 清單：

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

**預期：** ConfigMap 存非敏感之配置，Secret 存憑證/金鑰。值透過環境變數或卷宗掛載供 Pod 存取。TLS 秘鑰合 Ingress 資源之格式。

**失敗時：** 編碼問題時，YAML 中以 `stringData` 替 `data`。TLS 秘鑰錯誤時，以 `openssl x509 -in tls.crt -text -noout` 驗憑證與金鑰格式。存取問題時，查 ServiceAccount 之 RBAC 權限。以 `kubectl get secret myapp-secret -o jsonpath='{.data.api-key}' | base64 -d` 觀解碼之秘鑰。

### 步驟三：建具健康檢查與資源限之 Deployment

部署應用，具探針與資源管理之生產級配置。

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

應用並監部署：

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

**預期：** Deployment 以滾動更新策略建 3 副本。Pod 於 readiness 探針通過後方收流量。Liveness 探針重啟不健康之 pod。資源請求/限防 OOM kill。日誌示應用成功啟動。

**失敗時：** ImagePullBackOff 時，以 `kubectl get secret registry-credentials -o yaml` 驗映像存且 imagePullSecret 有效。CrashLoopBackOff 時，以 `kubectl logs pod-name --previous` 查日誌。探針失敗時，以 `kubectl port-forward` 與 `curl localhost:8080/healthz` 人工測端點。Pod 被 OOMKilled 時，增記憶體限或查記憶體洩漏。

### 步驟四：以 Service 與負載均衡器暴露應用

建 Service 資源以於內部與外部暴露應用。

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp
  namespace: myapp-prod
# ... (see EXAMPLES.md for complete configuration)
```

應用並測 Service：

```bash
# Apply services
kubectl apply -f service.yaml

# Get service details
kubectl get svc -n myapp-prod

# ... (see EXAMPLES.md for complete configuration)
```

**預期：** LoadBalancer Service 配外部 LB 具公開 IP/主機名。ClusterIP Service 提供穩定之內部 DNS。Endpoints 列示健康之 Pod IP。Curl 請求以預期回應成功。

**失敗時：** LoadBalancer 懸而未決時，查雲提供者整合與配額。無 endpoints 時，以 `kubectl get pods --show-labels` 驗 Pod 標籤合 Service selector。連線被拒時，驗 targetPort 合容器埠。除錯時以 `kubectl port-forward` 繞過 Service 層。

### 步驟五：配水平 Pod 自動擴展

依 CPU/記憶體或自定指標行自動擴展。

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-hpa
  namespace: myapp-prod
# ... (see EXAMPLES.md for complete configuration)
```

若 metrics-server 不可用則裝之：

```bash
# Install metrics-server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Verify metrics-server
kubectl get deployment metrics-server -n kube-system
kubectl top nodes
# ... (see EXAMPLES.md for complete configuration)
```

**預期：** HPA 監 CPU/記憶體指標。超閾值時，副本擴至 maxReplicas。負載減時，副本漸縮（穩定窗防震盪）。指標以 `kubectl top` 可見。

**失敗時：** 「unknown」指標時，驗 metrics-server 運行且 Pod 已定資源請求。無擴展時，以 `kubectl top pods` 查當前利用率實超目標。震盪時，增 stabilizationWindowSeconds。擴展慢時，於 scaleUp 策略中減 periodSeconds。

### 步驟六：以 Helm Chart 打包應用

建可重用之 Helm chart 以供多環境部署。

```bash
# Create Helm chart structure
helm create myapp-chart
cd myapp-chart

# Edit Chart.yaml
cat > Chart.yaml <<EOF
# ... (see EXAMPLES.md for complete configuration)
```

**預期：** Helm chart 以模板化值打包所有 Kubernetes 資源。乾執行示渲染之清單。裝以正確順序部署所有資源。升級行滾動更新。回滾還原至前一版本。

**失敗時：** 模板錯誤時，執 `helm template .` 以本地渲染而不安裝。依賴問題時，執 `helm dependency update`。值覆蓋失敗時，驗 YAML 路徑於 values.yaml 中存。以 `helm get manifest myapp -n myapp-prod` 觀實部署之資源。

## 驗證

- [ ] Pod 於 Running 狀態，所有容器就緒
- [ ] Readiness 探針於 Pod 加入 Service endpoints 前通過
- [ ] Liveness 探針自動重啟不健康容器
- [ ] 資源請求與限防 OOM kill 與節點超分
- [ ] Secret 與 ConfigMap 以預期值正確掛載
- [ ] Service 自他 Pod 透過 DNS（cluster.local）解析
- [ ] LoadBalancer/Ingress 自外部網路可達
- [ ] HPA 於負載下擴副本，於閒置時縮之
- [ ] 滾動更新以零停機完成
- [ ] 日誌透過 kubectl logs 或集中日誌收集並可達

## 常見陷阱

- **缺 readiness 探針**：Pod 於完全啟動前收流量。恆實作驗應用依賴之 readiness 探針。

- **啟動時間不足**：快速 liveness 探針殺啟動慢之應用。用 startupProbe 具寬鬆 failureThreshold 以供初始化。

- **無資源限**：Pod 耗無限 CPU/記憶體致節點不穩。恆設請求與限。

- **硬編碼配置**：清單中之環境特定值阻重用。用 ConfigMap、Secret、Helm values。

- **預設 service account**：Pod 有不必要之集群權限。建專用之 ServiceAccount 具最小 RBAC。

- **無滾動更新策略**：Deployment 同時重建所有 Pod 致停機。用 RollingUpdate 具 maxUnavailable: 0。

- **秘鑰入版本控制**：敏感資料提交至 Git。用 sealed-secrets、external-secrets-operator 或 vault。

- **無 pod disruption budget**：集群維護排空節點致服務中斷。建 PodDisruptionBudget 以保最小可用副本。

## 相關技能

- `setup-docker-compose` - Kubernetes 前之容器編排基礎
- `containerize-mcp-server` - 為部署建容器映像
- `write-helm-chart` - 高級 Helm chart 開發
- `manage-kubernetes-secrets` - SealedSecrets 與 external-secrets-operator
- `configure-ingress-networking` - NGINX Ingress 與 cert-manager 設定
- `implement-gitops-workflow` - 聲明式部署之 ArgoCD/Flux
- `setup-container-registry` - 映像登錄整合
