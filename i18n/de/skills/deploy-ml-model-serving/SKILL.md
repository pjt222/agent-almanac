---
name: deploy-ml-model-serving
description: >
  Machine-Learning-Modelle auf Produktions-Serving-Infrastruktur mit MLflow,
  BentoML oder Seldon Core mit REST/gRPC-Endpunkten bereitstellen, Autoscaling,
  Monitoring und A/B-Test-Faehigkeiten fuer leistungsstarke Modellinferenz im
  grossen Massstab implementieren. Verwenden beim Bereitstellen trainierter
  Modelle fuer Echtzeit-Inferenz, beim Einrichten von REST- oder gRPC-
  Vorhersage-APIs, beim Implementieren von Autoscaling fuer variable Last,
  beim Durchfuehren von A/B-Tests zwischen Modellversionen oder beim
  Migrieren von Batch- zu Echtzeit-Inferenz.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mlops
  complexity: advanced
  language: multi
  tags: model-serving, bentoml, seldon, rest-api, grpc
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# ML-Modell-Serving bereitstellen


> Siehe [Erweiterte Beispiele](references/EXAMPLES.md) fuer vollstaendige Konfigurationsdateien und Vorlagen.

Machine-Learning-Modelle mit skalierbarer Serving-Infrastruktur, Monitoring und A/B-Tests in Produktion bereitstellen.

## Wann verwenden

- Trainierte Modelle fuer Echtzeit-Inferenz in Produktion bereitstellen
- REST- oder gRPC-APIs fuer Modellvorhersagen einrichten
- Autoscaling fuer variable Lastmuster implementieren
- A/B-Tests zwischen Modellversionen durchfuehren
- Von Batch- zu Echtzeit-Inferenz migrieren
- Vorhersagedienste mit niedriger Latenz erstellen
- Mehrere Modellversionen in Produktion verwalten

## Eingaben

- **Erforderlich**: Registriertes Modell in MLflow Model Registry oder trainiertes Modellartefakt
- **Erforderlich**: Kubernetes-Cluster oder Container-Orchestrierungsplattform
- **Erforderlich**: Serving-Framework-Wahl (MLflow, BentoML, Seldon Core, TorchServe)
- **Optional**: GPU-Ressourcen fuer Deep-Learning-Modelle
- **Optional**: Monitoring-Infrastruktur (Prometheus, Grafana)
- **Optional**: Load Balancer und Ingress Controller

## Vorgehensweise

### Schritt 1: Mit MLflow Models Serving bereitstellen

MLflows eingebautes Serving fuer schnelle Bereitstellung von scikit-learn-, PyTorch- und TensorFlow-Modellen verwenden.

```bash
# Serve model locally for testing
mlflow models serve \
  --model-uri models:/customer-churn-classifier/Production \
  --port 5001 \
  --host 0.0.0.0

# Test endpoint
curl -X POST http://localhost:5001/invocations \
  -H 'Content-Type: application/json' \
  -d '{
    "dataframe_records": [
      {"feature1": 1.0, "feature2": 2.0, "feature3": 3.0}
    ]
  }'
```

Docker-Bereitstellung:

```dockerfile
# Dockerfile.mlflow-serving
FROM python:3.9-slim

# Install MLflow and dependencies
RUN pip install mlflow boto3 scikit-learn

# Set environment variables
ENV MLFLOW_TRACKING_URI=http://mlflow-server:5000
# ... (see EXAMPLES.md for complete implementation)
```

Docker Compose fuer lokales Testen:

```yaml
# docker-compose.mlflow-serving.yml
version: '3.8'

services:
  model-server:
    build:
      context: .
      dockerfile: Dockerfile.mlflow-serving
# ... (see EXAMPLES.md for complete implementation)
```

Die Bereitstellung testen:

```python
# test_mlflow_serving.py
import requests
import json

def test_prediction():
    url = "http://localhost:8080/invocations"

    # Prepare input data
# ... (see EXAMPLES.md for complete implementation)
```

**Erwartet:** Modellserver startet erfolgreich, antwortet auf HTTP-POST-Anfragen, gibt Vorhersagen im JSON-Format zurueck, Docker-Container laeuft ohne Fehler.

