---
name: orchestrate-ml-pipeline
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Orchestrate end-to-end machine learning pipelines using Prefect or Airflow with
  DAG construction, task dependencies, retry logic, scheduling, monitoring, and
  integration with MLflow, DVC, and feature stores for production ML workflows. Use
  when automating multi-step ML workflows from data ingestion to deployment, scheduling
  periodic model retraining, coordinating distributed training tasks, or managing retry
  logic and failure recovery across pipeline stages.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mlops
  complexity: advanced
  language: multi
  tags: prefect, airflow, pipeline, dag, orchestration
---

# 編排 ML 管道

> 完整配置檔與範本詳見 [Extended Examples](references/EXAMPLES.md)。

以依賴管理、排程與監測，建立並編排端到端之機器學習管道。

## 適用時機

- 自動化由資料攝取至部署之多步 ML 工作流
- 對新資料排程定期模型重訓
- 協調分散式資料處理與訓練任務
- 實施 ML 管道階段間之複雜依賴
- 管理重試邏輯與失敗恢復
- 監測管道執行並對失敗告警
- 編排特徵工程、訓練、評估與部署
- 建立跨環境之可重現 ML 工作流

## 輸入

- **必要**：ML 管道組件（資料攝取、預處理、訓練、評估）
- **必要**：編排框架之擇（Prefect、Airflow、Kubeflow）
- **必要**：已裝編排函式庫之 Python 環境
- **選擇性**：分散式執行之 Kubernetes 集群
- **選擇性**：實驗記錄之 MLflow 追蹤伺服器
- **選擇性**：資料版本控制之 DVC
- **選擇性**：告警之 Slack/email
- **選擇性**：監測基礎設施（Prometheus、Grafana）

## 步驟

### 步驟一：擇並裝編排框架

擇適框架並建基礎設施。

```bash
# Option 1: Prefect (modern, Pythonic, simpler)
pip install prefect
pip install prefect-aws prefect-dask prefect-docker

# Start Prefect server (local development)
prefect server start

# Or use Prefect Cloud (managed)
# ... (see EXAMPLES.md for complete implementation)
```

Airflow 之 Docker Compose：

```yaml
# docker-compose.airflow.yml
version: '3.8'

x-airflow-common: &airflow-common
  image: apache/airflow:2.8.0
  environment:
    AIRFLOW__CORE__EXECUTOR: CeleryExecutor
    AIRFLOW__DATABASE__SQL_ALCHEMY_CONN: postgresql+psycopg2://airflow:airflow@postgres/airflow
# ... (see EXAMPLES.md for complete implementation)
```

**預期：** 編排框架已裝，網頁 UI 可達（Prefect 於 http://localhost:4200，Airflow 於 http://localhost:8080），資料庫已初始化，排程器運行中。

**失敗時：** 查埠可用性（`netstat -tulpn | grep 8080`），驗資料庫連接，確 Redis 為 Celery 運行，查 Python 版本相容性（Airflow 需 ≥3.8），驗 Docker 守護程序為容器化設置，覽日誌中之初始化錯誤。

### 步驟二：以 Prefect 建 ML 管道

為每管道階段建附任務之 Prefect 流。

```python
# prefect_ml_pipeline.py
from prefect import flow, task
from prefect.tasks import task_input_hash
from datetime import timedelta
import pandas as pd
import mlflow
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
# ... (see EXAMPLES.md for complete implementation)
```

部署並排程：

```python
# deploy_prefect.py
from prefect.deployments import Deployment
from prefect.server.schemas.schedules import CronSchedule
from prefect_ml_pipeline import ml_training_pipeline

# Create deployment with schedule
deployment = Deployment.build_from_flow(
    flow=ml_training_pipeline,
# ... (see EXAMPLES.md for complete implementation)
```

**預期：** Prefect 流以正確順序執行所有任務，任務失敗自動觸發重試，成功運行於 UI 中顯綠，MLflow 記錄實驗，模型註冊並部署。

**失敗時：** 查任務依賴定義正確，驗 MLflow 伺服器可達，確資料來源路徑正確，查循環依賴，驗任務逾時上限，覽 Prefect 日誌中之詳錯，查資源可用性（記憶體/CPU）。

### 步驟三：以 Airflow 建 ML 管道

為生產 ML 工作流建 Airflow DAG。

```python
# dags/ml_training_dag.py
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.providers.docker.operators.docker import DockerOperator
from airflow.utils.dates import days_ago
from datetime import datetime, timedelta
import mlflow
import pandas as pd
# ... (see EXAMPLES.md for complete implementation)
```

**預期：** DAG 現於 Airflow UI，排程運行按時執行，任務失敗觸發重試與告警，XCom 於任務間傳資料，MLflow 整合記錄實驗。

**失敗時：** 查 DAG 檔語法（`python dags/ml_training_dag.py`），驗匯入於 Airflow 環境中可得，確 XCom 不逾大小上限（大資料用檔路徑），查告警之電郵配置，驗排程器運行，覽 Airflow UI 中之任務日誌。

