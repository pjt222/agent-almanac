---
name: implement-gitops-workflow
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Implement GitOps continuous delivery using Argo CD or Flux with app-of-apps pattern,
  automated sync policies, drift detection, and multi-environment promotion. Manage
  Kubernetes deployments declaratively from Git with automated reconciliation. Use when
  implementing declarative infrastructure management, migrating from imperative kubectl
  commands to Git-driven deployments, setting up multi-environment promotion workflows,
  enforcing code review gates for production, or meeting audit and compliance requirements.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: devops
  complexity: advanced
  language: multi
  tags: gitops, argocd, flux, sync, drift-detection
---

# GitOps 工作流之實

以 GitOps 原則用 Argo CD 或 Flux 部管 Kubernetes 應用，為自動、可審計、可重複之部署。

## 用時

- 實聲明式基建與應用管
- 自命令式 kubectl/helm 遷至 Git 驅動部署
- 設多環境推進工作流（dev → staging → prod）
- 為生產部署執代碼審與核關
- 以 Git 歷達合規與審計
- 以 Git 為單一真源實災備

## 入

- **必要**：有管理訪問之 Kubernetes 集群（EKS、GKE、AKS 或自托）
- **必要**：為 Kubernetes manifest 與 Helm chart 之 Git 庫
- **必要**：已裝 Argo CD 或 Flux CLI
- **可選**：為機密管之 Sealed Secrets 或 External Secrets Operator
- **可選**：為自動影像推進之 Image Updater
- **可選**：為監 sync 狀態之 Prometheus

## 法

> 見 [Extended Examples](references/EXAMPLES.md) 得完整配置檔與範本。


### 第一步：裝 Argo CD 並配庫訪

部 Argo CD 於集群並連 Git 庫。

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

**得：** Argo CD 已裝於 argocd 命名空間。UI 以 port-forward 或 Ingress 可訪。管理密碼已改。Git 庫以 SSH 或 token 認證加。庫連已驗。

**敗則：** pod CrashLoopBackOff 者，以 `kubectl logs -n argocd -l app.kubernetes.io/name=argocd-server` 察日志。庫連敗，驗 token 有庫訪權或 SSH 鍵已加於部署鍵。Ingress SSL 問，確 cert-manager 已成發證。登入敗，重取密碼或以 `kubectl delete secret argocd-initial-admin-secret -n argocd` 重置後重啟伺服器。

### 第二步：創應用 manifest 並部首應用

定 Argo CD Application 資源附 sync 策與健察。

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

**得：** 應用自 Git 自動 sync。生產命名空間已創資源。Argo CD UI 顯健康態。自動 sync 策啟 prune 與 self-heal。sync 於重試限內成。

**敗則：** sync 敗，以 `argocd app get myapp-prod` 與 `kubectl get events -n production` 察應用事件。Kustomize 建誤，本地測以 `kustomize build apps/myapp/overlays/prod`。命名空間誤，驗空間存或啟 CreateNamespace sync 選項。prune 問，以 `kubectl get <resource> -o yaml` 察 finalizer 與 owner reference。

### 第三步：實 App-of-Apps 模為多環境管

創管多環境子應用之根應用。

```bash
# Create app-of-apps structure
mkdir -p argocd-apps/{projects,infra,apps}

# Define projects for RBAC
cat > argocd-apps/projects/production.yaml <<EOF
apiVersion: argoproj.io/v1alpha1
# ... (see EXAMPLES.md for complete configuration)
```

**得：** 根應用管所有子應用。Git 中加應用則自動部。基建應用先應用部（若需用 sync waves）。項目執 RBAC 界。應用樹顯父子關。

**敗則：** 循環依賴者，用 sync waves 控序。項目權誤，驗 sourceRepos 與 destinations 合應用需。遞歸目錄問，確 YAML 有效無衝。子應用缺，以 `argocd app get root-app` 察根應用狀態。

### 第四步：配 Image Updater 為自動部署

設 Argo CD Image Updater 自動推進新影像版。

```bash
# Install Argo CD Image Updater
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-image-updater/stable/manifests/install.yaml

# Configure image update strategy via annotations
cat > argocd-apps/myapp-prod-autoupdate.yaml <<EOF
apiVersion: argoproj.io/v1alpha1
# ... (see EXAMPLES.md for complete configuration)
```

