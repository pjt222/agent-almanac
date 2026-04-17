---
name: version-ml-data
description: >
  Version maschinelles Lernen datasets using DVC (Data Version Control) with remote
  storage backends, build reproducible data pipelines with Abhaengigkeit tracking,
  integrate with Git workflows, and ensure data lineage for model reproducibility.
  Verwenden wenn versioning large datasets that nicht fit in Git, tracking data changes
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
  locale: de
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# ML-Daten versionieren


> See [Extended Examples](references/EXAMPLES.md) for complete configuration files and templates.

Implementieren data version control for maschinelles Lernen datasets to ensure reproducibility and track data lineage.

## Wann verwenden

- Versioning large datasets that don't fit in Git
- Tracking data changes alongside code changes
- Ensuring reproducibility of ML experiments
- Building automated data pipelines with Abhaengigkeit tracking
- Sharing datasets across team members
- Rolling back to previous data versions
- Auditing data lineage for compliance
- Managing multiple dataset variants (train/test splits, feature sets)

## Eingaben

- **Erforderlich**: Git repository for metadata tracking
- **Erforderlich**: DVC installation (`pip install dvc`)
- **Erforderlich**: Raw data files or directories to version
- **Optional**: Remote storage backend (S3, Azure Blob, GCS, SSH, local)
- **Optional**: Data processing scripts for pipeline automation
- **Optional**: CI/CD integration for automated pipeline execution

## Vorgehensweise

### Schritt 1: Initialize DVC in Git Repository

Einrichten DVC for data versioning alongside code versioning.

```bash
# Navigate to project root
cd /path/to/ml-project

# Initialize Git (if not already done)
git init
git add .
git commit -m "Initial commit"

# ... (see EXAMPLES.md for complete implementation)
```

Konfigurieren DVC settings:

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

**Erwartet:** `.dvc/` directory created with config files, `.dvcignore` file present, DVC files tracked by Git, large data files not in Git staging area.

**Bei Fehler:** Verifizieren Git repository initialized (`git status`), check DVC installation (`dvc version`), ensure write Berechtigungs in project directory, check for conflicting `.dvc/` directory from previous setup, verify Python environment active.

### Schritt 2: Konfigurieren Remote Storage Backend

Einrichten remote storage for data sharing and backup.

```bash
# AWS S3
dvc remote add -d storage s3://my-dvc-bucket/ml-project
dvc remote modify storage region us-west-2

# Configure credentials (use IAM roles in production)
dvc remote modify storage access_key_id YOUR_ACCESS_KEY
dvc remote modify storage secret_access_key YOUR_SECRET_KEY

# ... (see EXAMPLES.md for complete implementation)
```

Testen remote connection:

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

**Erwartet:** Remote storage configured and accessible, Zugangsdaten stored securely in `.dvc/config.local` (git-ignored), test push/pull succeeds, remote storage shows uploaded cache files.

**Bei Fehler:** Verifizieren cloud Zugangsdaten (`aws s3 ls` or equivalent CLI), check bucket/container exists and is accessible, ensure IAM Berechtigungs for read/write, verify network connectivity to remote, check firewall rules, test SSH key Authentifizierung for SSH remotes, verify storage path has write Berechtigungs.

### Schritt 3: Version Datasets with DVC

Hinzufuegen datasets to DVC tracking and push to remote storage.

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

**Erwartet:** `.dvc` metadata files created and committed to Git, original data files git-ignored automatisch, `dvc push` uploads data to remote storage, `.dvc/cache` contains data hash, remote storage has cached data files.

**Bei Fehler:** Check DVC remote configured (`dvc remote list`), verify write Berechtigungs in data directory, ensure sufficient disk space for cache, check network connectivity for push, verify no special characters in Dateipfads, check for large file warnings from Git.

### Schritt 4: Erstellen Reproducible Data Pipelines

Erstellen DVC pipelines for automated, Abhaengigkeit-tracked data processing.

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

Ausfuehren pipeline:

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

