---
name: setup-local-kubernetes
description: >
  Lokale Kubernetes-Entwicklungsumgebung mit kind, k3d oder minikube fuer
  schnelle Inner-Loop-Entwicklung einrichten. Behandelt Cluster-Erstellung,
  Ingress-Konfiguration, lokale Registry-Einrichtung und Integration mit
  Entwicklungstools wie Skaffold und Tilt fuer automatische Neu-Build- und
  Redeploy-Workflows. Einsatz wenn eine lokale Kubernetes-Umgebung fuer die
  Entwicklung benoetigt wird, Manifeste oder Helm-Charts vor dem
  Produktions-Deployment getestet werden sollen, schnelle automatische
  Rebuild-und-Redeploy-Zyklen gewuenscht werden oder Kubernetes ohne
  Cloud-Kosten erlernt werden soll.
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
  tags: kind, k3d, minikube, local-development, skaffold, tilt, docker, kubernetes
---

# Lokales Kubernetes einrichten

Lokale Kubernetes-Entwicklungsumgebung fuer schnelle Iteration und Tests erstellen.

## Wann verwenden

- Lokale Kubernetes-Umgebung fuer Anwendungsentwicklung benoetigt
- Kubernetes-Manifeste und Helm-Charts vor Produktions-Deployment testen
- Schnelle Inner-Loop-Entwicklung mit automatischem Rebuild und Redeploy
- Multi-Service-Anwendungen mit Service-Abhaengigkeiten testen
- Kubernetes ohne Cloud-Kosten erlernen
- CI/CD-Pipeline lokal testen vor dem Push von Aenderungen
- Isolierte Umgebung fuer Experimente und Debugging benoetigt

## Eingaben

- **Erforderlich**: Docker Desktop oder Docker Engine installiert
- **Erforderlich**: Mindestens 4 GB RAM fuer Cluster verfuegbar
- **Erforderlich**: Auswahl des lokalen Cluster-Tools (kind, k3d oder minikube)
- **Optional**: Anwendungs-Quellcode zum Deployen
- **Optional**: Bevorzugte Kubernetes-Version
- **Optional**: Bevorzugtes Entwicklungstool (Skaffold, Tilt oder manuell)
- **Optional**: Benoetigte Anzahl von Worker-Nodes

## Vorgehensweise

> Siehe [Erweiterte Beispiele](references/EXAMPLES.md) fuer vollstaendige Konfigurationsdateien und Vorlagen.

### Schritt 1: Lokales Kubernetes-Cluster-Tool installieren

Kind, k3d oder minikube basierend auf Anforderungen auswaehlen und installieren.

**kind installieren (Kubernetes in Docker):**
```bash
# Linux example
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind

# Verify installation
kind version
```

**k3d installieren (k3s in Docker):**
```bash
# Linux/macOS
curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash

# Verify installation
k3d version
```

**minikube installieren:**
```bash
# Linux example
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Verify installation
minikube version
```

kubectl installieren, falls noch nicht vorhanden:
```bash
# Linux example
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/
kubectl version --client
```

> macOS- und Windows-Installationsbefehle unter references/EXAMPLES.md verfuegbar.

**Erwartet:** Tool-Binaerdatei installiert und im PATH. Versionsbefehl gibt erwartete Version zurueck. kubectl fuer Cluster-Interaktion verfuegbar.

**Bei Fehler:**
- Sicherstellen, dass Docker laeuft: `docker ps`
- Pruefen, ob System-PATH Installationsverzeichnis enthaelt
- Bei Berechtigungsproblemen sudo/Admin-Rechte pruefen
- Auf macOS muss Binaerdatei moeglicherweise in Sicherheitseinstellungen erlaubt werden

### Schritt 2: Lokalen Cluster mit Konfiguration erstellen

Multi-Node-Cluster mit Ingress- und lokaler Registry-Unterstuetzung erstellen.

**kind-Cluster erstellen:**
```yaml
# kind-config.yaml (abbreviated)
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
name: dev-cluster
nodes:
- role: control-plane
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
  - containerPort: 443
    hostPort: 443
- role: worker
- role: worker
```

```bash
# Create cluster
kind create cluster --config kind-config.yaml

# Install ingress-nginx
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

# Create local registry
docker run -d --restart=always -p 5000:5000 --name kind-registry registry:2
docker network connect kind kind-registry
```

