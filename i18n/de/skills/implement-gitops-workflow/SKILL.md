---
name: implement-gitops-workflow
description: >
  GitOps-Continuous-Delivery mit Argo CD oder Flux implementieren — mit App-of-Apps-
  Muster, automatisierten Sync-Richtlinien, Drift-Erkennung und Multi-Umgebungs-
  Promotion. Kubernetes-Deployments deklarativ aus Git mit automatisierter
  Reconciliation verwalten. Einsatz beim Implementieren deklarativen
  Infrastrukturmanagements, bei der Migration von imperativen kubectl-Befehlen zu
  Git-gesteuerten Deployments, beim Einrichten von Multi-Umgebungs-Promotion-
  Workflows, beim Durchsetzen von Code-Review-Genehmigungsgates fuer Production
  oder beim Erfuellen von Audit- und Compliance-Anforderungen.
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
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

# GitOps-Workflow implementieren

Kubernetes-Anwendungen mit GitOps-Prinzipien ueber Argo CD oder Flux fuer automatisierte, prueffaehige und reproduzierbare Deployments bereitstellen und verwalten.

## Wann verwenden

- Deklaratives Infrastruktur- und Anwendungsmanagement implementieren
- Von imperativen kubectl/helm-Befehlen zu Git-gesteuerten Deployments migrieren
- Multi-Umgebungs-Promotion-Workflows einrichten (Dev → Staging → Prod)
- Code-Review- und Genehmigungsgates fuer Production-Deployments durchsetzen
- Compliance- und Audit-Anforderungen mit Git-Historie erfuellen
- Disaster Recovery mit Git als Single Source of Truth implementieren

## Eingaben

- **Erforderlich**: Kubernetes-Cluster mit Admin-Zugriff (EKS, GKE, AKS oder selbst-gehostet)
- **Erforderlich**: Git-Repository fuer Kubernetes-Manifeste und Helm-Charts
- **Erforderlich**: Argo CD oder Flux CLI installiert
- **Optional**: Sealed Secrets oder External Secrets Operator fuer Secrets-Verwaltung
- **Optional**: Image Updater fuer automatisierte Image-Promotion
- **Optional**: Prometheus fuer Sync-Status-Monitoring

## Vorgehensweise

> Siehe [Erweiterte Beispiele](references/EXAMPLES.md) fuer vollstaendige Konfigurationsdateien und Vorlagen.

### Schritt 1: Argo CD installieren und Repository-Zugriff konfigurieren

Argo CD im Cluster deployen und mit Git-Repository verbinden.

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

**Erwartet:** Argo CD im argocd-Namespace installiert. UI ueber Port-Forward oder Ingress zugaenglich. Admin-Passwort vom Standard geaendert. Git-Repository mit SSH oder Token-Authentifizierung hinzugefuegt.

**Bei Fehler:** Bei Pod-CrashLoopBackOff Logs mit `kubectl logs -n argocd -l app.kubernetes.io/name=argocd-server` pruefen. Bei Repository-Verbindungsfehlern pruefen, ob Token Repository-Zugriff hat oder SSH-Schluessel zu Deploy-Keys hinzugefuegt wurde.

### Schritt 2: Anwendungsmanifest erstellen und erste Anwendung deployen

Argo-CD-Application-Ressource mit Sync-Richtlinien und Health-Checks definieren.

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

**Erwartet:** Anwendung automatisch aus Git synchronisiert. Ressourcen im production-Namespace erstellt. Argo-CD-UI zeigt gesunden Status. Automatisierte Sync-Richtlinien aktivieren Pruning und Self-Healing.

**Bei Fehler:** Bei Sync-Fehlern Anwendungsereignisse mit `argocd app get myapp-prod` pruefen. Bei Kustomize-Build-Fehlern lokal mit `kustomize build apps/myapp/overlays/prod` testen.

### Schritt 3: App-of-Apps-Muster fuer Multi-Umgebungs-Management implementieren

Root-Anwendung erstellen, die Kind-Anwendungen ueber Umgebungen hinweg verwaltet.

```bash
# Create app-of-apps structure
mkdir -p argocd-apps/{projects,infra,apps}

# Define projects for RBAC
cat > argocd-apps/projects/production.yaml <<EOF
apiVersion: argoproj.io/v1alpha1
# ... (see EXAMPLES.md for complete configuration)
```

**Erwartet:** Root-App verwaltet alle Kind-Anwendungen. Neue Anwendungen werden automatisch deployed, wenn sie zu Git hinzugefuegt werden. Infrastruktur-Anwendungen werden vor App-Anwendungen deployed (via Sync-Waves falls noetig).

**Bei Fehler:** Bei zirkulaeren Abhaengigkeiten Sync-Waves zur Steuerung der Reihenfolge verwenden. Bei Projekt-Berechtigungsfehlern pruefen, ob sourceRepos und Ziele mit Anwendungsanforderungen uebereinstimmen.

### Schritt 4: Image Updater fuer automatisierte Deployments konfigurieren

Argo CD Image Updater einrichten, um neue Image-Versionen automatisch zu promoten.

```bash
# Install Argo CD Image Updater
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-image-updater/stable/manifests/install.yaml

# Configure image update strategy via annotations
cat > argocd-apps/myapp-prod-autoupdate.yaml <<EOF
apiVersion: argoproj.io/v1alpha1
# ... (see EXAMPLES.md for complete configuration)
```