**Erwartet:** DVC pipeline executes in correct Abhaengigkeit order, only changed stages rerun, outputs cached efficiently, metrics tracked automatisch, Git commits include `dvc.yaml` and `dvc.lock`.

**Bei Fehler:** Check script paths exist and are executable, verify Abhaengigkeiten specified korrekt, ensure params.yaml keys match script usage, check for circular Abhaengigkeiten in pipeline, verify output paths writable, inspect script Fehlermeldungs in stderr, check Python environment has required packages.

### Schritt 5: Teilen and Reproduce Data Versions

Aktivieren team members to reproduce exact data versions.

```bash
# Team member clones repository
git clone https://github.com/team/ml-project.git
cd ml-project

# Install DVC
pip install dvc[s3]  # or appropriate backend

# Configure remote (if not in .dvc/config)
# ... (see EXAMPLES.md for complete implementation)
```

Switch zwischen data versions:

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

**Erwartet:** `git clone` + `dvc pull` reproduces exact environment, data versions match across team, experiments isolated in branches, metrics comparable across versions.

**Bei Fehler:** Verifizieren remote access configured korrekt, check Zugangsdaten for new team members, ensure all .dvc files committed to Git, verify `dvc.lock` tracked by Git (pins exact versions), check network bandwidth for large pulls, verify storage backend has all referenced cache files.

### Schritt 6: Integrieren with MLflow and CI/CD

Verbinden DVC data versioning with experiment tracking and automation.

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

**Erwartet:** MLflow logs DVC data versions with runs, CI/CD automatisch pulls data and runs pipeline, metrics validated vor deployment, reproducibility enforced by CI.

**Bei Fehler:** Check secrets configured in GitHub repository settings, verify DVC remote accessible from CI runners, ensure Git Zugangsdaten configured for push, check Python Abhaengigkeiten installed, verify metrics validation logic, inspect CI logs for DVC/MLflow errors.

## Validierung

- [ ] DVC initialized in Git repository
- [ ] Remote storage configured and accessible
- [ ] Datasets versioned and pushed to remote
- [ ] `.dvc` files committed to Git
- [ ] Large data files git-ignored automatisch
- [ ] DVC pipeline executes erfolgreich
- [ ] Team members can reproduce data with `dvc pull`
- [ ] Data versions switchable via Git checkout
- [ ] Metrics tracked across pipeline runs
- [ ] Integration with MLflow working
- [ ] CI/CD pipeline reproduces results

## Haeufige Stolperfallen

- **Committing large files to Git**: Forgot to run `dvc add` first - always use DVC for large files (>10MB), check `.gitignore`
- **Missing remote configuration**: `dvc push` fails because no remote - configure remote vor sharing, test with `dvc remote list`
- **Lost data versions**: Deleted `.dvc/cache` ohne pushing - always `dvc push` vor cleaning cache
- **Inconsistent environments**: Different Python/package versions - use virtual environments, pin Abhaengigkeiten in `requirements.txt`
- **Broken pipelines**: Changed script ohne updating `dvc.yaml` - keep pipeline definitions in sync with code
- **Slow pipeline**: Rerunning unchanged stages - DVC caches by default, check `dvc status` to diagnose
- **Zusammenfuehren conflicts**: `.dvc` files conflict waehrend merges - resolve like code conflicts, use `dvc checkout` nach resolution
- **Large pull times**: Pulling all data for small experiments - use `dvc pull <specific.dvc>` for selective pulls
- **Credential leaks**: Committing `.dvc/config.local` - keep Zugangsdaten in `config.local` (git-ignored), not `config`
- **No data lineage**: Not tracking preprocessing steps - use DVC pipelines to track all transformations

## Verwandte Skills

- `track-ml-experiments` - Integrieren DVC versions with MLflow experiment tracking
- `orchestrate-ml-pipeline` - Kombinieren DVC pipelines with Airflow/Prefect orchestration
- `build-feature-store` - Version raw Datenquelles for feature engineering
- `serialize-data-formats` - Waehlen efficient formats for DVC-tracked datasets
- `design-serialization-schema` - Entwerfen schemas for versioned data files
