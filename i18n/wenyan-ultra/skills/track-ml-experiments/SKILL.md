---
name: track-ml-experiments
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Set up MLflow tracking server for experiment management, configure autologging
  for popular ML frameworks, compare runs with metrics and visualizations, and
  manage artifacts in remote storage backends for reproducible machine learning workflows.
  Use when starting a new ML project that requires experiment tracking, migrating from
  manual logs to automated tracking, comparing multiple training runs systematically, or
  building reproducible ML workflows with full lineage tracking.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mlops
  complexity: intermediate
  language: multi
  tags: mlflow, experiment-tracking, autologging, artifacts, metrics
---

# 追 ML 試

> 見 [Extended Examples](references/EXAMPLES.md) 為全配檔與模

立 MLflow 追服、行全試追含度、參、物。

## 用

- 始新 ML 案需試追→用
- 由手日轉至自追→用
- 系比多模訓行→用
- 與隊分試果→用
- 建可重現 ML 流含全系追→用
- 整試追於 CI/CD 流→用

## 入

- **必**：含 ML 框（sklearn、pytorch、tensorflow、xgboost）之 Python 境
- **必**：MLflow 裝（`pip install mlflow`）
- **可**：遠存背（S3、Azure Blob、GCS）為物
- **可**：庫背（PostgreSQL、MySQL）為元存
- **可**：遠背認憑

## 行

### 一：初 MLflow 追服

立 MLflow 追服含宜背。

```bash
# Option 1: Local file-based tracking (development)
mkdir -p mlruns
export MLFLOW_TRACKING_URI="file:./mlruns"

# Option 2: SQLite backend with local artifacts
mlflow server \
  --backend-store-uri sqlite:///mlflow.db \
  --default-artifact-root ./mlartifacts \
# ... (see EXAMPLES.md for complete implementation)
```

建配檔為隊享：

```python
# mlflow_config.py
import os

MLFLOW_TRACKING_URI = os.getenv(
    "MLFLOW_TRACKING_URI",
    "http://mlflow-server.company.com:5000"
)

# ... (see EXAMPLES.md for complete implementation)
```

得：MLflow UI 可訪於指 host:port、示空試列。服日確啟成無誤。

敗：察口可用以 `netstat -tulpn | grep 5000`、驗庫連串、確 S3 憑配（`aws configure`）、察防火牆規於遠訪。

### 二：配 ML 框自記

啟框自記以自捕度、參、模。

```python
# training_script.py
import mlflow
from mlflow_config import MLFLOW_TRACKING_URI, MLFLOW_EXPERIMENT_NAME

# Set tracking URI
mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)
mlflow.set_experiment(MLFLOW_EXPERIMENT_NAME)

# ... (see EXAMPLES.md for complete implementation)
```

PyTorch：

```python
import mlflow.pytorch

mlflow.pytorch.autolog(
    log_every_n_epoch=1,
    log_every_n_step=None,
    log_models=True,
    disable=False,
    exclusive=False,
# ... (see EXAMPLES.md for complete implementation)
```

得：行現於 MLflow UI 含諸超參、度（訓/驗失、準）、模物、入例自記。

敗：驗 MLflow 版於 ML 框合（`mlflow.sklearn.autolog()` 需 MLflow ≥1.20）、察自記支於模類否、閉自記用手記為退、用 `mlflow.set_tracking_uri()` 察日為連誤。

### 三：行全手記

加自度、參、物、標為全試文。

```python
# comprehensive_tracking.py
import mlflow
import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path

def train_and_log_model(params, X_train, y_train, X_test, y_test):
    """
# ... (see EXAMPLES.md for complete implementation)
```

得：MLflow UI 示富試訊含逐步度、視物、模簽、入例、為濾搜之全標。

敗：察物存權（`aws s3 ls s3://bucket/path`）、驗 matplotlib 背為圖記（`plt.switch_backend('Agg')`）、確 JSON 可序資類為 log_dict、察碟空為本物存。

### 四：比行而生報

用 MLflow 比工析多試。

```python
# compare_runs.py
import mlflow
from mlflow.tracking import MlflowClient

client = MlflowClient()

def compare_experiments(experiment_name, metric_name="test_accuracy", top_n=5):
    """
# ... (see EXAMPLES.md for complete implementation)
```

命行比：

```bash
# Compare runs using MLflow CLI
mlflow runs compare --experiment-name customer-churn \
  --order-by "metrics.test_accuracy DESC" \
  --max-results 10

# Export run data to CSV
mlflow experiments csv --experiment-name customer-churn \
  --output experiments.csv
```

得：終出示序行含要度、HTML 報生含格比表、CSV 檔含諸行資為深析。

敗：以 `mlflow experiments list` 驗試在、察度名精配（敏）、確行成（察行態）、驗檔書權於出檔。

### 五：配遠物存

立 S3/Azure/GCS 背為可長物管。

```python
# artifact_storage_config.py
import mlflow
import os

def configure_s3_backend():
    """
    Configure S3 for artifact storage.
    """
# ... (see EXAMPLES.md for complete implementation)
```

Docker Compose 為 MLflow 含 PostgreSQL 與 S3：

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: mlflow
# ... (see EXAMPLES.md for complete implementation)
```

得：物上載成於遠存、MLflow UI 示物鏈指 S3/Azure/GCS URI、由 UI 載物正行。

敗：以 `aws s3 ls` 或 `az storage blob list` 驗雲憑、察桶/容權（需書權）、確 MLflow 含雲附（`pip install mlflow[extras]`）裝、測網於存端、察 CORS 為瀏訪。

### 六：行試生命管

立自清、藏、組策。

```python
# lifecycle_management.py
import mlflow
from mlflow.tracking import MlflowClient
from datetime import datetime, timedelta

client = MlflowClient()

def archive_old_experiments(days_old=90):
# ... (see EXAMPLES.md for complete implementation)
```

得：舊試移至刪態、敗行自活列除、佳行標為易濾於 UI、存空復。

敗：察試權（必為主乃可刪）、驗行於 FAILED 態、確度於諸序行存、察庫連於批操、驗遠存物刪足權。

## 驗

- [ ] MLflow 追服可由 web UI 訪
- [ ] 試建而行記成
- [ ] 自記捕框特度自
- [ ] 自度、參、物正記
- [ ] 比查返期頂行
- [ ] 遠物存配而行
- [ ] 物可由 UI 與程載
- [ ] 行濾搜以標行
- [ ] HTML 比報生無誤
- [ ] 生命管腳本執成

## 忌

- **連超時**：MLflow 服自訓腳本不可訪——驗 `MLFLOW_TRACKING_URI` 環變、察防火、確服行
- **物上載敗**：S3/Azure 憑未配或桶不在——先測雲 CLI 訪、驗桶權
- **缺度**：自記閉或框版不支——察 MLflow 版合、退至手記
- **行雜**：試行過多污 UI——早行標策、常用生命管腳本
- **大物**：記全資致存脹——唯記樣或參、用外資版（DVC）
- **名不一**：諸行間參異名——於配檔標名規
- **庫鎖**：SQLite 不支並書——多用境用 PostgreSQL/MySQL
- **自記衝**：多自記配相擾——用 `exclusive=True` 或閉衝自記

## 參

- `register-ml-model` - 登追之模於 MLflow 模登
- `version-ml-data` - 用 DVC 為可重現試版資集
- `setup-automl-pipeline` - 整試追於自 ML 流
- `deploy-ml-model-serving` - 部最佳追之模於產
- `orchestrate-ml-pipeline` - 合試追與流協
