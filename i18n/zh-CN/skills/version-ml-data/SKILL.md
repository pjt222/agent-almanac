---
name: version-ml-data
description: >
  Version machine learning datasets using DVC (Data Version Control) with remote
  storage backends, build reproducible data pipelines with dependency tracking,
  integrate with Git workflows, and ensure data lineage for model reproducibility.
  Use when versioning large datasets that do not fit in Git, tracking data changes
  alongside code changes, ensuring ML experiment reproducibility, sharing datasets
  across team members, or auditing data lineage for compliance requirements.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mlops
  complexity: intermediate
  language: multi
  tags: dvc, data-versioning, reproducibility, remote-storage, pipelines
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Version ML Data


> See [Extended Examples](references/EXAMPLES.md) for complete configuration files and templates.

Implement data version control for machine learning datasets to ensure reproducibility and track data lineage.

## 适用场景

- Versioning large datasets that don't fit in Git
- Tracking data changes alongside code changes
- Ensuring reproducibility of ML experiments
- Building automated data pipelines with dependency tracking
- Sharing datasets across team members
- Rolling back to previous data versions
- Auditing data lineage for compliance
- Managing multiple dataset variants (train/test splits, feature sets)

## 输入

- **必需**: Git repository for metadata tracking
- **必需**: DVC installation (`pip install dvc`)
- **必需**: Raw data files or directories to version
- **可选**: Remote storage backend (S3, Azure Blob, GCS, SSH, local)
- **可选**: Data processing scripts for pipeline automation
- **可选**: CI/CD integration for automated pipeline execution

## 步骤

### 第 1 步：Initialize DVC in Git Repository

Set up DVC for data versioning alongside code versioning.

```bash
# Navigate to project root
cd /path/to/ml-project

# Initialize Git (if not already done)
git init
git add .
git commit -m "Initial commit"

# ... (see EXAMPLES.md for complete implementation)
```

Configure DVC settings:

```bash
# Set analytics opt-out (optional)
dvc config core.analytics false

# Configure autostage (automatically git add .dvc files)
dvc config core.autostage true

# Set default remote name
dvc config core.remote storage

# Commit configuration
git add .dvc/config
git commit -m "Configure DVC settings"
```

**预期结果：** `.dvc/` directory created with config files, `.dvcignore` file present, DVC files tracked by Git, large data files not in Git staging area.

**失败处理：** Verify Git repository initialized (`git status`), check DVC installation (`dvc version`), ensure write permissions in project directory, check for conflicting `.dvc/` directory from previous setup, verify Python environment active.

### 第 2 步：Configure Remote Storage Backend

Set up remote storage for data sharing and backup.

```bash
# AWS S3
dvc remote add -d storage s3://my-dvc-bucket/ml-project
dvc remote modify storage region us-west-2

# Configure credentials (use IAM roles in production)
dvc remote modify storage access_key_id YOUR_ACCESS_KEY
dvc remote modify storage secret_access_key YOUR_SECRET_KEY

# ... (see EXAMPLES.md for complete implementation)
```

Test remote connection:

```bash
# List remote storage contents
dvc remote list storage

# Test write access
echo "test" > test.txt
dvc add test.txt
dvc push
rm test.txt test.txt.dvc .dvc/cache -rf

# Test read access
dvc pull

# Clean up test
rm test.txt test.txt.dvc
git checkout .
```

**预期结果：** Remote storage configured and accessible, credentials stored securely in `.dvc/config.local` (git-ignored), test push/pull succeeds, remote storage shows uploaded cache files.

**失败处理：** Verify cloud credentials (`aws s3 ls` or equivalent CLI), check bucket/container exists and is accessible, ensure IAM permissions for read/write, verify network connectivity to remote, check firewall rules, test SSH key authentication for SSH remotes, verify storage path has write permissions.

### 第 3 步：Version Datasets with DVC

Add datasets to DVC tracking and push to remote storage.

```bash
# Add single file
dvc add data/raw/customers.csv

# Add directory (all files inside)
dvc add data/raw/

# DVC creates .dvc files (metadata)
ls data/raw/
# ... (see EXAMPLES.md for complete implementation)
```

Version management:

```python
# version_dataset.py
import pandas as pd
import subprocess
from datetime import datetime

def version_dataset(data_path, git_message=None):
    """
    Version dataset with DVC and Git.
# ... (see EXAMPLES.md for complete implementation)
```

**预期结果：** `.dvc` metadata files created and committed to Git, original data files git-ignored automatically, `dvc push` uploads data to remote storage, `.dvc/cache` contains data hash, remote storage has cached data files.

**失败处理：** Check DVC remote configured (`dvc remote list`), verify write permissions in data directory, ensure sufficient disk space for cache, check network connectivity for push, verify no special characters in file paths, check for large file warnings from Git.

### 第 4 步：Build Reproducible Data Pipelines

Create DVC pipelines for automated, dependency-tracked data processing.

```yaml
# dvc.yaml - Pipeline definition
stages:
  download_data:
    cmd: python scripts/download_data.py
    deps:
      - scripts/download_data.py
    outs:
      - data/raw/customers.csv
# ... (see EXAMPLES.md for complete implementation)
```

Parameters file:

