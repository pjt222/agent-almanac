---
name: setup-automl-pipeline
locale: wenyan-ultra
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

# 設 AutoML 管

> 全配與板見 [Extended Examples](references/EXAMPLES.md)。

用 Optuna 或 Ray Tune 自超參優含 Hyperband、ASHA 之效搜策。

## 用

- 始新 ML 項速找佳配→用
- 重訓既模新資再優超參→用
- 較諸算與其優配→用
- 手調時限求近優性→用
- 組缺深知於特算超參→用
- 需可重文錄優程→用

## 入

- **必**：訓資（特、標）
- **必**：驗資為旨評
- **必**：所優模型（如 XGBoost、LightGBM、神網）
- **必**：優旨（最大/小指）
- **必**：算預（時或試數）
- **可**：搜空限（超參最小/大）
- **可**：佳超參範前知

## 行

### 一：裝依與設境

裝 Optuna 或 Ray Tune 含宜後端。

```bash
python -m venv venv
source venv/bin/activate

# Option 1: Optuna
pip install optuna optuna-dashboard
pip install scikit-learn xgboost lightgbm

# Option 2: Ray Tune
pip install "ray[tune]" optuna hyperopt bayesian-optimization
pip install torch torchvision

pip install mlflow tensorboard plotly
```

建項結構：

```bash
mkdir -p automl/{configs,experiments,models,results}
```

得：清境含諸需包裝、無依衝。

敗：用 Python 3.8-3.11（3.12+ 相容問題）、CUDA 誤先裝 CPU 唯本、M1/M2 Mac 用 conda 代 pip 為 scikit-learn。

### 二：定搜空與旨（Optuna）

建超參搜配。

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

得：搜空覆合理超參範、旨函行無誤、剪止無望試早。

敗：試崩→縮搜空（如降最大 n_estimators）、驗資無 NaN/inf、察記憶（OOM 降批大）、確 eval_metric 合務型。

### 三：行優含進採

行超參搜含效採策。

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

得：優成、50-70% 試早剪、最佳參得、收斂繪。

敗：無剪→驗旨報中值正、優不進→試異採（TPE → CmaES）、n_jobs > 1 崩→除錯用 n_jobs = 1。

### 四：設 Ray Tune 為散優（替）

Ray Tune 為多 GPU 或多節優。

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

得：Ray Tune 跨 CPU/GPU 並試、ASHA 早止劣試、最佳配得錄。

敗：Ray 崩→除錯始 `ray.init(num_cpus=2, num_gpus=0)`、OOM 減並試、確訓函不改共資、用 `tune.report()` 非 `return` 為指。

### 五：以 MLflow 追驗

接 MLflow 為驗追與模譜。

```python
# automl/mlflow_tracking.py
import mlflow
import mlflow.xgboost
from mlflow.tracking import MlflowClient
import optuna
from pathlib import Path


# ... (see EXAMPLES.md for complete implementation)
```

得：諸試錄 MLflow 含參與指、最佳模註於 MLflow 譜、驗於 MLflow UI 可見。

敗：啟 MLflow UI `mlflow ui --backend-store-uri file:./automl/mlruns`、察 mlruns 寫權、註敗驗譜配、確模產 < 2GB。

### 六：釋最佳模察性

存優模設察。

```python
# automl/deploy_model.py
import joblib
import json
from pathlib import Path
import optuna
import xgboost as xgb


# ... (see EXAMPLES.md for complete implementation)
```

得：模存產備式、配文錄、推本建為釋。

敗：模檔太大（> 100MB）→考模壓或特選、驗模於新 Python 會載正、釋前測推本含樣資。

## 驗

- [ ] Optuna/Ray Tune 裝無依衝
- [ ] 搜空含合理超參範
- [ ] 旨函單試成
- [ ] 優於時預內成 ≥ 50 試
- [ ] 剪止 40-70% 無望試早
- [ ] 最佳參較默配進 > 5%
- [ ] 繪示收斂（優史平）
- [ ] MLflow 錄諸試含參指
- [ ] 終模存正載
- [ ] 釋包含諸需檔

## 忌

- **過合驗集**：1000s 試暗優於驗集；用留測集或時分為終評
- **忽特工**：AutoML 找最佳超參而不造特；先投特工
- **搜空過寬**：無界寬範費試於不實值；用域知約
- **不用早止**：諸試訓全 epoch 為費；旨函啟早止
- **忽算費**：100 試 × 10 分 = 16 時；設 n_trials 考算預
- **類特未編**：多算需數特；優前編類
- **不衡資**：默指於不衡可誤；用 F1、AUC 或自指
- **不存中果**：崩失諸進；用持儲（Optuna SQLite、MLflow）以續

## 參

- `track-ml-experiments`
- `orchestrate-ml-pipeline`
