---
name: track-ml-experiments
locale: wenyan
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

# 追 ML 之試


> 全配文與模板見 [Extended Examples](references/EXAMPLES.md)。

立 MLflow 追服而行全試之追，含計、參、件。

## 用時

- 始須試追之新 ML 項目乃用
- 自手日遷至自追乃用
- 系比多模訓行乃用
- 與隊享試果乃用
- 立可復 ML 流附全血追乃用
- 合試追於 CI/CD 流乃用

## 入

- **必要**：含 ML 框（sklearn、pytorch、tensorflow、xgboost）之 Python 境
- **必要**：MLflow 之裝（`pip install mlflow`）
- **可選**：遠儲後（S3、Azure Blob、GCS）為件
- **可選**：資庫後（PostgreSQL、MySQL）為元儲
- **可選**：遠後之驗身憑

## 法

### 第一步：初 MLflow 追服

立 MLflow 追服與宜後儲。

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

立配文為團享：

```python
# mlflow_config.py
import os

MLFLOW_TRACKING_URI = os.getenv(
    "MLFLOW_TRACKING_URI",
    "http://mlflow-server.company.com:5000"
)

# ... (see EXAMPLES.md for complete implementation)
```

得：MLflow UI 於所定 host:port 可達，示空試列。服日確啟成而無誤。

敗則：以 `netstat -tulpn | grep 5000` 察口可用，驗資庫連串，確 S3 憑已設（`aws configure`），察防火牆為遠取。

### 第二步：為 ML 框設自記

啟框特之自記以自捕計、參、模。

```python
# training_script.py
import mlflow
from mlflow_config import MLFLOW_TRACKING_URI, MLFLOW_EXPERIMENT_NAME

# Set tracking URI
mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)
mlflow.set_experiment(MLFLOW_EXPERIMENT_NAME)

# ... (see EXAMPLES.md for complete implementation)
```

為 PyTorch：

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

得：行現於 MLflow UI，諸超參、計（訓／驗損、準）、模件、入例皆已自記。

敗則：驗 MLflow 之版與 ML 框之兼容（`mlflow.sklearn.autolog()` 須 MLflow ≥1.20），察自記是否支君之模類，閉自記而用手記為退，以 `mlflow.set_tracking_uri()` 察連誤。

### 第三步：行全手記

加自定計、參、件、標為全試文檔。

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

得：MLflow UI 顯豐之試資，含逐步計、視件、模簽、入例、為篩搜之全標。

敗則：察件儲之權（`aws s3 ls s3://bucket/path`），驗 matplotlib 後為圖記（`plt.switch_backend('Agg')`），確 log_dict 之資為 JSON 可序，察本機件儲之盤空。

### 第四步：比行而生報

用 MLflow 之比器以析多試。

```python
# compare_runs.py
import mlflow
from mlflow.tracking import MlflowClient

client = MlflowClient()

def compare_experiments(experiment_name, metric_name="test_accuracy", top_n=5):
    """
# ... (see EXAMPLES.md for complete implementation)
```

命行之比：

```bash
# Compare runs using MLflow CLI
mlflow runs compare --experiment-name customer-churn \
  --order-by "metrics.test_accuracy DESC" \
  --max-results 10

# Export run data to CSV
mlflow experiments csv --experiment-name customer-churn \
  --output experiments.csv
```

得：終端示序之行附要計，HTML 報已生附格之比表，CSV 文含諸行資為續析。

敗則：以 `mlflow experiments list` 驗試存，察計名精合（區大小），確行已成（察行態），驗出文之寫權。

### 第五步：設遠件儲

立 S3／Azure／GCS 後為可擴件治。

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

Docker Compose 為 MLflow 與 PostgreSQL 與 S3：

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

得：件成傳於遠儲，MLflow UI 示件鏈指於 S3／Azure／GCS URIs，自 UI 下件正行。

敗則：以 `aws s3 ls` 或 `az storage blob list` 驗雲憑，察桶／容權（須寫權），確 MLflow 裝附雲附（`pip install mlflow[extras]`），試與儲端之網連，察 CORS 設為瀏覽器取。

### 第六步：行試生命之治

立自清、存、組之策。

```python
# lifecycle_management.py
import mlflow
from mlflow.tracking import MlflowClient
from datetime import datetime, timedelta

client = MlflowClient()

def archive_old_experiments(days_old=90):
# ... (see EXAMPLES.md for complete implementation)
```

得：舊試移於除態，敗行除於活列，最佳行已標以易篩於 UI，儲空已收。

敗則：察試之權（須為主以除），驗行實於 FAILED 態，確排序所用之計於諸行皆存，察資庫連為批操，驗於遠儲件除之足權。

## 驗

- [ ] MLflow 追服經 UI 可達
- [ ] 試已立而行成記
- [ ] 自記捕框特之計
- [ ] 自定計、參、件正記
- [ ] 比之查返期之頂行
- [ ] 遠件儲已設而行
- [ ] 件可由 UI 與程下
- [ ] 行篩搜以標可行
- [ ] HTML 比報無誤生
- [ ] 生命治之本成行

## 陷

- **連超時**：訓本不可達 MLflow 服——驗 `MLFLOW_TRACKING_URI` 環變，察防火牆，確服在行
- **件傳敗**：S3／Azure 憑未設或桶不存——先試雲 CLI 之取，驗桶權
- **缺計**：自記閉或框版不支——察 MLflow 版兼容，退至手記
- **行雜**：過試行污 UI——早立標策，常用生命治本
- **大件**：記全資致儲膨——唯記樣或引，用外資版治（DVC）
- **不一命**：諸行記參異名——配文中標命之規
- **資庫鎖**：SQLite 不支並寫——多用境用 PostgreSQL／MySQL
- **自記衝**：多自記設互擾——用 `exclusive=True` 或閉衝之自記

## 參

- `register-ml-model` — 註所追之模於 MLflow 模冊
- `version-ml-data` — 以 DVC 版資為可復試
- `setup-automl-pipeline` — 合試追於自 ML 流
- `deploy-ml-model-serving` — 部最佳所追之模於產
- `orchestrate-ml-pipeline` — 合試追與流編排
