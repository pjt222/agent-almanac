---
name: implement-gitops-workflow
locale: wenyan-lite
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

# 實 GitOps 工作流程

以 GitOps 原則用 Argo CD 或 Flux 部署並管 Kubernetes 應用，以自動化、可稽核、可重複部署。

## 適用時機

- 實聲明式基礎設施與應用管理
- 自命令式 kubectl/helm 指令遷至 Git 驅動部署
- 設多環境晉升工作流程（dev → staging → prod）
- 為生產部署強制碼審與核准閘
- 以 Git 歷史達合規與稽核要求
- 以 Git 為唯一真實來源實災難恢復

## 輸入

- **必要**：附管理員存取之 Kubernetes 叢集（EKS、GKE、AKS 或自託）
- **必要**：Kubernetes 清單與 Helm 圖之 Git 倉
- **必要**：Argo CD 或 Flux CLI 已裝
- **選擇性**：Sealed Secrets 或 External Secrets Operator 以管機密
- **選擇性**：Image Updater 以自動化影像晉升
- **選擇性**：Prometheus 以監同步狀態

## 步驟

> 見 [擴展範例](references/EXAMPLES.md) 之完整配置檔與模板。


### 步驟一：裝 Argo CD 並配倉存取

部署 Argo CD 於叢集並連 Git 倉。

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

**預期：** Argo CD 裝於 argocd 命名空間。UI 經 port-forward 或 Ingress 可存取。管理員密碼已改。Git 倉已加，以 SSH 或 token 驗證。倉連線已驗。

**失敗時：** Pod CrashLoopBackOff 時，以 `kubectl logs -n argocd -l app.kubernetes.io/name=argocd-server` 核日誌。倉連失敗則驗 token 有倉存取或 SSH 金鑰已加於部署金鑰。Ingress SSL 問題確 cert-manager 成功發憑證。登入失敗則重取密碼或經 `kubectl delete secret argocd-initial-admin-secret -n argocd` 重設並重啟伺服器。

### 步驟二：建應用清單並部署首應用

定 Argo CD Application 資源附同步政策與健康檢查。

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

**預期：** 應用自 Git 自動同步。資源建於 production 命名空間。Argo CD UI 顯健康狀態。自動化同步政策啟 prune 與自癒。同步於重試限內成功。

**失敗時：** 同步失敗時，以 `argocd app get myapp-prod` 與 `kubectl get events -n production` 核應用事件。Kustomize 建置錯則本地以 `kustomize build apps/myapp/overlays/prod` 測。命名空間錯則驗命名空間存或啟 CreateNamespace 同步選項。Prune 問題則核終結器與擁有者參考以 `kubectl get <resource> -o yaml`。

### 步驟三：實 App-of-Apps 模式以多環境管理

建根應用以管跨環境之子應用。

```bash
# Create app-of-apps structure
mkdir -p argocd-apps/{projects,infra,apps}

# Define projects for RBAC
cat > argocd-apps/projects/production.yaml <<EOF
apiVersion: argoproj.io/v1alpha1
# ... (see EXAMPLES.md for complete configuration)
```

**預期：** 根應用管所有子應用。加於 Git 時新應用自動部署。基礎設施應用於應用前部署（必要時經同步波）。專案強制 RBAC 界。應用樹示父子關係。

**失敗時：** 循環依賴時，用同步波控順。專案權限錯則驗 sourceRepos 與 destinations 配應用要求。遞迴目錄問題則確 YAML 檔有效且不衝突。缺子應用則以 `argocd app get root-app` 核根應用狀態。

### 步驟四：配 Image Updater 以自動部署

設 Argo CD Image Updater 以自動晉升新影像版本。

```bash
# Install Argo CD Image Updater
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-image-updater/stable/manifests/install.yaml

# Configure image update strategy via annotations
cat > argocd-apps/myapp-prod-autoupdate.yaml <<EOF
apiVersion: argoproj.io/v1alpha1
# ... (see EXAMPLES.md for complete configuration)
```

**預期：** Image Updater 監註冊處配標籤模式之新影像。語義版本策略更新至最新穩定版。Git 提交自動建附新影像標籤。應用以更新影像同步。Staging 用摘要策略以不可變部署。

