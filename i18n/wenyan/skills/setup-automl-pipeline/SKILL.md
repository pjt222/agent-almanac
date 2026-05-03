---
name: setup-automl-pipeline
locale: wenyan
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

# 設 AutoML 管線

> 詳備之配與模板，參 [Extended Examples](references/EXAMPLES.md)。

以 Optuna 或 Ray Tune 自動化超參之優與模擇，附效之搜策。

## 用時

- 新立 ML 項目，欲速得佳模配乃用
- 既模再訓於新數，再優超參乃用
- 比諸算與其優配乃用
- 人手調之時有限而需近優之效乃用
- 團於某算之超參乏深之知乃用
- 需可重之優程乃用

## 入

- **必要**：訓數附特與標
- **必要**：驗數為目標之量
- **必要**：欲優之模類（如 XGBoost、LightGBM、神經網）
- **必要**：優之目（欲大或小之指）
- **必要**：算之預算（時或試之數）
- **可選**：搜空之限（超參之最小最大）
- **可選**：佳超參範之先知

## 法

### 第一步：裝依與設境

裝 Optuna 或 Ray Tune 附宜之底。

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

立項目之構：

```bash
mkdir -p automl/{configs,experiments,models,results}
```

得：境潔，諸需包已裝，無依衝。

敗則：用 Python 3.8-3.11（3.12+ 兼容之患），CUDA 誤先裝 CPU 版，M1/M2 Mac 用 conda 代 pip 為 scikit-learn。

### 第二步：定搜空與目（Optuna）

立超參搜之配。

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

得：搜空覆合理之超參範，目函行而無誤，剪止無望之試於早。

敗則：試崩，縮搜空（如降 max n_estimators），驗數無 NaN/inf，察記憶之用（OOM 則減批），確 eval_metric 合務類。

### 第三步：以高採樣行優

以效採策行超參之搜。

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

得：優畢，50-70% 試早剪，最佳參得，可視之圖示收斂。

敗則：無剪發，驗目報中間值正；優不進試他採（TPE → CmaES）；n_jobs>1 崩用 n_jobs=1 為察。

### 第四步：以 Ray Tune 為分布之優（替）

用 Ray Tune 為多 GPU 或多節之優。

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

得：Ray Tune 跨 CPU/GPU 並行試，ASHA 早止惡試，最佳配得而記。

敗則：Ray 崩，始於 `ray.init(num_cpus=2, num_gpus=0)` 為察；OOM 減並試；確訓函不改共數；用 `tune.report()` 非 `return` 為指。

### 第五步：以 MLflow 跟試

集 MLflow 為試跟與模冊。

```python
# automl/mlflow_tracking.py
import mlflow
import mlflow.xgboost
from mlflow.tracking import MlflowClient
import optuna
from pathlib import Path


# ... (see EXAMPLES.md for complete implementation)
```

得：諸試皆記於 MLflow 附參與指，最佳模註於 MLflow 冊，試於 MLflow UI 可觀。

敗則：以 `mlflow ui --backend-store-uri file:./automl/mlruns` 啟 MLflow UI；察 mlruns 目之寫權；註敗驗模冊已配；確模物 < 2GB。

### 第六步：展最佳模而監效

存優模而設監。

```python
# automl/deploy_model.py
import joblib
import json
from pathlib import Path
import optuna
import xgboost as xgb


# ... (see EXAMPLES.md for complete implementation)
```

得：模存為生產可用之式，配已書，推之本立為展。

敗則：模文件過大（>100MB），考模壓或特擇；驗模於新 Python 會話載正；推本以樣數試於展前。

## 驗

- [ ] Optuna/Ray Tune 裝無依衝
- [ ] 搜空含合理之超參範
- [ ] 目函單試行成
- [ ] 優於時預算內成 50+ 試
- [ ] 剪早止 40-70% 之無望試
- [ ] 最佳參勝默配 >5%
- [ ] 圖示收斂（優史平）
- [ ] MLflow 記諸試附參與指
- [ ] 終模存而載正
- [ ] 展包含諸需文件

## 陷

- **過合驗集**：千試隱優於驗集；用留出之測集或時分為終量
- **忽特工**：AutoML 得最佳超參而不立特；先投特工
- **搜空過寬**：無界或甚寬範費試於不實值；用域知約之
- **不用早止**：每試訓全代費也；於目函啟早止
- **忽算費**：100 試 × 10 分 = 16 時；設 n_trials 時考算預算
- **類特未編**：多算需數特；優前編類
- **不衡之數**：默指於類不衡可誤；用 F1、AUC、或自定指
- **不存中果**：崩失全進；用持存（Optuna SQLite、MLflow）以續

## 參

- `track-ml-experiments` — MLflow 試跟與版
- `orchestrate-ml-pipeline` — Airflow/Kubeflow 為生產 AutoML 管線
