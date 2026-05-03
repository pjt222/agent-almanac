---
name: track-ml-experiments
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Set up MLflow tracking server for experiment mgmt, config autologging
  for popular ML frameworks, cmp runs w/ metrics + viz, manage artifacts
  in remote storage backends for reproducible ML workflows. Use → start
  new ML proj needing experiment tracking, migrate from manual logs to
  automated, cmp multi training runs systematically, build reproducible
  ML w/ full lineage tracking.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mlops
  complexity: intermediate
  language: multi
  tags: mlflow, experiment-tracking, autologging, artifacts, metrics
---

# Track ML Experiments


> See [Extended Examples](references/EXAMPLES.md) for complete configuration files and templates.

Set up MLflow tracking server + impl comprehensive experiment tracking w/ metrics, params, artifacts.

## Use When

- Start new ML proj needing experiment tracking
- Migrate from manual logs → automated
- Cmp multi training runs systematically
- Share experiment results w/ team
- Build reproducible ML workflows w/ full lineage
- Integrate experiment tracking into CI/CD

## In

- **Required**: Python env w/ ML framework (sklearn, pytorch, tensorflow, xgboost)
- **Required**: MLflow install (`pip install mlflow`)
- **Optional**: Remote storage backend (S3, Azure Blob, GCS) for artifacts
- **Optional**: DB backend (PostgreSQL, MySQL) for metadata
- **Optional**: Auth creds for remote backends

## Do

### Step 1: Init MLflow Tracking Server

Setup w/ appropriate backend stores.

```bash
# Option 1: Local file-based tracking (development)
mkdir -p mlruns
export MLFLOW_TRACKING_URI="file:./mlruns"

# Option 2: SQLite backend with local artifacts
mlflow server \
  --backend-store-uri sqlite:///mlflow.db \
  --default-artifact-root ./mlartifacts \
# ... (see EXAMPLES.md for complete implementation)
```

Create config file for team sharing:

```python
# mlflow_config.py
import os

MLFLOW_TRACKING_URI = os.getenv(
    "MLFLOW_TRACKING_URI",
    "http://mlflow-server.company.com:5000"
)

# ... (see EXAMPLES.md for complete implementation)
```

**Got:** MLflow UI accessible at host:port, empty experiments list. Server logs confirm startup w/o errors.

**If err:** Check port avail w/ `netstat -tulpn | grep 5000`, verify DB connection strings, ensure S3 creds configured (`aws configure`), check firewall for remote.

### Step 2: Configure Autologging for ML Frameworks

Enable framework-specific autologging → capture metrics, params, models auto.

```python
# training_script.py
import mlflow
from mlflow_config import MLFLOW_TRACKING_URI, MLFLOW_EXPERIMENT_NAME

# Set tracking URI
mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)
mlflow.set_experiment(MLFLOW_EXPERIMENT_NAME)

# ... (see EXAMPLES.md for complete implementation)
```

For PyTorch:

```python
import mlflow.pytorch

mlflow.pytorch.autolog(
    log_every_n_epoch=1,
    log_every_n_step=None,
    log_models=True,
    disable=False,
    exclusive=False,
# ... (see EXAMPLES.md for complete implementation)
```

**Got:** Run appears in UI w/ all hyperparams, metrics (training/val loss, acc), model artifacts, input examples auto-logged.

**If err:** Verify MLflow ver compat w/ ML framework (`mlflow.sklearn.autolog()` needs MLflow ≥1.20), check autolog supported for model type, disable + use manual logging fallback, inspect logs w/ `mlflow.set_tracking_uri()` for connection errs.

### Step 3: Comprehensive Manual Logging

Add custom metrics, params, artifacts, tags for complete documentation.

```python
# comprehensive_tracking.py
import mlflow
import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path

def train_and_log_model(params, X_train, y_train, X_test, y_test):
    """
# ... (see EXAMPLES.md for complete implementation)
```

**Got:** UI displays rich info: step-by-step metrics, viz artifacts, model signature, input examples, comprehensive tags for filter/search.

**If err:** Check artifact storage perms (`aws s3 ls s3://bucket/path`), verify matplotlib backend for figure logging (`plt.switch_backend('Agg')`), ensure JSON-serializable for log_dict, check disk space for local.

