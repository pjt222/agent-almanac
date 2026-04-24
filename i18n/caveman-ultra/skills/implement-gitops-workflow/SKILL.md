---
name: implement-gitops-workflow
locale: caveman-ultra
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

# Implement GitOps Workflow

Deploy + manage K8s apps via GitOps: Argo CD / Flux → automated, auditable, repeatable.

## Use When

- Declarative infra + app mgmt
- Migrate kubectl/helm → Git-driven
- Multi-env promotion (dev → staging → prod)
- Enforce code review + approval gates
- Compliance + audit via Git history
- DR w/ Git as SSOT

## In

- **Required**: K8s cluster admin (EKS, GKE, AKS, self-hosted)
- **Required**: Git repo for manifests + Helm charts
- **Required**: Argo CD or Flux CLI
- **Optional**: Sealed Secrets / External Secrets Operator
- **Optional**: Image Updater for auto promotion
- **Optional**: Prometheus for sync monitoring

## Do

> See [Extended Examples](references/EXAMPLES.md) for complete configuration files and templates.


### Step 1: Install Argo CD + configure repo

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

→ Argo CD in argocd NS. UI via port-forward or Ingress. Admin pw changed. Repo added (SSH/token). Connection verified.

**If err:** CrashLoopBackOff → `kubectl logs -n argocd -l app.kubernetes.io/name=argocd-server`. Repo fail → verify token has repo access or SSH key in deploy keys. Ingress SSL → ensure cert-manager issued. Login fail → retrieve pw again or `kubectl delete secret argocd-initial-admin-secret -n argocd` + restart.

### Step 2: App manifest + deploy first

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

→ App auto-synced from Git. Resources in prod NS. UI healthy. Auto sync w/ prune + self-heal. Sync succeeds within retry.

**If err:** sync fail → `argocd app get myapp-prod` + `kubectl get events -n production`. Kustomize build err → test local `kustomize build apps/myapp/overlays/prod`. NS err → verify exists or enable CreateNamespace. Pruning issues → check finalizers + owner refs.

### Step 3: App-of-apps for multi-env

```bash
# Create app-of-apps structure
mkdir -p argocd-apps/{projects,infra,apps}

# Define projects for RBAC
cat > argocd-apps/projects/production.yaml <<EOF
apiVersion: argoproj.io/v1alpha1
# ... (see EXAMPLES.md for complete configuration)
```

→ Root app manages all children. New apps auto-deployed on Git add. Infra apps before app apps (sync waves). Projects enforce RBAC. Tree shows parent-child.

**If err:** circular deps → sync waves control order. Project perm errs → verify sourceRepos + destinations match. Recursive dir issues → valid YAML no conflict. Missing children → `argocd app get root-app`.

### Step 4: Image Updater for auto deploy

```bash
# Install Argo CD Image Updater
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-image-updater/stable/manifests/install.yaml

# Configure image update strategy via annotations
cat > argocd-apps/myapp-prod-autoupdate.yaml <<EOF
apiVersion: argoproj.io/v1alpha1
# ... (see EXAMPLES.md for complete configuration)
```

→ Updater monitors registry for new images matching tag patterns. Semver → latest stable. Git commits auto w/ new tags. Apps sync w/ updates. Staging uses digest (immutable).

**If err:** registry access → verify image-updater has pull creds (secret or SA). Write-back fail → check git-creds push perms. No updates → verify regex matches w/ `argocd-image-updater test ghcr.io/username/myapp`. Auth → check image-updater logs.

### Step 5: Progressive delivery via Argo Rollouts

```bash
# Install Argo Rollouts controller
kubectl create namespace argo-rollouts
kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml

# Install Rollouts kubectl plugin
curl -LO https://github.com/argoproj/argo-rollouts/releases/latest/download/kubectl-argo-rollouts-linux-amd64
# ... (see EXAMPLES.md for complete configuration)
```

→ Progressive traffic shift to canary. Analysis validates success rate each step. Auto-promote on success, rollback on fail. Argo CD syncs Rollouts. Dashboard shows real-time progress.

**If err:** analysis fails → verify Prometheus accessible + query valid. Traffic routing → Ingress annotations + canary service endpoints. Stuck → manual promote/abort. Revision mismatch → ensure Argo CD sync policy no conflict w/ Rollouts controller.

### Step 6: Drift detection + webhook notifications

```bash
# Configure drift detection in Application
cat > argocd-apps/myapp-strict.yaml <<EOF
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp-prod
# ... (see EXAMPLES.md for complete configuration)
```

→ Self-heal auto-reverts manual kubectl changes. Slack notif on sync fail + successful deploys. Webhooks trigger external (PagerDuty, monitoring, ITSM). Drift alerts show changes + who (via Git history).

**If err:** self-heal not triggering → verify auto sync enabled + refresh interval not too long (default 3m). Notif fails → test Slack token w/ curl + bot added to channels. Ignored diffs not working → check JSON pointer syntax. Webhook errs → endpoint accessibility + auth headers.

## Check

- [ ] Argo CD / Flux installed + accessible
- [ ] Git repo connected w/ auth
- [ ] Apps auto-sync from Git on commit
- [ ] Manual kubectl changes reverted by self-heal
- [ ] App-of-apps deploys multiple
- [ ] Image Updater promotes by tag patterns
- [ ] Argo Rollouts progressive canary
- [ ] Notifications to Slack/email on sync
- [ ] Drift detection alerts out-of-band
- [ ] RBAC enforces project access

## Traps

- **Auto prune disabled**: removed from Git remain in cluster. `prune: true` in sync.
- **No sync waves**: infra deployed after dependent apps. `argocd.argoproj.io/sync-wave` annotations.
- **Ignoring HPA replicas**: sync fails b/c HPA changed count. Add `/spec/replicas` to ignoreDifferences.
- **Write-back conflicts**: Updater commits conflict w/ manual. Separate branch or fine RBAC.
- **Missing finalizers**: deletion leaves orphans. Add `resources-finalizer.argocd.argoproj.io`.
- **No analysis templates**: Rollouts promote w/o validation. Impl AnalysisTemplates w/ metrics queries.
- **Secrets in Git**: plaintext committed. Use Sealed Secrets / External Secrets.
- **Self-heal too aggressive**: reverts legitimate emergency changes. Annotations temporarily disable or approval gates.

## →

- `configure-git-repository` — repo structure for GitOps
- `manage-git-branches` — branch strategies for env promotion
- `deploy-to-kubernetes` — K8s resources managed by GitOps
- `manage-kubernetes-secrets` — Sealed Secrets integration
- `build-ci-cd-pipeline` — CI builds, GitOps deploys
- `setup-container-registry` — image promotion between registries
