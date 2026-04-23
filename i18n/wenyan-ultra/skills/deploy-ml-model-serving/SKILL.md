---
name: deploy-ml-model-serving
locale: wenyan-ultra
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

# 部署 ML 模型服務

> 詳例見 [Extended Examples](references/EXAMPLES.md)。

部 ML 模型於生產：可擴服務設施、監控、A/B 測試。

## 用

- 訓好模型→生產實時推理
- REST/gRPC 預測 API
- 變載自動擴
- 模型版本 A/B
- 批→實時遷移
- 構低時延預測服務
- 理多版本生產

## 入

- **必**：MLflow 註冊模型或訓好物
- **必**：Kubernetes 集群或容編平
- **必**：服務框架（MLflow、BentoML、Seldon Core、TorchServe）
- **可**：GPU（深度學習）
- **可**：監設施（Prometheus、Grafana）
- **可**：負載均衡+入控

## 法

### 一：以 MLflow 部署

速部 scikit-learn、PyTorch、TensorFlow。

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

Docker 部署：

```dockerfile
# Dockerfile.mlflow-serving
FROM python:3.9-slim

# Install MLflow and dependencies
RUN pip install mlflow boto3 scikit-learn

# Set environment variables
ENV MLFLOW_TRACKING_URI=http://mlflow-server:5000
# ... (see EXAMPLES.md for complete implementation)
```

Docker Compose 本地測試：

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

測部署：

```python
# test_mlflow_serving.py
import requests
import json

def test_prediction():
    url = "http://localhost:8080/invocations"

    # Prepare input data
# ... (see EXAMPLES.md for complete implementation)
```

**得：** 模型服務啟，應 HTTP POST，以 JSON 返預測，Docker 容器無錯。

**敗：** 查模型 URI（`mlflow models list`），驗 MLflow 跟蹤服務可達，確容器內依賴齊，查端口（`netstat -tulpn | grep 8080`），驗模型風味相容，察容器日誌（`docker logs <container-id>`）。

### 二：以 BentoML 部署生產

BentoML 高級服務。

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

構+容器化：

```bash
# Build Bento
bentoml build

# Containerize
bentoml containerize customer_churn_classifier:latest \
  --image-tag customer-churn:v1.0

# Run container
docker run -p 3000:3000 customer-churn:v1.0
```

BentoML 配置：

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

Kubernetes 部署：

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

部至 Kubernetes：

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

**得：** BentoML 服務構成，容器跑並服預測，K8s 部署建 3 副本，負載均衡露外，健康檢通。

**敗：** 驗 BentoML 裝（`bentoml --version`），查模型於 BentoML 庫（`bentoml models list`），確 Docker 守護跑，驗 K8s 集群訪（`kubectl cluster-info`），查資源限，察 pod 日誌（`kubectl logs <pod-name>`），驗選擇器匹 pod 標籤。

### 三：以 Seldon Core 行進階功能

多模服務、A/B、可解釋。

```python
# seldon_wrapper.py
import logging
from typing import Dict, List, Union
import numpy as np
import mlflow

logger = logging.getLogger(__name__)

# ... (see EXAMPLES.md for complete implementation)
```

Seldon 部署配：

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

A/B 測試配：

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

部至 Kubernetes：

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

**得：** Seldon 算子裝成，模部署建 pod，REST 應預測，A/B 流量分對，Seldon 分析錄指標。

**敗：** 驗 Seldon 算子跑（`kubectl get pods -n seldon-system`），查 SeldonDeployment 狀態（`kubectl describe seldondeployment`），確鏡像倉可達，驗模型 URI 解析，查 RBAC 權限，察模容器日誌。

### 四：行監與可觀

加監控於模型服務設施。

```python
# monitoring.py
from prometheus_client import Counter, Histogram, Gauge, start_http_server
import time
import logging

logger = logging.getLogger(__name__)

# Prometheus metrics
# ... (see EXAMPLES.md for complete implementation)
```

Prometheus 配：

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

Grafana 儀板 JSON：

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

**得：** Prometheus 抓成，Grafana 儀板示實時吞吐、時延百分位、錯率、活躍請求。

**敗：** 驗 Prometheus 抓目標 UP（`http://prometheus:9090/targets`），查指標端點可達（`curl http://model-pod:8000/metrics`），確 K8s 服務發現配，驗 Grafana 數據源連，查防火牆指標端口。

### 五：行自動擴

配水平 pod 自動擴於請求負載。

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

施自動擴：

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

**得：** HPA 監 CPU/內存/自定指標，負載擴，穩定後縮，min/max 守。

**敗：** 驗 metrics-server 跑（`kubectl get deployment metrics-server -n kube-system`），查 pod 資源請求定（HPA 需），確自定指標可用（若用），驗 HPA 控制器 RBAC，查穩定窗不過嚴。

### 六：行金絲雀部署

漸進新模版本。

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

漸進推出腳本：

```python
# canary_rollout.py
import time
import subprocess
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ... (see EXAMPLES.md for complete implementation)
```

**得：** 金絲雀始 0% 流量，自動漸進轉移，各階健康檢通，指標劣即回滾，諸階通畢畢。

**敗：** 驗 Seldon 有多預測器，查流量比和 100，確金絲雀像存可拉，驗 Prometheus 指標可用於健康檢，查回滾邏輯執，察兩版 pod 日誌。

## 驗

- [ ] 模型服務應預測
- [ ] REST/gRPC 可用並錄文
- [ ] Docker 容器構跑
- [ ] K8s 部署建期望副本
- [ ] 負載均衡露外
- [ ] 健康檢（活躍/就緒）通
- [ ] Prometheus 指標出+抓
- [ ] Grafana 示實時
- [ ] 自動擴觸
- [ ] A/B 流量分對
- [ ] 金絲雀漸進推出
- [ ] 金絲雀失時回滾工作

## 忌

- **冷啟時延**：首請慢因載模→用就緒探+適延，行模緩存
- **內存洩漏**：長跑累→監內存，週期重啟，剖碼
- **依賴衝突**：與服務框架不容→精釘，Docker 前測
- **資源限過低**：OOM/節流→剖用量，按壓測設限
- **缺健康檢**：K8s 路不健康 pod→行活躍/就緒探
- **無回滾策**：壞部無易回→用金絲雀，留前版
- **忽時延**：只顧準非速→測時延，優化模/碼，批
- **單副本**：無高可用，部署時宕→至少 2 副本，反親和
- **無監**：至客訴始知→首日即監
- **GPU 未用**：有而不用→設 CUDA 可見，驗 K8s GPU 分配

## 參

- `register-ml-model`
- `run-ab-test-models`
- `deploy-to-kubernetes`
- `monitor-ml-model-performance`
- `orchestrate-ml-pipeline`
