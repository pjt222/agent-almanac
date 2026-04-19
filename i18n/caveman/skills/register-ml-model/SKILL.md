---
name: register-ml-model
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Register trained models in MLflow Model Registry with version control, implement
  stage transitions (Staging, Production, Archived) with approval workflows, and
  manage model lineage with comprehensive metadata and deployment tracking. Use when
  promoting a trained model from experimentation to production, managing multiple model
  versions across development stages, implementing approval workflows for governance,
  rolling back to previous versions, or auditing model changes for compliance.
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

Implement MLflow Model Registry for systematic model versioning, stage management, and deployment governance.

## When to Use

- Promoting a trained model from experimentation to production
- Managing multiple model versions across development stages
- Implementing model approval workflows for governance
- Tracking model lineage from training to deployment
- Rolling back to previous model versions
- Comparing deployed model versions for A/B testing
- Auditing model changes for compliance requirements

## Inputs

- **Required**: MLflow tracking server with Model Registry enabled
- **Required**: Trained model logged with MLflow (from tracking runs)
- **Required**: Model name for registry registration
- **Optional**: Approval workflow integration (email, Slack, Jira)
- **Optional**: CI/CD pipeline for automated promotion
- **Optional**: Model validation metrics thresholds

## Procedure

### Step 1: Configure Model Registry Backend

Set up MLflow Model Registry with database backend (file-based registry not recommended for production).

```bash
# Start MLflow server with Model Registry support
mlflow server \
  --backend-store-uri postgresql://user:pass@localhost:5432/mlflow \
  --default-artifact-root s3://mlflow-artifacts/models \
  --host 0.0.0.0 \
  --port 5000
```

Python configuration:

```python
# model_registry_config.py
import mlflow
from mlflow.tracking import MlflowClient

# Set tracking URI (must support Model Registry)
MLFLOW_TRACKING_URI = "http://mlflow-server.company.com:5000"
mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)

# ... (see EXAMPLES.md for complete implementation)
```

**Expected:** Model Registry UI tab appears in MLflow, `search_registered_models()` returns successfully (even if empty), database contains `registered_models` table.

