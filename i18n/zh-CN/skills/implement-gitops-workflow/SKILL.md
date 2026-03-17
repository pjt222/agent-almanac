---
name: implement-gitops-workflow
description: >
  使用 Argo CD 或 Flux 实现 GitOps 持续交付，支持 app-of-apps 模式、
  自动同步策略、漂移检测和多环境晋级。从 Git 以声明式方式管理
  Kubernetes 部署，并实现自动调和。适用于实现声明式基础设施管理、
  将命令式 kubectl 命令迁移为 Git 驱动的部署、设置多环境晋级工作流、
  对生产部署强制执行代码审查门控，或满足审计与合规要求。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: devops
  complexity: advanced
  language: multi
  tags: gitops, argocd, flux, sync, drift-detection
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: "2026-03-16"
---

# 实现 GitOps 工作流

使用 Argo CD 或 Flux 的 GitOps 原则部署和管理 Kubernetes 应用，实现自动化、可审计、可重复的部署。

## 适用场景

- 实现声明式基础设施和应用管理
- 将命令式 kubectl/helm 命令迁移为 Git 驱动的部署
- 设置多环境晋级工作流（开发 → 预发布 → 生产）
- 对生产部署强制执行代码审查和审批门控
- 利用 Git 历史记录满足合规和审计要求
- 以 Git 作为唯一真实来源实现灾难恢复

## 输入

- **必填**：具有管理员权限的 Kubernetes 集群（EKS、GKE、AKS 或自托管）
- **必填**：用于存储 Kubernetes 清单和 Helm chart 的 Git 仓库
- **必填**：已安装 Argo CD 或 Flux CLI
- **可选**：用于密钥管理的 Sealed Secrets 或 External Secrets Operator
- **可选**：用于自动镜像晋级的 Image Updater
- **可选**：用于监控同步状态的 Prometheus

## 步骤

> 完整配置文件和模板请参阅[扩展示例](references/EXAMPLES.md)。


### 第 1 步：安装 Argo CD 并配置仓库访问

将 Argo CD 部署到集群并连接到 Git 仓库。

```bash
# Create namespace
kubectl create namespace argocd

# Install Argo CD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for pods to be ready
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=argocd-server -n argocd --timeout=300s

# Install Argo CD CLI
curl -sSL -o argocd-linux-amd64 https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
sudo install -m 555 argocd-linux-amd64 /usr/local/bin/argocd
rm argocd-linux-amd64

# Port-forward to access UI
kubectl port-forward svc/argocd-server -n argocd 8080:443 &

# Get initial admin password
ARGOCD_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)
echo "Argo CD Admin Password: $ARGOCD_PASSWORD"

# Login via CLI
argocd login localhost:8080 --username admin --password "$ARGOCD_PASSWORD" --insecure

# Change admin password
argocd account update-password

# Add Git repository (HTTPS with token)
argocd repo add https://github.com/USERNAME/gitops-repo \
  --username USERNAME \
  --password "$GITHUB_TOKEN" \
  --name gitops-repo

# Or add via SSH
ssh-keygen -t ed25519 -C "argocd@cluster" -f argocd-deploy-key -N ""
# Add argocd-deploy-key.pub to GitHub repository deploy keys
argocd repo add git@github.com:USERNAME/gitops-repo.git \
  --ssh-private-key-path argocd-deploy-key \
  --name gitops-repo

# Verify repository connection
argocd repo list

# Configure Ingress for UI (optional)
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: argocd-server-ingress
  namespace: argocd
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-passthrough: "true"
    nginx.ingress.kubernetes.io/backend-protocol: "HTTPS"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - argocd.example.com
    secretName: argocd-tls
  rules:
  - host: argocd.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: argocd-server
            port:
              number: 443
EOF
```

**预期结果：** Argo CD 安装在 argocd 命名空间中。UI 可通过端口转发或 Ingress 访问。管理员密码已从默认值更改。Git 仓库通过 SSH 或令牌认证添加。仓库连接已验证。

**失败处理：** 对于 pod CrashLoopBackOff，使用 `kubectl logs -n argocd -l app.kubernetes.io/name=argocd-server` 检查日志。对于仓库连接失败，验证令牌是否具有仓库访问权限或 SSH 密钥是否已添加到部署密钥。对于 Ingress SSL 问题，确认 cert-manager 已成功签发证书。对于登录失败，重新获取密码或通过 `kubectl delete secret argocd-initial-admin-secret -n argocd` 重置并重启服务器。

### 第 2 步：创建应用清单并部署第一个应用