**得：** Image Updater 監倉庫中合標籤模之新影像。語義版策更至最新穩發。自動創帶新影像標籤之 Git commit。應用以更新影像 sync。Staging 用 digest 策為不變部署。

**敗則：** 倉庫訪誤，驗 image-updater 以 secret 或 ServiceAccount 有拉憑。寫回敗，察 git-creds secret 有推權。無更新察，驗標籤 regex 合實標籤以 `argocd-image-updater test ghcr.io/username/myapp`。認證問，察 image-updater 日志之詳細誤。

### 第五步：以 Argo Rollouts 實漸進部署

啟 canary 與 blue-green 部署附自動回滾。

```bash
# Install Argo Rollouts controller
kubectl create namespace argo-rollouts
kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml

# Install Rollouts kubectl plugin
curl -LO https://github.com/argoproj/argo-rollouts/releases/latest/download/kubectl-argo-rollouts-linux-amd64
# ... (see EXAMPLES.md for complete configuration)
```

**得：** Rollout 漸轉流量至 canary。每步行分析驗成功率。成則自動推進，敗則回滾。Argo CD sync Rollout 資源。儀表板顯實時 rollout 進。

**敗則：** 分析敗，驗 Prometheus 可訪且查返有效果。流量路由問，察 Ingress 注解與 canary 服務端點。卡 rollout 手推進或中止。修訂不合，確 Argo CD sync 策不與 Rollouts 控制器更新衝。

### 第六步：配漂移察與 webhook 通知

監手動變並送警於 Slack/email。

```bash
# Configure drift detection in Application
cat > argocd-apps/myapp-strict.yaml <<EOF
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp-prod
# ... (see EXAMPLES.md for complete configuration)
```

**得：** Self-heal 自動反手動 kubectl 變。sync 敗與成部署於 Slack 送通知。webhook 觸他系（PagerDuty、監、ITSM）。漂移警顯何變與誰變（以 Git 歷）。

**敗則：** self-heal 不觸，驗啟自動 sync 策且刷新間不太長（默 3m）。通知敗，以 curl 測 Slack token 並驗 bot 已加於頻道。忽異不作，察 JSON pointer 語法合資源結構。webhook 誤，察端點可達與認證頭。

## 驗

- [ ] Argo CD 或 Flux 已裝可於 UI/CLI 訪
- [ ] Git 庫以正認證連
- [ ] commit 時應用自 Git 自動 sync
- [ ] 手動 kubectl 變由 self-heal 反
- [ ] App-of-apps 模部多應用
- [ ] Image Updater 依標籤模推進新影像
- [ ] Argo Rollouts 行漸進 canary 部署
- [ ] sync 事件時於 Slack/email 送通知
- [ ] 漂移察於帶外變時警
- [ ] RBAC 執項目級訪控

## 陷

- **自動 prune 停用**：Git 除資源於集群留存。sync 策啟 `prune: true`

- **無 sync waves**：基建應用部於依之應用後。用 `argocd.argoproj.io/sync-wave` 注解控序

- **忽 HPA 管之 replicas**：HPA 變 replica 數致 sync 敗。加 `/spec/replicas` 於 ignoreDifferences

- **寫回衝**：Image Updater commit 與手動 commit 衝。用異分支或細粒 RBAC

- **缺 finalizer**：應用刪留孤兒資源。於 Application 元資加 `resources-finalizer.argocd.argoproj.io`

- **無分析範本**：Rollouts 未驗自動推進。以指標查實 AnalysisTemplate

- **Git 中機密**：明文機密 commit 於庫。用 Sealed Secrets 或 External Secrets Operator

- **self-heal 過猛**：self-heal 反合法急變。以注解暫停用或實核關

## 參

- `configure-git-repository` — 為 GitOps 設 Git 庫結構
- `manage-git-branches` — 環境推進之分支策
- `deploy-to-kubernetes` — 識 GitOps 管之 Kubernetes 資源
- `manage-kubernetes-secrets` — Sealed Secrets 與 Argo CD 整合
- `build-ci-cd-pipeline` — CI 建影像，GitOps 部之
- `setup-container-registry` — 倉庫間影像推進
