---
name: deploy-ml-model-serving
description: >
  MLflow、BentoML、またはSeldon Coreを使用して、REST/gRPCエンドポイント付きの本番
  サービングインフラストラクチャに機械学習モデルをデプロイする。高性能なモデル推論の
  ためのオートスケーリング、モニタリング、A/Bテスト機能を実装する。学習済みモデルの
  リアルタイム推論デプロイ時、RESTまたはgRPC予測APIのセットアップ時、可変負荷の
  オートスケーリング実装時、モデルバージョン間のA/Bテスト実行時、バッチからリアルタイム
  推論への移行時に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mlops
  complexity: advanced
  language: multi
  tags: model-serving, bentoml, seldon, rest-api, grpc
  locale: ja
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# MLモデルサービングのデプロイ

> 完全な設定ファイルとテンプレートについては[拡張例](references/EXAMPLES.md)を参照。

スケーラブルなサービングインフラストラクチャ、モニタリング、A/Bテストを使用して機械学習モデルを本番環境にデプロイする。

## 使用タイミング

- 学習済みモデルをリアルタイム推論のために本番環境にデプロイする時
- モデル予測用のRESTまたはgRPC APIをセットアップする時
- 可変負荷パターンに対するオートスケーリングを実装する時
- モデルバージョン間のA/Bテストを実行する時
- バッチからリアルタイム推論に移行する時
- 低レイテンシの予測サービスを構築する時
- 本番環境で複数のモデルバージョンを管理する時

## 入力

- **必須**: MLflow Model Registryに登録されたモデルまたは学習済みモデルアーティファクト
- **必須**: Kubernetesクラスターまたはコンテナオーケストレーションプラットフォーム
- **必須**: サービングフレームワークの選択（MLflow、BentoML、Seldon Core、TorchServe）
- **任意**: ディープラーニングモデル用のGPUリソース
- **任意**: モニタリングインフラストラクチャ（Prometheus、Grafana）
- **任意**: ロードバランサーとIngressコントローラー

## 手順

### ステップ1: MLflow Models Servingによるデプロイ

scikit-learn、PyTorch、TensorFlowモデルの迅速なデプロイにMLflowの組み込みサービングを使用する。

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

Dockerデプロイメント:

```dockerfile
# Dockerfile.mlflow-serving
FROM python:3.9-slim

# Install MLflow and dependencies
RUN pip install mlflow boto3 scikit-learn

# Set environment variables
ENV MLFLOW_TRACKING_URI=http://mlflow-server:5000
# ... (see EXAMPLES.md for complete implementation)
```

ローカルテスト用のDocker Compose:

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

デプロイメントのテスト:

```python
# test_mlflow_serving.py
import requests
import json

def test_prediction():
    url = "http://localhost:8080/invocations"

    # Prepare input data
# ... (see EXAMPLES.md for complete implementation)
```

**期待結果:** モデルサーバーが正常に起動し、HTTP POSTリクエストに応答し、JSON形式で予測を返す。Dockerコンテナがエラーなく実行される。

**失敗時:** モデルURIが有効か確認（`mlflow models list`）、MLflowトラッキングサーバーへのアクセス可能性を確認、コンテナ内にすべてのモデル依存関係がインストールされているか確認、ポートの空き状況を確認（`netstat -tulpn | grep 8080`）、モデルフレーバーの互換性を確認、コンテナログを検査（`docker logs <container-id>`）。

### ステップ2: 本番スケール向けBentoMLによるデプロイ

より高いパフォーマンスと機能を持つ高度なサービングにBentoMLを使用する。

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

ビルドとコンテナ化:

```bash
# Build Bento
bentoml build

# Containerize
bentoml containerize customer_churn_classifier:latest \
  --image-tag customer-churn:v1.0

# Run container
docker run -p 3000:3000 customer-churn:v1.0
```

BentoML設定:

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

Kubernetesデプロイメント:

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

Kubernetesへのデプロイ:

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

**期待結果:** BentoMLサービスが正常にビルドされ、コンテナが実行され予測をサーブし、Kubernetesデプロイメントが3レプリカを作成し、ロードバランサーが外部エンドポイントを公開し、ヘルスチェックがパスする。

**失敗時:** BentoMLのインストールを確認（`bentoml --version`）、BentoMLストアにモデルが存在するか確認（`bentoml models list`）、Dockerデーモンが実行中か確認、Kubernetesクラスターへのアクセスを確認（`kubectl cluster-info`）、リソース制限が超過していないか確認、Podログを検査（`kubectl logs <pod-name>`）、サービスセレクターがPodラベルに一致するか確認。

### ステップ3: 高度な機能のためのSeldon Coreの実装

マルチモデルサービング、A/Bテスト、説明可能性にSeldon Coreを使用する。

```python
# seldon_wrapper.py
import logging
from typing import Dict, List, Union
import numpy as np
import mlflow

logger = logging.getLogger(__name__)

# ... (see EXAMPLES.md for complete implementation)
```

Seldonデプロイメント設定:

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

A/Bテスト設定:

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

Kubernetesへのデプロイ:

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

**期待結果:** Seldon Coreオペレーターが正常にインストールされ、モデルデプロイメントがPodを作成し、RESTエンドポイントが予測に応答し、A/Bテストがトラフィックを正しく分割し、Seldon Analyticsがメトリクスを記録する。

**失敗時:** Seldon Coreオペレーターの実行を確認（`kubectl get pods -n seldon-system`）、SeldonDeploymentのステータスを確認（`kubectl describe seldondeployment`）、クラスターからイメージレジストリにアクセス可能か確認、モデルURIの解決を確認、SeldonオペレーターのRBAC権限を確認、モデルコンテナログを検査。

