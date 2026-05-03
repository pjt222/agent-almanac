---
name: setup-automl-pipeline
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Configure automated machine learning pipelines using Optuna or Ray Tune for hyperparameter
  optimization. Implement efficient search strategies (Hyperband, ASHA), define search spaces,
  and set up early stopping to find optimal model configurations with minimal manual tuning.
  Use when starting a new ML project and needing to quickly find good configurations, retraining
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
---

# Setup AutoML Pipeline


> See [Extended Examples](references/EXAMPLES.md) for complete configuration files and templates.

Automate hyperparameter tuning + model selection using Optuna or Ray Tune with efficient search strategies.

## When Use

- Start new ML project, need quickly find good configs
- Retrain existing model with new data, want re-optimize hyperparams
- Compare multiple algorithms + their optimal configs
- Limited time for manual tuning, need near-optimal performance
- Team lacks deep expertise in specific algorithm hyperparams
- Need reproducible + documented optimization process

## Inputs

- **Required**: Training dataset with features + labels
- **Required**: Validation dataset for objective evaluation
- **Required**: Model type(s) to optimize (XGBoost, LightGBM, neural network)
- **Required**: Optimization objective (metric to maximize/minimize)
- **Required**: Compute budget (time or num trials)
- **Optional**: Search space constraints (min/max values for hyperparams)
- **Optional**: Prior knowledge of good hyperparam ranges

## Steps

### Step 1: Install Dependencies and Set Up Environment

Install Optuna or Ray Tune with appropriate backends.

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

Make project structure.

```bash
mkdir -p automl/{configs,experiments,models,results}
```

**Got:** Clean env with required packages installed, no dep conflicts.

**If fail:** Use Python 3.8-3.11 (compat issues with 3.12+). CUDA errors? Install CPU-only versions first. M1/M2 Mac? Use conda not pip for scikit-learn.

### Step 2: Define Search Space and Objective (Optuna)

Make config for hyperparam search.

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

**Got:** Search space covers reasonable hyperparam ranges, objective runs without errors, pruning stops unpromising trials early.

**If fail:** Trials crash? Reduce search space (lower max n_estimators), verify data has no NaN/inf, check memory (reduce batch size if OOM), ensure eval_metric matches task type.

### Step 3: Run Optimization with Advanced Samplers

Execute hyperparam search with efficient sampling strategies.

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

**Got:** Optimization completes with 50-70% trials pruned early, best params found, viz plots generated showing convergence.

**If fail:** No pruning? Verify objective reports intermediate values correct. Optimization not improving? Try different sampler (TPE → CmaES). Crashes with n_jobs>1? Use n_jobs=1 for debugging.

### Step 4: Set Up Ray Tune for Distributed Optimization (Alternative)

Use Ray Tune for multi-GPU or multi-node optimization.

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

**Got:** Ray Tune runs trials in parallel across CPUs/GPUs, ASHA scheduler stops bad trials early, best config found + logged.

**If fail:** Ray crashes? Start with `ray.init(num_cpus=2, num_gpus=0)` for debug, reduce concurrent trials if OOM, check train function does not modify shared data, use `tune.report()` not `return` for metrics.

### Step 5: Track Experiments with MLflow

Integrate with MLflow for experiment tracking + model registry.

```python
# automl/mlflow_tracking.py
import mlflow
import mlflow.xgboost
from mlflow.tracking import MlflowClient
import optuna
from pathlib import Path


# ... (see EXAMPLES.md for complete implementation)
```

**Got:** All trials logged to MLflow with params + metrics, best model registered in MLflow registry, experiments viewable in MLflow UI.

**If fail:** Start MLflow UI with `mlflow ui --backend-store-uri file:./automl/mlruns`. Check write perms to mlruns dir. Registration fails? Verify model registry configured. Ensure model artifact <2GB.

### Step 6: Deploy Best Model and Monitor Performance

Save optimized model + set up monitoring.

```python
# automl/deploy_model.py
import joblib
import json
from pathlib import Path
import optuna
import xgboost as xgb


# ... (see EXAMPLES.md for complete implementation)
```

**Got:** Model saved in prod-ready format, config documented, inference script made for deployment.

**If fail:** Model file too large (>100MB)? Consider model compression or feature selection. Verify model loads correct in fresh Python session. Test inference script with sample data before deployment.

## Checks

- [ ] Optuna/Ray Tune installs without dep conflicts
- [ ] Search space includes reasonable hyperparam ranges
- [ ] Objective function runs successfully for single trial
- [ ] Optimization completes 50+ trials within time budget
- [ ] Pruning stops 40-70% of unpromising trials early
- [ ] Best params improve over default config by >5%
- [ ] Visualizations show convergence (optimization history flattens)
- [ ] MLflow logs all trials with params + metrics
- [ ] Final model saved + loads correct
- [ ] Deployment package includes all necessary files

## Pitfalls

- **Overfit validation set**: Running 1000s of trials implicitly optimizes for validation set; use holdout test set or time-based split for final eval
- **Ignore feature engineering**: AutoML finds best hyperparams but does not create features; invest in feature engineering first
- **Search space too wide**: Unbounded or very wide ranges waste trials on unrealistic values; use domain knowledge to constrain
- **Not use early stopping**: Training full epochs for every trial wasteful; enable early stopping in objective
- **Ignore compute costs**: 100 trials × 10 min = 16 hours; consider compute budget when setting n_trials
- **Categorical features not encoded**: Most algorithms need numeric features; encode categoricals before optimization
- **Imbalanced data**: Default metrics may mislead with class imbalance; use F1, AUC, or custom metrics
- **Not save intermediate results**: Crashes lose all progress; use persistent storage (Optuna SQLite, MLflow) to resume

## See Also

- `track-ml-experiments` - MLflow experiment tracking + versioning
- `orchestrate-ml-pipeline` - Airflow/Kubeflow for production AutoML pipelines
