---
name: write-helm-chart
description: >
  Produktionsreife Helm-Charts fuer Kubernetes-Anwendungsbereitstellung mit
  Templating, Values-Verwaltung, Chart-Abhaengigkeiten, Hooks und Tests
  erstellen. Umfasst Chart-Struktur, Go-Template-Syntax, values.yaml-Design,
  Chart-Repositories, Versionierung und Best Practices fuer wartbare und
  wiederverwendbare Charts. Verwenden beim Paketieren einer
  Kubernetes-Anwendung fuer wiederholbare Bereitstellungen, Parametrisieren
  von Manifesten fuer mehrere Umgebungen, Verwalten komplexer
  Mehrkomponenten-Anwendungen mit Abhaengigkeiten oder Standardisieren von
  Bereitstellungspraktiken mit versionierter Rollback-Faehigkeit ueber Teams.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: devops
  complexity: intermediate
  language: multi
  tags: helm, chart, go-templates, kubernetes, packaging, deployment, templating
  locale: de
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# Helm-Chart schreiben

Produktionsreife Helm-Charts fuer die Bereitstellung von Anwendungen auf Kubernetes erstellen.

## Wann verwenden

- Kubernetes-Anwendung fuer wiederholbare Bereitstellungen paketieren
- Manifeste fuer verschiedene Umgebungen parametrisieren (dev/staging/prod)
- Komplexe Mehrkomponenten-Anwendungen mit Abhaengigkeiten verwalten
- Wiederverwendbare Bereitstellungsmuster ueber Teams oder Organisationen teilen
- Versionierte Anwendungsreleases mit Rollback-Faehigkeit implementieren
- Template-basiertes Konfigurationsmanagement fuer Kubernetes-Ressourcen benoetigt
- Bereitstellungspraktiken ueber Projekte hinweg standardisieren

## Eingaben

- **Erforderlich**: Kubernetes-Manifeste fuer die Anwendung (Deployment, Service, etc.)
- **Erforderlich**: Anwendungsname und Version
- **Erforderlich**: Liste konfigurierbarer Parameter (Image-Tag, Replikas, Ressourcen, etc.)
- **Optional**: Abhaengigkeiten von anderen Helm-Charts (Datenbanken, Message-Queues)
- **Optional**: Pre/Post-Install-Hooks fuer Migrationen oder Setup
- **Optional**: Chart-Repository-URL zur Veroeffentlichung
- **Optional**: Values fuer verschiedene Umgebungen

## Vorgehensweise

> Siehe [Erweiterte Beispiele](references/EXAMPLES.md) fuer vollstaendige Template-Dateien, Values-Strukturen und Hooks.

### Schritt 1: Chart-Struktur und Metadaten initialisieren

Die Helm-Chart-Verzeichnisstruktur erstellen und Chart-Metadaten definieren.

**Helm installieren:**
```bash
# Linux
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# macOS
brew install helm

# Windows (Chocolatey)
choco install kubernetes-helm

# Verify installation
helm version
```

**Chart-Struktur erstellen:**
```bash
# Create new chart
helm create my-app

# Chart structure created:
# my-app/
#   Chart.yaml          # Chart metadata
#   values.yaml         # Default configuration values
#   charts/             # Chart dependencies
#   templates/          # Template files
#     deployment.yaml
#     service.yaml
#     ingress.yaml
#     _helpers.tpl      # Template helpers
#     NOTES.txt         # Post-install notes
#   .helmignore         # Files to ignore

# Or create from scratch
mkdir -p my-app/{templates,charts}
cd my-app
```

**Chart.yaml definieren:**
```yaml
# Chart.yaml (excerpt - see EXAMPLES.md for complete file)
apiVersion: v2
name: my-app
description: A Helm chart for deploying my-app to Kubernetes
version: 0.1.0
appVersion: "1.0.0"
maintainers:
- name: Platform Team
  email: platform@example.com
# ... (keywords, dependencies, kubeVersion - see EXAMPLES.md)
```

