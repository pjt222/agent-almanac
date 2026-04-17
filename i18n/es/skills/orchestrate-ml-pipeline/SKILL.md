---
name: orchestrate-ml-pipeline
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
  locale: es
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# Orchestrate ML Pipeline


> See [Extended Examples](references/EXAMPLES.md) for complete configuration files and templates.

Build and orchestrate end-to-end machine learning pipelines with dependency management, scheduling, and monitoring.

## Cuándo Usar

- Automating multi-step ML workflows from data ingestion to deployment
- Scheduling periodic model retraining on fresh data
- Coordinating distributed data processing and training tasks
- Implementing complex dependencies between ML pipeline stages
- Managing retry logic and failure recovery
- Monitoring pipeline execution and alerting on failures
- Orchestrating feature engineering, training, evaluation, and deployment
- Building reproducible ML workflows across environments

## Entradas

- **Requerido**: ML pipeline components (data ingestion, preprocessing, training, evaluation)
- **Requerido**: Orchestration framework choice (Prefect, Airflow, Kubeflow)
- **Requerido**: Python environment with orchestration library installed
- **Opcional**: Kubernetes cluster for distributed execution
- **Opcional**: MLflow tracking server for experiment logging
- **Opcional**: DVC for data versioning
- **Opcional**: Slack/email for alerting
- **Opcional**: Monitoring infrastructure (Prometheus, Grafana)

## Procedimiento

### Paso 1: Choose and Install Orchestration Framework

Select appropriate framework and set up infrastructure.

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

**Esperado:** Orchestration framework installed, web UI accessible (Prefect at http://localhost:4200, Airflow at http://localhost:8080), database initialized, scheduler running.

**En caso de fallo:** Check port availability (`netstat -tulpn | grep 8080`), verify database connection, ensure Redis running for Celery, check Python version compatibility (Airflow requires ≥3.8), verify Docker daemon for containerized setup, inspect logs for initialization errors.

### Paso 2: Build ML Pipeline with Prefect

Create Prefect flow with tasks for each pipeline stage.

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

Deploy and schedule:

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

**Esperado:** Prefect flow executes all tasks in correct order, task failures trigger retries automatically, successful runs show green in UI, MLflow logs experiments, model registered and deployed.

**En caso de fallo:** Check task dependencies defined correctly, verify MLflow server accessible, ensure data source paths correct, check for circular dependencies, verify task timeout limits, inspect Prefect logs for detailed errors, check resource availability (memory/CPU).

### Paso 3: Build ML Pipeline with Airflow

Create Airflow DAG for production ML workflow.

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

**Esperado:** DAG appears in Airflow UI, scheduled runs execute on time, task failures trigger retries and alerts, XCom passes data between tasks, MLflow integration logs experiments.

**En caso de fallo:** Check DAG file syntax (`python dags/ml_training_dag.py`), verify imports available in Airflow environment, ensure XCom not exceeding size limits (use file paths for large data), check email configuration for alerts, verify scheduler running, inspect task logs in Airflow UI.

### Paso 4: Implement Advanced Features

Add dynamic DAGs, branching, and parallel execution.

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

**Esperado:** Parallel tasks execute concurrently (faster pipeline), conditional branches execute based on logic, dynamic task generation works, Dask cluster distributes work.

**En caso de fallo:** Check Dask cluster configured and accessible, verify task_runner specified, ensure branching returns valid task IDs, check for resource contention with parallel tasks, verify conditional logic correctness.

### Paso 5: Integrate Monitoring and Alerting

Add comprehensive monitoring and failure notifications.

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

**Esperado:** Slack/email notifications sent on failures, SLA violations trigger alerts, custom metrics tracked, logs aggregated in monitoring system.

**En caso de fallo:** Verify Slack webhook configured correctly, check email SMTP settings, ensure notification blocks loaded properly, verify SLA values reasonable, check for network issues blocking notifications.

### Paso 6: Implement CI/CD for Pipelines

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

**Esperado:** Pipeline tests pass before deployment, automated deployment to production, team notified on successful deployment, pipeline versioning tracked in Git.

**En caso de fallo:** Check test coverage and failures, verify Prefect Cloud credentials, ensure deployment script handles errors, check Slack webhook configuration, inspect CI logs for deployment errors.

## Validación

- [ ] Orchestration framework installed and running
- [ ] Pipeline DAG defined with correct dependencies
- [ ] All tasks execute in proper order
- [ ] Retry logic functions correctly on failures
- [ ] Scheduled runs execute on time
- [ ] MLflow integration logs experiments
- [ ] DVC integration versions data
- [ ] Parallel tasks execute concurrently
- [ ] Conditional branches work correctly
- [ ] Monitoring and alerting functional
- [ ] CI/CD pipeline deploys automatically
- [ ] Pipeline reproducible across environments

## Errores Comunes

- **Circular dependencies**: Task A depends on B, B depends on A - carefully design DAG structure, use Airflow/Prefect validators
- **Memory leaks**: Long-running tasks accumulate memory - set task timeouts, monitor resource usage, restart workers periodically
- **XCom size limits**: Passing large data via XCom - use file paths or external storage (S3) instead of direct serialization
- **Timezone confusion**: Schedule runs at wrong times - always use UTC, explicitly set timezone in schedule
- **Missing retries**: Tasks fail permanently on transient errors - configure retries with exponential backoff
- **Tight coupling**: Tasks directly depend on implementation details - use clear interfaces, pass parameters explicitly
- **No idempotency**: Re-running tasks causes duplicates or errors - design tasks to be idempotent (safe to retry)
- **Poor error handling**: Failures don't provide useful context - add detailed logging, capture exceptions properly
- **Resource contention**: Parallel tasks overwhelm resources - limit concurrency, set resource quotas
- **Version conflicts**: Different tasks need incompatible dependencies - use Docker containers for task isolation

## Habilidades Relacionadas

- `track-ml-experiments` - Integrate MLflow tracking into pipeline tasks
- `version-ml-data` - Use DVC for data versioning in pipelines
- `build-feature-store` - Materialize features as pipeline task
- `deploy-ml-model-serving` - Add deployment as final pipeline stage
- `deploy-to-kubernetes` - Run orchestrated pipelines on Kubernetes
