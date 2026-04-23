---
name: deploy-ml-model-serving
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Deploy machine learning models to production serving infrastructure using MLflow,
  BentoML, or Seldon Core with REST/gRPC endpoints, implement autoscaling, monitoring,
  and A/B testing capabilities for high-performance model inference at scale. Use when
  deploying trained models for real-time inference, setting up REST or gRPC prediction
  APIs, implementing autoscaling for variable load, running A/B tests between model
  versions, or migrating from batch to real-time inference.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mlops
  complexity: advanced
  language: multi
  tags: model-serving, bentoml, seldon, rest-api, grpc
---

# Deploy ML Model Serving

> See [Extended Examples](references/EXAMPLES.md) for complete configuration files and templates.

ML → prod. Scalable serving, monitoring, A/B.

## Use When

- Trained models → prod real-time inference
- REST/gRPC APIs → predictions
- Autoscale → variable load
- A/B tests → model vers
- Batch → real-time migrate
- Low-latency prediction svcs
- Multi-ver mgmt prod

## In

- **Required**: Registered model (MLflow Model Registry) or trained artifact
- **Required**: K8s or container orchestration
- **Required**: Serving framework (MLflow, BentoML, Seldon Core, TorchServe)
- **Optional**: GPU → deep learning
- **Optional**: Monitoring (Prometheus, Grafana)
- **Optional**: LB + ingress

## Do

### Step 1: MLflow Models Serving

Built-in → quick sklearn/PyTorch/TF.

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

Docker deploy:

```dockerfile
# Dockerfile.mlflow-serving
FROM python:3.9-slim

# Install MLflow and dependencies
RUN pip install mlflow boto3 scikit-learn

# Set environment variables
ENV MLFLOW_TRACKING_URI=http://mlflow-server:5000
# ... (see EXAMPLES.md for complete implementation)
```

Docker Compose:

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

Test:

```python
# test_mlflow_serving.py
import requests
import json

def test_prediction():
    url = "http://localhost:8080/invocations"

    # Prepare input data
# ... (see EXAMPLES.md for complete implementation)
```

→ Server starts, HTTP POST OK, JSON predictions, Docker runs clean.

If err: Model URI valid (`mlflow models list`), tracking server reachable, deps in container, port free (`netstat -tulpn | grep 8080`), flavor compat, `docker logs <container-id>`.

### Step 2: BentoML → prod scale

Advanced serving, better perf.

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

Build + containerize:

```bash
# Build Bento
bentoml build

# Containerize
bentoml containerize customer_churn_classifier:latest \
  --image-tag customer-churn:v1.0

# Run container
docker run -p 3000:3000 customer-churn:v1.0
```

BentoML config:

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

K8s deploy:

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

Deploy → K8s:

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

→ Bento builds, container serves, K8s 3 replicas, LB external EP, health OK.

If err: `bentoml --version`, model in store (`bentoml models list`), Docker running, K8s access (`kubectl cluster-info`), resource limits, pod logs (`kubectl logs <pod-name>`), svc selector matches labels.

### Step 3: Seldon Core → advanced

Multi-model serving, A/B, explainability.

```python
# seldon_wrapper.py
import logging
from typing import Dict, List, Union
import numpy as np
import mlflow

logger = logging.getLogger(__name__)

# ... (see EXAMPLES.md for complete implementation)
```

Seldon deploy config:

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

A/B test:

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

Deploy:

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

→ Seldon operator OK, pods created, REST EP responds, A/B splits traffic, analytics records.

If err: Operator (`kubectl get pods -n seldon-system`), SeldonDeployment status (`kubectl describe seldondeployment`), image registry access, model URI resolution, RBAC, model container logs.

### Step 4: Monitoring + observability

Comprehensive metrics.

```python
# monitoring.py
from prometheus_client import Counter, Histogram, Gauge, start_http_server
import time
import logging

logger = logging.getLogger(__name__)

# Prometheus metrics
# ... (see EXAMPLES.md for complete implementation)
```

Prometheus config:

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

Grafana JSON:

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

→ Prometheus scrapes OK, Grafana shows throughput + latency + err rates + active reqs real-time.

If err: Scrape targets UP (`http://prometheus:9090/targets`), metrics EP (`curl http://model-pod:8000/metrics`), K8s svc discovery, datasource, firewall port.

### Step 5: Autoscaling

HPA by req load.

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

Apply:

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

→ HPA monitors CPU/mem/custom, scales up on load, down after stabilize, min/max respected.

If err: metrics-server (`kubectl get deployment metrics-server -n kube-system`), pod resource reqs defined, custom metrics available, RBAC, stabilize windows.

### Step 6: Canary deploy

Traffic shift.

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

Gradual rollout:

```python
# canary_rollout.py
import time
import subprocess
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ... (see EXAMPLES.md for complete implementation)
```

→ Canary 0%, gradual shift, health OK each stage, rollback if degrade, full rollout after all pass.

If err: Multi predictors, traffic sums 100%, canary image pullable, Prometheus metrics for health, rollback logic, both ver logs.

## Check

- [ ] Server responds → prediction req
- [ ] REST/gRPC EPs OK + docs
- [ ] Docker containers build + run
- [ ] K8s creates expected replicas
- [ ] LB → external EP
- [ ] Liveness/readiness pass
- [ ] Prometheus scraped
- [ ] Grafana real-time
- [ ] Autoscale on load
- [ ] A/B splits correctly
- [ ] Canary gradual rollout
- [ ] Rollback works

## Traps

- **Cold start**: First req slow → readiness probe delay, cache model
- **Mem leaks**: Accumulate → monitor, periodic restart, profile
- **Dep conflicts**: → exact pinned vers, test Docker pre-deploy
- **Resource limits low**: OOM/throttle → profile, set by load test
- **No health checks**: K8s routes to unhealthy → liveness/readiness probes
- **No rollback**: Bad deploy → canary, keep prev ver
- **Ignore latency**: Only accuracy → bench, optimize, batch
- **Single replica**: No HA → min 2, anti-affinity
- **No monitoring**: Until complaints → metrics day 1
- **GPU unused**: → CUDA visible devices, K8s alloc

## →

- `register-ml-model` — register before deploy
- `run-ab-test-models` — A/B ver testing
- `deploy-to-kubernetes` — K8s patterns
- `monitor-ml-model-performance` — drift + degrade
- `orchestrate-ml-pipeline` — auto retrain + deploy
