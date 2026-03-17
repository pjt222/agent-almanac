---
name: setup-container-registry
description: >
  配置容器镜像仓库，包括 GitHub Container Registry（ghcr.io）、Docker Hub
  和 Harbor，支持自动化镜像扫描、标签策略、保留策略以及 CI/CD 集成，
  实现安全的镜像分发。适用于设置私有容器仓库、从 Docker Hub 迁移至
  自托管仓库、在 CI/CD 流水线中实现漏洞扫描、管理多架构镜像、
  强制执行镜像签名，或配置自动清理和保留策略。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: devops
  complexity: basic
  language: multi
  tags: container-registry, docker-hub, ghcr, harbor, vulnerability-scanning
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: "2026-03-16"
---

# 设置容器镜像仓库

配置具有安全扫描、访问控制和自动化 CI/CD 集成的生产就绪容器仓库。

## 适用场景

- 为组织设置私有容器仓库
- 从 Docker Hub 迁移至自托管或替代仓库
- 在 CI/CD 流水线中实现镜像漏洞扫描
- 使用清单管理多架构镜像（amd64、arm64）
- 强制执行镜像签名和来源验证
- 配置自动镜像清理和保留策略

## 输入

- **必填**：本地已安装 Docker 或 Podman
- **必填**：仓库凭证（个人访问令牌、服务账户）
- **可选**：用于 Harbor 部署的自托管基础设施
- **可选**：用于仓库集成的 Kubernetes 集群
- **可选**：用于镜像签名的 Cosign/Notary
- **可选**：用于漏洞扫描的 Trivy 或 Clair

## 步骤

> 完整配置文件和模板请参阅[扩展示例](references/EXAMPLES.md)。


### 第 1 步：配置 GitHub Container Registry（ghcr.io）

使用个人访问令牌和 CI/CD 集成设置 GitHub Container Registry。

```bash
# Create GitHub Personal Access Token
# Go to: Settings → Developer settings → Personal access tokens → Tokens (classic)
# Required scopes: write:packages, read:packages, delete:packages

# Login to ghcr.io
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Verify login
docker info | grep -A 5 "Registry:"

# Tag image for ghcr.io
docker tag myapp:latest ghcr.io/USERNAME/myapp:latest
docker tag myapp:latest ghcr.io/USERNAME/myapp:v1.0.0

# Push image
docker push ghcr.io/USERNAME/myapp:latest
docker push ghcr.io/USERNAME/myapp:v1.0.0

# Configure in GitHub Actions
cat > .github/workflows/docker-build.yml <<'EOF'
name: Build and Push Docker Image

on:
  push:
    branches: [main]
    tags: ['v*']

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha,prefix={{branch}}-

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
EOF

# Make package public (default is private)
# Go to: github.com/USERNAME?tab=packages → Select package → Package settings → Change visibility

# Pull image (public packages don't require authentication)
docker pull ghcr.io/USERNAME/myapp:latest
```

**预期结果：** GitHub 令牌具有包权限。Docker 登录成功。镜像以正确的标签推送至 ghcr.io。GitHub Actions 工作流使用自动标签构建多架构镜像。包可见性配置正确。

**失败处理：** 对于认证错误，验证令牌是否具有 `write:packages` 权限且未过期。对于推送失败，检查仓库名称是否与镜像名称匹配（区分大小写）。对于工作流失败，验证是否设置了 `permissions: packages: write`。对于公共包不可访问，等待最多 10 分钟让可见性变更生效。

### 第 2 步：配置 Docker Hub 自动构建

使用访问令牌和漏洞扫描设置 Docker Hub 仓库。

```bash
# Create Docker Hub access token
# Go to: hub.docker.com → Account Settings → Security → New Access Token

# Login to Docker Hub
echo $DOCKERHUB_TOKEN | docker login -u USERNAME --password-stdin

# Create repository
# Go to: hub.docker.com → Repositories → Create Repository
# Select: public or private, enable vulnerability scanning (Pro/Team plan)

# Tag for Docker Hub
docker tag myapp:latest USERNAME/myapp:latest
docker tag myapp:latest USERNAME/myapp:v1.0.0

# Push to Docker Hub
docker push USERNAME/myapp:latest
docker push USERNAME/myapp:v1.0.0

# Configure automated builds (legacy feature, deprecated)
# Modern approach: Use GitHub Actions with Docker Hub

cat > .github/workflows/dockerhub.yml <<'EOF'
name: Docker Hub Push

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          platforms: linux/amd64,linux/arm64,linux/arm/v7
          push: true
          tags: |
            ${{ secrets.DOCKERHUB_USERNAME }}/myapp:latest
            ${{ secrets.DOCKERHUB_USERNAME }}/myapp:${{ github.ref_name }}
          build-args: |
            BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
            VCS_REF=${{ github.sha }}

      - name: Update Docker Hub description
        uses: peter-evans/dockerhub-description@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
          repository: ${{ secrets.DOCKERHUB_USERNAME }}/myapp
          readme-filepath: ./README.md
EOF

# View vulnerability scan results
# Go to: hub.docker.com → Repository → Tags → View scan results

# Configure webhook for automated triggers
# Go to: Repository → Webhooks → Add webhook
WEBHOOK_URL="https://example.com/webhook"
curl -X POST https://hub.docker.com/api/content/v1/repositories/USERNAME/myapp/webhooks \
  -H "Authorization: Bearer $DOCKERHUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"CI Trigger\",\"webhook_url\":\"$WEBHOOK_URL\"}"
```