> Vollstaendige kind-config.yaml mit Registry-Spiegeln und Ingress-Konfiguration unter references/EXAMPLES.md verfuegbar.

**k3d-Cluster erstellen:**
```bash
# Create cluster with ingress and registry
k3d cluster create dev-cluster \
  --port "80:80@loadbalancer" \
  --port "443:443@loadbalancer" \
  --agents 2 \
  --registry-create k3d-registry:5000
```

**minikube-Cluster erstellen:**
```bash
# Create cluster with multiple nodes
minikube start \
  --nodes=3 \
  --cpus=2 \
  --memory=4096 \
  --driver=docker \
  --addons=ingress,registry,metrics-server
```

Cluster testen:
```bash
# Deploy test application
kubectl create deployment hello --image=k8s.gcr.io/echoserver:1.4
kubectl expose deployment hello --type=NodePort --port=8080
kubectl port-forward service/hello 8080:8080

# Clean up test
kubectl delete deployment,service hello
```

**Erwartet:** Multi-Node-Cluster laeuft mit Control-Plane und Worker-Nodes. Ingress-Controller installiert und bereit. Lokale Registry auf localhost:5000 erreichbar. kubectl-Kontext auf neuen Cluster gesetzt. Test-Deployment erfolgreich.

**Bei Fehler:**
- Pruefen, ob Docker ausreichende Ressourcen hat (4 GB+ RAM empfohlen)
- Auf Port-Konflikte pruefen: `lsof -i :80,443,5000,6550`
- Fuer kind: sicherstellen, dass Docker-Desktop-Kubernetes deaktiviert ist (Konflikte)
- Fuer minikube: anderen Treiber versuchen (virtualbox, hyperv, kvm2)

### Schritt 3: Entwicklungs-Workflow-Tools konfigurieren

Skaffold oder Tilt fuer automatisierten Rebuild und Redeploy einrichten.

**Skaffold installieren:**
```bash
# Linux example
curl -Lo skaffold https://storage.googleapis.com/skaffold/releases/latest/skaffold-linux-amd64
chmod +x skaffold
sudo mv skaffold /usr/local/bin
skaffold version
```

**Skaffold-Konfiguration erstellen:**
```yaml
# skaffold.yaml (abbreviated)
apiVersion: skaffold/v4beta7
kind: Config
metadata:
  name: my-app
build:
# ... (see EXAMPLES.md for complete configuration)
```

> Vollstaendige skaffold.yaml mit Profilen, Datei-Sync und Port-Weiterleitung unter references/EXAMPLES.md verfuegbar.

**Tilt installieren:**
```bash
# Linux/macOS
curl -fsSL https://raw.githubusercontent.com/tilt-dev/tilt/master/scripts/install.sh | bash
tilt version
```

**Tiltfile erstellen:**
```python
# Tiltfile (abbreviated)
allow_k8s_contexts('kind-dev-cluster')

docker_build(
  'localhost:5000/my-app',
  '.',
  live_update=[
    sync('./src', '/app/src'),
  ]
)

k8s_yaml(['k8s/deployment.yaml', 'k8s/service.yaml'])
k8s_resource('my-app', port_forwards='8080:8080')
```

> Vollstaendiges Tiltfile mit Live-Updates, Helm-Charts und benutzerdefinierten Schaltflaechen unter references/EXAMPLES.md verfuegbar.

Beispiel-Kubernetes-Manifeste erstellen:
```yaml
# k8s/deployment.yaml (abbreviated)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 1
  template:
    spec:
      containers:
      - name: app
        image: localhost:5000/my-app
        ports:
        - containerPort: 8080
```

Entwicklungs-Workflow testen:
```bash
# Using Skaffold
skaffold dev --port-forward

# Using Tilt
tilt up

# Add entry to /etc/hosts for ingress
echo "127.0.0.1 my-app.local" | sudo tee -a /etc/hosts
curl http://my-app.local
```

**Erwartet:** Skaffold oder Tilt ueberwacht Dateilaenderungen. Code-Aenderungen loesen automatischen Rebuild und Redeploy aus. Hot-Reload funktioniert fuer unterstuetzte Sprachen. Port-Weiterleitung erlaubt lokalen Zugriff. Logs werden im Terminal/UI gestreamt. Build-Caching macht Rebuilds schnell.

