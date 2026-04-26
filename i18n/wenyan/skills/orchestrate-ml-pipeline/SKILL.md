---
name: orchestrate-ml-pipeline
locale: wenyan
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

# 編 ML 管道


> 詳例見 [Extended Examples](references/EXAMPLES.md)。

以依管、排程、與察建並編端至端 ML 管道。

## 用時

- 自動多步 ML 流自據入至部署乃用
- 新據上排定期模型重訓乃用
- 分布據處與訓任務之協調乃用
- 行 ML 管階間複依乃用
- 重試邏輯與失敗復管乃用
- 察管道行與失敗警乃用
- 編特徵工、訓、評、部之諸階乃用
- 跨環境建可復 ML 流乃用

## 入

- **必要**：ML 管件（據入、預處、訓、評）
- **必要**：編框選（Prefect、Airflow、Kubeflow）
- **必要**：裝編庫之 Python 環
- **可選**：Kubernetes 群為分布行
- **可選**：MLflow 追蹤服以記實驗
- **可選**：DVC 為據版本
- **可選**：Slack/郵以警
- **可選**：察基（Prometheus、Grafana）

## 法

### 第一步：選並裝編框

擇宜框並設基設。

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

**得：** 編框已裝，網 UI 可達（Prefect 於 http://localhost:4200，Airflow 於 http://localhost:8080），庫已初，排程行。

**敗則：** 察端可用（`netstat -tulpn | grep 8080`），驗庫連，確 Celery 之 Redis 行，察 Python 版合（Airflow 須 ≥3.8），驗容 Docker 守護，閱日察初誤。

### 第二步：以 Prefect 建 ML 管道

建 Prefect flow，各階為 task。

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

部並排：

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

**得：** Prefect flow 諸 task 依序行，task 失敗自重試，成行於 UI 現綠，MLflow 記實驗，模型已註並部。

**敗則：** 察 task 依正定，驗 MLflow 服可達，確據源徑正，察循依，驗 task 超時，閱 Prefect 日誌詳誤，察資（記/CPU）。

### 第三步：以 Airflow 建 ML 管道

建 Airflow DAG 為生產 ML 流。

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

**得：** DAG 現於 Airflow UI，排行按時，task 失敗觸重試與警，XCom 傳據於 task 間，MLflow 整合記實驗。

**敗則：** 察 DAG 文語法（`python dags/ml_training_dag.py`），驗入於 Airflow 環可得，確 XCom 不逾大限（大據用文徑），察郵設供警，驗排程行，閱 Airflow UI 中 task 日。

### 第四步：行進階能

加動 DAG、分支、平行行。

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

**得：** 平行 task 並發行（管道更快），條件分支依邏行，動 task 生行，Dask 群分工。

**敗則：** 察 Dask 群已設可達，驗 task_runner 已指，確分支返有效 task ID，察平行 task 之資爭，驗條件邏正。

### 第五步：合察與警

加全察與失敗通。

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

Airflow 之 sensor 察：

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

**得：** Slack/郵通於失敗送，SLA 違觸警，自度量追，日誌聚於察系。

**敗則：** 驗 Slack webhook 正設，察郵 SMTP 設，確通塊已正載，驗 SLA 值合理，察阻通之網問。

### 第六步：行管道之 CI/CD

版控並自動管道部。

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

**得：** 部前管試過，自動部生產，成部告隊，管版於 Git 追。

**敗則：** 察試覆與失敗，驗 Prefect Cloud 憑，確部腳本處誤，察 Slack webhook 設，閱 CI 日察部誤。

## 驗

- [ ] 編框已裝且行
- [ ] 管道 DAG 定，依正
- [ ] 諸 task 依正序行
- [ ] 失敗時重試邏輯正
- [ ] 排行按時行
- [ ] MLflow 整合記實驗
- [ ] DVC 整合記據版本
- [ ] 平行 task 並發行
- [ ] 條件分支正
- [ ] 察與警可行
- [ ] CI/CD 自動部
- [ ] 管道跨環可復

## 陷

- **循依**：A 依 B，B 依 A——慎設 DAG 構，用 Airflow/Prefect 驗器
- **記漏**：長 task 累記——設 task 超時，察資用，定期重啟工
- **XCom 大限**：以 XCom 傳大據——用文徑或外存（S3）非直序
- **時區混**：誤時排——必用 UTC，明設排程時區
- **無重試**：暫誤致 task 永敗——設指數退之重試
- **緊耦**：task 直依實現——用清接，明傳參
- **無冪等**：重行致重複或誤——設冪等之 task（重試安）
- **誤處差**：失敗無有用脈——加詳日誌，正捕異
- **資爭**：平行 task 壓資——限並發，設資配額
- **版衝**：諸 task 須不容依——用 Docker 容隔離

## 參

- `track-ml-experiments` - 合 MLflow 追於管道 task
- `version-ml-data` - 用 DVC 為管中據版本
- `build-feature-store` - 物化特徵為管 task
- `deploy-ml-model-serving` - 加部為終管階
- `deploy-to-kubernetes` - 於 Kubernetes 行編管道