定义带同步策略和健康检查的 Argo CD Application 资源。

```bash
# Create Git repository structure
mkdir -p gitops-repo/{apps,infra,projects}
cd gitops-repo

# Create sample application
mkdir -p apps/myapp/overlays/{dev,staging,prod}
mkdir -p apps/myapp/base

# Base Kustomization
cat > apps/myapp/base/kustomization.yaml <<EOF
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
- deployment.yaml
- service.yaml
EOF

cat > apps/myapp/base/deployment.yaml <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: ghcr.io/username/myapp:v1.0.0
        ports:
        - containerPort: 8080
EOF

cat > apps/myapp/base/service.yaml <<EOF
apiVersion: v1
kind: Service
metadata:
  name: myapp
spec:
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 8080
EOF

# Production overlay
cat > apps/myapp/overlays/prod/kustomization.yaml <<EOF
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: production
resources:
- ../../base
replicas:
- name: myapp
  count: 5
images:
- name: ghcr.io/username/myapp
  newTag: v1.0.0
EOF

# Commit to Git
git add .
git commit -m "Add myapp application manifests"
git push

# Create Argo CD Application
cat > argocd-apps/myapp-prod.yaml <<EOF
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp-prod
  namespace: argocd
  finalizers:
  - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  source:
    repoURL: https://github.com/USERNAME/gitops-repo
    targetRevision: main
    path: apps/myapp/overlays/prod
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true      # Delete resources removed from Git
      selfHeal: true   # Auto-sync on drift detection
      allowEmpty: false
    syncOptions:
    - CreateNamespace=true
    - PruneLast=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
  revisionHistoryLimit: 10
EOF

# Apply Application via kubectl
kubectl apply -f argocd-apps/myapp-prod.yaml

# Or create via CLI
argocd app create myapp-prod \
  --repo https://github.com/USERNAME/gitops-repo \
  --path apps/myapp/overlays/prod \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace production \
  --sync-policy automated \
  --auto-prune \
  --self-heal

# Watch sync status
argocd app get myapp-prod --watch

# Verify application
kubectl get all -n production
argocd app sync myapp-prod  # Manual sync if automated disabled
```

**预期结果：** 应用从 Git 自动同步。资源在 production 命名空间中创建。Argo CD UI 显示健康状态。自动同步策略启用 prune 和 self-heal。同步在重试次数限制内成功完成。

**失败处理：** 对于同步失败，使用 `argocd app get myapp-prod` 和 `kubectl get events -n production` 检查应用事件。对于 Kustomize 构建错误，在本地使用 `kustomize build apps/myapp/overlays/prod` 测试。对于命名空间错误，验证命名空间是否存在或启用 CreateNamespace 同步选项。对于清理问题，使用 `kubectl get <resource> -o yaml` 检查终结器和属主引用。

### 第 3 步：实现 App-of-Apps 模式进行多环境管理

创建根应用来管理跨环境的子应用。

```bash
# Create app-of-apps structure
mkdir -p argocd-apps/{projects,infra,apps}

# Define projects for RBAC
cat > argocd-apps/projects/production.yaml <<EOF
apiVersion: argoproj.io/v1alpha1
# ... (see EXAMPLES.md for complete configuration)
```

**预期结果：** 根应用管理所有子应用。添加到 Git 的新应用自动部署。基础设施应用在依赖它们的应用之前部署（如需要可通过同步波次实现）。项目强制执行 RBAC 边界。应用树显示父子关系。

**失败处理：** 对于循环依赖，使用同步波次控制顺序。对于项目权限错误，验证 sourceRepos 和 destinations 与应用要求匹配。对于递归目录问题，确保 YAML 文件有效且不冲突。对于缺少子应用，使用 `argocd app get root-app` 检查根应用状态。

### 第 4 步：配置 Image Updater 实现自动部署

设置 Argo CD Image Updater 以自动晋级新镜像版本。

```bash
# Install Argo CD Image Updater
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-image-updater/stable/manifests/install.yaml

# Configure image update strategy via annotations
cat > argocd-apps/myapp-prod-autoupdate.yaml <<EOF
apiVersion: argoproj.io/v1alpha1
# ... (see EXAMPLES.md for complete configuration)
```

**预期结果：** Image Updater 监控注册表中符合标签模式的新镜像。语义化版本策略更新到最新稳定版本。自动创建带新镜像标签的 Git 提交。应用使用更新后的镜像同步。预发布环境使用摘要策略实现不可变部署。