**失敗時：** 註冊處存取錯時，驗 image-updater 經 secret 或 ServiceAccount 有拉取憑證。回寫失敗則核 git-creds 密鑰有推送權限。未偵測到更新則驗標籤正則配實標籤以 `argocd-image-updater test ghcr.io/username/myapp`。驗證問題則核 image-updater 日誌以得詳錯訊息。

### 步驟五：以 Argo Rollouts 實漸進交付

啟金絲雀與藍綠部署附自動回滾。

```bash
# Install Argo Rollouts controller
kubectl create namespace argo-rollouts
kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml

# Install Rollouts kubectl plugin
curl -LO https://github.com/argoproj/argo-rollouts/releases/latest/download/kubectl-argo-rollouts-linux-amd64
# ... (see EXAMPLES.md for complete configuration)
```

**預期：** Rollout 漸移流量至金絲雀。分析於每步執行，驗成功率。成功時自動晉升、失敗時回滾。Argo CD 同步 Rollout 資源。儀表板示即時 rollout 進展。

**失敗時：** 分析失敗時，驗 Prometheus 可存取且查詢返有效結果。流量路由問題則核 Ingress 標註與金絲雀服務端點。Rollouts 卡時手動晉升或中止。版本不配時確 Argo CD 同步政策不與 Rollouts 控制器更新衝突。

### 步驟六：配漂移偵測與 Webhook 通知

監手動變更並送警至 Slack/電郵。

```bash
# Configure drift detection in Application
cat > argocd-apps/myapp-strict.yaml <<EOF
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp-prod
# ... (see EXAMPLES.md for complete configuration)
```

**預期：** 自癒自動還原手動 kubectl 變更。通知於同步失敗與成功部署時送至 Slack。Webhook 觸發外部系統（PagerDuty、監控、ITSM）。漂移警示示何變與誰作變（經 Git 歷史）。

**失敗時：** 自癒不觸發時，驗自動同步政策已啟且更新間隔不過長（預設 3m）。通知失敗則以 curl 測 Slack token 並驗 bot 加於頻道。忽略差異不工作則核 JSON pointer 語法配資源結構。Webhook 錯則核端點可達性與驗證標頭。

## 驗證

- [ ] Argo CD 或 Flux 已裝且經 UI/CLI 可存取
- [ ] Git 倉已連附合宜驗證
- [ ] 應用於提交時自 Git 自動同步
- [ ] 手動 kubectl 變更由自癒還原
- [ ] App-of-apps 模式部署多應用
- [ ] Image Updater 依標籤模式晉升新影像
- [ ] Argo Rollouts 執行漸進金絲雀部署
- [ ] 同步事件通知送至 Slack/電郵
- [ ] 漂移偵測於帶外變更時警示
- [ ] RBAC 強制專案級存取控制

## 常見陷阱

- **自動 prune 禁用**：自 Git 移之資源留於叢集。於同步政策啟 `prune: true`。

- **無同步波**：基礎設施應用於依其之應用後部署。用 `argocd.argoproj.io/sync-wave` 標註以控順。

- **忽視 HPA 管之副本**：因 HPA 變副本數而同步失敗。加 `/spec/replicas` 於 ignoreDifferences。

- **回寫衝突**：Image Updater 提交與手動提交衝突。用分開分支或細粒 RBAC 為 image updater。

- **缺終結器**：應用刪除留孤資源。加 `resources-finalizer.argocd.argoproj.io` 於 Application 元資料。

- **無分析模板**：Rollouts 未驗而自動晉升。以指標查詢實 AnalysisTemplates。

- **機密於 Git**：明文機密提交於倉。用 Sealed Secrets 或 External Secrets Operator。

- **自癒過激**：自癒還原合法緊急變更。用標註以暫禁或實核准閘。

## 相關技能

- `configure-git-repository` - 為 GitOps 設 Git 倉結構
- `manage-git-branches` - 環境晉升之分支策略
- `deploy-to-kubernetes` - 解 GitOps 所管之 Kubernetes 資源
- `manage-kubernetes-secrets` - Sealed Secrets 與 Argo CD 整合
- `build-ci-cd-pipeline` - CI 建影像，GitOps 部署之
- `setup-container-registry` - 註冊處間之影像晉升
