---
name: setup-automl-pipeline
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Configure AutoML pipelines via Optuna|Ray Tune for hyperparam opt. Efficient search (Hyperband, ASHA), search spaces, early stopping → find optimal w/ min manual tune. Use → new ML project find configs fast, retrain w/ new data + re-opt hyperparams, compare algos, team lacks deep hyperparam expertise.
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


> See [Extended Examples](references/EXAMPLES.md) for complete config + templates.

Automate hyperparam tune + model selection → Optuna|Ray Tune w/ efficient search.

## Use When

- New ML project → find good configs fast
- Retrain w/ new data → re-opt hyperparams
- Compare algos + their optimal configs
- Limited tune time but need near-optimal
- Team lacks deep hyperparam expertise
- Need reproducible documented opt

## In

- **Required**: Train data (features + labels)
- **Required**: Val data → objective eval
- **Required**: Model type(s) (XGBoost, LightGBM, NN)
- **Required**: Opt objective (max|min metric)
- **Required**: Compute budget (time|trial count)
- **Optional**: Search space constraints (min|max)
- **Optional**: Prior knowledge of good ranges

## Do

### Step 1: Install Deps + Env

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

Project structure:

```bash
mkdir -p automl/{configs,experiments,models,results}
```

→ Clean env w/ pkgs installed, no conflicts.

If err: Py 3.8-3.11 (compat issues 3.12+); CUDA errs → install CPU-only first; M1|M2 → conda not pip for sklearn.

### Step 2: Search Space + Objective (Optuna)

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

→ Search space covers reasonable ranges, objective runs w/o errs, pruning stops unpromising early.

If err: trials crash → ↓search space (lower max n_estimators); verify no NaN|inf; check mem (↓batch if OOM); eval_metric matches task.

### Step 3: Run Opt w/ Advanced Samplers

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

→ Opt completes w/ 50-70% trials pruned, best params found, viz plots show convergence.

If err: no pruning → verify objective reports intermediate vals; no improvement → try diff sampler (TPE→CmaES); n_jobs>1 crashes → n_jobs=1 for debug.

### Step 4: Ray Tune Distributed (Alternative)

Multi-GPU|node opt.

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

→ Trials parallel CPUs|GPUs, ASHA stops bad early, best config logged.

If err: Ray crashes → start `ray.init(num_cpus=2, num_gpus=0)` for debug; ↓concurrent if OOM; train fn doesn't modify shared data; use `tune.report()` not `return`.

### Step 5: Track w/ MLflow

```python
# automl/mlflow_tracking.py
import mlflow
import mlflow.xgboost
from mlflow.tracking import MlflowClient
import optuna
from pathlib import Path


# ... (see EXAMPLES.md for complete implementation)
```

→ All trials logged w/ params+metrics, best registered, viewable in MLflow UI.

If err: start `mlflow ui --backend-store-uri file:./automl/mlruns`; check write perms mlruns; reg fails → verify registry config; artifact <2GB.

### Step 6: Deploy Best + Monitor

```python
# automl/deploy_model.py
import joblib
import json
from pathlib import Path
import optuna
import xgboost as xgb


# ... (see EXAMPLES.md for complete implementation)
```

→ Model saved prod-ready, config documented, inference script ready.

If err: file >100MB → compress|feature select; verify loads in fresh Py session; test inference w/ sample pre-deploy.

## Check

- [ ] Optuna|Ray Tune installs no conflicts
- [ ] Search space reasonable
- [ ] Objective runs single trial OK
- [ ] Opt completes 50+ trials in budget
- [ ] Pruning stops 40-70% unpromising
- [ ] Best params improve >5% over default
- [ ] Viz shows convergence (history flattens)
- [ ] MLflow logs all w/ params+metrics
- [ ] Final model saves+loads
- [ ] Deploy pkg has all needed files

## Traps

- **Overfit to val**: 1000s trials implicitly optimizes for val; use holdout test|time-split for final eval
- **Ignore feature eng**: AutoML finds best hyperparams but doesn't create features; invest in eng first
- **Search space too wide**: Unbounded|wide ranges waste trials on unrealistic; use domain knowledge
- **No early stopping**: Training full epochs every trial wasteful; enable in objective
- **Ignore compute cost**: 100 trials × 10 min = 16h; consider budget when setting n_trials
- **Categoricals not encoded**: Most algos need numeric; encode pre-opt
- **Imbalanced data**: Default metrics mislead; use F1, AUC, custom
- **No save intermediate**: Crashes lose all; persistent storage (Optuna SQLite, MLflow) to resume

## →

- `track-ml-experiments` — MLflow tracking + versioning
- `orchestrate-ml-pipeline` — Airflow|Kubeflow for prod AutoML
