---
name: deploy-to-kubernetes
description: >
  使用 kubectl 清单部署应用至 Kubernetes 集群，管理 Deployment、Service、
  ConfigMap、Secret 和 Ingress 资源。实现健康检查、资源限制、滚动更新
  和 Helm Chart 打包以用于生产部署。适用于向 EKS、GKE、AKS 或自托管集群
  部署新应用、从 Docker Compose 迁移至容器编排、实现零停机滚动更新，
  或跨开发、暂存和生产环境设置多环境部署。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: devops
  complexity: intermediate
  language: multi
  tags: kubernetes, k8s, kubectl, deployment, service
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: "2026-03-16"
---

# 部署至 Kubernetes

将容器化应用部署至 Kubernetes，配置包含健康检查、资源管理和自动化发布的生产就绪配置。

## 适用场景

- 向 Kubernetes 集群（EKS、GKE、AKS、自托管）部署新应用
- 从 Docker Compose 或传统虚拟机迁移至容器编排
- 实现零停机滚动更新和回滚
- 在 Kubernetes 中管理应用配置和密钥
- 设置多环境部署（开发、暂存、生产）
- 为应用分发创建可复用的 Helm Chart

## 输入

- **必填**：Kubernetes 集群访问权限（`kubectl cluster-info`）
- **必填**：已推送至镜像仓库的容器镜像（Docker Hub、ECR、GCR、Harbor）
- **必填**：应用需求（端口、环境变量、卷）
- **可选**：用于 HTTPS Ingress 的 TLS 证书
- **可选**：持久化存储需求（StatefulSet、PVC）
- **可选**：用于基于 Chart 部署的 Helm CLI

## 步骤

> 完整配置文件和模板请参阅[扩展示例](references/EXAMPLES.md)。


### 第 1 步：创建命名空间和资源配额

将应用组织到带有资源限制和 RBAC 的命名空间中。

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

**预期结果：** 命名空间创建完成，资源配额限制了计算和存储资源。LimitRange 设置默认的 CPU/内存请求和限制。ServiceAccount 配置了最小权限 RBAC。

**失败处理：** 对于配额错误，使用 `kubectl describe nodes` 验证集群资源是否充足。对于 RBAC 错误，使用 `kubectl auth can-i create role --namespace myapp-prod` 检查 cluster-admin 权限。对被拒绝的资源使用 `kubectl describe` 查看配额/限制违规。

### 第 2 步：配置应用密钥和 ConfigMap

使用 ConfigMap 和 Secret 外部化配置和敏感数据。

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

对于更复杂的配置，使用 YAML 清单：

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

**预期结果：** ConfigMap 存储非敏感配置，Secret 存储凭证/密钥。值通过环境变量或卷挂载对 Pod 可用。TLS Secret 格式正确，可用于 Ingress 资源。

**失败处理：** 对于编码问题，在 YAML 中使用 `stringData` 替代 `data`。对于 TLS Secret 错误，使用 `openssl x509 -in tls.crt -text -noout` 验证证书和密钥格式。对于访问问题，检查 ServiceAccount RBAC 权限。使用 `kubectl get secret myapp-secret -o jsonpath='{.data.api-key}' | base64 -d` 查看解码后的 Secret。

### 第 3 步：创建带健康检查和资源限制的 Deployment

使用包含探针和资源管理的生产就绪配置部署应用。

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

应用并监控 Deployment：

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

**预期结果：** Deployment 使用滚动更新策略创建 3 个副本。Pod 在接收流量前通过就绪探针。存活探针重启不健康的 Pod。资源请求/限制防止 OOM 终止。日志显示应用成功启动。

**失败处理：** 对于 ImagePullBackOff，使用 `kubectl get secret registry-credentials -o yaml` 验证镜像是否存在且 imagePullSecret 有效。对于 CrashLoopBackOff，使用 `kubectl logs pod-name --previous` 检查日志。对于探针失败，使用 `kubectl port-forward` 和 `curl localhost:8080/healthz` 手动测试端点。对于 OOMKilled 的 Pod，增加内存限制或检查内存泄漏。

### 第 4 步：通过 Service 和负载均衡器暴露应用

创建 Service 资源以在内部和外部暴露应用。

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp
  namespace: myapp-prod
# ... (see EXAMPLES.md for complete configuration)
```

应用并测试 Service：

```bash
# Apply services
kubectl apply -f service.yaml

# Get service details
kubectl get svc -n myapp-prod

