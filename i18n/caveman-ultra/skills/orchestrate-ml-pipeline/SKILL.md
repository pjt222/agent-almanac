---
name: orchestrate-ml-pipeline
locale: caveman-ultra
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

# Orchestrate ML Pipeline

> See [Extended Examples](references/EXAMPLES.md) for complete configuration files and templates.

End-to-end ML pipelines: deps, scheduling, monitoring.

## Use When

- Automate multi-step ML (ingest → deploy)
- Schedule periodic retraining
- Coord distributed data + training
- Complex stage deps
- Retry + failure recovery
- Monitor execution + alerting
- Orchestrate feature eng/train/eval/deploy
- Reproducible across envs

## In

- **Required**: Pipeline components (ingest, preprocess, train, eval)
- **Required**: Framework (Prefect, Airflow, Kubeflow)
- **Required**: Python env w/ orchestration lib
- **Optional**: K8s cluster (distributed)
- **Optional**: MLflow tracking server
- **Optional**: DVC for data versioning
- **Optional**: Slack/email alerts
- **Optional**: Monitoring (Prometheus, Grafana)

## Do

### Step 1: Pick + install framework

Select + setup infra.

```bash
# Option 1: Prefect (modern, Pythonic, simpler)
pip install prefect
pip install prefect-aws prefect-dask prefect-docker

# Start Prefect server (local development)
prefect server start

# Or use Prefect Cloud (managed)
# ... (see EXAMPLES.md for complete implementation)
```

Docker Compose for Airflow:

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

→ Framework installed, UI accessible (Prefect http://localhost:4200, Airflow http://localhost:8080), DB initialized, scheduler running.

If err: ports (`netstat -tulpn | grep 8080`), DB conn, Redis for Celery, Python ≥3.8 for Airflow, Docker daemon for containerized, init logs.

### Step 2: ML pipeline w/ Prefect

Flow w/ tasks per stage.

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

Deploy + schedule:

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

→ Flow runs all tasks in order, retries auto on failure, success = green in UI, MLflow logs, model registered + deployed.

If err: deps defined? MLflow accessible? Data paths correct? Circular deps? Task timeout? Prefect logs. Resources (mem/CPU)?

### Step 3: ML pipeline w/ Airflow

DAG for prod ML.

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

→ DAG in Airflow UI, scheduled runs on time, retries + alerts on failure, XCom passes between tasks, MLflow logs.

If err: syntax check (`python dags/ml_training_dag.py`), imports avail in env, XCom size (use file paths for big data), email config, scheduler running, task logs in UI.

### Step 4: Advanced features

Dynamic DAGs, branching, parallel.

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

Airflow branching:

```python
# Airflow branching with BranchPythonOperator
from airflow.operators.python import BranchPythonOperator

def check_data_quality(**context):
    """Decide which branch to take."""
    data_path = context['ti'].xcom_pull(key='data_path')
    df = pd.read_csv(data_path)

# ... (see EXAMPLES.md for complete implementation)
```

→ Parallel tasks concurrent (faster), conditional branches by logic, dynamic gen works, Dask distributes.

If err: Dask cluster configured + accessible? task_runner specified? Branches return valid task IDs? Resource contention w/ parallel? Conditional logic correct?

### Step 5: Monitoring + alerting

Failure notifications + comprehensive monitoring.

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

Airflow monitoring w/ sensors:

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

→ Slack/email on failures, SLA breach = alert, custom metrics tracked, logs aggregated.

If err: Slack webhook correct? SMTP set? Notification blocks loaded? SLA reasonable? Network blocking?

### Step 6: CI/CD for pipelines

Version + automate.

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

→ Tests pass before deploy, auto deploy to prod, team notified on success, versioning in Git.

If err: test coverage + failures, Prefect Cloud creds, deploy script error handling, Slack webhook, CI logs.

## Check

- [ ] Framework installed + running
- [ ] DAG defined w/ correct deps
- [ ] All tasks in proper order
- [ ] Retry logic works
- [ ] Scheduled runs on time
- [ ] MLflow logs experiments
- [ ] DVC versions data
- [ ] Parallel tasks concurrent
- [ ] Conditional branches work
- [ ] Monitoring + alerting functional
- [ ] CI/CD auto deploys
- [ ] Reproducible across envs

## Traps

- **Circular deps**: A→B, B→A → design DAG carefully, use validators
- **Memory leaks**: long tasks accumulate → timeouts, monitor, restart workers
- **XCom size limits**: passing big data → use file paths/S3, not direct serial
- **Timezone confusion**: wrong times → always UTC, explicit tz in schedule
- **Missing retries**: transient = perm fail → exponential backoff retries
- **Tight coupling**: deps on impl details → clear interfaces, explicit params
- **No idempotency**: re-run = dupes/errors → design idempotent (safe retry)
- **Poor error handling**: no context → detailed logs, capture exceptions
- **Resource contention**: parallel overwhelms → limit concurrency, quotas
- **Version conflicts**: incompatible deps per task → Docker containers for isolation

## →

- `track-ml-experiments` — MLflow tracking in tasks
- `version-ml-data` — DVC for data versioning
- `build-feature-store` — materialize features as task
- `deploy-ml-model-serving` — deploy as final stage
- `deploy-to-kubernetes` — run pipelines on K8s
