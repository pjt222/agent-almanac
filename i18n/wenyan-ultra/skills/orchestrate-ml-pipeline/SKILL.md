---
name: orchestrate-ml-pipeline
locale: wenyan-ultra
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

# 編 ML 線


> 詳例見 [Extended Examples](references/EXAMPLES.md)。

立全 ML 線—依管、排、察。

## 用

- 自由攝至部之多步 ML 流
- 排期重訓
- 協分布處+訓
- 立 ML 線階間之繁依
- 管重試+敗復
- 察線行+敗警
- 編特工、訓、評、部
- 立可重之 ML 流跨境

## 入

- **必**：ML 線件（攝、預處、訓、評）
- **必**：編框擇（Prefect、Airflow、Kubeflow）
- **必**：Python+編庫
- **可**：Kubernetes 群為分布
- **可**：MLflow 跡伺
- **可**：DVC 為料版
- **可**：Slack/郵警
- **可**：察基（Prometheus、Grafana）

## 行

### 一：擇裝編框

擇宜框、立基。

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

**得：** 框裝、UI 達（Prefect http://localhost:4200、Airflow http://localhost:8080）、庫初、排器行。

**敗：** 查埠（`netstat -tulpn | grep 8080`）、驗庫連、確 Redis 行（Celery 須）、Python 版（Airflow 須 ≥ 3.8）、Docker daemon、看初日誌。

### 二：以 Prefect 立 ML 線

各階為 task 之 flow：

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

部+排：

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

**得：** Prefect flow 序行諸 task、敗自重試、成則 UI 綠、MLflow 錄驗、模註+部。

**敗：** 查依正確、MLflow 達、料路正、無循依、task 限期、Prefect 日誌、資源（記憶/CPU）。

### 三：以 Airflow 立 ML 線

立生產 DAG：

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

**得：** DAG 現於 UI、排行於時、敗觸試+警、XCom 傳料、MLflow 錄驗。

**敗：** 查 DAG 文法（`python dags/ml_training_dag.py`）、Airflow 環有引、XCom 不超限（大料用文路）、郵配置、排器行、UI 看 task 日誌。

### 四：施進階

加動 DAG、分支、並行：

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

**得：** 並行 task 同行（線速）、條件分支按理執、動 task 生效、Dask 群分。

**敗：** Dask 群已配且達、task_runner 已指、分支返有效 task ID、並行無資源爭、條件邏輯正。

### 五：整察+警

加全察+敗報：

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

**得：** 敗送 Slack/郵、SLA 違觸警、自指追、日誌聚於察系。

**敗：** 驗 Slack webhook 正、郵 SMTP 設、警塊已載、SLA 值合理、無網阻警。

### 六：施線之 CI/CD

控版+自部署：

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

**得：** 部前試過、自部於生產、部成告隊、Git 控線版。

**敗：** 試覆+敗、Prefect Cloud 憑證、部腳本處誤、Slack webhook、CI 日誌。

## 驗

- [ ] 編框裝且行
- [ ] 線 DAG 立、依正
- [ ] 諸 task 序行
- [ ] 重試於敗起作用
- [ ] 排運於時
- [ ] MLflow 整錄驗
- [ ] DVC 整版料
- [ ] 並行 task 同行
- [ ] 條件分支正
- [ ] 察+警有效
- [ ] CI/CD 自部
- [ ] 線跨境可重

## 忌

- **循依**：A 依 B、B 依 A—慎設 DAG、用 Airflow/Prefect 驗器
- **記憶漏**：長 task 累記憶—設限期、察用、期重啟工
- **XCom 限**：傳大料於 XCom—用文路或外存（S3）
- **時區惑**：排運於誤時—皆用 UTC、明設時區
- **缺重試**：暫誤致 task 永敗—配指數退之重試
- **緊耦**：task 直依實作—用清介、明傳參
- **無冪等**：重行致重複或誤—設冪等（重試安）
- **誤理弱**：敗無境—加詳日誌、捕例
- **資源爭**：並行壓資源—限並、設配額
- **版衝突**：諸 task 須不容依—用 Docker 隔

## 參

- `track-ml-experiments`
- `version-ml-data`
- `build-feature-store`
- `deploy-ml-model-serving`
- `deploy-to-kubernetes`
