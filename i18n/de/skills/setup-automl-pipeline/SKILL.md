---
name: setup-automl-pipeline
description: >
  Konfigurieren automated maschinelles Lernen pipelines using Optuna or Ray Abstimmen for hyperparameter
  optimization. Implementieren efficient search strategies (Hyperband, ASHA), define search spaces,
  and set up early stopping to find optimal model configurations with minimal manual tuning.
  Verwenden wenn starting a new ML project and needing to quickly find good configurations, retraining
  with new data and re-optimizing hyperparameters, comparing multiple algorithms, or when the
  team lacks deep expertise in specific algorithm hyperparameters.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mlops
  complexity: intermediate
  language: multi
  tags: automl, optuna, ray-tune, hyperparameter, optimization, hyperband, asha
  locale: de
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# AutoML-Pipeline einrichten


> See [Extended Examples](references/EXAMPLES.md) for complete configuration files and templates.

Automate hyperparameter tuning and model selection using Optuna or Ray Abstimmen with efficient search strategies.

## Wann verwenden

- Starting new ML project and need to quickly find good model configurations
- Retraining existing model with new data and want to re-optimize hyperparameters
- Comparing multiple algorithms and their optimal configurations
- Limited time for manual tuning but need near-optimal performance
- Team lacks deep expertise in specific algorithm hyperparameters
- Need reproducible and documented optimization process

## Eingaben

- **Erforderlich**: Training dataset with features and labels
- **Erforderlich**: Validation dataset for objective evaluation
- **Erforderlich**: Modellieren type(s) to optimize (e.g., XGBoost, LightGBM, neural network)
- **Erforderlich**: Optimization objective (metric to maximize/minimize)
- **Erforderlich**: Berechnen budget (time or number of trials)
- **Optional**: Suchen space constraints (min/max values for hyperparameters)
- **Optional**: Prior knowledge of good hyperparameter ranges

## Vorgehensweise

### Schritt 1: Installieren Dependencies and Set Up Environment

Installieren Optuna or Ray Abstimmen with appropriate backends.

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Option 1: Optuna (simpler, good for single-machine)
pip install optuna optuna-dashboard
pip install scikit-learn xgboost lightgbm

# Option 2: Ray Tune (distributed, good for multi-machine/GPU)
pip install "ray[tune]" optuna hyperopt bayesian-optimization
pip install torch torchvision  # if optimizing neural networks

# Visualization and tracking
pip install mlflow tensorboard plotly
```

Erstellen project structure:

```bash
mkdir -p automl/{configs,experiments,models,results}
```

**Erwartet:** Bereinigen environment with required packages installed, no Abhaengigkeit conflicts.

**Bei Fehler:** Use Python 3.8-3.11 (compatibility issues with 3.12+), if CUDA errors occur install CPU-only versions first, on M1/M2 Mac use conda stattdessen of pip for scikit-learn.

### Schritt 2: Definieren Suchen Space and Objective (Optuna)

Erstellen configuration for hyperparameter search.

```python
# automl/optuna_config.py
import optuna
from optuna.pruners import HyperbandPruner
from optuna.samplers import TPESampler
import xgboost as xgb
from sklearn.metrics import roc_auc_score, mean_squared_error
import numpy as np

# ... (see EXAMPLES.md for complete implementation)
```

**Erwartet:** Suchen space covers reasonable hyperparameter ranges, objective function runs ohne errors, pruning stops unpromising trials early.

**Bei Fehler:** If trials crash, reduce search space (e.g., lower max n_estimators), verify data has no NaN/inf values, check memory usage (reduce batch size if OOM), ensure eval_metric matches task type.

### Schritt 3: Ausfuehren Optimization with Advanced Samplers

Ausfuehren hyperparameter search with efficient sampling strategies.

```python
# automl/run_optimization.py
import optuna
from optuna.samplers import TPESampler, CmaEsSampler, NSGAIISampler
from optuna.pruners import HyperbandPruner, MedianPruner, SuccessiveHalvingPruner
import joblib
import pandas as pd
from pathlib import Path