**Bei Fehler:**
- Docker-Daemon erreichbar pruefen: `docker ps`
- Pruefen, ob lokale Registry erreichbar: `curl http://localhost:5000/v2/_catalog`
- Bei Datei-Sync-Problemen sicherstellen, dass Pfade in der Konfiguration mit tatsaechlicher Struktur uebereinstimmen

### Schritt 4: Lokalen Speicher und Datenbanken einrichten

Persistenten Speicher konfigurieren und Datenbankdienste fuer Tests deployen.

**Lokale Storage-Class erstellen:**
```yaml
# local-storage.yaml (abbreviated)
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: local-path
provisioner: rancher.io/local-path
# ... (see EXAMPLES.md for complete configuration)
```

**PostgreSQL fuer Entwicklung deployen:**
```yaml
# postgres-dev.yaml (abbreviated)
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres
  template:
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        envFrom:
        - secretRef:
            name: postgres-secret
```

**Redis fuer Caching deployen:**
```bash
# Using Helm
helm install redis bitnami/redis \
  --set auth.enabled=false \
  --set replica.replicaCount=0
```

Datenbankverbindung testen:
```bash
# Apply manifests
kubectl apply -f local-storage.yaml
kubectl apply -f postgres-dev.yaml

# Wait for PostgreSQL
kubectl wait --for=condition=ready pod -l app=postgres --timeout=60s

# Test connection
kubectl exec -it postgres-0 -- psql -U devuser -d devdb -c "SELECT version();"
```

**Erwartet:** Storage-Class fuer dynamische Bereitstellung konfiguriert. Datenbank-Pods laufen und bereit. Services per Port-Weiterleitung oder von anderen Pods erreichbar. Daten bleiben ueber Pod-Neustarts hinweg erhalten.

**Bei Fehler:**
- Pruefen, ob Storage-Provisioner installiert: `kubectl get storageclass`
- PVC an PV gebunden pruefen: `kubectl get pvc,pv`
- Pod-Ereignisse auf Mount-Fehler pruefen: `kubectl describe pod postgres-0`

### Schritt 5: Observability fuer lokale Entwicklung konfigurieren

Minimales Monitoring und Logging fuer Debugging hinzufuegen.

**Leichtgewichtigen Monitoring-Stack deployen:**
```bash
# Install metrics-server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# For local clusters, disable TLS verification
kubectl patch deployment metrics-server -n kube-system --type='json' -p='[
  {"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}
]'

# Verify metrics
kubectl top nodes
kubectl top pods -A
```

**Lokales Logging einrichten:**
```bash
# Install stern (multi-pod log tailing)
curl -Lo stern https://github.com/stern/stern/releases/download/v1.26.0/stern_1.26.0_linux_amd64.tar.gz
tar -xzf stern_1.26.0_linux_amd64.tar.gz
sudo mv stern /usr/local/bin/

# Usage
stern my-app --since 1m
```

**Erwartet:** Metrics-Server liefert Ressourcennutzungsdaten. kubectl-top-Befehle funktionieren. k9s oder Dashboard zeigt Cluster-Status. Logs ueber stern oder kubectl logs erreichbar. Geringer Overhead, fuer Entwicklung geeignet.

**Bei Fehler:**
- Bei Metrics-Server-TLS-Fehlern unsicheres TLS-Flag-Patch anwenden
- Pruefen, ob Metrics-Server-Pod laeuft: `kubectl get pods -n kube-system -l k8s-app=metrics-server`

### Schritt 6: Workflow dokumentieren und Hilfsprogramme erstellen

Skripte und Dokumentation fuer Team-Onboarding erstellen.

**Setup-Skript erstellen:**
```bash
#!/bin/bash
# setup-local-cluster.sh (abbreviated)
set -e

echo "=== Local Kubernetes Cluster Setup ==="

# ... (see EXAMPLES.md for complete configuration)
```

**Teardown-Skript erstellen:**
```bash
#!/bin/bash
# teardown-local-cluster.sh (abbreviated)
echo "=== Tearing Down Local Cluster ==="

if kind get clusters 2>/dev/null | grep -q dev-cluster; then
  kind delete cluster --name dev-cluster
  docker stop kind-registry && docker rm kind-registry
fi

docker system prune -f
```

