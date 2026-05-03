---
name: track-ml-experiments
locale: wenyan-lite
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

# 追蹤 ML 實驗


> 完整配置檔與模板見 [Extended Examples](references/EXAMPLES.md)。

設立 MLflow 追蹤伺服器並實現含指標、參數與產物之全面實驗追蹤。

## 適用時機

- 始需實驗追蹤之新機器學習專案
- 自手動實驗日誌遷至自動追蹤
- 系統化比較多次模型訓練執行
- 與團隊成員分享實驗結果
- 建含完整血緣追蹤之可重現 ML 工作流
- 將實驗追蹤整合入 CI/CD 管道

## 輸入

- **必要**：含 ML 框架（sklearn、pytorch、tensorflow、xgboost）之 Python 環境
- **必要**：MLflow 安裝（`pip install mlflow`）
- **選擇性**：產物之遠端儲存後端（S3、Azure Blob、GCS）
- **選擇性**：後設資料儲存之資料庫後端（PostgreSQL、MySQL）
- **選擇性**：遠端後端之認證憑據

## 步驟

### 步驟一：初始化 MLflow 追蹤伺服器

以適當之後端商店設立 MLflow 追蹤伺服器。

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

建供團隊分享之配置檔：

```python
# mlflow_config.py
import os

MLFLOW_TRACKING_URI = os.getenv(
    "MLFLOW_TRACKING_URI",
    "http://mlflow-server.company.com:5000"
)

# ... (see EXAMPLES.md for complete implementation)
```

**預期：** MLflow UI 於指定 host:port 可達，顯示空之實驗清單。伺服器日誌確認無錯啟動。

**失敗時：** 以 `netstat -tulpn | grep 5000` 檢埠可用，驗資料庫連線字串，確 S3 憑據已配置（`aws configure`），檢遠端存取之防火牆規則。

### 步驟二：為 ML 框架配置自動日誌

啟用框架專屬之自動日誌以自動捕指標、參數與模型。

```python
# training_script.py
import mlflow
from mlflow_config import MLFLOW_TRACKING_URI, MLFLOW_EXPERIMENT_NAME

# Set tracking URI
mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)
mlflow.set_experiment(MLFLOW_EXPERIMENT_NAME)

# ... (see EXAMPLES.md for complete implementation)
```

對 PyTorch：

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

**預期：** 執行現於 MLflow UI 中且所有超參數、指標（訓練／驗證損失、準確度）、模型產物與輸入範例皆自動記錄。

**失敗時：** 驗 MLflow 版本與 ML 框架相容（`mlflow.sklearn.autolog()` 需 MLflow ≥1.20），檢自動日誌是否支援你之模型類型，停用自動日誌並用手動日誌為退路，以 `mlflow.set_tracking_uri()` 檢日誌之連線錯。

### 步驟三：實現全面手動日誌

加自訂指標、參數、產物與標籤以為完整實驗文件。

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

**預期：** MLflow UI 顯示豐富之實驗資訊，含逐步指標、視覺化產物、模型簽名、輸入範例與供過濾與搜尋之全面標籤。

**失敗時：** 檢產物儲存權限（`aws s3 ls s3://bucket/path`），驗圖記錄之 matplotlib 後端（`plt.switch_backend('Agg')`），確 log_dict 之 JSON 可序列化資料類型，檢本地產物儲存之磁碟空間。

### 步驟四：比較執行並產報告

用 MLflow 之比較工具分析多實驗。

```python
# compare_runs.py
import mlflow
from mlflow.tracking import MlflowClient

client = MlflowClient()

def compare_experiments(experiment_name, metric_name="test_accuracy", top_n=5):
    """
# ... (see EXAMPLES.md for complete implementation)
```

命令列比較：

```bash
# Compare runs using MLflow CLI
mlflow runs compare --experiment-name customer-churn \
  --order-by "metrics.test_accuracy DESC" \
  --max-results 10

# Export run data to CSV
mlflow experiments csv --experiment-name customer-churn \
  --output experiments.csv
```

