---
name: setup-automl-pipeline
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
  locale: ja
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# AutoMLパイプラインの構築


> See [Extended Examples](references/EXAMPLES.md) for complete configuration files and templates.

Automate hyperparameter tuning and model selection using Optuna or Ray Tune with efficient search strategies.

## 使用タイミング

- Starting new ML project and need to quickly find good model configurations
- Retraining existing model with new data and want to re-optimize hyperparameters
- Comparing multiple algorithms and their optimal configurations
- Limited time for manual tuning but need near-optimal performance
- Team lacks deep expertise in specific algorithm hyperparameters
- Need reproducible and documented optimization process

## 入力

- **必須**: Training dataset with features and labels
- **必須**: Validation dataset for objective evaluation
- **必須**: Model type(s) to optimize (e.g., XGBoost, LightGBM, neural network)
- **必須**: Optimization objective (metric to maximize/minimize)
- **必須**: Compute budget (time or number of trials)
- **任意**: Search space constraints (min/max values for hyperparameters)
- **任意**: Prior knowledge of good hyperparameter ranges

## 手順

### ステップ1: Install Dependencies and Set Up Environment

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

Create project structure:

```bash
mkdir -p automl/{configs,experiments,models,results}
```

**期待結果:** Clean environment with required packages installed, no dependency conflicts.

**失敗時:** Use Python 3.8-3.11 (compatibility issues with 3.12+), if CUDA errors occur install CPU-only versions first, on M1/M2 Mac use conda instead of pip for scikit-learn.

### ステップ2: Define Search Space and Objective (Optuna)

Create configuration for hyperparameter search.

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

**期待結果:** Search space covers reasonable hyperparameter ranges, objective function runs without errors, pruning stops unpromising trials early.

**失敗時:** If trials crash, reduce search space (e.g., lower max n_estimators), verify data has no NaN/inf values, check memory usage (reduce batch size if OOM), ensure eval_metric matches task type.

### ステップ3: Run Optimization with Advanced Samplers

Execute hyperparameter search with efficient sampling strategies.

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

**期待結果:** Optimization completes with 50-70% of trials pruned early, best parameters found, visualization plots generated showing convergence.

**失敗時:** If no pruning happens, verify objective reports intermediate values correctly, if optimization doesn't improve try different sampler (TPE → CmaES), if crashes with n_jobs>1 use n_jobs=1 for debugging.

### ステップ4: Set Up Ray Tune for Distributed Optimization (Alternative)

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

**期待結果:** Ray Tune runs trials in parallel across CPUs/GPUs, ASHA scheduler stops bad trials early, best configuration found and logged.

**失敗時:** If Ray crashes, start with `ray.init(num_cpus=2, num_gpus=0)` for debugging, reduce concurrent trials if OOM, check that train function doesn't modify shared data, use `tune.report()` not `return` for metrics.

### ステップ5: Track Experiments with MLflow

Integrate with MLflow for experiment tracking and model registry.

```python
# automl/mlflow_tracking.py
import mlflow
import mlflow.xgboost
from mlflow.tracking import MlflowClient
import optuna
from pathlib import Path


# ... (see EXAMPLES.md for complete implementation)
```

**期待結果:** All trials logged to MLflow with parameters and metrics, best model registered in MLflow registry, experiments viewable in MLflow UI.

**失敗時:** Start MLflow UI with `mlflow ui --backend-store-uri file:./automl/mlruns`, check write permissions to mlruns directory, if registration fails verify model registry is configured, ensure model artifact size < 2GB.

### ステップ6: Deploy Best Model and Monitor Performance

Save optimized model and set up monitoring.

```python
# automl/deploy_model.py
import joblib
import json
from pathlib import Path
import optuna
import xgboost as xgb


# ... (see EXAMPLES.md for complete implementation)
```

**期待結果:** Model saved in production-ready format, configuration documented, inference script created for deployment.

**失敗時:** If model file too large (>100MB), consider model compression or feature selection, verify model loads correctly in fresh Python session, test inference script with sample data before deployment.

## バリデーション

- [ ] Optuna/Ray Tune installs without dependency conflicts
- [ ] Search space includes reasonable hyperparameter ranges
- [ ] Objective function runs successfully for single trial
- [ ] Optimization completes 50+ trials within time budget
- [ ] Pruning stops 40-70% of unpromising trials early
- [ ] Best parameters improve over default configuration by >5%
- [ ] Visualizations show convergence (optimization history flattens)
- [ ] MLflow logs all trials with parameters and metrics
- [ ] Final model saved and loads correctly
- [ ] Deployment package includes all necessary files

## よくある落とし穴

- **Overfitting to validation set**: Running 1000s of trials implicitly optimizes for validation set; use holdout test set or time-based split for final evaluation
- **Ignoring feature engineering**: AutoML finds best hyperparameters but doesn't create features; invest in feature engineering first
- **Search space too wide**: Unbounded or very wide ranges waste trials on unrealistic values; use domain knowledge to constrain
- **Not using early stopping**: Training full epochs for every trial is wasteful; enable early stopping in objective function
- **Ignoring compute costs**: 100 trials × 10 minutes = 16 hours; consider compute budget when setting n_trials
- **Categorical features not encoded**: Most algorithms need numeric features; encode categoricals before optimization
- **Imbalanced data**: Default metrics may mislead with class imbalance; use F1, AUC, or custom metrics
- **Not saving intermediate results**: Crashes lose all progress; use persistent storage (Optuna SQLite, MLflow) to resume

## 関連スキル

- `track-ml-experiments` - MLflow experiment tracking and versioning
- `orchestrate-ml-pipeline` - Airflow/Kubeflow for production AutoML pipelines