### Step 4: Compare Runs + Generate Reports

Use MLflow comparison tools to analyze multiple experiments.

```python
# compare_runs.py
import mlflow
from mlflow.tracking import MlflowClient

client = MlflowClient()

def compare_experiments(experiment_name, metric_name="test_accuracy", top_n=5):
    """
# ... (see EXAMPLES.md for complete implementation)
```

CLI comparison:

```bash
# Compare runs using MLflow CLI
mlflow runs compare --experiment-name customer-churn \
  --order-by "metrics.test_accuracy DESC" \
  --max-results 10

# Export run data to CSV
mlflow experiments csv --experiment-name customer-churn \
  --output experiments.csv
```

**Got:** Console shows sorted runs w/ key metrics, HTML report w/ formatted comparison, CSV w/ all run data.

**If err:** Verify experiment exists w/ `mlflow experiments list`, check metric names match exact (case-sensitive), ensure runs completed (check status), verify file write perms for outputs.

### Step 5: Configure Remote Artifact Storage

Setup S3/Azure/GCS backends for scalable artifact mgmt.

```python
# artifact_storage_config.py
import mlflow
import os

def configure_s3_backend():
    """
    Configure S3 for artifact storage.
    """
# ... (see EXAMPLES.md for complete implementation)
```

Docker Compose for MLflow w/ PostgreSQL + S3:

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: mlflow
# ... (see EXAMPLES.md for complete implementation)
```

**Got:** Artifacts upload to remote, UI shows artifact links pointing to S3/Azure/GCS URIs, downloading from UI works.

**If err:** Verify cloud creds w/ `aws s3 ls` | `az storage blob list`, check bucket perms (write access), ensure MLflow w/ cloud extras (`pip install mlflow[extras]`), test net connectivity to storage, check CORS for browser access.

### Step 6: Experiment Lifecycle Mgmt

Setup automated cleanup, archival, organization policies.

```python
# lifecycle_management.py
import mlflow
from mlflow.tracking import MlflowClient
from datetime import datetime, timedelta

client = MlflowClient()

def archive_old_experiments(days_old=90):
# ... (see EXAMPLES.md for complete implementation)
```

**Got:** Old experiments → deleted state, failed runs removed from active, best runs tagged for filter, storage reclaimed.

**If err:** Check experiment perms (must be owner to delete), verify runs actually FAILED status, ensure metric exists for all ranked, check DB connectivity for bulk ops, verify perms for artifact deletion in remote.

## Check

- [ ] MLflow tracking server accessible via web UI
- [ ] Experiments created + runs logged
- [ ] Autologging captures framework-specific metrics auto
- [ ] Custom metrics, params, artifacts logged correct
- [ ] Comparison queries return expected top runs
- [ ] Remote artifact storage configured + functional
- [ ] Artifacts downloadable from UI + programmatic
- [ ] Run filtering + searching works w/ tags
- [ ] HTML comparison reports gen w/o errs
- [ ] Lifecycle scripts execute

## Traps

- **Connection timeouts**: Server not accessible from training scripts → verify `MLFLOW_TRACKING_URI` env, check firewall, ensure server running
- **Artifact upload fails**: S3/Azure creds not configured | bucket missing → test cloud CLI first, verify bucket perms
- **Missing metrics**: Autologging disabled | unsupported framework ver → check compat, fallback to manual logging
- **Run clutter**: Too many runs polluting UI → impl tagging strategy early, use lifecycle scripts regularly
- **Large artifacts**: Logging entire datasets → storage bloat. Log samples | refs, use external data versioning (DVC)
- **Inconsistent naming**: Params logged w/ diff names across runs → standardize naming in config
- **DB locks**: SQLite no concurrent writes → use PostgreSQL/MySQL for multi-user
- **Autolog conflicts**: Multiple autolog configs interfere → use `exclusive=True` | disable conflicting

## →

- `register-ml-model` — register tracked models in MLflow Model Registry
- `version-ml-data` — version datasets via DVC for reproducible experiments
- `setup-automl-pipeline` — integrate tracking into automated ML pipelines
- `deploy-ml-model-serving` — deploy best-performing tracked models to prod
- `orchestrate-ml-pipeline` — combine tracking w/ workflow orchestration