**On failure:** Verify MLflow version ≥1.2 (Model Registry introduced in 1.2), check database backend (SQLite not fully supported for Model Registry), ensure `--backend-store-uri` points to database (not file://), verify database user has CREATE TABLE permissions, check MLflow server logs for migration errors.

### Step 2: Register Model from Training Run

Register a logged model to the Model Registry with comprehensive metadata.

```python
# register_model.py
import mlflow
from mlflow.tracking import MlflowClient
from model_registry_config import MLFLOW_TRACKING_URI

mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)
client = MlflowClient()

# ... (see EXAMPLES.md for complete implementation)
```

**Expected:** New model version appears in Model Registry UI, version includes description and tags, model artifacts are accessible via `models:/<model-name>/<version>` URI, model signature and input example are preserved.

**On failure:** Verify run_id exists and has completed (`client.get_run(run_id)`), check model artifact path matches logged artifact (`mlflow.search_runs()` to inspect), ensure model was logged with proper framework flavor (`mlflow.sklearn.log_model` not `mlflow.log_artifact`), verify no special characters in model name (use hyphens not underscores), check artifact storage accessibility.

### Step 3: Implement Stage Transitions with Validation

Move model versions through stages (None → Staging → Production → Archived) with validation checks.

```python
# stage_management.py
import mlflow
from mlflow.tracking import MlflowClient
from datetime import datetime

client = MlflowClient()

class ModelStageManager:
# ... (see EXAMPLES.md for complete implementation)
```

**Expected:** Model version stage updates in registry, old versions archived automatically, transition timestamps recorded in tags, rollback restores previous production version.

**On failure:** Check version exists and is in expected stage, verify archive_existing_versions flag behavior (may not archive if only one version), ensure database supports concurrent transactions for stage updates, check for stage transition locks (only one transition per version at a time), verify approval workflow integration.

### Step 4: Implement Model Aliasing and References

Use model aliases for stable deployment references (MLflow ≥2.0).

```python
# model_aliases.py
from mlflow.tracking import MlflowClient

client = MlflowClient()

def set_model_alias(model_name, version, alias):
    """
    Set an alias for a model version (MLflow 2.0+).
# ... (see EXAMPLES.md for complete implementation)
```

**Expected:** Aliases appear in Model Registry UI, loading models by alias works (`models:/name@alias`), updating alias immediately affects new loads, A/B test infrastructure functional.

**On failure:** Upgrade MLflow to ≥2.0 for native alias support, use tag-based fallback for older versions, verify alias naming (alphanumeric and hyphens only), check for alias conflicts (one alias per model version).

### Step 5: Implement Model Lineage Tracking

Track full lineage from data to deployment with comprehensive metadata.

```python
# model_lineage.py
import mlflow
from mlflow.tracking import MlflowClient
import json

client = MlflowClient()

def enrich_model_metadata(model_name, version, lineage_data):
# ... (see EXAMPLES.md for complete implementation)
```

**Expected:** Model version tags include comprehensive lineage information, `get_model_lineage()` returns full history, JSON report contains data source, training details, and deployment info.

**On failure:** Verify tag values are strings (convert dicts to JSON), check tag key naming (no spaces or special chars), ensure lineage data captured during training, verify run_id is valid and accessible.

### Step 6: Automate Registry Operations with CI/CD

Integrate model registration into CI/CD pipelines for automated promotion.

```yaml
# .github/workflows/model_promotion.yml
name: Model Promotion Pipeline
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"

on:
  workflow_dispatch:
    inputs:
      model_name:
        description: 'Model name to promote'
# ... (see EXAMPLES.md for complete implementation)
```

Python automation script:

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

**Expected:** GitHub Actions workflow triggers on manual dispatch, validation tests pass, model promoted to target stage, Slack notification sent, deployment pipeline triggered automatically.

**On failure:** Check GitHub secrets configuration for MLFLOW_TRACKING_URI, verify network access from GitHub Actions to MLflow server (may need VPN or IP allowlist), ensure validation script has correct metric thresholds, check Slack webhook configuration, verify Python script executable permissions.

## Validation

- [ ] Model Registry accessible and backend configured
- [ ] Models register successfully from training runs
- [ ] Stage transitions work (None → Staging → Production → Archived)
- [ ] Validation checks enforce quality thresholds
- [ ] Model aliases set and resolved correctly
- [ ] Lineage metadata captured comprehensively
- [ ] Rollback functionality restores previous versions
- [ ] CI/CD pipeline automates promotions
- [ ] Team notifications working for stage changes
- [ ] Model URIs resolve correctly in all stages

## Common Pitfalls

- **SQLite limitations**: Model Registry requires database backend (PostgreSQL/MySQL) for production - file-based registry causes concurrency issues
- **Stage conflicts**: Multiple versions in same stage cause confusion - use `archive_existing_versions=True` to auto-archive
- **Missing run linkage**: Registering models without run_id loses lineage - always register from MLflow runs, not raw files
- **Alias confusion**: Using stages as deployment targets instead of aliases - stages are for workflow, aliases for deployment references
- **Validation skipped**: Promoting to Production without checks - implement mandatory validation in CI/CD pipeline
- **No rollback plan**: Production issues without rollback capability - maintain previous Production version in Archived stage
- **Tag overload**: Too many unstructured tags - standardize tag schema and naming conventions
- **Manual processes**: Human-driven promotions are error-prone and slow - automate with CI/CD and approval workflows
- **Lost artifacts**: Model registered but artifacts deleted from storage - ensure artifact retention policies align with model lifecycle

## Related Skills

- `track-ml-experiments` - Log models to MLflow before registering them
- `deploy-ml-model-serving` - Deploy registered models to serving infrastructure
- `run-ab-test-models` - A/B test models using registry aliases
- `orchestrate-ml-pipeline` - Automate model training and registration
- `version-ml-data` - Version training data for model lineage
