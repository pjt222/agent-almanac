---
name: setup-automl-pipeline
locale: wenyan-lite
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

# 設置 AutoML 管道

> 詳見 [Extended Examples](references/EXAMPLES.md) 取得完整配置文件與範本。

以 Optuna 或 Ray Tune 用高效搜尋策略自動化超參數調校與模型選擇。

## 適用時機

- 新建 ML 項目並需快速找到良好之模型配置
- 以新資料重訓既有模型並欲重新優化超參數
- 比較多個演算法及其最佳配置
- 手動調校時間有限但需近最佳效能
- 團隊缺對特定演算法超參數之深度專業
- 需可重現且有書面記錄之優化過程

## 輸入

- **必要**：含特徵與標籤之訓練資料集
- **必要**：客觀評估之驗證資料集
- **必要**：欲優化之模型類型（如 XGBoost、LightGBM、神經網路）
- **必要**：優化目標（最大化/最小化之指標）
- **必要**：計算預算（時間或試驗數）
- **選擇性**：搜尋空間限制（超參數之最小/最大值）
- **選擇性**：對良好超參數範圍之先驗知識

## 步驟

### 步驟一：安裝依賴並設置環境

以適當之後端安裝 Optuna 或 Ray Tune。

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

建立項目結構：

```bash
mkdir -p automl/{configs,experiments,models,results}
```

**預期：** 乾淨環境含所需套件已安裝、無依賴衝突。

**失敗時：** 用 Python 3.8-3.11（與 3.12+ 相容性問題）；若 CUDA 錯誤先安裝僅 CPU 版本；於 M1/M2 Mac 用 conda 而非 pip 安裝 scikit-learn。

### 步驟二：定義搜尋空間與目標（Optuna）

為超參數搜尋建立配置。

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

**預期：** 搜尋空間涵蓋合理超參數範圍、目標函數無錯執行、修剪及早停止無望試驗。

**失敗時：** 若試驗崩潰，縮小搜尋空間（如降低最大 n_estimators）；驗證資料無 NaN/inf 值；檢查記憶體用量（OOM 時減小批次大小）；確保 eval_metric 符合任務類型。

### 步驟三：以進階取樣器執行優化

以高效取樣策略執行超參數搜尋。

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

**預期：** 優化完成，50-70% 試驗早期被修剪，最佳參數已找到，視覺化圖顯示收斂。

**失敗時：** 若無修剪發生，驗證目標正確報告中間值；若優化未改進，試不同取樣器（TPE → CmaES）；若 n_jobs>1 崩潰，用 n_jobs=1 除錯。

### 步驟四：為分散式優化設置 Ray Tune（替代）

用 Ray Tune 作多 GPU 或多節點優化。

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

**預期：** Ray Tune 跨 CPU/GPU 平行跑試驗，ASHA 排程器及早停止壞試驗，最佳配置已找到並記錄。

**失敗時：** 若 Ray 崩潰，以 `ray.init(num_cpus=2, num_gpus=0)` 起步除錯；OOM 時減少並行試驗；檢查訓練函數不修改共享資料；用 `tune.report()` 而非 `return` 報指標。

### 步驟五：以 MLflow 追蹤實驗

與 MLflow 整合作實驗追蹤與模型註冊。

```python
# automl/mlflow_tracking.py
import mlflow
import mlflow.xgboost
from mlflow.tracking import MlflowClient
import optuna
from pathlib import Path


# ... (see EXAMPLES.md for complete implementation)
```

**預期：** 所有試驗以參數與指標記錄至 MLflow，最佳模型於 MLflow 註冊表中註冊，實驗於 MLflow UI 可見。

**失敗時：** 以 `mlflow ui --backend-store-uri file:./automl/mlruns` 啟 MLflow UI；檢查對 mlruns 目錄之寫入權限；若註冊失敗驗證模型註冊表已配置；確保模型工件大小 < 2GB。

### 步驟六：部署最佳模型並監控效能

儲存優化後之模型並設置監控。

```python
# automl/deploy_model.py
import joblib
import json
from pathlib import Path
import optuna
import xgboost as xgb


# ... (see EXAMPLES.md for complete implementation)
```

**預期：** 模型以生產就緒格式儲存，配置已記錄，部署之推論腳本已建立。

**失敗時：** 若模型文件過大（>100MB），考慮模型壓縮或特徵選擇；驗證模型於新 Python 會話中正確載入；部署前以樣本資料測試推論腳本。

## 驗證

- [ ] Optuna/Ray Tune 安裝無依賴衝突
- [ ] 搜尋空間含合理超參數範圍
- [ ] 目標函數成功執行單一試驗
- [ ] 優化於時間預算內完成 50+ 試驗
- [ ] 修剪及早停止 40-70% 之無望試驗
- [ ] 最佳參數對預設配置改進 >5%
- [ ] 視覺化顯示收斂（優化歷史趨平）
- [ ] MLflow 以參數與指標記錄所有試驗
- [ ] 最終模型已儲存並正確載入
- [ ] 部署套件含所有必要文件

## 常見陷阱

- **過擬合驗證集**：跑數千試驗隱式為驗證集優化；用保留之測試集或基於時間之分割作最終評估
- **忽視特徵工程**：AutoML 找最佳超參數但不創特徵；應先投入特徵工程
- **搜尋空間過寬**：無界或極寬範圍將試驗浪費於不切實際之值；用領域知識限制
- **未用早停**：每試驗訓練完整 epoch 浪費；於目標函數中啟用早停
- **忽視計算成本**：100 試驗 × 10 分鐘 = 16 小時；設 n_trials 時考慮計算預算
- **類別特徵未編碼**：多數演算法需數值特徵；優化前編碼類別
- **不平衡資料**：預設指標可能因類別不平衡誤導；用 F1、AUC 或自訂指標
- **未儲存中間結果**：崩潰失所有進度；用持久儲存（Optuna SQLite、MLflow）以恢復

## 相關技能

- `track-ml-experiments` - MLflow 實驗追蹤與版本化
- `orchestrate-ml-pipeline` - Airflow/Kubeflow 用於生產 AutoML 管道