# ... (see EXAMPLES.md for complete configuration)
```

**预期结果：** LoadBalancer Service 预置带公共 IP/主机名的外部负载均衡器。ClusterIP Service 提供稳定的内部 DNS。Endpoints 列表显示健康的 Pod IP。curl 请求成功并返回预期响应。

**失败处理：** 对于挂起的 LoadBalancer，检查云提供商集成和配额。对于无端点，使用 `kubectl get pods --show-labels` 验证 Pod 标签是否与 Service 选择器匹配。对于连接拒绝，验证 targetPort 是否与容器端口匹配。使用 `kubectl port-forward` 绕过 Service 层进行调试。

### 第 5 步：配置水平 Pod 自动扩缩容

基于 CPU/内存或自定义指标实现自动扩缩容。

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-hpa
  namespace: myapp-prod
# ... (see EXAMPLES.md for complete configuration)
```

如果 metrics-server 不可用则安装：

```bash
# Install metrics-server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Verify metrics-server
kubectl get deployment metrics-server -n kube-system
kubectl top nodes
# ... (see EXAMPLES.md for complete configuration)
```

**预期结果：** HPA 监控 CPU/内存指标。当超过阈值时，副本数扩容至 maxReplicas。当负载降低时，副本数逐渐缩减（稳定窗口防止抖动）。使用 `kubectl top` 可见指标。

**失败处理：** 对于"未知"指标，验证 metrics-server 是否运行，Pod 是否定义了资源请求。对于不扩缩容，使用 `kubectl top pods` 检查当前利用率是否确实超过目标。对于抖动，增加 stabilizationWindowSeconds。对于扩容缓慢，减少 scaleUp 策略中的 periodSeconds。

### 第 6 步：使用 Helm Chart 打包应用

创建可复用的 Helm Chart 用于多环境部署。

```bash
# Create Helm chart structure
helm create myapp-chart
cd myapp-chart

# Edit Chart.yaml
cat > Chart.yaml <<EOF
# ... (see EXAMPLES.md for complete configuration)
```

**预期结果：** Helm Chart 将所有 Kubernetes 资源打包为模板化值。Dry-run 显示渲染后的清单。安装以正确顺序部署所有资源。升级执行滚动更新。回滚恢复至前一个修订版本。

**失败处理：** 对于模板错误，运行 `helm template .` 在不安装的情况下本地渲染。对于依赖问题，运行 `helm dependency update`。对于值覆盖失败，验证 YAML 路径在 values.yaml 中存在。使用 `helm get manifest myapp -n myapp-prod` 查看实际部署的资源。

## 验证清单

- [ ] Pod 处于 Running 状态，所有容器就绪
- [ ] 就绪探针在 Pod 加入 Service 端点前通过
- [ ] 存活探针自动重启不健康的容器
- [ ] 资源请求和限制防止 OOM 终止和节点过度分配
- [ ] Secret 和 ConfigMap 正确挂载，值符合预期
- [ ] Service 通过 DNS（cluster.local）可从其他 Pod 解析
- [ ] LoadBalancer/Ingress 可从外部网络访问
- [ ] HPA 在负载下扩容副本，空闲时缩减副本
- [ ] 滚动更新以零停机完成
- [ ] 日志通过 kubectl logs 或集中式日志记录系统收集并可访问

## 常见问题

- **缺少就绪探针**：Pod 在完全启动前接收流量。始终实现验证应用依赖的就绪探针。

- **启动时间不足**：快速的存活探针会终止启动缓慢的应用。对初始化使用具有充足 failureThreshold 的 startupProbe。

- **无资源限制**：Pod 消耗无限 CPU/内存导致节点不稳定。始终设置请求和限制。

- **硬编码配置**：清单中的特定环境值阻止复用。使用 ConfigMap、Secret 和 Helm values。

- **默认服务账户**：Pod 拥有不必要的集群权限。创建带最小 RBAC 的专用 ServiceAccount。

- **无滚动更新策略**：Deployment 同时重建所有 Pod 导致停机。使用 maxUnavailable: 0 的 RollingUpdate。

- **版本控制中的 Secret**：敏感数据提交至 Git。使用 sealed-secrets、external-secrets-operator 或 vault。

- **无 Pod 中断预算**：集群维护排空节点并中断服务。创建 PodDisruptionBudget 以确保最小可用副本数。

## 相关技能

- `setup-docker-compose` - Kubernetes 之前的容器编排基础
- `containerize-mcp-server` - 为部署创建容器镜像
- `write-helm-chart` - 高级 Helm Chart 开发
- `manage-kubernetes-secrets` - SealedSecrets 和 external-secrets-operator
- `configure-ingress-networking` - NGINX Ingress 和 cert-manager 设置
- `implement-gitops-workflow` - ArgoCD/Flux 用于声明式部署
- `setup-container-registry` - 镜像仓库集成
