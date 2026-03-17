---
name: setup-container-registry
description: >
  Container-Image-Registries einrichten — einschliesslich GitHub Container Registry
  (ghcr.io), Docker Hub und Harbor — mit automatisiertem Image-Scanning, Tagging-
  Strategien, Retention-Richtlinien und CI/CD-Integration fuer sichere Image-
  Verteilung. Einsatz beim Einrichten einer privaten Container-Registry, bei der
  Migration von Docker Hub zu selbst-gehosteten Registries, beim Implementieren von
  Schwachstellen-Scanning in CI/CD-Pipelines, beim Verwalten von Multi-Architektur-
  Images, beim Durchsetzen von Image-Signierung oder beim Konfigurieren automatischer
  Bereinigung und Retention-Richtlinien.
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
  complexity: basic
  language: multi
  tags: container-registry, docker-hub, ghcr, harbor, vulnerability-scanning
---

# Container-Registry einrichten

Produktionsreife Container-Registries mit Sicherheits-Scanning, Zugriffskontrolle und automatisierter CI/CD-Integration konfigurieren.

## Wann verwenden

- Private Container-Registry fuer eine Organisation einrichten
- Von Docker Hub zu selbst-gehosteten oder alternativen Registries migrieren
- Image-Schwachstellen-Scanning in CI/CD-Pipelines implementieren
- Multi-Architektur-Images (amd64, arm64) mit Manifests verwalten
- Image-Signierung und Herkunftspruefung durchsetzen
- Automatische Image-Bereinigung und Retention-Richtlinien konfigurieren

## Eingaben

- **Erforderlich**: Docker oder Podman lokal installiert
- **Erforderlich**: Registry-Credentials (Personal Access Tokens, Service-Accounts)
- **Optional**: Selbst-gehostete Infrastruktur fuer Harbor-Deployment
- **Optional**: Kubernetes-Cluster fuer Registry-Integration
- **Optional**: Cosign/Notary fuer Image-Signierung
- **Optional**: Trivy oder Clair fuer Schwachstellen-Scanning

## Vorgehensweise

> Siehe [Erweiterte Beispiele](references/EXAMPLES.md) fuer vollstaendige Konfigurationsdateien und Vorlagen.

### Schritt 1: GitHub Container Registry (ghcr.io) konfigurieren

GitHub Container Registry mit Personal Access Tokens und CI/CD-Integration einrichten.

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

**Erwartet:** GitHub-Token hat Paket-Berechtigungen. Docker-Login erfolgreich. Images werden mit korrektem Tagging zu ghcr.io gepusht. GitHub-Actions-Workflow baut Multi-Architektur-Images mit automatisiertem Tagging.

**Bei Fehler:** Bei Authentifizierungsfehlern pruefen, ob Token den `write:packages`-Scope hat und nicht abgelaufen ist. Bei Push-Fehlern pruefen, ob Repository-Name dem Image-Namen entspricht (Gross-/Kleinschreibung beachten).

### Schritt 2: Docker Hub mit automatisierten Builds konfigurieren

Docker-Hub-Repository mit Zugriffs-Tokens und Schwachstellen-Scanning einrichten.

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
```

**Erwartet:** Docker-Hub-Zugriffstoken mit Lese/Schreib-Berechtigungen erstellt. Images werden erfolgreich mit Multi-Architektur-Unterstuetzung gepusht. README synchronisiert aus GitHub.

**Bei Fehler:** Bei Rate-Limit-Fehlern auf Pro-Plan upgraden oder Pull-Through-Cache implementieren. Bei Multi-Arch-Build-Fehlern sicherstellen, dass QEMU mit `docker run --privileged --rm tonistiigi/binfmt --install all` installiert ist.

### Schritt 3: Harbor selbst-gehostete Registry deployen

Harbor mit Helm fuer Unternehmens-Registry mit RBAC und Replikation installieren.

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

# Login via Docker CLI
docker login harbor.example.com

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

# Use robot account in CI/CD
docker login harbor.example.com -u 'robot$myapp-ci' -p "$ROBOT_TOKEN"
```

**Erwartet:** Harbor in Kubernetes mit PostgreSQL und Redis deployed. Ingress mit TLS konfiguriert. Admin-UI zugaenglich. Projekte mit aktiviertem Schwachstellen-Scanning erstellt. Robot-Accounts bieten CI/CD-Authentifizierung.

**Bei Fehler:** Bei Datenbankverbindungsfehlern PostgreSQL-Pod-Logs mit `kubectl logs -n harbor harbor-database-0` pruefen. Bei Ingress-Problemen DNS auf LoadBalancer pruefen. Bei Trivy-Fehlern pruefen, ob Schwachstellen-Datenbank heruntergeladen wurde.

### Schritt 4: Image-Tagging-Strategie und Retention-Richtlinien implementieren

Semantische Versionierung, unveraenderliche Tags und automatische Bereinigung konfigurieren.

```bash
# Tagging best practices
# 1. Semantic versioning
docker tag myapp:latest harbor.example.com/myapp/app:v1.2.3
docker tag myapp:latest harbor.example.com/myapp/app:v1.2
docker tag myapp:latest harbor.example.com/myapp/app:v1
docker tag myapp:latest harbor.example.com/myapp/app:latest
# ... (see EXAMPLES.md for complete configuration)
```

