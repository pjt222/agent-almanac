---
name: orchestrate-ml-pipeline
description: >
  Orchestrate end-to-end maschinelles Lernen pipelines using Prefect or Airflow with
  DAG construction, task Abhaengigkeiten, retry logic, scheduling, monitoring, and
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
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# ML-Pipeline orchestrieren


> See [Extended Examples](references/EXAMPLES.md) for complete configuration files and templates.

Erstellen and orchestrate end-to-end maschinelles Lernen pipelines with Abhaengigkeit management, scheduling, and monitoring.

## Wann verwenden

- Automating multi-step ML workflows from data ingestion to deployment
- Scheduling periodic model retraining on fresh data
- Coordinating distributed data processing and training tasks
- Implementing complex Abhaengigkeiten zwischen ML pipeline stages
- Managing retry logic and failure recovery
- Monitoring pipeline execution and alerting on failures
- Orchestrating feature engineering, training, evaluation, and deployment
- Building reproducible ML workflows across environments

## Eingaben

- **Erforderlich**: ML pipeline components (data ingestion, preprocessing, training, evaluation)
- **Erforderlich**: Orchestration framework choice (Prefect, Airflow, Kubeflow)
- **Erforderlich**: Python environment with orchestration library installed
- **Optional**: Kubernetes cluster for distributed execution
- **Optional**: MLflow tracking server for experiment logging
- **Optional**: DVC for data versioning
- **Optional**: Slack/email for alerting
- **Optional**: Monitoring infrastructure (Prometheus, Grafana)

## Vorgehensweise

### Schritt 1: Waehlen and Installieren Orchestration Framework

Auswaehlen appropriate framework and set up infrastructure.

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

**Erwartet:** Orchestration framework installed, web UI accessible (Prefect at http://localhost:4200, Airflow at http://localhost:8080), database initialized, scheduler running.

**Bei Fehler:** Check port availability (`netstat -tulpn | grep 8080`), verify database connection, ensure Redis running for Celery, check Python version compatibility (Airflow requires ≥3.8), verify Docker daemon for containerized setup, inspect logs for initialization errors.

### Schritt 2: Erstellen ML Pipeline with Prefect

Erstellen Prefect flow with tasks fuer jede pipeline stage.

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

Bereitstellen and schedule:

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

**Erwartet:** Prefect flow executes all tasks in correct order, task failures trigger retries automatisch, successful runs show green in UI, MLflow logs experiments, model registered and deployed.

**Bei Fehler:** Check task Abhaengigkeiten defined korrekt, verify MLflow server accessible, ensure Datenquelle paths correct, check for circular Abhaengigkeiten, verify task timeout limits, inspect Prefect logs for detailed errors, check resource availability (memory/CPU).

### Schritt 3: Erstellen ML Pipeline with Airflow

Erstellen Airflow DAG for production ML workflow.

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

**Erwartet:** DAG appears in Airflow UI, scheduled runs execute on time, task failures trigger retries and alerts, XCom passes data zwischen tasks, MLflow integration logs experiments.

**Bei Fehler:** Check DAG file syntax (`python dags/ml_training_dag.py`), verify imports available in Airflow environment, ensure XCom not exceeding size limits (use Dateipfads for large data), check email configuration for alerts, verify scheduler running, inspect task logs in Airflow UI.

### Schritt 4: Implementieren Advanced Features

Hinzufuegen dynamic DAGs, branching, and parallel execution.

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

**Erwartet:** Parallel tasks execute conderzeit (faster pipeline), conditional branches execute basierend auf logic, dynamic task generation works, Dask cluster distributes work.

**Bei Fehler:** Check Dask cluster configured and accessible, verify task_runner specified, ensure branching returns valid task IDs, check for resource contention with parallel tasks, verify conditional logic correctness.

### Schritt 5: Integrieren Monitoring and Alerting

Hinzufuegen comprehensive monitoring and failure notifications.

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

Airflow monitoring with sensors:

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

**Erwartet:** Slack/email notifications sent on failures, SLA violations trigger alerts, custom metrics tracked, logs aggregated in monitoring system.

**Bei Fehler:** Verifizieren Slack webhook configured korrekt, check email SMTP settings, ensure notification blocks loaded ordnungsgemaess, verify SLA values reasonable, check for network issues blocking notifications.

### Schritt 6: Implementieren CI/CD for Pipelines

Version control and automate pipeline deployments.

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

**Erwartet:** Pipeline tests pass vor deployment, automated deployment to production, team notified on successful deployment, pipeline versioning tracked in Git.

**Bei Fehler:** Check test coverage and failures, verify Prefect Cloud Zugangsdaten, ensure deployment script handles errors, check Slack webhook configuration, inspect CI logs for deployment errors.

## Validierung

- [ ] Orchestration framework installed and running
- [ ] Pipeline DAG defined with correct Abhaengigkeiten
- [ ] All tasks execute in proper order
- [ ] Retry logic functions korrekt on failures
- [ ] Scheduled runs execute on time
- [ ] MLflow integration logs experiments
- [ ] DVC integration versions data
- [ ] Parallel tasks execute conderzeit
- [ ] Conditional branches work korrekt
- [ ] Monitoring and alerting functional
- [ ] CI/CD pipeline deploys automatisch
- [ ] Pipeline reproducible across environments

## Haeufige Stolperfallen

- **Circular Abhaengigkeiten**: Task A depends on B, B depends on A - carefully design DAG structure, use Airflow/Prefect validators
- **Memory leaks**: Long-running tasks accumulate memory - set task timeouts, monitor resource usage, restart workers periodically
- **XCom size limits**: Passing large data via XCom - use Dateipfads or external storage (S3) stattdessen of direct serialization
- **Timezone confusion**: Planen runs at wrong times - always use UTC, explicitly set timezone in schedule
- **Missing retries**: Tasks fail permanently on transient errors - configure retries with exponential backoff
- **Tight coupling**: Tasks directly depend on implementation details - use clear interfaces, pass parameters explicitly
- **No idempotency**: Re-running tasks causes duplicates or errors - design tasks to be idempotent (safe to retry)
- **Poor Fehlerbehandlung**: Failures don't provide useful context - add detailed logging, capture exceptions ordnungsgemaess
- **Resource contention**: Parallel tasks overwhelm resources - limit concurrency, set resource quotas
- **Version conflicts**: Different tasks need incompatible Abhaengigkeiten - use Docker containers for task isolation

## Verwandte Skills

- `track-ml-experiments` - Integrieren MLflow tracking into pipeline tasks
- `version-ml-data` - Use DVC for data versioning in pipelines
- `build-feature-store` - Materialize features as pipeline task
- `deploy-ml-model-serving` - Hinzufuegen deployment as final pipeline stage
- `deploy-to-kubernetes` - Ausfuehren orchestrated pipelines on Kubernetes
