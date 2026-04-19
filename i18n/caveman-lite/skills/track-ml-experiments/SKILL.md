---
name: track-ml-experiments
locale: caveman-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Set up MLflow tracking server for experiment management, configure autologging
  for popular ML frameworks, compare runs with metrics and visualizations, and
  manage artifacts in remote storage backends for reproducible machine learning workflows.
  Use when starting a new ML project that requires experiment tracking, migrating from
  manual logs to automated tracking, comparing multiple training runs systematically, or
  building reproducible ML workflows with full lineage tracking.
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

Set up MLflow tracking server and implement comprehensive experiment tracking with metrics, parameters, and artifacts.

## When to Use

- Starting a new machine learning project requiring experiment tracking
- Migrating from manual experiment logs to automated tracking
- Comparing multiple model training runs systematically
- Sharing experiment results with team members
- Building reproducible ML workflows with full lineage tracking
- Integrating experiment tracking into CI/CD pipelines

## Inputs

- **Required**: Python environment with ML framework (sklearn, pytorch, tensorflow, xgboost)
- **Required**: MLflow installation (`pip install mlflow`)
- **Optional**: Remote storage backend (S3, Azure Blob, GCS) for artifacts
- **Optional**: Database backend (PostgreSQL, MySQL) for metadata storage
- **Optional**: Authentication credentials for remote backends

## Procedure

### Step 1: Initialize MLflow Tracking Server

Set up the MLflow tracking server with appropriate backend stores.

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

Create a configuration file for team sharing:

```python
# mlflow_config.py
import os

MLFLOW_TRACKING_URI = os.getenv(
    "MLFLOW_TRACKING_URI",
    "http://mlflow-server.company.com:5000"
)

# ... (see EXAMPLES.md for complete implementation)
```

**Expected:** MLflow UI accessible at specified host:port, showing empty experiments list. Server logs confirm successful startup without errors.

**On failure:** Check port availability with `netstat -tulpn | grep 5000`, verify database connection strings, ensure S3 credentials are configured (`aws configure`), check firewall rules for remote access.

### Step 2: Configure Autologging for ML Frameworks

Enable framework-specific autologging to capture metrics, parameters, and models automatically.

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

**Expected:** Run appears in MLflow UI with all hyperparameters, metrics (training/validation loss, accuracy), model artifacts, and input examples automatically logged.

**On failure:** Verify MLflow version compatibility with ML framework (`mlflow.sklearn.autolog()` requires MLflow ≥1.20), check if autologging is supported for your model type, disable autologging and use manual logging as fallback, inspect logs with `mlflow.set_tracking_uri()` for connection errors.

### Step 3: Implement Comprehensive Manual Logging

Add custom metrics, parameters, artifacts, and tags for complete experiment documentation.

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

**Expected:** MLflow UI displays rich experiment information including step-by-step metrics, visualization artifacts, model signature, input examples, and comprehensive tags for filtering and searching.

**On failure:** Check artifact storage permissions (`aws s3 ls s3://bucket/path`), verify matplotlib backend for figure logging (`plt.switch_backend('Agg')`), ensure JSON-serializable data types for log_dict, check disk space for local artifact storage.

### Step 4: Compare Runs and Generate Reports

Use MLflow's comparison tools to analyze multiple experiments.

```python
# compare_runs.py
import mlflow
from mlflow.tracking import MlflowClient

client = MlflowClient()

def compare_experiments(experiment_name, metric_name="test_accuracy", top_n=5):
    """
# ... (see EXAMPLES.md for complete implementation)
```

Command-line comparison:

```bash
# Compare runs using MLflow CLI
mlflow runs compare --experiment-name customer-churn \
  --order-by "metrics.test_accuracy DESC" \
  --max-results 10

# Export run data to CSV
mlflow experiments csv --experiment-name customer-churn \
  --output experiments.csv
```

**Expected:** Console output shows sorted runs with key metrics, HTML report generated with formatted comparison table, CSV file contains all run data for further analysis.

**On failure:** Verify experiment exists with `mlflow experiments list`, check metric names match exactly (case-sensitive), ensure runs have completed successfully (check run status), verify file write permissions for output files.

### Step 5: Configure Remote Artifact Storage

Set up S3/Azure/GCS backends for scalable artifact management.

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

Docker Compose for MLflow with PostgreSQL and S3:

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

**Expected:** Artifacts upload successfully to remote storage, MLflow UI shows artifact links pointing to S3/Azure/GCS URIs, downloading artifacts from UI works correctly.

**On failure:** Verify cloud credentials with `aws s3 ls` or `az storage blob list`, check bucket/container permissions (need write access), ensure MLflow installed with cloud extras (`pip install mlflow[extras]`), test network connectivity to storage endpoints, check CORS settings for browser access.

### Step 6: Implement Experiment Lifecycle Management

Set up automated cleanup, archival, and organization policies.

```python
# lifecycle_management.py
import mlflow
from mlflow.tracking import MlflowClient
from datetime import datetime, timedelta

client = MlflowClient()

def archive_old_experiments(days_old=90):
# ... (see EXAMPLES.md for complete implementation)
```

**Expected:** Old experiments moved to deleted state, failed runs removed from active list, best runs tagged for easy filtering in UI, storage space reclaimed.

**On failure:** Check experiment permissions (must be owner to delete), verify runs are actually in FAILED status, ensure metric exists for all runs being ranked, check database connectivity for bulk operations, verify sufficient permissions for artifact deletion in remote storage.

## Validation

- [ ] MLflow tracking server accessible via web UI
- [ ] Experiments created and runs logged successfully
- [ ] Autologging captures framework-specific metrics automatically
- [ ] Custom metrics, parameters, and artifacts logged correctly
- [ ] Comparison queries return expected top runs
- [ ] Remote artifact storage configured and functional
- [ ] Artifacts downloadable from UI and programmatically
- [ ] Run filtering and searching works with tags
- [ ] HTML comparison reports generated without errors
- [ ] Lifecycle management scripts execute successfully

## Common Pitfalls

- **Connection timeouts**: MLflow server not accessible from training scripts - verify `MLFLOW_TRACKING_URI` environment variable, check firewall rules, ensure server is running
- **Artifact upload failures**: S3/Azure credentials not configured or bucket doesn't exist - test cloud CLI access first, verify bucket permissions
- **Missing metrics**: Autologging disabled or unsupported framework version - check MLflow version compatibility, fall back to manual logging
- **Run clutter**: Too many experimental runs polluting UI - implement tagging strategy early, use lifecycle management scripts regularly
- **Large artifacts**: Logging entire datasets causes storage bloat - log only samples or references, use external data versioning (DVC)
- **Inconsistent naming**: Parameters logged with different names across runs - standardize naming conventions in config file
- **Database locks**: SQLite doesn't support concurrent writes - use PostgreSQL/MySQL for multi-user environments
- **Autolog conflicts**: Multiple autolog configurations interfere - use `exclusive=True` or disable conflicting autologs

## Related Skills

- `register-ml-model` - Register tracked models in MLflow Model Registry
- `version-ml-data` - Version datasets using DVC for reproducible experiments
- `setup-automl-pipeline` - Integrate experiment tracking into automated ML pipelines
- `deploy-ml-model-serving` - Deploy best-performing tracked models to production
- `orchestrate-ml-pipeline` - Combine experiment tracking with workflow orchestration
