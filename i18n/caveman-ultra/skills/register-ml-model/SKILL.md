---
name: register-ml-model
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Register trained models in MLflow Model Registry w/ ver control, stage
  transitions (Staging, Production, Archived) w/ approval workflows, manage
  lineage w/ metadata + deployment tracking. Use → promote model exp→prod,
  manage multi vers across stages, approval workflow governance, rollback,
  audit compliance.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mlops
  complexity: intermediate
  language: multi
  tags: model-registry, mlflow, staging, production, versioning
---

# Register ML Model


> See [Extended Examples](references/EXAMPLES.md) for complete configuration files and templates.

Impl MLflow Model Registry → systematic model versioning, stage mgmt, deployment governance.

## Use When

- Promote trained model exp → prod
- Manage multi vers across dev stages
- Impl approval workflows → governance
- Track lineage train → deploy
- Rollback to prev vers
- Compare deployed vers → A/B test
- Audit changes → compliance

## In

- **Required**: MLflow tracking server w/ Model Registry enabled
- **Required**: Trained model logged w/ MLflow (from tracking runs)
- **Required**: Model name → registry registration
- **Optional**: Approval workflow (email, Slack, Jira)
- **Optional**: CI/CD pipeline → auto promotion
- **Optional**: Validation metric thresholds

## Do

### Step 1: Configure Backend

Set up MLflow Model Registry w/ DB backend (file-based not rec for prod).

```bash
# Start MLflow server with Model Registry support
mlflow server \
  --backend-store-uri postgresql://user:pass@localhost:5432/mlflow \
  --default-artifact-root s3://mlflow-artifacts/models \
  --host 0.0.0.0 \
  --port 5000
```

Python config:

```python
# model_registry_config.py
import mlflow
from mlflow.tracking import MlflowClient

# Set tracking URI (must support Model Registry)
MLFLOW_TRACKING_URI = "http://mlflow-server.company.com:5000"
mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)

# ... (see EXAMPLES.md for complete implementation)
```

→ Model Registry UI tab in MLflow, `search_registered_models()` returns success (even empty), DB has `registered_models` table.

If err: verify MLflow ≥ 1.2 (Model Registry from 1.2), check DB backend (SQLite not fully supported), `--backend-store-uri` → DB not file://, DB user has CREATE TABLE perms, server logs for migration errs.

### Step 2: Register from Run

Register logged model → Model Registry w/ comprehensive metadata.

```python
# register_model.py
import mlflow
from mlflow.tracking import MlflowClient
from model_registry_config import MLFLOW_TRACKING_URI

mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)
client = MlflowClient()

# ... (see EXAMPLES.md for complete implementation)
```

→ New ver in Registry UI, ver has desc + tags, artifacts accessible via `models:/<model-name>/<version>`, signature + input ex preserved.

If err: verify run_id exists + completed (`client.get_run(run_id)`), check artifact path matches logged (`mlflow.search_runs()`), model logged w/ proper framework flavor (`mlflow.sklearn.log_model` not `mlflow.log_artifact`), no special chars in name (hyphens not underscores), check artifact storage access.

### Step 3: Stage Transitions w/ Validation

Move vers through stages (None → Staging → Production → Archived) w/ validation.

```python
# stage_management.py
import mlflow
from mlflow.tracking import MlflowClient
from datetime import datetime

client = MlflowClient()

class ModelStageManager:
# ... (see EXAMPLES.md for complete implementation)
```

→ Ver stage updates in registry, old vers archived auto, transition timestamps in tags, rollback restores prev prod ver.

If err: check ver exists + in expected stage, verify archive_existing_versions flag (may not archive if only one ver), DB supports concurrent transactions for stage updates, check stage transition locks (one per ver at a time), verify approval workflow.

### Step 4: Aliasing + Refs

Use model aliases for stable deployment refs (MLflow ≥ 2.0).

```python
# model_aliases.py
from mlflow.tracking import MlflowClient

client = MlflowClient()

def set_model_alias(model_name, version, alias):
    """
    Set an alias for a model version (MLflow 2.0+).
# ... (see EXAMPLES.md for complete implementation)
```

→ Aliases in Registry UI, loading by alias works (`models:/name@alias`), updating alias immediately affects new loads, A/B test infra functional.

If err: upgrade MLflow ≥ 2.0 for native alias support, use tag-based fallback older vers, verify alias naming (alphanumeric + hyphens), check alias conflicts (one per ver).

### Step 5: Lineage Tracking

Track full lineage data → deploy w/ comprehensive metadata.

```python
# model_lineage.py
import mlflow
from mlflow.tracking import MlflowClient
import json

client = MlflowClient()

def enrich_model_metadata(model_name, version, lineage_data):
# ... (see EXAMPLES.md for complete implementation)
```

→ Ver tags w/ comprehensive lineage, `get_model_lineage()` returns full history, JSON report has data source, training, deploy info.

If err: verify tag values are strings (convert dicts → JSON), check tag key naming (no spaces/special), lineage captured during train, run_id valid + accessible.

### Step 6: Automate w/ CI/CD

Integrate registration → CI/CD → auto promotion.

```yaml
# .github/workflows/model_promotion.yml
name: Model Promotion Pipeline

on:
  workflow_dispatch:
    inputs:
      model_name:
        description: 'Model name to promote'
# ... (see EXAMPLES.md for complete implementation)
```

Python automation:

```python
# scripts/promote_model.py
import argparse
from stage_management import ModelStageManager

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model-name", required=True)
    parser.add_argument("--version", type=int, required=True)
# ... (see EXAMPLES.md for complete implementation)
```

→ Actions workflow triggers on manual dispatch, validation passes, model promoted to target stage, Slack notif sent, deploy pipeline triggered auto.

If err: check GH secrets for MLFLOW_TRACKING_URI, verify net access GH Actions → MLflow (may need VPN/IP allowlist), validation script has correct thresholds, Slack webhook config, Python script exec perms.

## Check

- [ ] Model Registry accessible + backend configured
- [ ] Models register from training runs
- [ ] Stage transitions work (None → Staging → Production → Archived)
- [ ] Validation enforces quality thresholds
- [ ] Aliases set + resolved
- [ ] Lineage captured comprehensively
- [ ] Rollback restores prev vers
- [ ] CI/CD automates promotions
- [ ] Team notifs work for stage changes
- [ ] Model URIs resolve all stages

## Traps

- **SQLite limits**: Registry needs DB backend (Postgres/MySQL) for prod → file-based = concurrency issues
- **Stage conflicts**: Multi vers same stage = confusion → use `archive_existing_versions=True` auto-archive
- **Missing run linkage**: Register w/o run_id loses lineage → always from runs, not raw files
- **Alias confusion**: Using stages as deploy targets vs aliases → stages = workflow, aliases = deploy refs
- **Validation skipped**: Promote to Prod w/o checks → mandatory validation in CI/CD
- **No rollback plan**: Prod issues w/o rollback → maintain prev Prod ver in Archived stage
- **Tag overload**: Too many unstructured → standardize schema + naming
- **Manual processes**: Human-driven = error-prone + slow → automate w/ CI/CD + approvals
- **Lost artifacts**: Model registered but artifacts deleted → align retention w/ lifecycle

## →

- `track-ml-experiments` — log models to MLflow before register
- `deploy-ml-model-serving` — deploy registered models → serving infra
- `run-ab-test-models` — A/B test using registry aliases
- `orchestrate-ml-pipeline` — automate train + register
- `version-ml-data` — version training data for lineage
