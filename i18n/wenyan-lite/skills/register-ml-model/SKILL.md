---
name: register-ml-model
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Register trained models in MLflow Model Registry with version control, implement
  stage transitions (Staging, Production, Archived) with approval workflows, and
  manage model lineage with comprehensive metadata and deployment tracking. Use when
  promoting a trained model from experimentation to production, managing multiple model
  versions across development stages, implementing approval workflows for governance,
  rolling back to previous versions, or auditing model changes for compliance.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mlops
  complexity: intermediate
  language: multi
  tags: model-registry, mlflow, staging, production, versioning
---

# 註冊 ML 模型


> 完整配置文件與模板見 [Extended Examples](references/EXAMPLES.md)。

實施 MLflow Model Registry，作系統化之模型版本化、階段管理與部署治理。

## 適用時機

- 將已訓練之模型自實驗擢升至生產
- 跨開發階段管理多個模型版本
- 實施模型核准工作流以資治理
- 自訓練至部署追蹤模型譜系
- 回滾至前模型版本
- 為 A/B 測試比對已部署之模型版本
- 為合規要求稽核模型變更

## 輸入

- **必要**：啟用 Model Registry 之 MLflow 追蹤伺服器
- **必要**：已記錄於 MLflow 之已訓模型（自追蹤運行）
- **必要**：擬於登記簿登記之模型名
- **選擇性**：核准工作流整合（電郵、Slack、Jira）
- **選擇性**：自動擢升之 CI/CD 管線
- **選擇性**：模型驗證指標閾值

## 步驟

### 步驟一：配置 Model Registry 後端

以資料庫後端設置 MLflow Model Registry（生產環境不建議文件式登記簿）。

```bash
# Start MLflow server with Model Registry support
mlflow server \
  --backend-store-uri postgresql://user:pass@localhost:5432/mlflow \
  --default-artifact-root s3://mlflow-artifacts/models \
  --host 0.0.0.0 \
  --port 5000
```

Python 配置：

```python
# model_registry_config.py
import mlflow
from mlflow.tracking import MlflowClient

# Set tracking URI (must support Model Registry)
MLFLOW_TRACKING_URI = "http://mlflow-server.company.com:5000"
mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)

# ... (see EXAMPLES.md for complete implementation)
```

**預期：** Model Registry UI 標籤現於 MLflow 中，`search_registered_models()` 成功返回（即便為空），資料庫含 `registered_models` 表。

**失敗時：** 確認 MLflow 版本 ≥1.2（Model Registry 自 1.2 引入），檢查資料庫後端（SQLite 對 Model Registry 支援不全），確保 `--backend-store-uri` 指向資料庫（非 file://），確認資料庫用戶具 CREATE TABLE 權限，查 MLflow 伺服器日誌之遷移錯誤。

### 步驟二：自訓練運行註冊模型

將已記錄之模型以全面元資料註冊至 Model Registry。

```python
# register_model.py
import mlflow
from mlflow.tracking import MlflowClient
from model_registry_config import MLFLOW_TRACKING_URI

mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)
client = MlflowClient()

# ... (see EXAMPLES.md for complete implementation)
```

**預期：** 新模型版本現於 Model Registry UI，版本含描述與標籤，模型製品可透過 `models:/<model-name>/<version>` URI 取用，模型簽章與輸入例皆保留。

**失敗時：** 確認 run_id 存在且已完成（`client.get_run(run_id)`），檢查模型製品路徑與所記製品相符（`mlflow.search_runs()` 以察），確保模型以正確之框架風味記錄（`mlflow.sklearn.log_model` 而非 `mlflow.log_artifact`），確認模型名無特殊字元（用連字符勿用底線），檢查製品儲存可達。

### 步驟三：附驗證之階段轉換

帶驗證檢查地將模型版本經各階段（None → Staging → Production → Archived）。

```python
# stage_management.py
import mlflow
from mlflow.tracking import MlflowClient
from datetime import datetime

client = MlflowClient()

class ModelStageManager:
# ... (see EXAMPLES.md for complete implementation)
```

**預期：** 模型版本之階段於登記簿更新，舊版本自動歸檔，轉換時戳記於標籤，回滾恢復前生產版本。

**失敗時：** 檢查版本存在且於預期階段，確認 archive_existing_versions 旗標行為（若僅一版恐不歸檔），確保資料庫支援階段更新之並發交易，檢查階段轉換鎖（每版本同時只一轉換），確認核准工作流整合。

### 步驟四：實施模型別名與引用

