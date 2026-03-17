---
name: setup-container-registry
description: >
  GitHub Container Registry（ghcr.io）、Docker Hub、Harborなどのコンテナイメージレジストリを、
  自動イメージスキャン、タグ付け戦略、保持ポリシー、セキュアなイメージ配布のための
  CI/CD統合と共に設定します。プライベートコンテナレジストリのセットアップ、Docker Hubから
  セルフホステッドレジストリへの移行、CI/CDパイプラインへの脆弱性スキャンの実装、
  マルチアーキテクチャイメージの管理、イメージ署名の強制、または自動クリーンアップと
  保持ポリシーの設定に使用します。
locale: ja
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: "2026-03-16"
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: devops
  complexity: basic
  language: multi
  tags: container-registry, docker-hub, ghcr, harbor, vulnerability-scanning
---

# コンテナレジストリのセットアップ

セキュリティスキャン、アクセス制御、自動CI/CD統合を備えた本番対応コンテナレジストリを設定します。

## 使用タイミング

- 組織向けプライベートコンテナレジストリのセットアップ
- Docker Hubからセルフホステッドまたは代替レジストリへの移行
- CI/CDパイプラインへのイメージ脆弱性スキャンの実装
- マルチアーキテクチャイメージ（amd64、arm64）のマニフェスト管理
- イメージ署名と出所検証の強制
- 自動イメージクリーンアップと保持ポリシーの設定

## 入力

- **必須**: DockerまたはPodmanがローカルにインストール済み
- **必須**: レジストリ認証情報（個人アクセストークン、サービスアカウント）
- **任意**: Harborデプロイ向けセルフホステッドインフラ
- **任意**: レジストリ統合向けKubernetesクラスター
- **任意**: イメージ署名向けCosign/Notary
- **任意**: 脆弱性スキャン向けTrivyまたはClair

## 手順

> 完全な設定ファイルとテンプレートは[拡張サンプル](references/EXAMPLES.md)を参照してください。

### ステップ1: GitHub Container Registry（ghcr.io）の設定

個人アクセストークンとCI/CD統合でGitHub Container Registryをセットアップします。

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

**期待結果：** GitHubトークンにパッケージ権限があります。Dockerログインが成功します。イメージが適切なタグでghcr.ioにプッシュされます。GitHub Actionsワークフローが自動タグ付きマルチアーキテクチャイメージをビルドします。パッケージの可視性が正しく設定されます。

**失敗時：** 認証エラーの場合、トークンに `write:packages` スコープがあり有効期限が切れていないことを確認します。プッシュ失敗の場合、リポジトリ名がイメージ名と一致することを確認します（大文字小文字の区別あり）。ワークフロー失敗の場合、`permissions: packages: write` が設定されていることを確認します。公開パッケージがアクセスできない場合、可視性変更が伝播するまで最大10分待ちます。

### ステップ2: Docker Hubと自動ビルドの設定

アクセストークンと脆弱性スキャンでDocker Hubリポジトリをセットアップします。

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

**期待結果：** 読み取り・書き込み権限を持つDocker Hubアクセストークンが作成されます。マルチアーキテクチャサポートでイメージが正常にプッシュされます。脆弱性スキャンが自動実行されます（有効な場合）。READMEがGitHubから同期されます。イメージプッシュ時にWebhookがトリガーされます。

**失敗時：** レート制限エラーの場合、Proプランへのアップグレードまたはプルスルーキャッシュの実装を検討します。スキャン失敗の場合、プランにスキャンが含まれることを確認します（無料プランでは利用不可）。マルチアーキテクチャビルド失敗の場合、`docker run --privileged --rm tonistiigi/binfmt --install all` でQEMUがインストールされていることを確認します。Webhook失敗の場合、エンドポイントが公開アクセス可能で200 OKを返すことを確認します。

### ステップ3: Harborセルフホステッドレジストリのデプロイ

エンタープライズレジストリとしてRBACとレプリケーション機能を持つHarborをHelmでインストールします。

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

**期待結果：** HarborがPostgreSQLとRedisを備えたKubernetesにデプロイされます。IngressがTLSで設定されます。管理UIがアクセス可能です。脆弱性スキャンが有効なプロジェクトが作成されます。ロボットアカウントがCI/CD認証を提供します。Trivyがプッシュ時にイメージをスキャンします。

**失敗時：** データベース接続エラーの場合、`kubectl logs -n harbor harbor-database-0` でPostgreSQLポッドのログを確認します。Ingressの問題の場合、DNSがLoadBalancerを指しているかcert-managerが証明書を発行しているか確認します。Trivyの失敗の場合、脆弱性データベースが正常にダウンロードされているか確認します。ストレージの問題の場合、`kubectl get pvc -n harbor` でPVCがバインドされているか確認します。

### ステップ4: イメージタグ戦略と保持ポリシーの実装

セマンティックバージョニング、イミュータブルタグ、自動クリーンアップを設定します。

```bash
# Tagging best practices
# 1. Semantic versioning
docker tag myapp:latest harbor.example.com/myapp/app:v1.2.3
docker tag myapp:latest harbor.example.com/myapp/app:v1.2
docker tag myapp:latest harbor.example.com/myapp/app:v1
docker tag myapp:latest harbor.example.com/myapp/app:latest
# ... (see EXAMPLES.md for complete configuration)
```

**期待結果：** イメージがセマンティックバージョン、コミットSHA、環境ラベルでタグ付けされます。保持ポリシーが古いイメージを年齢、プルアクティビティ、またはカウント制限に基づいて自動クリーンアップします。本番タグ（v*パターン）が開発ブランチより長く保持されます。タグなしイメージがストレージ節約のために削除されます。

