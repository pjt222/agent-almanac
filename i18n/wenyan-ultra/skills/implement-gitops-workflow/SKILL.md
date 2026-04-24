---
name: implement-gitops-workflow
locale: wenyan-ultra
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

# 實 GitOps 工作流

用 Argo CD 或 Flux 依 GitOps 則部與管 K8s 應用，以自動、可審、可重之部署。

## 用

- 實聲明式基建與應用管
- 由 kubectl/helm 命令遷至 Git 驅部署
- 立多環境升級工作流（dev → staging → prod）
- 強製產部署之碼審與批門
- 以 Git 史達合規審查
- 以 Git 為唯一真源實災備

## 入

- **必**：管員訪之 K8s 群（EKS、GKE、AKS 或自託）
- **必**：K8s 清單與 Helm 圖之 Git 倉
- **必**：Argo CD 或 Flux CLI 已裝
- **可**：Sealed Secrets 或 External Secrets Operator 管密
- **可**：Image Updater 供自動像升
- **可**：Prometheus 監同步態

## 行

> 全配置檔與模見 [Extended Examples](references/EXAMPLES.md)。


### 一：裝 Argo CD 並配倉訪

部 Argo CD 於群並連 Git 倉。

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

得：Argo CD 裝於 argocd 命名空。UI 經埠轉或 Ingress 可訪。管員密由默改。Git 倉以 SSH 或 token 認證加。倉連已驗。

敗：Pod CrashLoopBackOff→察 `kubectl logs -n argocd -l app.kubernetes.io/name=argocd-server`。倉連敗→驗 token 有倉訪或 SSH 鍵已加於部署鍵。Ingress SSL 題→確 cert-manager 證成發。登敗→再取密或 `kubectl delete secret argocd-initial-admin-secret -n argocd` 重啟服。

### 二：造應用清單並部首應用

定 Argo CD Application 資源含同步策與健察。

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

得：應用自動自 Git 同步。資源造於 production 命名空。Argo CD UI 示健態。自動同步策啟 prune 與自癒。同步於重試限內成。

敗：同步敗→察 `argocd app get myapp-prod` 與 `kubectl get events -n production` 之應用事件。Kustomize 建誤→本地試 `kustomize build apps/myapp/overlays/prod`。命名空誤→驗存或啟 CreateNamespace 同步選。剪除題→察 `kubectl get <resource> -o yaml` 之終結器與所有者引。

### 三：實 app-of-apps 模供多環管

造根應用管諸子應用跨環境。

```bash
# Create app-of-apps structure
mkdir -p argocd-apps/{projects,infra,apps}

# Define projects for RBAC
cat > argocd-apps/projects/production.yaml <<EOF
apiVersion: argoproj.io/v1alpha1
# ... (see EXAMPLES.md for complete configuration)
```

得：根應用管諸子應用。新應用於加 Git 時自動部。基建應用於應用前部（經同步波若需）。項目強 RBAC 界。應用樹示父子關。

敗：循依→用同步波控序。項目權誤→驗 sourceRepos 與 destinations 符應用要。遞迴目錄題→確 YAML 有效且不衝。子應用缺→察 `argocd app get root-app` 根應用態。

### 四：配 Image Updater 供自動部

立 Argo CD Image Updater 自動升新像版。

```bash
# Install Argo CD Image Updater
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-image-updater/stable/manifests/install.yaml

# Configure image update strategy via annotations
cat > argocd-apps/myapp-prod-autoupdate.yaml <<EOF
apiVersion: argoproj.io/v1alpha1
# ... (see EXAMPLES.md for complete configuration)
```

得：Image Updater 監倉新像合標模。語義版策升至最新穩版。Git 提交自動造含新像標。應用以更新像同步。Staging 用摘要策供不變部署。

敗：倉訪誤→驗 image-updater 有拉憑（經 secret 或 ServiceAccount）。回寫敗→察 git-creds secret 有推權。未察更新→驗標正則符實標用 `argocd-image-updater test ghcr.io/username/myapp`。認證題→察 image-updater 記細誤訊。

### 五：用 Argo Rollouts 實漸進部署

啟金絲雀與藍綠部署含自動回退。

```bash
# Install Argo Rollouts controller
kubectl create namespace argo-rollouts
kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml

# Install Rollouts kubectl plugin
curl -LO https://github.com/argoproj/argo-rollouts/releases/latest/download/kubectl-argo-rollouts-linux-amd64
# ... (see EXAMPLES.md for complete configuration)
```

得：Rollout 漸移流量至金絲雀。各步析驗成功率。成則自動升、敗則回退。Argo CD 同步 Rollout 資源。儀表板示即時 rollout 進度。

敗：析敗→驗 Prometheus 可訪且查返有效果。流量路由題→察 Ingress 註與金絲雀服端點。Rollout 卡→手升或棄。版本失配→確 Argo CD 同步策不與 Rollouts 控器更衝。

### 六：配漂移察與鉤通知

監手變並送警至 Slack/電郵。

```bash
# Configure drift detection in Application
cat > argocd-apps/myapp-strict.yaml <<EOF
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp-prod
# ... (see EXAMPLES.md for complete configuration)
```

得：自癒自動回手 kubectl 變。通知於同步敗與成部署送至 Slack。鉤觸他系（PagerDuty、監、ITSM）。漂移警示何變並（經 Git 史）示誰改。

敗：自癒不觸→驗自動同步策啟且刷新期不過長（默 3m）。通知敗→curl 試 Slack token 並驗機器人加入通道。忽差不作→察 JSON 指示語法符資源構。鉤誤→察端訪性與認證頭。

## 驗

- [ ] Argo CD 或 Flux 已裝且經 UI/CLI 可訪
- [ ] Git 倉以適認證連
- [ ] 應用於提交時自 Git 自動同步
- [ ] 手 kubectl 變由自癒回
- [ ] App-of-apps 模部多應用
- [ ] Image Updater 依標模升新像
- [ ] Argo Rollouts 行漸進金絲雀部署
- [ ] 同步事件通知送 Slack/電郵
- [ ] 漂移察警外變
- [ ] RBAC 強項目級訪控

## 忌

- **自動剪除棄**：自 Git 除之資源留群。同步策啟 `prune: true`

- **無同步波**：基建應用於依其之應用後部。用 `argocd.argoproj.io/sync-wave` 註控序

- **忽 HPA 管副本**：HPA 改副本數→同步敗。加 `/spec/replicas` 於 ignoreDifferences

- **回寫衝**：Image Updater 提與手提衝。用別枝或細 RBAC 供 image updater

- **缺終結器**：應用刪留孤資源。加 `resources-finalizer.argocd.argoproj.io` 於 Application 元

- **無析模板**：Rollouts 無驗自動升。實 AnalysisTemplates 含指查

- **Git 中之密**：明文密提於倉。用 Sealed Secrets 或 External Secrets Operator

- **自癒過激**：自癒回合法急變。用註暫禁或實批門

## 參

- `configure-git-repository`
- `manage-git-branches`
- `deploy-to-kubernetes`
- `manage-kubernetes-secrets`
- `build-ci-cd-pipeline`
- `setup-container-registry`