### ステップ4: モニタリングとオブザーバビリティの実装

モデルサービングインフラストラクチャに包括的なモニタリングを追加する。

```python
# monitoring.py
from prometheus_client import Counter, Histogram, Gauge, start_http_server
import time
import logging

logger = logging.getLogger(__name__)

# Prometheus metrics
# ... (see EXAMPLES.md for complete implementation)
```

Prometheus設定:

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

Grafanaダッシュボード JSON:

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

**期待結果:** Prometheusがメトリクスを正常にスクレイプし、Grafanaダッシュボードが予測スループット、レイテンシパーセンタイル、エラー率、アクティブリクエストをリアルタイムで表示する。

**失敗時:** Prometheusのスクレイプターゲットがアクティブか確認（`http://prometheus:9090/targets`）、メトリクスエンドポイントへのアクセス可能性を確認（`curl http://model-pod:8000/metrics`）、Kubernetesサービスディスカバリーの設定を確認、Grafanaデータソース接続を確認、メトリクスポートのファイアウォールルールを確認。

### ステップ5: オートスケーリングの実装

リクエスト負荷に基づくHorizontal Pod Autoscalingを設定する。

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

オートスケーリングの適用:

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

**期待結果:** HPAがCPU/メモリ/カスタムメトリクスを監視し、負荷時にレプリカをスケールアップし、安定化期間後にスケールダウンし、最小/最大レプリカ制限が遵守される。

**失敗時:** metrics-serverの実行を確認（`kubectl get deployment metrics-server -n kube-system`）、Podリソースリクエストが定義されているか確認（HPAにはリクエストが必要）、カスタムメトリクスを使用する場合その利用可能性を確認、HPAコントローラーのRBAC権限を確認、安定化ウィンドウが制限的すぎないか確認。

### ステップ6: カナリアデプロイメント戦略の実装

トラフィック移行による新モデルバージョンの段階的ロールアウト。

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

段階的ロールアウトスクリプト:

```python
# canary_rollout.py
import time
import subprocess
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ... (see EXAMPLES.md for complete implementation)
```

**期待結果:** カナリアデプロイメントが0%のトラフィックで開始し、段階的なトラフィック移行が自動的に行われ、各段階でヘルスチェックがパスし、メトリクスが劣化した場合にロールバックが発動し、すべての段階がパスした後に完全ロールアウトされる。

**失敗時:** Seldonデプロイメントに複数のpredictorがあるか確認、トラフィック割合の合計が100であるか確認、カナリアイメージが存在しプル可能か確認、ヘルスチェック用のPrometheusメトリクスが利用可能か確認、ロールバックロジックが正しく実行されるか確認、両バージョンのPodログを検査。

## バリデーション

- [ ] モデルサーバーが予測リクエストに応答する
- [ ] REST/gRPCエンドポイントが機能しドキュメント化されている
- [ ] Dockerコンテナが正常にビルド・実行される
- [ ] Kubernetesデプロイメントが期待されるレプリカを作成する
- [ ] ロードバランサーが外部エンドポイントを公開する
- [ ] ヘルスチェック（liveness/readiness）がパスする
- [ ] Prometheusメトリクスがエクスポート・スクレイプされている
- [ ] Grafanaダッシュボードがリアルタイムメトリクスを表示する
- [ ] 負荷下でオートスケーリングが発動する
- [ ] A/Bテストがトラフィックを正しく分割する
- [ ] カナリアデプロイメントが段階的にロールアウトされる
- [ ] カナリア失敗時にロールバックが機能する

## よくある落とし穴

- **コールドスタートレイテンシ**: モデルロードによる最初のリクエストの遅延。適切な遅延を持つreadinessプローブを使用し、モデルキャッシングを実装する
- **メモリリーク**: 長期実行サーバーがメモリを蓄積する。メモリ使用量を監視し、定期的な再起動を実装し、コードをプロファイリングする
- **依存関係の競合**: モデルの依存関係がサービングフレームワークと非互換。正確にピン留めされたバージョンを使用し、デプロイ前にDockerでテストする
- **リソース制限が低すぎる**: PodがOOMKilledまたはCPUスロットル。リソース使用量をプロファイリングし、負荷テストに基づいて適切な制限を設定する
- **ヘルスチェックの欠如**: Kubernetesが不健全なPodにトラフィックをルーティング。適切なliveness/readinessプローブを実装する
- **ロールバック戦略がない**: 簡単なロールバックなしの不良デプロイ。カナリアデプロイメントを使用し、前バージョンを利用可能に保つ
- **レイテンシの無視**: 精度のみに注目し推論速度を軽視。レイテンシをベンチマークし、モデル/コードを最適化し、バッチングを使用する
- **単一レプリカ**: 高可用性がなくデプロイ中にダウンタイム。最低2レプリカを使用し、アンチアフィニティを設定する
- **モニタリングなし**: 顧客から苦情が来るまで問題が検知されない。初日から包括的なメトリクスを実装する
- **GPUが活用されていない**: GPUが利用可能だが使用されていない。CUDA visible devicesを設定し、KubernetesでのGPU割り当てを確認する

## 関連スキル

- `register-ml-model` -- デプロイ前にモデルを登録する
- `run-ab-test-models` -- モデルバージョン間のA/Bテストを実装する
- `deploy-to-kubernetes` -- 一般的なKubernetesデプロイメントパターン
- `monitor-ml-model-performance` -- モデルドリフトと劣化を監視する
- `orchestrate-ml-pipeline` -- モデルの再学習とデプロイを自動化する
