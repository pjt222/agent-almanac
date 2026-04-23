---
name: deploy-to-kubernetes
locale: wenyan
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

# 部至 Kubernetes

部容器化應用至 Kubernetes，具產級配：健檢、資源理、自動出。

## 用時

- 部新應用至 Kubernetes 集群（EKS、GKE、AKS、自宿）
- 由 Docker Compose 或傳統 VM 遷至容器編排
- 行零停機滾動更與回滾
- 於 Kubernetes 中理應用配與秘密
- 立多環境部署（dev、staging、production）
- 建可復用之 Helm chart 供應用分發

## 入

- **必要**：Kubernetes 集群訪（`kubectl cluster-info`）
- **必要**：容器鏡已推至庫（Docker Hub、ECR、GCR、Harbor）
- **必要**：應用所需（端口、環境變量、卷）
- **可選**：HTTPS 入口之 TLS 證
- **可選**：持久存需（StatefulSets、PVCs）
- **可選**：Helm CLI 供 chart 部

## 法

> 詳見 [Extended Examples](references/EXAMPLES.md) 全備之配文件與模板。


### 第一步：建命名空間與資源配額

將應用分命名空間，加資源限與 RBAC。

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

**得：** 命名空間已建，含資源配額限算與存。LimitRange 設默認 CPU/內存之請求與限。ServiceAccount 以最小權 RBAC 配。

**敗則：** 若配額錯，以 `kubectl describe nodes` 驗集群足資源。若 RBAC 錯，以 `kubectl auth can-i create role --namespace myapp-prod` 察 cluster-admin 權。於拒之資源用 `kubectl describe` 察配額/限違。

### 第二步：配應用秘密與 ConfigMap

以 ConfigMap 與 Secret 外化配與敏感數據。

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

複雜配宜用 YAML manifest：

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

**得：** ConfigMap 存非敏之配，Secret 存憑證/鑰。值於 Pod 經環境變量或卷掛可達。TLS 秘密格式合 Ingress 資源。

**敗則：** 編碼問題宜於 YAML 用 `stringData` 非 `data`。TLS 秘密錯以 `openssl x509 -in tls.crt -text -noout` 驗格式。訪問問題察 ServiceAccount 之 RBAC。察解碼秘密：`kubectl get secret myapp-secret -o jsonpath='{.data.api-key}' | base64 -d`。

### 第三步：建 Deployment 具健檢與資源限

以產級配部應用，含探針與資源理。

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

施並察部署：

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

**得：** 部署以滾動更新策略建三副本。Pod 過備探後始受流量。存探重啟不健 Pod。資源請求/限防 OOM 殺。日誌示應用成啟。

**敗則：** ImagePullBackOff 驗鏡像存且 imagePullSecret 有效（`kubectl get secret registry-credentials -o yaml`）。CrashLoopBackOff 察日誌（`kubectl logs pod-name --previous`）。探針敗以 `kubectl port-forward` 與 `curl localhost:8080/healthz` 手測端。OOMKilled 增內存限或查漏。

### 第四步：以 Service 與負載均衡曝應用

建 Service 資源以內外曝應用。

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp
  namespace: myapp-prod
# ... (see EXAMPLES.md for complete configuration)
```

施並測服務：

```bash
# Apply services
kubectl apply -f service.yaml

# Get service details
kubectl get svc -n myapp-prod

# ... (see EXAMPLES.md for complete configuration)
```

**得：** LoadBalancer Service 預備外 LB 附公 IP/主機名。ClusterIP Service 供穩內 DNS。端點列示健 Pod IP。curl 請求以期應成。

**敗則：** LoadBalancer 待中察雲商集成與配額。無端點以 `kubectl get pods --show-labels` 驗 Pod 標合 Service 選擇器。連拒驗 targetPort 合容器端口。`kubectl port-forward` 繞 Service 層以調試。

### 第五步：配水平 Pod 自動擴縮

依 CPU/內存或自定度行自動擴縮。

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-hpa
  namespace: myapp-prod
# ... (see EXAMPLES.md for complete configuration)
```

若未有 metrics-server 則裝之：

```bash
# Install metrics-server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Verify metrics-server
kubectl get deployment metrics-server -n kube-system
kubectl top nodes
# ... (see EXAMPLES.md for complete configuration)
```

**得：** HPA 察 CPU/內存度。越閾則副本擴至 maxReplicas。載減則漸縮（穩窗防抖）。以 `kubectl top` 可見度。

**敗則：** 度「未知」驗 metrics-server 行且 Pod 有資源請求。無擴以 `kubectl top pods` 察當前用超目。抖增 stabilizationWindowSeconds。擴慢減 scaleUp 政策之 periodSeconds。

### 第六步：以 Helm Chart 封應用

建可復用之 Helm chart 供多環境部。

```bash
# Create Helm chart structure
helm create myapp-chart
cd myapp-chart

# Edit Chart.yaml
cat > Chart.yaml <<EOF
# ... (see EXAMPLES.md for complete configuration)
```

**得：** Helm chart 以模板化值封諸 Kubernetes 資源。乾運示渲染之 manifest。裝以正序部所有資源。升執滾動更。回滾返前版。

**敗則：** 模板錯行 `helm template .` 不裝而本地渲染。依賴問題行 `helm dependency update`。覆值敗驗 values.yaml 中 YAML 路存。以 `helm get manifest myapp -n myapp-prod` 察實部資源。

## 驗

- [ ] Pod 於 Running 狀，諸容器皆備
- [ ] 備探過後 Pod 始加 Service 端點
- [ ] 存探自重啟不健容器
- [ ] 資源請求與限防 OOM 殺與節超承
- [ ] Secret 與 ConfigMap 正掛，值合期
- [ ] Service 經 DNS（cluster.local）於他 Pod 解
- [ ] LoadBalancer/Ingress 自外網可達
- [ ] HPA 載下擴副本，閒則縮
- [ ] 滾動更零停機完成
- [ ] 日誌經 kubectl logs 或中央日誌收且可訪

## 陷

- **無備探**：Pod 未全啟即受流量。恒行備探驗應用依賴。

- **啟時不足**：速存探殺慢啟應用。用 startupProbe 附寬之 failureThreshold 供初始化。

- **無資源限**：Pod 耗無限 CPU/內存致節不穩。恒設請求與限。

- **硬編配**：manifest 中環境特定值阻復用。用 ConfigMap、Secret、Helm 值。

- **默服務帳號**：Pod 有不必要之集群權。建專 ServiceAccount 附最小 RBAC。

- **無滾動更策**：部署同重建諸 Pod 致停機。用 RollingUpdate 附 maxUnavailable: 0。

- **秘密入版控**：敏數據入 Git。用 sealed-secrets、external-secrets-operator 或 vault。

- **無 PDB**：集群維護排節破服。建 PodDisruptionBudget 保最小可用副本。

## Related Skills

- `setup-docker-compose` - Kubernetes 前之容器編排基
- `containerize-mcp-server` - 建部署之容器鏡
- `write-helm-chart` - 進階 Helm chart 開發
- `manage-kubernetes-secrets` - SealedSecrets 與 external-secrets-operator
- `configure-ingress-networking` - NGINX Ingress 與 cert-manager 設
- `implement-gitops-workflow` - ArgoCD/Flux 供聲明式部署
- `setup-container-registry` - 鏡像庫集成