**Erwartet:** Image Updater ueberwacht Registry auf neue Images, die Tag-Mustern entsprechen. Semantische Versionierungsstrategie aktualisiert auf neueste stabile Version. Git-Commits werden automatisch mit neuen Image-Tags erstellt.

**Bei Fehler:** Bei Registry-Zugriffsfehlern pruefen, ob image-updater Pull-Credentials hat. Bei Write-Back-Fehlern pruefen, ob git-creds Secret Push-Berechtigungen hat.

### Schritt 5: Progressive Delivery mit Argo Rollouts implementieren

Canary- und Blue-Green-Deployments mit automatisiertem Rollback aktivieren.

```bash
# Install Argo Rollouts controller
kubectl create namespace argo-rollouts
kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml

# Install Rollouts kubectl plugin
curl -LO https://github.com/argoproj/argo-rollouts/releases/latest/download/kubectl-argo-rollouts-linux-amd64
# ... (see EXAMPLES.md for complete configuration)
```

**Erwartet:** Rollout verschiebt Traffic progressiv zum Canary. Analysen werden bei jedem Schritt durchgefuehrt. Automatische Promotion bei Erfolg, Rollback bei Fehler. Argo CD synchronisiert Rollout-Ressourcen.

**Bei Fehler:** Bei Analyse-Fehlern pruefen, ob Prometheus zugaenglich ist und die Abfrage gueltige Ergebnisse liefert. Bei Traffic-Routing-Problemen Ingress-Annotationen und Canary-Service-Endpoints pruefen.

### Schritt 6: Drift-Erkennung und Webhook-Benachrichtigungen konfigurieren

Manuelle Aenderungen ueberwachen und Alerts an Slack/E-Mail senden.

```bash
# Configure drift detection in Application
cat > argocd-apps/myapp-strict.yaml <<EOF
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp-prod
# ... (see EXAMPLES.md for complete configuration)
```

**Erwartet:** Self-Heal kehrt automatisch manuelle kubectl-Aenderungen zurueck. Benachrichtigungen werden bei Sync-Fehlern und erfolgreichen Deployments an Slack gesendet. Webhooks loesen externe Systeme aus. Drift-Alerts zeigen, was geaendert wurde und wer die Aenderungen vorgenommen hat (ueber Git-Historie).

**Bei Fehler:** Wenn Self-Heal nicht ausloest, pruefen, ob automatische Sync-Richtlinie aktiviert ist und Aktualisierungsintervall nicht zu lang ist (Standard 3m).

## Validierung

- [ ] Argo CD oder Flux installiert und ueber UI/CLI zugaenglich
- [ ] Git-Repository mit korrekter Authentifizierung verbunden
- [ ] Anwendungen synchronisieren automatisch aus Git bei Commits
- [ ] Manuelle kubectl-Aenderungen werden durch Self-Heal rueckgaengig gemacht
- [ ] App-of-Apps-Muster deployt mehrere Anwendungen
- [ ] Image Updater befördert neue Images basierend auf Tag-Mustern
- [ ] Argo Rollouts fuehren progressive Canary-Deployments durch
- [ ] Benachrichtigungen werden bei Sync-Ereignissen an Slack/E-Mail gesendet
- [ ] Drift-Erkennung gibt Alarm bei ausserplanmaessigen Aenderungen
- [ ] RBAC erzwingt projektweite Zugriffskontrollen

## Haeufige Stolperfallen

- **Automatisches Pruning deaktiviert**: Aus Git entfernte Ressourcen bleiben im Cluster. `prune: true` in der Sync-Richtlinie aktivieren.

- **Keine Sync-Waves**: Infrastruktur-Anwendungen werden nach Apps deployed, die von ihnen abhaengen. `argocd.argoproj.io/sync-wave`-Annotationen zur Steuerung der Reihenfolge verwenden.

- **HPA-verwaltete Replikas ignorieren**: Sync schlaegt fehl, weil HPA die Anzahl der Replikas geaendert hat. `/spec/replicas` zu ignoreDifferences hinzufuegen.

- **Write-Back-Konflikte**: Image-Updater-Commits kollidieren mit manuellen Commits. Separaten Branch oder feingranulares RBAC fuer Image Updater verwenden.

- **Fehlende Finalizer**: Anwendungsloeschung hinterlaesst verwaiste Ressourcen. `resources-finalizer.argocd.argoproj.io` zu Application-Metadaten hinzufuegen.

- **Keine Analyse-Templates**: Rollouts promoten automatisch ohne Validierung. AnalysisTemplates mit Metriken-Abfragen implementieren.

- **Secrets in Git**: Klartext-Secrets im Repository committed. Sealed Secrets oder External Secrets Operator verwenden.

- **Zu aggressives Self-Healing**: Self-Heal macht legitime Notfallaenderungen rueckgaengig. Annotationen verwenden, um voruebergehend zu deaktivieren, oder Genehmigungsgates implementieren.

## Verwandte Skills

- `configure-git-repository` - Git-Repository-Struktur fuer GitOps einrichten
- `manage-git-branches` - Branch-Strategien fuer Umgebungs-Promotion
- `deploy-to-kubernetes` - Kubernetes-Ressourcen verstehen, die von GitOps verwaltet werden
- `manage-kubernetes-secrets` - Sealed Secrets Integration mit Argo CD
- `build-ci-cd-pipeline` - CI baut Images, GitOps deployt sie
- `setup-container-registry` - Image-Promotion zwischen Registries
