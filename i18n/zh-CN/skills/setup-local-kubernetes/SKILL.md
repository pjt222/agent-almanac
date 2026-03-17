---
name: setup-local-kubernetes
description: >
  使用 kind、k3d 或 minikube 搭建本地 Kubernetes 开发环境，实现快速
  内循环开发。涵盖集群创建、Ingress 配置、本地注册表设置，以及与
  Skaffold 和 Tilt 等开发工具的集成，实现自动重建和重新部署工作流。
  适用于需要本地 Kubernetes 环境进行开发、在生产部署前测试清单或
  Helm chart、希望快速自动重建部署循环，或在无云成本的情况下
  学习 Kubernetes 的场景。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: devops
  complexity: basic
  language: multi
  tags: kind, k3d, minikube, local-development, skaffold, tilt, docker, kubernetes
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: "2026-03-16"
---

# 搭建本地 Kubernetes

创建本地 Kubernetes 开发环境，实现快速迭代和测试。

## 适用场景

- 需要本地 Kubernetes 环境进行应用开发
- 希望在部署到生产前测试 Kubernetes 清单和 Helm chart
- 需要带自动重建和重新部署的快速内循环开发
- 测试具有服务依赖的多服务应用
- 在无云成本的情况下学习 Kubernetes
- 在推送变更前本地测试 CI/CD 流水线
- 需要用于实验和调试的隔离环境

## 输入

- **必填**：已安装 Docker Desktop 或 Docker Engine
- **必填**：集群至少可用 4GB RAM
- **必填**：本地集群工具选择（kind、k3d 或 minikube）
- **可选**：要部署的应用源代码
- **可选**：Kubernetes 版本偏好
- **可选**：开发工具偏好（Skaffold、Tilt 或手动）
- **可选**：所需的工作节点数量

## 步骤

> 完整配置文件和模板请参阅[扩展示例](references/EXAMPLES.md)。

### 第 1 步：安装本地 Kubernetes 集群工具

根据需求选择并安装 kind、k3d 或 minikube。

**安装 kind（Kubernetes in Docker）：**
```bash
# Linux example
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind

# Verify installation
kind version
```

**安装 k3d（k3s in Docker）：**
```bash
# Linux/macOS
curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash

# Verify installation
k3d version
```

**安装 minikube：**
```bash
# Linux example
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Verify installation
minikube version
```

如果尚未安装 kubectl：
```bash
# Linux example
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/
kubectl version --client
```

> macOS 和 Windows 的安装命令请参阅 references/EXAMPLES.md。

**预期结果：** 工具二进制文件已安装并在 PATH 中。version 命令返回预期版本。kubectl 可用于集群交互。

**失败处理：**
- 确保 Docker 正在运行：`docker ps`
- 检查系统 PATH 是否包含安装目录
- 对于权限问题，验证 sudo/admin 权限
- 在 macOS 上，可能需要在"安全性与隐私"设置中允许该二进制文件
- Windows 用户：确保以管理员身份运行终端

### 第 2 步：创建带配置的本地集群

创建支持 Ingress 和本地注册表的多节点集群。

**创建 kind 集群：**
```yaml
# kind-config.yaml (abbreviated)
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
name: dev-cluster
nodes:
- role: control-plane
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
  - containerPort: 443
    hostPort: 443
- role: worker
- role: worker
```

```bash
# Create cluster
kind create cluster --config kind-config.yaml

# Install ingress-nginx
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

# Create local registry
docker run -d --restart=always -p 5000:5000 --name kind-registry registry:2
docker network connect kind kind-registry
```

> 带注册表镜像和 Ingress 配置的完整 kind-config.yaml 请参阅 references/EXAMPLES.md。

**创建 k3d 集群：**
```bash
# Create cluster with ingress and registry
k3d cluster create dev-cluster \
  --port "80:80@loadbalancer" \
  --port "443:443@loadbalancer" \
  --agents 2 \
  --registry-create k3d-registry:5000
```

**创建 minikube 集群：**
```bash
# Create cluster with multiple nodes
minikube start \
  --nodes=3 \
  --cpus=2 \
  --memory=4096 \
  --driver=docker \
  --addons=ingress,registry,metrics-server
```

测试集群：
```bash
# Deploy test application
kubectl create deployment hello --image=k8s.gcr.io/echoserver:1.4
kubectl expose deployment hello --type=NodePort --port=8080
kubectl port-forward service/hello 8080:8080

# Clean up test
kubectl delete deployment,service hello
```

**预期结果：** 多节点集群运行，包含控制平面和工作节点。Ingress 控制器已安装并就绪。本地注册表在 localhost:5000 可访问。kubectl 上下文已切换到新集群。测试部署成功。

**失败处理：**
- 检查 Docker 是否有足够资源（建议 4GB+ 内存）
- 验证无端口冲突：`lsof -i :80,443,5000,6550`
- 对于 kind：确保 Docker Desktop Kubernetes 已禁用（会产生冲突）
- 对于 k3d：检查 Docker 网络连通性
- 对于 minikube：尝试不同的驱动（virtualbox、hyperv、kvm2）
- 检查集群创建日志：`kind get clusters`、`k3d cluster list`、`minikube logs`