**Bei Fehler:** Modell-URI auf Gueltigkeit pruefen (`mlflow models list`), Erreichbarkeit des MLflow-Tracking-Servers verifizieren, sicherstellen, dass alle Modellabhaengigkeiten im Container installiert sind, Portverfuegbarkeit pruefen (`netstat -tulpn | grep 8080`), Modell-Flavor-Kompatibilitaet verifizieren, Container-Logs inspizieren (`docker logs <container-id>`).

### Schritt 2: Mit BentoML fuer Produktionsmassstab bereitstellen

BentoML fuer fortgeschrittenes Serving mit besserer Leistung und Funktionen verwenden.

```python
# bentoml_service.py
import bentoml
from bentoml.io import JSON, NumpyNdarray
import numpy as np
import pandas as pd

# Load model from MLflow
import mlflow
# ... (see EXAMPLES.md for complete implementation)
```

Erstellen und containerisieren:

```bash
# Build Bento
bentoml build

# Containerize
bentoml containerize customer_churn_classifier:latest \
  --image-tag customer-churn:v1.0

# Run container
docker run -p 3000:3000 customer-churn:v1.0
```

BentoML-Konfiguration:

```yaml
# bentofile.yaml
service: "bentoml_service:ChurnPredictionService"
include:
  - "bentoml_service.py"
  - "preprocessing.py"
python:
  packages:
    - scikit-learn==1.0.2
    - pandas==1.4.0
    - numpy==1.22.0
    - mlflow==2.0.1
docker:
  distro: debian
  python_version: "3.9"
  cuda_version: null  # Set to "11.6" for GPU support
```

Kubernetes-Bereitstellung:

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: churn-prediction
  labels:
    app: churn-prediction
spec:
# ... (see EXAMPLES.md for complete implementation)
```

Auf Kubernetes bereitstellen:

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/deployment.yaml

# Check deployment status
kubectl get deployments
kubectl get pods
kubectl get services

# Test endpoint
EXTERNAL_IP=$(kubectl get svc churn-prediction-service -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
curl -X POST http://$EXTERNAL_IP/predict \
  -H 'Content-Type: application/json' \
  -d '{"instances": [{"tenure": 12, "monthly_charges": 70.35}]}'
```

**Erwartet:** BentoML-Dienst wird erfolgreich gebaut, Container laeuft und liefert Vorhersagen, Kubernetes-Bereitstellung erstellt 3 Replikate, Load Balancer stellt externen Endpunkt bereit, Health Checks bestehen.

**Bei Fehler:** BentoML-Installation verifizieren (`bentoml --version`), pruefen ob Modell im BentoML-Store existiert (`bentoml models list`), sicherstellen dass Docker-Daemon laeuft, Kubernetes-Cluster-Zugang verifizieren (`kubectl cluster-info`), Ressourcenlimits auf Ueberschreitung pruefen, Pod-Logs inspizieren (`kubectl logs <pod-name>`), Dienstselektor mit Pod-Labels abgleichen.

### Schritt 3: Seldon Core fuer erweiterte Funktionen implementieren

Seldon Core fuer Multi-Modell-Serving, A/B-Tests und Erklaerbarkeit verwenden.

```python
# seldon_wrapper.py
import logging
from typing import Dict, List, Union
import numpy as np
import mlflow

logger = logging.getLogger(__name__)

# ... (see EXAMPLES.md for complete implementation)
```

Seldon-Bereitstellungskonfiguration:

```yaml
# seldon-deployment.yaml
apiVersion: machinelearning.seldon.io/v1
kind: SeldonDeployment
metadata:
  name: churn-classifier
  namespace: seldon
spec:
  name: churn-classifier
# ... (see EXAMPLES.md for complete implementation)
```

A/B-Test-Konfiguration:

```yaml
# seldon-ab-test.yaml
apiVersion: machinelearning.seldon.io/v1
kind: SeldonDeployment
metadata:
  name: churn-classifier-ab
spec:
  name: churn-classifier-ab
  predictors:
# ... (see EXAMPLES.md for complete implementation)
```

Auf Kubernetes bereitstellen:

```bash
# Install Seldon Core operator
kubectl create namespace seldon-system
helm install seldon-core seldon-core-operator \
  --repo https://storage.googleapis.com/seldon-charts \
  --namespace seldon-system \
  --set usageMetrics.enabled=true

# Create namespace for models
# ... (see EXAMPLES.md for complete implementation)
```

**Erwartet:** Seldon-Core-Operator erfolgreich installiert, Modellbereitstellung erstellt Pods, REST-Endpunkt antwortet auf Vorhersagen, A/B-Test teilt Traffic korrekt, Seldon Analytics zeichnet Metriken auf.

**Bei Fehler:** Pruefen ob Seldon-Core-Operator laeuft (`kubectl get pods -n seldon-system`), SeldonDeployment-Status pruefen (`kubectl describe seldondeployment`), sicherstellen dass Image-Registry vom Cluster erreichbar ist, Modell-URI-Aufloesung verifizieren, RBAC-Berechtigungen fuer Seldon-Operator pruefen, Modell-Container-Logs inspizieren.

### Schritt 4: Monitoring und Observability implementieren

Umfassendes Monitoring fuer die Modell-Serving-Infrastruktur hinzufuegen.

```python
# monitoring.py
from prometheus_client import Counter, Histogram, Gauge, start_http_server
import time
import logging

logger = logging.getLogger(__name__)

# Prometheus metrics
# ... (see EXAMPLES.md for complete implementation)
```

Prometheus-Konfiguration:

```yaml
# prometheus-config.yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'model-serving'
    kubernetes_sd_configs:
# ... (see EXAMPLES.md for complete implementation)
```

Grafana-Dashboard-JSON:

```json
{
  "dashboard": {
    "title": "ML Model Serving Metrics",
    "panels": [
      {
        "title": "Predictions Per Second",
        "targets": [
          {
# ... (see EXAMPLES.md for complete implementation)
```

**Erwartet:** Prometheus sammelt Metriken erfolgreich, Grafana-Dashboards zeigen Vorhersagedurchsatz, Latenz-Perzentile, Fehlerraten und aktive Anfragen in Echtzeit an.

**Bei Fehler:** Prometheus-Scrape-Targets auf UP pruefen (`http://prometheus:9090/targets`), Erreichbarkeit des Metriken-Endpunkts pruefen (`curl http://model-pod:8000/metrics`), Kubernetes Service Discovery sicherstellen, Grafana-Datenquellenverbindung verifizieren, Firewall-Regeln fuer Metriken-Port pruefen.

### Schritt 5: Autoscaling implementieren

Horizontales Pod-Autoscaling basierend auf Anfragelast konfigurieren.

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: churn-prediction-hpa
  namespace: seldon
spec:
  scaleTargetRef:
# ... (see EXAMPLES.md for complete implementation)
```

Autoscaling anwenden:

```bash
# Enable metrics server (if not already installed)
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Apply HPA
kubectl apply -f hpa.yaml

# Check HPA status
kubectl get hpa -n seldon
kubectl describe hpa churn-prediction-hpa -n seldon

# Load test to trigger scaling
kubectl run -it --rm load-generator --image=busybox --restart=Never -- /bin/sh -c "while sleep 0.01; do wget -q -O- http://churn-prediction-service/predict; done"

# Watch scaling
kubectl get hpa -n seldon --watch
```

**Erwartet:** HPA ueberwacht CPU-/Speicher-/benutzerdefinierte Metriken, skaliert Replikate unter Last hoch, skaliert nach Stabilisierungsperiode herunter, Min-/Max-Replikatgrenzen werden eingehalten.

**Bei Fehler:** Metrics-Server auf Betrieb pruefen (`kubectl get deployment metrics-server -n kube-system`), sicherstellen dass Pod-Ressourcenanfragen definiert sind (HPA erfordert Requests), benutzerdefinierte Metriken auf Verfuegbarkeit pruefen falls verwendet, RBAC-Berechtigungen fuer HPA-Controller verifizieren, Stabilisierungsfenster auf zu restriktive Werte pruefen.

### Schritt 6: Canary-Deployment-Strategie implementieren

Neue Modellversionen mit Traffic-Shifting schrittweise ausrollen.

```yaml
# canary-deployment.yaml
apiVersion: machinelearning.seldon.io/v1
kind: SeldonDeployment
metadata:
  name: churn-classifier-canary