```yaml
# params.yaml
preprocess:
  feature_engineering: true
  outlier_threshold: 3.0

split:
  test_size: 0.2
  random_state: 42

model:
  algorithm: random_forest
  hyperparameters:
    n_estimators: 100
    max_depth: 10
    min_samples_split: 5
```

Run pipeline:

```bash
# Run entire pipeline
dvc repro

# DVC automatically:
# - Detects which stages need rerun (based on deps/params changes)
# - Executes stages in correct order
# - Caches outputs
# - Tracks metrics
# ... (see EXAMPLES.md for complete implementation)
```

**预期结果：** DVC pipeline executes in correct dependency order, only changed stages rerun, outputs cached efficiently, metrics tracked automatically, Git commits include `dvc.yaml` and `dvc.lock`.

**失败处理：** Check script paths exist and are executable, verify dependencies specified correctly, ensure params.yaml keys match script usage, check for circular dependencies in pipeline, verify output paths writable, inspect script error messages in stderr, check Python environment has required packages.

### 第 5 步：Share and Reproduce Data Versions

Enable team members to reproduce exact data versions.

```bash
# Team member clones repository
git clone https://github.com/team/ml-project.git
cd ml-project

# Install DVC
pip install dvc[s3]  # or appropriate backend

# Configure remote (if not in .dvc/config)
# ... (see EXAMPLES.md for complete implementation)
```

Switch between data versions:

```bash
# View data version history
git log --oneline -- data/raw/customers.csv.dvc

# Checkout previous data version
git checkout abc123 -- data/raw/customers.csv.dvc

# Pull that version's data
dvc checkout
# ... (see EXAMPLES.md for complete implementation)
```

Branching workflow:

```bash
# Create experiment branch
git checkout -b experiment/new-features

# Modify data pipeline
vim scripts/preprocess.py

# Add new features
dvc repro preprocess
# ... (see EXAMPLES.md for complete implementation)
```

**预期结果：** `git clone` + `dvc pull` reproduces exact environment, data versions match across team, experiments isolated in branches, metrics comparable across versions.

**失败处理：** Verify remote access configured correctly, check credentials for new team members, ensure all .dvc files committed to Git, verify `dvc.lock` tracked by Git (pins exact versions), check network bandwidth for large pulls, verify storage backend has all referenced cache files.

### 第 6 步：Integrate with MLflow and CI/CD

Connect DVC data versioning with experiment tracking and automation.

```python
# train_with_mlflow.py
import mlflow
import dvc.api
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score

# Get DVC-tracked data path and version
# ... (see EXAMPLES.md for complete implementation)
```

GitHub Actions CI/CD:

```yaml
# .github/workflows/ml-pipeline.yml
name: ML Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
# ... (see EXAMPLES.md for complete implementation)
```

**预期结果：** MLflow logs DVC data versions with runs, CI/CD automatically pulls data and runs pipeline, metrics validated before deployment, reproducibility enforced by CI.

**失败处理：** Check secrets configured in GitHub repository settings, verify DVC remote accessible from CI runners, ensure Git credentials configured for push, check Python dependencies installed, verify metrics validation logic, inspect CI logs for DVC/MLflow errors.

## 验证清单

- [ ] DVC initialized in Git repository
- [ ] Remote storage configured and accessible
- [ ] Datasets versioned and pushed to remote
- [ ] `.dvc` files committed to Git
- [ ] Large data files git-ignored automatically
- [ ] DVC pipeline executes successfully
- [ ] Team members can reproduce data with `dvc pull`
- [ ] Data versions switchable via Git checkout
- [ ] Metrics tracked across pipeline runs
- [ ] Integration with MLflow working
- [ ] CI/CD pipeline reproduces results

## 常见问题

- **Committing large files to Git**: Forgot to run `dvc add` first - always use DVC for large files (>10MB), check `.gitignore`
- **Missing remote configuration**: `dvc push` fails because no remote - configure remote before sharing, test with `dvc remote list`
- **Lost data versions**: Deleted `.dvc/cache` without pushing - always `dvc push` before cleaning cache
- **Inconsistent environments**: Different Python/package versions - use virtual environments, pin dependencies in `requirements.txt`
- **Broken pipelines**: Changed script without updating `dvc.yaml` - keep pipeline definitions in sync with code
- **Slow pipeline**: Rerunning unchanged stages - DVC caches by default, check `dvc status` to diagnose
- **Merge conflicts**: `.dvc` files conflict during merges - resolve like code conflicts, use `dvc checkout` after resolution
- **Large pull times**: Pulling all data for small experiments - use `dvc pull <specific.dvc>` for selective pulls
- **Credential leaks**: Committing `.dvc/config.local` - keep credentials in `config.local` (git-ignored), not `config`
- **No data lineage**: Not tracking preprocessing steps - use DVC pipelines to track all transformations

## 相关技能

- `track-ml-experiments` - Integrate DVC versions with MLflow experiment tracking
- `orchestrate-ml-pipeline` - Combine DVC pipelines with Airflow/Prefect orchestration
- `build-feature-store` - Version raw data sources for feature engineering
- `serialize-data-formats` - Choose efficient formats for DVC-tracked datasets
- `design-serialization-schema` - Design schemas for versioned data files