用模型別名作穩定之部署引用（MLflow ≥2.0）。

```python
# model_aliases.py
from mlflow.tracking import MlflowClient

client = MlflowClient()

def set_model_alias(model_name, version, alias):
    """
    Set an alias for a model version (MLflow 2.0+).
# ... (see EXAMPLES.md for complete implementation)
```

**預期：** 別名現於 Model Registry UI，以別名載入模型可行（`models:/name@alias`），更新別名立即影響新載入，A/B 測試基礎建置可運作。

**失敗時：** 升級 MLflow 至 ≥2.0 以支援原生別名，舊版本用標籤式回退，確認別名命名（僅字母數字與連字符），檢查別名衝突（每模型版本一別名）。

### 步驟五：實施模型譜系追蹤

以全面元資料自資料追蹤至部署之完整譜系。

```python
# model_lineage.py
import mlflow
from mlflow.tracking import MlflowClient
import json

client = MlflowClient()

def enrich_model_metadata(model_name, version, lineage_data):
# ... (see EXAMPLES.md for complete implementation)
```

**預期：** 模型版本標籤含全面譜系資訊，`get_model_lineage()` 返完整歷史，JSON 報告含資料源、訓練細節與部署資訊。

**失敗時：** 確認標籤值為字串（將 dict 轉為 JSON），檢查標籤鍵名（無空格或特殊字元），確保訓練時已捕獲譜系資料，確認 run_id 有效可達。

### 步驟六：以 CI/CD 自動化登記簿操作

將模型註冊整合入 CI/CD 管線以自動擢升。

```yaml
# .github/workflows/model_promotion.yml
name: Model Promotion Pipeline

on:
  workflow_dispatch:
    inputs:
      model_name:
        description: 'Model name to promote'
# ... (see EXAMPLES.md for complete implementation)
```

Python 自動化腳本：

```python
# scripts/promote_model.py
import argparse
from stage_management import ModelStageManager

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model-name", required=True)
    parser.add_argument("--version", type=int, required=True)
# ... (see EXAMPLES.md for complete implementation)
```

**預期：** GitHub Actions 工作流於手動派發時觸發，驗證測試通過，模型擢升至目標階段，Slack 通知已發，部署管線自動觸發。

**失敗時：** 檢查 MLFLOW_TRACKING_URI 之 GitHub secrets 配置，確認 GitHub Actions 至 MLflow 伺服器之網路存取（恐需 VPN 或 IP 允許清單），確保驗證腳本之指標閾值正確，檢查 Slack webhook 配置，確認 Python 腳本之執行權限。

## 驗證

- [ ] Model Registry 可達且後端已配置
- [ ] 模型自訓練運行成功註冊
- [ ] 階段轉換可行（None → Staging → Production → Archived）
- [ ] 驗證檢查強制品質閾值
- [ ] 模型別名已設且解析正確
- [ ] 譜系元資料全面捕獲
- [ ] 回滾功能恢復前版本
- [ ] CI/CD 管線自動化擢升
- [ ] 階段變更之團隊通知運作
- [ ] 所有階段之模型 URI 解析正確

## 常見陷阱

- **SQLite 限制**：生產之 Model Registry 需資料庫後端（PostgreSQL／MySQL）——文件式登記簿致並發問題
- **階段衝突**：同階段多版本致混淆——用 `archive_existing_versions=True` 自動歸檔
- **缺失運行連結**：無 run_id 而註冊模型則失譜系——務自 MLflow 運行而非生文件註冊
- **別名混淆**：用階段而非別名為部署目標——階段為工作流，別名為部署引用
- **跳過驗證**：未檢即擢至生產——於 CI/CD 管線中強制驗證
- **無回滾計畫**：生產問題無回滾能力——將前生產版本留於 Archived 階段
- **標籤過載**：太多無組織之標籤——標準化標籤結構與命名慣例
- **手動流程**：人驅之擢升易錯且慢——以 CI/CD 與核准工作流自動化
- **製品丟失**：模型已註但製品自儲存被刪——確保製品保留策略與模型生命週期一致

## 相關技能

- `track-ml-experiments` — 註冊前先將模型記錄至 MLflow
- `deploy-ml-model-serving` — 將已註冊之模型部署至服務基礎建置
- `run-ab-test-models` — 用登記簿別名 A/B 測試模型
- `orchestrate-ml-pipeline` — 自動化模型訓練與註冊
- `version-ml-data` — 為模型譜系版本化訓練資料
