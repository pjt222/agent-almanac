---
name: deploy-ml-model-serving
locale: wenyan
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


> 詳見 [Extended Examples](references/EXAMPLES.md) 全備之配置文件與模板。

部署機器學習模型至產，具可擴展服務設施、監視、A/B 測試。

## 用時

- 部已訓模型供產之實時推理
- 為模型預測立 REST 或 gRPC 之 API
- 為變載行自動擴縮
- 行模型版本間之 A/B 測
- 由批量轉實時推理
- 建低延時預測之服
- 理產中之多模型版本

## 入

- **必要**：MLflow 模型冊中已冊者，或已訓模型產物
- **必要**：Kubernetes 集群或容器編排平臺
- **必要**：擇服務框架（MLflow、BentoML、Seldon Core、TorchServe）
- **可選**：深度學習之 GPU
- **可選**：監視設施（Prometheus、Grafana）
- **可選**：負載均衡與入口控制

## 法

### 第一步：以 MLflow 模型服務部署

用 MLflow 內建服務，速部 scikit-learn、PyTorch、TensorFlow 模型。

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

Docker Compose 供本地測：

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

**得：** 模型服務成啟，應 HTTP POST 請求，返 JSON 預測，Docker 容器無錯行。

**敗則：** 察模型 URI 有效（`mlflow models list`）；驗 MLflow 跟蹤服可達；確容器內所有模型依賴已裝；察端口可用（`netstat -tulpn | grep 8080`）；驗模型 flavor 兼容；察容器日誌（`docker logs <container-id>`）。

### 第二步：以 BentoML 部產規模

用 BentoML 以求更佳性能與特性。

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

建並容器化：

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

**得：** BentoML 服務成建；容器行且出預測；Kubernetes 部署建三副本；負載均衡曝外端；健檢皆過。

**敗則：** 驗 BentoML 已裝（`bentoml --version`）；察 BentoML 庫中模型存（`bentoml models list`）；確 Docker 守護行；驗 Kubernetes 集群可訪（`kubectl cluster-info`）；察資源限未超；察 pod 日誌（`kubectl logs <pod-name>`）；驗服務選擇器合 pod 標籤。

### 第三步：以 Seldon Core 行進階特性

用 Seldon Core 以行多模型服、A/B 測、可釋性。

```python
# seldon_wrapper.py
import logging
from typing import Dict, List, Union
import numpy as np
import mlflow

logger = logging.getLogger(__name__)

# ... (see EXAMPLES.md for complete implementation)
```

Seldon 部署配置：

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

A/B 測配置：

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

**得：** Seldon Core 操作者成裝；模型部署建 pod；REST 端應預測；A/B 測正分流量；Seldon 析錄度。

**敗則：** 驗 Seldon Core 操作者行（`kubectl get pods -n seldon-system`）；察 SeldonDeployment 狀（`kubectl describe seldondeployment`）；確集群可訪鏡像庫；驗模型 URI 解；察 Seldon 操作者之 RBAC；察模型容器日誌。

### 第四步：行監視與可觀測

為模型服設施加全面監視。

```python
# monitoring.py
from prometheus_client import Counter, Histogram, Gauge, start_http_server
import time
import logging

logger = logging.getLogger(__name__)

# Prometheus metrics
# ... (see EXAMPLES.md for complete implementation)
```

Prometheus 配置：

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

Grafana 儀表盤 JSON：

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

**得：** Prometheus 成抓度；Grafana 儀表盤實時示吞吐、延時百分位、錯率、活請求。

**敗則：** 驗 Prometheus 抓目 UP（`http://prometheus:9090/targets`）；察 metrics 端可達（`curl http://model-pod:8000/metrics`）；確 Kubernetes 服發現已配；驗 Grafana 數據源連；察度端口之防火牆律。

### 第五步：行自動擴縮

依請求載配水平 pod 擴縮。

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

施擴縮：

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

**得：** HPA 察 CPU/內存/自定度；載高則擴副本；穩期後縮；最小最大副本限受守。

**敗則：** 驗 metrics-server 行（`kubectl get deployment metrics-server -n kube-system`）；察 pod 資源請求已定（HPA 需之）；若用自定度，確之可得；驗 HPA 控制者之 RBAC；察穩窗非過嚴。

### 第六步：行金絲雀部署策略

漸出新模型版本，轉移流量。

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

漸出腳本：

```python
# canary_rollout.py
import time
import subprocess
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ... (see EXAMPLES.md for complete implementation)
```

**得：** 金絲雀部署由 0% 流量始；流量漸移；各段健檢過；若度劣則觸回滾；諸段成後全出。

**敗則：** 驗 Seldon 部署有多預測者；察流量百分和為 100；確金絲雀鏡存可取；驗健檢有 Prometheus 度；察回滾邏輯行之正；察二版 pod 日誌。

## 驗

- [ ] 模型服應預測請求
- [ ] REST/gRPC 端可用且已文
- [ ] Docker 容器成建且行
- [ ] Kubernetes 部署生期副本
- [ ] 負載均衡曝外端
- [ ] 健檢（存/備）過
- [ ] Prometheus 度已出且抓
- [ ] Grafana 儀表盤示實時度
- [ ] 載下自動擴縮觸
- [ ] A/B 測正分流量
- [ ] 金絲雀部署漸出
- [ ] 金絲雀敗時回滾行

## 陷

- **冷啟延時**：首請求因模型載而慢——用足延之備探，行模型緩
- **內存漏**：久行服累內存——察內存，周期重啟，剖析碼
- **依賴衝**：模型依賴與服框架不合——用鎖定版，於 Docker 中測後再部
- **資源限過低**：pod OOMKilled 或 CPU 節——剖析資源，依載測定合限
- **缺健檢**：Kubernetes 送流量至不健 pod——行適之存/備探
- **無回滾策**：壞部署無可易回之法——用金絲雀，留前版可用
- **忽延時**：唯聚焦精度不顧推理速——測延時，優化模型/碼，用批
- **單副本**：無高可用，部署時停機——用 minimum 2 副本，配反親和
- **無監視**：問題至客訴方現——首日即行全面度
- **GPU 不用**：有 GPU 而未用——設 CUDA 可見設備，驗 Kubernetes 中 GPU 分

## Related Skills

- `register-ml-model` - 部前冊模型
- `run-ab-test-models` - 模型版本間之 A/B 測
- `deploy-to-kubernetes` - 通用 Kubernetes 部署模式
- `monitor-ml-model-performance` - 察模型漂移與衰
- `orchestrate-ml-pipeline` - 自動模型再訓與部