**失败处理：** 对于注册表访问错误，通过 Secret 或 ServiceAccount 验证 image-updater 是否具有拉取凭证。对于回写失败，检查 git-creds Secret 是否具有推送权限。对于未检测到更新，使用 `argocd-image-updater test ghcr.io/username/myapp` 验证标签正则表达式是否匹配实际标签。对于认证问题，检查 image-updater 日志获取详细错误信息。

### 第 5 步：使用 Argo Rollouts 实现渐进式交付

启用金丝雀和蓝绿部署并配置自动回滚。

```bash
# Install Argo Rollouts controller
kubectl create namespace argo-rollouts
kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml

# Install Rollouts kubectl plugin
curl -LO https://github.com/argoproj/argo-rollouts/releases/latest/download/kubectl-argo-rollouts-linux-amd64
# ... (see EXAMPLES.md for complete configuration)
```

**预期结果：** Rollout 逐步将流量转移到金丝雀版本。分析在每个步骤运行，验证成功率。成功时自动晋级，失败时自动回滚。Argo CD 同步 Rollout 资源。仪表板实时显示 Rollout 进度。

**失败处理：** 对于分析失败，验证 Prometheus 是否可访问且查询返回有效结果。对于流量路由问题，检查 Ingress 注解和金丝雀服务端点。对于卡住的 Rollout，手动晋级或中止。对于修订版本不匹配，确保 Argo CD 同步策略不与 Rollouts 控制器更新冲突。

### 第 6 步：配置漂移检测和 Webhook 通知

监控手动变更并向 Slack/邮件发送告警。

```bash
# Configure drift detection in Application
cat > argocd-apps/myapp-strict.yaml <<EOF
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp-prod
# ... (see EXAMPLES.md for complete configuration)
```

**预期结果：** Self-heal 自动还原手动 kubectl 变更。同步失败和成功部署时向 Slack 发送通知。Webhook 触发外部系统（PagerDuty、监控、ITSM）。漂移告警显示变更内容和变更者（通过 Git 历史记录）。

**失败处理：** 对于 self-heal 未触发，验证自动同步策略是否启用且刷新间隔不过长（默认 3 分钟）。对于通知失败，使用 curl 测试 Slack 令牌并验证 bot 是否已添加到频道。对于忽略差异不生效，检查 JSON 指针语法是否与资源结构匹配。对于 Webhook 错误，检查端点可达性和认证头。

## 验证清单

- [ ] Argo CD 或 Flux 安装完成并可通过 UI/CLI 访问
- [ ] Git 仓库已使用适当认证方式连接
- [ ] 应用在提交时自动从 Git 同步
- [ ] 手动 kubectl 变更被 self-heal 还原
- [ ] App-of-apps 模式部署多个应用
- [ ] Image Updater 根据标签模式晋级新镜像
- [ ] Argo Rollouts 执行渐进式金丝雀部署
- [ ] 同步事件时向 Slack/邮件发送通知
- [ ] 漂移检测对带外变更发出告警
- [ ] RBAC 在项目级别强制执行访问控制

## 常见问题

- **自动清理已禁用**：从 Git 中删除的资源仍保留在集群中。在同步策略中启用 `prune: true`。

- **无同步波次**：基础设施应用在依赖它们的应用之后部署。使用 `argocd.argoproj.io/sync-wave` 注解控制顺序。

- **忽略 HPA 管理的副本数**：因 HPA 更改了副本数导致同步失败。将 `/spec/replicas` 添加到 ignoreDifferences。

- **回写冲突**：Image Updater 提交与手动提交冲突。使用单独的分支或为 image updater 配置细粒度 RBAC。

- **缺少终结器**：应用删除留下孤立资源。在 Application 元数据中添加 `resources-finalizer.argocd.argoproj.io`。

- **无分析模板**：Rollout 在无验证的情况下自动晋级。使用指标查询实现 AnalysisTemplates。

- **Git 中有密钥**：明文密钥提交到仓库。使用 Sealed Secrets 或 External Secrets Operator。

- **Self-heal 过于激进**：Self-heal 还原了合法的紧急变更。使用注解临时禁用或实现审批门控。

## 相关技能

- `configure-git-repository` - 为 GitOps 设置 Git 仓库结构
- `manage-git-branches` - 环境晋级的分支策略
- `deploy-to-kubernetes` - 理解 GitOps 管理的 Kubernetes 资源
- `manage-kubernetes-secrets` - Sealed Secrets 与 Argo CD 集成
- `build-ci-cd-pipeline` - CI 构建镜像，GitOps 部署镜像
- `setup-container-registry` - 注册表间的镜像晋级