### 第 3 步：配置开发工作流工具

设置 Skaffold 或 Tilt 实现自动重建和重新部署。

**安装 Skaffold：**
```bash
# Linux example
curl -Lo skaffold https://storage.googleapis.com/skaffold/releases/latest/skaffold-linux-amd64
chmod +x skaffold
sudo mv skaffold /usr/local/bin
skaffold version
```

**创建 Skaffold 配置：**
```yaml
# skaffold.yaml (abbreviated)
apiVersion: skaffold/v4beta7
kind: Config
metadata:
  name: my-app
build:
# ... (see EXAMPLES.md for complete configuration)
```

> 带配置文件、文件同步和端口转发的完整 skaffold.yaml 请参阅 references/EXAMPLES.md。

**安装 Tilt：**
```bash
# Linux/macOS
curl -fsSL https://raw.githubusercontent.com/tilt-dev/tilt/master/scripts/install.sh | bash
tilt version
```

**创建 Tiltfile：**
```python
# Tiltfile (abbreviated)
allow_k8s_contexts('kind-dev-cluster')

docker_build(
  'localhost:5000/my-app',
  '.',
  live_update=[
    sync('./src', '/app/src'),
  ]
)

k8s_yaml(['k8s/deployment.yaml', 'k8s/service.yaml'])
k8s_resource('my-app', port_forwards='8080:8080')
```

> 带实时更新、Helm chart 和自定义按钮的完整 Tiltfile 请参阅 references/EXAMPLES.md。

创建示例 Kubernetes 清单：
```yaml
# k8s/deployment.yaml (abbreviated)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 1
  template:
    spec:
      containers:
      - name: app
        image: localhost:5000/my-app
        ports:
        - containerPort: 8080
```

> 带 service、ingress 和资源限制的完整清单请参阅 references/EXAMPLES.md。

测试开发工作流：
```bash
# Using Skaffold
skaffold dev --port-forward

# Using Tilt
tilt up

# Add entry to /etc/hosts for ingress
echo "127.0.0.1 my-app.local" | sudo tee -a /etc/hosts
curl http://my-app.local
```

**预期结果：** Skaffold 或 Tilt 监控文件变更。代码变更触发自动重建和重新部署。支持的语言热重载正常工作。端口转发允许本地访问。日志在终端/UI 中流式输出。构建缓存使重建速度加快。

**失败处理：**
- 验证 Docker 守护进程可访问：`docker ps`
- 检查本地注册表是否可达：`curl http://localhost:5000/v2/_catalog`
- 对于文件同步问题，确保配置中的路径与实际结构匹配
- 检查 Skaffold/Tilt 日志中的构建错误
- 确保 Dockerfile 有适当的基础镜像且能成功构建：`docker build .`
- 检查资源限制是否导致 OOMKill：`kubectl describe pod -l app=my-app`

### 第 4 步：设置本地存储和数据库

配置持久化存储并部署数据库服务用于测试。

**创建本地存储类：**
```yaml
# local-storage.yaml (abbreviated)
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: local-path
provisioner: rancher.io/local-path
# ... (see EXAMPLES.md for complete configuration)
```

> 带 PVC 模板的完整存储配置请参阅 references/EXAMPLES.md。

**为开发部署 PostgreSQL：**
```yaml
# postgres-dev.yaml (abbreviated)
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres
  template:
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        envFrom:
        - secretRef:
            name: postgres-secret
```

> 带 Secret 和卷模板的完整 PostgreSQL StatefulSet 请参阅 references/EXAMPLES.md。

**部署 Redis 用于缓存：**
```bash
# Using Helm
helm install redis bitnami/redis \
  --set auth.enabled=false \
  --set replica.replicaCount=0
```

> 基于 kubectl 的 Redis 部署请参阅 references/EXAMPLES.md。

测试数据库连通性：
```bash
# Apply manifests
kubectl apply -f local-storage.yaml
kubectl apply -f postgres-dev.yaml

# Wait for PostgreSQL
kubectl wait --for=condition=ready pod -l app=postgres --timeout=60s

# Test connection
kubectl exec -it postgres-0 -- psql -U devuser -d devdb -c "SELECT version();"
```

**预期结果：** 存储类配置了动态供应。数据库 pod 运行就绪。服务可通过端口转发或从其他 pod 访问。数据在 pod 重启后持久化。资源使用适合开发（小型限制）。

**失败处理：**
- 检查存储供应器是否已安装：`kubectl get storageclass`
- 验证 PVC 是否绑定到 PV：`kubectl get pvc,pv`
- 检查 pod 事件中的挂载错误：`kubectl describe pod postgres-0`
- 对于权限问题，检查 hostPath 目录是否存在且可写
- 测试数据库启动：`kubectl logs postgres-0` 查看 PostgreSQL 错误
- 确保端口转发无端口冲突

### 第 5 步：配置本地开发的可观测性

添加轻量监控和日志用于调试。

**部署轻量监控栈：**
```bash
# Install metrics-server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# For local clusters, disable TLS verification
kubectl patch deployment metrics-server -n kube-system --type='json' -p='[
  {"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}
]'

# Verify metrics
kubectl top nodes
kubectl top pods -A
```