spec:
  name: churn-classifier-canary
  predictors:
# ... (see EXAMPLES.md for complete implementation)
```

Schrittweises Rollout-Skript:

```python
# canary_rollout.py
import time
import subprocess
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ... (see EXAMPLES.md for complete implementation)
```

**Erwartet:** Canary-Deployment startet mit 0% Traffic, schrittweise Traffic-Umleitung erfolgt automatisch, Health Checks bestehen auf jeder Stufe, Rollback wird bei Metrikverschlechterung ausgeloest, vollstaendiges Rollout nach Bestehen aller Stufen.

**Bei Fehler:** Pruefen ob Seldon-Deployment mehrere Predictors hat, Traffic-Prozentsaetze auf Summe 100 pruefen, sicherstellen dass Canary-Image existiert und abrufbar ist, Prometheus-Metriken fuer Health Checks auf Verfuegbarkeit verifizieren, Rollback-Logik auf korrekte Ausfuehrung pruefen, Pod-Logs fuer beide Versionen inspizieren.

## Validierung

- [ ] Modellserver antwortet auf Vorhersageanfragen
- [ ] REST/gRPC-Endpunkte funktionsfaehig und dokumentiert
- [ ] Docker-Container werden erfolgreich gebaut und ausgefuehrt
- [ ] Kubernetes-Bereitstellung erstellt erwartete Replikate
- [ ] Load Balancer stellt externen Endpunkt bereit
- [ ] Health Checks (Liveness/Readiness) bestehen
- [ ] Prometheus-Metriken exportiert und gesammelt
- [ ] Grafana-Dashboards zeigen Echtzeit-Metriken an
- [ ] Autoscaling loest unter Last aus
- [ ] A/B-Test teilt Traffic korrekt
- [ ] Canary-Deployment rollt schrittweise aus
- [ ] Rollback funktioniert bei Canary-Fehlschlag

## Haeufige Stolperfallen

- **Kaltstartlatenz**: Erste Anfrage langsam durch Modellladung — Readiness-Probes mit angemessener Verzoegerung verwenden, Modell-Caching implementieren
- **Speicherlecks**: Langlebige Server akkumulieren Speicher — Speichernutzung ueberwachen, periodische Neustarts implementieren, Code profilieren
- **Abhaengigkeitskonflikte**: Modellabhaengigkeiten inkompatibel mit Serving-Framework — exakte fixierte Versionen verwenden, vor Bereitstellung in Docker testen
- **Ressourcenlimits zu niedrig**: Pods werden OOMKilled oder CPU-gedrosselt — Ressourcennutzung profilieren, angemessene Limits basierend auf Lasttests setzen
- **Fehlende Health Checks**: Kubernetes leitet Traffic an ungesunde Pods — ordentliche Liveness/Readiness-Probes implementieren
- **Keine Rollback-Strategie**: Schlechte Bereitstellung ohne einfaches Rollback — Canary-Deployments verwenden, vorherige Version verfuegbar halten
- **Latenz ignorieren**: Nur auf Genauigkeit fokussiert, nicht auf Inferenzgeschwindigkeit — Latenz benchmarken, Modell/Code optimieren, Batching verwenden
- **Einzelnes Replikat**: Keine Hochverfuegbarkeit, Ausfallzeit bei Bereitstellungen — mindestens 2 Replikate verwenden, Anti-Affinity konfigurieren
- **Kein Monitoring**: Probleme werden erst erkannt wenn Kunden sich beschweren — umfassende Metriken von Tag eins implementieren
- **GPU nicht genutzt**: GPU verfuegbar aber nicht verwendet — CUDA Visible Devices setzen, GPU-Zuweisung in Kubernetes verifizieren

## Verwandte Skills

- `register-ml-model` — Modelle vor der Bereitstellung registrieren
- `run-ab-test-models` — A/B-Tests zwischen Modellversionen implementieren
- `deploy-to-kubernetes` — Allgemeine Kubernetes-Bereitstellungsmuster
- `monitor-ml-model-performance` — Modelldrift und -verschlechterung ueberwachen
- `orchestrate-ml-pipeline` — Modellneutraining und -bereitstellung automatisieren