### 步驟四：實施進階特性

加動態 DAG、分支與並行執行。

```python
# advanced_pipeline.py (Prefect)
from prefect import flow, task
from prefect.task_runners import DaskTaskRunner, ConcurrentTaskRunner
import time

@task
def process_shard(shard_id: int, data: list) -> dict:
    """Process data shard in parallel."""
# ... (see EXAMPLES.md for complete implementation)
```

Airflow 分支：

```python
# Airflow branching with BranchPythonOperator
from airflow.operators.python import BranchPythonOperator

def check_data_quality(**context):
    """Decide which branch to take."""
    data_path = context['ti'].xcom_pull(key='data_path')
    df = pd.read_csv(data_path)

# ... (see EXAMPLES.md for complete implementation)
```

**預期：** 並行任務同步執行（管道更快），條件分支依邏輯執行，動態任務生成可運作，Dask 集群分配工作。

**失敗時：** 查 Dask 集群已配且可達，驗 task_runner 已指定，確分支返有效任務 ID，查並行任務之資源爭用，驗條件邏輯正確。

### 步驟五：整合監測與告警

加全面監測與失敗通知。

```python
# monitoring_integration.py
from prefect.blocks.notifications import SlackWebhook
from prefect import flow, task, get_run_logger
from prefect.context import FlowRunContext

@task(on_failure=[notify_failure])
def critical_task():
    """Task with failure notification."""
# ... (see EXAMPLES.md for complete implementation)
```

Airflow 之感應器監測：

```python
# Airflow SLA and monitoring
from airflow.sensors.base import BaseSensorOperator
from airflow.utils.decorators import apply_defaults

default_args = {
    'sla': timedelta(hours=4),  # Alert if task exceeds 4 hours
    'on_failure_callback': slack_alert_failure,
    'on_success_callback': slack_alert_success,
# ... (see EXAMPLES.md for complete implementation)
```

**預期：** 失敗時送 Slack/email 通知，SLA 違反觸發告警，自定指標已追蹤，日誌於監測系統中聚合。

**失敗時：** 驗 Slack webhook 已正確配，查電郵 SMTP 設定，確通知區塊正確載入，驗 SLA 值合理，查阻通知之網路問題。

### 步驟六：為管道實施 CI/CD

版本控制並自動化管道部署。

```yaml
# .github/workflows/deploy-pipeline.yml
name: Deploy ML Pipeline

on:
  push:
    branches: [main]
    paths:
      - 'pipelines/**'
# ... (see EXAMPLES.md for complete implementation)
```

**預期：** 部署前管道測試通過，自動部署至生產，成功部署團隊獲通知，管道版本於 Git 中追蹤。

**失敗時：** 查測試覆蓋與失敗，驗 Prefect Cloud 憑證，確部署腳本處理錯誤，查 Slack webhook 配置，覽 CI 日誌中之部署錯誤。

## 驗證

- [ ] 編排框架已裝且運行
- [ ] 管道 DAG 已定義且依賴正確
- [ ] 所有任務按正確順序執行
- [ ] 重試邏輯於失敗時正常運作
- [ ] 排程運行按時執行
- [ ] MLflow 整合記錄實驗
- [ ] DVC 整合版本化資料
- [ ] 並行任務同步執行
- [ ] 條件分支正確運作
- [ ] 監測與告警運作
- [ ] CI/CD 管道自動部署
- [ ] 管道跨環境可重現

## 常見陷阱

- **循環依賴**：任務 A 依 B，B 依 A——當細設 DAG 結構，用 Airflow/Prefect 驗證器
- **記憶體洩漏**：長運行任務累積記憶體——設任務逾時，監測資源使用，定期重啟工作者
- **XCom 大小上限**：透過 XCom 傳大資料——用檔路徑或外部儲存（S3）而非直接序列化
- **時區混淆**：排程於錯誤時間運行——恆用 UTC，於排程中明設時區
- **缺重試**：任務於暫態錯誤上永久失敗——以指數退避配置重試
- **緊耦合**：任務直接依實作細節——用清晰介面，明傳參數
- **無冪等**：重運行任務致重複或錯誤——設計任務為冪等（重試安全）
- **錯誤處理差**：失敗未提供有用上下文——加詳記錄，妥當捕獲例外
- **資源爭用**：並行任務壓垮資源——限並發，設資源配額
- **版本衝突**：不同任務需不相容之依賴——用 Docker 容器以隔離任務

## 相關技能

- `track-ml-experiments` - 將 MLflow 追蹤整合於管道任務
- `version-ml-data` - 用 DVC 為管道中之資料版本化
- `build-feature-store` - 將特徵實體化為管道任務
- `deploy-ml-model-serving` - 加部署為最終管道階段
- `deploy-to-kubernetes` - 於 Kubernetes 上運行編排管道