**预期结果：** Docker Hub 访问令牌创建完成，具有读写权限。镜像成功推送，支持多架构。漏洞扫描自动运行（如已启用）。README 从 GitHub 同步。Webhook 在镜像推送时触发。

**失败处理：** 对于速率限制错误，升级至 Pro 计划或实施直通缓存。对于扫描失败，验证计划是否包含扫描（免费套餐不提供）。对于多架构构建失败，确保使用 `docker run --privileged --rm tonistiigi/binfmt --install all` 安装了 QEMU。对于 Webhook 失败，验证端点是否公开可访问并返回 200 OK。

### 第 3 步：部署 Harbor 自托管仓库

使用 Helm 安装 Harbor 企业级仓库，支持 RBAC 和复制。

```bash
# Add Harbor Helm repository
helm repo add harbor https://helm.gopharbor.io
helm repo update

# Create namespace
kubectl create namespace harbor

# Create values file
cat > harbor-values.yaml <<EOF
expose:
  type: ingress
  tls:
    enabled: true
    certSource: secret
    secret:
      secretName: harbor-tls
  ingress:
    hosts:
      core: harbor.example.com
    className: nginx
    annotations:
      cert-manager.io/cluster-issuer: letsencrypt-prod

externalURL: https://harbor.example.com

persistence:
  enabled: true
  persistentVolumeClaim:
    registry:
      size: 200Gi
      storageClass: gp3
    database:
      size: 10Gi
      storageClass: gp3

harborAdminPassword: "ChangeMe123!"

database:
  type: internal  # Use external: postgres for production

redis:
  type: internal  # Use external: redis for production

trivy:
  enabled: true
  skipUpdate: false

notary:
  enabled: true  # Image signing

chartmuseum:
  enabled: true  # Helm chart storage
EOF

# Install Harbor
helm install harbor harbor/harbor \
  --namespace harbor \
  --values harbor-values.yaml \
  --timeout 10m

# Wait for pods to be ready
kubectl get pods -n harbor -w

# Get admin password
kubectl get secret -n harbor harbor-core -o jsonpath='{.data.HARBOR_ADMIN_PASSWORD}' | base64 -d

# Access Harbor UI
echo "Harbor UI: https://harbor.example.com"
echo "Username: admin"

# Login via Docker CLI
docker login harbor.example.com
# Username: admin
# Password: (from above)

# Create project via API
curl -u "admin:$HARBOR_PASSWORD" -X POST \
  https://harbor.example.com/api/v2.0/projects \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "myapp",
    "public": false,
    "metadata": {
      "auto_scan": "true",
      "severity": "high",
      "enable_content_trust": "true"
    }
  }'

# Tag and push to Harbor
docker tag myapp:latest harbor.example.com/myapp/app:latest
docker push harbor.example.com/myapp/app:latest

# Configure robot account for CI/CD
# UI: Administration → Robot Accounts → New Robot Account
# Permissions: Pull, Push to specific projects

# Use robot account in CI/CD
docker login harbor.example.com -u 'robot$myapp-ci' -p "$ROBOT_TOKEN"
```

**预期结果：** Harbor 部署至 Kubernetes，使用 PostgreSQL 和 Redis。Ingress 配置了 TLS。管理员 UI 可访问。项目创建完成，启用了漏洞扫描。机器人账户提供 CI/CD 认证。Trivy 在推送时扫描镜像。

**失败处理：** 对于数据库连接错误，使用 `kubectl logs -n harbor harbor-database-0` 检查 PostgreSQL Pod 日志。对于 Ingress 问题，验证 DNS 是否指向 LoadBalancer，cert-manager 是否颁发了证书。对于 Trivy 失败，检查漏洞数据库是否成功下载。对于存储问题，使用 `kubectl get pvc -n harbor` 验证 PVC 是否已绑定。

### 第 4 步：实现镜像标签策略和保留策略

配置语义化版本控制、不可变标签和自动清理。

```bash
# Tagging best practices
# 1. Semantic versioning
docker tag myapp:latest harbor.example.com/myapp/app:v1.2.3
docker tag myapp:latest harbor.example.com/myapp/app:v1.2
docker tag myapp:latest harbor.example.com/myapp/app:v1
docker tag myapp:latest harbor.example.com/myapp/app:latest
# ... (see EXAMPLES.md for complete configuration)
```