**设置本地日志：**
```bash
# Install stern (multi-pod log tailing)
curl -Lo stern https://github.com/stern/stern/releases/download/v1.26.0/stern_1.26.0_linux_amd64.tar.gz
tar -xzf stern_1.26.0_linux_amd64.tar.gz
sudo mv stern /usr/local/bin/

# Usage
stern my-app --since 1m
```

> 开发仪表板 ConfigMap 和实用别名请参阅 references/EXAMPLES.md。

**预期结果：** Metrics Server 提供资源使用数据。kubectl top 命令正常工作。k9s 或仪表板显示集群状态。日志可通过 stern 或 kubectl logs 访问。适合开发的低开销监控。

**失败处理：**
- 对于 Metrics Server TLS 错误，应用禁用 TLS 的补丁
- 检查 Metrics Server pod 是否运行：`kubectl get pods -n kube-system -l k8s-app=metrics-server`
- 验证 heapster API 是否可用：`kubectl get apiservices | grep metrics`
- 对于 stern，确保 kubectl 上下文设置正确
- 在调试可观测性工具之前先测试基本 kubectl 访问

### 第 6 步：记录工作流并创建辅助工具

创建脚本和文档用于团队入职。

**创建设置脚本：**
```bash
#!/bin/bash
# setup-local-cluster.sh (abbreviated)
set -e

echo "=== Local Kubernetes Cluster Setup ==="

# ... (see EXAMPLES.md for complete configuration)
```

> 带服务部署和验证的完整设置脚本请参阅 references/EXAMPLES.md。

**创建清理脚本：**
```bash
#!/bin/bash
# teardown-local-cluster.sh (abbreviated)
echo "=== Tearing Down Local Cluster ==="

if kind get clusters 2>/dev/null | grep -q dev-cluster; then
  kind delete cluster --name dev-cluster
  docker stop kind-registry && docker rm kind-registry
fi

docker system prune -f
```

> 完整清理脚本和 README 模板请参阅 references/EXAMPLES.md。

**预期结果：** 设置脚本用一条命令创建集群。清理脚本完整清理所有资源。README 提供常见任务的清晰说明。团队成员能快速上手。

**失败处理：**
- 在分发前手动测试脚本
- 为每个步骤添加错误处理
- 在 README 中提供故障排除章节
- 为复杂设置创建视频演示
- 随集群工具版本更新维护脚本

## 验证清单

- [ ] 本地集群已创建，包含多个节点
- [ ] Ingress 控制器已安装并响应请求
- [ ] 本地注册表可访问并接受推送
- [ ] 示例应用成功部署
- [ ] 文件同步正常工作（变更无需完整重建即可反映）
- [ ] 端口转发允许本地访问服务
- [ ] 数据库服务运行并可访问
- [ ] Metrics Server 提供资源使用数据
- [ ] 日志可通过 kubectl/stern/Tilt 访问
- [ ] 设置/清理脚本可靠运行
- [ ] 文档清晰且为最新版本
- [ ] 团队成员可在 30 分钟内完成入职

## 常见问题

- **资源不足**：本地集群需要 4GB+ RAM、2+ CPU 核心。检查 Docker Desktop 设置。减少副本数和开发的资源请求。

- **端口冲突**：80、443、5000 端口常被占用。创建集群前使用 `lsof -i :<port>` 检查。如需要，调整端口映射。

- **重建速度慢**：没有适当缓存，Docker 重建很慢。使用多阶段构建、.dockerignore 和 BuildKit。启用 Skaffold/Tilt 缓存。

- **上下文混乱**：多个 kubectl 上下文容易混淆。使用 `kubectl config current-context` 和 `kubectx` 工具清晰切换。

- **文件同步不工作**：主机和容器之间的路径不匹配导致同步中断。验证 skaffold.yaml/Tiltfile 中的路径与 Dockerfile WORKDIR 匹配。

- **Ingress 无法解析**：忘记在 /etc/hosts 中添加条目，或 Ingress 控制器未就绪。在测试前等待控制器 pod 就绪。

- **数据库数据丢失**：默认存储是临时性的。对需要在重启后保留的数据使用 PersistentVolume。明确指定存储类。

- **资源限制过高**：不要将生产资源规格复制到本地。为本地开发显著降低限制，以适应 Docker Desktop。

- **网络隔离**：本地集群不一定能访问主机服务。使用 `host.docker.internal`（Docker Desktop）或 ngrok 进行反向代理。

- **版本偏差**：本地集群版本与生产不同。在创建时明确设置 Kubernetes 版本以匹配生产环境。

## 相关技能

- `deploy-to-kubernetes` - 先在本地测试的应用部署模式
- `write-helm-chart` - 在本地集群中测试 Helm chart
- `setup-prometheus-monitoring` - 本地测试监控设置
- `configure-ingress-networking` - 本地验证 Ingress 配置
- `implement-gitops-workflow` - 使用本地集群测试 GitOps
- `optimize-cloud-costs` - 在本地开发成本优化策略