**Erwartet:** Setup-Skript erstellt Cluster mit einem Befehl. Teardown-Skript bereinigt alles. README liefert klare Anweisungen fuer gaengige Aufgaben. Team-Mitglieder koennen schnell produktiv werden.

**Bei Fehler:**
- Skripte manuell testen, bevor sie verteilt werden
- Fehlerbehandlung fuer jeden Schritt hinzufuegen
- Fehlerbehebungsabschnitt in README bereitstellen
- Video-Walkthrough fuer komplexe Setups erstellen

## Validierung

- [ ] Lokaler Cluster mit mehreren Nodes erstellt
- [ ] Ingress-Controller installiert und reagiert
- [ ] Lokale Registry erreichbar und akzeptiert Pushes
- [ ] Beispielanwendung wird erfolgreich deployed
- [ ] Datei-Sync funktioniert (Aenderungen werden ohne vollstaendigen Rebuild uebernommen)
- [ ] Port-Weiterleitung erlaubt lokalen Zugriff auf Services
- [ ] Datenbankservices laufen und sind erreichbar
- [ ] Metrics-Server liefert Ressourcennutzung
- [ ] Logs ueber kubectl/stern/Tilt erreichbar
- [ ] Setup-/Teardown-Skripte funktionieren zuverlaessig
- [ ] Dokumentation klar und aktuell
- [ ] Team-Mitglieder koennen in <30 Minuten onboarden

## Haeufige Stolperfallen

- **Ungenuegend Ressourcen**: Lokale Cluster benoetigen 4 GB+ RAM, 2+ CPU-Kerne. Docker-Desktop-Einstellungen pruefen. Replikas und Ressourcenanforderungen fuer Entwicklung reduzieren.

- **Port-Konflikte**: Ports 80, 443, 5000 haeufig verwendet. Mit `lsof -i :<port>` vor Cluster-Erstellung pruefen. Port-Mappings bei Bedarf anpassen.

- **Langsame Rebuilds**: Ohne geeignetes Caching sind Docker-Rebuilds langsam. Multi-Stage-Builds, .dockerignore und BuildKit verwenden. Skaffold/Tilt-Caching aktivieren.

- **Kontext-Verwirrung**: Mehrere kubectl-Kontexte verursachen Verwirrung. `kubectl config current-context` und `kubectx`-Tool zum klaren Wechseln verwenden.

- **Datei-Sync funktioniert nicht**: Pfad-Unueinstimmungen zwischen Host und Container unterbrechen Sync. Pfade in skaffold.yaml/Tiltfile mit Dockerfile-WORKDIR abgleichen.

- **Ingress loest nicht auf**: Eintrag in /etc/hosts vergessen. Oder Ingress-Controller noch nicht bereit. Auf Controller-Pods warten, bevor getestet wird.

- **Datenbankdatenverlust**: Standard-Speicher ist ephemer. PersistentVolumes fuer Daten verwenden, die Neustarts ueberleben sollen.

- **Ressourcenlimits zu hoch**: Produktions-Ressourcenspezifikationen nicht lokal kopieren. Limits fuer lokale Entwicklung erheblich reduzieren.

- **Netzwerkisolierung**: Lokaler Cluster kann nicht immer Host-Services erreichen. `host.docker.internal` (Docker Desktop) oder ngrok fuer Reverse-Proxying verwenden.

- **Versions-Unterschied**: Lokale Cluster-Version weicht von Produktion ab. Kubernetes-Version bei der Erstellung explizit setzen, um Produktion zu entsprechen.

## Verwandte Skills

- `deploy-to-kubernetes` - Anwendungs-Deployment-Muster werden zuerst lokal getestet
- `write-helm-chart` - Helm-Charts werden im lokalen Cluster getestet
- `setup-prometheus-monitoring` - Monitoring-Setup lokal getestet
- `configure-ingress-networking` - Ingress-Konfiguration lokal validiert
- `implement-gitops-workflow` - GitOps wird mit lokalem Cluster getestet
- `optimize-cloud-costs` - Kostenoptimierungsstrategien lokal entwickelt