**预期结果：** 镜像使用语义化版本、提交 SHA 和环境标签进行标记。保留策略根据时间、拉取活动或数量限制自动清理旧镜像。生产标签（v* 模式）比开发分支保留更长时间。未标记的镜像被删除以节省存储。

**失败处理：** 对于保留策略未触发，验证 cron 计划语法和 Harbor 时区设置。对于意外删除生产镜像，使用 Harbor 标签不可变规则实施不可变标签。对于存储仍在增长，检查制品保留是否包含 Helm Chart 和其他 OCI 制品。对于策略冲突，确保保留规则使用 `or` 算法且不相互矛盾。

### 第 5 步：配置 Kubernetes 镜像拉取密钥

为 Kubernetes 集群设置仓库认证。

```bash
# Create Docker registry secret
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=USERNAME \
  --docker-password=$GITHUB_TOKEN \
  --docker-email=user@example.com \
# ... (see EXAMPLES.md for complete configuration)
```

**预期结果：** 在目标命名空间中创建镜像拉取密钥。Pod 成功从私有仓库拉取镜像。ServiceAccount 包含 imagePullSecrets。没有 ImagePullBackOff 错误。

**失败处理：** 对于认证错误，手动使用 `docker login` 验证凭证。对于找不到 Secret，检查命名空间是否与 Pod 命名空间匹配。对于仍然失败，使用 `kubectl get secret ghcr-secret -o jsonpath='{.data.\.dockerconfigjson}' | base64 -d | jq` 解码 Secret 并验证 JSON 结构。对于令牌过期，轮换凭证并更新 Secret。

### 第 6 步：启用漏洞扫描和镜像签名

集成 Trivy 扫描和 Cosign 用于镜像来源验证。

```bash
# Install Trivy CLI
wget https://github.com/aquasecurity/trivy/releases/latest/download/trivy_0.47.0_Linux-64bit.tar.gz
tar zxvf trivy_0.47.0_Linux-64bit.tar.gz
sudo mv trivy /usr/local/bin/

# Scan local image
# ... (see EXAMPLES.md for complete configuration)
```

**预期结果：** Trivy 扫描检测到带严重性评级的漏洞。SARIF 结果上传至 GitHub Security 选项卡。严重漏洞导致 CI/CD 构建失败。Cosign 使用密钥对或无密钥（Fulcio）签名镜像。已签名镜像的验证成功。Kyverno 阻止 Kubernetes 中未签名的镜像。

**失败处理：** 对于 Trivy 数据库下载失败，运行 `trivy image --download-db-only`。对于误报，创建包含 CVE ID 和理由的 `.trivyignore` 文件。对于 Cosign 签名失败，验证镜像摘要未变更（签名适用于特定摘要，而非标签）。对于 Kyverno 策略失败，检查镜像引用模式是否与实际镜像名称匹配。对于无密钥签名，验证 OIDC 令牌是否具有足够权限。

## 验证清单

- [ ] 仓库可通过 Docker CLI 登录访问
- [ ] 镜像使用正确认证成功推送和拉取
- [ ] 构建多架构镜像并创建清单
- [ ] 漏洞扫描在镜像推送时自动运行
- [ ] 保留策略按计划清理旧镜像
- [ ] Kubernetes 集群可通过 imagePullSecrets 拉取镜像
- [ ] 部署前验证镜像签名
- [ ] Webhook 通知在镜像更新时触发
- [ ] 仓库 UI 显示扫描结果和制品元数据

## 常见问题

- **默认公开镜像**：GitHub 包默认为私有，Docker Hub 默认为公开。验证可见性设置是否符合安全要求。

- **令牌过期**：个人访问令牌过期会中断 CI/CD。对自动化使用不过期的令牌，或实施轮换机制。

- **未标记镜像积累**：构建过程创建消耗存储的未标记镜像。启用未标记制品的自动清理。

- **缺少多架构支持**：仅构建 amd64，在 ARM 实例上失败。使用带 `--platform` 标志的 `docker buildx` 进行跨平台构建。

- **无速率限制保护**：免费 Docker Hub 账户限制为 100 次拉取/6 小时。实施直通缓存或升级计划。

- **可变标签**：覆盖 `latest` 标签破坏可复现性。对生产使用不可变标签（提交 SHA、语义化版本）。

- **不安全的仓库通信**：自托管仓库没有 TLS。始终使用带有效证书的 HTTPS。

- **无访问控制**：跨团队共享单一凭证。使用特定项目的机器人账户实施 RBAC。

## 相关技能

- `create-r-dockerfile` - 构建仓库的容器镜像
- `optimize-docker-build-cache` - 高效的镜像构建用于仓库推送
- `build-ci-cd-pipeline` - CI/CD 中的自动化仓库推送
- `deploy-to-kubernetes` - 从仓库拉取镜像
- `implement-gitops-workflow` - 仓库间的镜像晋升
