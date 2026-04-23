---
name: deploy-ml-model-serving
locale: wenyan-lite
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


> 完整配置文件與模板，見 [Extended Examples](references/EXAMPLES.md)。

部署機器學習模型於生產環境，具可擴展之服務基礎架構、監控與 A/B 測試。

## 適用時機

- 將已訓練模型部署於生產環境以作即時推理
- 為模型預測設 REST 或 gRPC API
- 為變動之負載實作自動擴展
- 於模型版本間作 A/B 測試
- 自批次遷至即時推理
- 建低延遲之預測服務
- 於生產環境管多模型版本

## 輸入

- **必需**：於 MLflow 模型註冊表中之已註冊模型，或已訓練之模型工件
- **必需**：Kubernetes 集群或容器編排平台
- **必需**：服務框架之擇（MLflow、BentoML、Seldon Core、TorchServe）
- **可選**：供深度學習模型之 GPU 資源
- **可選**：監控基礎架構（Prometheus、Grafana）
- **可選**：負載均衡器與入口控制器

## 步驟

### 步驟一：以 MLflow Models Serving 部署

用 MLflow 內建之服務快速部署 scikit-learn、PyTorch、TensorFlow 模型。

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

本地測試用 Docker Compose：

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

測試部署：

```python
# test_mlflow_serving.py
import requests
import json

def test_prediction():
    url = "http://localhost:8080/invocations"

    # Prepare input data
# ... (see EXAMPLES.md for complete implementation)
```

**預期：** 模型伺服器成功啟動，能應 HTTP POST 請求，以 JSON 格式返回預測，Docker 容器執行無誤。

**失敗時：** 查模型 URI 有效（`mlflow models list`），驗 MLflow 追蹤伺服器可達，確容器內已裝所有模型依賴，查埠可用（`netstat -tulpn | grep 8080`），驗模型風格相容性，檢容器日誌（`docker logs <container-id>`）。

### 步驟二：以 BentoML 部署至生產規模

用 BentoML 以得更佳之性能與功能之高級服務。

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

部署至 Kubernetes：

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

**預期：** BentoML 服務成功建，容器執行並服務預測，Kubernetes 部署生 3 副本，負載均衡器對外暴露端點，健康檢查通過。

**失敗時：** 驗 BentoML 安裝（`bentoml --version`），查 BentoML 儲存中模型存（`bentoml models list`），確 Docker 守護進程運行，驗 Kubernetes 集群可達（`kubectl cluster-info`），查資源限未超，檢 pod 日誌（`kubectl logs <pod-name>`），驗服務選擇器合 pod 標籤。

### 步驟三：以 Seldon Core 行高級功能

用 Seldon Core 作多模型服務、A/B 測試與可解釋性。

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

A/B 測試配置：

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

部署至 Kubernetes：

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

**預期：** Seldon Core 運算子成功裝，模型部署生 pod，REST 端點回應預測，A/B 測試正確分流流量，Seldon Analytics 記指標。

**失敗時：** 驗 Seldon Core 運算子運行（`kubectl get pods -n seldon-system`），查 SeldonDeployment 狀態（`kubectl describe seldondeployment`），確集群可達映像檔登錄，驗模型 URI 解析，查 Seldon 運算子之 RBAC 權限，檢模型容器日誌。

### 步驟四：行監控與可觀測性

為模型服務基礎架構加完整監控。

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

Grafana 儀表板 JSON：

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

**預期：** Prometheus 成功抓取指標，Grafana 儀表板即時顯示預測吞吐量、延遲百分位、錯誤率與活躍請求。

**失敗時：** 驗 Prometheus 抓取目標為 UP（`http://prometheus:9090/targets`），查指標端點可達（`curl http://model-pod:8000/metrics`），確 Kubernetes 服務發現已配，驗 Grafana 資料源連接，查指標埠之防火牆規則。

### 步驟五：行自動擴展

依請求負載配水平 Pod 自動擴展。

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

應用自動擴展：

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

**預期：** HPA 監 CPU/記憶體/自定指標，於負載下擴副本，穩定期後縮副本，尊重最小/最大副本限。

**失敗時：** 驗 metrics-server 運行（`kubectl get deployment metrics-server -n kube-system`），查 pod 資源請求已定（HPA 需之），若用自定指標確可用，驗 HPA 控制器之 RBAC 權限，查穩定窗非過嚴。

### 步驟六：行金絲雀部署策略

以流量轉移漸次推出新模型版本。

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

漸次推出腳本：

```python
# canary_rollout.py
import time
import subprocess
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ... (see EXAMPLES.md for complete implementation)
```

**預期：** 金絲雀部署自 0% 流量始，自動漸進轉移流量，各階段健康檢查通過，若指標退化則觸發回滾，所有階段通過後完成推出。

**失敗時：** 驗 Seldon 部署有多 predictor，查流量百分比合計為 100，確金絲雀映像檔存在且可拉取，驗 Prometheus 指標可用以作健康檢查，查回滾邏輯正確執行，檢兩版本之 pod 日誌。

## 驗證

- [ ] 模型伺服器回應預測請求
- [ ] REST/gRPC 端點功能正常且有文檔
- [ ] Docker 容器成功建並執行
- [ ] Kubernetes 部署生預期之副本數
- [ ] 負載均衡器對外暴露端點
- [ ] 健康檢查（liveness/readiness）通過
- [ ] Prometheus 指標已匯出並抓取
- [ ] Grafana 儀表板即時顯示指標
- [ ] 自動擴展於負載下觸發
- [ ] A/B 測試正確分流流量
- [ ] 金絲雀部署漸次推出
- [ ] 金絲雀失敗時回滾運作

## 常見陷阱

- **冷啟動延遲**：首次請求因模型載入而慢——用具足延遲之 readiness 探針，實作模型快取
- **記憶體洩漏**：長期運行之伺服器累積記憶體——監記憶體用量，實作定期重啟，剖析程式碼
- **依賴衝突**：模型依賴與服務框架不相容——用嚴格固定版本，部署前於 Docker 測之
- **資源限過低**：Pod 被 OOMKilled 或 CPU 被節流——剖析資源用量，依負載測試設合適之限
- **缺健康檢查**：Kubernetes 路由流量至不健康之 pod——實作合適之 liveness/readiness 探針
- **無回滾策略**：部署錯誤無易於回滾——用金絲雀部署，保留前一版可用
- **忽視延遲**：僅關注準確度，不顧推理速度——基準延遲，優化模型/程式碼，用批次
- **單副本**：無高可用性，部署時當機——用至少 2 副本，配反親和性
- **無監控**：待客戶投訴方知問題——自首日實作全面指標
- **GPU 未用**：GPU 可用卻未用——設 CUDA 可見設備，驗 Kubernetes 之 GPU 分配

## 相關技能

- `register-ml-model` - 部署前註冊模型
- `run-ab-test-models` - 於模型版本間行 A/B 測試
- `deploy-to-kubernetes` - 一般 Kubernetes 部署模式
- `monitor-ml-model-performance` - 監模型偏移與退化
- `orchestrate-ml-pipeline` - 自動化模型重訓與部署