**預期：** 主控台輸出顯示按關鍵指標排序之執行，HTML 報告以格式化比較表產生，CSV 檔含所有執行資料以供進一步分析。

**失敗時：** 以 `mlflow experiments list` 驗實驗存在，檢指標名完全相符（區分大小寫），確執行已成功完成（檢執行狀態），驗輸出檔之檔案寫入權限。

### 步驟五：配置遠端產物儲存

設立 S3／Azure／GCS 後端以為可規模產物管理。

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

含 PostgreSQL 與 S3 之 MLflow Docker Compose：

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

**預期：** 產物成功上傳至遠端儲存，MLflow UI 顯示指向 S3／Azure／GCS URI 之產物連結，自 UI 下載產物正確運作。

**失敗時：** 以 `aws s3 ls` 或 `az storage blob list` 驗雲憑據，檢 bucket／container 權限（需寫存取），確 MLflow 已安裝雲擴展（`pip install mlflow[extras]`），測試與儲存端點之網路連通，檢瀏覽器存取之 CORS 設定。

### 步驟六：實現實驗生命週期管理

設立自動清理、歸檔與組織政策。

```python
# lifecycle_management.py
import mlflow
from mlflow.tracking import MlflowClient
from datetime import datetime, timedelta

client = MlflowClient()

def archive_old_experiments(days_old=90):
# ... (see EXAMPLES.md for complete implementation)
```

**預期：** 舊實驗已移至刪除狀態，失敗執行已自活躍清單移除，最佳執行已標籤以便於 UI 中過濾，儲存空間已回收。

**失敗時：** 檢實驗權限（須為擁有者方可刪），驗執行確於 FAILED 狀態，確指標於所有被排序之執行中存在，檢大量操作之資料庫連通，驗遠端儲存中產物刪除之足夠權限。

## 驗證

- [ ] MLflow 追蹤伺服器經 web UI 可達
- [ ] 實驗已建且執行已成功記錄
- [ ] 自動日誌自動捕框架專屬指標
- [ ] 自訂指標、參數與產物正確記錄
- [ ] 比較查詢返預期之頂執行
- [ ] 遠端產物儲存已配置且運作
- [ ] 產物可自 UI 與程式化下載
- [ ] 執行過濾與搜尋以標籤運作
- [ ] HTML 比較報告無錯產生
- [ ] 生命週期管理腳本成功執行

## 常見陷阱

- **連線逾時**：MLflow 伺服器自訓練腳本不可達——驗 `MLFLOW_TRACKING_URI` 環境變數，檢防火牆規則，確伺服器執行
- **產物上傳失敗**：S3／Azure 憑據未配置或 bucket 不存——先測雲 CLI 存取，驗 bucket 權限
- **缺指標**：自動日誌停用或框架版本不支援——檢 MLflow 版本相容，退至手動日誌
- **執行雜亂**：太多實驗執行汙染 UI——早期實施標籤策略，常用生命週期管理腳本
- **大產物**：記錄整資料集致儲存膨脹——僅記錄樣本或參考，用外部資料版本控制（DVC）
- **不一致之命名**：參數於不同執行中以不同名記錄——於配置檔中標準化命名慣例
- **資料庫鎖**：SQLite 不支援並發寫——對多用戶環境用 PostgreSQL／MySQL
- **自動日誌衝突**：多自動日誌配置互擾——用 `exclusive=True` 或停相衝之自動日誌

## 相關技能

- `register-ml-model` — 於 MLflow 模型註冊處註所追蹤之模型
- `version-ml-data` — 用 DVC 對資料集做版本控制以求可重現實驗
- `setup-automl-pipeline` — 將實驗追蹤整合入自動 ML 管道
- `deploy-ml-model-serving` — 將最佳所追蹤模型部署至生產
- `orchestrate-ml-pipeline` — 將實驗追蹤與工作流編排結合