# ... (see EXAMPLES.md for complete implementation)
```

**Erwartet:** Optimization completes with 50-70% of trials pruned early, best parameters found, visualization plots generated showing convergence.

**Bei Fehler:** If no pruning happens, verify objective reports intermediate values korrekt, if optimization doesn't improve try different sampler (TPE → CmaES), if crashes with n_jobs>1 use n_jobs=1 for debugging.

### Schritt 4: Set Up Ray Abstimmen for Distributed Optimization (Alternative)

Use Ray Abstimmen for multi-GPU or multi-node optimization.

```python
# automl/ray_tune_config.py
from ray import tune
from ray.tune.schedulers import ASHAScheduler, PopulationBasedTraining
from ray.tune.search.optuna import OptunaSearch
from ray.tune.search import ConcurrencyLimiter
import xgboost as xgb
from sklearn.metrics import roc_auc_score
import os
# ... (see EXAMPLES.md for complete implementation)
```

**Erwartet:** Ray Abstimmen runs trials in parallel across CPUs/GPUs, ASHA scheduler stops bad trials early, best configuration found and logged.

**Bei Fehler:** If Ray crashes, start with `ray.init(num_cpus=2, num_gpus=0)` for debugging, reduce concurrent trials if OOM, check that train function doesn't modify shared data, use `tune.report()` not `return` for metrics.

### Schritt 5: Verfolgen Experiments with MLflow

Integrieren with MLflow for experiment tracking and model registry.

```python
# automl/mlflow_tracking.py
import mlflow
import mlflow.xgboost
from mlflow.tracking import MlflowClient
import optuna
from pathlib import Path


# ... (see EXAMPLES.md for complete implementation)
```

**Erwartet:** All trials logged to MLflow with parameters and metrics, best model registered in MLflow registry, experiments viewable in MLflow UI.

**Bei Fehler:** Starten MLflow UI with `mlflow ui --backend-store-uri file:./automl/mlruns`, check write Berechtigungs to mlruns directory, if registration fails verify model registry is configured, ensure model artifact size < 2GB.

### Schritt 6: Bereitstellen Best Modellieren and Ueberwachen Performance

Speichern optimized model and set up monitoring.

```python
# automl/deploy_model.py
import joblib
import json
from pathlib import Path
import optuna
import xgboost as xgb


# ... (see EXAMPLES.md for complete implementation)
```

**Erwartet:** Modellieren saved in production-ready format, configuration documented, inference script created for deployment.

**Bei Fehler:** If model file too large (>100MB), consider model compression or feature selection, verify model loads korrekt in fresh Python session, test inference script with sample data vor deployment.

## Validierung

- [ ] Optuna/Ray Abstimmen installs ohne Abhaengigkeit conflicts
- [ ] Suchen space includes reasonable hyperparameter ranges
- [ ] Objective function runs erfolgreich for single trial
- [ ] Optimization completes 50+ trials innerhalb time budget
- [ ] Pruning stops 40-70% of unpromising trials early
- [ ] Best parameters improve over default configuration by >5%
- [ ] Visualizations show convergence (optimization history flattens)
- [ ] MLflow logs all trials with parameters and metrics
- [ ] Final model saved and loads korrekt
- [ ] Deployment package includes all necessary files

## Haeufige Stolperfallen

- **Overfitting to validation set**: Running 1000s of trials implicitly optimizes for validation set; use holdout test set or time-based split for final evaluation
- **Ignoring feature engineering**: AutoML finds best hyperparameters but doesn't create features; invest in feature engineering first
- **Suchen space too wide**: Unbounded or very wide ranges waste trials on unrealistic values; use domain knowledge to constrain
- **Not using early stopping**: Training full epochs for every trial is wasteful; enable early stopping in objective function
- **Ignoring compute costs**: 100 trials × 10 minutes = 16 hours; consider compute budget when setting n_trials
- **Categorical features not encoded**: Most algorithms need numeric features; encode categoricals vor optimization
- **Imbalanced data**: Default metrics may mislead with class imbalance; use F1, AUC, or custom metrics
- **Not saving intermediate results**: Crashes lose all progress; use persistent storage (Optuna SQLite, MLflow) to resume

## Verwandte Skills

- `track-ml-experiments` - MLflow experiment tracking and versioning
- `orchestrate-ml-pipeline` - Airflow/Kubeflow for production AutoML pipelines