**.helmignore erstellen:**
```
# .helmignore
# Patterns to ignore when packaging chart
.git/
.gitignore
.bzr/
.bzrignore
.hg/
.hgignore
.svn/
*.swp
*.bak
*.tmp
*.orig
*~
.DS_Store
.project
.idea/
*.tmproj
.vscode/
```

**Erwartet:** Chart-Verzeichnisstruktur mit allen erforderlichen Dateien erstellt. Chart.yaml enthaelt vollstaendige Metadaten. Abhaengigkeiten aufgelistet, falls zutreffend. Chart validiert: `helm lint my-app`.

**Bei Fehler:**
- YAML-Syntax in Chart.yaml pruefen: `helm lint my-app`
- Verifizieren, dass apiVersion v2 ist (v1 veraltet)
- Sicherstellen, dass Version SemVer folgt (x.y.z)
- Pruefen, ob Abhaengigkeits-Repository-URLs erreichbar sind
- `helm show chart <chart>` verwenden, um bestehende Charts als Beispiele zu inspizieren

### Schritt 2: values.yaml-Struktur entwerfen

Gut organisierte values.yaml mit sinnvollen Standardwerten und Dokumentation erstellen.

**Umfassende values.yaml erstellen:**
```yaml
# values.yaml (excerpt - see EXAMPLES.md for complete structure)
global:
  imageRegistry: ""
image:
  registry: docker.io
  repository: mycompany/my-app
  tag: ""
replicaCount: 3
service:
  type: ClusterIP
  port: 80
resources:
  limits: {cpu: 1000m, memory: 512Mi}
  requests: {cpu: 100m, memory: 128Mi}
# ... (ingress, autoscaling, probes, persistence - see EXAMPLES.md)
```