**Erwartet:** Images mit semantischen Versionen, Commit-SHAs und Umgebungs-Labels getaggt. Retention-Richtlinien bereinigen automatisch alte Images basierend auf Alter, Pull-Aktivitaet oder Anzahlgrenzen.

**Bei Fehler:** Wenn Retention nicht ausloest, Cron-Schedule-Syntax und Harbor-Zeitzoneneinstellungen pruefen. Fuer versehentlich geloeschte Production-Images unveraenderliche Tags mit Harbor-Tag-Unveraenderlichkeitsregeln implementieren.

### Schritt 5: Kubernetes-Image-Pull-Secrets konfigurieren

Registry-Authentifizierung fuer Kubernetes-Cluster einrichten.

```bash
# Create Docker registry secret
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=USERNAME \
  --docker-password=$GITHUB_TOKEN \
  --docker-email=user@example.com \
# ... (see EXAMPLES.md for complete configuration)
```

**Erwartet:** Image-Pull-Secrets in Ziel-Namespaces erstellt. Pods ziehen erfolgreich Images aus privaten Registries. Service-Accounts enthalten imagePullSecrets. Keine ImagePullBackOff-Fehler.

**Bei Fehler:** Bei Authentifizierungsfehlern Credentials manuell mit `docker login` pruefen. Bei nicht gefundenem Secret pruefen, ob Namespace mit Pod-Namespace uebereinstimmt.

### Schritt 6: Schwachstellen-Scanning und Image-Signierung aktivieren

Trivy-Scanning und Cosign fuer Image-Herkunft integrieren.

```bash
# Install Trivy CLI
wget https://github.com/aquasecurity/trivy/releases/latest/download/trivy_0.47.0_Linux-64bit.tar.gz
tar zxvf trivy_0.47.0_Linux-64bit.tar.gz
sudo mv trivy /usr/local/bin/

# Scan local image
# ... (see EXAMPLES.md for complete configuration)
```

**Erwartet:** Trivy-Scans erkennen Schwachstellen mit Schweregradbewertungen. SARIF-Ergebnisse werden in den GitHub-Security-Tab hochgeladen. Kritische Schwachstellen schlagen CI/CD-Builds fehl. Cosign signiert Images mit Schluessel oder schluesselos (Fulcio).

**Bei Fehler:** Bei Trivy-Datenbank-Download-Fehlern `trivy image --download-db-only` ausfuehren. Fuer falsch-positive Ergebnisse eine `.trivyignore`-Datei mit CVE-IDs erstellen.

## Validierung

- [ ] Registry ueber Docker-CLI-Login zugaenglich
- [ ] Images werden erfolgreich gepusht und gezogen mit korrekter Authentifizierung
- [ ] Multi-Architektur-Images werden gebaut und Manifest erstellt
- [ ] Schwachstellen-Scanning laeuft automatisch beim Image-Push
- [ ] Retention-Richtlinien bereinigen alte Images nach Zeitplan
- [ ] Kubernetes-Cluster koennen Images ueber imagePullSecrets ziehen
- [ ] Image-Signaturen werden vor dem Deployment verifiziert
- [ ] Webhook-Benachrichtigungen loesen bei Image-Updates aus
- [ ] Registry-UI zeigt Scan-Ergebnisse und Artefakt-Metadaten

## Haeufige Stolperfallen

- **Oeffentliche Images standardmaessig**: GitHub Packages sind standardmaessig privat, Docker Hub oeffentlich. Sichtbarkeitseinstellungen mit Sicherheitsanforderungen abgleichen.

- **Token-Ablauf**: Personal Access Tokens laufen ab und brechen CI/CD. Nicht-ablaufende Tokens fuer die Automatisierung verwenden oder Rotation implementieren.

- **Ansammlung ungetaggter Images**: Build-Prozess erstellt ungetaggte Images, die Speicher verbrauchen. Automatische Bereinigung von ungetaggten Artefakten aktivieren.

- **Fehlende Multi-Arch-Unterstuetzung**: Builds nur fuer amd64, schlaegt auf ARM-Instanzen fehl. `docker buildx` mit `--platform`-Flag fuer plattformuebergreifende Builds verwenden.

- **Kein Rate-Limit-Schutz**: Kostenlose Docker-Hub-Accounts auf 100 Pulls/6h begrenzt. Pull-Through-Cache implementieren oder Plan upgraden.

- **Veraenderliche Tags**: `latest`-Tag ueberschrieben beeintraechtigt Reproduzierbarkeit. Unveraenderliche Tags (Commit-SHA, semantische Version) fuer Production verwenden.

- **Unsichere Registry-Kommunikation**: Selbst-gehostete Registry ohne TLS. Immer HTTPS mit gueltigen Zertifikaten verwenden.

- **Keine Zugriffskontrolle**: Einzelne Credential teamuebergreifend geteilt. RBAC mit projektspezifischen Robot-Accounts implementieren.

## Verwandte Skills

- `create-r-dockerfile` - Container-Images fuer Registry bauen
- `optimize-docker-build-cache` - Effiziente Image-Builds fuer Registry-Push
- `build-ci-cd-pipeline` - Automatisierter Registry-Push in CI/CD
- `deploy-to-kubernetes` - Images aus Registry ziehen
- `implement-gitops-workflow` - Image-Promotion zwischen Registries