**失敗時：** 保持がトリガーされない場合、cronスケジュール構文とHarborタイムゾーン設定を確認します。本番イメージが誤って削除された場合、HarborタグイミュータビリティルールでイミュータブルタグをImplementします。ストレージが依然として増加する場合、アーティファクト保持にHelmチャートやその他のOCIアーティファクトが含まれているか確認します。ポリシーの競合の場合、保持ルールが `or` アルゴリズムを使用し互いに矛盾しないことを確認します。

### ステップ5: KubernetesイメージプルシークレットのConfiguration

Kubernetesクラスター向けレジストリ認証をセットアップします。

```bash
# Create Docker registry secret
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=USERNAME \
  --docker-password=$GITHUB_TOKEN \
  --docker-email=user@example.com \
# ... (see EXAMPLES.md for complete configuration)
```

**期待結果：** ターゲットnamespaceにイメージプルシークレットが作成されます。PodがプライベートレジストリからイメージをプルするWay。ServiceAccountがimagePullSecretsを含みます。ImagePullBackOffエラーがありません。

**失敗時：** 認証エラーの場合、`docker login` で手動認証情報を確認します。シークレットが見つからない場合、namespaceがPodのnamespaceに一致するか確認します。まだ失敗する場合、`kubectl get secret ghcr-secret -o jsonpath='{.data.\.dockerconfigjson}' | base64 -d | jq` でシークレットをデコードしJSON構造を確認します。トークンの有効期限が切れた場合、認証情報をローテーションしシークレットを更新します。

### ステップ6: 脆弱性スキャンとイメージ署名の有効化

イメージの出所のためのTrivyスキャンとCosignを統合します。

```bash
# Install Trivy CLI
wget https://github.com/aquasecurity/trivy/releases/latest/download/trivy_0.47.0_Linux-64bit.tar.gz
tar zxvf trivy_0.47.0_Linux-64bit.tar.gz
sudo mv trivy /usr/local/bin/

# Scan local image
# ... (see EXAMPLES.md for complete configuration)
```

**期待結果：** Trivyスキャンが重大度評価付きの脆弱性を検出します。SARIF結果がGitHubセキュリティタブにアップロードされます。クリティカルな脆弱性がCI/CDビルドを失敗させます。Cosignがキーペアまたはキーレス（Fulcio）でイメージに署名します。署名済みイメージの検証が成功します。KyvernoがKubernetesで未署名イメージをブロックします。

**失敗時：** Trivyデータベースダウンロード失敗の場合、`trivy image --download-db-only` を実行します。誤検知の場合、CVE IDと理由を含む `.trivyignore` ファイルを作成します。Cosign署名失敗の場合、イメージダイジェストが変わっていないことを確認します（署名は特定のダイジェストに適用され、タグではありません）。Kyvernoポリシー失敗の場合、イメージ参照パターンが実際のイメージ名と一致するか確認します。キーレス署名の場合、OIDCトークンに十分な権限があることを確認します。

## バリデーション

- [ ] Docker CLIログインでレジストリにアクセス可能
- [ ] 適切な認証でイメージがプッシュ・プル可能
- [ ] マルチアーキテクチャイメージがビルドされマニフェストが作成済み
- [ ] イメージプッシュ時に脆弱性スキャンが自動実行
- [ ] 保持ポリシーがスケジュールで古いイメージをクリーンアップ
- [ ] KubernetesクラスターがimagePullSecrets経由でイメージをプル可能
- [ ] デプロイ前にイメージ署名が検証済み
- [ ] イメージ更新時にWebhook通知がトリガー
- [ ] レジストリUIがスキャン結果とアーティファクトメタデータを表示

## よくある落とし穴

- **デフォルトで公開イメージ**: GitHubパッケージはデフォルトでプライベート、Docker Hubはデフォルトで公開。セキュリティ要件に一致する可視性設定を確認してください。

- **トークンの有効期限**: 個人アクセストークンが有効期限切れになり、CI/CDが壊れます。自動化には有効期限なしのトークンを使用するか、ローテーションを実装してください。

- **タグなしイメージの蓄積**: ビルドプロセスがストレージを消費するタグなしイメージを作成します。タグなしアーティファクトの自動クリーンアップを有効にしてください。

- **マルチアーキテクチャサポートなし**: amd64のみをビルドし、ARMインスタンスで失敗します。クロスプラットフォームビルドに `--platform` フラグ付きの `docker buildx` を使用してください。

- **レート制限保護なし**: 無料のDocker Hubアカウントは100プル/6時間に制限されています。プルスルーキャッシュを実装するかプランをアップグレードしてください。

- **ミュータブルタグ**: `latest` タグの上書きが再現性を損ないます。本番には（コミットSHA、セマンティックバージョンの）イミュータブルタグを使用してください。

- **非セキュアなレジストリ通信**: TLSなしのセルフホステッドレジストリ。有効な証明書を持つHTTPSを常に使用してください。

- **アクセス制御なし**: チーム間で単一の認証情報を共有しています。プロジェクト固有のロボットアカウントによるRBACを実装してください。

## 関連スキル

- `create-r-dockerfile` - レジストリ向けコンテナイメージのビルド
- `optimize-docker-build-cache` - レジストリプッシュ向け効率的なイメージビルド
- `build-ci-cd-pipeline` - CI/CDでの自動レジストリプッシュ
- `deploy-to-kubernetes` - レジストリからのイメージプル
- `implement-gitops-workflow` - レジストリ間のイメージプロモーション