Siehe [EXAMPLES.md](references/EXAMPLES.md#step-2-valuesyaml--complete-structure) fuer die vollstaendige values.yaml-Struktur und values.schema.json

**Erwartet:** values.yaml logisch mit Abschnitten organisiert. Alle Werte mit Kommentaren dokumentiert. Sinnvolle Standardwerte, die sofort funktionieren. Schema validiert Werttypen. Keine hartcodierten umgebungsspezifischen Werte.

**Bei Fehler:**
- YAML-Syntax validieren: `yamllint values.yaml`
- Schema-Validierung pruefen: `helm lint my-app`
- Gegen Helm Best Practices ueberpruefen: `helm lint --strict my-app`
- Sicherstellen, dass alle Template-Referenzen entsprechende Values haben
- Mit minimalen Values testen: `helm template my-app --set image.repository=test`

### Schritt 3: Template-Dateien mit Go-Templating erstellen

Kubernetes-Ressourcen-Templates unter Verwendung von Go-Template-Syntax und Helm-Funktionen schreiben.

**Deployment-Template erstellen:**
```yaml
# templates/deployment.yaml (excerpt)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "my-app.fullname" . }}
  labels:
    {{- include "my-app.labels" . | nindent 4 }}
spec:
  replicas: {{ .Values.replicaCount }}
  template:
    spec:
      containers:
      - name: {{ .Chart.Name }}
        image: "{{ .Values.image.registry }}/{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
        # ... (see EXAMPLES.md for complete template with probes, volumes, etc.)
```

Siehe [EXAMPLES.md](references/EXAMPLES.md#step-3-deploymentyaml--complete-template) fuer das vollstaendige Deployment-Template

**Helper-Template-Datei erstellen:**
```yaml
# templates/_helpers.tpl (excerpt)
{{- define "my-app.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "my-app.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
# ... (labels, serviceAccountName, hpa.apiVersion - see EXAMPLES.md)
```

**Bedingte Templates erstellen:**
```yaml
# templates/ingress.yaml (excerpt)
{{- if .Values.ingress.enabled -}}
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{ include "my-app.fullname" . }}
# ... (see EXAMPLES.md for complete ingress and HPA templates)
```

Siehe [EXAMPLES.md](references/EXAMPLES.md#step-3-helperstpl--complete-helper-functions) fuer vollstaendige _helpers.tpl und bedingte Templates

**Erwartet:** Templates generieren gueltige Kubernetes-YAML. Bedingungen funktionieren korrekt (if/with). Helper-Funktionen erzeugen erwartete Ausgabe. Ressourcen ordnungsgemaess beschriftet und benannt. Keine hartcodierten Werte in Templates.

**Bei Fehler:**
- Template-Rendering testen: `helm template my-app`
- Auf Template-Syntaxfehler pruefen: `helm lint my-app`
- Go-Template-Syntax sorgfaeltig validieren (Bindestriche, Leerzeichen sind relevant)
- `helm template --debug` fuer detaillierte Fehlermeldungen verwenden
- Mit verschiedenen Values-Dateien testen: `helm template my-app -f values-prod.yaml`
- Verifizieren, dass Ausgabe gueltiges Kubernetes-YAML ist: `helm template my-app | kubectl apply --dry-run=client -f -`

### Schritt 4: Hooks fuer Pre/Post-Install-Aktionen hinzufuegen

Hooks fuer Datenbankmigrationen, Setup-Aufgaben oder Bereinigung erstellen.

**Pre-Install-Hook fuer Migrationen erstellen:**
```yaml
# templates/hooks/pre-install-migration.yaml (excerpt)
apiVersion: batch/v1
kind: Job
metadata:
  name: {{ include "my-app.fullname" . }}-migration
  annotations:
    "helm.sh/hook": pre-install,pre-upgrade
    "helm.sh/hook-weight": "-5"
spec:
  template:
    spec:
      containers:
      - name: migration
        image: "{{ .Values.image.registry }}/{{ .Values.image.repository }}:{{ .Values.image.tag }}"
        command: ["/app/migrate"]
# ... (see EXAMPLES.md for test hook, pre-delete backup, NOTES.txt)
```

Siehe [EXAMPLES.md](references/EXAMPLES.md#step-4-helm-hooks) fuer vollstaendige Hook-Templates und NOTES.txt

**Erwartet:** Hooks werden in korrekter Reihenfolge ausgefuehrt (Gewichte bestimmen Sequenz). Pre-Install-Migration wird vor Deployment abgeschlossen. Test-Hook validiert Deployment. Pre-Delete-Hook fuehrt Bereinigung durch. NOTES.txt liefert hilfreiche Post-Install-Informationen.

**Bei Fehler:**
- Hook-Annotations-Syntax auf exakte Uebereinstimmung mit Helm-Spezifikation pruefen
- Verifizieren, dass Hook-Jobs `restartPolicy: Never` haben
- Hook-Ausfuehrung ueberpruefen: `kubectl get jobs -n <namespace>`
- Hook-Logs pruefen: `kubectl logs job/<job-name> -n <namespace>`
- Sicherstellen, dass hook-delete-policy angemessen ist (before-hook-creation, hook-succeeded, hook-failed)
- Hooks unabhaengig testen: `helm install --dry-run --debug my-app`

### Schritt 5: Chart testen und paketieren

Chart validieren, Tests ausfuehren und fuer Verteilung paketieren.

**Chart linten und validieren:**
```bash
# Basic linting
helm lint my-app

# Strict linting
helm lint --strict my-app

# Test template rendering
helm template my-app

# Test with custom values
helm template my-app -f values-prod.yaml

# Validate against Kubernetes cluster (dry-run)
helm install my-app my-app --dry-run --debug

# Check for deprecated API versions
helm install my-app my-app --dry-run | kubectl apply --dry-run=server -f -
```

**Chart-Tests erstellen:**
```bash
# Run Helm tests
helm install my-app my-app -n test --create-namespace
helm test my-app -n test
kubectl logs -n test -l "helm.sh/hook=test" --tail=-1

# See EXAMPLES.md for complete test script (test-chart.sh)
```

**Chart paketieren:**
```bash
# Update dependencies first
helm dependency update my-app

# Package chart
helm package my-app

# Creates: my-app-0.1.0.tgz

# Verify package
helm verify my-app-0.1.0.tgz

# Generate index for repository
helm repo index . --url https://charts.example.com/

# Creates: index.yaml
```

**Verschiedene Values-Dateien fuer Umgebungen erstellen:**
```yaml
# values-dev.yaml (excerpt)
replicaCount: 1
resources:
  limits: {cpu: 500m, memory: 256Mi}
ingress:
  hosts: [my-app-dev.example.com]

# values-prod.yaml (excerpt)
replicaCount: 5
autoscaling: {enabled: true, minReplicas: 3, maxReplicas: 10}
# ... (see EXAMPLES.md for complete env-specific values)
  tls:
  - secretName: my-app-tls
    hosts:
    - my-app.example.com
podDisruptionBudget:
  enabled: true
  minAvailable: 2
postgresql:
  enabled: true
  primary:
    persistence:
      size: 50Gi
    resources:
      limits:
        cpu: 4000m
        memory: 8Gi
```

**Mit verschiedenen Umgebungen testen:**
```bash
# Test development values
helm install my-app-dev my-app -f values-dev.yaml --dry-run --debug

# Test production values
helm install my-app-prod my-app -f values-prod.yaml --dry-run --debug

# Install to dev namespace
helm install my-app my-app -f values-dev.yaml -n development --create-namespace

# Install to prod namespace
helm install my-app my-app -f values-prod.yaml -n production --create-namespace
```

**Erwartet:** Chart besteht alle Lint-Pruefungen. Template-Rendering erzeugt gueltiges Kubernetes-YAML. Tests bestehen erfolgreich. Chart wird fehlerfrei paketiert. Verschiedene Values-Dateien funktionieren fuer jede Umgebung. Installation gelingt ohne Warnungen.

**Bei Fehler:**
- Lint-Ausgabe auf spezifische Probleme ueberpruefen
- Template-Syntaxfehler mit `--debug`-Flag pruefen
- Verifizieren, dass alle erforderlichen Values gesetzt sind: `helm get values <release>`
- Abhaengigkeitsaufloesung testen: `helm dependency list my-app`
- Paketiertes Chart validieren: `tar -tzf my-app-0.1.0.tgz`
- Auf fehlende Dateien im Paket pruefen


### Schritt 6: In Chart-Repository veroeffentlichen

Chart-Repository einrichten und versionierte Releases veroeffentlichen.

**Optionen zur Veroeffentlichung:**
```bash
# GitHub Pages
git checkout -b gh-pages && mkdir charts
cp my-app-0.1.0.tgz charts/
helm repo index charts/ --url https://username.github.io/repo/charts

# OCI registry (Helm 3.8+)
helm registry login registry.example.com -u $USER -p $PASS
helm push my-app-0.1.0.tgz oci://registry.example.com/charts

# Install from repo
helm repo add myrepo https://charts.example.com
helm install my-app myrepo/my-app -f custom-values.yaml
```

Siehe [Erweiterte Beispiele](references/EXAMPLES.md) fuer ChartMuseum-Setup, Release-Automatisierung und vollstaendige README-Vorlage.

**Erwartet:** Chart erfolgreich im Repository veroeffentlicht. Chart ueber `helm search` auffindbar. Installation aus dem Repository funktioniert. Versionierung folgt SemVer.

**Bei Fehler:**
- Verifizieren, dass Repository-URL erreichbar ist
- Pruefen, ob index.yaml generiert wurde: `helm repo index --help`
- Fuer OCI-Registries sicherstellen, dass Authentifizierung funktioniert
- Repository-Hinzufuegung testen: `helm repo add test <url>`
